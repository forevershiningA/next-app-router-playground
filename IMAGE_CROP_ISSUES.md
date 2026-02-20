# Image Crop Feature - Current Issues & Solutions

**Date:** 2026-02-20
**Status:** Multiple issues identified, solutions outlined

---

## Issue 1: Crop Canvas Handlers Not Aligned with Mask

### Problem
The golden outline rectangle and corner handlers don't align with the green mask overlay in CropCanvas.tsx, especially on initial load. After using the "Adjust Size" slider, they become aligned.

### Root Cause
Multiple coordinate system mismatches:
1. Green mask uses `viewBox="0 0 500 500"` with SVG transform
2. Golden rectangle uses same viewBox (FIXED)
3. Handlers were HTML divs with CSS percentages (FIXED - now SVG circles)
4. Initial cropArea aspect ratio didn't match mask aspect ratio

### Current Status
**PARTIALLY FIXED** - All elements now use same SVG coordinate system and transform pipeline:
- ✅ Golden rectangle is SVG rect in same coordinate space as mask
- ✅ Handlers are SVG circles in same coordinate space
- ✅ Both use `viewBox="0 0 500 500"` and get same transform
- ✅ Initial cropArea uses correct aspect ratios (oval: 48×60 = 0.8:1)
- ✅ Bounds added for all mask types (oval, horizontal-oval, square, rectangle, heart, teardrop, triangle)

### Remaining Work
If still not aligned:
1. Check browser console for any errors
2. Verify cropArea state is being set correctly by useEffect
3. May need to implement dynamic `getBBox()` measurement per advice21.txt/advice22.txt
4. Verify SVG files themselves don't have unexpected transforms

### Files Modified
- `components/CropCanvas.tsx` - Golden rectangle & handlers now in same SVG
- `components/ImageSelector.tsx` - Initial cropArea and useEffect for aspect ratios

---

## Issue 2: Crop Canvas UI Visible Over 3D Scene

### Problem
The crop canvas (green mask, golden rectangle, handlers) is rendering on top of the 3D headstone scene when it should only be visible during the crop step.

### Root Cause
`CropCanvas.tsx` renders with `position: absolute` and `inset-0`, making it overlay everything. The `showCropSection` state in ImageSelector.tsx controls visibility, but the component structure may allow it to render over the 3D scene.

### Solution Needed
1. **Conditional Rendering**: Ensure CropCanvas only renders when `cropCanvasData` is set
2. **Z-Index Management**: CropCanvas should have high z-index to overlay properly when active
3. **Full-Screen Modal**: CropCanvas should be a full-screen overlay that blocks 3D interaction

### Current Implementation
```tsx
// CropCanvas.tsx
if (!cropCanvasData) {
  return null; // ✅ Already has conditional rendering
}

return (
  <div className="absolute inset-0 bg-[#0A0A0A] flex items-center justify-center">
    {/* Crop UI */}
  </div>
);
```

### Action Required
1. Check if `setCropCanvasData(null)` is being called when crop is complete
2. Verify CropCanvas unmounts after clicking "Crop Image" button
3. Add proper z-index to ensure it overlays when active

---

## Issue 3: Image Not Properly Cropped/Masked When Added to 3D Scene

### Problem
When clicking "Crop Image", the raw uploaded image is added to the 3D scene without applying:
- Crop area selection
- Mask shape (oval, teardrop, etc.)
- Scale/rotation/flip transforms
- Color mode (B&W, sepia)

The image appears as a full rectangle, not masked to the selected shape.

### Root Cause
`handleCropImage()` in ImageSelector.tsx (line 261-286) directly passes the raw `uploadedImage` URL:

```tsx
addImage({
  id: `img-${Date.now()}`,
  typeId: parseInt(selectedType.id),
  typeName: selectedType.name,
  imageUrl: uploadedImage, // ❌ RAW IMAGE - no crop/mask applied
  widthMm: 100,
  heightMm: 150,
  xPos: 0,
  yPos: 0,
  rotationZ: 0,
});
```

### Solution Required
**Generate a processed image using Canvas API before adding to 3D scene:**

```tsx
const handleCropImage = async () => {
  if (!selectedType || !uploadedImage || !addImage) return;

  // 1. Create canvas for processing
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // 2. Load uploaded image
  const img = new Image();
  img.src = uploadedImage;
  await new Promise((resolve) => { img.onload = resolve; });
  
  // 3. Calculate crop area in pixels
  const cropX = (cropArea.x / 100) * img.width;
  const cropY = (cropArea.y / 100) * img.height;
  const cropW = (cropArea.width / 100) * img.width;
  const cropH = (cropArea.height / 100) * img.height;
  
  // 4. Set canvas size to crop dimensions
  canvas.width = cropW;
  canvas.height = cropH;
  
  // 5. Apply transforms (rotation, flip, scale)
  ctx.translate(cropW / 2, cropH / 2);
  ctx.rotate((cropRotation * Math.PI) / 180);
  ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
  ctx.scale(cropScale / 100, cropScale / 100);
  
  // 6. Draw cropped portion of image
  ctx.drawImage(
    img,
    cropX, cropY, cropW, cropH,
    -cropW / 2, -cropH / 2, cropW, cropH
  );
  
  // 7. Apply mask shape using SVG mask
  // Load mask SVG and composite with canvas
  const maskUrl = getMaskUrl(selectedMask);
  const maskImg = new Image();
  maskImg.src = maskUrl;
  await new Promise((resolve) => { maskImg.onload = resolve; });
  
  // Create temp canvas for mask
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = cropW;
  maskCanvas.height = cropH;
  const maskCtx = maskCanvas.getContext('2d');
  maskCtx.drawImage(maskImg, 0, 0, cropW, cropH);
  
  // Use globalCompositeOperation to apply mask
  ctx.globalCompositeOperation = 'destination-in';
  ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
  ctx.drawImage(maskCanvas, 0, 0);
  
  // 8. Apply color mode
  if (cropColorMode === 'bw') {
    ctx.filter = 'grayscale(100%)';
  } else if (cropColorMode === 'sepia') {
    ctx.filter = 'sepia(100%)';
  }
  
  // 9. Export as data URL
  const processedImageUrl = canvas.toDataURL('image/png');
  
  // 10. Add to 3D scene
  addImage({
    id: `img-${Date.now()}`,
    typeId: parseInt(selectedType.id),
    typeName: selectedType.name,
    imageUrl: processedImageUrl, // ✅ PROCESSED IMAGE
    widthMm: 100,
    heightMm: 150,
    xPos: 0,
    yPos: 0,
    rotationZ: 0,
  });

  // Reset and close crop UI
  setUploadedImage(null);
  setShowCropSection(false);
  setCropCanvasData(null); // ✅ Clear crop canvas
  // ... reset other state
};
```

### Files to Modify
- `components/ImageSelector.tsx` - Implement canvas-based image processing in `handleCropImage()`

---

## Issue 4: Image Selection/Movement in 3D Scene

### Problem
The uploaded image appears to be "selected along with Headstone" and cannot be moved independently.

### Root Cause (Suspected)
The `ImageModel.tsx` component may not have proper:
- Click/drag handlers separate from headstone
- Selection state management
- Transform controls

### Investigation Needed
1. Check if `ImageModel` properly implements pointer events
2. Verify selection box renders for images
3. Test if drag handlers are working
4. Check if images are being added to correct scene layer

### Files to Check
- `components/three/ImageModel.tsx` - Image interaction handlers
- `components/SelectionBox.tsx` - Visual selection feedback
- Store selection state management

---

## Priority Order

1. **CRITICAL**: Issue 3 - Generate properly masked/cropped image
   - Without this, the crop UI is non-functional
   - Blocks testing of other features

2. **HIGH**: Issue 2 - Hide crop canvas after completion
   - Prevents UI overlay on 3D scene
   - Required for proper UX

3. **MEDIUM**: Issue 1 - Perfect handler alignment
   - Already mostly working
   - May self-resolve after canvas processing implemented

4. **MEDIUM**: Issue 4 - Independent image selection
   - Depends on Issue 3 being fixed first
   - May work correctly once proper images are added

---

## Next Steps

### Immediate Action Required
Implement canvas-based image processing in `handleCropImage()`:
1. Create processing function to apply crop, mask, transforms
2. Export processed image as data URL
3. Pass processed image to `addImage()`
4. Clear crop canvas state after completion

### Testing Checklist
After implementing canvas processing:
- [ ] Upload image, crop it, verify masked image appears on headstone
- [ ] Test all mask shapes (oval, teardrop, heart, etc.)
- [ ] Verify transforms work (rotate, flip, scale)
- [ ] Check color modes (B&W, sepia)
- [ ] Confirm crop canvas closes after clicking "Crop Image"
- [ ] Test image selection/movement in 3D independently of headstone

---

## References
- advice20.txt - Coordinate system transform pipeline
- advice21.txt - Dynamic bbox measurement with getBBox()
- advice22.txt - Robust SVG measurement with async DOM insertion
- STARTER.md - Original feature documentation
