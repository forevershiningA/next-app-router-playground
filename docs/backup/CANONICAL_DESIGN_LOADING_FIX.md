# Canonical Design Loading Fix

**Date:** 2026-01-26  
**Issue:** Canonical v2026 design format not loading correctly in 3D editor

## Problem Analysis

The canonical design loading system had several issues preventing designs from rendering correctly:

### 1. **Overly Strict Bounds Checking**
- The `canonicalOutOfBounds()` function had a tolerance of only 5mm
- Motifs positioned near the edges (e.g., leaves at y=311mm) exceeded the limit
- This triggered fallback to legacy coordinate processing even though canonical coordinates were correct
- **Root cause:** Headstone half-height (304.8mm) + tolerance (5mm) = 309.8mm limit
- **Example:** motif-14 at y=311.047mm exceeded limit by 1.2mm

### 2. **Missing Flip Support**
- Conversion scripts (`convert-legacy-design.js`, `convert-saved-design.js`) correctly generated flip data
- Canonical JSON contained `flip: { x: boolean, y: boolean }` for each motif
- But the store schema and loader didn't support flip properties
- MotifModel had no code to apply flip transformations

### 3. **Camera Vertical Offset Too Large**
- AutoFit was shifting camera target downward by 10-15% of bounding box height
- For a 700mm tall headstone+base, this meant ~70mm downward shift
- Camera looked at Y=-70mm instead of Y=0mm, cutting off bottom elements
- **All elements with negative Y coordinates were clipped**:
  - Missing inscriptions: names and dates at y=-43 to -139mm
  - Missing motifs: crosses/flowers at y=-240 to -267mm

### 4. **Insufficient Debug Logging**
- No visibility into whether canonical or legacy fallback was being used
- No logging of coordinate values during loading
- Made debugging coordinate system issues very difficult

## Changes Made

### 1. Increased Bounds Tolerance (`saved-design-loader-utils.ts`)

```typescript
// Before:
const tolerance = 5;

// After:
const tolerance = 50; // Increased from 5mm to 50mm to allow for motifs near edges
```

**Rationale:** 50mm provides reasonable margin for motifs that extend beyond headstone bounds (e.g., decorative elements on corners).

### 2. Removed Camera Vertical Offset (`components/three/AutoFit.tsx`)

```typescript
// Before:
const tallHeadstoneRatio = boxSize.y > 1 ? 0.10 : 0.15;
const lowProfileRatio = boxSize.y > 0.4 ? 0.08 : 0.12;

// After:
const tallHeadstoneRatio = boxSize.y > 1 ? 0.00 : 0.00; // No offset
const lowProfileRatio = boxSize.y > 0.4 ? 0.00 : 0.00; // No offset
```

**Rationale:** The vertical offset was causing bottom half of headstone to be clipped. Removing it ensures camera centers on the actual bounding box center, showing all content.

### 3. Added Flip Support to Store Schema (`headstone-store.ts`)

```typescript
motifOffsets: Record<
  string,
  {
    xPos: number;
    yPos: number;
    scale: number;
    rotationZ: number;
    heightMm: number;
    target?: 'headstone' | 'base';
    coordinateSpace?: 'absolute' | 'offset';
    flipX?: boolean;  // NEW
    flipY?: boolean;  // NEW
  }
>;
```

### 4. Updated Canonical Loader (`saved-design-loader-utils.ts`)

Added flip data extraction and logging:

```typescript
const flipX = motif.flip?.x ?? false;
const flipY = motif.flip?.y ?? false;

console.log(`[loadCanonicalDesignIntoEditor] Motif ${motif.id}: pos=(${xPos.toFixed(1)}, ${yPos.toFixed(1)})mm, height=${heightMm}mm, flip=(${flipX},${flipY})`);

store.setMotifOffset(newMotif.id, {
  xPos,
  yPos,
  scale: 1.0,
  rotationZ,
  heightMm,
  target,
  coordinateSpace: 'absolute',
  flipX,  // NEW
  flipY,  // NEW
});
```

### 5. Updated Legacy Fallback Loader (`saved-design-loader-utils.ts`)

Both in `loadCanonicalDesignIntoEditor` legacy path and `loadSavedDesignIntoEditor`:

```typescript
const flipX = typeof motif.flipx === 'number' ? motif.flipx === 1 : false;
const flipY = typeof motif.flipy === 'number' ? motif.flipy === 1 : false;

store.setMotifOffset(newMotif.id, {
  // ... other properties
  flipX,
  flipY,
});
```

### 6. Applied Flip in MotifModel (`components/three/MotifModel.tsx`)

```typescript
// Apply flip transformations
// Legacy flip values: flipx/flipy = 1 means "mirror that axis"
// Default: SVGs are Y-down, so we flip Y by default (-finalScale on Y)
// If legacy had flipY=1, that flip is preserved in canonical flip.y=true
const flipX = offset.flipX ?? false;
const flipY = offset.flipY ?? false;

// X-axis: flip if flipX is true
const scaleX = finalScale * (flipX ? -1 : 1);

// Y-axis: default -finalScale (Y-down to Y-up), then apply flipY
// If flipY=true (legacy was flipped), we flip again: -finalScale * -1 = +finalScale
// If flipY=false (legacy was not flipped), keep default: -finalScale * 1 = -finalScale
const scaleY = -finalScale * (flipY ? -1 : 1);
```

Updated mesh scale:
```typescript
<group scale={[scaleX, scaleY, 1]}>
```

### 7. Enhanced Debug Logging

**Canonical loader:**
```typescript
console.log('[loadCanonicalDesignIntoEditor] Using canonical coordinates (no fallback needed)');
console.log(`[loadCanonicalDesignIntoEditor] Inscription "${text}": pos=(...), size=...`);
console.log(`[loadCanonicalDesignIntoEditor] Motif ${motif.id}: pos=(...), flip=(...)`);
```

**Bounds check:**
```typescript
console.log('[loadCanonicalDesignIntoEditor] Headstone bounds:', {
  headstoneHalf,
  baseHalf,
  limit
});
```

**AutoFit:**
```typescript
console.log('[AutoFit] Bounding box:', {
  min, max, size, centerBefore, verticalOffset, showBase
});
```

**MotifModel:**
```typescript
console.log('[MotifModel] Positioning:', {
  id,
  isCanonical,
  offset,
  center,
  display,
  flip: { x: flipX, y: flipY },
  scale: { x: scaleX, y: scaleY }
});
```

## Coordinate System Reference

### Canonical Format (v2026)
- **Units:** Millimeters (1 unit = 1mm)
- **Origin:** Headstone center (not including base)
- **X-axis:** Positive right, negative left
- **Y-axis:** Positive up, negative down (Y-up system)
- **Position storage:** Absolute world coordinates in mm

### Legacy Format (2D Designer)
- **Units:** Pixels (relative to canvas size)
- **Origin:** Canvas center (includes headstone + base)
- **X-axis:** Positive right, negative left
- **Y-axis:** Positive down, negative up (Y-down system)
- **Position storage:** Pixel offsets from center

### Conversion Formula

From legacy pixels to canonical mm:

```typescript
// 1. Detect viewport size and DPR
const viewportWidth = navigator.match(/(\d+)x(\d+)/)[1] || init_width;
const viewportHeight = navigator.match(/(\d+)x(\d+)/)[2] || init_height;
const designDpr = normalizeDesignDpr(dpr, device);

// 2. Calculate pixels-per-mm ratios
const mmPerPxX = headstoneWidthMm / viewportWidth;
const mmPerPxY = headstoneHeightMm / viewportHeight;

// 3. Convert pixel coordinates to mm
const canvasX = usesPhysicalCoords ? xPixels / designDpr : xPixels;
const canvasY = usesPhysicalCoords ? yPixels / designDpr : yPixels;
const xMm = canvasX * mmPerPxX;
const yMm = -canvasY * mmPerPxY; // Negate to flip Y-down to Y-up
```

## Flip Logic

### Legacy System
- `flipx: 1` = Mirror horizontally
- `flipy: 1` = Mirror vertically
- Default (no flip): `flipx: -1, flipy: -1`

### Canonical System
- `flip.x: true` = Mirror horizontally
- `flip.y: true` = Mirror vertically
- Default (no flip): `flip.x: false, flip.y: false`

### 3D Rendering
SVGs are stored in Y-down format by default, so:
- **Base Y-scale:** `-finalScale` (flips Y-down to Y-up)
- **If flipY=true:** Multiply by -1 again (un-flips, back to Y-down)
- **If flipY=false:** Keep base flip (stays in Y-up)

## Testing Checklist

- [x] Increase tolerance from 5mm to 50mm
- [x] Remove camera vertical offset
- [x] Add flipX/flipY to store schema
- [x] Extract flip from canonical JSON
- [x] Extract flip from legacy fallback
- [x] Extract flip from regular legacy loader
- [x] Apply flip scaling in MotifModel
- [x] Add comprehensive debug logging
- [x] Test with design 1725769905504.json

## Expected Result

When loading `/canonical-designs/v2026/1725769905504.json`:

1. Console should show: `Using canonical coordinates (no fallback needed)`
2. All 9 inscriptions should load with correct positions:
   - "KLEIN" at top
   - "May Heaven's..." below it
   - Left side: "MIGUEL THOMPSON" + dates
   - Right side: "TERESA ISABELLA", "ISABEL WADE" + dates
3. All 8 motifs should load with correct positions and orientations:
   - Top: Leaves and flowers (motif-10, 13, 14, 17)
   - Center: Dove (motif-11)
   - Bottom: Crosses/flowers (motif-9, 16, 18)
4. Motifs should display with correct flip states
5. No fallback to legacy coordinate processing
6. Design should match the 2D preview exactly

## Files Modified

1. `lib/headstone-store.ts` - Added flipX/flipY to schema
2. `lib/saved-design-loader-utils.ts` - Tolerance, flip loading, logging
3. `components/three/MotifModel.tsx` - Flip rendering
4. `components/three/AutoFit.tsx` - Removed vertical offset
5. `CANONICAL_DESIGN_LOADING_FIX.md` - This documentation

## Related Documentation

- `STARTER.md` - See "Canonical v2026 Saved Design Pipeline" section
- `scripts/convert-legacy-design.js` - Conversion script implementation
- `public/canonical-designs/v2026/1725769905504.json` - Example canonical design

