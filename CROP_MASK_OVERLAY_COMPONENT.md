# CropMaskOverlay Component Extraction (2026-02-19)

## Summary
Following advice18.txt, I created a reusable `CropMaskOverlay.tsx` component that encapsulates all the mask rendering logic we've been building. This component can replace the inline SVG/mask rendering in `CropCanvas.tsx`.

## What the Component Does

The `CropMaskOverlay` component handles:
1. **Mask preloading** - Gets natural dimensions of mask images
2. **Transform calculation** - Fits mask into viewBox preserving aspect ratio
3. **SVG overlay rendering** - Positions mask perfectly over imageBox
4. **Bounds calculation** - Respects mask viewBox for accurate rectangle/handles
5. **Event delegation** - Provides callbacks for drag/resize handlers

## Component Interface

```typescript
interface CropMaskOverlayProps {
  imageBox: { left: number; top: number; width: number; height: number } | null;
  cropArea: { x: number; y: number; width: number; height: number };
  selectedMask: string;
  getMaskUrl: (mask: string) => string | undefined;
  onHandlePointerDown: (handle: 'nw' | 'ne' | 'sw' | 'se', clientX: number, clientY: number) => void;
  onRectPointerDown: (clientX: number, clientY: number) => void;
  strokeWidth?: number;
  maskViewBoxOverrides?: Record<string, string>;
}
```

## How to Use (Integration)

### Option A: Replace Inline Rendering in CropCanvas

In `CropCanvas.tsx`, replace the existing mask/overlay/handles rendering with:

```tsx
import CropMaskOverlay from './CropMaskOverlay';

// In render, replace the SVG overlay + handles section with:
<CropMaskOverlay
  imageBox={imageBox}
  cropArea={cropArea}
  selectedMask={selectedMask}
  getMaskUrl={getMaskUrl}
  onHandlePointerDown={(handle, x, y) => {
    handleMouseDown({ clientX: x, clientY: y } as React.MouseEvent, handle);
  }}
  onRectPointerDown={(x, y) => {
    handleMouseDown({ clientX: x, clientY: y } as React.MouseEvent, 'move');
  }}
  strokeWidth={4}
  maskViewBoxOverrides={maskViewBoxOverrides}
/>
```

### Option B: Keep Current Implementation

The current `CropCanvas.tsx` already has all this functionality inline. The component just provides a cleaner separation of concerns.

## Features Included

### 1. Mask Preloading
```typescript
useEffect(() => {
  const url = getMaskUrl(selectedMask);
  const img = new window.Image();
  img.onload = () => setMaskNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
  img.src = url;
}, [selectedMask]);
```

### 2. Transform Calculation
```typescript
const maskTransformForBox = (natural, box = 500) => {
  const scale = Math.min(box / natural.w, box / natural.h);
  const newW = natural.w * scale;
  const newH = natural.h * scale;
  return {
    sx: scale,
    sy: scale,
    tx: (box - newW) / 2,
    ty: (box - newH) / 2,
  };
};
```

### 3. Mask Bounds Calculation
```typescript
const getMaskEffectiveBounds = (mask) => {
  const viewBox = maskViewBoxOverrides[mask];
  const [x, y, width, height] = viewBox.split(' ').map(Number);
  return {
    xOffset: x / 500,
    yOffset: y / 500,
    widthScale: width / 500,
    heightScale: height / 500,
  };
};
```

### 4. Single SVG Overlay
- Positioned exactly over imageBox
- Uses alpha channel masking
- Draws green overlay and gold rectangle
- Handles positioned at mask bounds

### 5. Event Callbacks
- `onHandlePointerDown` - Called when corner handle is dragged
- `onRectPointerDown` - Called when crop area is dragged to move

## Benefits of Component Extraction

✅ **Reusability**: Can be used in other crop contexts  
✅ **Testability**: Easier to unit test in isolation  
✅ **Maintainability**: All mask logic in one place  
✅ **Clean API**: Clear props interface  
✅ **Type Safety**: Full TypeScript support  

## Current Status

The component has been created but **not yet integrated** into `CropCanvas.tsx`. 

**Current state**:
- ✅ `CropMaskOverlay.tsx` created
- ✅ TypeScript compilation passes
- ❌ Not yet used in `CropCanvas.tsx` (existing inline code works fine)

**Options**:
1. **Integrate now**: Replace inline code with component
2. **Keep both**: Component available for future use
3. **Refactor later**: Wait for additional requirements

## Migration Guide (If Integrating)

### Step 1: Import Component
```tsx
import CropMaskOverlay from './CropMaskOverlay';
```

### Step 2: Remove Old Rendering Code
Remove from `CropCanvas.tsx`:
- The entire SVG overlay section
- The mask rendering code
- The rectangle and handles rendering
- Keep: `imageBox` state and measurement logic
- Keep: Mouse event handlers (`handleMouseDown`, etc.)

### Step 3: Add Component Usage
```tsx
{imageBox && (
  <CropMaskOverlay
    imageBox={imageBox}
    cropArea={cropArea}
    selectedMask={selectedMask}
    getMaskUrl={getMaskUrl}
    onHandlePointerDown={(handle, x, y) => {
      const fakeEvent = { clientX: x, clientY: y } as React.MouseEvent;
      handleMouseDown(fakeEvent, handle);
    }}
    onRectPointerDown={(x, y) => {
      const fakeEvent = { clientX: x, clientY: y } as React.MouseEvent;
      handleMouseDown(fakeEvent, 'move');
    }}
    maskViewBoxOverrides={maskViewBoxOverrides}
  />
)}
```

### Step 4: Verify
- Test all mask shapes
- Test dragging and resizing
- Verify bounds alignment

## Implementation Details

### Mask Type: Alpha Channel
```tsx
<mask
  id={`crop-mask-${selectedMask}`}
  maskUnits="userSpaceOnUse"
  maskContentUnits="userSpaceOnUse"
  style={{ maskType: 'alpha' }}
>
```

### Rectangle Positioning
Respects mask bounds:
```tsx
<rect
  x={((cropArea.x / 100) + bounds.xOffset * (cropArea.width / 100)) * BOX}
  y={((cropArea.y / 100) + bounds.yOffset * (cropArea.height / 100)) * BOX}
  width={(cropArea.width / 100) * bounds.widthScale * BOX}
  height={(cropArea.height / 100) * bounds.heightScale * BOX}
/>
```

### Handles Positioning
At mask bound corners:
```tsx
<div
  style={{
    top: `${bounds.yOffset * 100}%`,
    left: `${bounds.xOffset * 100}%`,
  }}
/>
```

## Files Created
- ✅ `components/CropMaskOverlay.tsx` - Main component

## Reference
- **Source**: `advice18.txt`
- **Implementation Date**: 2026-02-19
- **Status**: Component created, available for integration
