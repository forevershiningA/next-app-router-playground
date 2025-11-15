/**
 * Script to analyze saved designs and regenerate saved-designs-data.ts
 * with proper product mapping, categorization, and privacy-safe slugs
 */

const fs = require('fs');
const path = require('path');

// Import product data (all known product IDs)
const productsData = {
  // Current products
  '4': { name: 'Laser-etched Black Granite Headstone', type: 'headstone', slug: 'laser-etched-headstone' },
  '5': { name: 'Bronze Plaque', type: 'plaque', slug: 'bronze-plaque' },
  '22': { name: 'Laser-etched Black Granite Mini Headstone', type: 'headstone', slug: 'mini-headstone' },
  '30': { name: 'Laser-etched Black Granite Colour', type: 'plaque', slug: 'laser-colour-plaque' },
  '32': { name: 'Full Colour Plaque', type: 'plaque', slug: 'full-colour-plaque' },
  '34': { name: 'Traditional Engraved Plaque', type: 'plaque', slug: 'traditional-plaque' },
  '52': { name: 'YAG Lasered Stainless Steel Plaque', type: 'plaque', slug: 'stainless-steel-plaque' },
  '124': { name: 'Traditional Engraved Headstone', type: 'headstone', slug: 'traditional-headstone' },
  '100': { name: 'Laser-etched Black Granite Full Monument', type: 'monument', slug: 'laser-monument' },
  '101': { name: 'Traditional Engraved Full Monument', type: 'monument', slug: 'traditional-monument' },
  
  // Legacy/older product IDs
  '7': { name: 'Legacy Plaque', type: 'plaque', slug: 'legacy-plaque' },
  '8': { name: 'Legacy Headstone', type: 'headstone', slug: 'legacy-headstone' },
  '9': { name: 'Legacy Design', type: 'plaque', slug: 'legacy-design' },
  '10': { name: 'Legacy Monument', type: 'monument', slug: 'legacy-monument' },
  '102': { name: 'Legacy Full Monument', type: 'monument', slug: 'legacy-full-monument' },
  '135': { name: 'Legacy Memorial', type: 'headstone', slug: 'legacy-memorial' },
  '2350': { name: 'Legacy Product', type: 'plaque', slug: 'legacy-product' },
};

const savedDesignsDirectories = [
  path.join(__dirname, '../public/ml/forevershining/saved-designs/json'),
  path.join(__dirname, '../public/ml/headstonesdesigner/saved-designs/json'),
  path.join(__dirname, '../public/ml/bronze-plaque/saved-designs/json'),
];

// Motif category file mapping from motifs_data.js
// Maps filename patterns to category names
const motifFileToCategory = {
  // Dogs
  '1_137_': 'dogs', '2_057_': 'dogs', '1_136_': 'dogs', '2_031_': 'dogs', '1_043_14': 'dogs',
  '1_043_16': 'dogs', '1_043_17': 'dogs', '1_043_18': 'dogs', '1_044_09': 'dogs', '1_044_10': 'dogs',
  '1_045_05': 'dogs', '1_045_20': 'dogs', '1_045_22': 'dogs', '2_080_01': 'dogs', '2_086_18': 'dogs',
  
  // Cats
  '1_131_': 'cats', '1_132_': 'cats', '2_056_': 'cats', '1_043_02': 'cats', '1_043_08': 'cats',
  '1_043_09': 'cats', '1_043_10': 'cats', '1_043_11': 'cats', '1_043_22': 'cats', '1_043_23': 'cats',
  '1_045_21': 'cats', '1_167_05': 'cats', '2_138_25': 'cats',
  
  // Horses
  '1_134_': 'horses', '1_143_': 'horses', '2_061_': 'horses', '1_139_16': 'horses', '1_178_25': 'horses',
  '1_178_26': 'horses', '2_080_03': 'horses', '2_086_21': 'horses', '2_190_21a': 'horses', '2_190_22a': 'horses',
  
  // Birds (general)
  '1_127_': 'birds', '1_129_': 'birds', '1_138_': 'birds', '1_139_': 'birds', '1_177_21': 'birds',
  '1_178_22': 'birds', '1_229_08': 'birds', '2_075_22': 'birds', '2_078_26': 'birds', '2_086_17': 'birds',
  '2_086_19': 'birds', '2_086_24': 'birds', 'bronze3': 'birds', 'bronze8': 'birds',
  
  // Butterflies
  'butterfly': 'butterflies', 'butterfliy': 'butterflies',
  
  // Flowers
  '1_002_16': 'flowers', '1_002_20': 'flowers', '1_006_': 'flowers', '1_153_': 'flowers',
  '1_154_': 'flowers', '1_155_': 'flowers', '1_156_': 'flowers', '1_157_': 'flowers',
  '1_159_': 'flowers', '1_167_01': 'flowers', '1_167_19': 'flowers', '1_193_': 'flowers',
  '1_194_': 'flowers', '1_197_07': 'flowers', '1_198_': 'flowers', '1_199_': 'flowers',
  '2_129_': 'flowers', '2_131_': 'flowers', '2_132_': 'flowers', 'flower': 'flowers',
  
  // Aquatic
  '1_140_': 'aquatic', '1_141_': 'aquatic', '1_142_08': 'aquatic', '2_059_': 'aquatic',
  
  // Hearts
  '1_167_03': 'hearts', '1_168_24': 'hearts', '2_152_': 'hearts',
};

/**
 * Get category name from motif filename
 */
function getCategoryFromFilename(filename) {
  const lower = filename.toLowerCase();
  
  // Check for specific matches first
  for (const [pattern, category] of Object.entries(motifFileToCategory)) {
    if (lower.includes(pattern.toLowerCase())) {
      return category;
    }
  }
  
  // Check for descriptive names in filename
  if (lower.includes('dove')) return 'dove';
  if (lower.includes('eagle')) return 'eagle';
  if (lower.includes('owl')) return 'owl';
  if (lower.includes('swan')) return 'swan';
  if (lower.includes('duck')) return 'duck';
  if (lower.includes('parrot')) return 'parrot';
  if (lower.includes('penguin')) return 'penguin';
  
  if (lower.includes('rose')) return 'rose';
  if (lower.includes('lotus')) return 'lotus';
  
  if (lower.includes('cross')) return 'cross';
  if (lower.includes('angel')) return 'angel';
  if (lower.includes('praying')) return 'praying-hands';
  if (lower.includes('crucifix')) return 'crucifix';
  if (lower.includes('bible')) return 'bible';
  
  if (lower.includes('turtle')) return 'turtle';
  if (lower.includes('dolphin')) return 'dolphin';
  if (lower.includes('whale')) return 'whale';
  if (lower.includes('fish')) return 'fish';
  if (lower.includes('shark')) return 'shark';
  
  if (lower.includes('horse')) return 'horses';
  if (lower.includes('elephant')) return 'elephant';
  if (lower.includes('giraffe')) return 'giraffe';
  if (lower.includes('kangaroo')) return 'kangaroo';
  
  if (lower.includes('teddy')) return 'teddy-bear';
  if (lower.includes('heart')) return 'heart';
  if (lower.includes('anchor')) return 'anchor';
  if (lower.includes('star')) return 'star';
  if (lower.includes('sun')) return 'sun';
  if (lower.includes('moon')) return 'moon';
  if (lower.includes('tree')) return 'tree';
  if (lower.includes('celtic')) return 'celtic';
  
  return null;
}

/**
 * Extract motif names from src paths using motifs_data.js mapping
 */
function extractMotifNames(designData) {
  const motifs = designData.filter(item => item.type === 'Motif' && item.src);
  const names = new Set();
  
  motifs.forEach(motif => {
    const src = motif.src;
    const srcLower = src.toLowerCase();
    
    // Extract filename from path
    const pathParts = src.split('/');
    const filename = pathParts[pathParts.length - 1];
    
    // First check if it's a descriptive filename (has letters, not just numbers)
    const hasLetters = /[a-z]/i.test(filename);
    
    if (hasLetters) {
      // Descriptive filename - extract specific motif name
      const motifName = getCategoryFromFilename(filename);
      if (motifName) {
        names.add(motifName);
      }
    } else {
      // Numeric filename - use category mapping from motifs_data.js
      const category = getCategoryFromFilename(filename);
      if (category) {
        // Map category to slug-friendly name
        const categoryMap = {
          'dogs': 'dog',
          'cats': 'cat',
          'horses': 'horse',
          'birds': 'bird',
          'butterflies': 'butterfly',
          'flowers': 'flower',
          'aquatic': 'fish',
          'hearts': 'heart',
        };
        names.add(categoryMap[category] || category);
      }
    }
    
    // Also check path folders for category context
    for (const part of pathParts) {
      const partLower = part.toLowerCase();
      if (partLower.includes('religious')) names.add('religious');
      if (partLower.includes('bird')) names.add('bird');
      if (partLower.includes('flower')) names.add('flower');
    }
  });
  
  return Array.from(names).filter(Boolean);
}

/**
 * Slugify helper function
 */
function slugify(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Check if a line contains names/dates that should be skipped
 */
function shouldSkipLine(line) {
  const lower = line.toLowerCase();
  
  // Skip if it's primarily dates
  if (/^\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/.test(line)) return true;
  if (/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(line)) return true;
  if (/\d{4}\s*(-|to)\s*\d{4}/.test(line)) return true;
  
  // Skip common memorial headers ONLY if they're alone
  if (lower === 'in loving memory' || lower === 'in memory of') return true;
  
  // Skip single words
  if (line.split(/\s+/).length === 1) return true;
  
  // BEFORE checking if it looks like a name, check if it contains meaningful memorial words
  // These phrases should NOT be skipped even if they look like names
  const meaningfulWords = /\b(beloved|loving|devoted|treasured|cherished|beautiful|wonderful|amazing|special|dear|precious|adored)\s+(mother|mom|mum|mama|father|dad|papa|wife|husband|son|daughter|grandmother|grandfather|nana|papa|grandpa|grandma|friend|sister|brother|nan|pop|granny)\b/i;
  if (meaningfulWords.test(line)) return false;
  
  // Skip if it looks like a name (all caps, short)
  if (/^[A-Z\s&']{2,30}$/.test(line) && line.split(' ').length <= 3) return true;
  if (/^(mr|mrs|ms|miss|dr|rev|sr|jr)\s/i.test(line)) return true;
  
  // Skip family relationship counts (e.g., "Mother of 9")
  if (/^(mother|father|wife|husband|son|daughter|nanna|grandma|papa)\s+of\s+\d+/i.test(line)) return true;
  
  return false;
}

/**
 * Check if a line is meaningful memorial text
 */
function isMeaningfulText(line) {
  // Must have at least 2 words
  const words = line.trim().split(/\s+/);
  if (words.length < 2) return false;
  
  // Should be between 10 and 150 characters
  if (line.length < 10 || line.length > 150) return false;
  
  // Look for poetic/meaningful indicators OR relationship phrases
  const meaningfulIndicators = [
    // Relationship phrases (PRIORITY)
    /\b(beloved|loving|devoted|treasured|cherished)\s+(mother|father|wife|husband|son|daughter|grandmother|grandfather|friend|sister|brother)/i,
    // Poetic phrases
    /\b(made|walked|looked|lived|loved|cherished|treasured)\b/i,
    /\b(beautiful|invincible|wings|shoulders|universe|hearts|forever|always)\b/i,
    /\b(blessing|treasure|peace|rest|heaven|angel|light)\b/i,
    /\b(remember|memory|memories|never|forgotten|missed)\b/i,
    /\b(life|soul|spirit|journey|legacy|grace)\b/i,
  ];
  
  return meaningfulIndicators.some(pattern => pattern.test(line));
}

/**
 * Extract meaningful keywords from inscriptions for SEO slugs
 * Now looks for ANY meaningful memorial text, not just specific patterns
 */
function extractKeywordsFromInscriptions(designData) {
  const keywords = [];
  
  const inscriptions = designData
    .filter(item => item.type === 'Inscription' && item.label)
    .map(item => item.label);
  
  if (inscriptions.length === 0) return keywords;
  
  const allText = inscriptions.join(' ');
  const allTextLower = allText.toLowerCase();
  
  // PRIORITY 1: Known complete phrases
  const knownPhrases = [
    /your life was a blessing[^.]*your memory a treasure/i,
    /she made broken look beautiful[^.]*strong look invincible/i,
    /universe on her shoulders[^.]*pair of wings/i,
    /walked with the universe[^.]*looked like wings/i,
    /forever in our hearts/i,
    /always in our thoughts/i,
    /gone but never forgotten/i,
    /deeply loved[^.]*sadly missed/i,
    /until we meet again/i,
    /in our hearts forever/i,
    /memories last forever/i,
    /a life well lived/i,
    /the lord is my shepherd/i,
  ];
  
  for (const pattern of knownPhrases) {
    const match = allText.match(pattern);
    if (match) {
      const phrase = match[0].trim();
      const slugText = slugify(phrase).substring(0, 60);
      if (slugText) {
        keywords.push(slugText);
        return keywords; // Return immediately
      }
    }
  }
  
  // PRIORITY 2: Look for meaningful lines in the inscriptions
  const meaningfulLines = [];
  const seenLines = new Set(); // Track duplicates
  for (const line of inscriptions) {
    const trimmed = line.trim();
    const lowerLine = trimmed.toLowerCase();
    
    // Skip duplicates, empty lines, or lines that should be skipped
    if (!trimmed || seenLines.has(lowerLine) || shouldSkipLine(trimmed)) continue;
    
    if (isMeaningfulText(trimmed)) {
      meaningfulLines.push(trimmed);
      seenLines.add(lowerLine); // Mark as seen
    }
  }
  
  // Combine meaningful lines (up to 2-3 lines for a good phrase)
  if (meaningfulLines.length > 0) {
    // Try to combine consecutive meaningful lines
    const combined = meaningfulLines.slice(0, 3).join(' ').substring(0, 120);
    const slugText = slugify(combined).substring(0, 60);
    if (slugText && slugText.length > 10) {
      keywords.push(slugText);
      return keywords;
    }
  }
  
  // PRIORITY 3: Bible verses
  if (allTextLower.match(/psalm\s*23/i)) keywords.push('psalm-23');
  if (allTextLower.match(/john\s*3:?16/i)) keywords.push('john-3-16');
  if (allTextLower.match(/23rd\s+psalm/i)) keywords.push('23rd-psalm');
  
  // PRIORITY 4: Common memorial phrases (shorter)
  if (allTextLower.match(/always\s+in\s+our\s+hearts/i)) keywords.push('always-in-our-hearts');
  if (allTextLower.match(/forever\s+in\s+our\s+hearts/i)) keywords.push('forever-in-our-hearts');
  if (allTextLower.match(/gone\s+but\s+not\s+forgotten/i)) keywords.push('gone-but-not-forgotten');
  if (allTextLower.match(/until\s+we\s+meet\s+again/i)) keywords.push('until-we-meet-again');
  if (allTextLower.match(/rest\s+in\s+peace/i)) keywords.push('rest-in-peace');
  if (allTextLower.match(/in\s+god'?s\s+hands/i)) keywords.push('in-gods-hands');
  if (allTextLower.match(/safe\s+in\s+the\s+arms\s+of\s+jesus/i)) keywords.push('safe-in-arms-of-jesus');
  
  // PRIORITY 5: Relationships
  if (allTextLower.match(/beloved\s+wife/i)) keywords.push('beloved-wife');
  if (allTextLower.match(/beloved\s+husband/i)) keywords.push('beloved-husband');
  if (allTextLower.match(/loving\s+mother/i)) keywords.push('loving-mother');
  if (allTextLower.match(/loving\s+father/i)) keywords.push('loving-father');
  if (allTextLower.match(/devoted\s+wife/i)) keywords.push('devoted-wife');
  if (allTextLower.match(/devoted\s+husband/i)) keywords.push('devoted-husband');
  if (allTextLower.match(/treasured\s+mother/i)) keywords.push('treasured-mother');
  if (allTextLower.match(/our\s+little\s+angel/i)) keywords.push('our-little-angel');
  
  // PRIORITY 6: Service/Military
  if (allTextLower.match(/served\s+his\s+country/i)) keywords.push('served-his-country');
  if (allTextLower.match(/served\s+her\s+country/i)) keywords.push('served-her-country');
  if (allTextLower.match(/proud\s+veteran/i)) keywords.push('proud-veteran');
  if (allTextLower.match(/lest\s+we\s+forget/i)) keywords.push('lest-we-forget');
  
  // PRIORITY 7: Ethnic/Cultural phrases
  if (allTextLower.match(/aroha\s+nui/i)) keywords.push('aroha-nui');
  if (allTextLower.match(/haere\s+ra/i)) keywords.push('haere-ra');
  
  return keywords;
}

/**
 * Generate privacy-safe slug from design data with SEO focus
 * Format: meaningful-inscription-phrase or motif-names
 */
function generatePrivacySafeSlug(designData, category) {
  // Extract SEO keywords from inscriptions
  const keywords = extractKeywordsFromInscriptions(designData);
  if (keywords.length > 0) {
    // If we got a meaningful phrase (long slug), use it directly
    if (keywords[0].length > 20) {
      return keywords[0];
    }
    // Otherwise combine up to 3 keywords
    return keywords.slice(0, 3).join('-');
  }
  
  // Fallback to motif names
  const motifNames = extractMotifNames(designData);
  if (motifNames.length > 0) {
    return motifNames.slice(0, 2).join('-');
  }
  
  // Fallback to category
  if (category && !['memorial', 'in-loving-memory'].includes(category)) {
    return category.replace(/_/g, '-');
  }
  
  // Final fallback
  return 'memorial';
}

/**
 * Determine category from inscriptions and motifs (programmatic SEO focused)
 */
function determineCategory(designData) {
  // Extract text from inscriptions (label field)
  const inscriptions = designData
    .filter(item => item.type === 'Inscription' && item.label)
    .map(item => item.label.toLowerCase())
    .join(' ');
  
  // Extract motif information
  const motifs = designData.filter(item => item.type === 'Motif' && item.src);
  const motifSrcs = motifs.map(m => m.src.toLowerCase()).join(' ');
  
  if (!inscriptions) return 'memorial';
  
  // Religious scriptures - HIGHEST PRIORITY for SEO
  if (inscriptions.match(/\b(psalm|psalms|proverbs|john|matthew|luke|mark|corinthians|romans|genesis|exodus)\b/i)) {
    return 'biblical-memorial';
  }
  if (inscriptions.match(/\b(quran|qur'an|allah|surah|ayah|insha'allah)\b/i)) {
    return 'islamic-memorial';
  }
  if (inscriptions.match(/\b(torah|shalom|baruch|adonai|hashem)\b/i)) {
    return 'jewish-memorial';
  }
  
  // Specific verse references for long-tail SEO
  if (inscriptions.match(/\b(psalm 23|23rd psalm|the lord is my shepherd)\b/i)) {
    return 'psalm-23-memorial';
  }
  if (inscriptions.match(/\b(john 3:16|john 3 16)\b/i)) {
    return 'john-3-16-memorial';
  }
  
  // Military/Service - great for SEO
  if (inscriptions.match(/\b(veteran|served|military|army|navy|air force|marines|war|regiment|battalion)\b/i)) {
    return 'military-veteran';
  }
  if (inscriptions.match(/\b(police|officer|firefighter|paramedic|first responder|served the community)\b/i)) {
    return 'service-memorial';
  }
  
  // Relationships - specific categories
  if (inscriptions.match(/\b(beloved wife|loving wife|devoted wife|dear wife)\b/i)) {
    return 'wife-memorial';
  }
  if (inscriptions.match(/\b(beloved husband|loving husband|devoted husband|dear husband)\b/i)) {
    return 'husband-memorial';
  }
  if (inscriptions.match(/\b(mother|mum|mom|mama|grandmother|nana|granny)\b/i)) {
    return 'mother-memorial';
  }
  if (inscriptions.match(/\b(father|dad|papa|grandfather|grandad|grandpa)\b/i)) {
    return 'father-memorial';
  }
  if (inscriptions.match(/\b(daughter|our daughter)\b/i)) {
    return 'daughter-memorial';
  }
  if (inscriptions.match(/\b(son|our son)\b/i)) {
    return 'son-memorial';
  }
  if (inscriptions.match(/\b(brother|our brother)\b/i)) {
    return 'brother-memorial';
  }
  if (inscriptions.match(/\b(sister|our sister)\b/i)) {
    return 'sister-memorial';
  }
  
  // Baby/Infant - specific
  if (inscriptions.match(/\b(baby|infant|stillborn|born sleeping|our little angel|precious baby)\b/i)) {
    return 'baby-memorial';
  }
  if (inscriptions.match(/\b(child|our child|beloved child)\b/i)) {
    return 'child-memorial';
  }
  
  // Pet - with animal type
  if (inscriptions.match(/\b(dog|puppy|canine|our dog)\b/i) || motifSrcs.includes('dog')) {
    return 'dog-memorial';
  }
  if (inscriptions.match(/\b(cat|kitten|feline|our cat)\b/i) || motifSrcs.includes('cat')) {
    return 'cat-memorial';
  }
  if (inscriptions.match(/\b(horse|pony|equine|our horse)\b/i) || motifSrcs.includes('horse')) {
    return 'horse-memorial';
  }
  if (inscriptions.match(/\b(pet|beloved pet|faithful companion)\b/i)) {
    return 'pet-memorial';
  }
  
  // Occupation-based (great for SEO)
  if (inscriptions.match(/\b(teacher|educator|professor|lecturer)\b/i)) {
    return 'teacher-memorial';
  }
  if (inscriptions.match(/\b(nurse|nursing|caregiver|healthcare)\b/i)) {
    return 'nurse-memorial';
  }
  if (inscriptions.match(/\b(doctor|physician|surgeon|medical)\b/i)) {
    return 'doctor-memorial';
  }
  
  // Hobbies/Interests (motif-based)
  if (motifSrcs.includes('golf') || inscriptions.includes('golf')) {
    return 'golf-memorial';
  }
  if (motifSrcs.includes('fish') || inscriptions.includes('fishing')) {
    return 'fishing-memorial';
  }
  if (motifSrcs.includes('garden') || inscriptions.match(/\b(garden|gardener|gardening)\b/i)) {
    return 'garden-memorial';
  }
  if (motifSrcs.includes('music') || inscriptions.match(/\b(music|musician|singer)\b/i)) {
    return 'music-memorial';
  }
  
  // Cultural/Language specific
  if (inscriptions.match(/\b(aroha|haere ra|kia kaha)\b/i)) {
    return 'maori-memorial';
  }
  if (inscriptions.match(/\b(aloha|mahalo)\b/i)) {
    return 'hawaiian-memorial';
  }
  if (inscriptions.match(/\b(rest in peace|rip|r\.i\.p)\b/i)) {
    return 'rest-in-peace';
  }
  
  // Religious general
  if (inscriptions.match(/\b(god|jesus|heaven|lord|blessed|angel|prayer|faith|eternal)\b/i) || 
      motifSrcs.includes('cross') || motifSrcs.includes('angel')) {
    return 'religious-memorial';
  }
  
  // Nature-based (from motifs)
  if (motifSrcs.includes('butterfly') || motifSrcs.includes('butterflies')) {
    return 'butterfly-memorial';
  }
  if (motifSrcs.includes('rose') || motifSrcs.includes('flower')) {
    return 'floral-memorial';
  }
  if (motifSrcs.includes('dove') || motifSrcs.includes('bird')) {
    return 'dove-memorial';
  }
  
  // Dedication/Commemorative
  if (inscriptions.match(/\b(dedicat|in honor|in honour|tribute|presented)\b/i)) {
    return 'dedication';
  }
  if (inscriptions.match(/\b(commemorate|remembering|celebration of life)\b/i)) {
    return 'commemorative';
  }
  
  // In loving memory
  if (inscriptions.match(/\b(loving memory|in memory|cherish|beloved|treasured memories)\b/i)) {
    return 'in-loving-memory';
  }
  
  // Default
  return 'memorial';
}

/**
 * Analyze a single saved design
 */
function analyzeDesign(filepath, filename) {
  const designData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  
  // Extract design ID from filename
  const designId = filename.replace('.json', '');
  
  // Determine which ML directory this is from (forevershining, headstonesdesigner, bronze-plaque)
  const mlDir = filepath.includes('forevershining') ? 'forevershining' : 
                filepath.includes('headstonesdesigner') ? 'headstonesdesigner' : 
                'bronze-plaque';
  
  // Get the base product (first item with productid)
  const baseProduct = designData.find(item => item.productid);
  
  if (!baseProduct) {
    // console.warn(`No product found for ${filename}`);
    return null;
  }
  
  const productId = String(baseProduct.productid);
  const product = productsData[productId];
  
  if (!product) {
    // console.warn(`Unknown product ID ${productId} in ${filename}`);
    return null;
  }
  
  // Determine category
  const category = determineCategory(designData);
  
  // Generate privacy-safe slug with motif names
  const slug = generatePrivacySafeSlug(designData, category);
  
  // Extract first meaningful inscription for title (sanitized - no names)
  let title = 'Memorial Design';
  const firstLabel = designData.find(item => item.type === 'Inscription' && item.label && item.label.trim())?.label;
  if (firstLabel) {
    // Take first 60 chars but try to avoid names by looking for keywords
    const lowerText = firstLabel.toLowerCase();
    if (lowerText.includes('loving memory') || lowerText.includes('in memory') || 
        lowerText.includes('dedicated') || lowerText.includes('honor')) {
      title = firstLabel.substring(0, 60);
    } else {
      // Use category-based title
      title = category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }
  
  // Extract motif names for metadata
  const motifNames = extractMotifNames(designData);
  
  // Extract inscription text for slug generation
  const inscriptions = designData
    .filter(item => item.type === 'Inscription' && item.label && item.label.trim())
    .map(item => item.label.trim())
    .join(' ');
  
  // Extract shape information
  const shapeItem = designData.find(item => item.design_shape || item.shape);
  const shapeName = shapeItem ? (shapeItem.design_shape || shapeItem.shape || '').toLowerCase().trim() : '';
  
  // Preview image path - check if screenshot exists
  // Screenshots are organized in year/month folders based on timestamp
  const timestamp = parseInt(designId);
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  // Try multiple possible locations
  const possiblePaths = [
    `/ml/${mlDir}/saved-designs/screenshots/${year}/${month}/${designId}.jpg`,
    `/ml/${mlDir}/saved-designs/screenshots/${year}/${month}/${designId}_small.jpg`,
    `/ml/${mlDir}/saved-designs/screenshots/${designId}.jpg`,
    `/ml/${mlDir}/saved-designs/screenshots/${designId}_small.jpg`,
  ];
  
  let previewPath = `/placeholder-memorial.png`;
  
  for (const tryPath of possiblePaths) {
    const fullPath = path.join(__dirname, '../public', tryPath);
    if (fs.existsSync(fullPath)) {
      previewPath = tryPath;
      break;
    }
  }
  
  return {
    id: designId,
    productId: productId,
    productName: product.name,
    productType: product.type,
    productSlug: product.slug,
    category: category,
    slug: slug,
    title: title,
    motifNames: motifNames,
    inscriptions: inscriptions, // NEW: Add inscription text for slug generation
    shapeName: shapeName, // NEW: Add shape name for slug generation
    preview: previewPath,
    mlDir: mlDir,
    hasPhoto: designData.some(item => item.type === 'UploadedPhoto' || item.type === 'Photo'),
    hasLogo: designData.some(item => item.type === 'Logo' || item.type === 'UploadedLogo'),
    hasMotifs: designData.some(item => item.type === 'Motif'),
    hasAdditions: designData.some(item => item.type === 'addition' || item.type === 'Addition'),
    inscriptionCount: designData.filter(item => item.type === 'Inscription' && item.label && item.label.trim()).length,
  };
}

/**
 * Deduplicate similar designs
 * Keep only the most recent (highest ID/timestamp) design in each similar group
 */
function deduplicateDesigns(designs) {
  // Group designs by similarity
  const groups = new Map();
  
  for (const design of designs) {
    // Create a similarity key based on:
    // - Product type
    // - Category
    // - Motifs (sorted)
    // - Inscription count (rough similarity)
    const key = [
      design.productType,
      design.category,
      design.motifNames.sort().join(','),
      Math.floor(design.inscriptionCount / 2), // Group by similar inscription count
      design.hasPhoto ? 'photo' : 'no-photo',
      design.hasLogo ? 'logo' : 'no-logo',
    ].join('||');
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(design);
  }
  
  // From each group, keep only the most recent design
  const deduplicated = [];
  let totalGroups = 0;
  let deduplicatedGroups = 0;
  
  for (const [key, groupDesigns] of groups.entries()) {
    totalGroups++;
    
    if (groupDesigns.length > 1) {
      // Sort by ID (timestamp) descending - keep the most recent
      groupDesigns.sort((a, b) => b.id.localeCompare(a.id));
      deduplicated.push(groupDesigns[0]);
      deduplicatedGroups++;
    } else {
      // Single design in group, keep it
      deduplicated.push(groupDesigns[0]);
    }
  }
  
  console.log(`   📊 Total groups: ${totalGroups}`);
  console.log(`   🔄 Groups with duplicates: ${deduplicatedGroups}`);
  
  return deduplicated;
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Analyzing saved designs from multiple directories...');
  
  const analyzed = [];
  const byProductType = { headstone: 0, plaque: 0, monument: 0 };
  const byCategory = {};
  const byMotif = {};
  let totalFiles = 0;
  let skippedFiles = 0;
  
  // Process each directory
  for (const dir of savedDesignsDirectories) {
    if (!fs.existsSync(dir)) {
      console.warn(`❌ Directory not found: ${dir}`);
      continue;
    }
    
    const dirName = dir.split(path.sep).slice(-3, -2)[0]; // Extract "forevershining", etc.
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    totalFiles += files.length;
    console.log(`\n📁 Processing ${dirName}: ${files.length} files`);
    
    let processed = 0;
    for (const file of files) {
      try {
        const filepath = path.join(dir, file);
        const result = analyzeDesign(filepath, file);
        if (result) {
          analyzed.push(result);
          byProductType[result.productType]++;
          byCategory[result.category] = (byCategory[result.category] || 0) + 1;
          
          // Track motif names
          result.motifNames.forEach(motif => {
            byMotif[motif] = (byMotif[motif] || 0) + 1;
          });
          
          processed++;
        } else {
          skippedFiles++;
        }
      } catch (error) {
        console.error(`❌ Error analyzing ${file}:`, error.message);
        skippedFiles++;
      }
    }
    console.log(`   ✅ Processed: ${processed}`);
  }
  
  console.log('\n📊 Analysis Summary:');
  console.log(`   Total files scanned: ${totalFiles}`);
  console.log(`   ✅ Successfully analyzed: ${analyzed.length}`);
  console.log(`   ⚠️ Skipped: ${skippedFiles}`);
  
  // Deduplicate similar designs
  console.log('\n🔍 Deduplicating similar designs...');
  const deduplicated = deduplicateDesigns(analyzed);
  const duplicatesRemoved = analyzed.length - deduplicated.length;
  console.log(`   ✅ Removed ${duplicatesRemoved} duplicates`);
  console.log(`   📦 Unique designs: ${deduplicated.length}`);
  
  console.log(`\n📦 By Product Type:`);
  console.log(`   Headstones: ${byProductType.headstone}`);
  console.log(`   Plaques: ${byProductType.plaque}`);
  console.log(`   Monuments: ${byProductType.monument}`);
  
  console.log(`\n🏷️  By Category:`);
  Object.entries(byCategory).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count}`);
  });
  
  console.log(`\n🎨 Top Motifs:`);
  Object.entries(byMotif).sort((a, b) => b[1] - a[1]).slice(0, 15).forEach(([motif, count]) => {
    console.log(`   ${motif}: ${count}`);
  });
  
  // Write results to file (use deduplicated designs)
  const outputPath = path.join(__dirname, '../lib/saved-designs-analyzed.json');
  fs.writeFileSync(outputPath, JSON.stringify(deduplicated, null, 2));
  console.log(`\n💾 Results saved to: ${outputPath}`);
  
  // Sample URLs
  console.log('\n🔗 Sample URLs:');
  deduplicated.slice(0, 10).forEach(design => {
    const url = `/designs/${design.productSlug}/${design.category}/${design.id}_${design.slug}`;
    console.log(`   ${url}`);
  });
}

main();
