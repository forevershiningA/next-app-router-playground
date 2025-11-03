/**
 * Enhanced script to categorize saved designs using filename patterns and content analysis
 * Handles both main json directory (timestamp-based) and tf directory (pre-categorized)
 */

const fs = require('fs');
const path = require('path');

const MAIN_JSON_DIR = path.join(__dirname, '../public/ml/forevershining/saved-designs/json');
const TF_DIR = path.join(MAIN_JSON_DIR, 'tf');
const OUTPUT_FILE = path.join(__dirname, '../lib/saved-designs-data.ts');

// Filename pattern mapping for tf directory
// tf_{type}_{style}_{motif}.json

const TYPE_MAP = {
  '0': 'plaque',     // Bronze plaques
  '1': 'headstone',  // Traditional/Laser Etched Granite
  '2': 'headstone',  // Headstone variants
  '3': 'plaque',     // Stainless Steel
  '4': 'plaque',     // Full Color
  '5': 'plaque',     // Other plaques
};

const STYLE_MAP = {
  '0': 'bronze',
  '1': 'traditional-engraved-granite',
  '2': 'laser-etched-black-granite',
  '3': 'stainless-steel',
  '4': 'full-color',
};

// Motif categories mapping to our design categories
const MOTIF_TO_CATEGORY = {
  // Animals
  '0': 'pet-plaque',          // Aquatic
  '1': 'pet-plaque',          // Birds
  '2': 'pet-plaque',          // Butterflies
  '3': 'pet-plaque',          // Cats
  '4': 'pet-plaque',          // Dogs
  '5': 'pet-plaque',          // Farm Animals
  '6': 'pet-plaque',          // Horses
  '7': 'pet-plaque',          // Insects
  '8': 'commemorative',       // Mythical Animals
  '9': 'commemorative',       // Prehistoric
  '10': 'pet-plaque',         // Reptiles
  '11': 'pet-plaque',         // World Animals
  '12': 'garden-plaque',      // Australian Wildlife
  '13': 'garden-plaque',      // Australian Flora
  '14': 'architectural',      // Architectural
  '15': 'commemorative',      // Arrows
  '16': 'picture-plaque',     // Borders
  '17': 'commemorative',      // Cartoons
  '18': 'picture-plaque',     // Corners
  '19': 'commemorative',      // Children's Toys
  '20': 'commemorative',      // Ornaments
  '21': 'picture-plaque',     // Flourishes
  '22': 'garden-plaque',      // Flowers
  '23': 'commemorative',      // Food & Drink
  '24': 'dedication',         // Hearts
  '25': 'commemorative',      // History
  '26': 'commemorative',      // Festivals
  '27': 'commemorative',      // Household Items
  '28': 'commemorative',      // Islander
  '29': 'commemorative',      // Iconic Places
  '30': 'inspirational',      // Moon & Stars
  '31': 'commemorative',      // Music & Dance
  '32': 'commemorative',      // Nautical
  '33': 'official-plaque',    // Official
  '34': 'pet-plaque',         // Pets
  '35': 'garden-plaque',      // Plants & Trees
  '36': 'commemorative',      // Religious
  '37': 'picture-plaque',     // Shapes & Patterns
  '38': 'commemorative',      // Skulls & Weapons
  '39': 'commemorative',      // Sport & Fitness
  '40': 'commemorative',      // Symbols & Zodiac
  '41': 'picture-plaque',     // Text
  '42': 'commemorative',      // Tools & Office
  '43': 'commemorative',      // Tribal
  '44': 'commemorative',      // USA
  '45': 'commemorative',      // Vehicles
};

/**
 * Parse tf filename to get category info
 */
function parseTfFilename(filename) {
  const match = filename.match(/tf_(\d+)_(\d+)_(\d+)\.json$/);
  if (!match) return null;
  
  const [, typeNum, styleNum, motifNum] = match;
  const productType = TYPE_MAP[typeNum] || 'plaque';
  const style = STYLE_MAP[styleNum] || 'bronze';
  const category = MOTIF_TO_CATEGORY[motifNum] || 'commemorative';
  
  return { productType, style, category, motifNum };
}

/**
 * Create URL-friendly slug from text
 */
function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60)
    .replace(/^-+|-+$/g, '');
}

/**
 * Extract main text from inscriptions
 */
function extractMainText(items) {
  if (!Array.isArray(items)) {
    // Handle tf format with metadata
    if (items.productData && Array.isArray(items.productData)) {
      items = items.productData;
    } else {
      return [];
    }
  }
  
  const inscriptions = items
    .filter(item => item.type === 'Inscription' && item.label && item.label.trim())
    .map(item => item.label.trim())
    .filter(label => label.length > 1 && label !== ' ');
  
  return inscriptions;
}

/**
 * Generate title and description from inscriptions
 */
function generateMetadata(inscriptions, productType, category) {
  const mainInscription = inscriptions
    .sort((a, b) => b.length - a.length)
    .find(text => text.length > 5 && text.length < 100);
  
  const title = mainInscription 
    ? mainInscription.split('\n')[0].substring(0, 60)
    : `${productType} - ${category}`;
  
  const descParts = inscriptions.slice(0, 3).join(', ').substring(0, 150);
  const description = descParts || `Custom ${productType} with engraved inscriptions`;
  
  return { title, description };
}

/**
 * Extract keywords from inscriptions
 */
function extractKeywords(inscriptions, category, productType, style) {
  const keywords = new Set([category.replace('-', ' '), productType, style]);
  
  inscriptions.forEach(text => {
    const words = text.toLowerCase().split(/\s+/);
    words.forEach(word => {
      if (word.length > 3 && !['with', 'from', 'this', 'that', 'these', 'those'].includes(word)) {
        keywords.add(word);
      }
    });
  });
  
  return Array.from(keywords).slice(0, 10);
}

/**
 * Process tf directory designs (pre-categorized)
 */
async function processTfDesigns() {
  console.log('Processing tf directory (pre-categorized designs)...');
  
  const files = fs.readdirSync(TF_DIR)
    .filter(f => f.endsWith('.json') && f.startsWith('tf_'));
  
  console.log(`Found ${files.length} tf design files`);
  
  const designs = {};
  let processed = 0;
  let errors = 0;
  
  for (const file of files) {
    try {
      const filePath = path.join(TF_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const designData = JSON.parse(content);
      
      // Parse filename for category info
      const fileInfo = parseTfFilename(file);
      if (!fileInfo) continue;
      
      const { productType, style, category } = fileInfo;
      
      // Get ID from data or filename
      const id = designData.id || file.replace('.json', '');
      
      // Extract inscriptions
      const inscriptions = extractMainText(designData.productData || designData);
      
      const { title, description } = generateMetadata(inscriptions, productType, category);
      const keywords = extractKeywords(inscriptions, category, productType, style);
      
      designs[id] = {
        id,
        category,
        slug: createSlug(title),
        title,
        description,
        productType,
        style,
        keywords,
        hasPhoto: false,
        hasLogo: false,
        source: 'tf'
      };
      
      processed++;
      
      if (processed % 100 === 0) {
        console.log(`Processed ${processed} tf designs...`);
      }
    } catch (error) {
      errors++;
      if (errors < 10) {
        console.error(`Error processing ${file}:`, error.message);
      }
    }
  }
  
  return { designs, processed, errors };
}

/**
 * Process main JSON directory (timestamp-based)
 */
async function processMainDesigns() {
  console.log('\nProcessing main json directory (timestamp-based designs)...');
  
  const files = fs.readdirSync(MAIN_JSON_DIR)
    .filter(f => f.endsWith('.json') && !f.startsWith('tf_') && /^\d+\.json$/.test(f));
  
  console.log(`Found ${files.length} main design files`);
  
  const designs = {};
  let processed = 0;
  let errors = 0;
  
  for (const file of files.slice(0, 1000)) { // Limit to 1000 for now
    try {
      const id = path.basename(file, '.json');
      const filePath = path.join(MAIN_JSON_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const designData = JSON.parse(content);
      
      if (!Array.isArray(designData) || designData.length === 0) {
        continue;
      }
      
      const productTypeItem = designData[0];
      const productType = (productTypeItem?.type || 'plaque').toLowerCase();
      const inscriptions = extractMainText(designData);
      
      if (inscriptions.length === 0) {
        continue;
      }
      
      // Default to headstone if type is headstone, otherwise commemorative
      const category = productType.includes('headstone') ? 'headstone' : 'commemorative';
      
      const { title, description } = generateMetadata(inscriptions, productType, category);
      const keywords = extractKeywords(inscriptions, category, productType, 'traditional');
      
      designs[id] = {
        id,
        category,
        slug: createSlug(title),
        title,
        description,
        productType,
        keywords,
        hasPhoto: false,
        hasLogo: false,
        source: 'main'
      };
      
      processed++;
      
      if (processed % 200 === 0) {
        console.log(`Processed ${processed} main designs...`);
      }
    } catch (error) {
      errors++;
      if (errors < 10) {
        console.error(`Error processing ${file}:`, error.message);
      }
    }
  }
  
  return { designs, processed, errors };
}

/**
 * Generate TypeScript file with data
 */
function generateTypeScriptFile(designs) {
  console.log('\nGenerating TypeScript file...');
  
  const template = fs.readFileSync(OUTPUT_FILE, 'utf8');
  
  const designsJson = JSON.stringify(designs, null, 2);
  
  const pattern = /export const SAVED_DESIGNS: Record<string, SavedDesignMetadata> = \{[\s\S]*?\};/;
  
  const replacement = `export const SAVED_DESIGNS: Record<string, SavedDesignMetadata> = ${designsJson};`;
  
  const updatedContent = template.replace(pattern, replacement);
  
  fs.writeFileSync(OUTPUT_FILE, updatedContent, 'utf8');
  console.log(`Written ${Object.keys(designs).length} designs to: ${OUTPUT_FILE}`);
  
  const stats = fs.statSync(OUTPUT_FILE);
  console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}

/**
 * Generate stats report
 */
function generateStats(designs) {
  console.log('\n=== Category Distribution ===');
  
  const categoryCount = {};
  const styleCount = {};
  const sourceCount = { tf: 0, main: 0 };
  
  Object.values(designs).forEach(design => {
    categoryCount[design.category] = (categoryCount[design.category] || 0) + 1;
    if (design.style) {
      styleCount[design.style] = (styleCount[design.style] || 0) + 1;
    }
    if (design.source) {
      sourceCount[design.source]++;
    }
  });
  
  Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`);
    });
  
  console.log('\n=== Style Distribution ===');
  Object.entries(styleCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([style, count]) => {
      console.log(`  ${style}: ${count}`);
    });
  
  console.log('\n=== Source Distribution ===');
  console.log(`  tf (pre-categorized): ${sourceCount.tf}`);
  console.log(`  main (timestamp): ${sourceCount.main}`);
}

// Main execution
async function main() {
  try {
    // Process both directories
    const tfResult = await processTfDesigns();
    const mainResult = await processMainDesigns();
    
    // Combine results
    const allDesigns = {
      ...tfResult.designs,
      ...mainResult.designs
    };
    
    console.log(`\n=== TOTALS ===`);
    console.log(`TF Designs: ${tfResult.processed} (${tfResult.errors} errors)`);
    console.log(`Main Designs: ${mainResult.processed} (${mainResult.errors} errors)`);
    console.log(`Total: ${Object.keys(allDesigns).length} designs`);
    
    generateStats(allDesigns);
    generateTypeScriptFile(allDesigns);
    
    console.log('\n✅ Done! Enhanced categorization complete.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
