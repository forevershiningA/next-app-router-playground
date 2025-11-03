# SEO Saved Designs Implementation

## Overview
Implemented a programmatic SEO system for saved designs with proper categorization, URL structure, and design loading into the DYO tool.

## URL Structure
```
/designs/{product_type}/{category}/{designId}_{slug}
```

### Examples:
- `/designs/plaque/dedication/1607600942580_loved-and-remembered-forever`
- `/designs/headstone/commemorative/1716611281932_traditional-granite-memorial`

### URL Components:
- **product_type**: `plaque` or `headstone`
- **category**: One of the predefined categories (see below)
- **designId**: Unique timestamp ID from the JSON file (e.g., `1607600942580`)
- **slug**: SEO-friendly description generated from inscription text

## Categories

### Type-Based Categories:
- **Type**: `plaque` | `headstone`

### Style Categories:
- Bronze
- Traditional Engraved Granite
- Laser Etched Black Granite
- Stainless Steel
- Full Color

### Purpose/Theme Categories:
- Address Plaque
- Architectural
- Beautification
- Cemetery Plaque
- Commemorative
- Custom Logo
- Custom Photo
- Dedication
- Fraternity
- Garden Plaque
- Headstone
- Inspirational
- Official Plaque
- Pet Plaque
- Picture Plaque
- Public Art
- Signage
- Urn

### Motif Categories:
- Aquatic, Birds, Butterflies, Cats, Dogs, Farm Animals, Horses, Insects, Mythical Animals, Prehistoric, Reptiles, World Animals
- Australian Wildlife, Australian Flora
- Architectural, Arrows, Borders, Cartoons, Corners
- Children's Toys, Ornaments
- Flourishes, Flowers
- Food & Drink
- Hearts
- History, Festivals
- Household Items
- Islander
- Iconic Places
- Moon & Stars
- Music & Dance
- Nautical
- Official
- Pets
- Plants & Trees
- Religious
- Shapes & Patterns
- Skulls & Weapons
- Sport & Fitness
- Symbols & Zodiac
- Text
- Tools & Office
- Tribal
- USA
- Vehicles

## Data Structure

### Saved Designs Data (`lib/saved-designs-data.ts`)
```typescript
export interface SavedDesignMetadata {
  id: string;              // Unique design ID (timestamp)
  title: string;           // Display title
  description: string;     // SEO description
  category: string;        // Category slug
  productType: 'plaque' | 'headstone';
  img?: string;           // Thumbnail URL
  keywords?: string[];    // SEO keywords
}

export interface CategoryInfo {
  slug: string;
  name: string;
  description: string;
  productType: 'plaque' | 'headstone';
  designs: SavedDesignMetadata[];
}
```

### JSON File Structure
Saved design JSON files are located in:
```
public/ml/forevershining/saved-designs/json/
```

Pattern files (e.g., `tf_0_1_24.json`) contain arrays of designs matching specific filters:
- First digit: Type (0=plaque, 1=headstone)
- Second digit: Style
- Third digit: Motif

Each design entry:
```json
{
  "id": "1716611281932",
  "domain": "www.forevershining.com.au",
  "img": "https://www.forevershining.com.au/design/saved-designs/screenshots/2024/05/1716611281932.jpg",
  "title": "Traditional Engraved Granite Plaque"
}
```

Individual design JSON files (e.g., `1607600942580.json`) contain the full design data with inscriptions, motifs, and product specifications.

## Components

### SEOPanel (`components/SEOPanel.tsx`)
- Sidebar panel for browsing saved designs by category
- Accessible after "Check Price" in the left sidebar
- Shows category list with design counts
- Displays saved design thumbnails with links
- Search functionality for filtering designs

### SavedDesignLoader (`components/SavedDesignLoader.tsx`)
- Hook for loading saved design data: `useSavedDesign(designId)`
- Fetches JSON from `/ml/forevershining/saved-designs/json/{designId}.json`
- Returns design data and loading state

### Design Page Client (`app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx`)
- Client component for rendering design pages
- Auto-loads design into editor on mount
- Shows breadcrumb navigation
- Displays product type and category tags
- Includes full DYO editor with sidebar

## Design Loading

### Coordinate System Conversion
The old CreateJS system used a center-based coordinate system where:
- Container registration point was at center: `container.regX = dyo.w / 2`
- Saved x,y coordinates were pixels from center
- Font sizes stored both pixel size and mm size

Conversion process (`lib/saved-design-loader-utils.ts`):
1. Extract pixel-per-mm ratio from font data:
   ```
   pixelsPerMm = font_px / font_size_mm
   ```
2. Convert saved pixel positions to mm:
   ```
   xMmFromCenter = xPixels / pixelsPerMm
   yMmFromCenter = yPixels / pixelsPerMm
   ```
3. Use as direct offsets (center-based):
   ```
   xPos = xMmFromCenter
   yPos = yMmFromCenter
   ```

### Product Type Mapping
Product IDs from saved designs map to product types:
- 124: Headstone - Traditional Engraved Granite
- 4: Headstone - Laser Etched Black Granite
- 34: Plaque - Traditional Engraved Granite
- 30: Plaque - Laser Etched Black Granite
- 32: Plaque - Full Color
- 52/31: Plaque - Stainless Steel
- 5: Plaque - Bronze
- 8: Pet Headstone - Laser Etched
- 9: Pet Plaque - Laser Etched
- 22: Mini Headstone - Laser Etched
- 2350: Urn - Stainless Steel

### Loading Process
1. Parse design JSON
2. Set product type based on `productid`
3. Clear existing inscriptions, motifs, and additions
4. Set product properties (texture, dimensions)
5. Convert and load inscriptions with correct positioning
6. Load motifs and photos (if applicable)

## SEO Features

### Metadata Generation
Each design page includes:
- Dynamic title from design content
- Description from first inscription or category
- Product type and category tags
- Breadcrumb navigation
- Structured heading tags (h1, h2)

### Privacy Features (To Be Implemented)
- `anonymizeDesignData()`: Replaces names with placeholders
- `checkForDuplicates()`: Detects similar designs
- Functions in `lib/saved-design-loader-utils.ts`

## File Structure
```
app/
  designs/
    [productType]/
      [category]/
        [slug]/
          page.tsx              # Dynamic route page
          DesignPageClient.tsx  # Client component

components/
  SEOPanel.tsx                  # SEO sidebar panel
  SavedDesignLoader.tsx         # Design loading hook
  LeftSidebar.tsx              # Main sidebar (includes SEO panel)

lib/
  saved-designs-data.ts         # Categories and design metadata
  saved-design-loader-utils.ts  # Design loading utilities

public/
  ml/
    forevershining/
      saved-designs/
        json/                   # Saved design JSON files
          tf_0_1_24.json       # Pattern-based design lists
          {designId}.json      # Individual design data
        screenshots/           # Design thumbnails
```

## Usage

### Adding New Categories
Edit `lib/saved-designs-data.ts`:
```typescript
export const CATEGORIES: CategoryInfo[] = [
  {
    slug: 'new-category',
    name: 'New Category',
    description: 'Description for SEO',
    productType: 'plaque',
    designs: [
      {
        id: '1234567890',
        title: 'Design Title',
        description: 'Design description',
        category: 'new-category',
        productType: 'plaque',
      }
    ]
  },
  // ...
];
```

### Accessing SEO Panel
1. Navigate to `/headstone` or `/plaque`
2. Scroll in left sidebar to "SEO" section (after Check Price)
3. Click to expand category list
4. Select a category to view designs
5. Click on a design to open it in the editor

### Direct URL Access
Navigate directly to: `/designs/{productType}/{category}/{designId}_{slug}`

The design will automatically:
- Load into the DYO editor
- Show with correct product type
- Position inscriptions accurately
- Display sidebar for editing
- Show breadcrumb navigation

## Notes

### Current Limitations
1. Only inscriptions are currently loaded (motifs and photos pending)
2. Privacy features (anonymization, duplicate detection) not yet active
3. Category assignments are based on simple mapping (can be enhanced with ML)

### Future Enhancements
1. Load motifs and photos from saved designs
2. Implement duplicate detection before publishing
3. Add name anonymization for privacy
4. Enhanced category assignment using ML data
5. Thumbnail generation for designs without screenshots
6. Sitemap generation for SEO
7. Related designs suggestions
8. Design analytics and tracking
