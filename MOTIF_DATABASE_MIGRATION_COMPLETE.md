# Motif Database Migration Complete

## Overview
Successfully migrated all motif categories and individual motifs from files.txt to PostgreSQL database.

## Fixed Issues

1. **Path Configuration**: Updated all motif paths to use correct directories:
   - Thumbnails: `/png/motifs/s/` (for UI display)
   - SVG shapes: `/shapes/motifs/` (for 3D canvas rendering)

2. **Import Path**: Fixed API route to use `#/lib/db/index` (project uses `#/*` alias, not `@/*`)

3. **Case-Insensitive Category Matching**: Updated query to use `LOWER(category) = LOWER(${category})` to handle case differences between frontend and database

## Migration Summary

### 1. Motif Categories Migration
- **File**: `scripts/migrate-motif-categories.js`
- **Records**: 48 motif categories
- **Features**:
  - Unique SKU for each category (e.g., `MOTIF-CAT-AQUATIC`)
  - Category metadata (traditional, stainless steel, color flags)
  - Preview thumbnail URLs pointing to `/png/motifs/s/`
  - Tags for searchability
  - Default price: $100.00 per category

### 2. Individual Motifs Migration
- **File**: `scripts/migrate-individual-motifs.js`
- **Records**: 6,772 individual motifs
- **Process**:
  1. Reads all category records from database
  2. For each category, reads its `public/motifs/{src}/files.txt`
  3. Parses comma-separated motif filenames
  4. Creates individual motif records with:
     - Unique SKU (e.g., `MOTIF-BIRDS-DOVE-002`)
     - Thumbnail path: `/png/motifs/s/{filename}.png` (for UI display)
     - SVG path: `/shapes/motifs/{filename}.svg` (for 3D canvas)
     - Inherits category attributes (traditional, ss, col1, col2)
     - Default price: $50.00 per motif

### 3. Database Schema
All records stored in the `motifs` table with:
- `sku` (text, unique, primary key)
- `name` (text)
- `category` (text) - category slug
- `tags` (text array)
- `price_cents` (integer)
- `preview_url` (text) - thumbnail image path
- `svg_url` (text) - vector graphic path
- `attributes` (jsonb) - flexible metadata storage
- `is_active` (boolean)
- `created_at`, `updated_at` (timestamps)

### 4. API Endpoints

#### GET /api/motifs/db
Query parameters:
- `category` (optional) - category slug to filter motifs

**Without category parameter:**
Returns all motif categories (records with SKU like 'MOTIF-CAT-%')

**With category parameter:**
Returns all motifs in that category (excludes category records)

Example:
```
GET /api/motifs/db?category=birds
```

Response:
```json
{
  "motifs": [
    {
      "id": "MOTIF-BIRDS-DOVE-002",
      "name": "dove_002",
      "thumbnailPath": "/png/motifs/s/dove_002.png",
      "img": "/png/motifs/s/dove_002.png",
      "svgPath": "/shapes/motifs/dove_002.svg",
      "srcFolder": "Animals/Birds"
    }
  ],
  "count": 61
}
```

### 5. Frontend Integration

**Updated Files:**
- `lib/motifs.ts` - `getMotifCategory()` function now tries database API first, falls back to files.txt
- `components/MotifOverlayPanel.tsx` - Updated thumbnail paths to use `/png/motifs/s/`

**Data Flow:**
1. User opens motif panel
2. Selects a category
3. `useMotifCategory` hook calls `getMotifCategory()`
4. Function fetches from `/api/motifs/db?category={slug}`
5. Returns paginated motif list
6. Displays thumbnails from `/png/motifs/s/`

### File Structure

```
public/
├── motifs/
│   ├── Animals/
│   │   ├── Birds/
│   │   │   ├── files.txt          # Source list of motif names
│   │   │   └── ...
│   │   └── ...
│   └── ...
├── shapes/
│   └── motifs/                     # SVG files for 3D canvas
│       ├── dove_002.svg
│       ├── whale_002.svg
│       └── ... (6,772 SVG files)
└── png/
    └── motifs/
        └── s/                      # Small thumbnails for UI
            ├── dove_002.png
            ├── whale_002.png
            └── ... (6,772 PNG files)
```

### 7. Running Migrations

```bash
# Migrate categories
npx tsx --env-file=.env.local scripts/migrate-motif-categories.js

# Migrate individual motifs
npx tsx --env-file=.env.local scripts/migrate-individual-motifs.js
```

Both scripts are idempotent (safe to run multiple times) thanks to `ON CONFLICT DO UPDATE`.

## Results

### Before
- Motif categories: Hardcoded in `_data.ts`
- Individual motifs: Read from files.txt at runtime
- 4 categories loading issue reported

### After
- Motif categories: 48 in database
- Individual motifs: 6,772 in database
- All categories load correctly
- Thumbnail images display properly
- Fallback to files.txt if database unavailable

## Benefits

1. **Performance**: Database queries are faster than parsing multiple files.txt
2. **Scalability**: Easy to add/edit motifs without file system changes
3. **Searchability**: Can search across all motifs by tags, name, category
4. **Flexibility**: Can easily add pricing, availability, custom attributes
5. **Reliability**: Consistent data structure, no file parsing errors

## Next Steps (Optional)

1. Add search endpoint: `GET /api/motifs/search?q=eagle`
2. Add motif detail endpoint: `GET /api/motifs/[sku]`
3. Admin UI for managing motifs
4. Lazy-load thumbnail images
5. Cache frequently accessed categories
6. Add motif preview in selection UI
