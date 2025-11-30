# SVG Generator Updated with Correct Coordinate System

## Changes Applied

Updated `/lib/svg-generator.ts` to use the **correct MM to PX scaling** based on base width, matching the test HTML implementations.

## What Changed

### Before (WRONG):
```typescript
// Scaled shape to fit within canvas
const shapeScale = Math.min(canvasWidth / shapeViewBox.vw, canvasHeight / shapeViewBox.vh);
const shapeDx = (canvasWidth - shapeViewBox.vw * shapeScale) / 2;
const shapeDy = (canvasHeight - shapeViewBox.vh * shapeScale) / 2;
```

### After (CORRECT):
```typescript
// Extract base and calculate MM to PX scale
const base = designData.find(item => item.type === 'Base');
const baseWidthMm = base?.width || headstone.width || 700;
const mmToPxScale = canvasWidth / baseWidthMm;

// Convert headstone MM dimensions to canvas pixels
const headstoneWidthPx = headstone.width * mmToPxScale;
const headstoneHeightPx = headstone.height * mmToPxScale;

// Scale shape based on headstone dimensions (not canvas)
const shapeScale = Math.min(
  headstoneWidthPx / shapeViewBox.vw,
  headstoneHeightPx / shapeViewBox.vh
);

// Position at top of canvas, centered horizontally
const shapeDx = (canvasWidth - shapeViewBox.vw * shapeScale) / 2;
const shapeDy = -centerY; // Top of canvas
```

## The Core Formula

**Base width establishes the MM→PX scale for the entire canvas:**

```javascript
MM to PX Scale = Canvas Width (px) / Base Width (mm)

Example (Design 1654222051474):
  Canvas: 1212 px
  Base: 700 mm
  Scale: 1212 / 700 = 1.731 px/mm
  
  Headstone: 600 mm
  In canvas: 600 × 1.731 = 1038.6 px
```

## Why This Matters

### The Problem:
The previous code was scaling the headstone to **fit the canvas**, which meant:
- On a 1212×1212 canvas, headstone would scale to ~1212px wide
- But the actual headstone is only 600mm (should be 1038.6px)
- This made the headstone **too large** by ~16%

### The Solution:
Now the headstone is scaled based on its **physical millimeter dimensions**:
- Base width (e.g., 700mm) = 100% of canvas width
- Headstone width (e.g., 600mm) = 85.7% of canvas width
- Scale factor calculated from MM dimensions, not canvas fit

## Affected Pages

This fix applies to **ALL saved designs** accessed via URLs like:
- http://localhost:3000/designs/traditional-headstone/biblical-memorial/curved-top-for-god-so-loved-the-world
- http://localhost:3000/designs/traditional-headstone/biblical-memorial/curved-gable-may-heavens-eternal-happiness-be-thine
- Any design page using the SVG generator

## Examples

### Design 1654222051474 (Curved Top):
```
Base: 700mm → 1212px canvas
Headstone: 600mm → 1038.6px (85.7% of canvas)
Scale: 2.597 (was ~3.03 - WRONG!)
```

### Design 1725769905504 (Curved Gable):
```
Base: 700mm → 1066px canvas  
Headstone: 609.6mm → 928.3px (87.1% of canvas)
Scale: 2.321 (was ~2.665 - WRONG!)
```

## Additional Logging

Added comprehensive logging to help debug:
```typescript
console.log('🎨 SVG Generator - Canvas Info:', {
  canvasWidth,
  canvasHeight,
  baseWidthMm,
  mmToPxScale,
  headstoneWidthMm,
  headstoneHeightMm,
  headstoneWidthPx,
  headstoneHeightPx,
  calculationMethod: 'MM to PX based on base width'
});
```

## Testing

To verify the fix works:

1. **Clear browser cache** (SVG is cached)
2. **Open test design:**
   - http://localhost:3000/designs/traditional-headstone/biblical-memorial/curved-top-for-god-so-loved-the-world
3. **Check browser console** for logging output
4. **Compare with test HTML:**
   - file:///C:/Users/polcr/Documents/github/next-dyo/test-curved-top-design.html
5. **Verify headstone size** matches (should be 85.7% of canvas width for design 1654222051474)

## Coordinate System Consistency

The live page now uses the **same approach** as the test HTML:

✅ Canvas dimensions from screenshot  
✅ ViewBox centered at (0, 0)  
✅ MM to PX scale from base width  
✅ Headstone sized by physical dimensions  
✅ Headstone positioned at top of canvas  
✅ All coordinates are RAW (no DPR division)  
✅ Text Y = vertical center (dominant-baseline="middle")  

## Files Modified

1. **lib/svg-generator.ts** - Lines 191-232: Added MM to PX calculation and corrected headstone scaling

## Next Steps

1. Test with multiple designs (different shapes, devices, DPR values)
2. Verify cached SVGs are regenerated
3. Check that inscriptions and motifs still align correctly
4. Validate on both desktop and mobile designs

## Success Criteria

✅ Headstone matches physical proportions (e.g., 85.7% for 600mm/700mm)  
✅ Headstone positioned at top (not centered)  
✅ All text and motifs in correct positions  
✅ No elements cut off or misaligned  
✅ Console shows correct MM→PX calculations  
