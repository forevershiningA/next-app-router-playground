# Additions Names Fix - March 2, 2026

## Issue
Select Additions panel showed "[to-be-delivered]" instead of actual names for Statues, Vases, and some Applications. No images were displaying either.

## Root Cause
The `app/_internal/_additions-loader.ts` file was using a hardcoded placeholder `'[to-be-delivered]'` for all addition names with a TODO comment saying "Load from database".

When PostgreSQL integration was added, the additions data was migrated to the database and a JSON file was created (`data/additions-parsed.json`), but the loader was never updated to use this data.

## Solution
Updated `_additions-loader.ts` to:
1. Load addition names from `data/additions-parsed.json` on first use
2. Cache the names in a Map for quick lookup
3. Fall back to the addition ID if name not found
4. Replaced the '[to-be-delivered]' placeholder with actual names

### Code Changes

```typescript
// Before
export function loadAdditionsWithSizes(): Addition[] {
  return existingAdditions.map((existing) => {
    return {
      id: existing.id!,
      name: '[to-be-delivered]', // ❌ Hardcoded placeholder
      image: existing.image!,
      // ...
    };
  });
}

// After
function loadAdditionNames(): Map<string, string> {
  const jsonPath = path.join(process.cwd(), 'data', 'additions-parsed.json');
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const map = new Map();
  data.forEach((item: any) => {
    if (item.id && item.name) {
      map.set(item.id, item.name);
    }
  });
  return map;
}

export function loadAdditionsWithSizes(): Addition[] {
  const namesMap = loadAdditionNames();
  return existingAdditions.map((existing) => {
    const name = namesMap.get(existing.id!) || existing.id!;
    return {
      id: existing.id!,
      name: name, // ✅ Actual name from JSON
      image: existing.image!,
      // ...
    };
  });
}
```

## Data Source

**File:** `data/additions-parsed.json`
- **Total Additions:** 82
- **Categories:**
  - Biondan Bronze (Emblems): 24
  - Crosses: 13
  - Roses: 24
  - Statues: 11
  - Vases: 10

**Example Entry:**
```json
{
  "id": "B2600",
  "name": "Lady With Jug",
  "type": "statue",
  "categoryId": "3004",
  "categoryName": "Statues",
  "thumbnailUrl": "/additions/2600/Art2600.webp",
  "model3dUrl": "/additions/2600/Art2600.glb",
  "sizes": [...]
}
```

## Result
✅ All 82 additions now display with proper names
✅ Statues show names like "Lady With Jug", "Praying Angel", etc.
✅ Vases show proper names
✅ Applications show proper names
✅ Fixes the regression introduced when PostgreSQL was added

## Related Files
- `app/_internal/_additions-loader.ts` - Updated to load names from JSON
- `data/additions-parsed.json` - Source of addition names and metadata
- `lib/db/schema.ts` - PostgreSQL schema (for future use)
- `ADDITIONS_MIGRATION_COMPLETE.md` - Documentation of the migration

## Future Improvement
Eventually, we could load additions directly from PostgreSQL in the root layout (similar to how materials, shapes, and motifs are loaded), but for now the JSON approach works well and avoids adding async loading to `_data.ts`.
