# Canonical Design Coordinate System Fix

**Date:** 2026-01-23  
**Status:** ⚠️ IN PROGRESS - Investigating coordinate mismatch

## Problem

When loading canonical v2026 design files (e.g., `1725769905504.json`), inscriptions and motifs appear in completely wrong positions - scattered all over the canvas, some floating far above the headstone.

### 2026-01-25 Update
- `scripts/convert-legacy-design.js` now mirrors the live editor loader by converting Y offsets with simple `pixelsPerMm` math (no stage/base shifting) while negating both motif and inscription Y values so top-of-tablet copy stays above lower inscriptions.
- `loadCanonicalDesignIntoEditor()`'s guard rails now treat the headstone + base stack as the allowable envelope so canonical snapshots using stage-centered coordinates no longer trigger an automatic legacy fallback.

### Root Cause Analysis

**Coordinate System Complexity:**

1. **Legacy JSON** (CreateJS stage):
   - Origin at CENTER of (headstone + base) stack
   - Y-down coordinate system (positive Y = below center)
   - Example: "KLEIN" at `y: -262.28px` (above center in Y-down)

2. **Canonical JSON** (after conversion):
   - Origin at CENTER of headstone ONLY (not including base)
   - Still uses a stage-like coordinate system
   - Example: "KLEIN" at `y_mm: 220.118` 

3. **3D Editor** (Three.js scene):
   - Origin at CENTER of headstone
   - Y-up coordinate system (positive Y = above center)
   - Expects values in millimeters

**The Conversion Formula:**
```javascript
// scripts/convert-legacy-design.js line 140
function legacyYToCanonical(yPx, targetSurface, metrics) {
  const stageMm = yPx / stagePixelsPerMm;
  const baseHalf = metrics.baseHeight / 2;
  return -(stageMm + baseHalf);  // Negate and shift origin
}
```

This formula:
1. Converts pixels to mm
2. Adds baseHalf to shift origin from "center of stack" to "center of headstone"
3. Negates to convert from Y-down to Y-up

**Example for "KLEIN":**
- Input: `yPx = -262.28` (above center in legacy Y-down)
- Stage: `-262.28px ÷ pixelsPerMm ≈ -220mm`
- Shift: `-220mm + 50mm = -170mm`
- Negate: `-(-170mm) = +170mm` ❌

BUT the canonical JSON has `+220.118mm`! This suggests either:
1. The conversion script has a bug, OR
2. There's additional logic we're missing

### Visual Evidence

See `screen.png` - the original design (left) vs. the broken 3D render (right) showed:
- "KLEIN" heading needs to be near top (should be around +220mm in Y-up)
- Date/name inscriptions scattered incorrectly
- Motifs (roses, crosses) in wrong locations

## Current Investigation

Need to verify:
1. ✅ Conversion script formula is mathematically correct
2. ❓ Why does canonical JSON have different values than formula produces?
3. ❓ What coordinate system does 3D editor actually use?
4. ❓ Is there a Y-negation happening in the 3D rendering?

## Files Under Investigation

- `scripts/convert-legacy-design.js` - Conversion logic
- `lib/saved-design-loader-utils.ts` - Canonical loader
- `components/HeadstoneInscription.tsx` - 3D rendering
- `app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx` - 2D SVG rendering (working correctly)

## Next Steps

1. Add debug logging to conversion script to trace actual calculations
2. Manually test placing an inscription in 3D editor to see what coordinates it gets
3. Compare with how legacy loader (`loadSavedDesignIntoEditor`) interprets pixel coordinates
4. Consider if the 3D rendering components apply any Y-flips or transforms

## Conclusion

The coordinate conversion is more complex than initially thought due to the three-layer system:
- Legacy stage (headstone+base stack, Y-down, pixels)
- Canonical format (headstone-only, ???, millimeters)  
- 3D editor (headstone-only, Y-up, millimeters)

Further investigation needed to understand the exact transformations required.
