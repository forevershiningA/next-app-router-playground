# Inscription Box Selection - Fixed Outline Rendering

## Issue Fixed

The box outline was not rendering all 4 sides (left and right lines were missing).

## Root Cause

`lineSegments` expects pairs of points for individual line segments, not a continuous closed path. It was only rendering pairs:
- Point 0-1: Bottom line ✓
- Point 2-3: Top line ✓  
- Point 4: (no pair, not rendered) ✗

This left the left and right sides missing.

## Solution

Replaced `lineSegments` with `Line` from `@react-three/drei`:

```typescript
import { Html, Line } from '@react-three/drei';

// Box outline
<Line
  ref={outlineRef}
  points={outlinePoints}  // Array of Vector3 points
  color={outlineColor}
  lineWidth={2}
  renderOrder={1000}
  depthWrite={false}
/>
```

The `Line` component properly handles continuous paths and closed loops.

## What Changed

### Before (broken):
```typescript
<lineSegments>
  <bufferGeometry>
    <bufferAttribute ... />
  </bufferGeometry>
  <lineBasicMaterial ... />
</lineSegments>
```

### After (working):
```typescript
<Line
  points={outlinePoints}
  color={outlineColor}
  lineWidth={2}
  ...
/>
```

## Benefits of Using `Line` from drei

1. **Simpler syntax** - No manual buffer geometry setup
2. **Handles closed paths** - Automatically connects all points
3. **Better performance** - Optimized implementation
4. **More features** - Built-in dashed lines, gradient colors, etc.
5. **Type-safe** - Better TypeScript support

## Current Rendering

Now all 4 sides render correctly:

```
    ┌─────────┐  ← All 4 sides visible
    │         │
    │  TEXT   │
    │         │
    └─────────┘
```

- **Top line**: ✓ Rendered
- **Right line**: ✓ Rendered (was missing)
- **Bottom line**: ✓ Rendered
- **Left line**: ✓ Rendered (was missing)

## Additional Fix

Also updated the connecting line to use `Line`:

```typescript
<Line
  points={[
    [0, bounds.height / 2, 0],
    [0, bounds.height / 2 + rotateHandleOffset, 0],
  ]}
  color={outlineColor}
  lineWidth={1}
  ...
/>
```

This ensures consistency and proper rendering.

## Non-Interactive Behavior Maintained

Both lines still have raycasting disabled:

```typescript
const outlineRef = React.useRef<any>(null);
const lineRef = React.useRef<any>(null);

React.useEffect(() => {
  if (outlineRef.current) {
    outlineRef.current.raycast = () => {}; // Not clickable
  }
  if (lineRef.current) {
    lineRef.current.raycast = () => {}; // Not clickable
  }
}, []);
```

## Visual Result

You should now see:
- ✓ Complete cyan box outline (all 4 sides)
- ✓ Thin connecting line to rotation handle
- ✓ Green rotation circle above the text
- ✓ Outline turns yellow when rotation handle is hovered
- ✓ No clickable bars or squares
- ✓ Only rotation handle is interactive

The outline now properly shows the complete bounding box around the selected inscription!
