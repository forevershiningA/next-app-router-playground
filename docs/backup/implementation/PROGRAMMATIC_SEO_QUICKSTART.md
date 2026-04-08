# Programmatic SEO Quick Start Guide

## Overview

This implementation transforms your DYO app into a programmatic SEO powerhouse by creating deeply nested URL structures that:

1. **Pre-populate the design tool** with SEO-optimized templates
2. **Generate thousands of rankable pages** from your existing data
3. **Maintain proper metadata, headings, and structured data** for each URL
4. **Drive qualified traffic directly into the design experience**

## URL Pattern Examples

### Already Working
```
/select-product/bronze-plaque
```

### New Programmatic SEO URLs
```
/select-product/bronze-plaque/dedication/the-science-hall/knowledge-is-the-seed-of-progress
/select-product/bronze-plaque/dedication/memorial-garden/in-loving-memory-of-those-who-served
/select-product/laser-etched-black-granite-headstone/memorial/john-smith/forever-in-our-hearts
/select-material/imperial-red
/select-material/imperial-red/serpentine
/select-shape/serpentine/imperial-red
```

## What's Been Created

### 1. SEO Templates Library (`lib/seo-templates.ts`)

Contains:
- **10 Bronze Plaque Dedication Templates** with full metadata
- **5 Memorial Headstone Templates** with shape/material combinations
- **Product SEO Data** for bronze-plaque, laser-etched headstones, etc.
- **Material SEO Data** for imperial-red, blue-pearl, emerald-pearl, etc.
- **Shape SEO Data** for serpentine, peak, gothic, square, etc.
- Helper functions to retrieve templates and generate metadata

### 2. Dynamic Route: Product Detail Page

**File**: `app/select-product/[productSlug]/page.tsx`

**Features**:
- SEO-optimized H1, H2, H3 hierarchy
- Dynamic metadata generation
- Template type cards (dedication, memorial, achievement)
- Use case sections with keywords
- Structured data (JSON-LD)
- Internal linking strategy
- CTA sections

**Example URL**: `/select-product/bronze-plaque`

### 3. Dynamic Route: Full Template Page

**File**: `app/select-product/[productSlug]/[templateType]/[venue]/[inscription]/page.tsx`

**Features**:
- Deep URL structure for SEO
- Breadcrumb navigation with schema markup
- Pre-loaded template information
- CTA to customize (ready to jump into design tool)
- Related templates section
- Detailed specifications
- SEO content sections
- Structured data with breadcrumbs

**Example URL**: `/select-product/bronze-plaque/dedication/the-science-hall/knowledge-is-the-seed-of-progress`

### 4. Implementation Plan Document

**File**: `PROGRAMMATIC_SEO_IMPLEMENTATION.md`

Complete strategy document covering:
- Full URL structure plan
- Phase-by-phase implementation roadmap
- SEO optimization features
- Content generation strategies
- Internal linking architecture
- Sitemap strategy
- Expected SEO impact and timeline

## Next Steps to Complete Implementation

### Phase 1: Test & Validate (This Week)

1. **Test the new routes**:
   ```bash
   pnpm dev
   ```
   Then visit:
   - `/select-product/bronze-plaque`
   - `/select-product/bronze-plaque/dedication/the-science-hall/knowledge-is-the-seed-of-progress`

2. **Verify metadata** appears correctly in browser dev tools

3. **Check 3D scene** still loads properly on these pages

### Phase 2: Connect to Design Tool (Next)

You need to integrate these templates with your Zustand store to pre-populate the design:

**File to modify**: `lib/headstone-store.ts`

Add a function to load template data:

```typescript
// Add to your store
loadTemplate: (templateId: string) => {
  const template = getDedicationTemplate(/* params */);
  if (template) {
    set({
      inscriptionLines: [
        { text: template.venue, /* ... */ },
        { text: template.inscription, /* ... */ },
      ],
      // Set other defaults
    });
  }
},
```

Then update the template page CTA to pass template data via URL params or directly call the store function.

### Phase 3: Add More Routes

1. **Create `/app/select-material/[materialSlug]/page.tsx`**
   - Similar structure to product page
   - Show headstone designs in this material
   - Link to shape combinations

2. **Create `/app/select-material/[materialSlug]/[shapeSlug]/page.tsx`**
   - Pre-select material + shape in store
   - Jump to size selection

3. **Create `/app/select-shape/[shapeSlug]/page.tsx`**
   - Show shape information
   - Link to material options

4. **Create `/app/select-shape/[shapeSlug]/[materialSlug]/page.tsx`**
   - Pre-select shape + material
   - Jump to size selection

### Phase 4: Expand Templates

Add more templates to `lib/seo-templates.ts`:

1. **More Bronze Plaque Dedications** (target: 100+)
   - Different venues (libraries, parks, hospitals, schools)
   - Different inscriptions
   - Different categories

2. **More Memorial Templates** (target: 50+)
   - Common epitaphs
   - Different shape/material combinations
   - Regional variations

3. **Achievement Templates**
   - Sports achievements
   - Academic achievements
   - Military honors

### Phase 5: Generate Static Params

Update `generateStaticParams()` in each route to control which pages are pre-rendered:

```typescript
// In [productSlug]/[templateType]/[venue]/[inscription]/page.tsx

export async function generateStaticParams() {
  // Tier 1: Generate top 100 at build time
  const tier1 = bronzePlaqueDedications.slice(0, 100);
  
  return tier1.map(template => ({
    productSlug: 'bronze-plaque',
    templateType: 'dedication',
    venue: template.venueSlug,
    inscription: template.inscriptionSlug,
  }));
}
```

**Strategy**:
- **Build time**: Top 100 most searched
- **ISR (Incremental Static Regeneration)**: Regenerate weekly
- **On-demand**: Generate on first request for long-tail

### Phase 6: Sitemaps

Create `app/sitemap.ts`:

```typescript
import { MetadataRoute } from 'next';
import { bronzePlaqueDedications, productSEOData } from '#/lib/seo-templates';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://yourdomain.com';
  
  const products = Object.keys(productSEOData).map(slug => ({
    url: `${baseUrl}/select-product/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const templates = bronzePlaqueDedications.map(t => ({
    url: `${baseUrl}/select-product/bronze-plaque/dedication/${t.venueSlug}/${t.inscriptionSlug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...products,
    ...templates,
  ];
}
```

### Phase 7: Analytics & Monitoring

Track these metrics:

1. **Pages indexed** (Google Search Console)
2. **Keyword rankings** per URL pattern
3. **Click-through rates** by template type
4. **Conversion rates**: SEO page → Design started → Quote requested
5. **Most popular templates** (adjust generation strategy)

## SEO Benefits

### Immediate Benefits

1. **Thousands of unique, indexable pages** from existing data
2. **Long-tail keyword targeting** (e.g., "bronze plaque for science hall")
3. **Pre-qualified traffic** (users land on relevant template)
4. **Lower bounce rate** (immediate engagement with design tool)

### Long-term Benefits

1. **Compound SEO growth** as more pages get indexed
2. **Authority building** in memorial/dedication product space
3. **Internal linking power** from hub pages
4. **User-generated content** potential (reviews, galleries per template)

## Technical SEO Checklist

- ✅ Proper H1-H6 hierarchy on all pages
- ✅ Unique metadata per URL
- ✅ Structured data (JSON-LD) with Product and Breadcrumb schemas
- ✅ Canonical URLs
- ✅ Clean URL structure (no query params)
- ✅ Internal linking strategy
- ✅ Mobile-responsive (inherited from app)
- 🔲 Sitemap generation (Phase 6)
- 🔲 robots.txt optimization
- 🔲 OG image generation per template
- 🔲 Performance optimization (image lazy loading)

## Example Search Queries This Will Rank For

### Bronze Plaque Searches
- "bronze plaque for science hall"
- "bronze dedication plaque wording"
- "memorial garden bronze plaque"
- "custom bronze plaque for building"
- "bronze plaque with inscription"

### Headstone Searches
- "imperial red granite serpentine headstone"
- "laser etched black granite memorial"
- "blue pearl gothic headstone"
- "600mm headstone design"
- "forever in our hearts headstone inscription"

### Combination Searches
- "bronze plaque knowledge is the seed of progress"
- "memorial garden dedication ideas"
- "serpentine headstone 900mm imperial red"
- "custom laser etched memorial stone"

## How Users Will Experience This

### Scenario 1: Direct Search
1. User searches: "bronze plaque for science hall"
2. Finds your page: `/select-product/bronze-plaque/dedication/the-science-hall/knowledge-is-the-seed-of-progress`
3. Sees pre-configured template with their exact use case
4. Clicks "Customize This Template"
5. Lands in design tool with inscription pre-populated
6. Makes minor adjustments
7. Gets quote/places order

### Scenario 2: Browse Templates
1. User searches: "bronze dedication plaque"
2. Lands on: `/select-product/bronze-plaque`
3. Sees template types (dedication, memorial, etc.)
4. Clicks "Dedication Templates"
5. Browses venue options
6. Selects specific template
7. Customizes and orders

### Scenario 3: Material + Shape
1. User searches: "imperial red serpentine headstone"
2. Lands on: `/select-material/imperial-red/serpentine`
3. Sees examples with this combination
4. Material and shape pre-selected in tool
5. Proceeds to size selection
6. Adds inscriptions
7. Places order

## Files Summary

### Created
- ✅ `lib/seo-templates.ts` - SEO data and templates
- ✅ `app/select-product/[productSlug]/page.tsx` - Product detail pages
- ✅ `app/select-product/[productSlug]/[templateType]/[venue]/[inscription]/page.tsx` - Deep template pages
- ✅ `PROGRAMMATIC_SEO_IMPLEMENTATION.md` - Full strategy document
- ✅ `PROGRAMMATIC_SEO_QUICKSTART.md` - This file

### To Create (Next Phases)
- 🔲 `app/select-material/[materialSlug]/page.tsx`
- 🔲 `app/select-material/[materialSlug]/[shapeSlug]/page.tsx`
- 🔲 `app/select-shape/[shapeSlug]/page.tsx`
- 🔲 `app/select-shape/[shapeSlug]/[materialSlug]/page.tsx`
- 🔲 `app/sitemap.ts`
- 🔲 `app/robots.ts`

### To Modify
- 🔲 `lib/headstone-store.ts` - Add template loading function
- 🔲 `app/_internal/_data.ts` - Add slug fields to existing data
- 🔲 `app/layout.tsx` - Update base metadata if needed

## Questions & Next Steps

1. **Test the current implementation** by running `pnpm dev`
2. **Review the template data** in `lib/seo-templates.ts` - add your real venue/inscription combinations
3. **Decide on build strategy** - How many pages to pre-render vs on-demand?
4. **Plan store integration** - How should templates pre-populate the design tool?
5. **Expand templates** - Add 50-100 more templates per product type

## Support

If you need help with:
- Connecting templates to the Zustand store
- Generating more template data
- Setting up sitemaps
- Performance optimization
- Analytics integration

Let me know and I'll provide specific implementation code!
