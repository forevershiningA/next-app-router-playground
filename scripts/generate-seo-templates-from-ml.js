// scripts/generate-seo-templates-from-ml.js
// Parse ML data and generate SEO templates from real user designs

const fs = require('fs');
const path = require('path');

const mlDir = path.join(process.cwd(), 'public/ml/headstonesdesigner');
const files = fs.readdirSync(mlDir).filter(f => f.startsWith('ml_') && f.endsWith('.json'));

console.log(`Found ${files.length} saved designs`);

const designs = [];
const shapes = new Set();
const motifs = new Set();
const names = new Set();

// Parse all designs
for (const file of files.slice(0, 100)) { // Process first 100 for now
  try {
    const data = JSON.parse(fs.readFileSync(path.join(mlDir, file), 'utf8'));
    
    designs.push({
      id: data.design_stampid,
      productName: data.product_name,
      shape: data.design_shape,
      texture: data.design_texture,
      width: parseFloat(data.design_width),
      height: parseFloat(data.design_height),
      designName: data.design_name,
      motif: data.ml_motif,
      tags: data.ml_tags,
      price: data.design_price,
      preview: data.preview,
    });
    
    shapes.add(data.design_shape);
    motifs.add(data.ml_motif);
    if (data.design_name) names.add(data.design_name);
    
  } catch (e) {
    console.error(`Error parsing ${file}:`, e.message);
  }
}

console.log('\n=== Statistics ===');
console.log(`Designs parsed: ${designs.length}`);
console.log(`Unique shapes: ${shapes.size}`);
console.log(`Unique motifs: ${motifs.size}`);
console.log(`Unique names: ${names.size}`);

console.log('\n=== Shapes ===');
console.log([...shapes].sort().join(', '));

console.log('\n=== Motifs ===');
console.log([...motifs].sort().join(', '));

console.log('\n=== Sample Designs ===');
designs.slice(0, 10).forEach(d => {
  console.log(`\nDesign: ${d.designName}`);
  console.log(`  Shape: ${d.shape}, Motif: ${d.motif}`);
  console.log(`  Size: ${Math.round(d.width)}x${Math.round(d.height)}mm`);
  console.log(`  Price: $${d.price}`);
  if (d.tags) console.log(`  Text: ${d.tags.substring(0, 80)}...`);
});

// Generate TypeScript templates
console.log('\n=== Generating SEO Templates ===');

const templates = [];

designs.forEach((design, index) => {
  const slug = `${design.shape.toLowerCase().replace(/\s+/g, '-')}-${design.motif.toLowerCase().replace(/\s+/g, '-')}-${design.id}`;
  
  // Extract name from tags or use design name
  let primaryName = design.designName || 'Memorial';
  let inscription = '';
  
  if (design.tags) {
    // Try to extract name and dates
    const lines = design.tags.split(/\s{2,}|\n/).filter(l => l.trim());
    if (lines.length > 0) {
      primaryName = lines[0].substring(0, 50);
      inscription = lines.slice(1, 3).join(' ').substring(0, 100);
    }
  }
  
  templates.push({
    id: `ml-${design.id}`,
    slug: slug,
    shape: design.shape,
    motif: design.motif,
    width: Math.round(design.width),
    height: Math.round(design.height),
    primaryName: primaryName.trim(),
    inscription: inscription.trim() || 'In loving memory',
    price: design.price,
    preview: design.preview,
    metadata: {
      title: `${design.shape} Headstone with ${design.motif} - ${primaryName}`,
      description: `${design.shape} shaped headstone featuring ${design.motif} motif. ${Math.round(design.width)}mm x ${Math.round(design.height)}mm. Professional laser etching.`,
      keywords: [
        design.shape.toLowerCase() + ' headstone',
        design.motif.toLowerCase() + ' memorial',
        'laser etched headstone',
        'custom memorial',
      ],
    },
  });
});

console.log(`Generated ${templates.length} templates`);

// Save to file
const outputPath = path.join(process.cwd(), 'lib/seo-templates-ml.ts');
const tsContent = `// Auto-generated from ML data
// ${new Date().toISOString()}
// Total designs: ${templates.length}

export type MLTemplate = {
  id: string;
  slug: string;
  shape: string;
  motif: string;
  width: number;
  height: number;
  primaryName: string;
  inscription: string;
  price: number;
  preview: string;
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
};

export const mlTemplates: MLTemplate[] = ${JSON.stringify(templates, null, 2)};

// Group by shape
export const templatesByShape = mlTemplates.reduce((acc, t) => {
  if (!acc[t.shape]) acc[t.shape] = [];
  acc[t.shape].push(t);
  return acc;
}, {} as Record<string, MLTemplate[]>);

// Group by motif
export const templatesByMotif = mlTemplates.reduce((acc, t) => {
  if (!acc[t.motif]) acc[t.motif] = [];
  acc[t.motif].push(t);
  return acc;
}, {} as Record<string, MLTemplate[]>);

// Get template by ID
export function getMLTemplate(id: string): MLTemplate | null {
  return mlTemplates.find(t => t.id === id) || null;
}

// Get template by slug
export function getMLTemplateBySlug(slug: string): MLTemplate | null {
  return mlTemplates.find(t => t.slug === slug) || null;
}
`;

fs.writeFileSync(outputPath, tsContent);
console.log(`\n✅ Saved to ${outputPath}`);

// Print summary for creating routes
console.log('\n=== Route Structure Recommendations ===');
console.log('\n1. By Shape & Motif:');
console.log('   /designs/[shape]/[motif]/[designId]');
console.log(`   Example: /designs/serpentine/hearts/${templates[0]?.id}`);

console.log('\n2. By Motif:');
console.log('   /designs/motifs/[motif]');
console.log(`   Example: /designs/motifs/religious`);

console.log('\n3. By Size:');
console.log('   /designs/size/[width]x[height]');
console.log(`   Example: /designs/size/1000x750`);

console.log('\n4. By Name:');
console.log('   /designs/memorial/[name]');
console.log(`   Example: /designs/memorial/william-and-darinka`);

console.log('\n=== Next Steps ===');
console.log('1. Run: node scripts/generate-seo-templates-from-ml.js');
console.log('2. Create routes in app/designs/');
console.log('3. Use mlTemplates data for SEO pages');
console.log('4. Each design gets unique URL with metadata');
console.log(`5. You can generate ${templates.length}+ unique SEO pages!`);
