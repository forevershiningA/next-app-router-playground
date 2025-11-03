/**
 * Script to analyze and categorize saved designs from public/ml/forevershining/saved-designs/
 * This generates the SAVED_DESIGNS data for programmatic SEO
 */

const fs = require('fs');
const path = require('path');

const SAVED_DESIGNS_DIR = path.join(__dirname, '../public/ml/forevershining/saved-designs/json');
const OUTPUT_FILE = path.join(__dirname, '../lib/saved-designs-data.ts');

// Keywords to categorize designs
const CATEGORY_KEYWORDS = {
  'headstone': ['headstone', 'memorial', 'granite', 'grave', 'burial', 'cemetery marker', 'tombstone'],
  'pet-plaque': ['pet', 'dog', 'cat', 'beloved pet', 'companion', 'fur baby'],
  'dedication': ['dedicated', 'dedication', 'in honor', 'in memory', 'donated by', 'presented by'],
  'commemorative': ['commemorate', 'anniversary', 'celebration', 'milestone', 'established'],
  'cemetery-plaque': ['cemetery', 'mausoleum', 'columbarium', 'niche'],
  'urn': ['urn', 'cremation', 'ashes'],
  'garden-plaque': ['garden', 'park bench', 'tree', 'planted'],
  'inspirational': ['quote', 'prayer', 'poem', 'verse', 'inspirational'],
  'address-plaque': ['address', 'street', 'avenue', 'road', 'house number'],
  'official-plaque': ['official', 'government', 'city', 'county', 'state', 'federal'],
  'architectural': ['building', 'structure', 'erected', 'constructed', 'architect'],
  'fraternity': ['fraternity', 'sorority', 'chapter', 'brotherhood', 'sisterhood'],
  'custom-logo': ['logo', 'emblem', 'crest', 'seal', 'company'],
  'custom-photo': ['photo', 'photograph', 'picture', 'image'],
  'picture-plaque': ['portrait', 'likeness'],
  'beautification': ['beautification', 'community', 'improvement'],
  'public-art': ['sculpture', 'artwork', 'artist', 'installation'],
  'signage': ['sign', 'directional', 'wayfinding', 'entrance']
};

// Common memorial/epitaph keywords
const MEMORIAL_KEYWORDS = [
  'loving', 'beloved', 'memory', 'rest in peace', 'forever', 'always',
  'father', 'mother', 'husband', 'wife', 'son', 'daughter', 'brother', 'sister',
  'grandfather', 'grandmother', 'uncle', 'aunt', 'friend'
];

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
  const inscriptions = items
    .filter(item => item.type === 'Inscription' && item.label && item.label.trim())
    .map(item => item.label.trim())
    .filter(label => label.length > 1 && label !== ' ');
  
  return inscriptions;
}

/**
 * Categorize design based on content
 */
function categorizeDesign(designData, inscriptions) {
  const allText = inscriptions.join(' ').toLowerCase();
  const productType = (designData[0]?.type || '').toLowerCase();
  
  // Check product type first
  if (productType.includes('headstone')) {
    return 'headstone';
  }
  if (productType.includes('urn')) {
    return 'urn';
  }
  
  // Check for specific categories
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => allText.includes(keyword.toLowerCase()))) {
      return category;
    }
  }
  
  // Check if it's a memorial/dedication based on common phrases
  const hasMemorialText = MEMORIAL_KEYWORDS.some(keyword => 
    allText.includes(keyword.toLowerCase())
  );
  
  if (hasMemorialText) {
    if (productType.includes('plaque')) {
      return 'cemetery-plaque';
    }
    return 'dedication';
  }
  
  // Default based on product type
  if (productType.includes('plaque')) {
    return 'commemorative';
  }
  
  return 'dedication';
}

/**
 * Generate title and description from inscriptions
 */
function generateMetadata(inscriptions, productType) {
  // Find longest/main inscription (usually name or main text)
  const mainInscription = inscriptions
    .sort((a, b) => b.length - a.length)
    .find(text => text.length > 5 && text.length < 100);
  
  const title = mainInscription 
    ? mainInscription.split('\n')[0].substring(0, 60)
    : `${productType} Design`;
  
  // Create description from first few inscriptions
  const descParts = inscriptions.slice(0, 3).join(', ').substring(0, 150);
  const description = descParts || `Custom ${productType} with engraved inscriptions`;
  
  return { title, description };
}

/**
 * Extract keywords from inscriptions
 */
function extractKeywords(inscriptions, category, productType) {
  const keywords = new Set([category.replace('-', ' '), productType.toLowerCase()]);
  
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
 * Check if design has photo or logo
 */
function hasPhotoOrLogo(items) {
  return {
    hasPhoto: items.some(item => item.type === 'Photo' || item.type === 'Picture'),
    hasLogo: items.some(item => item.type === 'Logo' || item.type === 'Emblem')
  };
}

/**
 * Process all saved designs
 */
async function processDesigns() {
  console.log('Reading saved designs from:', SAVED_DESIGNS_DIR);
  
  const files = fs.readdirSync(SAVED_DESIGNS_DIR)
    .filter(f => f.endsWith('.json') && !f.startsWith('.'));
  
  console.log(`Found ${files.length} design files`);
  
  const designs = {};
  let processed = 0;
  let errors = 0;
  
  for (const file of files) {
    try {
      const id = path.basename(file, '.json');
      const filePath = path.join(SAVED_DESIGNS_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const designData = JSON.parse(content);
      
      if (!Array.isArray(designData) || designData.length === 0) {
        continue;
      }
      
      const productType = designData[0]?.type || 'Plaque';
      const inscriptions = extractMainText(designData);
      
      if (inscriptions.length === 0) {
        continue; // Skip designs with no inscriptions
      }
      
      const category = categorizeDesign(designData, inscriptions);
      const { title, description } = generateMetadata(inscriptions, productType);
      const keywords = extractKeywords(inscriptions, category, productType);
      const { hasPhoto, hasLogo } = hasPhotoOrLogo(designData);
      
      designs[id] = {
        id,
        category,
        slug: createSlug(title),
        title,
        description,
        productType,
        keywords,
        hasPhoto,
        hasLogo
      };
      
      processed++;
      
      if (processed % 500 === 0) {
        console.log(`Processed ${processed} designs...`);
      }
    } catch (error) {
      errors++;
      if (errors < 10) {
        console.error(`Error processing ${file}:`, error.message);
      }
    }
  }
  
  console.log(`\nProcessed: ${processed} designs`);
  console.log(`Errors: ${errors}`);
  console.log(`\nCategory distribution:`);
  
  const categoryCount = {};
  Object.values(designs).forEach(design => {
    categoryCount[design.category] = (categoryCount[design.category] || 0) + 1;
  });
  
  Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`);
    });
  
  return designs;
}

/**
 * Generate TypeScript file with data
 */
function generateTypeScriptFile(designs) {
  console.log('\nGenerating TypeScript file...');
  
  const template = fs.readFileSync(OUTPUT_FILE, 'utf8');
  
  // Find where to insert the data (replace the entire SAVED_DESIGNS const)
  const designsJson = JSON.stringify(designs, null, 2);
  
  // Match the entire SAVED_DESIGNS declaration including comments
  const pattern = /export const SAVED_DESIGNS: Record<string, SavedDesignMetadata> = \{[\s\S]*?\};/;
  
  const replacement = `export const SAVED_DESIGNS: Record<string, SavedDesignMetadata> = ${designsJson};`;
  
  const updatedContent = template.replace(pattern, replacement);
  
  fs.writeFileSync(OUTPUT_FILE, updatedContent, 'utf8');
  console.log(`Written ${Object.keys(designs).length} designs to: ${OUTPUT_FILE}`);
  
  // Check file size
  const stats = fs.statSync(OUTPUT_FILE);
  console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}

/**
 * Generate example URLs file
 */
function generateExampleUrls(designs) {
  const exampleUrlsFile = path.join(__dirname, '../SAVED_DESIGNS_URLS.md');
  
  let content = '# Saved Designs - SEO URLs\n\n';
  content += 'Generated programmatic SEO URLs for saved designs.\n\n';
  
  const categories = {};
  Object.values(designs).forEach(design => {
    if (!categories[design.category]) {
      categories[design.category] = [];
    }
    categories[design.category].push(design);
  });
  
  Object.entries(categories).forEach(([category, categoryDesigns]) => {
    content += `## ${category.replace('-', ' ').toUpperCase()}\n\n`;
    const examples = categoryDesigns.slice(0, 10);
    
    examples.forEach(design => {
      const categoryInfo = category === 'headstone' || category === 'urn' 
        ? category 
        : 'bronze-plaque';
      const url = `/select-product/${categoryInfo}/${category}/${design.slug}`;
      content += `- [${design.title}](${url})\n`;
      content += `  - ID: \`${design.id}\`\n`;
      content += `  - Description: ${design.description.substring(0, 100)}...\n`;
      content += `  - Keywords: ${design.keywords.slice(0, 5).join(', ')}\n\n`;
    });
    
    if (categoryDesigns.length > 10) {
      content += `*... and ${categoryDesigns.length - 10} more designs*\n\n`;
    }
  });
  
  fs.writeFileSync(exampleUrlsFile, content, 'utf8');
  console.log(`Example URLs written to: ${exampleUrlsFile}`);
}

// Main execution
async function main() {
  try {
    const designs = await processDesigns();
    generateTypeScriptFile(designs);
    generateExampleUrls(designs);
    console.log('\n✅ Done! Categorization complete.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
