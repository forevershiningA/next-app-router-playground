# Image Processing Implementation

**Date:** 2026-02-20
**Status:** Canvas-based image processing implemented

---

## What Was Implemented

Replaced the simple `handleCropImage()` function with a comprehensive canvas-based image processing pipeline that applies all crop settings before adding images to the 3D scene.

### Key Features

1. **Crop Area Application**
   - Extracts the selected crop area from the uploaded image
   - Converts percentage-based cropArea coordinates to actual pixel coordinates
   - Only the selected region is included in the final image

2. **Transform Application**
   - **Rotation**: Applies cropRotation angle
   - **Flip**: Mirrors image horizontally (flipX) and/or vertically (flipY)
   - **Scale**: Applies cropScale zoom level (as percentage)

3. **Color Mode Filters**
   - **Full Color**: Original colors preserved
   - **Black & White**: Grayscale conversion using luminosity formula (0.299*R + 0.587*G + 0.114*B)
   - **Sepia**: Sepia tone conversion with proper RGB channel mixing

4. **Mask Shape Application**
   - Loads the selected mask SVG (oval, teardrop, heart, etc.)
   - Applies mask as alpha channel to create transparent areas outside the shape
   - Resulting image has the exact shape of the selected mask

5. **Export & Cleanup**
   - Exports processed image as PNG data URL
   - Passes processed image to the 3D scene
   - Clears crop canvas UI (`setCropCanvasData(null)`)
   - Resets all crop state variables

---

## Technical Implementation

### Canvas Processing Pipeline

```
1. Create canvas element
2. Load uploaded image
3. Calculate crop coordinates in pixels
4. Set canvas size to crop dimensions
5. Apply transforms (rotation, flip, scale)
6. Draw cropped portion of image
7. Apply color mode (grayscale or sepia if selected)
8. Load mask SVG
9. Apply mask shape using alpha channel manipulation
10. Export as PNG data URL
11. Add to 3D scene
12. Clean up and close crop UI
```

### Mask Application Method

Instead of using `globalCompositeOperation` (which can be tricky), we:
1. Load the mask SVG into a separate canvas
2. Extract the mask's image data
3. Use the mask's luminosity as the alpha channel multiplier
4. Apply to the cropped image pixel-by-pixel

This ensures clean edges and proper transparency.

---

## Files Modified

### `components/ImageSelector.tsx`

**Changed:**
- `handleCropImage()` - Now async, implements full canvas processing pipeline
- Added `getMaskUrl()` helper function to map mask names to SVG paths

**Added:**
- Comprehensive error handling with try/catch
- Progress feedback during async operations
- Cleanup of crop canvas state after completion

---

## Testing Guide

### Test Cases

1. **Basic Crop**
   - Upload image
   - Select crop area
   - Verify cropped image appears on headstone

2. **Mask Shapes**
   - Test all mask types: oval, horizontal-oval, square, rectangle, heart, teardrop, triangle
   - Verify each shape is properly applied

3. **Transforms**
   - Test rotation at various angles (0°, 90°, 180°, 270°, etc.)
   - Test horizontal flip
   - Test vertical flip
   - Test scale (zoom in/out)

4. **Color Modes**
   - Test full color
   - Test black & white conversion
   - Test sepia tone

5. **Combined Settings**
   - Apply multiple settings together (e.g., rotate + flip + B&W + oval mask)
   - Verify all settings are applied correctly

6. **UI Cleanup**
   - After clicking "Crop Image", verify crop canvas disappears
   - Verify 3D scene is fully visible and interactive

### Expected Results

- ✅ Cropped image appears on headstone with correct shape
- ✅ Image is properly masked (transparent outside shape)
- ✅ All transforms are applied
- ✅ Color mode is correctly applied
- ✅ Crop UI closes after processing
- ✅ No console errors

---

## Known Limitations

1. **SVG Mask Loading**
   - Masks must be black/white SVG images
   - Complex SVG features (gradients, patterns) may not work correctly
   - Relies on SVG files being accessible at expected paths

2. **Image Quality**
   - Output is PNG format (can be large for high-res images)
   - No compression settings exposed
   - Canvas rendering may slightly degrade quality

3. **Performance**
   - Synchronous pixel manipulation for color modes
   - May be slow for very large images (>4000px)
   - No loading indicator during processing

---

## Future Enhancements

### Potential Improvements

1. **Loading Indicator**
   - Show progress spinner during async processing
   - Disable "Crop Image" button while processing

2. **Image Quality Options**
   - Allow user to select output quality
   - Option for JPEG with quality slider vs PNG

3. **Mask Edge Smoothing**
   - Apply anti-aliasing to mask edges
   - Feather option for softer edges

4. **Canvas Optimization**
   - Use OffscreenCanvas for better performance
   - Web Worker for pixel manipulation
   - Progressive processing for large images

5. **Preview**
   - Show real-time preview of final masked image
   - Before/after comparison view

6. **Undo/Redo**
   - Allow stepping back through crop adjustments
   - Save crop presets

---

## Troubleshooting

### Issue: Image appears rectangular, not masked

**Possible Causes:**
- Mask SVG failed to load
- Mask SVG path is incorrect
- Mask SVG format not compatible

**Debug Steps:**
1. Check browser console for SVG load errors
2. Verify mask file exists at `/shapes/masks/[maskname].svg`
3. Inspect mask SVG structure (should be black shape on transparent/white)

### Issue: Image is distorted or stretched

**Possible Causes:**
- Crop area aspect ratio doesn't match mask shape
- Transform order is incorrect

**Debug Steps:**
1. Check cropArea width/height ratio matches mask
2. Verify transform sequence (translate → rotate → scale)

### Issue: Colors look wrong

**Possible Causes:**
- Color mode filter applied incorrectly
- Image data modification after mask application

**Debug Steps:**
1. Test with cropColorMode = 'full' first
2. Check if color filter is applied before or after masking

### Issue: Crop canvas doesn't close

**Possible Causes:**
- `setCropCanvasData(null)` not being called
- State update not triggering re-render

**Debug Steps:**
1. Add console.log before `setCropCanvasData(null)`
2. Check if CropCanvas.tsx has proper conditional rendering
3. Verify cropCanvasData is null in store after clicking button

---

## Code Reference

### Key Code Locations

**Image Processing:**
- File: `components/ImageSelector.tsx`
- Function: `handleCropImage()` (lines 261-400+)

**Mask Bounds:**
- File: `components/CropCanvas.tsx`
- Function: `getMaskShapeBounds()`

**Crop Canvas Rendering:**
- File: `components/CropCanvas.tsx`
- Main render logic with SVG mask overlay

---

## Related Documentation

- `IMAGE_CROP_ISSUES.md` - Problem analysis and solutions
- `STARTER.md` - Original feature specification
- `advice20.txt` - Coordinate system transform guidance
- `advice21.txt` - Dynamic bbox measurement
- `advice22.txt` - Robust SVG measurement techniques
