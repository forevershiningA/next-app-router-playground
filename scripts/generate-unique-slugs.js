/**
 * Generate unique, SEO-optimized slugs for all designs
 * 
 * This script:
 * 1. Reads design JSON files to extract content
 * 2. Generates unique slugs based on motifs, verses, and content
 * 3. Handles collisions with smart disambiguation
 * 4. Updates saved-designs-analyzed.json with new slugs
 * 5. Creates slug-to-ID mapping for fast lookups
 */

const fs = require('fs');
const path = require('path');

const analyzedPath = path.join(__dirname, '../lib/saved-designs-analyzed.json');
const designs = JSON.parse(fs.readFileSync(analyzedPath, 'utf8'));

console.log(`🔍 Generating unique slugs for ${designs.length} designs...`);

// Common words to remove from slugs
const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with', 'our', 'their', 'this', 'we'
]);

// Biblical references and common verses
const BIBLICAL_VERSES = {
  'john 3:16': 'john-3-16',
  'john 3 16': 'john-3-16',
  'psalm 23': 'psalm-23',
  'the lord is my shepherd': 'psalm-23',
  'footprints': 'footprints-poem',
  'amazing grace': 'amazing-grace',
  'ave maria': 'ave-maria',
  'hail mary': 'hail-mary',
  'our father': 'lords-prayer',
  'the lord\'s prayer': 'lords-prayer',
  'serenity prayer': 'serenity-prayer',
  'romans 8:38': 'romans-8-38',
  'corinthians 13': 'corinthians-13',
  '1 corinthians 13': 'corinthians-13',
  'revelation 21:4': 'revelation-21-4',
  'ecclesiastes 3': 'ecclesiastes-3',
  'isaiah 41:10': 'isaiah-41-10',
};

// Common memorial phrases to shorten
const PHRASE_REPLACEMENTS = {
  'in loving memory': 'ilm',
  'rest in peace': 'rip',
  'forever in our hearts': 'forever-loved',
  'beloved husband': 'husband',
  'beloved wife': 'wife',
  'beloved mother': 'mother',
  'beloved father': 'father',
  'cherished father': 'father',
  'cherished mother': 'mother',
  'loving husband': 'husband',
  'loving wife': 'wife',
  'dearly loved': 'loved',
};

/**
 * Clean and normalize text for slug generation
 */
function cleanText(text) {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/['''`]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract biblical references from text
 */
function extractBiblicalReference(text) {
  const cleaned = cleanText(text);
  
  // Check for known verses
  for (const [phrase, slug] of Object.entries(BIBLICAL_VERSES)) {
    if (cleaned.includes(phrase)) {
      return slug;
    }
  }
  
  // Pattern matching for scripture references (more comprehensive)
  const scripturePattern = /\b(genesis|exodus|leviticus|numbers|deuteronomy|joshua|judges|ruth|samuel|kings|chronicles|ezra|nehemiah|esther|job|psalm|psalms|proverbs|ecclesiastes|song|isaiah|jeremiah|lamentations|ezekiel|daniel|hosea|joel|amos|obadiah|jonah|micah|nahum|habakkuk|zephaniah|haggai|zechariah|malachi|matthew|mark|luke|john|acts|romans|corinthians|galatians|ephesians|philippians|colossians|thessalonians|timothy|titus|philemon|hebrews|james|peter|jude|revelation)\s*(\d+)?[:.]?(\d+)?/i;
  
  const match = cleaned.match(scripturePattern);
  if (match) {
    const book = match[1];
    const chapter = match[2] || '';
    const verse = match[3] || '';
    
    // Special handling for Corinthians (1 Corinthians, 2 Corinthians)
    const bookPrefix = cleaned.match(/\b([12])\s+corinthians/i);
    if (bookPrefix && book === 'corinthians') {
      return `${bookPrefix[1]}-${book}${chapter ? '-' + chapter : ''}${verse ? '-' + verse : ''}`;
    }
    
    return `${book}${chapter ? '-' + chapter : ''}${verse ? '-' + verse : ''}`;
  }
  
  return null;
}

/**
 * Extract meaningful phrases from inscriptions
 */
function extractMeaningfulPhrase(text) {
  if (!text) return null;
  
  const cleaned = cleanText(text);
  
  // Common meaningful memorial phrases (in priority order)
  const meaningfulPhrases = [
    // Biblical verse content (prioritize the verse text over the reference)
    // John 3:16
    'for god so loved the world that he gave his only begotten son',
    'for god so loved the world',
    
    // 2 Corinthians 5:8
    'absent from the body present with the lord',
    'to be absent from the body is to be present with the lord',
    
    // Psalm 23
    'the lord is my shepherd i shall not want',
    'the lord is my shepherd',
    'yea though i walk through the valley of the shadow of death',
    'though i walk through the valley',
    'he maketh me to lie down in green pastures',
    'he leadeth me beside the still waters',
    'he restoreth my soul',
    'he leadeth me in the paths of righteousness',
    'thy rod and thy staff they comfort me',
    'thou preparest a table before me',
    'in the presence of mine enemies',
    'thou anointest my head with oil',
    'my cup runneth over',
    'surely goodness and mercy shall follow me',
    'all the days of my life',
    'i will dwell in the house of the lord forever',
    'i shall dwell in the house of the lord forever',
    'and i will dwell in the house of the lord',
    'and i shall dwell in the house of the lord',
    
    // John 14:2-3
    'in my fathers house are many mansions',
    'my fathers house',
    
    // John 11:25
    'i am the resurrection and the life',
    
    // John 14:6
    'i am the way the truth and the life',
    
    // John 8:36
    'he who the son sets free is free indeed',
    'whom the son sets free is free indeed',
    'the son sets free',
    
    // Matthew 5:4
    'blessed are they that mourn for they shall be comforted',
    'blessed are they that mourn',
    'blessed are those who mourn',
    'for they shall be comforted',
    'blessed are the pure in heart',
    'blessed are the meek',
    'blessed are the merciful',
    'blessed are the peacemakers',
    
    // 1 Corinthians 13
    'love never fails',
    'love is patient love is kind',
    'faith hope and love',
    'the greatest of these is love',
    
    // Matthew 25:21
    'well done good and faithful servant',
    'well done thou good and faithful servant',
    
    // Psalm 116:15
    'precious in the sight of the lord is the death',
    'precious in the sight of the lord',
    
    // Ecclesiastes 3:1-2
    'to everything there is a season',
    'a time to be born and a time to die',
    'a time for everything',
    
    // Revelation 21:4
    'and god shall wipe away all tears from their eyes',
    'god shall wipe away all tears',
    'wipe away all tears',
    'no more death neither sorrow nor crying',
    'no more death nor sorrow',
    'no more pain',
    'no more tears',
    
    // Job 19:25
    'i know that my redeemer liveth',
    'i know that my redeemer lives',
    'my redeemer liveth',
    'my redeemer lives',
    
    // Numbers 6:24-26
    'the lord bless you and keep you',
    'the lord bless thee and keep thee',
    'make his face shine upon you',
    
    // 1 Corinthians 13:12
    'now we see through a glass darkly',
    'through a glass darkly',
    
    // Romans 8:38-39
    'nothing can separate us from the love of god',
    'neither death nor life',
    
    // Philippians 4:13
    'i can do all things through christ',
    'i can do all things through christ who strengthens me',
    
    // Isaiah 40:31
    'they that wait upon the lord shall renew their strength',
    'renew their strength',
    'mount up with wings as eagles',
    'wings as eagles',
    'wings like eagles',
    
    // Matthew 11:28
    'come unto me all ye that labour',
    'come to me all who are weary',
    'i will give you rest',
    'and i will give you rest',
    
    // Proverbs 3:5-6
    'trust in the lord with all thine heart',
    'trust in the lord with all your heart',
    'lean not on your own understanding',
    'lean not unto thine own understanding',
    
    // Jeremiah 29:11
    'i know the plans i have for you',
    'plans to prosper you',
    'plans to give you hope and a future',
    'hope and a future',
    
    // Common memorial phrases
    'gods garden',
    'in gods care',
    'in gods hands',
    'safe in the arms of jesus',
    'safe in the arms of god',
    'gods angel',
    'heaven has an angel',
    'heavens gained an angel',
    'an angel in the book of life',
    
    // Poetic/Nature memorial phrases
    'when the sunsets the stars come out to shine',
    'when the sunset the stars come out',
    'the stars come out to shine',
    'like stars in the sky',
    'dance among the stars',
    'a star in the sky',
    'your life was a blessing',
    'your life was a blessing your memory a treasure',
    'your memory a treasure',
    'those we love dont go away',
    'they walk beside us every day',
    'your wings were ready but our hearts were not',
    'too beautiful for earth',
    'god saw you getting tired',
    'a cure was not to be',
    'so he put his arms around you',
    'and whispered come to me',
    'with tearful eyes we watched you',
    'you are my sunshine',
    'may the road rise to meet you',
    'may the wind be always at your back',
    'an irish blessing',
    'sleep in heavenly peace',
    'when tomorrow starts without me',
    'do not stand at my grave and weep',
    'i am not there i do not sleep',
    'i am a thousand winds that blow',
    'if tears could build a stairway',
    'and memories a lane',
    'we would walk right up to heaven',
    'and bring you home again',
    'only the good die young',
    'the best of times the best of friends',
    'laughter and love',
    'loved beyond words',
    'missed beyond measure',
    'loved beyond words missed beyond measure',
    'a golden heart stopped beating',
    'hardworking hands at rest',
    'god broke our hearts to prove to us',
    'he only takes the best',
    'no farewell words were spoken',
    'no time to say goodbye',
    'you were gone before we knew it',
    'and only god knows why',
    
    // Character & tribute phrases
    'loved by many feared by most respected by all',
    'loved by many feared by most',
    'respected by all',
    'loved by many respected by all',
    'adored by all',
    'much loved',
    'muched loved',
    'dearly loved dearly missed',
    'unique individual',
    'one of a kind',
    'a true legend',
    'a life member',
    'forever a legend',
    'gentle soul',
    'gentle giant',
    'kind heart',
    'beautiful soul',
    'generous spirit',
    'generous cheeky inspiring',
    'cheeky inspiring',
    'a true gentleman',
    'a wonderful woman',
    'warrior spirit',
    'fought the good fight',
    'run the race',
    'kept the faith',
    'you have fought the good fight run the race and kept the faith',
    'stronger than you know',
    'braver than you believe',
    'a force of nature',
    'lived life to the fullest',
    'lived loved laughed',
    'loving father',
    'loving mother',
    'loving husband',
    'loving wife',
    'devoted husband',
    'devoted wife',
    'devoted mother',
    'devoted father',
    'cherished grandfather',
    'cherished grandmother',
    'adored great grandparents',
    'beloved son',
    'beloved daughter',
    'beloved brother',
    'beloved sister',
    'treasured friend',
    'protective uncle',
    'dedicated father',
    'dedicated mother',
    'special grandson',
    'special granddaughter',
    'wonderful dad',
    'wonderful mum',
    'amazing father',
    'amazing mother',
    'best dad ever',
    'best mum ever',
    'loving partner',
    'life partner',
    'soulmate',
    'my best friend',
    'forever friends',
    
    // Standard memorial phrases
    'forever in our hearts',
    'always in our thoughts',
    'always in our hearts',
    'gone but never forgotten',
    'gone but not forgotten',
    'deeply loved sadly missed',
    'deeply loved dearly missed',
    'until we meet again',
    'in our hearts forever',
    'memories last forever',
    'cherished memories',
    'precious memories',
    'treasured memories',
    'a life well lived',
    'rest in peace',
    'forever loved',
    'forever remembered',
    'always remembered',
    'in loving memory',
    'loved and remembered',
    'dearly loved',
    'together forever',
    'reunited in heaven',
    'at peace',
    'gone home',
    'with the angels',
    
    // Samoan memorial phrases
    'o ia keriso lea', // This is Christ
    'o le agaga o le alofa', // Spirit of love
    'tofa soifua', // Farewell/goodbye
    'manuia le malaga', // Safe journey
    'maliu i le filemu', // Rest in peace (Samoan)
    'alofa tele', // Much love
    'faafetai mo le alofa', // Thank you for the love
    'o loo tatou toe feiloai', // Until we meet again
    
    // Maori memorial phrases
    'moe mai ra', // Rest in peace (Maori)
    'haere ra', // Farewell
    'e kore koe e wareware', // You will not be forgotten
    'aroha nui', // Much love
    'kia kaha', // Stay strong
    'he taonga', // A treasure
    
    // Romanian memorial phrases (both with and without diacritics for matching)
    'aici odihneste', // Here rests (normalized)
    'nu plangeti acest mormant', // Do not weep over this grave (normalized)
    'lacrimile in zadar sunt', // Tears in vain are (normalized)
    'nu va vom uita niciodata', // We will never forget you (normalized)
    'odihneste in pace', // Rest in peace (Romanian, normalized)
    'drum lin la cer', // Smooth road to heaven
    'dumnezeu sa te odihneasca', // God rest you (normalized)
    'vesnica pomenire', // Eternal memory (normalized)
    'toti cei care trec pe langa mormantul nostru', // All who pass by our grave
    'ne gandim mereu la tine', // We always think of you
    
    // Other Pacific Island phrases
    'rest in paradise',
    'aloha', // Hawaiian love/farewell
    'rest in eternal peace',
  ];
  
  for (const phrase of meaningfulPhrases) {
    if (cleaned.includes(phrase)) {
      // Return the phrase (up to 50 chars for reasonable slug length)
      const slug = phrase.replace(/\s+/g, '-');
      if (slug.length > 50) {
        // Truncate at word boundary
        return slug.substring(0, 50).replace(/-[^-]*$/, '');
      }
      return slug;
    }
  }
  
  return null;
}

/**
 * Generate slug from design data
 */
function generateSlugFromDesign(design) {
  const parts = [];
  
  // PRIORITY 0: Add shape name first if available (NEW!)
  let shapeAdded = false;
  if (design.shapeName && design.shapeName.length > 2) {
    const cleanShape = design.shapeName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    if (cleanShape && cleanShape !== 'undefined' && cleanShape !== 'null') {
      parts.push(cleanShape);
      shapeAdded = true;
    }
  }
  
  // PRIORITY 1: Check for meaningful verse TEXT in inscriptions (higher priority than reference)
  if (design.inscriptions) {
    const meaningfulPhrase = extractMeaningfulPhrase(design.inscriptions);
    if (meaningfulPhrase) {
      // For very long phrases, this becomes the main part (it's descriptive enough)
      if (meaningfulPhrase.length > 30) {
        // Still add shape if we have it
        if (parts.length > 0) {
          return `${parts[0]}-${meaningfulPhrase}`;
        }
        return meaningfulPhrase;
      }
      parts.push(meaningfulPhrase);
    }
  }
  
  // PRIORITY 2: If no meaningful phrase, check for biblical REFERENCE in inscriptions
  if (parts.length < 2 && design.inscriptions) {
    const biblicalRef = extractBiblicalReference(design.inscriptions);
    if (biblicalRef) {
      parts.push(biblicalRef);
    }
  }
  
  // PRIORITY 3: Fallback to meaningful phrases from slug (but avoid duplicating shape)
  if (parts.length < 2) {
    // Remove shape from slug text to avoid duplication
    let slugTextForProcessing = design.slug;
    if (shapeAdded && design.shapeName) {
      const shapePattern = design.shapeName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      slugTextForProcessing = slugTextForProcessing.replace(new RegExp(shapePattern, 'gi'), '');
    }
    
    const meaningfulPhrase = extractMeaningfulPhrase(slugTextForProcessing);
    if (meaningfulPhrase) {
      if (meaningfulPhrase.length > 30 && parts.length === 0) {
        return meaningfulPhrase;
      }
      parts.push(meaningfulPhrase);
    }
  }
  
  // PRIORITY 4: Fallback to biblical references from slug or title (avoid shape duplication)
  if (parts.length < 2) {
    let slugTextForProcessing = design.slug + ' ' + (design.title || '');
    if (shapeAdded && design.shapeName) {
      const shapePattern = design.shapeName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      slugTextForProcessing = slugTextForProcessing.replace(new RegExp(shapePattern, 'gi'), '');
    }
    
    const biblicalRef = extractBiblicalReference(slugTextForProcessing);
    if (biblicalRef) {
      parts.push(biblicalRef);
    }
  }
  
  // PRIORITY 5: Add primary motifs if we don't have enough content (max 2)
  if (parts.length < 2 && design.motifNames && design.motifNames.length > 0) {
    const motifsToAdd = Math.min(2, 3 - parts.length);
    const motifs = design.motifNames
      .slice(0, motifsToAdd)
      .map(m => m.toLowerCase().replace(/[^a-z0-9]/g, '-'));
    parts.push(...motifs);
  }
  
  // PRIORITY 6: Add category if it's specific and distinctive
  if (parts.length < 2) {
    const categoryPart = design.category.replace('-memorial', '');
    const isGenericCategory = ['memorial', 'commemorative', 'dedication'].includes(categoryPart);
    
    if (!isGenericCategory && categoryPart !== 'biblical') {
      parts.push(categoryPart);
    }
  }
  
  // PRIORITY 7: If we still don't have enough parts, use cleaned slug segments (avoid shape duplication)
  if (parts.length < 2) {
    let slugText = cleanText(design.slug);
    
    // Remove shape from slug text to avoid duplication
    if (shapeAdded && design.shapeName) {
      const shapePattern = design.shapeName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      slugText = slugText.replace(new RegExp(shapePattern, 'g'), '');
    }
    
    // Check for phrase replacements
    let processedText = slugText;
    for (const [phrase, replacement] of Object.entries(PHRASE_REPLACEMENTS)) {
      processedText = processedText.replace(new RegExp(phrase, 'g'), replacement);
    }
    
    const words = processedText
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOPWORDS.has(w))
      .slice(0, 4 - parts.length);
    
    parts.push(...words);
  }
  
  // Build final slug - remove any duplicate consecutive segments
  let slug = parts
    .join('-')
    .replace(/-+/g, '-')
    .substring(0, 70) // Slightly longer to accommodate shape
    .replace(/-$/, '');
  
  // Fallback if we couldn't generate anything meaningful
  if (!slug || slug.length < 3) {
    slug = design.category;
  }
  
  return slug;
}

/**
 * Generate unique slugs with collision detection
 */
function generateUniquesSlugs() {
  const slugToDesigns = new Map(); // slug -> [design IDs]
  const designIdToSlug = new Map(); // design ID -> final slug
  const slugCounts = new Map();     // base slug -> count
  
  // First pass: generate base slugs
  for (const design of designs) {
    const baseSlug = generateSlugFromDesign(design);
    
    if (!slugToDesigns.has(baseSlug)) {
      slugToDesigns.set(baseSlug, []);
    }
    slugToDesigns.get(baseSlug).push(design.id);
  }
  
  // Second pass: handle collisions
  for (const [baseSlug, designIds] of slugToDesigns.entries()) {
    if (designIds.length === 1) {
      // No collision - use base slug
      designIdToSlug.set(designIds[0], baseSlug);
    } else {
      // Collision - disambiguate
      console.log(`  ⚠️  Collision for "${baseSlug}" (${designIds.length} designs)`);
      
      for (let i = 0; i < designIds.length; i++) {
        const designId = designIds[i];
        const design = designs.find(d => d.id === designId);
        
        let uniqueSlug;
        
        if (i === 0) {
          // First one keeps the base slug
          uniqueSlug = baseSlug;
        } else {
          // Others get disambiguated
          // Try adding product type
          const productType = design.productType;
          uniqueSlug = `${baseSlug}-${productType}`;
          
          // If still collision, add number
          let counter = 2;
          while ([...designIdToSlug.values()].includes(uniqueSlug)) {
            uniqueSlug = `${baseSlug}-${counter}`;
            counter++;
          }
        }
        
        designIdToSlug.set(designId, uniqueSlug);
      }
    }
  }
  
  return designIdToSlug;
}

// Generate unique slugs
const uniqueSlugs = generateUniquesSlugs();

// Update designs with new slugs
let updatedCount = 0;
const slugMapping = {};

for (const design of designs) {
  const newSlug = uniqueSlugs.get(design.id);
  if (newSlug && newSlug !== design.slug) {
    console.log(`  ✏️  ${design.id}: "${design.slug}" → "${newSlug}"`);
    design.slug = newSlug;
    updatedCount++;
  }
  
  // Build slug-to-ID mapping
  slugMapping[newSlug] = design.id;
}

console.log(`\n✅ Updated ${updatedCount} slugs`);
console.log(`📊 Total unique slugs: ${Object.keys(slugMapping).length}`);

// Save updated designs
fs.writeFileSync(analyzedPath, JSON.stringify(designs, null, 2));
console.log(`💾 Saved to ${analyzedPath}`);

// Save slug mapping
const mappingPath = path.join(__dirname, '../lib/slug-to-id-mapping.json');
fs.writeFileSync(mappingPath, JSON.stringify(slugMapping, null, 2));
console.log(`🗺️  Saved slug mapping to ${mappingPath}`);

// Generate statistics
const slugLengths = Object.keys(slugMapping).map(s => s.length);
const avgLength = slugLengths.reduce((a, b) => a + b, 0) / slugLengths.length;
const maxLength = Math.max(...slugLengths);
const minLength = Math.min(...slugLengths);

console.log(`\n📈 Slug Statistics:`);
console.log(`   Average length: ${avgLength.toFixed(1)} chars`);
console.log(`   Range: ${minLength}-${maxLength} chars`);
console.log(`   Unique slugs: ${Object.keys(slugMapping).length}/${designs.length}`);

// Sample outputs
console.log(`\n📝 Sample slugs:`);
Object.entries(slugMapping)
  .slice(0, 10)
  .forEach(([slug, id]) => {
    const design = designs.find(d => d.id === id);
    console.log(`   ${slug} (${design.category})`);
  });
