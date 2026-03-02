# Materials Database Fix - February 28, 2026

## Issue
The materials table in PostgreSQL contained incorrect placeholder materials (Polished Black Granite, Luka Grey, etc.) that didn't match the actual granite materials from `_data.ts`.

## Solution
Replaced database materials with the correct 29 granite materials from `app/_internal/_data.ts`.

## Changes Made

### 1. Fixed `scripts/seed-materials.ts`
- **Added dotenv loading**: Reads `.env.local` to get `DATABASE_URL`
- **Removed duplicate**: Deleted duplicate "Darwin Brown" entry (was ID 10)
- **Updated file extensions**: Changed from `.jpg` to `.webp` to match actual texture files
- **Fixed texture paths**: 
  - Thumbnail: `/textures/forever/l/{material}.webp`
  - Texture: `/textures/forever/l/{material}.webp` (stored in attributes)
- **Added proper logging**: Shows all inserted materials with slugs and IDs
- **Added connection cleanup**: Properly closes database connection

### 2. Updated `package.json`
- Added script: `"db:seed-materials": "tsx scripts/seed-materials.ts"`
- Run with: `npm run db:seed-materials`

## Materials Seeded (29 total)

| ID | Name | Slug | Texture File |
|----|------|------|--------------|
| 53 | African Black | african-black | African-Black.webp |
| 54 | African Red | african-red | African-Red.webp |
| 55 | Australian Calca | australian-calca | Australian-Calca.webp |
| 56 | Australian Grandee | australian-grandee | Australian-Grandee.webp |
| 57 | Balmoral Green | balmoral-green | Balmoral-Green.webp |
| 58 | Balmoral Red | balmoral-red | Balmoral-Red.webp |
| 59 | Blue Pearl | blue-pearl | Blue-Pearl.webp |
| 60 | Chinese Calca | chinese-calca | Chinese-Calca.webp |
| 61 | Darwin Brown | darwin-brown | Darwin-Brown.webp |
| 62 | Emerald Pearl | emerald-pearl | Emerald-Pearl.webp |
| 63 | English Brown | english-brown | English-Brown.webp |
| 64 | G439 | g439 | G439.webp |
| 65 | G623 | g623 | G623.webp |
| 66 | G633 | g633 | G633.webp |
| 67 | G654 | g654 | G654.webp |
| 68 | G788 | g788 | G788.webp |
| 69 | Glory Gold Spots | glory-gold-spots | Glory-Gold-Spots.webp |
| 70 | Glory Black | glory-black | Glory-Black-2.webp |
| 71 | G9426 | g9426 | G9426.webp |
| 72 | Imperial Red | imperial-red | Imperial-Red.webp |
| 73 | Marron Brown | marron-brown | Marron-Brown.webp |
| 74 | Multicolour Red | multicolour-red | Multicolour-red.webp |
| 75 | Noble Black | noble-black | Noble-Black.webp |
| 76 | Noble Red | noble-red | Noble-Red.webp |
| 77 | Paradiso | paradiso | Paradiso.webp |
| 78 | Sandstone | sandstone | Sandstone.webp |
| 79 | Sapphire Brown | sapphire-brown | Saphire-Brown.webp |
| 80 | Visage Blue | visage-blue | Vizage-Blue.webp |
| 81 | White Carrara | white-carrara | White-Carrara.webp |

## Texture File Paths

All materials use textures from:
- **Thumbnails**: `/textures/forever/l/{material}.webp`
- **Full Textures**: `/textures/forever/l/{material}.webp`

Note: The `/m/` (medium) directory contains TILE versions with inconsistent naming, so we use `/l/` (large) for both thumbnails and textures.

## Database Schema

```typescript
materials {
  id: serial (auto-increment)
  slug: text (unique, lowercase-with-dashes)
  name: text (display name)
  category: 'granite'
  finish: 'polished'
  thumbnailUrl: text (/textures/forever/l/...)
  attributes: jsonb ({ textureUrl: '/textures/forever/l/...' })
  isActive: boolean (true)
  createdAt: timestamp
  updatedAt: timestamp
}
```

## Verification

Run these commands to verify:

```bash
# Seed materials
npm run db:seed-materials

# Open Drizzle Studio to view
npm run db:studio
```

## Files Modified

1. `scripts/seed-materials.ts` - Fixed paths and file extensions
2. `package.json` - Added db:seed-materials script
3. `MATERIALS_DATABASE_FIX.md` - This documentation (NEW)

## Status

✅ **COMPLETE** - Materials database now contains correct granite materials with proper texture paths matching the Traditional Engraved Headstone requirements.
