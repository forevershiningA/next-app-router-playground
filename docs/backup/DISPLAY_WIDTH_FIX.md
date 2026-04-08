# Display Width Fix - Using Logical Cropped Dimensions

## Issue
The SVG parent div was using incorrect dimensions (1390px) instead of the cropped logical dimensions.

### Problem
```html
<div style="width: 1390px; height: 1393px;">
  <!-- Should be using cropped logical dimensions -->
</div>
```

## Root Cause

We were double-applying the crop:
1. **First time**: In `screenshotDimensions` - already using cropped physical pixels ÷ DPR
2. **Second time**: In `calculateCroppedScalingFactors` - applying crop bounds again

This caused the display to use the wrong dimensions.

## Solution

Use the logical screenshot dimensions (which are already cropped and divided by DPR) directly for display calculations:

```typescript
// screenshotDimensions already contains cropped logical dimensions
const screenshotLogicalWidth = screenshotDimensions?.width || canvasWidth;
const screenshotLogicalHeight = screenshotDimensions?.height || canvasHeight;

// Calculate display dimensions directly
const displayWidth = screenshotLogicalWidth * upscaleFactor;
const displayHeight = screenshotLogicalHeight * upscaleFactor;
```

## Flow Explanation

### Step 1: Analyze Screenshot
```typescript
analyzeImageForCrop(screenshot, 30%)
→ cropBounds = {
    width: 2780,           // Original physical pixels
    height: 2786,
    croppedWidth: 1390,    // Cropped physical pixels
    croppedHeight: 1393,
    shouldCrop: true
  }
```

### Step 2: Set Screenshot Dimensions
```typescript
const physicalWidth = cropBounds.shouldCrop 
  ? cropBounds.croppedWidth   // 1390 (already cropped)
  : img.width;

const logicalWidth = physicalWidth / designDPR;  // 1390 ÷ 2 = 695

setScreenshotDimensions({ width: 695, height: 696.5 });
```

### Step 3: Calculate Display Dimensions
```typescript
// Use logical dimensions (already cropped)
const displayWidth = 695 * upscaleFactor;   // 695 × 1 = 695px ✓
const displayHeight = 696.5 * upscaleFactor; // 696.5 × 1 = 696.5px ✓
```

## Before vs After

### Before (Wrong - Double Crop)
```typescript
// screenshotDimensions = { width: 695, height: 696.5 } (logical, cropped)

calculateCroppedScalingFactors(canvas, cropBounds, upscale)
→ Uses cropBounds.croppedWidth = 1390 (physical)
→ displayWidth = 1390 × 1 = 1390px ❌ (wrong - too large!)
```

### After (Correct - Use Logical)
```typescript
// screenshotDimensions = { width: 695, height: 696.5 } (logical, cropped)

const displayWidth = screenshotLogicalWidth * upscaleFactor
→ displayWidth = 695 × 1 = 695px ✓ (correct!)
```

## Code Changes

### Removed
```typescript
// NO LONGER USING THIS
const factors = calculateCroppedScalingFactors(
  canvasWidth,
  canvasHeight,
  cropBounds,
  upscaleFactor
);
```

### Added
```typescript
// Direct calculation from logical dimensions
const displayWidth = screenshotLogicalWidth * upscaleFactor;
const displayHeight = screenshotLogicalHeight * upscaleFactor;

const scaleX = (screenshotLogicalWidth / canvasWidth) * upscaleFactor;
const scaleY = (screenshotLogicalHeight / canvasHeight) * upscaleFactor;

return { 
  scaleX, 
  scaleY, 
  displayWidth,    // Now correct!
  displayHeight,   // Now correct!
  upscaleFactor,
  offsetX: cropBounds.left || 0,
  offsetY: cropBounds.top || 0
};
```

## Result

### Before
```html
<div style="width: 1390px; height: 1393px;">
  <!-- Too large - using physical pixels -->
</div>
```

### After
```html
<div style="width: 695px; height: 697px;">
  <!-- Correct - using logical cropped dimensions -->
</div>
```

## Example Calculation

**Design Specifications:**
- Original screenshot: 2780×2786 physical pixels
- Cropped screenshot: 1390×1393 physical pixels (50% white space removed)
- DPR: 2
- Upscale factor: 1

**Logical Dimensions:**
```
Physical cropped: 1390×1393
÷ DPR (2): 695×696.5 logical pixels
× Upscale (1): 695×696.5 display pixels ✓
```

## Files Modified

- `app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx`
  - Removed `calculateCroppedScalingFactors` import
  - Removed call to `calculateCroppedScalingFactors`
  - Added direct calculation from logical screenshot dimensions
  - Updated debug logging

## Testing

Check the rendered HTML:
```html
<!-- Should show logical cropped dimensions -->
<div class="relative" style="width: 695px; height: 697px;">
  <svg width="695px" height="697px">
```

Console should show:
```javascript
{
  screenshot: {
    logical: { width: 695, height: 696.5 }
  },
  display: { width: 695, height: 696.5 }
}
```

## Benefits

✅ **No double-cropping** - Crop applied once during image load
✅ **Correct dimensions** - Display uses logical cropped size
✅ **Simpler code** - No need for separate scaling calculator
✅ **Consistent** - All dimensions flow through same pipeline

## Status

✅ **Fixed** - Display width now uses logical cropped dimensions
✅ **TypeScript** - Compiles without errors
✅ **Simplified** - Removed unnecessary helper function
✅ **Verified** - SVG parent div has correct size
