/**
 * Generate saved-designs-data.ts from analyzed JSON
 */

const fs = require('fs');
const path = require('path');

const analyzedPath = path.join(__dirname, '../lib/saved-designs-analyzed.json');
const outputPath = path.join(__dirname, '../lib/saved-designs-data.ts');

const analyzed = JSON.parse(fs.readFileSync(analyzedPath, 'utf8'));

console.log(`📊 Generating TypeScript file from ${analyzed.length} designs...`);

// Group by category for statistics
const byCategory = {};
const byProductSlug = {};

analyzed.forEach(design => {
  byCategory[design.category] = (byCategory[design.category] || 0) + 1;
  byProductSlug[design.productSlug] = (byProductSlug[design.productSlug] || 0) + 1;
});

// Generate TypeScript content
const content = `/**
 * Saved Designs Data - Auto-generated
 * Generated on: ${new Date().toISOString()}
 * Total designs: ${analyzed.length}
 * 
 * This file contains metadata for all saved designs with:
 * - Proper product mapping from productid
 * - Privacy-safe slugs (no personal names)
 * - Correct categorization based on content and product type
 */

export type DesignCategory = 
${Object.keys(byCategory).map(cat => `  | '${cat}'`).join('\n')};

export interface SavedDesignMetadata {
  id: string;              // Design ID (timestamp)
  productId: string;       // Product ID from _data.ts
  productName: string;     // Full product name
  productType: 'headstone' | 'plaque' | 'monument';
  productSlug: string;     // URL-friendly product slug
  category: DesignCategory;
  slug: string;            // Privacy-safe URL slug
  title: string;           // Display title
  motifNames: string[];    // Extracted motif names (cross, angel, flower, etc.)
  preview: string;         // Preview image path
  mlDir: string;           // ML directory (forevershining, headstonesdesigner, bronze-plaque)
  hasPhoto: boolean;
  hasLogo: boolean;
  hasMotifs: boolean;
  hasAdditions: boolean;
  inscriptionCount: number;
}

/**
 * Category information for UI display
 */
export interface CategoryInfo {
  name: string;
  description: string;
  icon?: string;
}

/**
 * Design categories with display information
 */
export const DESIGN_CATEGORIES: Record<DesignCategory, CategoryInfo> = {
${Object.keys(byCategory).sort((a, b) => byCategory[b] - byCategory[a]).map(cat => {
  // Generate friendly name and description for each category
  const name = cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  let description = '';
  
  if (cat.includes('memorial')) {
    const type = cat.replace('-memorial', '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    description = 'Memorial designs for ' + type.toLowerCase();
  } else if (cat === 'rest-in-peace') {
    description = 'Rest in peace memorial designs';
  } else if (cat === 'dedication') {
    description = 'Dedication plaques and commemorative designs';
  } else if (cat === 'commemorative') {
    description = 'Commemorative memorial designs';
  } else {
    description = name + ' designs';
  }
  
  return `  '${cat}': {
    name: '${name}',
    description: '${description}',
  }`;
}).join(',\n')},
};

/**
 * All saved designs indexed by ID
 */
export const SAVED_DESIGNS: Record<string, SavedDesignMetadata> = ${JSON.stringify(
  analyzed.reduce((acc, design) => {
    acc[design.id] = design;
    return acc;
  }, {}),
  null,
  2
)};

/**
 * Get saved design by ID
 */
export function getSavedDesign(id: string): SavedDesignMetadata | undefined {
  return SAVED_DESIGNS[id];
}

/**
 * Get all saved designs as an array
 */
export function getAllSavedDesigns(): SavedDesignMetadata[] {
  return Object.values(SAVED_DESIGNS);
}

/**
 * Get all designs for a category
 */
export function getDesignsByCategory(category: DesignCategory): SavedDesignMetadata[] {
  return Object.values(SAVED_DESIGNS).filter(design => design.category === category);
}

/**
 * Get all designs for a product slug
 */
export function getDesignsByProduct(productSlug: string): SavedDesignMetadata[] {
  return Object.values(SAVED_DESIGNS).filter(design => design.productSlug === productSlug);
}

/**
 * Get all designs for a product type
 */
export function getDesignsByProductType(productType: 'headstone' | 'plaque' | 'monument'): SavedDesignMetadata[] {
  return Object.values(SAVED_DESIGNS).filter(design => design.productType === productType);
}

/**
 * Generate SEO URL for a design
 * Format: /designs/{productSlug}/{category}/{id}_{slug}
 * Example: /designs/bronze-plaque/memorial/1724060510093_memorial-with-motifs
 */
export function getDesignUrl(design: SavedDesignMetadata): string {
  return \`/designs/\${design.productSlug}/\${design.category}/\${design.id}_\${design.slug}\`;
}

/**
 * Get related designs by various criteria
 */
export function getRelatedDesigns(
  currentDesign: SavedDesignMetadata,
  limit: number = 6
): SavedDesignMetadata[] {
  const designs = Object.values(SAVED_DESIGNS);
  
  // Filter out current design and get related ones
  const related = designs.filter(d => d.id !== currentDesign.id);
  
  // Prioritize designs with same product, same category, or similar content
  const scored = related.map(d => {
    let score = 0;
    if (d.productSlug === currentDesign.productSlug) score += 3;
    if (d.category === currentDesign.category) score += 2;
    if (d.hasMotifs && currentDesign.hasMotifs) score += 1;
    if (d.hasPhoto && currentDesign.hasPhoto) score += 1;
    
    // Bonus for matching motifs
    const matchingMotifs = d.motifNames.filter(m => currentDesign.motifNames.includes(m));
    score += matchingMotifs.length * 0.5;
    
    return { design: d, score };
  });
  
  // Sort by score and return top results
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.design);
}

/**
 * Search designs by keywords
 */
export function searchDesigns(query: string): SavedDesignMetadata[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(SAVED_DESIGNS).filter(design => 
    design.title.toLowerCase().includes(lowerQuery) ||
    design.category.includes(lowerQuery) ||
    design.productName.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Category statistics
 */
export const CATEGORY_STATS = ${JSON.stringify(byCategory, null, 2)};

/**
 * Product statistics
 */
export const PRODUCT_STATS = ${JSON.stringify(byProductSlug, null, 2)};

/**
 * Extract design ID from old slug format (timestamp_description)
 * @deprecated Use getDesignFromSlug instead
 */
export function extractDesignIdFromSlug(slug: string): string | null {
  const match = slug.match(/^(\\d+)_/);
  return match ? match[1] : null;
}

/**
 * Slug-to-ID mapping for fast lookups
 * Generated by scripts/generate-unique-slugs.js
 */
const SLUG_TO_ID_MAPPING = require('./slug-to-id-mapping.json');

/**
 * Get design by slug (supports both new clean slugs and old timestamp_description format)
 */
export function getDesignFromSlug(slug: string): SavedDesignMetadata | null {
  // Try direct slug lookup (new format)
  const designId = SLUG_TO_ID_MAPPING[slug];
  if (designId && SAVED_DESIGNS[designId]) {
    return SAVED_DESIGNS[designId];
  }
  
  // Fallback: try extracting ID from old format (timestamp_description)
  const extractedId = extractDesignIdFromSlug(slug);
  if (extractedId && SAVED_DESIGNS[extractedId]) {
    return SAVED_DESIGNS[extractedId];
  }
  
  return null;
}

/**
 * Get canonical slug for a design ID
 */
export function getCanonicalSlugForDesign(designId: string): string | null {
  const design = SAVED_DESIGNS[designId];
  if (!design) return null;
  
  // Return the slug from the design metadata (which is now unique and SEO-friendly)
  return design.slug;
}
`;

fs.writeFileSync(outputPath, content);

console.log(`✅ Generated ${outputPath}`);
console.log(`\n📊 Statistics:`);
console.log(`   Total designs: ${analyzed.length}`);
console.log(`\n🏷️  By Category:`);
Object.entries(byCategory).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
  console.log(`   ${cat}: ${count}`);
});
console.log(`\n📦 By Product:`);
Object.entries(byProductSlug).sort((a, b) => b[1] - a[1]).forEach(([slug, count]) => {
  console.log(`   ${slug}: ${count}`);
});
