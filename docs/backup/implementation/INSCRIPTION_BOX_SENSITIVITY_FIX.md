# Inscription Box Selection - Sensitivity and Interaction Fixes

## Issues Fixed

### 1. **Outline Acting as Size Handler** ✓
**Problem**: The box outline (lineSegments) was clickable and triggering resize operations.

**Solution**: Disabled raycasting on non-interactive elements:
```typescript
const outlineRef = React.useRef<THREE.LineSegments>(null);
const lineRef = React.useRef<THREE.LineSegments>(null);

React.useEffect(() => {
  if (outlineRef.current) {
    outlineRef.current.raycast = () => {}; // Disable raycasting
  }
  if (lineRef.current) {
    lineRef.current.raycast = () => {}; // Disable raycasting
  }
}, []);
```

Now the outline and connecting line are purely visual - they don't respond to clicks.

### 2. **Micro Adjustments Creating Huge Size Changes** ✓
**Problem**: Moving the mouse just a few pixels resulted in text growing to 1000mm or more.

**Old sensitivity**: 150 pixels = 100% scale change
**New sensitivity**: 500 pixels = 100% scale change

**Changes**:
```typescript
// Much lower sensitivity
const sensitivity = 500; // Was 150

// Vertical/Horizontal resize
const scale = 1 + (deltaY * factor) / sensitivity;
const sizeMm = Math.max(0.1, Math.min(scale * 100, 500)); // Cap at 500%
```

**Benefits**:
- **3.3x less sensitive** - requires more deliberate mouse movement
- **Capped at 500%** - prevents accidental huge sizes
- **Minimum 0.1%** - prevents text from disappearing

## Resize Behavior Now

### Edge Handles (Top, Bottom, Left, Right)
- **500 pixels movement** = 100% size change (2x size)
- **250 pixels movement** = 50% size change (1.5x size)
- **100 pixels movement** = 20% size change (1.2x size)
- **50 pixels movement** = 10% size change (1.1x size)

### Corner Handles (All 4 Corners)
- Same sensitivity as edge handles
- Uses the larger of X or Y movement for proportional scaling
- Capped at 500% maximum

### Caps and Limits
- **Minimum size**: 0.1% (effectively prevents disappearing)
- **Maximum size**: 500% (5x original size)
- **Size changes are relative**: Percentage applied to current size

## Interactive vs Non-Interactive Elements

### Interactive (Clickable):
- ✓ Top edge handle
- ✓ Bottom edge handle
- ✓ Left edge handle
- ✓ Right edge handle
- ✓ Top-Left corner handle
- ✓ Top-Right corner handle
- ✓ Bottom-Left corner handle
- ✓ Bottom-Right corner handle
- ✓ Rotation circle handle

### Non-Interactive (Visual Only):
- ✗ Box outline (cyan/yellow box)
- ✗ Connecting line (from box to rotation handle)

## Testing the Changes

### Test Resize Sensitivity:
1. Select an inscription
2. Drag an edge handle slightly (10-20 pixels)
3. Text should grow/shrink slowly and smoothly
4. No sudden jumps to extreme sizes

### Test Outline Non-Interaction:
1. Select an inscription
2. Try clicking directly on the cyan outline
3. Should NOT trigger any resize
4. Cursor should NOT change when hovering over outline

### Test Size Caps:
1. Drag a corner handle far in one direction
2. Text should stop growing at 5x original size
3. Drag in opposite direction
4. Text should shrink but never disappear completely

## Fine-Tuning Sensitivity

If you want to adjust sensitivity further, modify this value:

```typescript
// In InscriptionBoxSelection.tsx, around line 165
const sensitivity = 500; // Adjust this number

// Higher = less sensitive (requires more mouse movement)
// Lower = more sensitive (requires less mouse movement)

// Examples:
const sensitivity = 300;  // More sensitive
const sensitivity = 700;  // Less sensitive
const sensitivity = 1000; // Very gentle, slow changes
```

## Size Cap Adjustment

To change the maximum size limit:

```typescript
// Cap at different maximum
const sizeMm = Math.max(0.1, Math.min(scale * 100, 500));
//                                                    ^^^ Change this

// Examples:
Math.min(scale * 100, 300)  // Max 3x size
Math.min(scale * 100, 1000) // Max 10x size
Math.min(scale * 100, 200)  // Max 2x size
```

## Size Calculation Explained

The `sizeMm` value is a **percentage multiplier**:
- `100` = keep current size (100%)
- `200` = double the size (200%)
- `50` = half the size (50%)
- `150` = 1.5x the size (150%)

This percentage is then applied in the parent component:
```typescript
const currentSizeMm = height * 1000;
const newSizeMm = currentSizeMm * (data.sizeMm / 100);
```

## Known Behavior

- **Handles scale with text**: As text gets larger/smaller, handles also scale
- **Relative sizing**: All changes are relative to current size, not absolute
- **Smooth scaling**: No snapping or discrete steps
- **Visual feedback**: Handles turn red when hovered, yellow outline on hover

## Troubleshooting

### Resize still too sensitive?
Increase the `sensitivity` value (e.g., from 500 to 700 or 1000)

### Resize too slow?
Decrease the `sensitivity` value (e.g., from 500 to 300 or 250)

### Need larger maximum size?
Increase the cap in `Math.min(scale * 100, 500)` to a higher value

### Outline still clickable?
Check browser console for errors - the raycast disabling should work if refs are properly set

## Performance Impact

- **Negligible**: Disabling raycast on 2 elements has no measurable performance impact
- **Sensitivity change**: No performance impact, just changes calculation
- **Caps**: Actually improve performance by preventing extreme values
