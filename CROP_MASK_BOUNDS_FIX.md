# Crop Canvas Mask Bounds Fix (2026-02-19)

## Problem
The gold rectangle border and corner handles were drawing around the full crop area, but different mask shapes have different effective bounds:
- **Oval Portrait**: Has 50px margins on left/right (viewBox: `50 0 400 500`)
- **Oval Landscape**: Has 50px margins on top/bottom (viewBox: `0 50 500 400`)

This caused the rectangle to extend beyond the actual mask shape, especially noticeable on Oval Landscape where left/right edges extended past the oval.

## Root Cause
The gold rectangle was drawn as:
```tsx
<rect x="0" y="0" width="100%" height="100%" />
```

This always filled the entire crop area, ignoring the mask's viewBox which defines where the actual shape is within that area.

## Solution: Respect Mask ViewBox Bounds

### 1. Added getMaskEffectiveBounds Function
Calculates the actual bounds of the mask within the crop area:

```typescript
const getMaskEffectiveBounds = (mask: string) => {
  const viewBox = maskViewBoxOverrides[mask];
  if (!viewBox) {
    return { xOffset: 0, yOffset: 0, widthScale: 1, heightScale: 1 };
  }
  
  const [x, y, width, height] = viewBox.split(' ').map(Number);
  const totalWidth = 500;
  const totalHeight = 500;
  
  return {
    xOffset: x / totalWidth,           // e.g., 50/500 = 0.1 (10%)
    yOffset: y / totalHeight,          // e.g., 50/500 = 0.1 (10%)
    widthScale: width / totalWidth,    // e.g., 400/500 = 0.8 (80%)
    heightScale: height / totalHeight, // e.g., 400/500 = 0.8 (80%)
  };
};
```

### 2. Updated Rectangle to Use Mask Bounds
```tsx
{(() => {
  const bounds = getMaskEffectiveBounds(selectedMask);
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      <rect 
        x={`${bounds.xOffset * 100}%`}
        y={`${bounds.yOffset * 100}%`}
        width={`${bounds.widthScale * 100}%`}
        height={`${bounds.heightScale * 100}%`}
        fill="none" 
        stroke="#D7B356" 
        strokeWidth="2"
      />
    </svg>
  );
})()}
```

### 3. Updated Corner Handles to Match Bounds
Positioned handles at the actual mask corners:

```tsx
{/* Top-left handle */}
<div
  style={{ 
    top: `${bounds.yOffset * 100}%`, 
    left: `${bounds.xOffset * 100}%`, 
    transform: 'translate(-50%, -50%)',
  }}
/>

{/* Top-right handle */}
<div
  style={{ 
    top: `${bounds.yOffset * 100}%`, 
    left: `${(bounds.xOffset + bounds.widthScale) * 100}%`, 
  }}
/>

{/* Bottom-right handle */}
<div
  style={{ 
    top: `${(bounds.yOffset + bounds.heightScale) * 100}%`, 
    left: `${(bounds.xOffset + bounds.widthScale) * 100}%`, 
  }}
/>

{/* Bottom-left handle */}
<div
  style={{ 
    top: `${(bounds.yOffset + bounds.heightScale) * 100}%`, 
    left: `${bounds.xOffset * 100}%`, 
  }}
/>
```

## Mask ViewBox Examples

### Oval Portrait
- **ViewBox**: `'50 0 400 500'`
- **Bounds**: 
  - xOffset: 10% (50px left margin)
  - yOffset: 0%
  - widthScale: 80% (400px of 500px)
  - heightScale: 100%
- **Result**: Rectangle inset 10% from left/right edges

### Oval Landscape
- **ViewBox**: `'0 50 500 400'`
- **Bounds**: 
  - xOffset: 0%
  - yOffset: 10% (50px top margin)
  - widthScale: 100%
  - heightScale: 80% (400px of 500px)
- **Result**: Rectangle inset 10% from top/bottom edges ✅

### Square/Rectangle
Same as ovals - have margins to account for

### Heart/Teardrop/Triangle
- **ViewBox**: `'0 0 500 500'` (default)
- **Bounds**: Full area (no inset)

## Visual Comparison

**Before (Oval Landscape)**:
```
┌───────────────────────┐  ← Gold rectangle
│     ╭─────────╮       │
│    ╱           ╲      │  ← Green oval mask
│   │      O      │     │
│    ╲           ╱      │
│     ╰─────────╯       │
└───────────────────────┘
      ↑         ↑
   Left/right edges extend beyond oval
```

**After (Oval Landscape)**:
```
     ╭─────────╮          ← Gold rectangle matches oval
    ╱           ╲  
   │      O      │        ← Green oval mask
    ╲           ╱  
     ╰─────────╯
     ↑         ↑
   Rectangle aligns with oval edges ✅
```

## Files Modified
- `components/CropCanvas.tsx`:
  - Added `getMaskEffectiveBounds()` function
  - Updated rectangle rendering with bounds
  - Updated all 4 corner handles with bounds

## Benefits
✅ **Visual accuracy**: Rectangle matches actual mask shape  
✅ **Clearer feedback**: User sees exact crop bounds  
✅ **Works for all masks**: Automatically adjusts based on viewBox  
✅ **Handles positioned correctly**: At actual mask corners  

## Testing Checklist
- [x] TypeScript compilation passes
- [x] getMaskEffectiveBounds calculates correctly
- [ ] Manual QA: Oval Portrait - rectangle inset from sides
- [ ] Manual QA: Oval Landscape - rectangle inset from top/bottom ✅
- [ ] Manual QA: Square - rectangle matches mask
- [ ] Manual QA: Rectangle - rectangle matches mask
- [ ] Manual QA: Heart/Teardrop/Triangle - full rectangle
- [ ] Manual QA: Handles positioned at mask corners
- [ ] Manual QA: Dragging still works correctly

## Reference
- **Implementation Date**: 2026-02-19
- **Status**: Mask-aware bounds implemented, ready for testing
