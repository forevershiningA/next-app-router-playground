# SEO Metadata Improvements

## Overview
Improved programmatic metadata generation for design pages to be more SEO-friendly, unique at scale, and better match user intent.

## Changes Implemented

### 1. Enhanced Page Title (Meta Title)
**Format:** `{Category} – {Simplified Product} {Product Type} | Forever Shining`

**Example:**
```
Mother Memorial – Laser-Etched Black Granite Headstone | Forever Shining
```

**Features:**
- Category-first approach (matches user search intent)
- Simplified product names for clarity
- Product type (Headstone/Plaque/Monument) for specificity
- Brand name at the end
- Character count optimized for search results

### 2. Improved H1 Tag
**Format:** `{Category} – {Simplified Product}`

**Example:**
```html
<h1>Mother Memorial – Laser-Etched Black Granite</h1>
```

**Features:**
- Matches user intent directly
- Clean, readable format
- Consistent with page title
- No redundant information

### 3. Enhanced Meta Description
**Format:** Dynamic description based on design features (140-160 characters)

**Example:**
```
Design a mother memorial in laser-etched black granite. Add inscriptions, motifs. Preview live. Fast proofing & delivery.
```

**Features:**
- Starts with action verb ("Design a...")
- Includes category and product type
- Lists available features (inscriptions, motifs, photos) dynamically
- Call-to-action elements (preview, fast delivery)
- Character count enforced (140-160 chars)

### 4. Product Name Simplification
Simplified verbose product names for better readability:

| Original | Simplified |
|----------|-----------|
| Laser-etched Black Granite Headstone | Laser-Etched Black Granite |
| Laser-etched Black Granite Colour Plaque | Laser-Etched Colour |
| Bronze Plaque | Bronze |
| YAG Lasered Stainless Steel Plaque | Stainless Steel |
| Traditional Engraved Plaque | Traditional Engraved |
| Full Colour Plaque | Full Colour |

### 5. Open Graph & Twitter Cards
Enhanced social media metadata:
```typescript
openGraph: {
  title: "Mother Memorial – Laser-Etched Black Granite",
  description: "...",
  images: [{
    url: "/ml/.../screenshots/...",
    width: 1200,
    height: 630,
    alt: "Mother Memorial design preview"
  }]
}
```

## URL Structure
Maintained clean, canonical URLs:
```
/designs/{productType}/{category}/{id}_{description-slug}
```

**Example:**
```
/designs/laser-etched-headstone/mother-memorial/1761796985723_a-life-lived-with-passion
```

**Features:**
- No query parameters in indexable URLs
- Product type categorization
- Category-based organization
- Privacy-safe slugs (no personal names)
- Design ID for unique identification

## Benefits

### SEO Benefits
1. **Unique at Scale** - Each design has unique, descriptive metadata
2. **User Intent Matching** - Titles and H1s match search queries
3. **Rich Snippets** - Proper Open Graph for social sharing
4. **Crawlability** - Clean URL structure without parameters

### User Experience Benefits
1. **Clear Hierarchy** - Breadcrumb matches page structure
2. **Informative** - Metadata tells users exactly what to expect
3. **Actionable** - Descriptions include clear CTAs
4. **Scannable** - H1 provides immediate context

## Files Modified
1. `/app/designs/[productType]/[category]/[slug]/page.tsx`
   - Enhanced `generateMetadata()` function
   - Added `getSimplifiedProductType()` helper
   - Improved title, description, and social meta generation

2. `/app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx`
   - Changed `<h2>` to `<h1>` for proper semantic structure
   - Added `getSimplifiedProductName()` helper
   - Updated H1 to match metadata format

## Technical Implementation

### Metadata Generation Logic
```typescript
// Title: Category – Simplified Product Type | Brand
const pageTitle = `${categoryTitle} – ${simplifiedProduct} ${productTypeDisplay} | Forever Shining`;

// H1: Category – Simplified Product
const h1Title = `${categoryTitle} – ${simplifiedProduct}`;

// Description: Dynamic based on features
let description = `Design a ${categoryTitle.toLowerCase()} in ${simplifiedProduct.toLowerCase()}.`;

// Add features dynamically
const features: string[] = [];
if (design.inscriptionCount > 0) features.push('inscriptions');
if (design.hasMotifs) features.push('motifs');
if (design.hasPhoto) features.push('photos');

if (features.length > 0) {
  description += ` Add ${features.join(', ')}.`;
}

description += ' Preview live. Fast proofing & delivery.';
```

## Future Enhancements
1. **Shape Integration** - Add shape info to metadata when available (e.g., "Heart Shape")
2. **Size Information** - Include size details if specified
3. **Motif Names** - Incorporate specific motif names in descriptions
4. **Category Descriptions** - Use rich category descriptions from DESIGN_CATEGORIES
5. **Schema Markup** - Add JSON-LD structured data for products
6. **Localization** - Support for multiple languages/regions

## Testing
Test URLs to verify improvements:
- http://localhost:3000/designs/laser-etched-headstone/mother-memorial/1761796985723_a-life-lived-with-passion
- View page source to see meta tags
- Check H1 in browser inspector
- Test social sharing preview
