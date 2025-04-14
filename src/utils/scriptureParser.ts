export interface ScriptureReference {
  book: string;
  chapter: number;
  verse?: number;
  endVerse?: number;
}

export function parseScriptureReference(text: string): ScriptureReference | null {
  // Handle formats like:
  // "John 3:16"
  // "John 3:16-18"
  // "John 3"
  const regex = /^(\d?\s*[A-Za-z]+)\s*(\d+)(?::(\d+)(?:-(\d+))?)?$/;
  const match = text.match(regex);
  
  if (!match) return null;
  
  return {
    book: match[1].trim(),
    chapter: parseInt(match[2]),
    verse: match[3] ? parseInt(match[3]) : undefined,
    endVerse: match[4] ? parseInt(match[4]) : undefined
  };
}

export function formatApiReference(reference: ScriptureReference): string {
  const { book, chapter, verse, endVerse } = reference;
  const bookAbbr = getBookAbbreviation(book);
  
  if (!verse) {
    return `${bookAbbr}.${chapter}`;
  }
  
  if (!endVerse) {
    return `${bookAbbr}.${chapter}.${verse}`;
  }
  
  return `${bookAbbr}.${chapter}.${verse}-${endVerse}`;
}

function getBookAbbreviation(book: string): string {
  // Map of book names to their abbreviations
  const bookAbbreviations: Record<string, string> = {
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

  return bookAbbreviations[book] || book.toUpperCase();
} 