# Addition Overlay Panel Implementation

## Overview
Created an overlay panel for editing Additions (applications, statues, vases) with controls similar to the Inscriptions overlay panel.

## Files Created

### 1. `/components/AdditionOverlayPanel.tsx`
New component that provides a draggable overlay panel for editing selected additions with:
- **Size slider** (0.1× to 3×, step 0.05)
- **Rotation slider** (-180° to 180°, step 1°)
- **Duplicate button** (placeholder for future implementation)
- **Delete button** (removes the addition from the scene)

## Files Modified

### 1. `/app/layout.tsx`
- Added import for `AdditionOverlayPanel`
- Mounted the panel globally in the layout (between SceneOverlayHost and ThreeScene)

### 2. `/lib/headstone-store.ts`
- Updated `PanelName` type to include `'addition'` panel type
- Modified `setSelectedAdditionId` to automatically open the addition panel when an addition is selected
- Enhanced `removeAddition` to clean up:
  - Addition refs
  - Addition offsets
  - Selected addition ID (if the removed addition was selected)

### 3. `/components/three/AdditionModel.tsx`
- Added `helperRef` for BoxHelper (yellow outline when selected)
- Added BoxHelper effect that shows/hides yellow outline based on selection
- Added pointer event handlers:
  - `handlePointerOver` - changes cursor to pointer
  - `handlePointerOut` - resets cursor
- Updated group element with pointer event handlers

## Features

### Selection & Visual Feedback
- Click on any addition (application, statue, or vase) to select it
- Selected additions show a yellow BoxHelper outline
- Cursor changes to pointer on hover

### Overlay Panel Controls
- **Size Slider**: Adjust the scale of the selected addition (multiplier from 0.1× to 3×)
- **Rotation Slider**: Rotate the addition around its Z-axis (-180° to 180°)
- **Duplicate Button**: Placeholder for future duplication functionality
- **Delete Button**: Removes the addition from the scene and cleans up all references

### Panel Behavior
- Automatically opens when an addition is clicked
- Draggable via the header
- Collapsible using the minimize button
- Position persisted to localStorage (using `persistKey="addition"`)
- Shows addition ID in the panel

## Usage

1. **Select an Addition**: Click on any addition in the 3D scene
2. **Edit Size**: Use the Size slider to scale the addition
3. **Edit Rotation**: Use the Rotation slider to rotate the addition
4. **Delete**: Click the Delete button to remove the addition
5. **Close**: Click outside or use the minimize button

## Technical Details

### State Management
- Uses Zustand store (`useHeadstoneStore`) for state management
- Stores addition offsets with structure:
  ```typescript
  {
    xPos: number,
    yPos: number,
    scale: number,
    rotationZ: number
  }
  ```

### Panel Architecture
- Uses `SceneOverlayController` component (same as inscriptions)
- Panel type: `'addition'`
- Section: `'addition'`
- Persist key: `'addition'`

### BoxHelper Updates
- Updates at 100ms intervals to track model changes
- Automatically disposed when addition is deselected
- Uses yellow color (`0xffff00`) to match inscription selection style

## Future Enhancements

1. **Duplicate Functionality**: Implement addition duplication (currently placeholder)
2. **Multi-selection**: Allow selecting and editing multiple additions at once
3. **Undo/Redo**: Add history for addition transformations
4. **Keyboard Shortcuts**: Add hotkeys for common operations
5. **Snap to Grid**: Add option to snap additions to alignment points
6. **Copy/Paste**: Allow copying additions between headstones

## Notes
- Panel follows the same design pattern as InscriptionOverlayPanel
- Integrates seamlessly with existing 3D scene interaction
- Maintains consistent UX with other overlay panels
- All cleanup is handled properly to prevent memory leaks
