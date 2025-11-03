# Saved Designs SEO Implementation

## Overview
Implemented programmatic SEO system that categorizes and displays saved designs from the old DYO tool, making them accessible via SEO-friendly URLs and loadable into the new DYO editor.

## URL Structure
```
/designs/{productType}/{category}/{slug}
```

- **productType**: `plaque` | `headstone` | `urn` | `pet-headstone` | `pet-plaque`
- **category**: Semantic category (e.g., `dedication`, `commemorative`, `cemetery-plaque`)
- **slug**: `{designId}_{description}` (e.g., `1716611281932_loved-and-remembered-forever`)

### Examples
- `/designs/plaque/dedication/1607600942580_loved-and-remembered-forever`
- `/designs/headstone/memorial/1716611281932_elizabeth-anne-keats`
- `/designs/plaque/commemorative/1661243729292_rest-in-peace`

## Data Structure

### Saved Design Files
Location: `public/ml/forevershining/saved-designs/json/`

Each design is stored as `{designId}.json` containing:
```json
[
  {
    "productid": 34,
    "type": "Headstone",
    "width": 260,
    "height": 145,
    "init_width": 718,
    "init_height": 896,
    "dpr": 1,
    "device": "desktop",
    "navigator": "Chrome (desktop), 1920x1080",
    "texture": "src/granites/forever2/l/African-Black.jpg"
  },
  {
    "type": "Inscription",
    "label": "ELIZABETH ANNE KEATS",
    "font": "48.464999999999996px Garamond",
    "font_size": 18,
    "font_family": "Garamond",
    "x": 10,
    "y": -110,
    "rotation": 0,
    "color": "#ffffff"
  }
]
```

### Categorization Data
File: `lib/saved-designs-data.ts`

Defines categories and assigns designs to them:
```typescript
export interface CategoryInfo {
  id: string;
  name: string;
  description: string;
  productTypes: ('plaque' | 'headstone' | 'urn')[];
  designs: SavedDesignMetadata[];
}

export interface SavedDesignMetadata {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  productType: 'plaque' | 'headstone' | 'urn';
  style?: string;
}
```

## Categories

### Current Categories
Based on product purpose and usage patterns:

1. **Address Plaque** - Property identification
2. **Architectural** - Building dedications
3. **Beautification** - Parks and gardens
4. **Cemetery Plaque** - Cemetery markers
5. **Commemorative** - General memorials
6. **Custom Logo** - Corporate/organization logos
7. **Custom Photo** - Photo-based designs
8. **Dedication** - Dedication plaques
9. **Fraternity** - Clubs and societies
10. **Garden Plaque** - Garden markers
11. **Headstone** - Traditional headstones
12. **Inspirational** - Quotes and verses
13. **Official Plaque** - Government/official
14. **Pet Plaque** - Pet memorials (plaque)
15. **Pet Headstone** - Pet memorials (headstone)
16. **Picture Plaque** - Picture-based
17. **Public Art** - Art installations
18. **Signage** - General signage

### Enhanced Categorization
Designs are also categorized by:
- **Type**: Plaque | Headstone | Urn
- **Style**: Bronze | Traditional Engraved Granite | Laser Etched Black Granite | Stainless Steel | Full Color
- **Motif**: Australian Flora | Australian Wildlife | Religious | Flowers | etc.

## Components

### SEO Panel (`components/SEOPanel.tsx`)
Added to left sidebar after "Check Price" panel. Features:
- Category browser with search
- Design thumbnails with metadata
- Click to load design into editor
- Hierarchical navigation

### Design Page (`app/designs/[productType]/[category]/[slug]/page.tsx`)
- SEO-optimized metadata (title, description, keywords)
- Breadcrumb navigation
- Design preview and information
- "Load Design" button
- "Open Editor" button

### Design Loader (`lib/saved-design-loader-utils.ts`)
Core functionality:
- Loads saved design JSON
- Sets correct product type
- Clears existing design
- Converts coordinates from old system to new
- Adds inscriptions with proper positioning
- Handles motifs and photos

## Coordinate Conversion

### Old DYO System
- Canvas size: `(window.innerWidth - 480) × (window.innerHeight - 128)`
- Origin: Center of canvas
- Units: Screen pixels (affected by DPR)
- Saved positions: Pixels from center (+ right/down, - left/up)

### New DYO System
- Canvas size: Product dimensions in mm
- Origin: Top-left corner
- Units: Millimeters
- Positions: mm from top-left

### Conversion Formula
```typescript
// Old canvas dimensions
const old_canvas_width = init_width - 480;
const old_canvas_height = init_height - 128;

// Pixel to mm conversion
const pixelToMmX = productWidthMm / old_canvas_width;
const pixelToMmY = productHeightMm / old_canvas_height;

// Convert saved position (pixels from center) to mm from center
let xMm = xPixels * pixelToMmX;
let yMm = yPixels * pixelToMmY;

// Convert to top-left origin
const xPos = (currentWidth / 2) + xMm;
const yPos = (currentHeight / 2) + yMm;
```

## SEO Features

### Metadata Generation
Each design page includes:
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  return {
    title: `${design.title} | ${categoryInfo.name} | DYO Designs`,
    description: design.description || categoryInfo.description,
    keywords: design.keywords,
    openGraph: {
      title: design.title,
      description: design.description,
      type: 'website',
    },
  };
}
```

### Static Generation
```typescript
export async function generateStaticParams() {
  // Generates all possible design URLs at build time
  // Improves SEO and performance
}
```

### Structured Data
- Breadcrumb schema
- Product schema
- Design information

## Product ID Mapping

Maps old product IDs to new product types:

| Product ID | Type | Style |
|------------|------|-------|
| 124 | Headstone | Traditional Engraved Granite |
| 34 | Plaque | Traditional Engraved Granite |
| 30 | Plaque | Laser Etched Black Granite |
| 32 | Plaque | Full Color |
| 52 | Plaque | Stainless Steel |
| 5 | Plaque | Bronze |
| 8 | Pet Headstone | Laser Etched Black Granite |
| 9 | Pet Plaque | Laser Etched Black Granite |
| 4 | Headstone | Laser Etched Black Granite |
| 2350 | Urn | Stainless Steel |

## Future Enhancements

### Data Anonymization
- Replace names with placeholders
- Sanitize dates
- Remove sensitive information

### Duplicate Detection
- Compare design similarity
- Merge duplicate designs
- Flag near-duplicates

### Enhanced Metadata
- Auto-generate descriptions from content
- Extract keywords from inscriptions
- Analyze design complexity

### ML Classification
- Auto-categorize new designs
- Suggest categories
- Improve search relevance

## Files Modified/Created

### Created
- `app/designs/page.tsx` - Design gallery index
- `app/designs/[productType]/page.tsx` - Product type filter
- `app/designs/[productType]/[category]/page.tsx` - Category page
- `app/designs/[productType]/[category]/[slug]/page.tsx` - Design detail page
- `app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx` - Client component
- `components/SEOPanel.tsx` - SEO panel component
- `lib/saved-designs-data.ts` - Category and design data
- `lib/saved-design-loader-utils.ts` - Design loading utilities

### Modified
- `components/LeftSidebar.tsx` - Added SEO panel link
- `lib/headstone-store.ts` - Product switching support

## Usage

### For Users
1. Click "SEO" in left sidebar
2. Browse categories or search
3. Click on a design to view details
4. Click "Load Design" to load into editor
5. Design loads with correct product type and positioning
6. Edit and customize as needed

### For SEO
- All design URLs are crawlable
- Metadata optimized for search engines
- Static generation for fast page loads
- Semantic URLs with keywords
- Breadcrumb navigation for site structure

## Notes
- Design positions are automatically converted from old coordinate system
- Product type is set automatically based on saved design data
- Inscriptions are loaded with proper font sizes and positions
- Motifs and photos preserved from original design
- Default motifs/additions from template are cleared before loading
