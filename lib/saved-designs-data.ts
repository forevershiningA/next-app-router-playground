/**
 * Saved Designs Data - Auto-generated
 * Generated on: 2025-11-15T17:47:57.031Z
 * Total designs: 3114
 * 
 * This file contains metadata for all saved designs with:
 * - Proper product mapping from productid
 * - Privacy-safe slugs (no personal names)
 * - Correct categorization based on content and product type
 */
/* eslint-disable @typescript-eslint/no-require-imports */

import { SAVED_DESIGN_ML_TAGS, type SavedDesignMLTags } from './saved-designs-ml-tags';

export type DesignCategory = 
  | 'biblical-memorial'
  | 'dove-memorial'
  | 'memorial'
  | 'mother-memorial'
  | 'father-memorial'
  | 'rest-in-peace'
  | 'son-memorial'
  | 'husband-memorial'
  | 'wife-memorial'
  | 'in-loving-memory'
  | 'religious-memorial'
  | 'nurse-memorial'
  | 'daughter-memorial'
  | 'garden-memorial'
  | 'butterfly-memorial'
  | 'baby-memorial'
  | 'military-veteran'
  | 'commemorative'
  | 'dedication'
  | 'brother-memorial'
  | 'floral-memorial'
  | 'islamic-memorial'
  | 'jewish-memorial'
  | 'fishing-memorial'
  | 'music-memorial'
  | 'maori-memorial'
  | 'child-memorial'
  | 'sister-memorial'
  | 'doctor-memorial'
  | 'teacher-memorial'
  | 'service-memorial'
  | 'pet-memorial'
  | 'psalm-23-memorial'
  | 'golf-memorial'
  | 'hawaiian-memorial';

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
  inscriptions?: string;   // Extracted inscription text (optional)
  shapeName?: string;      // Shape name (optional)
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
  'memorial': {
    name: 'Memorial',
    description: 'General memorial layouts for names, dates, personal messages and balanced decorative details.',
  },
  'mother-memorial': {
    name: 'Mother Memorial',
    description: 'Warm memorial layouts for mothers, grandmothers and maternal tributes.',
  },
  'biblical-memorial': {
    name: 'Biblical Memorial',
    description: 'Faith-based memorials with scripture, crosses, doves and other biblical symbols.',
  },
  'religious-memorial': {
    name: 'Religious Memorial',
    description: 'Religious memorial layouts with space for prayers, verses and sacred symbols.',
  },
  'father-memorial': {
    name: 'Father Memorial',
    description: 'Memorial layouts for fathers, grandfathers and paternal tributes.',
  },
  'in-loving-memory': {
    name: 'In Loving Memory',
    description: 'In Loving Memory designs',
  },
  'wife-memorial': {
    name: 'Wife Memorial',
    description: 'Personal memorial designs for wives, partners and lifelong companions.',
  },
  'son-memorial': {
    name: 'Son Memorial',
    description: 'Thoughtful memorial layouts for sons with room for family messages and meaningful motifs.',
  },
  'husband-memorial': {
    name: 'Husband Memorial',
    description: 'Memorial designs for husbands and partners with space for family tributes.',
  },
  'dove-memorial': {
    name: 'Dove Memorial',
    description: 'Peaceful memorial designs featuring dove motifs and gentle symbolic layouts.',
  },
  'daughter-memorial': {
    name: 'Daughter Memorial',
    description: 'Tender memorial layouts for daughters with space for loving family messages.',
  },
  'rest-in-peace': {
    name: 'Rest In Peace',
    description: 'Rest in peace memorial designs',
  },
  'butterfly-memorial': {
    name: 'Butterfly Memorial',
    description: 'Memorial designs with butterfly motifs symbolising remembrance, hope and transformation.',
  },
  'baby-memorial': {
    name: 'Baby Memorial',
    description: 'Gentle memorial layouts for babies and infants with soft, simple design details.',
  },
  'military-veteran': {
    name: 'Military Veteran',
    description: 'Military Veteran designs',
  },
  'floral-memorial': {
    name: 'Floral Memorial',
    description: 'Memorial designs with floral motifs, sprays and decorative botanical details.',
  },
  'garden-memorial': {
    name: 'Garden Memorial',
    description: 'Garden-style memorial layouts suited to natural, floral and outdoor remembrance themes.',
  },
  'music-memorial': {
    name: 'Music Memorial',
    description: 'Memorial designs for musicians and music lovers, with room for instruments or notes.',
  },
  'brother-memorial': {
    name: 'Brother Memorial',
    description: 'Memorial layouts for brothers with space for family relationships and personal messages.',
  },
  'dedication': {
    name: 'Dedication',
    description: 'Dedication plaques and commemorative designs',
  },
  'commemorative': {
    name: 'Commemorative',
    description: 'Commemorative memorial designs',
  },
  'islamic-memorial': {
    name: 'Islamic Memorial',
    description: 'Islamic memorial layouts with respectful space for names, dates and faith-based wording.',
  },
  'child-memorial': {
    name: 'Child Memorial',
    description: 'Sensitive memorial designs for children with gentle layouts and soft symbolic details.',
  },
  'service-memorial': {
    name: 'Service Memorial',
    description: 'Service memorial layouts for public service, community roles and duty-based tributes.',
  },
  'sister-memorial': {
    name: 'Sister Memorial',
    description: 'Memorial designs for sisters with space for family messages and personal details.',
  },
  'pet-memorial': {
    name: 'Pet Memorial',
    description: 'Memorial designs for pets including dogs, cats and other animals',
  },
  'fishing-memorial': {
    name: 'Fishing Memorial',
    description: 'Memorial designs for fishing enthusiasts with angling, water and outdoor motifs.',
  },
  'maori-memorial': {
    name: 'Maori Memorial',
    description: 'Maori-inspired memorial designs with space for cultural wording and symbolic motifs.',
  },
  'nurse-memorial': {
    name: 'Nurse Memorial',
    description: 'Memorial designs for nurses and carers, with layouts suited to service and care tributes.',
  },
  'teacher-memorial': {
    name: 'Teacher Memorial',
    description: 'Memorial layouts for teachers, mentors and educators.',
  },
  'jewish-memorial': {
    name: 'Jewish Memorial',
    description: 'Jewish memorial layouts with respectful space for Hebrew, English and symbolic details.',
  },
  'psalm-23-memorial': {
    name: 'Psalm 23 Memorial',
    description: 'Psalm 23 memorial designs with space for scripture, names and religious motifs.',
  },
  'doctor-memorial': {
    name: 'Doctor Memorial',
    description: 'Memorial layouts for doctors and medical professionals.',
  },
  'golf-memorial': {
    name: 'Golf Memorial',
    description: 'Memorial designs for golfers with sport, club and landscape-inspired details.',
  },
  'hawaiian-memorial': {
    name: 'Hawaiian Memorial',
    description: 'Hawaiian memorial designs with tropical, floral and island-inspired motifs.',
  },
};

/**
 * All saved designs indexed by ID
 */
export const SAVED_DESIGNS: Record<string, SavedDesignMetadata> = require("./saved-designs-data.json") as Record<string, SavedDesignMetadata>;

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
 * Generate SEO URL for a design (clean slug format)
 * Format: /designs/{productSlug}/{category}/{slug}
 * Example: /designs/bronze-plaque/memorial/memorial-with-motifs
 */
export function getDesignUrl(design: SavedDesignMetadata): string {
  return `/designs/${design.productSlug}/${design.category}/${design.slug}`;
}

function normalizeDesignText(value: string | undefined): string {
  return (value || '').toLowerCase().replace(/[_-]+/g, ' ').trim();
}

function tokenizeDesignText(value: string | undefined): Set<string> {
  const stopWords = new Set(['a', 'an', 'and', 'for', 'in', 'of', 'the', 'to', 'with']);
  return new Set(
    normalizeDesignText(value)
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 2 && !stopWords.has(token))
  );
}

function normalizeMotifName(motifName: string): string {
  const normalized = normalizeDesignText(motifName);

  if (normalized.endsWith('ies') && normalized.length > 4) {
    return `${normalized.slice(0, -3)}y`;
  }

  if (normalized.endsWith('es') && normalized.length > 4) {
    return normalized.slice(0, -2);
  }

  if (normalized.endsWith('s') && normalized.length > 3) {
    return normalized.slice(0, -1);
  }

  return normalized;
}

function getMotifSet(design: SavedDesignMetadata): Set<string> {
  return new Set(design.motifNames.map(normalizeMotifName).filter(Boolean));
}

function getSetOverlapScore(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;

  let overlap = 0;
  a.forEach((value) => {
    if (b.has(value)) overlap += 1;
  });

  return overlap / Math.max(a.size, b.size);
}

function getShapeSimilarityScore(a: string | undefined, b: string | undefined): number {
  const first = normalizeDesignText(a);
  const second = normalizeDesignText(b);

  if (!first || !second) return 0;
  if (first === second) return 1;

  const firstTokens = tokenizeDesignText(first);
  const secondTokens = tokenizeDesignText(second);

  return getSetOverlapScore(firstTokens, secondTokens);
}

function getAspectRatio(tags: SavedDesignMLTags | undefined): number | null {
  if (!tags?.width || !tags.height || tags.height === 0) return null;
  return tags.width / tags.height;
}

function getMLTagSimilarityScore(
  currentTags: SavedDesignMLTags | undefined,
  candidateTags: SavedDesignMLTags | undefined
): number {
  if (!currentTags || !candidateTags) return 0;

  let score = 0;

  if (currentTags.motif && candidateTags.motif) {
    if (currentTags.motif === candidateTags.motif) {
      score += 12;
    } else {
      score += getSetOverlapScore(
        tokenizeDesignText(currentTags.motif),
        tokenizeDesignText(candidateTags.motif)
      ) * 4;
    }
  }

  if (currentTags.style && currentTags.style === candidateTags.style) score += 6;
  if (currentTags.type && currentTags.type === candidateTags.type) score += 5;
  if (currentTags.orientation && currentTags.orientation === candidateTags.orientation) score += 2;

  score += getShapeSimilarityScore(currentTags.shape, candidateTags.shape) * 6;

  const currentAspect = getAspectRatio(currentTags);
  const candidateAspect = getAspectRatio(candidateTags);
  if (currentAspect && candidateAspect) {
    const aspectDifference = Math.abs(currentAspect - candidateAspect);
    score += Math.max(0, 3 - aspectDifference * 2);
  }

  return score;
}

function getNumericTimestamp(id: string): number {
  const timestamp = Number(id);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

/**
 * Get related designs by ranked design similarity.
 */
export function getRelatedDesigns(
  currentDesign: SavedDesignMetadata,
  limit: number = 6
): SavedDesignMetadata[] {
  const designs = Object.values(SAVED_DESIGNS);

  const currentMotifs = getMotifSet(currentDesign);
  const currentTitleTokens = tokenizeDesignText(currentDesign.title);
  const currentCategoryTokens = tokenizeDesignText(currentDesign.category);
  const currentMLTags = SAVED_DESIGN_ML_TAGS[currentDesign.id];

  const scored = designs
    .filter(d => d.id !== currentDesign.id)
    .map(d => {
      let score = 0;

      if (d.productSlug === currentDesign.productSlug) {
        score += 16;
      } else if (d.productType === currentDesign.productType) {
        score += 5;
      }

      if (d.category === currentDesign.category) score += 14;
      if (d.mlDir === currentDesign.mlDir) score += 4;

      score += getShapeSimilarityScore(currentDesign.shapeName, d.shapeName) * 10;

      if (d.hasPhoto === currentDesign.hasPhoto) score += 4;
      if (d.hasMotifs === currentDesign.hasMotifs) score += 3;
      if (d.hasAdditions === currentDesign.hasAdditions) score += 2;
      if (d.hasLogo === currentDesign.hasLogo) score += 1;

      const motifOverlapScore = getSetOverlapScore(currentMotifs, getMotifSet(d));
      score += motifOverlapScore * 8;

      const inscriptionDifference = Math.abs(d.inscriptionCount - currentDesign.inscriptionCount);
      score += Math.max(0, 5 - inscriptionDifference);

      score += getSetOverlapScore(currentTitleTokens, tokenizeDesignText(d.title)) * 3;
      score += getSetOverlapScore(currentCategoryTokens, tokenizeDesignText(d.category)) * 2;
      score += getMLTagSimilarityScore(currentMLTags, SAVED_DESIGN_ML_TAGS[d.id]);

      return { design: d, score };
    });

  return scored
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return getNumericTimestamp(b.design.id) - getNumericTimestamp(a.design.id);
    })
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

/** Counts stay aligned with generated metadata. */
export const CATEGORY_STATS = Object.values(SAVED_DESIGNS).reduce<Record<string, number>>(
  (stats, design) => {
    stats[design.category] = (stats[design.category] ?? 0) + 1;
    return stats;
  },
  {},
);

export const PRODUCT_STATS = Object.values(SAVED_DESIGNS).reduce<Record<string, number>>(
  (stats, design) => {
    stats[design.productSlug] = (stats[design.productSlug] ?? 0) + 1;
    return stats;
  },
  {},
);

/**
 * Extract design ID from old slug format (timestamp_description)
 * @deprecated Use getDesignFromSlug instead
 */
export function extractDesignIdFromSlug(slug: string): string | null {
  const match = slug.match(/^(\d+)_/);
  return match ? match[1] : null;
}

/**
 * Slug-to-ID mapping for fast lookups
 * Generated by scripts/generate-unique-slugs.js
 */
const SLUG_TO_ID_MAPPING = require('./slug-to-id-mapping.json');
const DESIGNS_BY_SLUG = new Map<string, SavedDesignMetadata[]>();
for (const design of getAllSavedDesigns()) {
  const group = DESIGNS_BY_SLUG.get(design.slug) ?? [];
  group.push(design);
  DESIGNS_BY_SLUG.set(design.slug, group);
}

/**
 * Get design by slug (supports both new clean slugs and old timestamp_description format)
 */
export function getDesignFromSlug(
  slug: string,
  context?: { productSlug: string; category: string },
): SavedDesignMetadata | null {
  // Current metadata is authoritative; the historical alias file can be stale
  // and a clean slug can legitimately exist in two different categories.
  const matches = DESIGNS_BY_SLUG.get(slug) ?? [];
  if (context) {
    const exact = matches.filter(
      (design) =>
        design.productSlug === context.productSlug &&
        design.category === context.category,
    );
    if (exact.length === 1) return exact[0];
    if (exact.length > 1) return null;
  }
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) return null;

  // Preserve historical aliases only when they do not conflict with a current
  // slug. Callers redirect these aliases to the record's canonical full path.
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
