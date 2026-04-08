# Addition Size Slider Fix - "Size 0" and "Default size" Issues

## Problems Fixed

### Issue 1: "Size 0" Label
The slider was showing:
```
Size 1  ←→  Size 0
```

### Issue 2: "Default size" Text  
For additions not in JSON, it showed:
```
Size: Default size
```
Instead of actual dimensions like `90×180mm`

## Root Causes

1. **Size 0 Issue**: When `activeAddition?.sizes` was undefined, the code still tried to render a slider with labels accessing non-existent data
2. **Default size Issue**: 23 additions exist in the codebase and XML but weren't in the parsed JSON file

## Solutions Applied

### Solution 1: Three-Tier Size Handling

Updated `components/DesignerNav.tsx`:

```typescript
const hasSizeData = activeAddition?.sizes && activeAddition.sizes.length > 0;
const maxSize = activeAddition?.sizes?.length ?? 1;

// Case 1: No size data - fallback (shouldn't happen now)
if (!hasSizeData) {
  return <div>Size: Default size</div>;
}

// Case 2: Single size
if (maxSize === 1) {
  return <div>Size: {width}×{height}mm</div>;
}

// Case 3: Multiple sizes
return <Slider with dimensions />;
```

### Solution 2: Fallback Size Data

Added manual size data in `app/_internal/_additions-loader.ts` for missing additions:

```typescript
const FALLBACK_SIZES = {
  'B1134S': [{ variant: 1, code: 'B1134/S', width: 90, height: 180, ... }],
  'B1134D': [{ variant: 1, code: 'B1134/D', width: 90, height: 180, ... }],
  'B2074S': [{ variant: 1, code: 'B2074/S', width: 70, height: 120, ... }],
  'B2074D': [{ variant: 1, code: 'B2074/D', width: 70, height: 120, ... }],
  'B2497S': [{ variant: 1, code: 'B2497/S', width: 95, height: 150, ... }],
  'B2497D': [{ variant: 1, code: 'B2497/D', width: 95, height: 150, ... }],
};
```

Updated loader:
```typescript
sizes: sizeData?.sizes || fallbackSize || []
```

## Results

### Before:
- B1134S: `Size: Default size` ❌
- B2074S: `Size: Default size` ❌  
- Slider: `Size 1 ←→ Size 0` ❌

### After:
- B1134S: `Size: 90×180mm` ✅
- B2074S: `Size: 70×120mm` ✅
- B2225: `100×100mm [slider] 140×140mm` ✅

## Data Sources

**From XML (motifs-biondan.xml):**
- B1134S: 90×180mm
- B2074S: 70×120mm
- B2497S: 95×150mm

**From JSON (additions-parsed.json):**
- 82 additions with full data
- B2225: 100×100mm, 140×140mm (2 sizes)
- B4599: 190×95mm (1 size)

## Remaining Work

17 more additions still need fallback data added:
- B558, B1154, B1212, B1334, B1343D/S, B1375, B1396
- B1423D/S, B1454, B1467, B1480, B1490, B1535
- B1566, B1650, B1656, B1657, etc.

**Quick fix**: Add them to `FALLBACK_SIZES` object with XML dimensions

**Proper fix**: Re-run XML parser to include all additions in JSON

## Testing

1. **B1134S**: Should show `Size: 90×180mm`
2. **B2225**: Should show slider `100×100mm ←→ 140×140mm`
3. **B4599**: Should show `Size: 190×95mm`

## Files Changed

- `components/DesignerNav.tsx` - UI handling
- `app/_internal/_additions-loader.ts` - Fallback size data added
