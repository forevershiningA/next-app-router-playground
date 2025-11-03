// scripts/generate-seo-json-split.js
// Generate smaller JSON files split by product type for better performance

const fs = require('fs');
const path = require('path');

console.log('🚀 Generating split JSON files for SEO templates...\n');

// Read the unified summary to get the data
const summaryPath = path.join(process.cwd(), 'lib/ml-unified-summary.json');
const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));

console.log(`Total designs: ${summary.totalDesigns}`);
console.log('\nProduct type breakdown:');
Object.entries(summary.productTypeBreakdown).forEach(([type, count]) => {
  console.log(`  ${type.type}: ${type.count}`);
});

// Load all data sources
const sources = [
  {
    name: 'headstonesdesigner',
    path: 'public/ml/headstonesdesigner/ml.json',
  },
  {
    name: 'forevershining',
    path: 'public/ml/forevershining/ml.json',
  },
];

let allDesigns = [];

for (const source of sources) {
  const sourcePath = path.join(process.cwd(), source.path);
  if (fs.existsSync(sourcePath)) {
    const data = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
    const designs = Array.isArray(data) ? data : [data];
    allDesigns = allDesigns.concat(designs.filter(d => d && d.design_stampid));
    console.log(`Loaded ${designs.length} from ${source.name}`);
  }
}

console.log(`\nTotal loaded: ${allDesigns.length} designs`);

// Create public/data directory
const dataDir = path.join(process.cwd(), 'public/data/designs');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Helper functions
function slugify(text) {
  if (!text) return 'memorial';
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function normalizeProductType(productName) {
  if (!productName) return 'memorial';
  const name = productName.toLowerCase();
  if (name.includes('bronze') && name.includes('plaque')) return 'bronze-plaque';
  if (name.includes('laser') && name.includes('headstone')) return 'laser-etched-headstone';
  if (name.includes('traditional') && name.includes('headstone')) return 'traditional-headstone';
  if (name.includes('laser') && name.includes('plaque')) return 'granite-plaque';
  if (name.includes('urn')) return 'memorial-urn';
  if (name.includes('plaque')) return 'memorial-plaque';
  if (name.includes('headstone')) return 'headstone';
  return 'memorial';
}

// Process and group by product type
const byProductType = {};
let totalProcessed = 0;

allDesigns.forEach(design => {
  const productType = normalizeProductType(design.product_name);
  
  if (!byProductType[productType]) {
    byProductType[productType] = [];
  }
  
  // Create simplified design object
  const simplified = {
    id: design.design_stampid,
    name: (design.design_name || 'Memorial').substring(0, 60),
    product: design.product_name,
    shape: design.design_shape || 'Standard',
    motif: design.ml_motif || 'Classic',
    width: Math.round(parseFloat(design.design_width) || 600),
    height: Math.round(parseFloat(design.design_height) || 600),
    price: parseFloat(design.design_price) || 0,
    preview: design.preview || '',
    tags: (design.ml_tags || '').substring(0, 500), // Limit to 500 chars
  };
  
  byProductType[productType].push(simplified);
  totalProcessed++;
});

console.log(`\nProcessed ${totalProcessed} designs into ${Object.keys(byProductType).length} product types`);

// Save each product type to separate JSON file
Object.entries(byProductType).forEach(([productType, designs]) => {
  const filename = `${productType}.json`;
  const filepath = path.join(dataDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(designs, null, 2));
  console.log(`✅ Saved ${designs.length} designs to ${filename} (${(fs.statSync(filepath).size / 1024).toFixed(1)} KB)`);
});

// Create index file
const index = {
  generated: new Date().toISOString(),
  total: totalProcessed,
  productTypes: Object.keys(byProductType).map(type => ({
    type,
    count: byProductType[type].length,
    file: `${type}.json`,
  })),
};

const indexPath = path.join(dataDir, 'index.json');
fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
console.log(`\n✅ Created index file: index.json`);

console.log('\n=== DONE ===');
console.log(`Files created in: public/data/designs/`);
console.log('\nYou can now fetch designs like:');
console.log('  fetch("/data/designs/bronze-plaque.json")');
console.log('  fetch("/data/designs/laser-etched-headstone.json")');
console.log('\nMuch smaller files, faster loading! 🚀\n');
