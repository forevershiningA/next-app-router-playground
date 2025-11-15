# URL Slug Strategy for SEO Optimization

## Problem
Current URLs contain timestamp prefixes that hurt SEO:
- `/designs/traditional-headstone/biblical-memorial/1704011685894_amazing-grace-for-god-so-loved-the-world-that-he-gave-his-onc`
- Opaque numeric prefix
- Truncated text
- Not user-friendly or SEO-optimized

## Recommended Solution: Hybrid Approach

### Strategy
1. **Primary (Canonical) URLs**: Clean, human-readable slugs
   - Format: `/designs/{productType}/{category}/{clean-slug}`
   - Example: `/designs/traditional-headstone/biblical-memorial/amazing-grace-john-3-16`

2. **Slug Generation**: Build from design metadata
   - Use motif names, verses, references
   - Keep under 60 characters
   - Ensure uniqueness with collision detection

3. **Lookup Mechanism**: Slug-to-ID mapping
   - Build index at compile time: `{ slug: designId }`
   - Fast O(1) lookup without URL parsing
   - Handle collisions with minimal suffixes

4. **Backward Compatibility**: 301 redirects
   - Old format: `/designs/{productType}/{category}/{id}_{description}`
   - Redirects to canonical clean slug
   - Preserves existing links and bookmarks

### Implementation Plan

#### Step 1: Generate Slug-to-ID Mapping
```typescript
// In lib/saved-designs-data.ts or new lib/design-slug-mapping.ts

export interface SlugMapping {
  [slug: string]: string; // slug → designId
}

export function generateSlugFromDesign(design: SavedDesignMetadata): string {
  // Build from motifs, inscriptions, category
  const parts: string[] = [];
  
  // Add primary motif or verse
  if (design.motifNames.length > 0) {
    parts.push(design.motifNames[0]);
  }
  
  // Add category if distinctive
  const categoryPart = design.category
    .replace('-memorial', '')
    .replace('-', ' ');
  
  if (categoryPart !== 'memorial') {
    parts.push(categoryPart);
  }
  
  // Create slug
  let slug = parts
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60)
    .replace(/-$/, '');
  
  return slug || 'custom-memorial';
}

export function buildSlugToIdMapping(): SlugMapping {
  const mapping: SlugMapping = {};
  const slugCounts: Record<string, number> = {};
  
  for (const design of Object.values(SAVED_DESIGNS)) {
    let slug = generateSlugFromDesign(design);
    
    // Handle collisions
    if (mapping[slug]) {
      slugCounts[slug] = (slugCounts[slug] || 1) + 1;
      slug = `${slug}-${slugCounts[slug]}`;
    }
    
    mapping[slug] = design.id;
    slugCounts[slug] = 1;
  }
  
  return mapping;
}

// Generate at build time
export const SLUG_TO_ID_MAPPING = buildSlugToIdMapping();
```

#### Step 2: Update Lookup Functions
```typescript
// Enhanced lookup: try slug first, fallback to ID extraction
export function getDesignFromSlug(slug: string): SavedDesignMetadata | null {
  // Try direct slug lookup
  const designId = SLUG_TO_ID_MAPPING[slug];
  if (designId) {
    return SAVED_DESIGNS[designId];
  }
  
  // Fallback: try extracting ID from old format (timestamp_description)
  const extractedId = extractDesignIdFromSlug(slug);
  if (extractedId && SAVED_DESIGNS[extractedId]) {
    return SAVED_DESIGNS[extractedId];
  }
  
  return null;
}

export function getCanonicalSlugForDesign(designId: string): string {
  const design = SAVED_DESIGNS[designId];
  if (!design) return '';
  
  // Find the canonical slug for this design
  for (const [slug, id] of Object.entries(SLUG_TO_ID_MAPPING)) {
    if (id === designId) {
      return slug;
    }
  }
  
  return generateSlugFromDesign(design);
}
```

#### Step 3: Update Page Component with Redirect
```typescript
// In app/designs/[productType]/[category]/[slug]/page.tsx

export default async function SavedDesignPage({ params }: SavedDesignPageProps) {
  const { productType: productSlug, category, slug } = await params;

  // Try new slug lookup first
  let design = getDesignFromSlug(slug);
  let designId: string | null = null;
  
  if (design) {
    designId = design.id;
    
    // Check if this is old format and redirect to canonical
    const canonicalSlug = getCanonicalSlugForDesign(design.id);
    if (slug !== canonicalSlug && !slug.match(/^\d+_/)) {
      // Different slug but not old format - redirect to canonical
      const canonicalUrl = `/designs/${productSlug}/${category}/${canonicalSlug}`;
      redirect(canonicalUrl);
    } else if (slug.match(/^\d+_/)) {
      // Old timestamp format - 301 redirect to new clean URL
      const canonicalUrl = `/designs/${productSlug}/${category}/${canonicalSlug}`;
      redirect(canonicalUrl);
    }
  } else {
    notFound();
  }

  // Rest of the component...
}
```

#### Step 4: Add to SavedDesignMetadata
```typescript
export interface SavedDesignMetadata {
  id: string;
  productId: string;
  productName: string;
  productType: 'headstone' | 'plaque' | 'monument';
  productSlug: string;
  category: DesignCategory;
  slug: string;            // Legacy field - can be deprecated
  canonicalSlug: string;   // NEW: Clean SEO-friendly slug
  title: string;
  // ... rest of fields
}
```

### Benefits

1. **SEO Optimized**: Clean, readable URLs that rank better
2. **Backward Compatible**: Old links still work via 301 redirect
3. **Fast Lookup**: O(1) hash lookup, no regex parsing
4. **Collision Safe**: Automatic disambiguation for duplicate slugs
5. **Canonical URLs**: Single source of truth per design
6. **Build-time Generation**: No runtime slug computation

### Migration Path

1. Generate slug mappings in build script
2. Update page component to use new lookup
3. Add 301 redirects for old format
4. Update sitemap with canonical URLs
5. Update internal links to use canonical slugs
6. Monitor 404s and add missing mappings

### Example Transformations

| Old URL | New Canonical URL |
|---------|------------------|
| `/designs/traditional-headstone/biblical-memorial/1704011685894_amazing-grace-for-god-so-loved-the-world-that-he-gave-his-onc` | `/designs/traditional-headstone/biblical-memorial/amazing-grace-john-3-16` |
| `/designs/laser-etched-headstone/mother-memorial/1578016189116_grace-cassar-together-forever` | `/designs/laser-etched-headstone/mother-memorial/butterflies-cross-mother` |
| `/designs/bronze-plaque/memorial/1234567890123_custom-design` | `/designs/bronze-plaque/memorial/custom-memorial` |

### Notes

- Slugs are deterministic based on design content
- Timestamp IDs remain in database for exact lookups
- No data migration needed - just add canonical slug field
- Can be implemented incrementally
