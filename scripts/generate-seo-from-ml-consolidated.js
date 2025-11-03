// scripts/generate-seo-from-ml-consolidated.js
// Parse consolidated ML data and generate SEO templates
// Uses the ml.json file that consolidates all 1,178 designs

const fs = require('fs');
const path = require('path');

console.log('🚀 Generating SEO templates from ML data...\n');

// Read the consolidated ML file
const mlPath = path.join(process.cwd(), 'public/ml/headstonesdesigner/ml.json');
console.log(`Reading: ${mlPath}`);

if (!fs.existsSync(mlPath)) {
  console.error('❌ ml.json not found!');
  console.log('Run the PHP script to generate it first: public/ml/headstonesdesigner/generate_file.php');
  process.exit(1);
}

const mlData = JSON.parse(fs.readFileSync(mlPath, 'utf8'));
console.log(`✅ Loaded ${mlData.length} designs\n`);

// Analysis
const stats = {
  shapes: new Set(),
  motifs: new Set(),
  products: new Set(),
  languages: new Set(),
  styles: new Set(),
  types: new Set(),
};

mlData.forEach(design => {
  if (design.design_shape) stats.shapes.add(design.design_shape);
  if (design.ml_motif) stats.motifs.add(design.ml_motif);
  if (design.product_name) stats.products.add(design.product_name);
  if (design.ml_language) stats.languages.add(design.ml_language);
  if (design.ml_style) stats.styles.add(design.ml_style);
  if (design.ml_type) stats.types.add(design.ml_type);
});

console.log('=== STATISTICS ===');
console.log(`Total Designs: ${mlData.length}`);
console.log(`Unique Shapes: ${stats.shapes.size}`);
console.log(`Unique Motifs: ${stats.motifs.size}`);
console.log(`Unique Products: ${stats.products.size}`);
console.log(`Languages: ${stats.languages.size}`);
console.log(`Styles: ${stats.styles.size}`);
console.log(`Types: ${stats.types.size}`);

console.log('\n=== SHAPES ===');
console.log([...stats.shapes].sort().join(', '));

console.log('\n=== MOTIFS ===');
console.log([...stats.motifs].sort().join(', '));

console.log('\n=== PRODUCTS ===');
console.log([...stats.products].sort().join(', '));

// Generate templates
console.log('\n=== GENERATING TEMPLATES ===');

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractNameAndInscription(tags, designName) {
  if (!tags) {
    return {
      primaryName: designName || 'Memorial',
      inscription: 'In loving memory',
    };
  }
  
  // Try to extract meaningful text
  const lines = tags
    .split(/\s{2,}|\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);
  
  const primaryName = lines[0]?.substring(0, 60) || designName || 'Memorial';
  const inscription = lines.slice(1, 3).join(' ').substring(0, 120) || 'In loving memory';
  
  return { primaryName, inscription };
}

const templates = mlData.map((design, index) => {
  const { primaryName, inscription } = extractNameAndInscription(
    design.ml_tags,
    design.design_name
  );
  
  const shape = design.design_shape || 'Standard';
  const motif = design.ml_motif || 'Classic';
  const width = Math.round(parseFloat(design.design_width) || 600);
  const height = Math.round(parseFloat(design.design_height) || 600);
  
  const slug = `${slugify(shape)}-${slugify(motif)}-${design.design_stampid}`;
  
  return {
    id: `ml-${design.design_stampid}`,
    stampId: design.design_stampid,
    slug: slug,
    productName: design.product_name,
    shape: shape,
    motif: motif,
    width: width,
    height: height,
    orientation: design.design_orientation || 'landscape',
    primaryName: primaryName.trim(),
    inscription: inscription.trim(),
    tags: design.ml_tags,
    price: parseFloat(design.design_price) || 0,
    preview: design.preview,
    texture: design.design_texture,
    language: design.ml_language || 'English',
    style: design.ml_style || 'Laser Etched',
    type: design.ml_type || 'Headstone',
    metadata: {
      title: `${shape} ${motif} Headstone - ${primaryName.substring(0, 40)}`,
      description: `${shape} shaped headstone with ${motif} motif. ${width}×${height}mm. ${design.ml_style}. Professional memorial design.`,
      keywords: [
        `${shape.toLowerCase()} headstone`,
        `${motif.toLowerCase()} memorial`,
        `${width}mm headstone`,
        design.ml_style?.toLowerCase() || 'memorial',
        design.ml_type?.toLowerCase() || 'headstone',
      ],
    },
  };
});

console.log(`✅ Generated ${templates.length} templates`);

// Group templates
const groupedByShape = templates.reduce((acc, t) => {
  if (!acc[t.shape]) acc[t.shape] = [];
  acc[t.shape].push(t);
  return acc;
}, {});

const groupedByMotif = templates.reduce((acc, t) => {
  if (!acc[t.motif]) acc[t.motif] = [];
  acc[t.motif].push(t);
  return acc;
}, {});

const groupedBySize = templates.reduce((acc, t) => {
  const sizeKey = `${t.width}x${t.height}`;
  if (!acc[sizeKey]) acc[sizeKey] = [];
  acc[sizeKey].push(t);
  return acc;
}, {});

console.log('\n=== GROUPED DATA ===');
console.log(`Shapes: ${Object.keys(groupedByShape).length} groups`);
console.log(`Motifs: ${Object.keys(groupedByMotif).length} groups`);
console.log(`Sizes: ${Object.keys(groupedBySize).length} unique size combinations`);

// Top combinations
console.log('\n=== TOP COMBINATIONS ===');
Object.entries(groupedByShape)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 5)
  .forEach(([shape, designs]) => {
    console.log(`  ${shape}: ${designs.length} designs`);
  });

Object.entries(groupedByMotif)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 5)
  .forEach(([motif, designs]) => {
    console.log(`  ${motif}: ${designs.length} designs`);
  });

// Save TypeScript file
const outputPath = path.join(process.cwd(), 'lib/seo-templates-ml.ts');

const tsContent = `// Auto-generated from ML data
// Generated: ${new Date().toISOString()}
// Total designs: ${templates.length}
// Data source: public/ml/headstonesdesigner/ml.json

export type MLTemplate = {
  id: string;
  stampId: string;
  slug: string;
  productName: string;
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
  shapes: ${stats.shapes.size},
  motifs: ${stats.motifs.size},
  products: ${stats.products.size},
};

// Grouped data
export const templatesByShape: Record<string, MLTemplate[]> = ${JSON.stringify(groupedByShape, null, 2)};

export const templatesByMotif: Record<string, MLTemplate[]> = ${JSON.stringify(groupedByMotif, null, 2)};

export const templatesBySize: Record<string, MLTemplate[]> = ${JSON.stringify(groupedBySize, null, 2)};

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

export function getTemplatesByShape(shape: string): MLTemplate[] {
  return templatesByShape[shape] || [];
}

export function getTemplatesByMotif(motif: string): MLTemplate[] {
  return templatesByMotif[motif] || [];
}

export function getAllShapes(): string[] {
  return Object.keys(templatesByShape).sort();
}

export function getAllMotifs(): string[] {
  return Object.keys(templatesByMotif).sort();
}
`;

fs.writeFileSync(outputPath, tsContent);
console.log(`\n✅ Saved to: ${outputPath}`);

// Save JSON summary for quick reference
const summaryPath = path.join(process.cwd(), 'lib/ml-summary.json');
const summary = {
  generated: new Date().toISOString(),
  totalDesigns: templates.length,
  statistics: {
    shapes: [...stats.shapes].sort(),
    motifs: [...stats.motifs].sort(),
    products: [...stats.products].sort(),
    languages: [...stats.languages].sort(),
    styles: [...stats.styles].sort(),
    types: [...stats.types].sort(),
  },
  topCombinations: {
    byShape: Object.entries(groupedByShape)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 10)
      .map(([shape, designs]) => ({ shape, count: designs.length })),
    byMotif: Object.entries(groupedByMotif)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 10)
      .map(([motif, designs]) => ({ motif, count: designs.length })),
  },
};

fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
console.log(`✅ Summary saved to: ${summaryPath}`);

console.log('\n=== DONE ===');
console.log(`\n🎉 You now have ${templates.length} SEO templates ready to deploy!`);
console.log('\nNext steps:');
console.log('1. Review lib/seo-templates-ml.ts');
console.log('2. Create route: app/designs/[shape]/[motif]/[slug]/page.tsx');
console.log('3. Use these real designs for SEO pages');
console.log(`4. Deploy and index ${templates.length}+ pages!\n`);
