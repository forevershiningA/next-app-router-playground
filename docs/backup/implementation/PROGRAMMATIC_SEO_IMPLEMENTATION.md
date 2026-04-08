# Programmatic SEO Implementation Plan for DYO

## Overview
Transform the DYO app into a programmatic SEO powerhouse by creating deeply nested URL structures that pre-populate the design tool with SEO-optimized content, metadata, and heading tags.

## URL Structure Strategy

### Current Structure
```
/select-product
/select-product/[section]
/select-product/[section]/[category]
```

### New Programmatic SEO Structure
```
/select-product/bronze-plaque
/select-product/bronze-plaque/dedication/[venue]/[inscription]
/select-product/bronze-plaque/memorial/[name]/[dates]
/select-product/bronze-plaque/achievement/[title]/[description]

/select-product/laser-etched-black-granite-headstone
/select-product/laser-etched-black-granite-headstone/memorial/[name]/[epitaph]
/select-product/laser-etched-black-granite-headstone/[shape]/[material]
/select-product/laser-etched-black-granite-headstone/[shape]/[material]/[size]

/select-material/[material-name]
/select-material/[material-name]/[shape]
/select-shape/[shape-name]
/select-shape/[shape-name]/[material]
```

## Implementation Steps

### 1. Create SEO Data Structure

**File: `lib/seo-templates.ts`**
- Define templates for each product type
- Include metadata templates
- Define heading structures
- Create inscription/dedication templates
- Define common use cases and keywords

### 2. Extend Product Data Model

**File: `app/_internal/_data.ts`**
Add SEO fields:
```typescript
export type Product = {
  id: string;
  name: string;
  slug: string; // URL-friendly slug
  image: string;
  category: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    templates: TemplateType[];
    useCases: UseCase[];
  };
};
```

### 3. Create Dynamic Route Structure

#### Route: `/app/select-product/[productSlug]/page.tsx`
- Display product with SEO-optimized metadata
- H1: Product name with keywords
- Show template options
- Link to deeper pages

#### Route: `/app/select-product/[productSlug]/[templateType]/page.tsx`
- Template types: dedication, memorial, achievement, tribute
- H1: "{Product} for {Template Type}"
- Show example venues/names
- Pre-populate store with template defaults

#### Route: `/app/select-product/[productSlug]/[templateType]/[param1]/page.tsx`
- H1: "{Product} {Template Type} for {Param1}"
- Pre-populate first inscription line
- Show related examples

#### Route: `/app/select-product/[productSlug]/[templateType]/[param1]/[param2]/page.tsx`
- H1: Full specific title
- Fully pre-populated design
- Ready for personalization
- Strong CTA to customize

### 4. Material & Shape SEO Routes

#### Route: `/app/select-material/[materialSlug]/page.tsx`
- H1: "{Material Name} Headstone Material"
- Meta: "Design a {Material} headstone..."
- Content: Material properties, best for, pricing
- Link to shape combinations

#### Route: `/app/select-material/[materialSlug]/[shapeSlug]/page.tsx`
- H1: "{Material} {Shape} Headstone"
- Pre-select material and shape
- Show example designs
- Jump directly to size selection

#### Route: `/app/select-shape/[shapeSlug]/page.tsx`
- H1: "{Shape} Headstone Shape"
- Meta: "Design a {Shape} shaped headstone..."
- Show material options
- Display dimensions info

#### Route: `/app/select-shape/[shapeSlug]/[materialSlug]/page.tsx`
- Same as material/shape but reversed
- Cross-linking strategy

### 5. Size-Based SEO Routes

```
/select-size/600mm
/select-size/900mm
/select-size/1200mm
/select-size/[width]x[height]
```

### 6. Complete Journey Routes

```
/design/[product]/[material]/[shape]/[size]
/design/bronze-plaque/dark-bronze/square/600mm
```

## SEO Optimization Features

### Dynamic Metadata Generation
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const { productSlug, templateType, param1, param2 } = params;
  
  return {
    title: `${productName} ${templateType} - ${param1} | DYO`,
    description: `Design a ${productName} for ${param1}. ${param2}. Custom engraving...`,
    keywords: [productName, templateType, param1, material, shape],
    openGraph: {
      title: `${productName} ${templateType} - ${param1}`,
      description: `..`,
      images: [generateOGImage(params)],
    },
    alternates: {
      canonical: `/select-product/${productSlug}/${templateType}/${param1}/${param2}`
    }
  };
}
```

### Heading Structure
Each page follows proper H1-H6 hierarchy:
```html
<h1>{Main SEO Title}</h1>
<h2>Design Your {Product}</h2>
<h3>Features & Specifications</h3>
<h4>Material Options</h4>
<h5>Size Guide</h5>
```

### Structured Data (JSON-LD)
```typescript
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "{Product} {Template}",
  "description": "...",
  "offers": {
    "@type": "Offer",
    "price": "calculated",
    "priceCurrency": "USD"
  },
  "category": "Memorial Products"
}
```

## Template Examples

### Bronze Plaque Dedication Templates
```typescript
const dedicationTemplates = [
  {
    venue: 'the-science-hall',
    inscription: 'knowledge-is-the-seed-of-progress',
    category: 'education',
    metadata: {
      title: 'Bronze Plaque Dedication for Science Hall',
      description: 'Design a bronze dedication plaque...'
    }
  },
  {
    venue: 'memorial-garden',
    inscription: 'in-loving-memory-of-those-who-served',
    category: 'military',
  },
  // 100+ templates
];
```

### Headstone Memorial Templates
```typescript
const memorialTemplates = [
  {
    name: 'john-smith',
    dates: '1950-2023',
    epitaph: 'forever-in-our-hearts',
    shape: 'serpentine',
    material: 'imperial-red',
  },
  // Name patterns, date formats, common epitaphs
];
```

## generateStaticParams Strategy

### Priority Levels
1. **Tier 1** (Generate at build): Top 100 most searched combinations
2. **Tier 2** (ISR): Common variations, regenerate weekly
3. **Tier 3** (On-demand): Generated on first request, cached

```typescript
export async function generateStaticParams() {
  // Generate top product + template combinations
  const tier1Params = [
    { productSlug: 'bronze-plaque', templateType: 'dedication' },
    { productSlug: 'laser-etched-black-granite-headstone', templateType: 'memorial' },
    // Top 100
  ];
  
  return tier1Params;
}
```

## Content Generation

### Auto-Generated Content Sections
1. **Hero Section**: H1 + description with keywords
2. **Product Overview**: Features list with SEO keywords
3. **Material Information**: Dynamic based on selection
4. **Size Guide**: Cemetery regulations, dimensions
5. **Pricing Calculator**: Transparent pricing
6. **Design Gallery**: Similar designs
7. **FAQ Section**: Schema markup, common questions
8. **Related Products**: Internal linking

### Template Pre-Population
When user lands on specific URL:
```typescript
// URL: /select-product/bronze-plaque/dedication/science-hall/knowledge-is-the-seed-of-progress

// Auto-populate store:
{
  product: 'bronze-plaque',
  inscription1: 'The Science Hall',
  inscription2: 'Knowledge is the seed of progress',
  font: 'times-roman',
  color: 'dark-bronze',
  size: { width: 600, height: 400 }
}
```

## Internal Linking Strategy

### Hub Pages
- `/bronze-plaques` - Links to all bronze plaque variations
- `/granite-headstones` - Links to all granite combinations
- `/serpentine-headstones` - Links to all serpentine shapes
- `/memorial-designs` - Links to memorial templates

### Breadcrumbs
```html
Home > Bronze Plaques > Dedication > Science Hall > Knowledge is the seed of progress
```

## Sitemap Strategy

### Multiple Sitemaps
```
/sitemap.xml (index)
/sitemap-products.xml
/sitemap-materials.xml
/sitemap-shapes.xml
/sitemap-templates.xml
/sitemap-combinations.xml
```

### Priority Levels
- Homepage: 1.0
- Product category pages: 0.9
- Popular combinations: 0.8
- Template pages: 0.7
- Deep combinations: 0.6

## robots.txt Configuration
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: https://yourdomain.com/sitemap.xml
```

## Implementation Priority

### Phase 1: Foundation (Week 1)
1. Create SEO data structure
2. Add slug fields to products, materials, shapes
3. Implement basic dynamic routes
4. Add metadata generation

### Phase 2: Templates (Week 2)
1. Create 50-100 dedication templates
2. Create 50-100 memorial templates
3. Implement template pre-population
4. Add structured data

### Phase 3: Combinations (Week 3)
1. Material + Shape routes
2. Size-based routes
3. Complete journey routes
4. Internal linking system

### Phase 4: Content & Optimization (Week 4)
1. Generate content templates
2. Add FAQ sections
3. Implement sitemaps
4. Performance optimization
5. Launch & monitor

## Expected SEO Impact

### Target Keywords (Examples)
- "bronze plaque for science hall"
- "imperial red serpentine headstone"
- "600mm gothic headstone blue pearl granite"
- "memorial plaque dedication wording"
- "laser etched black granite headstone design"

### Projected Results
- **Month 1-2**: Index 1000+ pages
- **Month 3-4**: Start ranking for long-tail keywords
- **Month 6**: Organic traffic increase 300%
- **Month 12**: Dominant rankings for product + variation searches

## Monitoring & Analytics

### Track Metrics
1. Pages indexed (Google Search Console)
2. Keyword rankings per URL pattern
3. Click-through rates by template type
4. Conversion rates: SEO page → Design tool → Checkout
5. Most popular URL patterns
6. Bounce rate by depth level

### A/B Testing
- H1 formats
- Meta description templates
- Content length on deep pages
- CTA placement and wording

## Technical SEO Checklist

- ✅ Proper canonical URLs
- ✅ Mobile-responsive (already have)
- ✅ Fast page load (optimize with Next.js ISR)
- ✅ Structured data on all pages
- ✅ XML sitemaps with proper priority
- ✅ Internal linking strategy
- ✅ Breadcrumb navigation
- ✅ Alt text for all images
- ✅ Semantic HTML structure
- ✅ HTTPS (Vercel default)
- ✅ Clean URL structure (no query params)

## Example Full Implementation

### URL Pattern
`/select-product/bronze-plaque/dedication/the-science-hall/knowledge-is-the-seed-of-progress`

### Page Output
- **Title**: "Bronze Plaque Dedication for The Science Hall - Knowledge is the Seed of Progress | DYO"
- **Meta Description**: "Design a custom bronze dedication plaque for The Science Hall with the inscription 'Knowledge is the seed of progress'. Professional engraving, worldwide installation."
- **H1**: "Bronze Plaque Dedication for The Science Hall"
- **H2**: "Design Your Custom Dedication Plaque"
- **Pre-populated Design**: Ready to personalize
- **CTA**: "Customize This Design" → Jumps to inscription editor

This creates thousands of indexed, rankable pages that drive qualified traffic directly into the design tool.
