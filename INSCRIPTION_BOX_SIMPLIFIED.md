# Inscription Box Selection - Simplified Version

## What Changed

Removed the 4 corner handles (large squares) to simplify the interface.

## Current Interactive Elements

### ✓ Active (Clickable):
1. **Top edge handle** (white bar) - Resize height by dragging up/down
2. **Bottom edge handle** (white bar) - Resize height by dragging up/down  
3. **Left edge handle** (white bar) - Resize width by dragging left/right
4. **Right edge handle** (white bar) - Resize width by dragging left/right
5. **Rotation handle** (green circle with ⟲) - Rotate by dragging in circular motion

### ✗ Non-Interactive (Visual Only):
- **Box outline** (cyan rectangle) - Shows inscription boundaries
- **Connecting line** (thin cyan line) - Connects box to rotation handle

## Visual Layout

```
                    ⟲ (green rotation circle)
                    |
                    | (connecting line)
                    |
        ┌───────────┼───────────┐
                   ━━━            ← Top edge handle (white bar)
        │                       │
        │                       │
      ━━━                     ━━━  ← Left & right edge handles
        │                       │
        │                       │
                   ━━━            ← Bottom edge handle (white bar)
        └───────────────────────┘
         Cyan outline (non-interactive)
```

## Handle Behavior

### Edge Handles (4 total)
- **Appearance**: White bars (turn red on hover)
- **Size**: 30% of text width or 50% of height (whichever is larger)
- **Thickness**: 5% of text height
- **Function**: 
  - Top/Bottom: Resize text height
  - Left/Right: Resize text width
- **Sensitivity**: 500 pixels = 100% size change
- **Limits**: 0.1% minimum, 500% maximum

### Rotation Handle (1 total)
- **Appearance**: Large green circle with ⟲ icon (turns magenta on hover)
- **Size**: 15% of text height
- **Position**: 120% of text height above the box
- **Function**: Rotate inscription
- **Interaction**: Drag in circular motion around screen center

## Removed Features

- ❌ Top-Left corner handle
- ❌ Top-Right corner handle
- ❌ Bottom-Left corner handle
- ❌ Bottom-Right corner handle

These were removed to simplify the interface and reduce visual clutter. Edge handles provide sufficient resize capability.

## Benefits of Simplified Design

1. **Less Visual Clutter**: Fewer handles = cleaner appearance
2. **Clearer Purpose**: Each handle has one clear function
3. **No Ambiguity**: No confusion about which handle to use
4. **Easier to Click**: Larger, distinct handles are easier targets
5. **Better Performance**: Fewer meshes to render and raycast

## Resize Behavior

### Height Adjustment
Use **top or bottom** edge handles:
- Drag up = smaller text
- Drag down = larger text
- Same result from either handle

### Width Adjustment  
Use **left or right** edge handles:
- Drag outward = larger text
- Drag inward = smaller text
- Same result from either handle

### Proportional Sizing
If you need to maintain aspect ratio, use the same amount of movement on multiple handles in sequence, or adjust the size slider in the UI panel.

## Color Coding

| Element | Default Color | Hover Color | Purpose |
|---------|--------------|-------------|---------|
| Outline | Cyan (0x00ffff) | Yellow (0xffff00) | Visual boundary |
| Edge handles | White (0xffffff) | Red (0xff0000) | Resize indicators |
| Rotation handle | Green (0x00ff00) | Magenta (0xff00ff) | Rotation control |

## Interaction Summary

1. **Select inscription** → Box appears
2. **Hover edge handle** → Turns red, cursor changes
3. **Drag edge handle** → Text resizes smoothly
4. **Hover rotation handle** → Turns magenta, cursor changes to grab
5. **Drag rotation handle** → Text rotates
6. **Click elsewhere** → Deselect, box disappears

## Code Impact

**Removed**:
- Corner handle types from `HandleType` enum
- Corner resize logic from drag handler
- Corner handle meshes from render
- `cornerSize` constant
- Cursor mappings for diagonal resize

**Kept**:
- All edge handles
- Rotation handle
- Outline and connecting line
- Sensitivity controls (500px sensitivity)
- Size caps (0.1% - 500%)

## File Size Reduction

Removing corner handles reduced:
- ~60 lines of code
- 4 mesh objects
- 4 pointer event handlers
- Cursor mapping complexity

## Future Enhancements

If corner handles are needed again in the future, they can be easily re-added by:
1. Adding corner types back to `HandleType`
2. Adding cursor mappings
3. Adding corner resize logic to drag handler
4. Adding corner mesh elements to render
