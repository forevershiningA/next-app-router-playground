# SVG Rendering Fix - Final - 2025-01-27

## Problems Solved

### 1. Text and motifs too small
**Root cause**: Dividing font sizes and dimensions by DPR when they're already in logical space.
**Fix**: Only divide coordinates by DPR, not dimensions.

### 2. Headstone clipped at top
**Root cause**: ViewBox was canvas size (707x476) but headstone extended beyond (609x609).
**Fix**: Expand viewBox to max(canvas, headstone) dimensions.

### 3. Container height too small
**Root cause**: Fixed 500px height, better millimeter detection using simple threshold.
**Fix**: Calculate from aspect ratio with 20px buffer, use dimension ratio for mm detection.

### 4. Squashed rendering on wide screenshots
**Root cause**: Using viewBox center instead of canvas center for coordinates.
**Fix**: Use canvas center for coordinate conversion, viewBox only for bounds.

### 5. Non-uniform scaling
**Root cause**: Function parameters didn't distinguish between viewBox and canvas dimensions.
**Fix**: Pass both viewBox and canvas dimensions separately to generateShape.

### 6. HTML overlay still rendering
**Root cause**: No early exit when SVG is available.
**Fix**: Skip HTML overlay loading when generatedSVG exists.

## Key Changes

### lib/svg-generator.ts

**Coordinate System Fix:**
```typescript
// Use CANVAS center for coordinates (where they were authored)
const centerX = initWidth / 2;   // e.g., 1126/2 = 563
const centerY = initHeight / 2;  // e.g., 561/2 = 280.5

// NOT viewBox center
// const centerX = viewBoxWidth / 2;  // WRONG: 1200/2 = 600
```

**Shape Generation Fix:**
```typescript
async function generateShape(
  shapeName: string,
  viewBoxWidth: number,    // For bounding box (e.g., 1200)
  viewBoxHeight: number,   // For bounding box (e.g., 1200)
  canvasWidth: number,     // Original canvas (e.g., 1126)
  canvasHeight: number,    // Original canvas (e.g., 561)
  // ...
) {
  // Use headstone dimensions for scale
  const scaleX = headstoneWidth / shapeWidth;   // 1200/400 = 3.0
  const scaleY = headstoneHeight / shapeHeight; // 1200/400 = 3.0
  
  // Center in viewBox
  const offsetX = (viewBoxWidth - headstoneWidth) / 2;   // (1200-1200)/2 = 0
  const offsetY = (viewBoxHeight - headstoneHeight) / 2; // (1200-1200)/2 = 0
}
```

**Better Millimeter Detection:**
```typescript
// OLD: const likelyMillimeters = headstoneWidth < 1000;
// Problem: 609.6 < 1000 = TRUE (incorrectly treated as mm)

// NEW:
const dimensionRatio = headstoneWidth / initWidth; // 609.6 / 707 = 0.86
const likelyMillimeters = dimensionRatio < 0.3 || dimensionRatio > 3.0;
// Result: FALSE (correctly treated as pixels)
```

### app/designs/.../DesignPageClient.tsx

**Skip HTML Overlay:**
```typescript
useEffect(() => {
  // Don't load HTML overlay if we have generated SVG
  if (generatedSVG) {
    logger.log('✅ Using generated SVG - skipping HTML overlay loading');
    return;
  }
  // ... rest of HTML overlay loading
}, [..., generatedSVG]);
```

## Test Cases

### Design 1725769905504 (Curved Gable - Square headstone)
- Canvas: 707 x 476
- Headstone: 609.6 x 609.6
- ViewBox: 707 x 609.6 (expanded height)
- Container: ~707 x 630px
- Scale: uniform (1.524, 1.524)
- ✅ Full headstone visible, no clipping

### Design 1578016189116 (Curved Gable - Wide screenshot)
- Canvas: 1126 x 561  
- Headstone: 1200 x 1200
- ViewBox: 1200 x 1200 (expanded both)
- Container: square aspect ratio
- Scale: uniform (3.0, 3.0)
- ✅ Not squashed, proper proportions

## Testing
1. Clear all SVG cache: `rm public/ml/forevershining/saved-designs/svg/**/*.svg`
2. Restart dev server
3. Test both designs
4. Verify:
   - ✅ Correct text/motif sizes
   - ✅ Correct positions
   - ✅ No clipping
   - ✅ Uniform scaling
   - ✅ No squashing
   - ✅ HTML overlay not rendered

