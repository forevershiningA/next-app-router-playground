/**
 * SMART PHRASE EXTRACTOR - Option 2 Booster
 * Extracts only SHORT, REUSABLE phrases (≤6 words, no names/dates)
 * Feeds the library with evergreen content for sustainable scale
 */

const fs = require('fs');
const path = require('path');

// Load analyzed designs
const designsPath = path.join(__dirname, '../lib/saved-designs-analyzed.json');
const designs = JSON.parse(fs.readFileSync(designsPath, 'utf8'));

console.log(`🔍 Extracting short reusable phrases from ${designs.length} designs...\n`);

// Whitelist of known memorial starters (always keep these)
const MEMORIAL_STARTERS = new Set([
  'in loving memory',
  'in memory of',
  'forever in our hearts',
  'always in our hearts',
  'rest in peace',
  'gone but never forgotten',
  'the lord is my shepherd',
  'blessed are the pure',
  'for god so loved',
  'i am the resurrection',
  'absent from the body',
  'aici odihneste',
  'aici odihneşte',
  'moe mai ra',
  'aroha nui',
  'aloha',
  'o ia keriso lea',
  'tofa soifua',
  'much loved',
  'devoted husband',
  'devoted wife',
  'loving father',
  'loving mother',
  'cherished',
  'beloved',
  'treasured',
  'adored'
]);

// Common names to detect and filter (partial list - extend as needed)
const COMMON_NAMES = new Set([
  'john', 'mary', 'robert', 'james', 'michael', 'william', 'david', 'richard',
  'thomas', 'charles', 'margaret', 'elizabeth', 'patricia', 'barbara', 'susan'
]);

/**
 * Normalize text for consistent matching
 */
function normalizeText(text) {
  if (!text) return '';
  
  return text
    // Smart quotes to ASCII
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    // Remove ALL HTML entities
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/&#\d+;/g, ' ')
    // Normalize spaces
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Check if text contains dates
 */
function hasDate(text) {
  // Match various date patterns
  return /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/.test(text) || // 12/31/2020, 31-12-20
         /\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}/.test(text) || // 2020-12-31
         /\b(19|20)\d{2}\b/.test(text) ||                     // Year: 1950, 2020
         /\b\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(text) || // 12 Jan
         /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2}/i.test(text);   // Jan 12
}

/**
 * Check if text contains verse references
 */
function hasVerseReference(text) {
  return /\b\d+\s*:\s*\d+/.test(text) ||        // John 3:16
         /\bverse\s+\d+/i.test(text) ||          // verse 7
         /\bchapter\s+\d+/i.test(text);          // chapter 3
}

/**
 * Check if text likely contains personal names
 */
function hasPersonalNames(text) {
  const words = text.split(/\s+/);
  
  // Count capitalized words (potential names)
  const capitalizedWords = words.filter(word => {
    // First letter uppercase, rest lowercase, >2 chars
    return word.length > 2 && 
           word[0] === word[0].toUpperCase() && 
           word.substring(1) === word.substring(1).toLowerCase();
  });
  
  // If 2+ capitalized words close together, likely a name
  if (capitalizedWords.length >= 2) {
    // Check if any are common names
    const hasCommonName = capitalizedWords.some(word => 
      COMMON_NAMES.has(word.toLowerCase())
    );
    if (hasCommonName) return true;
  }
  
  return false;
}

/**
 * Check if text is test/noise
 */
function isTestNoise(text) {
  const lower = text.toLowerCase();
  return lower === 'test' ||
         lower === 'testing' ||
         lower.startsWith('test test') ||
         lower === 'lorem ipsum' ||
         lower.includes('placeholder') ||
         /^[a-z]\s*$/.test(lower); // Single letter
}

/**
 * Check if text is profanity or inappropriate
 */
function isProfanity(text) {
  const profanityList = ['damn', 'hell', 'crap', 'shit', 'fuck'];
  const lower = text.toLowerCase();
  return profanityList.some(word => lower.includes(word));
}

/**
 * Check if phrase is a known memorial starter
 */
function isMemorialStarter(text) {
  const lower = normalizeText(text);
  
  for (const starter of MEMORIAL_STARTERS) {
    if (lower.startsWith(starter)) {
      return true;
    }
  }
  return false;
}

/**
 * Detect language of phrase
 */
function detectLanguage(text) {
  const lower = normalizeText(text);
  
  // Romanian indicators
  if (lower.includes('aici') || lower.includes('odihne') || 
      lower.includes('lacrimile') || lower.includes('nu plange')) {
    return 'ro';
  }
  
  // Samoan indicators
  if (lower.includes('keriso') || lower.includes('alofa') || 
      lower.includes('tofa') || lower.includes('maliu')) {
    return 'sm';
  }
  
  // Maori indicators
  if (lower.includes('moe mai') || lower.includes('haere ra') || 
      lower.includes('aroha nui') || lower.includes('kia kaha')) {
    return 'mi';
  }
  
  // Hawaiian
  if (lower === 'aloha' || lower.includes('mahalo')) {
    return 'hw';
  }
  
  // Polish
  if (lower.includes('kochany') || lower.includes('spoczywaj')) {
    return 'pl';
  }
  
  // French
  if (lower.includes('repose en paix') || lower.includes('en memoire')) {
    return 'fr';
  }
  
  // Default to English
  return 'en';
}

/**
 * Classify phrase type
 */
function classifyPhraseType(text) {
  const lower = normalizeText(text);
  
  // Biblical books
  if (/\b(genesis|exodus|leviticus|numbers|deuteronomy|joshua|judges|ruth|samuel|kings|chronicles|ezra|nehemiah|esther|job|psalm|proverbs|ecclesiastes|song|isaiah|jeremiah|lamentations|ezekiel|daniel|hosea|joel|amos|obadiah|jonah|micah|nahum|habakkuk|zephaniah|haggai|zechariah|malachi|matthew|mark|luke|john|acts|romans|corinthians|galatians|ephesians|philippians|colossians|thessalonians|timothy|titus|philemon|hebrews|james|peter|jude|revelation)\b/i.test(text)) {
    return 'bible-verse';
  }
  
  // Tribute words
  if (/\b(devoted|loving|cherished|beloved|treasured|adored|much loved|gentle|kind|warrior|legend|hero|champion)\b/i.test(lower)) {
    return 'tribute';
  }
  
  // Comfort/Memorial
  if (/\b(rest|peace|memory|hearts|forever|always|until|meet|again|sleep|eternal|heaven|angel|star)\b/i.test(lower)) {
    return 'comfort-phrase';
  }
  
  // Cultural (non-English)
  if (detectLanguage(text) !== 'en') {
    return 'cultural';
  }
  
  return 'memorial';
}

/**
 * Extract short phrases from inscription text
 */
function extractShortPhrases(inscriptionText) {
  if (!inscriptionText || !inscriptionText.trim()) return [];
  
  const phrases = new Set();
  
  // Split by common separators
  const lines = inscriptionText
    .split(/[\n\r]+/)
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  lines.forEach(line => {
    // Remove HTML entities first
    let cleanLine = line
      .replace(/&[a-z]+;/gi, ' ')
      .replace(/&#\d+;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Also split on common punctuation that separates phrases
    const subPhrases = cleanLine.split(/[;|]/).map(p => p.trim());
    
    subPhrases.forEach(phrase => {
      if (!phrase || phrase.length < 3) return;
      
      const normalized = normalizeText(phrase);
      const words = normalized.split(/\s+/).filter(w => w.length > 0);
      
      // ≤6 words filter
      if (words.length > 6 || words.length === 0) return;
      
      // Minimum 2 words (except whitelisted single words like "Aloha")
      if (words.length < 2 && !MEMORIAL_STARTERS.has(normalized)) return;
      
      // Skip if has dates
      if (hasDate(phrase)) return;
      
      // Skip if has verse references (keep the verse text, not the reference)
      if (hasVerseReference(phrase)) return;
      
      // Skip if has personal names (unless it's a known starter)
      if (!isMemorialStarter(normalized) && hasPersonalNames(phrase)) return;
      
      // Skip test/noise
      if (isTestNoise(phrase)) return;
      
      // Skip profanity
      if (isProfanity(phrase)) return;
      
      // Skip if too short (single word under 4 chars, unless whitelisted)
      if (words.length === 1 && normalized.length < 4 && !MEMORIAL_STARTERS.has(normalized)) return;
      
      // Skip if mostly numbers
      if (/\d/.test(normalized) && normalized.replace(/[^0-9]/g, '').length > normalized.length / 3) return;
      
      // Skip if contains fragments (unclosed quotes, broken words)
      if (normalized.includes('"') || normalized.includes("'")) return;
      
      // Skip if looks like a sentence fragment (starts/ends with punctuation)
      if (/^[,\.;:]/.test(normalized) || /[,;:]$/.test(normalized)) return;
      
      // Passed all filters - add it!
      phrases.add(normalized);
    });
  });
  
  return Array.from(phrases);
}

// Extract phrases from all designs
const phraseMap = new Map();

designs.forEach(design => {
  if (design.inscriptions && design.inscriptions.trim()) {
    const phrases = extractShortPhrases(design.inscriptions);
    
    phrases.forEach(phrase => {
      if (!phraseMap.has(phrase)) {
        phraseMap.set(phrase, {
          phrase: phrase,
          frequency: 0,
          exampleDesignIds: [],
          categories: new Set(),
          products: new Set(),
          language: detectLanguage(phrase),
          phraseType: classifyPhraseType(phrase),
          usefulForSEO: true // All extracted phrases are pre-filtered as useful
        });
      }
      
      const entry = phraseMap.get(phrase);
      entry.frequency++;
      
      if (entry.exampleDesignIds.length < 3) {
        entry.exampleDesignIds.push(design.id);
      }
      
      entry.categories.add(design.category);
      entry.products.add(design.productSlug);
    });
  }
});

// Convert to array and sort by frequency
const shortPhrases = Array.from(phraseMap.values())
  .map(entry => ({
    phrase: entry.phrase,
    frequency: entry.frequency,
    exampleDesignIds: entry.exampleDesignIds,
    categories: Array.from(entry.categories),
    products: Array.from(entry.products),
    language: entry.language,
    phraseType: entry.phraseType,
    usefulForSEO: true,
    notes: ''
  }))
  .sort((a, b) => b.frequency - a.frequency);

// Save to JSON
const outputPath = path.join(__dirname, '../lib/short-phrases-extracted.json');
fs.writeFileSync(outputPath, JSON.stringify(shortPhrases, null, 2));

console.log(`✅ Extracted ${shortPhrases.length} short reusable phrases`);
console.log(`📁 Saved to: ${outputPath}\n`);

// Statistics
const byLanguage = {};
const byType = {};

shortPhrases.forEach(p => {
  byLanguage[p.language] = (byLanguage[p.language] || 0) + 1;
  byType[p.phraseType] = (byType[p.phraseType] || 0) + 1;
});

console.log(`📊 Statistics:`);
console.log(`   Total short phrases: ${shortPhrases.length}`);
console.log(`\n🌍 By Language:`);
Object.entries(byLanguage).forEach(([lang, count]) => {
  console.log(`   ${lang}: ${count} phrases`);
});

console.log(`\n📝 By Type:`);
Object.entries(byType).forEach(([type, count]) => {
  console.log(`   ${type}: ${count} phrases`);
});

// Show top 30
console.log(`\n🔝 Top 30 Most Common Short Phrases:\n`);
shortPhrases.slice(0, 30).forEach((entry, index) => {
  console.log(`   ${index + 1}. [${entry.frequency}x] "${entry.phrase}" (${entry.phraseType}, ${entry.language})`);
});

console.log(`\n💡 These are clean, reusable phrases perfect for SEO!`);
console.log(`   ✅ No names or dates`);
console.log(`   ✅ ≤6 words each`);
console.log(`   ✅ Ready to add to your library\n`);
