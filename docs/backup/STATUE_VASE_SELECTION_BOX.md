# Statue and Vase Selection Indicators

**Date:** 2026-02-04  
**Status:** Production-Ready ✅

---

## Summary

Added **simple white corner outlines** for **Statues** and **Vases** when selected, matching the elegant selection style used for the Headstone and Base.

Previously, statues and vases had white corner indicators, but they were removed in an earlier attempt to add full selection boxes. This restores the original elegant corner outline design while keeping the blue selection boxes with resize/rotate handles **only for Applications**.

---

## Changes Made

### File: `components/three/AdditionModel.tsx`

#### 1. Added Conditional Logic for Different Selection Styles
```typescript
// Applications get blue selection box with handles
// Statues/Vases get simple white corner outlines like headstone
const showApplicationBox = isSelected && addition.type === 'application' && scaledBounds.width > 0 && scaledBounds.height > 0;
const showCornerOutline = isSelected && (addition.type === 'statue' || addition.type === 'vase');
```

#### 2. Two Different Selection Components
```jsx
{/* Selection box with resize and rotation handles - for applications only */}
{showApplicationBox && (
  <SelectionBox ... />
)}

{/* Simple white corner outline - for statues and vases (like headstone) */}
{showCornerOutline && (
  <RotatingBoxOutline
    targetRef={ref}
    visible
    color="#ffffff"
    pad={0.015}
    through={false}
    lineLength={0.2}
  />
)}
```

#### 3. Restored Import
```typescript
import RotatingBoxOutline from './RotatingBoxOutline';
```

---

## User Experience

### Statues
- **Selection Indicator:** Simple white corner lines (4 corners)
- **No handles:** Clean, minimal visual feedback
- **Editing:** Use sidebar controls for size and rotation
- **Matches:** Headstone/Base selection style

### Vases
- **Selection Indicator:** Simple white corner lines (4 corners)
- **No handles:** Clean, minimal visual feedback
- **Editing:** Use sidebar controls for size and rotation
- **Matches:** Headstone/Base selection style

### Applications
- **Selection Indicator:** Blue selection box with handles
- **Corner handles:** Drag to resize
- **Rotation handle:** Top-center, drag to rotate
- **Different style:** Distinguishes applications from statues/vases

---

## Visual Design Philosophy

### Headstone/Base/Statues/Vases
- **Style:** Elegant white corner indicators (`RotatingBoxOutline`)
- **Purpose:** Show selection without cluttering the 3D view
- **Editing:** Precise control via sidebar sliders (Size 1-4, rotation, duplicate/delete)
- **Aesthetic:** Minimal, professional, doesn't interfere with 3D model visibility

### Applications (Flat 2D decorations)
- **Style:** Blue selection box with interactive handles (`SelectionBox`)
- **Purpose:** Direct manipulation on canvas (drag corners to resize)
- **Editing:** Mix of canvas handles + sidebar controls
- **Rationale:** 2D flat objects benefit from visible resize affordances

This separation creates a clear visual distinction:
- **3D objects** (statues/vases) = subtle corner lines
- **2D flat decorations** (applications) = interactive blue box

---

## Technical Details

### RotatingBoxOutline Props
```typescript
targetRef={ref}        // Reference to the 3D mesh
visible={true}         // Always visible when selected
color="#ffffff"        // White corners
pad={0.015}            // 15mm padding around object
through={false}        // Don't render through object (depth test enabled)
lineLength={0.2}       // 200mm corner line length
```

### Selection Logic
- **Applications:** `showApplicationBox` → renders `SelectionBox`
- **Statues/Vases:** `showCornerOutline` → renders `RotatingBoxOutline`
- **Headstone/Base:** Still uses `RotatingBoxOutline` (unchanged)

---

## Build Status

✅ **Production build successful** - No TypeScript errors  
✅ **Compiled in 100 seconds**

---

## Comparison to Headstone Selection

### Headstone Selection (HeadstoneAssembly.tsx)
```jsx
<RotatingBoxOutline
  targetRef={headstoneMeshRef}
  visible={selected === 'headstone'}
  color="#ffffff"
  pad={0.02}
  through={false}
  lineLength={0.15}
/>
```

### Statue/Vase Selection (AdditionModel.tsx)
```jsx
<RotatingBoxOutline
  targetRef={ref}
  visible={true}
  color="#ffffff"
  pad={0.015}
  through={false}
  lineLength={0.2}
/>
```

**Differences:**
- Statues/vases: Slightly smaller padding (`0.015` vs `0.02`)
- Statues/vases: Longer corner lines (`0.2` vs `0.15`)
- Both: White color, no depth fighting

---

## Benefits

✅ **Visual Consistency:** Statues/vases match headstone/base selection style  
✅ **Clean 3D View:** No cluttered resize handles on 3D models  
✅ **Clear Distinction:** Blue boxes = flat 2D, white corners = 3D objects  
✅ **Sidebar Controls:** Size/rotation handled via familiar Size 1-4 slider  
✅ **Professional Look:** Elegant corner indicators, not aggressive blue boxes  

---

## Related Components

- **`components/three/RotatingBoxOutline.tsx`** - White corner indicator component
- **`components/SelectionBox.tsx`** - Blue box with handles (applications only)
- **`components/three/headstone/HeadstoneAssembly.tsx`** - Headstone/base selection examples

---

## Files Modified

1. **`components/three/AdditionModel.tsx`**
   - Added `showApplicationBox` and `showCornerOutline` logic
   - Restored `RotatingBoxOutline` for statues/vases
   - Kept `SelectionBox` for applications only
   - Updated comments

---

## Previous Attempt (Reverted)

An earlier version added `SelectionBox` with blue handles to all addition types. This was reverted because:
- Blue boxes with corner handles cluttered the view on 3D statues/vases
- Inconsistent with headstone/base selection style
- Resize handles unnecessary when sidebar has Size 1-4 slider
- User explicitly requested simple white corner lines

---

**Build Time:** 100 seconds  
**Production Status:** Ready for deployment ✅
