# Shapes Database Fix - February 28, 2026

## Issue
The shapes table in PostgreSQL contained incorrect placeholder shapes (Oval Landscape, Heart Classic, Rectangle, Circle, Traditional Headstone, Curved Top Headstone) that didn't match the actual headstone shapes from `_data.ts`.

## Solution
Replaced database shapes with the correct 55 headstone shapes from `app/_internal/_data.ts`.

## Changes Made

### 1. Created `scripts/seed-shapes.ts`
- **Added dotenv loading**: Reads `.env.local` to get `DATABASE_URL`
- **Two categories**: Traditional (11 shapes) and Modern (44 shapes)
- **Correct paths**: All shapes point to `/shapes/headstones/{shape}.svg`
- **Mask keys**: Set to filename without `.svg` extension
- **Added proper logging**: Shows all inserted shapes with slugs and IDs
- **Added connection cleanup**: Properly closes database connection

### 2. Updated `package.json`
- Added script: `"db:seed-shapes": "tsx scripts/seed-shapes.ts"`
- Run with: `npm run db:seed-shapes`

## Shapes Seeded (55 total)

### Traditional Shapes (11)
| ID | Name | Slug | SVG File |
|----|------|------|----------|
| 12 | Cropped Peak | cropped-peak | cropped_peak.svg |
| 13 | Curved Gable | curved-gable | curved_gable.svg |
| 14 | Curved Peak | curved-peak | curved_peak.svg |
| 15 | Curved Top | curved-top | curved_top.svg |
| 16 | Half Round | half-round | half_round.svg |
| 17 | Gable | gable | gable.svg |
| 18 | Left Wave | left-wave | left_wave.svg |
| 19 | Peak | peak | peak.svg |
| 20 | Right Wave | right-wave | right_wave.svg |
| 21 | Serpentine | serpentine | serpentine.svg |
| 22 | Square | square | square.svg |

### Modern Shapes (44)
| Range | Names | SVG Files |
|-------|-------|-----------|
| IDs 23-24 | Headstone 1-2 | headstone_1.svg - headstone_2.svg |
| IDs 25-29 | Guitar 1-5 | headstone_3.svg - headstone_7.svg |
| IDs 30-66 | Headstone 3-39 | headstone_8.svg - headstone_46.svg |

**Note**: Modern shapes use sequential naming (Headstone 1, Headstone 2, etc.) with Guitar shapes numbered 1-5.

## Shape File Paths

All shapes use SVG files from:
- **Preview URL**: `/shapes/headstones/{shape}.svg`
- **SVG Path**: `/shapes/headstones/{shape}.svg` (stored in attributes)

Directory: `public/shapes/headstones/`

## Database Schema

```typescript
shapes {
  id: serial (auto-increment)
  slug: text (unique, lowercase-with-dashes)
  name: text (display name)
  section: text ('traditional' or 'modern')
  maskKey: text (filename without .svg, e.g., 'curved_gable')
  previewUrl: text (/shapes/headstones/...)
  attributes: jsonb ({ svgPath: '/shapes/headstones/...', category: '...' })
  isActive: boolean (true)
  createdAt: timestamp
  updatedAt: timestamp
}
```

## Shape Categories

- **Traditional (11 shapes)**: Classic headstone designs
  - Cropped Peak, Curved Gable, Curved Peak, Curved Top
  - Half Round, Gable, Left Wave, Peak, Right Wave
  - Serpentine, Square

- **Modern (44 shapes)**: Contemporary and specialty designs
  - Headstone 1-39 (various modern designs)
  - Guitar 1-5 (guitar-shaped memorials)
  - Special designs (seahorse, wolf, etc.)

## Verification

Run these commands to verify:

```bash
# Seed shapes
npm run db:seed-shapes

# Open Drizzle Studio to view
npm run db:studio
```

## Files Modified

1. `scripts/seed-shapes.ts` - NEW seed script for shapes
2. `package.json` - Added db:seed-shapes script
3. `SHAPES_DATABASE_FIX.md` - This documentation (NEW)

## Status

✅ **COMPLETE** - Shapes database now contains correct 55 headstone shapes (11 traditional + 44 modern) with proper SVG paths matching the Traditional Engraved Headstone requirements.

## Next Steps

After seeding, the Select Shape panel will show:
- ✅ Cropped Peak, Curved Gable, Curved Peak, Curved Top (traditional)
- ✅ Half Round, Gable, Left Wave, Peak, Right Wave (traditional)
- ✅ Serpentine, Square (traditional)
- ✅ Headstone 1-39, Guitar 1-5 (modern)

All with correct SVG previews from `public/shapes/headstones/` directory.
