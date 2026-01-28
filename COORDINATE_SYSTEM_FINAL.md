# Coordinate System - Final Understanding

**Date:** 2026-01-23  
**Status:** ✅ RESOLVED

## Problem Summary

When loading canonical v2026 design files into the 3D editor, motifs were floating above the headstone instead of positioning correctly. The issue was caused by incorrect Y-coordinate transformations.

## Root Cause

The canonical loader was **negating the Y coordinate** for motifs:
```typescript
const yPos = -yRaw; // WRONG - causes motifs to flip vertically
```

This negation was based on a misleading comment that suggested the old 3D renderer flipped the entire scene. In reality, both the legacy loader and 3D renderer use the same coordinate conversion **without negation**.

## The Correct Conversion

### Legacy JSON → 3D Editor

Both inscriptions and motifs use identical conversion:

```javascript
// Legacy JSON stores pixels from canvas center (Y-down convention)
const xPixels = item.x;  // e.g., +302
const yPixels = item.y;  // e.g., +302

// Convert to mm using design-time pixel density
const xPos = xPixels / pixelsPerMmX;
const yPos = yPixels / pixelsPerMmY;  // NO NEGATION!

// Result is mm from headstone center
// The 3D editor uses these values directly
```

**Example:**
- Legacy: `y = +302px` (Y-down, positive = below center)
- Pixels per mm: `1.130 px/mm`
- Result: `yPos = 302 / 1.130 = 267mm`
- This positions element 267mm below headstone center in the 3D scene

## Why No Negation?

The legacy system stored coordinates in a **Y-down** convention (positive Y = down), but the 3D editor interprets these values in its own coordinate space where:
- The canvas center is at (0, 0)
- Positive values move elements in their respective directions
- The visual result matches because both systems are internally consistent

The key insight: **We're not converting between Y-up and Y-down**. We're converting from **pixels (at canvas center) to millimeters (at headstone center)**. Both use center-based coordinates, so no flip is needed.

## Files Fixed

### 1. `lib/saved-design-loader-utils.ts`

**Legacy fallback path (line ~696):**
```typescript
// BEFORE (wrong):
const yPos = -yMmFromCenter;

// AFTER (correct):
const yPos = yMmFromCenter;  // Use as-is, no negation for motifs
```

**Canonical motif path (line ~630):**
```typescript
// BEFORE (wrong):
const yPos = -yRaw; // canonical coords are +Y down; convert to center-offset space

// AFTER (correct):
const yPos = yRaw; // Use canonical coords directly (already in correct space)
```

### 2. `scripts/convert-legacy-design.js`

**Motif conversion (line ~193):**
```javascript
// Keep stage-centred pixel coordinates
const xPx = round(motif.x || 0);
const yPx = round(motif.y || 0);

// Store pixels; loader converts to mm using canonical viewport + component sizes
return {
  position: {
    x_px: xPx,
    y_px: yPx,
  },
  // ...
};
```

## Validation

After the fix, running the test design (1725769905504):

**Console output:**
```
[CANONICAL] Motif 1_155_13: yRaw=267.2 → yPos=267.2, height=45mm
```

**Visual result:**
- ✅ Floral border positioned at top of headstone
- ✅ Birds flanking the floral border
- ✅ Angel statue centered
- ✅ Rose and cross motifs at bottom
- ✅ All inscriptions in correct positions

## Key Takeaway

**The coordinate conversion is simple:**
```
mm_position = pixel_position / pixels_per_mm
```

No negations, no complex transformations. Both inscriptions and motifs use this exact same formula. The canonical JSON stores pre-converted values that are ready to use directly in the 3D editor.

## Related Documentation

- `STARTER.md` - Updated with correct coordinate system explanation
- `CANONICAL_LOADING_COMPLETE.md` - Original implementation notes
- `scripts/convert-legacy-design.js` - Conversion script
- `lib/saved-design-loader-utils.ts` - Loader implementation

## Lessons Learned

1. **Trust the working code:** The 2D SVG renderer (DesignPageClient.tsx) had the correct conversion all along
2. **Beware of misleading comments:** The "Y-flipped" comment led us astray
3. **Test with console logs:** Adding debug output revealed the legacy fallback path was being used
4. **Coordinate systems are about perspective:** Y-down vs Y-up doesn't matter when both systems use center-origin
5. **Consistency is key:** Inscriptions and motifs should use identical conversion logic

---

**Status:** The canonical design loading system now works correctly. Motifs and inscriptions position accurately when loaded from both legacy and canonical JSON formats.
