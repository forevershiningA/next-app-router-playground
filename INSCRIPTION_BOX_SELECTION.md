# Inscription Box Selection Feature

## Overview

The Inscription Box Selection component provides an interactive visual interface for manipulating inscriptions on headstones with the following features:

- **Box Outline**: Visual boundary showing the inscription's bounding box
- **4 Edge Handles**: Resize handles on top, bottom, left, and right edges
- **Rotation Handle**: Circular handle above the box for rotating the inscription
- **Visual Feedback**: Hover effects and color changes to indicate interactive elements

## Components

### InscriptionBoxSelection.tsx

Located in `components/InscriptionBoxSelection.tsx`

This component renders an interactive selection box around a selected inscription with:

1. **Edge Resize Handles**
   - Top and bottom handles resize vertically
   - Left and right handles resize horizontally
   - Handles change color on hover (white → yellow)

2. **Rotation Handle**
   - Green circular handle positioned above the box
   - Connected to box with a dashed line
   - Drag to rotate the inscription
   - Visual icon (⟲) indicates rotation function

3. **Visual Indicators**
   - Blue outline box around the inscription
   - White corner markers
   - Handle colors change on hover/drag

## Integration

The selection box is automatically shown when an inscription is selected in `HeadstoneInscription.tsx`:

```tsx
{selected && textBounds.width > 0 && (
  <InscriptionBoxSelection
    inscriptionId={id}
    position={new THREE.Vector3(0, 0, 0.002)}
    bounds={{
      width: textBounds.width,
      height: textBounds.height,
    }}
    rotation={0}
    onUpdate={(data) => {
      // Update inscription properties
      if (data.xPos !== undefined || data.yPos !== undefined) {
        updateLineStore(id, {
          xPos: data.xPos ?? xPos,
          yPos: data.yPos ?? yPos,
        });
      }
      if (data.sizeMm !== undefined) {
        updateLineStore(id, { sizeMm: data.sizeMm });
      }
      if (data.rotationDeg !== undefined) {
        updateLineStore(id, { rotationDeg: data.rotationDeg });
      }
    }}
  />
)}
```

## User Interactions

### Resizing
1. Hover over any edge handle (top, bottom, left, right)
2. Handle turns yellow to indicate it's interactive
3. Click and drag to resize:
   - **Vertical handles** (top/bottom): Scale text height
   - **Horizontal handles** (left/right): Scale text width
4. Minimum size constraint prevents text from becoming too small

### Rotating
1. Hover over the green rotation handle above the box
2. Handle highlights and grows slightly
3. Click and drag in a circular motion
4. Rotation updates in real-time based on mouse angle relative to center

### Visual Feedback
- **Default State**: Blue outline, white handles
- **Hover State**: Handles turn yellow, rotation handle turns light green
- **Dragging State**: Cursor changes to indicate operation type
  - Resize: `nwse-resize` cursor
  - Rotate: `grab` cursor
  - Active drag: `grabbing` cursor

## Technical Details

### Props

```typescript
type Props = {
  inscriptionId: string;           // Unique identifier for the inscription
  position: THREE.Vector3;          // 3D position in scene
  bounds: { 
    width: number; 
    height: number; 
  };                               // Text bounding box dimensions
  rotation: number;                // Current rotation in radians
  onUpdate?: (data: {              // Callback for property updates
    xPos?: number;
    yPos?: number;
    sizeMm?: number;
    rotationDeg?: number;
  }) => void;
};
```

### Handle Types

```typescript
type HandleType = 'top' | 'right' | 'bottom' | 'left' | 'rotate';
```

### Styling Constants

- **Handle Size**: `0.01` units (dynamically scales with text)
- **Handle Length**: `25%` of minimum dimension (width or height)
- **Rotate Offset**: `60%` of text height above the box
- **Outline Color**: `0x00a8ff` (bright blue)
- **Handle Color**: `0xffffff` (white)
- **Hover Color**: `0xffff00` (yellow)
- **Rotate Color**: `0x00ff00` (green)

## Camera Controls

The component automatically:
- **Disables** orbit controls when dragging handles
- **Enables** orbit controls when drag is released
- Prevents camera movement during inscription manipulation

## Coordinate System

- Uses Three.js coordinate system
- Position is relative to the inscription's parent group
- Rotation is applied to the parent group
- Handles are positioned in local space relative to text bounds

## Browser Compatibility

- Works in all modern browsers supporting WebGL
- Uses standard PointerEvent API for touch/mouse/pen input
- Responsive to viewport changes

## Performance

- Handles are simple geometry (boxes and circles)
- Minimal draw calls
- Event listeners cleaned up properly on unmount
- RAF-based updates for smooth interactions

## Future Enhancements

Potential improvements:
1. **Corner handles**: Diagonal resize from corners
2. **Snapping**: Snap to grid or align with other elements
3. **Multi-select**: Select and manipulate multiple inscriptions
4. **Constraints**: Lock aspect ratio, constrain to boundaries
5. **Undo/Redo**: History for inscription transformations
6. **Keyboard shortcuts**: Arrow keys for fine-tuning position/size/rotation
