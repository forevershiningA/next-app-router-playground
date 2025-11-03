/**
 * CORRECT categorization script
 * 
 * Structure:
 * - tf/*.json files are INDEX files that list design IDs
 * - Each tf file represents a type_style_motif combination
 * - Actual design data is in timestamp.json files
 * 
 * Example:
 * tf_0_1_24.json contains: [{ id: "1716611281932", ... }, ...]
 * 1716611281932.json contains: actual design data
 */

const fs = require('fs');
const path = require('path');

const JSON_DIR = path.join(__dirname, '../public/ml/forevershining/saved-designs/json');
const TF_DIR = path.join(JSON_DIR, 'tf');
const OUTPUT_FILE = path.join(__dirname, '../lib/saved-designs-data.ts');

// Type mapping
const TYPE_MAP = {
  '0': 'plaque',
  '1': 'headstone',
};

// Style mapping
const STYLE_MAP = {
  '0': 'bronze',
  '1': 'traditional-engraved-granite',
  '2': 'laser-etched-black-granite',
  '3': 'stainless-steel',
  '4': 'full-color',
};

// Motif to category mapping
const MOTIF_TO_CATEGORY = {
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

function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60)
    .replace(/^-+|-+$/g, '');
}

function extractInscriptions(designData) {
  if (!Array.isArray(designData)) return [];
  
  return designData
    .filter(item => item.type === 'Inscription' && item.label && item.label.trim())
    .map(item => item.label.trim())
    .filter(label => label.length > 1);
}

function generateMetadata(inscriptions, productType, category) {
  const mainText = inscriptions
    .sort((a, b) => b.length - a.length)
    .find(text => text.length > 5 && text.length < 100);
  
  const title = mainText 
    ? mainText.split('\n')[0].substring(0, 60)
    : `${productType} - ${category}`;
  
  const descParts = inscriptions.slice(0, 3).join(', ').substring(0, 150);
  const description = descParts || `Custom ${productType} with engraved inscriptions`;
  
  return { title, description };
}

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

function parseTfFilename(filename) {
  const match = filename.match(/tf_(\d+)_(\d+)_(\d+)\.json$/);
  if (!match) return null;
  
  const [, typeNum, styleNum, motifNum] = match;
  const productType = TYPE_MAP[typeNum] || 'plaque';
  const style = STYLE_MAP[styleNum] || 'bronze';
  const category = MOTIF_TO_CATEGORY[motifNum] || 'commemorative';
  
  return { productType, style, category, motifNum };
}

async function main() {
  console.log('Reading tf index files...');
  
  const tfFiles = fs.readdirSync(TF_DIR)
    .filter(f => f.endsWith('.json') && f.startsWith('tf_'));
  
  console.log(`Found ${tfFiles.length} tf index files`);
  
  const designs = {};
  let processed = 0;
  let errors = 0;
  let notFound = 0;
  
  for (const tfFile of tfFiles) {
    try {
      // Parse tf filename to get category info
      const categoryInfo = parseTfFilename(tfFile);
      if (!categoryInfo) continue;
      
      // Read the tf index file
      const tfPath = path.join(TF_DIR, tfFile);
      const indexData = JSON.parse(fs.readFileSync(tfPath, 'utf8'));
      
      if (!Array.isArray(indexData)) continue;
      
      // Process each design ID in the index
      for (const entry of indexData) {
        const designId = entry.id;
        const designPath = path.join(JSON_DIR, `${designId}.json`);
        
        // Check if actual design file exists
        if (!fs.existsSync(designPath)) {
          notFound++;
          continue;
        }
        
        try {
          // Read actual design data
          const designData = JSON.parse(fs.readFileSync(designPath, 'utf8'));
          
          if (!Array.isArray(designData) || designData.length === 0) {
            continue;
          }
          
          // Extract inscriptions from design
          const inscriptions = extractInscriptions(designData);
          
          if (inscriptions.length === 0) {
            continue;
          }
          
          const { productType, style, category } = categoryInfo;
          const { title, description } = generateMetadata(inscriptions, productType, category);
          const keywords = extractKeywords(inscriptions, category, productType, style);
          
          designs[designId] = {
            id: designId,
            category,
            slug: createSlug(title),
            title,
            description,
            productType,
            style,
            keywords,
            hasPhoto: designData.some(item => item.type === 'Photo' || item.type === 'Picture'),
            hasLogo: designData.some(item => item.type === 'Logo' || item.type === 'Emblem'),
          };
          
          processed++;
          
          if (processed % 500 === 0) {
            console.log(`Processed ${processed} designs...`);
          }
        } catch (err) {
          errors++;
        }
      }
    } catch (error) {
      console.error(`Error processing ${tfFile}:`, error.message);
    }
  }
  
  console.log(`\n=== RESULTS ===`);
  console.log(`Processed: ${processed} designs`);
  console.log(`Not found: ${notFound} design files`);
  console.log(`Errors: ${errors}`);
  
  // Generate stats
  const categoryCount = {};
  const styleCount = {};
  
  Object.values(designs).forEach(design => {
    categoryCount[design.category] = (categoryCount[design.category] || 0) + 1;
    styleCount[design.style] = (styleCount[design.style] || 0) + 1;
  });
  
  console.log('\n=== Category Distribution ===');
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
  
  // Generate TypeScript file
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
  
  console.log('\n✅ Done!');
}

main().catch(console.error);
