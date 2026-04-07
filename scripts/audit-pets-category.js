#!/usr/bin/env node
/**
 * Analyze Pets category designs to separate human memorials from actual pet memorials.
 *
 * Uses two classification strategies:
 *   1. Text analysis — inscription keywords, name patterns, lifespan heuristics
 *   2. Image analysis — TensorFlow.js MobileNet on screenshot JPGs (optional, --with-images)
 *
 * Usage:
 *   node scripts/audit-pets-category.js                 # text-only analysis + report
 *   node scripts/audit-pets-category.js --with-images   # also run image classification
 *   node scripts/audit-pets-category.js --apply          # apply reclassification to saved-designs-data.ts
 */

const fs = require('fs');
const path = require('path');

// ── CLI flags ────────────────────────────────────────────────────────────────
const WITH_IMAGES = process.argv.includes('--with-images');
const APPLY = process.argv.includes('--apply');

const DATA_FILE = path.join(__dirname, '..', 'lib', 'saved-designs-data.ts');
const REPORT_FILE = path.join(__dirname, '..', 'database-exports', 'pets-audit-report.json');

// ── 1. Parse saved-designs-data.ts ──────────────────────────────────────────

function parsePetsDesigns() {
  const content = fs.readFileSync(DATA_FILE, 'utf-8');
  const designs = [];

  // Match full design blocks that have productName "Pets"
  // Each block looks like:  "1673880911330": { ... },
  const blockRe = /"(\d+)":\s*\{([^}]*"productName":\s*"Pets"[^}]*)\}/g;
  let m;
  while ((m = blockRe.exec(content)) !== null) {
    const id = m[1];
    const block = m[2];
    const field = (name) => {
      const r = new RegExp(`"${name}":\\s*"([^"]*)"`, 's');
      const fm = block.match(r);
      return fm ? fm[1] : '';
    };
    const boolField = (name) => {
      const r = new RegExp(`"${name}":\\s*(true|false)`);
      const fm = block.match(r);
      return fm ? fm[1] === 'true' : false;
    };
    const arrayField = (name) => {
      const r = new RegExp(`"${name}":\\s*\\[([^\\]]*)\\]`);
      const fm = block.match(r);
      if (!fm) return [];
      return fm[1].match(/"([^"]*)"/g)?.map(s => s.replace(/"/g, '')) || [];
    };

    designs.push({
      id,
      productId: field('productId'),
      productName: field('productName'),
      productType: field('productType'),
      productSlug: field('productSlug'),
      category: field('category'),
      slug: field('slug'),
      title: field('title'),
      inscriptions: field('inscriptions').replace(/&apos;/g, "'").replace(/&amp;/g, '&'),
      shapeName: field('shapeName'),
      preview: field('preview'),
      mlDir: field('mlDir'),
      hasPhoto: boolField('hasPhoto'),
      hasMotifs: boolField('hasMotifs'),
      motifNames: arrayField('motifNames'),
    });
  }

  return designs;
}

// ── 2. Text-based classification ────────────────────────────────────────────

// Human family-relationship words (strong signal for human memorial)
const HUMAN_RELATIONSHIP_RE = /\b(husband|wife|mother|father|mum|mummy|daddy|dad|son|daughter|brother|sister|grandad|grandfather|grandmother|nanna|nana|grandma|grandpa|gran|pop|uncle|aunt|auntie|fiancee?|partner|nephew|niece|parents?|grandparents?|great[- ]?grand)\b/i;

// Human memorial phrases
const HUMAN_PHRASE_RE = /\b(beloved\s+(husband|wife|mother|father|son|daughter|parents?)|cherished\s+(mother|father|husband|wife|son|daughter|parents?)|dearest\s+(mum|dad|mother|father)|much\s+loved\s+(mother|father|husband|wife|son|daughter)|loving\s+(husband|wife|mother|father)|resting\s+in\s+the\s+arms\s+of\s+the\s+lord|till\s+we\s+meet\s+again|gone\s+but\s+never\s+forgotten|sadly\s+missed\s+by|deeply\s+missed\s+by|forever\s+in\s+our\s+hearts\s+and\s+minds)\b/i;

// Pet-specific words (strong signal for pet memorial)
const PET_WORDS_RE = /\b(dog|puppy|pup|cat|kitten|kitty|horse|pony|equine|canine|feline|parrot|rabbit|bunny|hamster|guinea\s+pig|goldfish|tortoise|turtle|bird|cockatiel|budgie|pet|paw|paws|paw\s*prints?|rainbow\s+bridge|fur\s*baby|furry|waggy\s+tail|best\s+friend|faithful\s+companion|loyal\s+companion|good\s+boy|good\s+girl|good\s+dog|best\s+dog|best\s+cat|play\s+fetch|chasing\s+squirrels|treats|walkies|meow|woof|bark|purr|hoof\s*prints?|mane|breed|kennel|cattery|veterinar|vet\b|ship'?s?\s+cat)\b/i;

// Normalize a 2-digit or 4-digit year string to a full 4-digit year
function normalizeYear(s) {
  const n = parseInt(s, 10);
  if (n >= 100) return n; // already 4-digit
  return n >= 25 ? 1900 + n : 2000 + n; // 25-99 → 19xx, 00-24 → 20xx
}

// Extract year pairs from text. Supports 4-digit AND 2-digit years.
// Uses lazy matching to find nearest chronological pairs.
function extractYearPairs(text) {
  const results = [];
  // 4-digit years (lazy to find nearest pairs)
  const fourDigit = text.matchAll(/\b(19\d{2}|20[012]\d)\b[\s\S]{0,50}?\b(19\d{2}|20[012]\d)\b/g);
  for (const match of fourDigit) {
    const y1 = parseInt(match[1]);
    const y2 = parseInt(match[2]);
    if (y2 > y1) results.push({ span: y2 - y1, y1, y2 });
  }
  // 2-digit year patterns like "02/26/69 - 08/13/24" or "25/12/48-03/06/24"
  const twoDigit = text.matchAll(/\b\d{1,2}[\/\-.]\d{1,2}[\/\-.](\d{2})\b[\s\S]{0,30}?\b\d{1,2}[\/\-.]\d{1,2}[\/\-.](\d{2})\b/g);
  for (const match of twoDigit) {
    const y1 = normalizeYear(match[1]);
    const y2 = normalizeYear(match[2]);
    if (y2 > y1) results.push({ span: y2 - y1, y1, y2 });
  }
  return results;
}

// Detect human-typical lifespan (20+ years between dates)
function hasHumanLifespan(text) {
  for (const pair of extractYearPairs(text)) {
    if (pair.span >= 20 && pair.span <= 120) return pair;
  }
  return null;
}

// Detect pet-typical lifespan (1-19 years between dates, chronological only)
function hasPetLifespan(text) {
  for (const pair of extractYearPairs(text)) {
    if (pair.span >= 1 && pair.span <= 19) return pair;
  }
  return null;
}

// Count full human names (First Last pattern, mixed-case and ALL-CAPS)
function countFullHumanNames(text) {
  const excludeWords = new Set(['IN', 'LOVING', 'MEMORY', 'OF', 'REST', 'PEACE', 'THE', 'AND', 'FOR',
    'OUR', 'FOREVER', 'HEARTS', 'ALWAYS', 'BELOVED', 'MISSED', 'TILL', 'WE', 'MEET',
    'GOD', 'LORD', 'HEAVEN', 'ANGEL', 'AMEN', 'PSALM', 'WITH', 'HIS', 'HER', 'THEIR',
    'BORN', 'DIED', 'AGED', 'YEARS', 'FROM', 'LOVE', 'YOUR', 'GONE', 'BEST', 'EVER',
    'ALSO', 'THAT', 'THIS', 'NOT', 'BUT', 'JUST', 'THEY', 'WERE', 'WILL', 'HAVE', 'HAD',
    'DEAR', 'MUCH', 'VERY', 'MOST', 'DEEPLY', 'SADLY', 'SACRED', 'ETERNAL', 'HOLY',
    'NATIONAL', 'MEMORIAL', 'CITY', 'WEST', 'EAST', 'NORTH', 'SOUTH', 'SIDE',
    'BRIGHT', 'CARING', 'TALENTED', 'GENEROUS', 'GUTSY', 'LADY', 'ARTIST',
    'BRONZE', 'PLAQUE', 'CHROME', 'DESKTOP', 'OPERA', 'FIREFOX', 'MOZILLA',
    'LASER', 'ETCHED', 'BLACK', 'GRANITE', 'HEADSTONE', 'MINI', 'ROCK', 'PET',
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST',
    'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']);
  let count = 0;

  // Extract all capitalized words (3+ letters, mixed-case)
  const words = [];
  const wordRe = /\b([A-Z][a-z]{2,})\b/g;
  let m;
  while ((m = wordRe.exec(text)) !== null) {
    words.push({ word: m[1], index: m.index, upper: m[1].toUpperCase() });
  }

  // Find consecutive non-excluded word pairs
  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i], w2 = words[i + 1];
    if (!excludeWords.has(w1.upper) && !excludeWords.has(w2.upper)) {
      // Check words are close together (< 5 chars gap)
      const gap = w2.index - (w1.index + w1.word.length);
      if (gap <= 5) {
        count++;
        i++; // skip next word to avoid double-counting
      }
    }
  }

  // ALL-CAPS names: "NANCY ELAINE WOODLEY" (3+ consecutive capitalized words of 3+ letters)
  const capsRe = /\b([A-Z]{3,})\s+([A-Z]{3,})(?:\s+([A-Z]{3,}))?\b/g;
  while ((m = capsRe.exec(text)) !== null) {
    const w1 = m[1], w2 = m[2];
    if (!excludeWords.has(w1) && !excludeWords.has(w2)) {
      count++;
    }
  }

  return count;
}

// Detect "In Loving Memory [of] [Full Name]" pattern — strong human indicator
function hasMemorialNamePattern(text) {
  return /in\s+loving\s+memory\s+of\s+[A-Z][a-z]+\s+[A-Z][a-z]/i.test(text)
    || /in\s+memory\s+of\s+[A-Z][a-z]+\s+[A-Z][a-z]/i.test(text)
    || /in\s+loving\s+memory\s+[A-Z][a-z]{2,}\s+[A-Z][a-z]{2,}/i.test(text);
}

// Detect human-specific descriptor words
const HUMAN_DESCRIPTORS_RE = /\b(lady|gentleman|artist|veteran|soldier|dr\.?|doctor|nurse|teacher|coach|minister|pastor|reverend|rev\.?|sgt|cpl|capt|lieutenant|corporal|sergeant|private|major|colonel|general)\b/i;

// Check for "Aged XX years" pattern (human-specific)
function hasAgedPattern(text) {
  return /\baged?\s+\d{2,3}\s*(years?|yrs?)?\b/i.test(text);
}

function classifyByText(design) {
  const text = design.inscriptions || '';
  const reasons = [];
  let humanScore = 0;
  let petScore = 0;

  // Check pet words (strong pet signal)
  const petMatch = text.match(PET_WORDS_RE);
  if (petMatch) {
    petScore += 4;
    reasons.push(`pet-word: "${petMatch[0]}"`);
  }

  // Check human relationships (strong human signal)
  const relMatch = text.match(HUMAN_RELATIONSHIP_RE);
  if (relMatch) {
    humanScore += 4;
    reasons.push(`human-relationship: "${relMatch[0]}"`);
  }

  // Check human phrases
  const phraseMatch = text.match(HUMAN_PHRASE_RE);
  if (phraseMatch) {
    humanScore += 2;
    reasons.push(`human-phrase: "${phraseMatch[0]}"`);
  }

  // "In Loving Memory of [Full Name]" pattern
  if (hasMemorialNamePattern(text)) {
    humanScore += 3;
    reasons.push('memorial-name-pattern');
  }

  // Human descriptor words
  const descMatch = text.match(HUMAN_DESCRIPTORS_RE);
  if (descMatch) {
    humanScore += 2;
    reasons.push(`human-descriptor: "${descMatch[0]}"`);
  }

  // Check lifespan
  const humanLife = hasHumanLifespan(text);
  if (humanLife) {
    humanScore += 4;
    reasons.push(`human-lifespan: ${humanLife.span}yr (${humanLife.y1}-${humanLife.y2})`);
  }
  const petLife = hasPetLifespan(text);
  if (petLife) {
    petScore += 2;
    reasons.push(`pet-lifespan: ${petLife.span}yr (${petLife.y1}-${petLife.y2})`);
  }

  // Check "Aged XX" pattern (humans only)
  if (hasAgedPattern(text)) {
    humanScore += 4;
    reasons.push('aged-pattern');
  }

  // Full human names count — strong when no pet words present
  const nameCount = countFullHumanNames(text);
  if (nameCount >= 3) {
    humanScore += 4;
    reasons.push(`many-names: ${nameCount}`);
  } else if (nameCount >= 2) {
    // 2+ human names without pet words → strong human signal
    humanScore += (petScore === 0 ? 3 : 2);
    reasons.push(`full-names: ${nameCount}`);
  } else if (nameCount === 1 && petScore === 0) {
    humanScore += 1;
    reasons.push(`name: ${nameCount}`);
  }

  // Single 4-digit birth year with a name but no pet words → likely human
  const singleYear = text.match(/\b(19[2-9]\d|20[01]\d)\b/);
  if (singleYear && nameCount >= 1 && petScore === 0) {
    humanScore += 2;
    reasons.push(`name+year: ${singleYear[0]}`);
  }

  // Pet motif names — weak signal only (many human memorials have pet motifs)
  const petMotifs = ['paw', 'paw_001', 'paw_print', 'pawprint'];
  const hasPetMotif = design.motifNames.some(n =>
    petMotifs.some(pm => n.toLowerCase().includes(pm))
  );
  if (hasPetMotif) {
    petScore += 1;
    reasons.push(`pet-motif: ${design.motifNames.join(',')}`);
  }

  // Category-based scoring (reduced weight — categories are unreliable)
  const humanCategories = ['wife-memorial', 'father-memorial', 'mother-memorial', 'husband-memorial',
    'son-memorial', 'daughter-memorial', 'brother-memorial', 'sister-memorial', 'doctor-memorial',
    'military-veteran', 'nurse-memorial', 'teacher-memorial', 'child-memorial', 'baby-memorial'];
  if (humanCategories.includes(design.category)) {
    humanScore += 2;
    reasons.push(`human-category: ${design.category}`);
  }

  // Pet-memorial category — only boost if no human signals detected
  if (design.category === 'pet-memorial' && humanScore === 0) {
    petScore += 1;
    reasons.push('pet-memorial-category');
  }

  // Tiny/empty inscriptions → classify as test/placeholder, not ambiguous
  if (text.length < 10) {
    reasons.push('short-inscription');
  }

  // Test/placeholder designs (won't show meaningful content either way)
  const trimmed = text.trim();
  const isTest = /^\s*(test|testing|this\s+is\s+a\s+test)\b/i.test(trimmed)
    || /^\s*(my\s+dog\s*\d*|碑文|フォント|placeholder|DYO\s+Testing)\s*$/i.test(trimmed)
    || /^[a-z\s,;.]{0,60}$/i.test(trimmed) && !/[A-Z][a-z]{2,}\s+[A-Z][a-z]{2,}/.test(trimmed) && trimmed.length < 30
    || /^(test\s*)+$/i.test(trimmed)
    || trimmed.length === 0
    || trimmed === '\\'
    || /^(sfs|qwd|rdty|dsaf|ahes|one\s+three|changed\s+\d|Full-colour)/.test(trimmed)
    || /愛を込めて|碑文\s*フォント/i.test(trimmed)
    || /^In\s+Loving\s+Memor(y|ay)\s*(of\s*\d+)?$/i.test(trimmed)
    || /^In\s+Loving\s+Memory$/i.test(trimmed)
    || /^RIP\s*\d{4}$/i.test(trimmed)
    || /in\s+loving\s+memory\s+stest/i.test(trimmed)
    || /name\s+surname\s+date\s+year/i.test(trimmed)
    || /in\s+loving\s+memoray\s+of\s+\d+$/i.test(trimmed);

  // Also detect demo/sample designs with only generic phrases and no real names
  const genericPhraseOnly = humanScore === 0 && petScore === 0 && nameCount === 0
    && /^(In\s+Loving\s+Memory|Beloved|Dearly\s+loved|So\s+loved|Adored|Devoted|Dance\s+on|Love\s+is\s+enough|She\s+walked\s+in\s+beauty|An\s+inspiration|Remembered\s+with\s+love|Until\s+we\s+meet|Generous\s+of\s+heart|Loved\s+and\s+remembered|Laser-Etched|Bronze\s+Plaque|Chrome|Mozilla|Opera|desktop|Ben\b|\s|\\|\n|[,.\-–—])*$/i.test(trimmed);

  const isTestOrGeneric = isTest || genericPhraseOnly;
  if (isTestOrGeneric) {
    reasons.push(isTest ? 'test-placeholder' : 'generic-demo');
  }

  // Compute classification
  let classification;
  if (isTestOrGeneric) {
    classification = 'test';
  } else if (humanScore > petScore && humanScore >= 3) {
    classification = 'human';
  } else if (petScore > humanScore && petScore >= 3) {
    classification = 'pet';
  } else if (humanScore > petScore) {
    classification = 'likely-human';
  } else if (petScore > humanScore) {
    classification = 'likely-pet';
  } else if (humanScore === 0 && petScore === 0) {
    classification = 'ambiguous';
  } else {
    classification = 'ambiguous';
  }

  return {
    classification,
    humanScore,
    petScore,
    reasons,
  };
}

// ── 3. Image-based classification (optional) ────────────────────────────────

async function classifyByImage(design) {
  if (!WITH_IMAGES) return null;

  const imgPath = path.join(__dirname, '..', 'public', design.preview);
  if (!fs.existsSync(imgPath)) {
    return { classification: 'no-image', confidence: 0, labels: [] };
  }

  try {
    // Lazy-load TensorFlow.js and MobileNet
    const tf = require('@tensorflow/tfjs-node');
    const mobilenet = require('@tensorflow-models/mobilenet');

    const imageBuffer = fs.readFileSync(imgPath);
    const decoded = tf.node.decodeImage(imageBuffer, 3);
    const model = await mobilenet.load({ version: 2, alpha: 1.0 });
    const predictions = await model.classify(decoded);
    decoded.dispose();

    // Check predictions for human vs animal categories
    const humanLabels = ['person', 'man', 'woman', 'face', 'people', 'portrait',
      'baby', 'child', 'boy', 'girl', 'human'];
    const petLabels = ['dog', 'cat', 'horse', 'bird', 'fish', 'rabbit', 'hamster',
      'parrot', 'pony', 'kitten', 'puppy', 'golden retriever', 'labrador',
      'german shepherd', 'tabby', 'persian cat', 'siamese cat', 'collie',
      'poodle', 'terrier', 'beagle', 'bulldog', 'pug', 'corgi'];

    let hasHuman = false;
    let hasPet = false;
    const labels = predictions.map(p => `${p.className} (${(p.probability * 100).toFixed(1)}%)`);

    for (const pred of predictions) {
      const name = pred.className.toLowerCase();
      if (humanLabels.some(h => name.includes(h)) && pred.probability > 0.1) {
        hasHuman = true;
      }
      if (petLabels.some(p => name.includes(p)) && pred.probability > 0.1) {
        hasPet = true;
      }
    }

    return {
      classification: hasHuman ? 'human' : hasPet ? 'pet' : 'uncertain',
      confidence: predictions[0]?.probability || 0,
      labels,
    };
  } catch (err) {
    return { classification: 'error', confidence: 0, labels: [err.message] };
  }
}

// ── 4. Determine appropriate new category for human designs ─────────────────

function determineNewCategory(design) {
  const text = (design.inscriptions || '').toLowerCase();

  // Already has a meaningful human category — keep it
  if (['wife-memorial', 'father-memorial', 'mother-memorial', 'husband-memorial',
       'son-memorial', 'daughter-memorial', 'brother-memorial', 'sister-memorial',
       'military-veteran', 'doctor-memorial', 'nurse-memorial', 'teacher-memorial',
       'child-memorial', 'baby-memorial'].includes(design.category)) {
    return design.category;
  }

  // Try to infer a better category from inscription content
  if (/\b(wife|mum|mother|mama)\b/i.test(text)) return 'mother-memorial';
  if (/\b(husband|dad|father|papa)\b/i.test(text)) return 'father-memorial';
  if (/\b(son)\b/i.test(text)) return 'son-memorial';
  if (/\b(daughter)\b/i.test(text)) return 'daughter-memorial';
  if (/\b(brother)\b/i.test(text)) return 'brother-memorial';
  if (/\b(sister)\b/i.test(text)) return 'sister-memorial';
  if (/\b(baby|infant|stillborn|angel\s+baby)\b/i.test(text)) return 'baby-memorial';
  if (/\b(psalm|lord|god|heaven|bible|scripture|faith|grace|eternal\s+rest|2\s+timothy|corinthians)\b/i.test(text)) return 'religious-memorial';
  if (/\bbible|psalm\s+\d/i.test(text)) return 'biblical-memorial';
  if (/\b(butterfly|butterflies)\b/i.test(text)) return 'butterfly-memorial';
  if (/\bin\s+loving\s+memory\b/i.test(text)) return 'in-loving-memory';
  if (/\brest\s+in\s+peace\b/i.test(text)) return 'rest-in-peace';

  return 'memorial'; // generic fallback for humans
}

// Determine the correct productName/productSlug/productType for reclassified designs
function determineNewProduct(design) {
  // Map Pets product back to the most appropriate real product
  // based on the design's characteristics
  const isPlaque = design.productType === 'plaque';
  if (isPlaque) {
    // Bronze plaque
    return { productId: '5', productName: 'Bronze Plaque', productSlug: 'bronze-plaque', productType: 'plaque' };
  }
  // Headstone — use Laser-etched Black Granite (most common headstone product)
  return { productId: '4', productName: 'Laser-etched Black Granite Headstone', productSlug: 'laser-etched-headstone', productType: 'headstone' };
}

// ── 5. Apply reclassification to saved-designs-data.ts ──────────────────────

function applyReclassification(reclassifications) {
  let content = fs.readFileSync(DATA_FILE, 'utf-8');
  let changeCount = 0;

  for (const item of reclassifications) {
    const { id, newCategory, newProduct } = item;

    // Replace category
    const catRe = new RegExp(
      `("${id}":\\s*\\{[^}]*"category":\\s*)"([^"]*)"`,
      's'
    );
    if (catRe.test(content)) {
      content = content.replace(catRe, `$1"${newCategory}"`);
    }

    // Replace productName
    const pnRe = new RegExp(
      `("${id}":\\s*\\{[^}]*"productName":\\s*)"([^"]*)"`,
      's'
    );
    if (pnRe.test(content)) {
      content = content.replace(pnRe, `$1"${newProduct.productName}"`);
    }

    // Replace productSlug
    const psRe = new RegExp(
      `("${id}":\\s*\\{[^}]*"productSlug":\\s*)"([^"]*)"`,
      's'
    );
    if (psRe.test(content)) {
      content = content.replace(psRe, `$1"${newProduct.productSlug}"`);
    }

    // Replace productType
    const ptRe = new RegExp(
      `("${id}":\\s*\\{[^}]*"productType":\\s*)"([^"]*)"`,
      's'
    );
    if (ptRe.test(content)) {
      content = content.replace(ptRe, `$1"${newProduct.productType}"`);
    }

    // Replace productId
    const piRe = new RegExp(
      `("${id}":\\s*\\{[^}]*"productId":\\s*)"([^"]*)"`,
      's'
    );
    if (piRe.test(content)) {
      content = content.replace(piRe, `$1"${newProduct.productId}"`);
    }

    changeCount++;
  }

  fs.writeFileSync(DATA_FILE, content, 'utf-8');
  return changeCount;
}

// ── 6. Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     Pets Category Audit — Human vs Pet Classification   ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // Parse designs
  const allPets = parsePetsDesigns();
  console.log(`Found ${allPets.length} designs with productName "Pets"\n`);

  // Classify each design
  const results = [];
  for (const design of allPets) {
    const textResult = classifyByText(design);
    let imageResult = null;

    if (WITH_IMAGES && design.hasPhoto) {
      imageResult = await classifyByImage(design);
    }

    // Combine text + image signals
    let finalClassification = textResult.classification;
    if (imageResult && imageResult.classification !== 'uncertain' && imageResult.classification !== 'error') {
      // Image can override ambiguous text classification
      if (textResult.classification === 'ambiguous') {
        finalClassification = imageResult.classification === 'human' ? 'likely-human' : 'likely-pet';
      }
      // Image can strengthen text classification
      if (textResult.classification.includes('human') && imageResult.classification === 'human') {
        finalClassification = 'human';
      }
      if (textResult.classification.includes('pet') && imageResult.classification === 'pet') {
        finalClassification = 'pet';
      }
    }

    results.push({
      id: design.id,
      category: design.category,
      classification: finalClassification,
      textResult,
      imageResult,
      inscriptions: (design.inscriptions || '').substring(0, 200),
      hasPhoto: design.hasPhoto,
      preview: design.preview,
      motifNames: design.motifNames,
    });
  }

  // Group by classification
  const groups = { human: [], 'likely-human': [], pet: [], 'likely-pet': [], ambiguous: [], test: [] };
  for (const r of results) {
    (groups[r.classification] || groups.ambiguous).push(r);
  }

  // Print summary
  console.log('── Classification Summary ──────────────────────────────────');
  console.log(`  Human (definite):    ${groups.human.length}`);
  console.log(`  Likely human:        ${groups['likely-human'].length}`);
  console.log(`  Pet (definite):      ${groups.pet.length}`);
  console.log(`  Likely pet:          ${groups['likely-pet'].length}`);
  console.log(`  Ambiguous:           ${groups.ambiguous.length}`);
  console.log(`  Test/placeholder:    ${groups.test.length}`);
  console.log();

  // Print human designs
  const humanDesigns = [...groups.human, ...groups['likely-human']];
  console.log(`── Human Memorials to Reclassify (${humanDesigns.length}) ─────────────────`);
  for (const r of humanDesigns) {
    const newCat = determineNewCategory(allPets.find(d => d.id === r.id));
    console.log(`  ${r.id} | ${r.classification.padEnd(13)} | ${r.category.padEnd(20)} → ${newCat.padEnd(20)} | ${r.inscriptions.substring(0, 80)}`);
  }
  console.log();

  // Print ambiguous designs for manual review
  if (groups.ambiguous.length > 0) {
    console.log(`── Ambiguous — Manual Review Needed (${groups.ambiguous.length}) ───────────`);
    for (const r of groups.ambiguous) {
      console.log(`  ${r.id} | photo: ${r.hasPhoto ? 'YES' : 'no '} | cat: ${r.category.padEnd(20)} | ${r.inscriptions.substring(0, 80)}`);
    }
    console.log();
  }

  // Print pet designs that stay
  console.log(`── Confirmed Pet Memorials (${groups.pet.length + groups['likely-pet'].length}) ─────────────────────`);
  for (const r of [...groups.pet, ...groups['likely-pet']].slice(0, 15)) {
    console.log(`  ${r.id} | ${r.classification.padEnd(11)} | ${r.inscriptions.substring(0, 80)}`);
  }
  if (groups.pet.length + groups['likely-pet'].length > 15) {
    console.log(`  ... and ${groups.pet.length + groups['likely-pet'].length - 15} more`);
  }
  console.log();

  // Build reclassification list
  const reclassifications = humanDesigns.map(r => {
    const design = allPets.find(d => d.id === r.id);
    return {
      id: r.id,
      oldCategory: r.category,
      newCategory: determineNewCategory(design),
      newProduct: determineNewProduct(design),
      reasons: r.textResult.reasons,
    };
  });

  // Save report
  const report = {
    generatedAt: new Date().toISOString(),
    totalPetsDesigns: allPets.length,
    summary: {
      human: groups.human.length,
      likelyHuman: groups['likely-human'].length,
      pet: groups.pet.length,
      likelyPet: groups['likely-pet'].length,
      ambiguous: groups.ambiguous.length,
      test: groups.test.length,
    },
    reclassifications,
    ambiguousForReview: groups.ambiguous.map(r => ({
      id: r.id,
      category: r.category,
      hasPhoto: r.hasPhoto,
      preview: r.preview,
      inscriptions: r.inscriptions,
      motifNames: r.motifNames,
      reasons: r.textResult.reasons,
    })),
    confirmedPets: [...groups.pet, ...groups['likely-pet']].map(r => ({
      id: r.id,
      category: r.category,
      reasons: r.textResult.reasons,
    })),
  };

  fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true });
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  console.log(`Report saved to: ${REPORT_FILE}`);

  // Apply changes if --apply flag
  if (APPLY) {
    console.log(`\n── Applying ${reclassifications.length} reclassifications ────────────────`);
    const changed = applyReclassification(reclassifications);
    console.log(`  ✅ Updated ${changed} designs in saved-designs-data.ts`);
    console.log(`  Reclassified from "Pets" → appropriate product/category`);
  } else {
    console.log(`\nTo apply changes, run:  node scripts/audit-pets-category.js --apply`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
