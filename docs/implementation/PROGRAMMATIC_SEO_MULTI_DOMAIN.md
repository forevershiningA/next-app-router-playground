# Multi-Domain Programmatic SEO Strategy

## Data Sources Available

### 1. HeadstonesDesigner.com (1,180 designs)
- **Products**: Headstones (laser & traditional), Plaques, Urns
- **Shapes**: 52 unique shapes
- **Motifs**: 37 categories
- **Best for**: Headstone-focused SEO

### 2. ForeverShining.com.au (1,573 designs)
- **Products**: Laser Etched Plaques, Headstones, Traditional Engraved
- **Shapes**: Various (Rectangle, Custom shapes)
- **Motifs**: Similar categories
- **Best for**: Australian market, Plaques & Headstones

### 3. Bronze-Plaque.com (188 designs)
- **Products**: Bronze Plaques (various finishes)
- **Shapes**: Bronze Plaque (rectangular)
- **Motifs**: All categories
- **Best for**: Bronze plaque dedication SEO

**TOTAL: 2,941 real customer designs**

## URL Strategy (Domain-Agnostic)

Since different domains have different products, structure URLs by **product type** not domain:

### Route Pattern
```
/designs/[productType]/[category]/[slug]
```

### Product Types (normalized)
1. **bronze-plaque** - All bronze plaque designs
2. **laser-etched-headstone** - Laser etched granite headstones
3. **traditional-headstone** - Traditional engraved headstones
4. **granite-plaque** - Laser etched plaques
5. **memorial-urn** - Urns and cremation memorials

### Examples

**Bronze Plaques**:
```
/designs/bronze-plaque/dedication/staff-sergeant-william-johnson
/designs/bronze-plaque/memorial/[name]
/designs/bronze-plaque/achievement/[title]
```

**Laser Etched Headstones**:
```
/designs/laser-etched-headstone/serpentine-religious/[name]
/designs/laser-etched-headstone/square-flowers/[name]
/designs/laser-etched-headstone/curved-top-hearts/[name]
```

**Granite Plaques**:
```
/designs/granite-plaque/portrait-aquatic/lewis-cooper
/designs/granite-plaque/landscape-flowers/[name]
```

## Metadata Strategy

### For Bronze Plaques
- **Title**: "{Name} Bronze Dedication Plaque - {Motif}"
- **Description**: "Custom bronze plaque for {name}. {Inscription preview}. Professional casting, weather-resistant."
- **Keywords**: bronze plaque, dedication plaque, {motif}, {use case}

### For Headstones
- **Title**: "{Shape} {Motif} Headstone - {Name}"
- **Description**: "{Shape} shaped memorial with {motif} motif. {Size}mm. {Style}. Custom engraving."
- **Keywords**: {shape} headstone, {motif} memorial, {size}mm headstone

### For Plaques
- **Title**: "{Material} {Orientation} Plaque - {Name}"
- **Description**: "{Size}mm {material} memorial plaque. {Motif} design. Professional laser etching."
- **Keywords**: granite plaque, memorial plaque, {motif}

## Implementation Plan

### Step 1: Parse All Three Data Sources
Create unified parser that handles all three ml.json files:

```javascript
const sources = [
  {
    name: 'headstonesdesigner',
    path: 'public/ml/headstonesdesigner/ml.json',
    domain: 'headstonesdesigner.com'
  },
  {
    name: 'forevershining', 
    path: 'public/ml/forevershining/ml.json',
    domain: 'forevershining.com.au'
  },
  {
    name: 'bronze-plaque',
    path: 'public/ml/bronze-plaque/ml.json',
    domain: 'bronze-plaque.com'
  }
];
```

### Step 2: Normalize Product Types
Map product names to normalized types:

```javascript
function normalizeProductType(productName) {
  if (productName.includes('Bronze Plaque')) return 'bronze-plaque';
  if (productName.includes('Laser Etched') && productName.includes('Headstone')) 
    return 'laser-etched-headstone';
  if (productName.includes('Traditional') && productName.includes('Headstone'))
    return 'traditional-headstone';
  if (productName.includes('Plaque')) return 'granite-plaque';
  if (productName.includes('Urn')) return 'memorial-urn';
  return 'memorial';
}
```

### Step 3: Create Category Slug
Combine shape + motif for headstones, or use motif for plaques:

```javascript
function createCategory(design) {
  if (design.productType === 'bronze-plaque') {
    return design.ml_motif.toLowerCase().replace(/\s+/g, '-');
  }
  if (design.productType.includes('headstone')) {
    return `${design.design_shape}-${design.ml_motif}`.toLowerCase().replace(/\s+/g, '-');
  }
  if (design.productType === 'granite-plaque') {
    return `${design.design_orientation}-${design.ml_motif}`.toLowerCase().replace(/\s+/g, '-');
  }
  return 'memorial';
}
```

### Step 4: Route Structure

**File**: `app/designs/[productType]/[category]/[slug]/page.tsx`

```typescript
type Props = {
  params: Promise<{
    productType: string;
    category: string;
    slug: string;
  }>;
};

export async function generateStaticParams() {
  // Top 500 designs across all products
  const topDesigns = getAllDesigns().slice(0, 500);
  
  return topDesigns.map(design => ({
    productType: design.productType,
    category: design.category,
    slug: design.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productType, category, slug } = await params;
  const design = getDesignBySlug(slug);
  
  return {
    title: design.metadata.title,
    description: design.metadata.description,
    keywords: design.metadata.keywords,
  };
}
```

### Step 5: Hub Pages

**Product Type Hubs**: `/designs/[productType]/page.tsx`
- `/designs/bronze-plaque` - Show all bronze plaque designs
- `/designs/laser-etched-headstone` - Show all laser etched headstones

**Category Hubs**: `/designs/[productType]/[category]/page.tsx`
- `/designs/bronze-plaque/dedication` - All dedication plaques
- `/designs/laser-etched-headstone/serpentine-religious` - All serpentine religious

## SEO Benefits

### Scale
- **2,941 unique design pages**
- **50+ product type pages** (normalized)
- **300+ category pages** (product + category combos)
- **Total: 3,300+ indexable pages**

### Keyword Coverage
Each design targets multiple keywords:
- Product type: "bronze plaque", "laser etched headstone"
- Shape: "serpentine", "square", "curved top"
- Motif: "religious", "flowers", "hearts"
- Size: "600mm", "900mm", "1200mm"
- Use case: "dedication", "memorial", "tribute"

### Example SEO Power

**Bronze Plaque for William Johnson**:
- URL: `/designs/bronze-plaque/dedication/staff-sergeant-william-johnson`
- Ranks for:
  - "bronze plaque for staff sergeant"
  - "military dedication bronze plaque"
  - "vietnam war memorial plaque"
  - "kingston war memorial"
  - "purple heart memorial plaque"

**Serpentine Religious Headstone**:
- URL: `/designs/laser-etched-headstone/serpentine-religious/william-darinka`
- Ranks for:
  - "serpentine headstone religious"
  - "serpentine memorial 1067mm"
  - "hearts motif serpentine headstone"
  - "$5000 serpentine headstone"

## Next Steps

1. **Create unified parser** - Process all 3 ML files
2. **Generate combined templates** - 2,941 designs ready
3. **Create route structure** - Product-based URLs
4. **Build hub pages** - Category and type indexes
5. **Deploy** - Watch 3,000+ pages get indexed!

This strategy works regardless of domain because URLs are product-focused, not domain-specific.
