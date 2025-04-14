interface ScriptureReference {
  book: string;
  chapter: number;
  verse: number;
  endVerse?: number;
}

// Full book names mapping to standardized names
const BIBLE_BOOKS: { [key: string]: string } = {
  'genesis': 'Genesis',
  'exodus': 'Exodus',
  'leviticus': 'Leviticus',
  'numbers': 'Numbers',
  'deuteronomy': 'Deuteronomy',
  'joshua': 'Joshua',
  'judges': 'Judges',
  'ruth': 'Ruth',
  '1 samuel': '1 Samuel',
  '2 samuel': '2 Samuel',
  '1 kings': '1 Kings',
  '2 kings': '2 Kings',
  '1 chronicles': '1 Chronicles',
  '2 chronicles': '2 Chronicles',
  'ezra': 'Ezra',
  'nehemiah': 'Nehemiah',
  'esther': 'Esther',
  'job': 'Job',
  'psalms': 'Psalms',
  'psalm': 'Psalms',
  'proverbs': 'Proverbs',
  'ecclesiastes': 'Ecclesiastes',
  'song of solomon': 'Song of Solomon',
  'song of songs': 'Song of Solomon',
  'isaiah': 'Isaiah',
  'jeremiah': 'Jeremiah',
  'lamentations': 'Lamentations',
  'ezekiel': 'Ezekiel',
  'daniel': 'Daniel',
  'hosea': 'Hosea',
  'joel': 'Joel',
  'amos': 'Amos',
  'obadiah': 'Obadiah',
  'jonah': 'Jonah',
  'micah': 'Micah',
  'nahum': 'Nahum',
  'habakkuk': 'Habakkuk',
  'zephaniah': 'Zephaniah',
  'haggai': 'Haggai',
  'zechariah': 'Zechariah',
  'malachi': 'Malachi',
  'matthew': 'Matthew',
  'mark': 'Mark',
  'luke': 'Luke',
  'john': 'John',
  'acts': 'Acts',
  'romans': 'Romans',
  '1 corinthians': '1 Corinthians',
  '2 corinthians': '2 Corinthians',
  'galatians': 'Galatians',
  'ephesians': 'Ephesians',
  'philippians': 'Philippians',
  'colossians': 'Colossians',
  '1 thessalonians': '1 Thessalonians',
  '2 thessalonians': '2 Thessalonians',
  '1 timothy': '1 Timothy',
  '2 timothy': '2 Timothy',
  'titus': 'Titus',
  'philemon': 'Philemon',
  'hebrews': 'Hebrews',
  'james': 'James',
  '1 peter': '1 Peter',
  '2 peter': '2 Peter',
  '1 john': '1 John',
  '2 john': '2 John',
  '3 john': '3 John',
  'jude': 'Jude',
  'revelation': 'Revelation',
  'revelations': 'Revelation',
  'rev': 'Revelation'
};

const BOOK_ABBREVIATIONS: { [key: string]: string } = {
  // Old Testament
  'gen': 'Genesis',
  'ge': 'Genesis',
  'gn': 'Genesis',
  'exo': 'Exodus',
  'ex': 'Exodus',
  'exod': 'Exodus',
  'lev': 'Leviticus',
  'le': 'Leviticus',
  'lv': 'Leviticus',
  'num': 'Numbers',
  'nu': 'Numbers',
  'nm': 'Numbers',
  'deu': 'Deuteronomy',
  'dt': 'Deuteronomy',
  'deut': 'Deuteronomy',
  'jos': 'Joshua',
  'josh': 'Joshua',
  'jdg': 'Judges',
  'judg': 'Judges',
  'jgs': 'Judges',
  'rut': 'Ruth',
  'ru': 'Ruth',
  'rth': 'Ruth',
  '1sa': '1 Samuel',
  '1sam': '1 Samuel',
  '1s': '1 Samuel',
  '1sm': '1 Samuel',
  '2sa': '2 Samuel',
  '2sam': '2 Samuel',
  '2s': '2 Samuel',
  '2sm': '2 Samuel',
  '1ki': '1 Kings',
  '1kgs': '1 Kings',
  '1k': '1 Kings',
  '2ki': '2 Kings',
  '2kgs': '2 Kings',
  '2k': '2 Kings',
  '1ch': '1 Chronicles',
  '1chr': '1 Chronicles',
  '1chron': '1 Chronicles',
  '2ch': '2 Chronicles',
  '2chr': '2 Chronicles',
  '2chron': '2 Chronicles',
  'ezr': 'Ezra',
  'ez': 'Ezra',
  'neh': 'Nehemiah',
  'ne': 'Nehemiah',
  'est': 'Esther',
  'es': 'Esther',
  'job': 'Job',
  'jb': 'Job',
  'psa': 'Psalms',
  'ps': 'Psalms',
  'psalm': 'Psalms',
  'pro': 'Proverbs',
  'prov': 'Proverbs',
  'pr': 'Proverbs',
  'ecc': 'Ecclesiastes',
  'eccl': 'Ecclesiastes',
  'eccles': 'Ecclesiastes',
  'ec': 'Ecclesiastes',
  'sng': 'Song of Solomon',
  'song': 'Song of Solomon',
  'so': 'Song of Solomon',
  'ss': 'Song of Solomon',
  'isa': 'Isaiah',
  'is': 'Isaiah',
  'jer': 'Jeremiah',
  'je': 'Jeremiah',
  'jr': 'Jeremiah',
  'lam': 'Lamentations',
  'la': 'Lamentations',
  'ezk': 'Ezekiel',
  'eze': 'Ezekiel',
  'ezek': 'Ezekiel',
  'dan': 'Daniel',
  'da': 'Daniel',
  'dn': 'Daniel',
  'hos': 'Hosea',
  'ho': 'Hosea',
  'jol': 'Joel',
  'jl': 'Joel',
  'amo': 'Amos',
  'am': 'Amos',
  'oba': 'Obadiah',
  'ob': 'Obadiah',
  'jon': 'Jonah',
  'jnh': 'Jonah',
  'mic': 'Micah',
  'mi': 'Micah',
  'nam': 'Nahum',
  'na': 'Nahum',
  'hab': 'Habakkuk',
  'hb': 'Habakkuk',
  'zep': 'Zephaniah',
  'zeph': 'Zephaniah',
  'zp': 'Zephaniah',
  'hag': 'Haggai',
  'hg': 'Haggai',
  'zec': 'Zechariah',
  'zech': 'Zechariah',
  'zc': 'Zechariah',
  'mal': 'Malachi',
  'ml': 'Malachi',
  
  // New Testament
  'mat': 'Matthew',
  'matt': 'Matthew',
  'mt': 'Matthew',
  'mrk': 'Mark',
  'mar': 'Mark',
  'mk': 'Mark',
  'luk': 'Luke',
  'lu': 'Luke',
  'lk': 'Luke',
  'jhn': 'John',
  'jn': 'John',
  'joh': 'John',
  'jo': 'John',
  'act': 'Acts',
  'ac': 'Acts',
  'rom': 'Romans',
  'ro': 'Romans',
  'rm': 'Romans',
  '1co': '1 Corinthians',
  '1cor': '1 Corinthians',
  '1corinthians': '1 Corinthians',
  '1c': '1 Corinthians',
  '2co': '2 Corinthians',
  '2cor': '2 Corinthians',
  '2corinthians': '2 Corinthians',
  '2c': '2 Corinthians',
  'gal': 'Galatians',
  'ga': 'Galatians',
  'eph': 'Ephesians',
  'ep': 'Ephesians',
  'php': 'Philippians',
  'phil': 'Philippians',
  'pp': 'Philippians',
  'col': 'Colossians',
  'co': 'Colossians',
  '1th': '1 Thessalonians',
  '1thes': '1 Thessalonians',
  '1thess': '1 Thessalonians',
  '1thessalonians': '1 Thessalonians',
  '2th': '2 Thessalonians',
  '2thes': '2 Thessalonians',
  '2thess': '2 Thessalonians',
  '2thessalonians': '2 Thessalonians',
  '1ti': '1 Timothy',
  '1tim': '1 Timothy',
  '1tm': '1 Timothy',
  '2ti': '2 Timothy',
  '2tim': '2 Timothy',
  '2tm': '2 Timothy',
  'tit': 'Titus',
  'ti': 'Titus',
  'phm': 'Philemon',
  'phlm': 'Philemon',
  'pm': 'Philemon',
  'heb': 'Hebrews',
  'he': 'Hebrews',
  'jas': 'James',
  'jam': 'James',
  'jm': 'James',
  '1pe': '1 Peter',
  '1pet': '1 Peter',
  '1pt': '1 Peter',
  '1p': '1 Peter',
  '2pe': '2 Peter',
  '2pet': '2 Peter',
  '2pt': '2 Peter',
  '2p': '2 Peter',
  '1jn': '1 John',
  '1jo': '1 John',
  '1j': '1 John',
  '2jn': '2 John',
  '2jo': '2 John',
  '2j': '2 John',
  '3jn': '3 John',
  '3jo': '3 John',
  '3j': '3 John',
  'jud': 'Jude',
  'jd': 'Jude',
  'rev': 'Revelation',
  're': 'Revelation',
  'rv': 'Revelation'
};

/**
 * Get canonical book name from either full name or abbreviation
 * @param bookText The book name or abbreviation to look up
 * @param numberPrefix Optional number prefix (1, 2, 3)
 * @returns The canonical book name or undefined if not found
 */
function getCanonicalBookName(bookText: string, numberPrefix?: string): string | undefined {
  const normalizedBook = bookText.toLowerCase();
  
  // Try direct match with full book name
  if (BIBLE_BOOKS[normalizedBook]) {
    return BIBLE_BOOKS[normalizedBook];
  }
  
  // Try with number prefix if provided
  if (numberPrefix) {
    const fullName = `${numberPrefix} ${normalizedBook}`;
    if (BIBLE_BOOKS[fullName]) {
      return BIBLE_BOOKS[fullName];
    }
  }
  
  // Try abbreviation match
  const lookupKey = `${numberPrefix || ''}${normalizedBook}`;
  return BOOK_ABBREVIATIONS[lookupKey];
}

/**
 * Parse scripture references from a text string
 * @param text The text to parse for scripture references
 * @returns Array of structured scripture reference objects
 */
export function parseScriptureReferences(text: string): ScriptureReference[] {
  const references: ScriptureReference[] = [];
  
  if (!text || typeof text !== 'string') {
    console.warn('[scriptureParser] Invalid input:', text);
    return references;
  }
  
  // Normalize input by trimming
  const normalizedText = text.trim();
  
  // Match various scripture reference patterns
  // 1. Book chapter:verse (John 3:16)
  // 2. Book chapter:verse-verse (John 3:16-18)
  // 3. Numbered book chapter:verse (1 John 3:16)
  // Include optional period after book name (John. 3:16)
  const regex = /(?:([1-3])?[\s\.]?([A-Za-z]+)\.?\s*(\d+):(\d+)(?:-(\d+))?)/gi;
  
  let match;
  while ((match = regex.exec(normalizedText)) !== null) {
    // Extract components
    const [fullMatch, number, bookName, chapter, verse, endVerse] = match;
    
    console.log('[scriptureParser] Parsing:', fullMatch);
    console.log('[scriptureParser] Components:', { number, bookName, chapter, verse, endVerse });
    
    // Get canonical book name using our new helper function
    const canonicalBookName = getCanonicalBookName(bookName, number);
    
    if (canonicalBookName) {
      console.log('[scriptureParser] Found canonical book name:', canonicalBookName);
      
      references.push({
        book: canonicalBookName,
        chapter: parseInt(chapter, 10),
        verse: parseInt(verse, 10),
        endVerse: endVerse ? parseInt(endVerse, 10) : undefined
      });
    } else {
      console.warn('[scriptureParser] Unknown book:', bookName, 'with prefix:', number);
    }
  }
  
  console.log('[scriptureParser] Found references:', references.length);
  return references;
} 