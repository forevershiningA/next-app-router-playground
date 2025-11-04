# Universal Selection Box Implementation

## Summary

Created a universal `SelectionBox` component that provides consistent selection UI across inscriptions, motifs, and additions with resize and rotation controls.

## Changes Made

### 1. New Component: `components/SelectionBox.tsx`

Created a reusable selection box component with the following features:

- **Visual Elements:**
  - Cyan outline rectangle around selected object
  - Four white corner handles for proportional resizing
  - Dark grey rotation circle above the object
  - Connection line from object to rotation handle

- **Interaction:**
  - Corner handles: Drag to resize proportionally (all four corners work)
  - Rotation handle: Drag in circular motion to rotate
  - Hover effects: Shows appropriate cursor (resize arrows, grab)
  - Smooth dragging with 60fps updates
  - OrbitControls automatically disabled during drag operations

- **Fixed Sizes:**
  - Corner handles are 750mm squares (fixed size, don't scale with object)
  - Rotation handle is 15% of object height * 80%
  - Outline thickness is consistent

- **Props:**
  - `objectId`: Unique identifier
  - `position`: Offset from parent group
  - `bounds`: Width/height of bounding box
  - `rotation`: Rotation in radians
  - `unitsPerMeter`: Scale conversion factor
  - `currentSizeMm`: Current size/scale value
  - `objectType`: 'inscription' | 'motif' | 'addition'
  - `onUpdate`: Callback for size/rotation changes

### 2. Updated Components

#### `components/HeadstoneInscription.tsx`
- Replaced `InscriptionBoxSelection` with `SelectionBox`
- Removed white outline/glow effect (now using selection box only)
- Set `objectType="inscription"`
- Updates `sizeMm` for text size changes
- Updates `rotationDeg` for rotation

#### `components/three/MotifModel.tsx`
- Added `SelectionBox` import
- Integrated selection box when motif is selected
- Set `objectType="motif"`
- Updates `heightMm` based on scale factor
- Updates `rotationZ` for rotation in radians

#### `components/three/AdditionModel.tsx`
- Added `SelectionBox` import
- Integrated selection box when addition is selected
- Set `objectType="addition"`
- Updates `scale` based on scale factor
- Updates `rotationZ` for rotation in radians

### 3. Removed Component

The old `InscriptionBoxSelection.tsx` component can be removed as it's been replaced by the universal `SelectionBox` component.

## Features

### Resize Behavior
- **Inscriptions:** Changes `sizeMm` directly (text font size)
- **Motifs:** Changes `heightMm` (motif height in mm)
- **Additions:** Changes `scale` factor (model scale multiplier)
- All use proportional scaling via corner handles
- Sensitivity: 150 pixels = 100% scale change
- Clamped to reasonable ranges (min 10mm, max 5x initial size)

### Rotation Behavior
- Circular drag motion around object center
- Works for all object types
- Updates applied as delta to current rotation
- Smooth real-time updates

### Interaction Safety
- Pointer capture prevents clicks from bleeding through to headstone
- 200ms click blocker after drag ends
- OrbitControls disabled during drag, re-enabled on release
- All interactions stop propagation

## Visual Design

- **Outline:** Cyan (#00ffff) - 2px line
- **Handles:** White (#ffffff) - 750mm squares, 90% opacity
- **Rotation:** Dark grey (#404040) circle with white ⟲ icon
- **Render Order:** 1000+ to appear above all other objects
- **Depth:** All elements disabled depthWrite for proper transparency

## Technical Details

- Uses Three.js Line components for outline
- Uses mesh boxes for corner handles  
- Uses mesh circle for rotation handle
- Uses HTML overlay for rotation icon
- RequestAnimationFrame for smooth updates (60fps)
- Raycasting disabled on non-interactive elements
- Proper cleanup of event listeners and timeouts

## Next Steps

1. Test the selection box with inscriptions, motifs, and additions
2. Verify sizing behavior for each object type
3. Verify rotation works correctly
4. Check that outline remains visible during and after resizing
5. Ensure handles don't scale with object (stay fixed size)
6. Remove old `InscriptionBoxSelection.tsx` file if no longer needed

## Build Status

✅ Build successful - all components compile without errors
