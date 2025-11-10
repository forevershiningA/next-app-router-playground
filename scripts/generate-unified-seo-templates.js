// scripts/generate-unified-seo-templates.js
// Parse ALL ML data from all 3 domains and create unified SEO templates
// Combines: headstonesdesigner, forevershining, bronze-plaque

const fs = require('fs');
const path = require('path');

console.log('🚀 Generating Unified SEO Templates from ALL domains...\n');

// Define all data sources
const sources = [
  {
    name: 'headstonesdesigner',
    path: 'public/ml/headstonesdesigner/ml.json',
    domain: 'headstonesdesigner.com'
  },
  {
    name: 'forevershining',
    path: 'public/ml/forevershining/ml.json',
    domain: 'forevershining.com.au'
  },
  {
    name: 'bronze-plaque',
    path: 'public/ml/bronze-plaque/ml.json',
    domain: 'bronze-plaque.com'
  }
];

// Load all data
let allDesigns = [];
const sourceStats = {};

for (const source of sources) {
  const sourcePath = path.join(process.cwd(), source.path);
  
  if (fs.existsSync(sourcePath)) {
    const data = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
    
    // Handle both array and single object formats
    let designs = Array.isArray(data) ? data : [data];
    
    // Filter out invalid/empty designs
    designs = designs.filter(d => d && d.design_stampid);
    
    console.log(`✅ ${source.name}: ${designs.length} designs`);
    
    // Add source info to each design
    const designsWithSource = designs.map(d => ({
      ...d,
      _source: source.name,
      _domain: source.domain
    }));
    
    allDesigns = allDesigns.concat(designsWithSource);
    sourceStats[source.name] = designs.length;
  } else {
    console.log(`⚠️  ${source.name}: ml.json not found at ${sourcePath}`);
    sourceStats[source.name] = 0;
  }
}

console.log(`\n📊 Total Designs: ${allDesigns.length}\n`);

// Analysis
const stats = {
  shapes: new Set(),
  motifs: new Set(),
  products: new Set(),
  productTypes: {},
  styles: new Set(),
  types: new Set(),
};

allDesigns.forEach(design => {
  if (design.design_shape) stats.shapes.add(design.design_shape);
  if (design.ml_motif) stats.motifs.add(design.ml_motif);
  if (design.product_name) stats.products.add(design.product_name);
  if (design.ml_style) stats.styles.add(design.ml_style);
  if (design.ml_type) stats.types.add(design.ml_type);
});

console.log('=== STATISTICS ===');
console.log(`Total Designs: ${allDesigns.length}`);
console.log(`Unique Shapes: ${stats.shapes.size}`);
console.log(`Unique Motifs: ${stats.motifs.size}`);
console.log(`Unique Products: ${stats.products.size}`);
console.log(`Styles: ${stats.styles.size}`);
console.log(`Types: ${stats.types.size}`);

// Helper functions
function slugify(text) {
  if (!text) return 'memorial';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
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

function extractNameAndInscription(tags, designName) {
  if (!tags) {
    return {
      primaryName: designName || 'Memorial',
      inscription: 'In loving memory',
    };
  }
  
  const lines = tags
    .split(/\n{2,}|\s{4,}/)
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .slice(0, 10);
  
  const primaryName = lines[0]?.substring(0, 60) || designName || 'Memorial';
  const inscription = lines.slice(1, 3).join(' ').substring(0, 120) || 'In loving memory';
  
  return { primaryName, inscription };
}

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
  
  // Skip if it looks like a name (all caps, short)
  if (/^[A-Z\s&']{2,30}$/.test(line) && line.split(' ').length <= 3) return true;
  if (/^(mr|mrs|ms|miss|dr|rev|sr|jr)\s/i.test(line)) return true;
  
  // Skip family relationship counts
  if (/^(mother|father|wife|husband|son|daughter|nanna|grandma|papa)\s+of\s+\d+/i.test(line)) return true;
  
  return false;
}

function isMeaningfulText(line) {
  const words = line.trim().split(/\s+/);
  if (words.length < 2) return false;
  if (line.length < 10 || line.length > 150) return false;
  
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

function extractMeaningfulSlugText(tags, motif) {
  if (!tags) {
    return motif ? slugify(motif).substring(0, 50) : 'memorial';
  }
  
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
    const match = tags.match(pattern);
    if (match) {
      const phrase = match[0].trim();
      const slugText = slugify(phrase).substring(0, 60);
      return slugText;
    }
  }
  
  // PRIORITY 2: Look for meaningful lines
  const lines = tags
    .split(/\n{1,}|\s{2,}/)
    .map(l => l.trim())
    .filter(l => l.length > 3);
  
  const meaningfulLines = [];
  for (const line of lines) {
    if (shouldSkipLine(line)) continue;
    if (isMeaningfulText(line)) {
      meaningfulLines.push(line);
    }
  }
  
  // Combine meaningful lines (up to 2-3 lines)
  if (meaningfulLines.length > 0) {
    const combined = meaningfulLines.slice(0, 3).join(' ').substring(0, 120);
    const slugText = slugify(combined).substring(0, 60);
    if (slugText && slugText.length > 10) {
      return slugText;
    }
  }
  
  // PRIORITY 3: Common memorial phrases
  const commonPhrases = [
    /always\s+in\s+our\s+hearts/i,
    /forever\s+in\s+our\s+hearts/i,
    /rest\s+in\s+peace/i,
    /in\s+god'?s\s+hands/i,
    /beloved\s+(wife|husband|mother|father)/i,
    /loving\s+(mother|father|wife|husband)/i,
  ];
  
  for (const pattern of commonPhrases) {
    const match = tags.match(pattern);
    if (match) {
      return slugify(match[0]).substring(0, 40);
    }
  }
  
  // Fallback to motif or memorial
  return motif ? slugify(motif).substring(0, 50) : 'memorial';
}

function createCategory(design, productType) {
  if (productType === 'bronze-plaque') {
    return slugify(design.ml_motif || 'dedication');
  }
  if (productType.includes('headstone')) {
    const shape = slugify(design.design_shape);
    const motif = slugify(design.ml_motif);
    return `${shape}-${motif}`;
  }
  if (productType.includes('plaque')) {
    const orientation = design.design_orientation || 'landscape';
    const motif = slugify(design.ml_motif);
    return `${orientation}-${motif}`;
  }
  return 'memorial';
}

// Generate templates
console.log('\n=== GENERATING TEMPLATES ===');

const templates = allDesigns.map((design, index) => {
  const { primaryName, inscription } = extractNameAndInscription(
    design.ml_tags,
    design.design_name
  );
  
  const productType = normalizeProductType(design.product_name);
  const category = createCategory(design, productType);
  const shape = design.design_shape || 'Standard';
  const motif = design.ml_motif || 'Classic';
  const width = Math.round(parseFloat(design.design_width) || 600);
  const height = Math.round(parseFloat(design.design_height) || 600);
  
  // Generate SEO-friendly slug: stampId_meaningful-description
  const meaningfulText = extractMeaningfulSlugText(design.ml_tags, motif);
  const slug = `${design.design_stampid}_${meaningfulText}`;
  
  // Track product types
  if (!stats.productTypes[productType]) {
    stats.productTypes[productType] = 0;
  }
  stats.productTypes[productType]++;
  
  // Create SEO-optimized metadata with meaningful inscription
  const metaTitle = meaningfulText && meaningfulText !== slugify(motif).substring(0, 50)
    ? `${shape} ${motif} ${design.ml_type || 'Memorial'} - ${meaningfulText.replace(/-/g, ' ').substring(0, 50)}`
    : `${shape} ${motif} ${design.ml_type || 'Memorial'} - ${primaryName.substring(0, 40)}`;
  
  const metaDescription = meaningfulText && meaningfulText !== slugify(motif).substring(0, 50)
    ? `${shape} ${design.ml_type?.toLowerCase() || 'memorial'} with ${motif} motif featuring "${meaningfulText.replace(/-/g, ' ')}". ${width}×${height}mm. ${design.ml_style || 'Custom design'}. Professional craftsmanship.`
    : `${shape} ${design.ml_type?.toLowerCase() || 'memorial'} with ${motif} motif. ${width}×${height}mm. ${design.ml_style || 'Custom design'}. Professional craftsmanship.`;
  
  return {
    id: `ml-${design.design_stampid}`,
    stampId: design.design_stampid,
    source: design._source,
    domain: design._domain,
    slug: slug,
    productName: design.product_name,
    productType: productType,
    category: category,
    shape: shape,
    motif: motif,
    width: width,
    height: height,
    orientation: design.design_orientation || 'landscape',
    primaryName: primaryName.trim(),
    inscription: inscription.trim(),
    tags: design.ml_tags || '',
    price: parseFloat(design.design_price) || 0,
    preview: design.preview || '',
    texture: design.design_texture || '',
    language: design.ml_language || 'English',
    style: design.ml_style || 'Custom',
    type: design.ml_type || 'Memorial',
    metadata: {
      title: metaTitle,
      description: metaDescription,
      keywords: [
        `${shape.toLowerCase()} ${design.ml_type?.toLowerCase() || 'memorial'}`,
        `${motif.toLowerCase()} motif`,
        `${width}mm memorial`,
        design.ml_style?.toLowerCase() || 'custom memorial',
        productType,
      ],
    },
  };
});

console.log(`✅ Generated ${templates.length} templates`);

// Group by product type
const groupedByProduct = templates.reduce((acc, t) => {
  if (!acc[t.productType]) acc[t.productType] = [];
  acc[t.productType].push(t);
  return acc;
}, {});

const groupedByCategory = templates.reduce((acc, t) => {
  const key = `${t.productType}/${t.category}`;
  if (!acc[key]) acc[key] = [];
  acc[key].push(t);
  return acc;
}, {});

const groupedBySource = templates.reduce((acc, t) => {
  if (!acc[t.source]) acc[t.source] = [];
  acc[t.source].push(t);
  return acc;
}, {});

console.log('\n=== PRODUCT TYPE BREAKDOWN ===');
Object.entries(stats.productTypes)
  .sort((a, b) => b[1] - a[1])
  .forEach(([type, count]) => {
    console.log(`  ${type}: ${count} designs`);
  });

console.log('\n=== SOURCE BREAKDOWN ===');
Object.entries(groupedBySource).forEach(([source, designs]) => {
  console.log(`  ${source}: ${designs.length} designs`);
});

console.log('\n=== TOP CATEGORIES ===');
Object.entries(groupedByCategory)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 10)
  .forEach(([category, designs]) => {
    console.log(`  ${category}: ${designs.length} designs`);
  });

// Save TypeScript file
const outputPath = path.join(process.cwd(), 'lib/seo-templates-unified.ts');

const tsContent = `// Auto-generated from ALL ML data sources
// Generated: ${new Date().toISOString()}
// Total designs: ${templates.length}
// Sources: ${Object.keys(sourceStats).join(', ')}

export type MLTemplate = {
  id: string;
  stampId: string;
  source: string;
  domain: string;
  slug: string;
  productName: string;
  productType: string;
  category: string;
  shape: string;
  motif: string;
  width: number;
  height: number;
  orientation: string;
  primaryName: string;
  inscription: string;
  tags: string;
  price: number;
  preview: string;
  texture: string;
  language: string;
  style: string;
  type: string;
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
};

export const mlTemplates: MLTemplate[] = ${JSON.stringify(templates, null, 2)};

// Statistics
export const mlStats = {
  totalDesigns: ${templates.length},
  sources: ${JSON.stringify(sourceStats, null, 2)},
  shapes: ${stats.shapes.size},
  motifs: ${stats.motifs.size},
  products: ${stats.products.size},
  productTypes: ${JSON.stringify(stats.productTypes, null, 2)},
};

// Grouped data
export const templatesByProductType: Record<string, MLTemplate[]> = ${JSON.stringify(groupedByProduct, null, 2)};

export const templatesByCategory: Record<string, MLTemplate[]> = ${JSON.stringify(groupedByCategory, null, 2)};

export const templatesBySource: Record<string, MLTemplate[]> = ${JSON.stringify(groupedBySource, null, 2)};

// Helper functions
export function getMLTemplate(id: string): MLTemplate | null {
  return mlTemplates.find(t => t.id === id) || null;
}

export function getMLTemplateByStampId(stampId: string): MLTemplate | null {
  return mlTemplates.find(t => t.stampId === stampId) || null;
}

export function getMLTemplateBySlug(slug: string): MLTemplate | null {
  return mlTemplates.find(t => t.slug === slug) || null;
}

export function getTemplatesByProductType(productType: string): MLTemplate[] {
  return templatesByProductType[productType] || [];
}

export function getTemplatesByCategory(category: string): MLTemplate[] {
  return templatesByCategory[category] || [];
}

export function getTemplatesBySource(source: string): MLTemplate[] {
  return templatesBySource[source] || [];
}

export function getAllProductTypes(): string[] {
  return Object.keys(templatesByProductType).sort();
}

export function getAllCategories(): string[] {
  return Object.keys(templatesByCategory).sort();
}

export function getCategoriesForProductType(productType: string): string[] {
  const categories = Object.keys(templatesByCategory)
    .filter(cat => cat.startsWith(productType + '/'))
    .map(cat => cat.replace(productType + '/', ''));
  return categories.sort();
}
`;

fs.writeFileSync(outputPath, tsContent);
console.log(`\n✅ Saved to: ${outputPath}`);

// Save JSON summary
const summaryPath = path.join(process.cwd(), 'lib/ml-unified-summary.json');
const summary = {
  generated: new Date().toISOString(),
  totalDesigns: templates.length,
  sources: sourceStats,
  statistics: {
    shapes: [...stats.shapes].sort(),
    motifs: [...stats.motifs].sort(),
    products: [...stats.products].sort(),
    styles: [...stats.styles].sort(),
    types: [...stats.types].sort(),
    productTypes: stats.productTypes,
  },
  topCategories: Object.entries(groupedByCategory)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 20)
    .map(([category, designs]) => ({ category, count: designs.length })),
  productTypeBreakdown: Object.entries(groupedByProduct)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([type, designs]) => ({ type, count: designs.length })),
};

fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
console.log(`✅ Summary saved to: ${summaryPath}`);

console.log('\n=== DONE ===');
console.log(`\n🎉 You now have ${templates.length} unified SEO templates ready!`);
console.log('\nBreakdown by source:');
Object.entries(sourceStats).forEach(([source, count]) => {
  console.log(`  - ${source}: ${count} designs`);
});
console.log('\nNext steps:');
console.log('1. Review lib/seo-templates-unified.ts');
console.log('2. Update routes to use unified templates');
console.log('3. Deploy and index ' + templates.length + '+ pages!');
console.log('4. Watch organic traffic explode! 🚀\n');
