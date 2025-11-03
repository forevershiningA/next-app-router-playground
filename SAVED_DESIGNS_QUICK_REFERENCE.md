# Saved Designs - Quick Reference

## URL Structure

```
/designs/{productSlug}/{category}/{designId}_{slug}
```

**Example:**
```
/designs/bronze-plaque/memorial/1724060510093_memorial-with-motifs
```

## Finding Designs

### By Product Type
```typescript
import { getDesignsByProductType } from '#/lib/saved-designs-data';

// Get all headstone designs
const headstones = getDesignsByProductType('headstone'); // 3,606 designs

// Get all plaque designs
const plaques = getDesignsByProductType('plaque'); // 8,535 designs

// Get all monument designs
const monuments = getDesignsByProductType('monument'); // 311 designs
```

### By Specific Product
```typescript
import { getDesignsByProduct } from '#/lib/saved-designs-data';

// Get all Bronze Plaque designs
const bronzePlaques = getDesignsByProduct('bronze-plaque'); // 4,641 designs

// Get all Laser-etched Headstone designs
const laserHeadstones = getDesignsByProduct('laser-etched-headstone'); // 1,776 designs
```

### By Category
```typescript
import { getDesignsByCategory } from '#/lib/saved-designs-data';

// Get all "in loving memory" designs
const inLovingMemory = getDesignsByCategory('in-loving-memory'); // 5,301 designs

// Get all pet memorial designs
const petMemorials = getDesignsByCategory('pet-memorial'); // 65 designs

// Get all baby memorial designs
const babyMemorials = getDesignsByCategory('baby-memorial'); // 303 designs
```

### Search
```typescript
import { searchDesigns } from '#/lib/saved-designs-data';

// Search by keyword
const results = searchDesigns('photo');
```

## Product Slugs

| Product ID | Product Name | Slug | Count |
|------------|--------------|------|-------|
| 5 | Bronze Plaque | `bronze-plaque` | 4,641 |
| 30 | Laser-etched Black Granite Colour | `laser-colour-plaque` | 1,875 |
| 4 | Laser-etched Black Granite Headstone | `laser-etched-headstone` | 1,776 |
| 124 | Traditional Engraved Headstone | `traditional-headstone` | 1,390 |
| 34 | Traditional Engraved Plaque | `traditional-plaque` | 737 |
| 52 | YAG Lasered Stainless Steel Plaque | `stainless-steel-plaque` | 699 |
| 22 | Laser-etched Black Granite Mini Headstone | `mini-headstone` | 266 |
| 32 | Full Colour Plaque | `full-colour-plaque` | 265 |
| 100 | Laser-etched Black Granite Full Monument | `laser-monument` | 141 |
| 101 | Traditional Engraved Full Monument | `traditional-monument` | 63 |

## Categories

| Category | Count | Description |
|----------|-------|-------------|
| `in-loving-memory` | 5,301 | Designs with "in loving memory" inscriptions |
| `memorial` | 4,312 | General memorial designs |
| `religious-memorial` | 2,057 | Designs with religious/spiritual content |
| `baby-memorial` | 303 | Baby and child memorials |
| `garden-memorial` | 208 | Garden and nature themed |
| `commemorative` | 144 | Commemorative plaques |
| `pet-memorial` | 65 | Pet memorial designs |
| `dedication` | 62 | Dedication plaques |

## Generating URLs

```typescript
import { getSavedDesign, getDesignUrl } from '#/lib/saved-designs-data';

const design = getSavedDesign('1724060510093');
if (design) {
  const url = getDesignUrl(design);
  // url: "/designs/bronze-plaque/memorial/1724060510093_memorial-with-motifs"
}
```

## Extracting ID from URL

```typescript
import { extractDesignIdFromSlug } from '#/lib/saved-designs-data';

// From route parameter: "1724060510093_memorial-with-motifs"
const designId = extractDesignIdFromSlug(slug);
// designId: "1724060510093"
```

## Design Metadata Structure

```typescript
interface SavedDesignMetadata {
  id: string;              // "1724060510093"
  productId: string;       // "5"
  productName: string;     // "Bronze Plaque"
  productType: 'headstone' | 'plaque' | 'monument';
  productSlug: string;     // "bronze-plaque"
  category: DesignCategory; // "memorial"
  slug: string;            // "memorial-with-motifs"
  title: string;           // "Memorial"
  hasPhoto: boolean;       // false
  hasLogo: boolean;        // false
  hasMotifs: boolean;      // true
  hasAdditions: boolean;   // false
  inscriptionCount: number; // 6
}
```

## Mapping Product ID to Product

```typescript
import { getProductFromId } from '#/lib/product-utils';

const product = getProductFromId(5);
// product: { id: '5', name: 'Bronze Plaque', image: '...', category: '1' }
```

## Re-generating Data

After adding new saved designs:

```bash
# 1. Analyze all saved designs
node scripts/analyze-saved-designs.js

# 2. Generate TypeScript file
node scripts/generate-saved-designs-ts.js
```

This will:
1. Scan all JSON files in `public/ml/forevershining/saved-designs/json/`
2. Extract product IDs and categorize content
3. Generate privacy-safe slugs
4. Create `lib/saved-designs-data.ts` with all metadata

## Example Usage in Components

```typescript
'use client';

import { getSavedDesign } from '#/lib/saved-designs-data';
import { getProductFromId } from '#/lib/product-utils';

export function DesignCard({ designId }: { designId: string }) {
  const design = getSavedDesign(designId);
  const product = design ? getProductFromId(design.productId) : null;
  
  if (!design || !product) return null;
  
  return (
    <div>
      <h3>{design.title}</h3>
      <p>{product.name}</p>
      <p>Category: {design.category}</p>
      {design.hasPhoto && <span>📷 Photo</span>}
      {design.hasMotifs && <span>🎨 Motifs</span>}
    </div>
  );
}
```

## Statistics

Total designs analyzed: **12,452**
- Headstones: **3,606** (29%)
- Plaques: **8,535** (68.5%)
- Monuments: **311** (2.5%)

Design features:
- With photos: Check `hasPhoto` flag
- With logos: Check `hasLogo` flag
- With motifs: Check `hasMotifs` flag
- With additions: Check `hasAdditions` flag
