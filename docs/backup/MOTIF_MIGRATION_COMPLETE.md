# Motif Categories Migration - Complete

## Summary
Successfully migrated all 49 motif categories from `_data.ts` to PostgreSQL database.

## What Was Done

### 1. **Identified the Issue**
   - `/select-motifs` was only showing 4 categories (floral, faith, nature, symbol)
   - Root cause: Postgres only had 15 motifs in 4 categories from `sql/seed-data.sql`
   - The old `_data.ts` file had 49 categories but was being replaced by Postgres data

### 2. **Created Migration Scripts**
   - **SQL Script**: `sql/migrate-motif-categories.sql` (for manual psql execution)
   - **Node.js Script**: `scripts/migrate-motif-categories.js` (for automated execution)

### 3. **Migrated All 49 Categories**

Executed migration script which added:

**Animals (12 categories):**
- Aquatic Animals, Birds, Butterflies, Cats, Dogs, Farm Animals
- Horses, Insects, Mystical Animals, Prehistoric, Reptiles, World Animals

**Regional & Cultural (5):**
- Australian Wildlife, Australian Flora, Islander, American, Tribal

**Architecture & Design (6):**
- Architectural, Borders, Corners, Florish, Flourishes, Shapes and Patterns

**Nature & Flora (2):**
- Flower Inserts, Plants and Trees

**Symbols & Icons (4):**
- Arrows, Hearts and Ribbons, Moon and Stars, Zodiac Symbols

**Religious & Spiritual (1):**
- Religious

**Lifestyle & Hobbies (17):**
- Cartoons and Animals, Children Toys, Food and Drink, History and Culture
- Holiday, Household Items, Iconic Places, Music and Dance, Nautical
- Official, Pets, Skulls and Weapons, Sport and Fitness, Text
- Tools and Professions, Vehicles

**Special Types (2):**
- 1 Colour Motifs, 2 Colour Motifs

### 4. **Updated UI Component**
Modified `components/MotifOverlayPanel.tsx` to use `motifsCatalog` from Zustand store (loaded from Postgres) with fallback to `data.motifs` for backwards compatibility.

## Final Database State
- **Total Motif Categories**: 63
  - 15 original from seed-data.sql
  - 48 newly migrated categories
  
## How to Re-run Migration
If you need to run the migration again:

```bash
# Using Node.js script (recommended)
npx tsx --env-file=.env.local scripts/migrate-motif-categories.js

# Using SQL script (manual)
psql -U postgres -d headstonesdesigner -f sql/migrate-motif-categories.sql
```

## Files Modified
1. `components/MotifOverlayPanel.tsx` - Updated to use Postgres data
2. `sql/migrate-motif-categories.sql` - SQL migration script (new)
3. `scripts/migrate-motif-categories.js` - Node.js migration script (new)

## Next Steps
- Test `/select-motifs` page to confirm all 49+ categories are visible
- Individual motif files will continue to be loaded dynamically from `public/motifs/` directory
- Categories are now centrally managed in Postgres for easier updates

## Notes
- Each category record includes metadata: `src` (folder path), `traditional`, `ss` (stainless steel), `col1`/`col2` flags
- Preview URLs point to existing thumbnail images in `/png/motifs/s/`
- All categories have a default price of $100.00 (10000 cents)
- The migration uses `ON CONFLICT (sku) DO UPDATE` so it's safe to run multiple times
