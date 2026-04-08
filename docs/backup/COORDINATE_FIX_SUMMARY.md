# Canonical Design Coordinate System Fix - Summary

**Date:** 2026-01-26
**Status:** IN PROGRESS - Coordinate offset needs adjustment

## What We've Accomplished

1. ✅ Fixed browser caching (changed fetch to `cache: 'no-cache'`)
2. ✅ Added flip support (flipX/flipY throughout pipeline)
3. ✅ Increased AutoFit tolerance (5mm → 50mm)
4. ✅ Removed camera vertical offset (set to 0)
5. ✅ Increased AutoFit margin (1.04 → 1.20)
6. ✅ All 9 inscriptions and 8 motifs are loading
7. ✅ Confirmed headstone is 610mm tall (correct dimensions)

## Current Issue

**Elements are positioned TOO HIGH** - appearing above the headstone instead of on it.

### Analysis

**Headstone in 3D scene:**
- Bounding box: min Y = 0mm, max Y = 610mm, center Y = 305mm
- In assembly's local coordinate space, bottom is at Y=0, center at Y=305mm

**Canonical coordinates (from JSON):**
- "KLEIN": y = 232mm
- "MIGUEL THOMPSON": y = -49mm
- Bottom motifs: y = -267mm

**Current adjustment:**
```typescript
adjustedYPos = yPos + (headstoneHeightMm / 2)  // +304.8mm
```

This shifts:
- "KLEIN": 232 + 305 = 537mm ✓ (should be in upper portion)
- "MIGUEL": -49 + 305 = 256mm ✓ (should be in lower-middle)
- But visually everything appears TOO HIGH!

## Possible Causes

### Theory 1: Conversion Script Reference Point
The conversion script might already be outputting coordinates relative to headstone BOTTOM, not CENTER.

**Check:** Look at line 219 in `convert-legacy-design.js`:
```javascript
const yMm = round(-canvasY * mmPerPxY);
```

This negates the canvas Y (which has origin at center, Y-down). If the canvas shows only the headstone (not headstone+base), then:
- Canvas center = headstone center
- Y=0 in canvas = headstone center in legacy
- Converted yMm = 0 should mean headstone center

But the visual evidence suggests otherwise.

### Theory 2: Legacy Canvas Included Base
If the legacy 2D designer canvas showed headstone+base together:
- Canvas height = headstoneHeight + baseHeight
- Canvas center = center of combined stage
- This would NOT be at headstone center!

Need to check: Does `productHeight` in conversion include base or not?

Line 87: `const productHeight = headstoneHeight;` (base NOT included)
Line 100: `const pixelsPerMmY = designCanvasHeight / Math.max(productHeight, 1);`

This confirms conversion uses ONLY headstone height, so canonical should be headstone-center-based.

## Next Steps

### Option A: No Offset (Test Theory)
Try with NO offset to see actual baseline:
```typescript
const adjustedYPos = yPos; // No adjustment
```

If this positions things correctly, it means the canonical coordinates are ALREADY in the right reference frame.

### Option B: Smaller Offset
Maybe the offset should be smaller. Try:
```typescript
const adjustedYPos = yPos + (headstoneHeightMm / 4); // Quarter height
```

### Option C: Fix Conversion Script
Update `scripts/convert-legacy-design.js` to output coordinates in the correct reference frame for the 3D scene.

## Files Modified

1. `lib/headstone-store.ts` - Added flipX/flipY
2. `lib/saved-design-loader-utils.ts` - Tolerance, flip, coordinate adjustment
3. `components/three/MotifModel.tsx` - Flip rendering
4. `components/three/AutoFit.tsx` - Removed vertical offset, increased margin
5. `components/DefaultDesignLoader.tsx` - Changed to no-cache
6. `components/HeadstoneInscription.tsx` - Added bounding box logging

## Recommendation

**NEXT: Try removing the offset entirely** to confirm where canonical coordinates actually place elements. Then calculate the exact offset needed from there.

