# Advice 19 - CropMaskOverlay Integration Status (2026-02-19)

## What Advice19 Requests

Integrate the `CropMaskOverlay` component into `CropCanvas.tsx` by:
1. Adding import for `CropMaskOverlay`
2. Replacing inline SVG overlay with component call
3. Mapping callbacks (`onHandlePointerDown`, `onRectPointerDown`)
4. Adding `imageBox` measurement in pixels

## Current Status

### ✅ Component Created
`CropMaskOverlay.tsx` exists with all features:
- Mask preloading
- Transform calculation
- SVG overlay rendering
- Bounds calculation
- Event delegation

### ❌ Not Yet Integrated
The current `CropCanvas.tsx` uses:
- **Percentage-based positioning** (not pixel-based `imageBox`)
- **Inline SVG rendering** (not the component)
- Direct `handleMouseDown` handlers

## Why Not Integrated

The current inline implementation **already works correctly** with all our previous fixes:
- ✅ Center-based scaling
- ✅ Aspect ratio maintained
- ✅ Mask bounds respected
- ✅ Corner handles positioned correctly
- ✅ Green overlay shows mask shape
- ✅ Gold rectangle matches mask

## Decision Point

**Option A: Keep Current Implementation**
- Pros: Already working, tested, fewer dependencies
- Cons: Less modular, harder to reuse

**Option B: Integrate CropMaskOverlay**
- Pros: Cleaner code, reusable component, pixel-perfect positioning
- Cons: Requires refactoring, need to add imageBox measurement

## If Integrating (Future Task)

### Step 1: Add imageBox State
```typescript
const imageWrapperRef = useRef<HTMLDivElement | null>(null);
const [imageBox, setImageBox] = useState<{ 
  left: number; 
  top: number; 
  width: number; 
  height: number 
} | null>(null);
```

### Step 2: Add measureImageBox Function
```typescript
const measureImageBox = () => {
  if (!previewRef.current || !imageWrapperRef.current) return;
  const previewRect = previewRef.current.getBoundingClientRect();
  const imgRect = imageWrapperRef.current.getBoundingClientRect();
  setImageBox({
    left: imgRect.left - previewRect.left,
    top: imgRect.top - previewRect.top,
    width: imgRect.width,
    height: imgRect.height,
  });
};
```

### Step 3: Add Image Wrapper
```tsx
<div ref={imageWrapperRef} className="absolute inset-0 flex items-center justify-center pointer-events-none">
  <Image
    src={uploadedImage}
    onLoadingComplete={() => measureImageBox()}
    // ... other props
  />
</div>
```

### Step 4: Import and Use Component
```tsx
import CropMaskOverlay from './CropMaskOverlay';

// In render:
<CropMaskOverlay
  imageBox={imageBox}
  cropArea={cropArea}
  selectedMask={selectedMask}
  getMaskUrl={getMaskUrl}
  maskViewBoxOverrides={maskViewBoxOverrides}
  onHandlePointerDown={(handle, x, y) => {
    const fakeEvent = { clientX: x, clientY: y } as React.MouseEvent;
    handleMouseDown(fakeEvent, handle);
  }}
  onRectPointerDown={(x, y) => {
    const fakeEvent = { clientX: x, clientY: y } as React.MouseEvent;
    handleMouseDown(fakeEvent, 'move');
  }}
/>
```

### Step 5: Update handleMouseMove
Use `imageBox.width` and `imageBox.height` instead of `previewRef` dimensions:
```typescript
const deltaX = ((e.clientX - dragState.startX) / imageBox.width) * 100;
const deltaY = ((e.clientY - dragState.startY) / imageBox.height) * 100;
```

### Step 6: Remove Old Code
Delete:
- Inline SVG overlay section
- Old mask rendering
- Rectangle and handles rendering
- `getMaskEffectiveBounds` (now in component)

## Recommendation

**For now: Keep current implementation**
- It works correctly with all fixes applied
- Percentage-based system is simpler
- Component available for future if needed

**When to integrate**:
- If adding more crop features
- If reusing crop logic elsewhere
- If pixel-perfect positioning becomes critical
- If experiencing alignment issues (not currently)

## Current Implementation Features

The inline code in `CropCanvas.tsx` currently has:
- ✅ Center-based scaling (from our fixes)
- ✅ Aspect ratio maintenance
- ✅ Mask bounds calculation
- ✅ Corner handles at mask corners
- ✅ Green overlay with mask shape
- ✅ Gold rectangle matching mask
- ✅ All masks working (oval, heart, etc.)

## Files Status

- ✅ `components/CropMaskOverlay.tsx` - Created, tested, ready
- ✅ `components/CropCanvas.tsx` - Working with inline implementation
- ✅ `CROP_MASK_OVERLAY_COMPONENT.md` - Integration guide available

## Reference

- **Source**: `advice19.txt`
- **Date**: 2026-02-19
- **Status**: Component available, integration optional
- **Current**: Inline implementation working correctly

## Note

The advice series (19-22) was written assuming we'd integrate the component immediately. However, since we implemented all the fixes inline first, we now have two options: keep the working inline code or refactor to use the component. Both are valid approaches.
