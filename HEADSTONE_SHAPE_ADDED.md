# Test HTML Updated with Headstone Shape

## Changes Made

1. **Added Curved Gable SVG shape** from `public/shapes/headstones/curved_gable.svg`
2. **Added G633 granite texture** from `public/textures/forever2/l/G633.jpg`
3. **Corrected dimension understanding** - 609.6×609.6 is in **millimeters**, not pixels
4. **Applied proper scaling and centering** to match the actual design

## Headstone Shape Details

### From JSON:
```json
{
  "shape": "Curved Gable",
  "width": 609.6,      // millimeters
  "height": 609.6,     // millimeters
  "texture": "src/granites/forever2/l/G633.jpg"
}
```

### SVG Shape:
- **File:** `public/shapes/headstones/curved_gable.svg`
- **ViewBox:** `0 0 400.05 400` (intrinsic SVG coordinates)
- **Path:** Curved top with gable (rounded peaked top)

### Scaling Calculation:
```javascript
// Headstone visual size in canvas: 609.6 pixels
// SVG intrinsic size: 400 × 400
// Scale factor: 609.6 / 400 ≈ 1.524

// Position to center at (0, 0):
// translate(-304.8, -304.8) = translate(-609.6/2, -609.6/2)
```

### Transform Applied:
```svg
<g transform="translate(-304.8, -304.8) scale(1.524)">
  <path fill="url(#graniteTexture)" d="M400 99.7 L400 400..."/>
</g>
```

## Granite Texture

### Pattern Definition:
```svg
<pattern id="graniteTexture" patternUnits="userSpaceOnUse" width="520" height="520">
  <image href="public/textures/forever2/l/G633.jpg" x="0" y="0" width="520" height="520"/>
</pattern>
```

- **Texture:** G633 (gray granite)
- **Tile size:** 520×520 pixels
- **Pattern units:** userSpaceOnUse (scales with coordinate system)
- **Fill:** Applied to headstone shape path

## Physical vs Display Dimensions

### Understanding the Values:

1. **Physical dimensions (mm):**
   - Headstone: 609.6 × 609.6 mm (real-world size)
   - This is stored in JSON as `width` and `height`

2. **Canvas dimensions (px):**
   - Screenshot: 1066 × 1078 pixels (what was captured)
   - These represent the coordinate system space

3. **Display scaling:**
   - The 609.6mm physical size is ALSO used as 609.6px in the canvas
   - This creates a 1:1 mapping between mm and canvas pixels for the headstone
   - Inscriptions/motifs are positioned relative to this canvas

### Why This Works:

The canvas coordinate system uses the physical millimeter dimensions directly as pixel values:
- 609.6 mm → 609.6 canvas pixels
- Centered at (0, 0) in the canvas
- Extends from (-304.8, -304.8) to (304.8, 304.8)

## Visual Result

Open the test HTML and you should now see:

✅ **Curved Gable shape** with actual path geometry  
✅ **G633 granite texture** filling the shape  
✅ **Proper centering** at canvas origin (0, 0)  
✅ **Correct scale** (609.6×609.6 in canvas coordinates)  
✅ **Blue outline** showing shape boundary  
✅ **All inscriptions** positioned relative to shape  
✅ **All motifs** positioned with actual SVG images  

## Comparison Points

When comparing test HTML vs live page, check:

1. **Shape rendering:**
   - Is the Curved Gable path correct?
   - Is the granite texture visible and tiled correctly?
   - Is the shape centered in the canvas?

2. **Element positioning:**
   - Do inscriptions align with the test HTML?
   - Are motifs at the correct positions?
   - Do rotated/flipped motifs match?

3. **Scaling:**
   - Is the shape the right size (609.6×609.6)?
   - Are elements proportionally correct?

## File Paths Used

```
public/shapes/headstones/curved_gable.svg
public/textures/forever2/l/G633.jpg
public/shapes/motifs/1_155_13.svg
public/shapes/motifs/1_154_15.svg
public/shapes/motifs/1_184_13.svg
public/shapes/motifs/1_129_03.svg
public/shapes/motifs/1_016_05.svg
public/shapes/motifs/cross_001.svg
```

All paths use `public/` prefix for local file access.

## Next Steps

1. **Open test HTML** - Verify shape and texture load correctly
2. **Compare with live page** - Check if shapes match
3. **Inspect positioning** - All elements should align perfectly
4. **Note differences** - Any misalignment reveals what needs fixing in SVG generator

The test HTML now shows the **complete, accurate reference** with actual headstone shape and granite texture!
