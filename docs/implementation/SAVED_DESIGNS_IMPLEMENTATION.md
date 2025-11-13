# Saved Designs Programmatic SEO Implementation

This implementation categorizes saved designs from `public/ml/forevershining/saved-designs/` and creates programmatic SEO URLs for the DYO application.

## Overview

The system analyzes thousands of saved design JSON files, categorizes them intelligently, and creates SEO-friendly URLs that can be used to pre-populate the DYO design tool.

## Architecture

### 1. Data Structure (`lib/saved-designs-data.ts`)

The core data file defines:
- **18 Design Categories**: Address Plaque, Architectural, Beautification, Cemetery Plaque, Commemorative, Custom Logo, Custom Photo, Dedication, Fraternity, Garden Plaque, Headstone, Inspirational, Official Plaque, Pet Plaque, Picture Plaque, Public Art, Signage, Urn
- **Metadata Interface**: Each design has an ID, category, slug, title, description, keywords, and flags for photos/logos
- **Helper Functions**: Get designs by category, generate URLs, search functionality

### 2. Categorization Script (`scripts/categorize-saved-designs.js`)

Analyzes all saved design JSON files and:
- Extracts inscriptions and product type
- Categorizes based on keywords and content
- Generates SEO-friendly slugs
- Creates titles and descriptions from inscriptions
- Extracts relevant keywords
- Outputs categorized data to TypeScript file

**Run the script:**
```bash
node scripts/categorize-saved-designs.js
```

This will:
1. Process all JSON files in `public/ml/forevershining/saved-designs/json/`
2. Update `lib/saved-designs-data.ts` with categorized designs
3. Generate `SAVED_DESIGNS_URLS.md` with example URLs

### 3. Design Loader Component (`components/SavedDesignLoader.tsx`)

React component and hooks for loading saved designs:
- `SavedDesignLoader`: Component to load and display a design
- `useSavedDesign`: Hook to fetch saved design data
- `convertSavedDesignToDYO`: Converts old format to new DYO format

### 4. Dynamic Pages (`app/select-product/[productType]/[category]/[slug]/page.tsx`)

Next.js App Router page template for saved designs:
- Dynamic routing: `/select-product/{productType}/{category}/{slug}`
- SEO metadata generation
- Breadcrumb navigation
- Design preview and customization interface
- Related designs and features

## URL Structure

### Pattern
```
/select-product/{productType}/{category}/{slug}
```

### Examples
```
/select-product/headstone/memorial/bevan-john-ugle-beloved-father
/select-product/bronze-plaque/dedication/in-loving-memory-of-john-smith
/select-product/bronze-plaque/pet-plaque/beloved-companion-max-the-dog
/select-product/bronze-plaque/commemorative/100th-anniversary-celebration
```

## Categorization Logic

The script uses keyword matching and AI-like heuristics to categorize designs:

### Headstones
- Keywords: `headstone`, `memorial`, `granite`, `grave`, `burial`
- Product type: `Headstone`

### Pet Plaques
- Keywords: `pet`, `dog`, `cat`, `beloved pet`, `companion`
- Common phrases: Names followed by species

### Dedication
- Keywords: `dedicated`, `in honor`, `in memory`, `donated by`
- Phrases indicating tribute or memorial

### Commemorative
- Keywords: `commemorate`, `anniversary`, `celebration`, `milestone`
- Date ranges and establishment years

## Integration with DYO Tool

### Loading a Saved Design

```typescript
import { useSavedDesign, convertSavedDesignToDYO } from '@/components/SavedDesignLoader';

function DesignEditor({ designId }) {
  const { design, loading, error } = useSavedDesign(designId);
  
  if (design) {
    const dyoFormat = convertSavedDesignToDYO(design);
    // Load into your DYO tool
  }
}
```

### Accessing Design Data

```typescript
import { getSavedDesign, getDesignsByCategory, searchDesigns } from '@/lib/saved-designs-data';

// Get specific design
const design = getSavedDesign('1577938315050');

// Get all headstones
const headstones = getDesignsByCategory('headstone');

// Search designs
const results = searchDesigns('memorial father');
```

## SEO Benefits

1. **Thousands of Unique Pages**: Each saved design gets its own optimized page
2. **Long-tail Keywords**: Titles and descriptions use actual inscription content
3. **Category Organization**: Clear hierarchy for search engines
4. **Internal Linking**: Related designs and category pages
5. **Rich Content**: Descriptions based on actual inscriptions

## Example Design Data

```typescript
{
  id: '1577938315050',
  category: 'headstone',
  slug: 'bevan-john-ugle-beloved-father-memorial',
  title: 'Bevan John Ugle - Beloved Father Memorial',
  description: 'Blue Pearl granite headstone for Bevan John Ugle with family inscriptions',
  productType: 'Headstone',
  keywords: ['headstone', 'memorial', 'blue pearl', 'family', 'father'],
  hasPhoto: false,
  hasLogo: false
}
```

## Files Created

1. `lib/saved-designs-data.ts` - Core data structure and helper functions
2. `scripts/categorize-saved-designs.js` - Analysis and categorization script
3. `components/SavedDesignLoader.tsx` - React component for loading designs
4. `app/select-product/[productType]/[category]/[slug]/page.tsx` - Dynamic page template
5. `SAVED_DESIGNS_URLS.md` - Generated list of example URLs (after running script)

## Next Steps

1. **Run the categorization script** to populate the data:
   ```bash
   node scripts/categorize-saved-designs.js
   ```

2. **Review categorization** in the generated `SAVED_DESIGNS_URLS.md` file

3. **Integrate with DYO tool**: Update your design editor to accept design IDs from URL params

4. **Add sitemap generation**: Create a sitemap with all design URLs

5. **Implement search**: Add search functionality using the `searchDesigns` function

6. **Add related designs**: Show similar designs based on category and keywords

7. **Create category landing pages**: Build pages for each category showing all designs

## Sitemap Example

```typescript
// app/sitemap.ts
import { SAVED_DESIGNS, getDesignUrl } from '@/lib/saved-designs-data';

export default function sitemap() {
  const designUrls = Object.values(SAVED_DESIGNS).map(design => ({
    url: `https://yourdomain.com${getDesignUrl(design)}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));
  
  return [
    { url: 'https://yourdomain.com', lastModified: new Date(), priority: 1 },
    ...designUrls
  ];
}
```

## Performance Considerations

- Designs are loaded on-demand via fetch to avoid bundling thousands of JSON files
- Use Next.js ISR (Incremental Static Regeneration) for popular designs
- Implement caching for design data
- Consider CDN for JSON files

## Analytics & Tracking

Track which designs are popular:
- Page views per design
- Conversion rates by category
- Most searched keywords
- Time spent customizing each design type

This will help optimize the categorization and improve SEO over time.
