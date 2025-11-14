# JSON-LD Structured Data Implementation

## Overview
Added comprehensive JSON-LD structured data to all design pages for improved SEO and rich search results.

## Implemented Schemas

### 1. Product Schema
Complete product information with all relevant details:

```json
{
  "@type": "Product",
  "name": "Mother Memorial – Heart-Shaped Laser-Etched Black Granite Headstone",
  "description": "Design online: add inscriptions, verses and motifs with live preview...",
  "brand": {
    "@type": "Brand",
    "name": "Forever Shining"
  },
  "category": "Headstone",
  "material": "Black granite",
  "color": "Black",
  "additionalProperty": [
    {"@type": "PropertyValue", "name": "Shape", "value": "Heart"},
    {"@type": "PropertyValue", "name": "Finish", "value": "Laser-etched"},
    {"@type": "PropertyValue", "name": "Personalisation", "value": "Inscriptions, verses, motifs"}
  ],
  "image": ["https://forevershining.com.au/ml/.../preview.jpg"],
  "sku": "FS-HEADSTONE-HEART-LASER-ETCHED-BLACK-GRANITE-MOTHER-MEMORIAL",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "AUD",
    "price": "495.00",
    "availability": "https://schema.org/InStock",
    "url": "https://..."
  }
}
```

**Features:**
- Dynamic product name based on category, shape, and product type
- Material detection (granite, bronze, stainless steel)
- Color detection (black, bronze, silver)
- Finish detection (laser-etched, traditional engraved)
- Additional properties for shape, finish, and personalization options
- Conditional properties for motifs and photos
- SKU generation following format: `FS-{TYPE}-{SHAPE}-{PRODUCT}-{CATEGORY}`
- Price information with validity period
- Availability status

### 2. Offer Schema
Pricing and availability information:

```json
{
  "@type": "Offer",
  "priceCurrency": "AUD",
  "price": "495.00",
  "priceValidUntil": "2026-01-14",
  "availability": "https://schema.org/InStock",
  "url": "https://...",
  "seller": {
    "@type": "Organization",
    "name": "Forever Shining"
  }
}
```

**Features:**
- Currency (AUD)
- Starting price (configurable)
- Price validity (1 year from current date)
- In-stock availability
- Canonical URL
- Seller organization

### 3. BreadcrumbList Schema
Complete navigation hierarchy:

```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://..."},
    {"@type": "ListItem", "position": 2, "name": "Memorial Designs", "item": "https://.../designs"},
    {"@type": "ListItem", "position": 3, "name": "Headstones", "item": "https://.../designs/headstone"},
    {"@type": "ListItem", "position": 4, "name": "Laser-Etched Black Granite", "item": "https://.../designs/laser-etched-headstone"},
    {"@type": "ListItem", "position": 5, "name": "Mother Memorial", "item": "https://.../designs/laser-etched-headstone/mother-memorial"},
    {"@type": "ListItem", "position": 6, "name": "Design Title", "item": "https://.../current-page"}
  ]
}
```

**Features:**
- 6-level navigation hierarchy
- Proper position indexing
- Full URL paths for each level
- Matches actual breadcrumb navigation on page

### 4. ImageObject Schema
Preview image metadata (when available):

```json
{
  "@type": "ImageObject",
  "url": "https://forevershining.com.au/ml/.../screenshot.jpg",
  "contentUrl": "https://forevershining.com.au/ml/.../screenshot.jpg",
  "name": "Mother Memorial – Heart-Shaped Laser-Etched Black Granite Headstone Preview",
  "description": "Preview of mother memorial design",
  "width": "1200",
  "height": "630"
}
```

**Features:**
- Only included when preview image exists
- Proper dimensions for social sharing
- Descriptive name and description
- Both url and contentUrl properties

## Dynamic Data Generation

### Product Title Format
```
{Category} – {Shape}-Shaped {Product} {Type}
```

Examples:
- "Mother Memorial – Heart-Shaped Laser-Etched Black Granite Headstone"
- "Father Memorial – Gable-Shaped Traditional Engraved Headstone"
- "Pet Memorial – Serpentine-Shaped Bronze Plaque"

### SKU Format
```
FS-{TYPE}-{SHAPE}-{PRODUCT}-{CATEGORY}
```

Examples:
- `FS-HEADSTONE-HEART-LASER-ETCHED-BLACK-GRANITE-MOTHER-MEMORIAL`
- `FS-PLAQUE-SQUARE-BRONZE-PET-MEMORIAL`
- `FS-MONUMENT-GABLE-TRADITIONAL-ENGRAVED-FATHER-MEMORIAL`

### Material Detection
Automatically determined from product name:
- "Black granite" - if product contains "granite"
- "Bronze" - if product contains "bronze"
- "Stainless steel" - if product contains "stainless"
- Default: "Granite"

### Color Detection
Automatically determined from product:
- "Black" - if product contains "black"
- "Bronze" - if product contains "bronze"
- "Silver" - if product contains "stainless"
- Default: "Black"

### Finish Detection
Automatically determined from product:
- "Laser-etched" - if product contains "laser"
- "Traditional engraved" - if product contains "traditional"
- Default: "Laser-etched"

## Additional Properties

Dynamic properties based on design content:

```typescript
[
  { "@type": "PropertyValue", "name": "Shape", "value": shapeName || "Standard" },
  { "@type": "PropertyValue", "name": "Finish", "value": finish },
  { "@type": "PropertyValue", "name": "Personalisation", "value": "Inscriptions, verses, motifs" },
  // Conditional properties:
  ...(design.hasMotifs ? [{ "@type": "PropertyValue", "name": "Motifs", "value": "Available" }] : []),
  ...(design.hasPhoto ? [{ "@type": "PropertyValue", "name": "Photo", "value": "Photo placement available" }] : [])
]
```

## Implementation Details

### Location
- **File:** `/app/designs/[productType]/[category]/[slug]/page.tsx`
- **Function:** `SavedDesignPage` component
- **Position:** Before the DesignPageClient component

### Script Tag
```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
/>
```

### Graph Structure
Uses `@graph` array to include multiple schema types in a single JSON-LD block:
```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Product", ... },
    { "@type": "BreadcrumbList", ... },
    { "@type": "ImageObject", ... }
  ]
}
```

## SEO Benefits

### Rich Snippets
Google can display:
- Product information in search results
- Price information
- Availability status
- Star ratings (if reviews added)
- Breadcrumb navigation
- Image previews

### Knowledge Graph
Product information can appear in Google's Knowledge Graph with:
- Product name and description
- Category and material
- Brand information
- Pricing

### Voice Search
Structured data helps voice assistants understand:
- Product attributes
- Pricing
- Availability
- Navigation structure

### E-commerce Features
Enables Google Shopping features:
- Product listings
- Price comparison
- Availability tracking

## Testing

### Google Rich Results Test
```
https://search.google.com/test/rich-results
```
Test URL: `http://localhost:3000/designs/laser-etched-headstone/mother-memorial/1761796985723_...`

### Schema Markup Validator
```
https://validator.schema.org/
```
Paste the generated JSON-LD to validate structure

### View in Browser
1. Visit any design page
2. Right-click → View Page Source
3. Search for `application/ld+json`
4. Copy JSON and paste into validator

## Future Enhancements

### 1. AggregateRating
Add customer reviews and ratings:
```json
{
  "@type": "AggregateRating",
  "ratingValue": "4.8",
  "reviewCount": "127"
}
```

### 2. FAQPage Schema
Add common questions:
```json
{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How long does delivery take?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Standard delivery is 2-3 weeks..."
      }
    }
  ]
}
```

### 3. Review Schema
Individual customer reviews:
```json
{
  "@type": "Review",
  "reviewRating": {"@type": "Rating", "ratingValue": "5"},
  "author": {"@type": "Person", "name": "Customer Name"},
  "reviewBody": "Beautiful design..."
}
```

### 4. Video Schema
If design videos are added:
```json
{
  "@type": "VideoObject",
  "name": "How to customize...",
  "description": "...",
  "thumbnailUrl": "...",
  "uploadDate": "..."
}
```

### 5. Organization Schema
Company information on main pages:
```json
{
  "@type": "Organization",
  "name": "Forever Shining",
  "logo": "...",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+61-...",
    "contactType": "customer service"
  }
}
```

## Maintenance

### Price Updates
Update the default price in the Offer schema:
```typescript
"price": "495.00", // Change this value
```

### Adding New Properties
Add to additionalProperty array:
```typescript
{ "@type": "PropertyValue", "name": "Property Name", "value": "Value" }
```

### URL Configuration
Set base URL in environment variables:
```
NEXT_PUBLIC_BASE_URL=https://forevershining.com.au
```

## Validation Checklist

- [x] Product schema with all required fields
- [x] Offer schema with price and availability
- [x] BreadcrumbList with complete hierarchy
- [x] ImageObject for preview images
- [x] Dynamic SKU generation
- [x] Material and color detection
- [x] Shape name integration
- [x] Conditional properties (motifs, photos)
- [x] Canonical URLs
- [x] Brand information
- [ ] AggregateRating (future)
- [ ] Review schema (future)
- [ ] FAQPage schema (future)

## Example Output

For design ID `1761796985723` (Mother Memorial, Heart, Laser-Etched):

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      "name": "Mother Memorial – Heart-Shaped Laser-Etched Black Granite Headstone",
      "sku": "FS-HEADSTONE-HEART-LASER-ETCHED-BLACK-GRANITE-MOTHER-MEMORIAL",
      "material": "Black granite",
      "color": "Black",
      "additionalProperty": [
        {"@type": "PropertyValue", "name": "Shape", "value": "Heart"},
        {"@type": "PropertyValue", "name": "Finish", "value": "Laser-etched"},
        {"@type": "PropertyValue", "name": "Motifs", "value": "Available"}
      ]
    }
  ]
}
```
