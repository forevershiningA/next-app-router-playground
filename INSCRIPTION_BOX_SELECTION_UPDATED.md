# Inscription Box Selection - Updated Features

## Visual Layout

```
                    ⟲ (rotation handle - green circle with icon)
                    |
                    | (dashed line)
                    |
        ┌───────────┼───────────┐
        │■         [ ]         ■│  ← Top corners (■) and top edge handle ([])
        │                       │
        │                       │
      [ ]    INSCRIPTION TEXT [ ]  ← Left and right edge handles
        │                       │
        │                       │
        │■         [ ]         ■│  ← Bottom corners (■) and bottom edge handle ([])
        └───────────────────────┘
```

## All Handles

### Corner Handles (4 total)
- **Top-Left** (■): Proportional resize from top-left corner
- **Top-Right** (■): Proportional resize from top-right corner  
- **Bottom-Left** (■): Proportional resize from bottom-left corner
- **Bottom-Right** (■): Proportional resize from bottom-right corner
- Size: Larger squares (2x handleSize)
- Color: White → Yellow on hover
- Cursor: `nwse-resize` or `nesw-resize` (diagonal arrows)

### Edge Handles (4 total)
- **Top** ([]): Resize height (pull down/up)
- **Bottom** ([]): Resize height (pull up/down)
- **Left** ([]): Resize width (pull right/left)
- **Right** ([]): Resize width (pull left/right)
- Size: Bars 20% of min(width, height)
- Color: White → Yellow on hover
- Cursor: `ns-resize` (vertical) or `ew-resize` (horizontal)

### Rotation Handle (1 total)
- **Rotate** (⟲): Circular handle above the box
- Position: 70% of text height above the top edge
- Features:
  - Green circle with rotation icon (⟲)
  - Larger invisible hit area (4x handleSize) for easier clicking
  - Visual circle (2.5x handleSize)
  - HTML overlay with styled icon
  - Connected to box with a thin line
- Color: Green (#00ff00) → Light Green (#00ff88) on hover
- Cursor: `grab` → `grabbing` when dragging
- Interaction: Drag in circular motion to rotate inscription

## Interaction Improvements

### Fixed Issues
1. **Rotation Now Works**: 
   - Larger hit area makes it easier to click
   - Proper angle calculation from screen center
   - Rotation accumulates correctly (adds delta to current rotation)
   - Visual feedback on hover and drag

2. **All 4 Corner Handles Added**:
   - Each corner has an interactive handle
   - Corner handles do proportional scaling
   - Proper diagonal resize cursors

3. **Better Visual Feedback**:
   - All handles highlight yellow on hover
   - Rotation handle highlights light green
   - Proper cursor changes for each handle type
   - Smooth transitions

### Resize Behavior

**Edge Handles**: Scale one dimension
- Top/Bottom: Change height only
- Left/Right: Change width only
- Uses vertical or horizontal mouse movement
- Sensitivity: 150px movement = 100% size change

**Corner Handles**: Proportional scaling
- Uses both X and Y mouse movement
- Takes the larger of the two scales
- Maintains text proportions
- Ideal for general resizing

**Minimum Size**: All handles enforce a minimum of 0.02 units (20mm)

### Rotation Behavior

**How It Works**:
1. Click on green rotation handle
2. Cursor changes to "grabbing"
3. Mouse position relative to screen center determines angle
4. Rotation is calculated as the angle difference from drag start
5. Updates rotation in real-time
6. Rotation accumulates (adds to existing rotation)

**Calculation**:
- Uses `Math.atan2` for precise angle from screen center
- Converts radians to degrees
- Adds delta angle to current inscription rotation
- Smooth continuous rotation

## Visual Constants

```typescript
handleSize = 0.012              // Base unit for handle sizes
edgeHandleLength = 20% of min(width, height)  // Edge handle bars
rotateHandleOffset = 70% of text height       // Distance above box

// Colors
outlineColor = 0x00a8ff (blue) → 0x00d4ff (brighter blue on hover)
handleColor = 0xffffff (white) → 0xffff00 (yellow on hover/drag)
rotateColor = 0x00ff00 (green) → 0x00ff88 (light green on hover)
```

## Camera Control Integration

- **Auto-disables** orbit controls when dragging any handle
- **Auto-enables** orbit controls when drag is released
- Prevents camera movement interfering with handle manipulation
- Works with any orbit control implementation

## Usage

The selection box automatically appears when an inscription is selected:

```typescript
// In HeadstoneInscription.tsx
{selected && textBounds.width > 0 && (
  <InscriptionBoxSelection
    inscriptionId={id}
    position={new THREE.Vector3(0, 0, 0.002)}
    bounds={{ width: textBounds.width, height: textBounds.height }}
    rotation={0}
    onUpdate={(data) => {
      // Handle updates
    }}
  />
)}
```

## Testing Checklist

- [x] All 4 corner handles visible and clickable
- [x] All 4 edge handles visible and clickable  
- [x] Rotation handle visible and clickable
- [x] Proper cursors on hover for each handle type
- [x] Handles highlight on hover (color change)
- [x] Edge handles resize correctly
- [x] Corner handles resize proportionally
- [x] Rotation handle rotates the inscription
- [x] Camera controls disabled during drag
- [x] Camera controls re-enabled after drag
- [x] Minimum size constraints work
- [x] Smooth visual feedback and transitions
