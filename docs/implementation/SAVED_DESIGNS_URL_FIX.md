# Saved Designs URL Structure Fix

## Issues Identified

### 1. **URL Product Type Mismatch**
Currently using hardcoded "plaque" or "headstone" in URL instead of actual product name from `_data.ts`.

**Current URL:**
```
/designs/plaque/dedication/1724060510093_william-john-earl-grady
```

**Problem:** 
- productid=5 in JSON maps to "Bronze Plaque" in products array
- URL says "plaque" but doesn't specify which product type
- Should use product slug from products array

**Solution:**
- Map productid to actual product from `_data.ts` products array
- Generate slug from product name (e.g., "bronze-plaque", "laser-etched-black-granite-headstone")
- Use product slug in URL: `/designs/bronze-plaque/dedication/1724060510093...`

### 2. **Categorization Issues**
Headstone category shows 0 saved designs even though many headstones exist.

**Problem:**
- saved-designs-data.ts categorizes designs based on inscription content
- Product type (headstone vs plaque) is in productid field, not considered for categorization
- All designs categorized as "pet-plaque", "dedication", etc. regardless of product type

**Solution:**
- Re-categorize designs based on BOTH productid AND inscription content
- Create product-type-based categories: "headstone-memorial", "plaque-dedication", etc.
- Or use two-level categorization: product type → purpose category

### 3. **Privacy in URLs - Names in Slugs**
URLs contain names from inscriptions that should be anonymized.

**Current:**
```
/designs/plaque/dedication/1724060510093_william-john-earl-grady
```

**Problem:**
- "william-john-earl-grady" extracted from inscriptions
- Names should be anonymized in saved designs
- URL exposes personal information

**Solution:**
- Generate slugs without extracting names from inscriptions
- Use generic descriptive text based on:
  - Product type
  - Category/theme
  - Design elements (motifs, additions)
- Example: `1724060510093_bronze-plaque-dedication-with-cross`

## Proposed URL Structure

### Option 1: Product-First Hierarchy
```
/designs/{product-slug}/{category}/{id}_{description}

Examples:
/designs/bronze-plaque/dedication/1724060510093_memorial-with-cross
/designs/laser-etched-headstone/in-memory/1234567890_floral-design
/designs/stainless-steel-plaque/pet-memorial/9876543210_rainbow-bridge
```

### Option 2: Category-First with Product
```
/designs/{category}/{product-slug}/{id}_{description}

Examples:
/designs/dedication/bronze-plaque/1724060510093_memorial-with-cross
/designs/in-memory/laser-etched-headstone/1234567890_floral-design
/designs/pet-memorial/stainless-steel-plaque/9876543210_rainbow-bridge
```

### Recommended: Option 1 (Product-First)
- Better for product filtering and SEO
- Clearer product hierarchy
- Easier to browse by product type

## Implementation Plan

### 1. Create Product Mapping Function
```typescript
// lib/product-utils.ts
export function getProductFromId(productId: number | string): Product | null {
  const id = String(productId);
  return products.find(p => p.id === id) || null;
}

export function getProductSlug(product: Product): string {
  return product.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

### 2. Update Categorization Logic
```typescript
// Consider both product type and content
export function categorizeDesign(designData: SavedDesignData): {
  productType: string;  // 'headstone' | 'plaque' | 'monument'
  category: string;     // 'dedication' | 'memorial' | 'pet' etc.
  productSlug: string;  // 'bronze-plaque'
} {
  const baseProduct = designData.find(item => 
    item.type === 'Headstone' || item.type === 'Plaque'
  );
  
  const product = getProductFromId(baseProduct?.productid);
  const productSlug = product ? getProductSlug(product) : 'unknown';
  
  // Determine product type from product name
  const productType = product?.name.toLowerCase().includes('headstone') 
    ? 'headstone' 
    : product?.name.toLowerCase().includes('plaque')
    ? 'plaque'
    : 'monument';
  
  // Determine category from inscriptions (existing logic)
  const category = determineCategory(designData);
  
  return { productType, category, productSlug };
}
```

### 3. Generate Privacy-Safe Slugs
```typescript
export function generatePrivacySafeSlug(designData: SavedDesignData): string {
  const parts: string[] = [];
  
  // Add category descriptor
  const category = determineCategory(designData);
  parts.push(category.replace('_', '-'));
  
  // Add design elements (not names!)
  const hasMotifs = designData.some(item => item.type === 'Motif');
  const hasPhoto = designData.some(item => item.type === 'UploadedPhoto');
  const hasAdditions = designData.some(item => item.type === 'addition');
  
  if (hasPhoto) parts.push('with-photo');
  if (hasMotifs) parts.push('with-motifs');
  if (hasAdditions) parts.push('with-additions');
  
  // Limit to first 4-5 words max
  return parts.slice(0, 4).join('-');
}
```

### 4. Update URL Generation
```typescript
// lib/saved-designs-data.ts
export function getDesignUrl(design: SavedDesignMetadata): string {
  return `/designs/${design.productSlug}/${design.category}/${design.id}_${design.slug}`;
}
```

## Migration Steps

1. **Update saved-designs-data.ts structure:**
   - Add `productSlug` field to SavedDesignMetadata
   - Add `productType` field (headstone/plaque/monument)
   - Update categorization to consider productid

2. **Re-generate saved-designs-data.ts:**
   - Run script to analyze all saved designs
   - Extract productid from each design JSON
   - Map to product from _data.ts
   - Generate privacy-safe slugs
   - Update categories based on product type

3. **Update routing:**
   - Update `app/designs/[productType]/[category]/[slug]/page.tsx`
   - Change `[productType]` to `[productSlug]` for specific products
   - Update metadata generation
   - Update breadcrumbs

4. **Update design loader:**
   - Extract productid from saved design
   - Set correct product in editor
   - Handle product-specific features

## Benefits

1. **Accurate Product Information:** URLs reflect the actual product, not just category
2. **Better Categorization:** Headstone designs properly separated from plaque designs
3. **Privacy Protection:** No personal names in URLs
4. **Better SEO:** Descriptive, product-specific URLs
5. **User-Friendly:** Clear product hierarchy in URL structure

## Example Migrations

**Before:**
```
/designs/plaque/dedication/1724060510093_william-john-earl-grady
```

**After:**
```
/designs/bronze-plaque/dedication/1724060510093_memorial-with-cross
```

**Before (wrong category):**
```
/designs/headstone/pet-plaque/1234567890_loving-memory
```

**After (correct product and category):**
```
/designs/laser-etched-headstone/memorial/1234567890_with-photo-motifs
```
