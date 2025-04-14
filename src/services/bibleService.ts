import { env } from '../config/env';
import { parseScriptureReferences } from './scriptureParser';

export class BibleServiceError extends Error {
  constructor(
    public code: 'API_KEY_MISSING' | 'NETWORK_ERROR' | 'FETCH_ERROR' | 'INVALID_BIBLE' | 'INVALID_REFERENCE' | 'INVALID_RESPONSE' | 'RATE_LIMIT_EXCEEDED',
    message: string
  ) {
    super(message);
    this.name = 'BibleServiceError';
  }
}

interface BibleVersion {
  id: string;
  name: string;
  abbreviation: string;
  language: {
    id: string;
    name: string;
  };
}

interface VerseContent {
  id: string;
  orgId: string;
  content: string;
  reference: string;
  verseCount: number;
}

interface ScriptureReference {
  book: string;
  chapter: number;
  verse: number;
  endVerse?: number;
}

// Bible API configuration
const BIBLE_ID = '65eec8e0b60e656b-01'; // ESV Bible ID
const API_BASE_URL = 'https://api.scripture.api.bible/v1/bibles';

// Add these constants at the top with other constants
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 10000; // 10 seconds
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MAX_CACHE_SIZE = 1000; // Maximum number of cached items

interface CacheEntry {
  content: string;
  timestamp: number;
}

class ScriptureCache {
  private cache: Map<string, CacheEntry> = new Map();
  private accessOrder: string[] = []; // For LRU (Least Recently Used) eviction

  get(reference: string): string | null {
    const entry = this.cache.get(reference);
    if (!entry) return null;

    // Check if entry is expired
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      this.cache.delete(reference);
      this.accessOrder = this.accessOrder.filter(key => key !== reference);
      return null;
    }

    // Update access order for LRU
    this.accessOrder = this.accessOrder.filter(key => key !== reference);
    this.accessOrder.push(reference);

    return entry.content;
  }

  set(reference: string, content: string): void {
    // If cache is full, remove the least recently used item
    if (this.cache.size >= MAX_CACHE_SIZE) {
      const oldestKey = this.accessOrder.shift();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(reference, {
      content,
      timestamp: Date.now()
    });
    this.accessOrder.push(reference);
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }
}

// Create a singleton cache instance
const scriptureCache = new ScriptureCache();

/**
 * Clean HTML from verse content
 */
function cleanVerseContent(content: string): string {
  // Remove HTML tags
  const cleanedContent = content.replace(/<\/?[^>]+(>|$)/g, '');
  // Remove extra whitespace
  return cleanedContent.replace(/\s+/g, ' ').trim();
}

/**
 * Check if a reference contains a verse range
 */
function hasVerseRange(reference: ScriptureReference): boolean {
  return reference.endVerse !== undefined && reference.endVerse > reference.verse;
}

/**
 * Format a reference object into a string suitable for the Bible API
 */
function formatReferenceForApi(reference: ScriptureReference): string {
  // Convert book name to API format (ESV format)
  const bookMap: { [key: string]: string } = {
    'Genesis': 'GEN',
    'Exodus': 'EXO',
    'Leviticus': 'LEV',
    'Numbers': 'NUM',
    'Deuteronomy': 'DEU',
    'Joshua': 'JOS',
    'Judges': 'JDG',
    'Ruth': 'RUT',
    '1 Samuel': '1SA',
    '2 Samuel': '2SA',
    '1 Kings': '1KI',
    '2 Kings': '2KI',
    '1 Chronicles': '1CH',
    '2 Chronicles': '2CH',
    'Ezra': 'EZR',
    'Nehemiah': 'NEH',
    'Esther': 'EST',
    'Job': 'JOB',
    'Psalms': 'PSA',
    'Proverbs': 'PRO',
    'Ecclesiastes': 'ECC',
    'Song of Solomon': 'SNG',
    'Isaiah': 'ISA',
    'Jeremiah': 'JER',
    'Lamentations': 'LAM',
    'Ezekiel': 'EZK',
    'Daniel': 'DAN',
    'Hosea': 'HOS',
    'Joel': 'JOL',
    'Amos': 'AMO',
    'Obadiah': 'OBA',
    'Jonah': 'JON',
    'Micah': 'MIC',
    'Nahum': 'NAM',
    'Habakkuk': 'HAB',
    'Zephaniah': 'ZEP',
    'Haggai': 'HAG',
    'Zechariah': 'ZEC',
    'Malachi': 'MAL',
    'Matthew': 'MAT',
    'Mark': 'MRK',
    'Luke': 'LUK',
    'John': 'JHN',
    'Acts': 'ACT',
    'Romans': 'ROM',
    '1 Corinthians': '1CO',
    '2 Corinthians': '2CO',
    'Galatians': 'GAL',
    'Ephesians': 'EPH',
    'Philippians': 'PHP',
    'Colossians': 'COL',
    '1 Thessalonians': '1TH',
    '2 Thessalonians': '2TH',
    '1 Timothy': '1TI',
    '2 Timothy': '2TI',
    'Titus': 'TIT',
    'Philemon': 'PHM',
    'Hebrews': 'HEB',
    'James': 'JAS',
    '1 Peter': '1PE',
    '2 Peter': '2PE',
    '1 John': '1JN',
    '2 John': '2JN',
    '3 John': '3JN',
    'Jude': 'JUD',
    'Revelation': 'REV'
  };

  const apiBook = bookMap[reference.book] || reference.book;
  
  // For passages, use the format: BOOK.CHAPTER.VERSE-VERSE
  if (reference.endVerse) {
    return `${apiBook}.${reference.chapter}.${reference.verse}-${reference.endVerse}`;
  }
  
  // For single verses, use the format: BOOK.CHAPTER.VERSE
  return `${apiBook}.${reference.chapter}.${reference.verse}`;
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate the next retry delay using exponential backoff
 */
function calculateRetryDelay(attempt: number): number {
  const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, attempt), MAX_RETRY_DELAY);
  // Add some jitter to prevent thundering herd
  return delay * (0.5 + Math.random());
}

/**
 * Execute a function with retry logic
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  shouldRetry: (error: unknown) => boolean = () => true
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (!shouldRetry(error)) {
        throw error;
      }
      
      if (attempt < MAX_RETRIES - 1) {
        const delay = calculateRetryDelay(attempt);
        console.log(`[BibleService] Retry attempt ${attempt + 1}/${MAX_RETRIES} after ${delay}ms`);
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}

/**
 * Fetch a passage from the Bible API with retry logic
 */
async function fetchPassage(reference: ScriptureReference): Promise<string> {
  const formattedRef = formatReferenceForApi(reference);
  console.log(`[BibleService] Fetching passage: "${formattedRef}"`);

  // For verse ranges, we need to use the verses endpoint instead of passages
  if (hasVerseRange(reference)) {
    return await fetchVerseRange(reference);
  }

  return withRetry(async () => {
    const response = await fetch(`${API_BASE_URL}/${BIBLE_ID}/passages/${formattedRef}`, {
      headers: {
        'api-key': env.bibleApiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new BibleServiceError('API_KEY_MISSING', 'Invalid or missing API key');
      }
      if (response.status === 404) {
        throw new BibleServiceError('INVALID_REFERENCE', 'Scripture reference not found');
      }
      if (response.status === 429) {
        throw new BibleServiceError('FETCH_ERROR', 'Rate limit exceeded');
      }
      throw new BibleServiceError('FETCH_ERROR', `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.data?.content) {
      console.error(`[BibleService] Invalid passage response format:`, data);
      throw new BibleServiceError('INVALID_RESPONSE', 'Invalid response format from Bible API');
    }

    return cleanVerseContent(data.data.content);
  }, (error) => {
    // Retry on network errors or rate limits
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      return true;
    }
    if (error instanceof BibleServiceError && error.code === 'FETCH_ERROR') {
      return true;
    }
    return false;
  });
}

/**
 * Fetch a single verse from the Bible API with retry logic
 */
async function fetchVerse(reference: ScriptureReference): Promise<string> {
  const formattedRef = formatReferenceForApi(reference);
  console.log(`[BibleService] Fetching verse: "${formattedRef}"`);

  return withRetry(async () => {
    const response = await fetch(`${API_BASE_URL}/${BIBLE_ID}/verses/${formattedRef}`, {
      headers: {
        'api-key': env.bibleApiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new BibleServiceError('API_KEY_MISSING', 'Invalid or missing API key');
      }
      if (response.status === 404) {
        throw new BibleServiceError('INVALID_REFERENCE', 'Scripture reference not found');
      }
      if (response.status === 429) {
        throw new BibleServiceError('FETCH_ERROR', 'Rate limit exceeded');
      }
      throw new BibleServiceError('FETCH_ERROR', `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.data?.content) {
      console.error(`[BibleService] Invalid verse response format:`, data);
      throw new BibleServiceError('INVALID_RESPONSE', 'Invalid response format from Bible API');
    }

    return cleanVerseContent(data.data.content);
  }, (error) => {
    // Retry on network errors or rate limits
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      return true;
    }
    if (error instanceof BibleServiceError && error.code === 'FETCH_ERROR') {
      return true;
    }
    return false;
  });
}

/**
 * Fetch a range of verses by fetching each verse individually and combining them
 */
async function fetchVerseRange(reference: ScriptureReference): Promise<string> {
  if (!reference.endVerse) {
    throw new BibleServiceError('INVALID_REFERENCE', 'Verse range must have an end verse');
  }

  console.log(`[BibleService] Fetching verse range: ${reference.book} ${reference.chapter}:${reference.verse}-${reference.endVerse}`);

  const verses: string[] = [];
  const verseCount = reference.endVerse - reference.verse + 1;

  // Fetch each verse in the range with retry logic
  for (let i = 0; i < verseCount; i++) {
    const currentVerse = reference.verse + i;
    const verseRef = {
      book: reference.book,
      chapter: reference.chapter,
      verse: currentVerse
    };

    try {
      const verseContent = await fetchVerse(verseRef);
      verses.push(verseContent);
    } catch (error) {
      if (error instanceof BibleServiceError && error.code === 'INVALID_REFERENCE') {
        console.warn(`[BibleService] Verse ${currentVerse} not found, continuing with available verses`);
        continue;
      }
      throw error;
    }
  }

  if (verses.length === 0) {
    throw new BibleServiceError('INVALID_REFERENCE', 'No verses found in the specified range');
  }

  // Combine verses with verse numbers
  return verses.map((content, index) => {
    const verseNumber = reference.verse + index;
    return `${verseNumber} ${content}`;
  }).join(' ');
}

/**
 * Fetch scripture content from the Bible API with caching
 */
export async function fetchScriptureContent(reference: string): Promise<string> {
  console.log(`[BibleService] Fetching content for reference: "${reference}"`);
  
  if (!env.bibleApiKey?.trim()) {
    throw new BibleServiceError('API_KEY_MISSING', 'Bible API key is not configured');
  }

  // Check cache first
  const cachedContent = scriptureCache.get(reference);
  if (cachedContent) {
    console.log(`[BibleService] Cache hit for reference: "${reference}"`);
    return cachedContent;
  }

  // Parse the reference and get the first valid reference
  const references = parseScriptureReferences(reference);
  console.log(`[BibleService] Parsed references:`, references);
  
  if (references.length === 0) {
    // For debugging, let's try to understand what went wrong
    console.error(`[BibleService] Failed to parse reference: "${reference}". Check scriptureParser.ts implementation.`);
    
    // Try a hardcoded test case to see if the parser works for known good references
    const testReference = "John 3:16";
    const testResult = parseScriptureReferences(testReference);
    console.log(`[BibleService] Test parse of "${testReference}":`, testResult);
    
    throw new BibleServiceError('INVALID_REFERENCE', 'Invalid scripture reference format');
  }

  const scriptureRef = references[0];
  
  try {
    // First try to fetch as a passage
    const content = await fetchPassage(scriptureRef);
    
    // Cache the result
    scriptureCache.set(reference, content);
    
    return content;
  } catch (error) {
    if (error instanceof BibleServiceError && error.code === 'INVALID_REFERENCE') {
      // If passage fetch fails and we have a verse range, try fetching the range
      if (hasVerseRange(scriptureRef)) {
        const content = await fetchVerseRange(scriptureRef);
        
        // Cache the result
        scriptureCache.set(reference, content);
        
        return content;
      }
      // Otherwise try as a single verse
      const content = await fetchVerse(scriptureRef);
      
      // Cache the result
      scriptureCache.set(reference, content);
      
      return content;
    }
    throw error;
  }
}

// Add a function to clear the cache if needed
export function clearScriptureCache(): void {
  scriptureCache.clear();
  console.log('[BibleService] Cache cleared');
} 