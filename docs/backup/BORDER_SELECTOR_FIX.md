# Border Selector Fix - March 2, 2026

## Issues Fixed

### 1. Missing Border Thumbnails
**Problem**: Border selector only showed 2 thumbnails with 5 empty black boxes
**Cause**: App was loading borders from PostgreSQL database which only had 2 entries
**Solution**: Changed to load borders from `app/_internal/_data.ts` which has all 11 bronze borders

### 2. 404 Errors for Border SVG Files
**Error**: `Failed to load border SVG inlaygranitebordera HttpError: fetch for "http://localhost:3000/shapes/borders/inlaygranitebordera.svg" responded with 404`
**Cause**: Database borders used different naming convention and paths
**Solution**: Reverted to use correct bronze border data with existing SVG files

## Changes Made

### File: `app/layout.tsx`
```typescript
// Before: Loaded from database
const rawBorders = await catalog.borders.findMany(...);
const borders = rawBorders.map(mapBorderRecord);

// After: Load from _data.ts
import { data as internalData } from '#/app/_internal/_data';
const borders = internalData.borders.map((border) => ({
  id: border.id,
  name: border.name,
  category: border.category,
  image: border.image,
}));
```

### File: `components/BorderSelector.tsx`
```typescript
// Updated FALLBACK_BORDERS to match _data.ts
const FALLBACK_BORDERS: BorderOption[] = [
  { id: '0', name: 'No Border', image: 'border0.svg', category: 'bronze' },
  { id: '1', name: 'Border 1', image: 'border1.svg', category: 'bronze' },
  // ... through border10.svg
];
```

## Bronze Borders Available (11 total)

From `app/_internal/_data.ts`:

| ID | Name | Display Name | SVG File | Notes |
|----|------|--------------|----------|-------|
| 0 | No Border | Plain cut (no border) | border0.svg | Default |
| 1 | Border 1 | Bar | border1.svg | |
| 2 | Border 2 | Square | border2.svg | |
| 3 | Border 3 | Solid outline | border3.svg | |
| 4 | Border 4 | Solid | border4.svg | |
| 5 | Border 5 | Notch | border5.svg | |
| 6 | Border 6 | Scallop | border6.svg | |
| 7 | Border 7 | Round outline | border7.svg | |
| 8 | Border 8 | Floral | border8.svg | Evenly spaced |
| 9 | Border 9 | Decorative | border9.svg | Evenly spaced |
| 10 | Border 10 | Square angular | border10.svg | |

## SVG File Locations
All border SVG files exist in: `public/shapes/borders/`
- border0.svg → border10.svg (working)
- border0_*.svg (variants with colors)
- border1a.svg → border10a.svg (alternate versions)

## Database vs _data.ts

**Database borders** (not used for Bronze Plaque):
- Only 7 borders seeded (border-001 through border-007)
- Different naming: "Raised Bronze Border", "Inlay Granite Border", etc.
- Different SVG paths: `/svg/borders/bronze-raised.svg`
- Used for future products (Traditional Headstones)

**_data.ts borders** (now used for Bronze Plaque):
- 11 borders (0-10)
- Simple naming: "Border 1", "Border 2", etc.
- Standard SVG paths: `border1.svg` → prepended with `/shapes/borders/`
- Bronze-specific borders with proper category

## Result
✅ All 11 border thumbnails now display correctly
✅ No more 404 errors for SVG files
✅ Border selector works as expected for Bronze Plaque product

## Related Files
- `app/_internal/_data.ts` - Source of truth for bronze borders
- `app/layout.tsx` - Root layout that loads border data
- `components/BorderSelector.tsx` - Border selection UI component
- `components/BordersLoader.tsx` - Loads borders into global store
- `lib/headstone-store.ts` - Zustand store for borders
- `public/shapes/borders/*.svg` - Border SVG files

## Notes
- Database borders are for future use with Traditional Headstones
- Bronze Plaque uses its own predefined set of borders from _data.ts
- The border selector is rendered in the sidebar via DesignerNav component
- Border selection happens on the `/select-border` route but displays in sidebar
