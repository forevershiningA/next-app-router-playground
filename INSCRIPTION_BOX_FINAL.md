# Inscription Box Selection - Final Implementation

## Critical Fixes Applied

### 1. **Proper Scale/Units**
The handles are now sized **relative to text bounds**, not absolute units:
- `handleSize = bounds.height * 0.05` (5% of text height)
- `cornerSize = bounds.height * 0.08` (8% of text height)
- `edgeHandleLength = max(bounds.width * 0.3, bounds.height * 0.5)`
- `rotateHandleSize = bounds.height * 0.15` (15% of text height)

This ensures handles scale with the text and are always visible.

### 2. **Fixed Z-Fighting (Outline Disappearing)**
Replaced `depthTest={false}` with `depthWrite={false}` + `renderOrder`:
- Outline: `renderOrder={1000}`
- Edge handles: `renderOrder={1001}`
- Corner handles: `renderOrder={1002}`
- Rotation handle: `renderOrder={1003}`

This prevents the outline from disappearing into the headstone surface.

### 3. **Changed to lineSegments**
Replaced `<line>` with `<lineSegments>` to support `renderOrder` prop.

### 4. **Added unitsPerMeter Prop**
The component now receives the `unitsPerMeter` from the headstone to understand the coordinate system.

### 5. **Bright Colors for Visibility**
- Outline: Cyan (0x00ffff) → Yellow (0xffff00) on hover
- Handles: White (0xffffff) → Red (0xff0000) on hover/drag
- Rotation: Green (0x00ff00) → Magenta (0xff00ff) on hover/drag

## Component Props

```typescript
type Props = {
  inscriptionId: string;
  position: THREE.Vector3;
  bounds: { width: number; height: number };
  rotation: number; // in radians
  unitsPerMeter: number; // NEW - coordinate system scale
  onUpdate?: (data: {
    xPos?: number;
    yPos?: number;
    sizeMm?: number;
    rotationDeg?: number;
  }) => void;
};
```

## Usage in HeadstoneInscription

```typescript
{selected && textBounds.width > 0 && (
  <InscriptionBoxSelection
    inscriptionId={id}
    position={new THREE.Vector3(0, 0, 0.002)}
    bounds={{
      width: textBounds.width,
      height: textBounds.height,
    }}
    rotation={0}
    unitsPerMeter={units}  // Pass the headstone's units
    onUpdate={(data) => {
      // Handle updates...
    }}
  />
)}
```

## Visual Hierarchy (RenderOrder)

```
1000: Box outline + connection line
1001: Edge handles (top, bottom, left, right)
1002: Corner handles (4 corners)
1003: Rotation handle
```

Higher renderOrder = renders on top, preventing z-fighting.

## Handle Sizes (Relative to Text)

| Handle Type | Size Formula | Example (100px text) |
|-------------|--------------|---------------------|
| Edge handle thickness | 5% of height | 5px |
| Edge handle length | 30% of width or 50% of height | 30-50px |
| Corner handle | 8% x 8% of height | 8px square |
| Rotation circle | 15% of height | 15px diameter |
| Rotation offset | 120% of height above | 120px above |

## Debugging

Console logs are added to track:
```javascript
console.log('[InscriptionBoxSelection] Bounds:', bounds, 'Units/m:', unitsPerMeter, 'HandleSize:', handleSize);
console.log('[InscriptionBoxSelection] Handle hover:', handle);
console.log('[InscriptionBoxSelection] Handle clicked:', handleType);
console.log('[InscriptionBoxSelection] Dragging:', dragHandle, 'delta:', deltaX, deltaY);
```

Check browser console to see if:
1. Component is rendering
2. Bounds are calculated correctly
3. Handles are being hovered/clicked
4. Drag events are firing

## Material Settings

All meshes use:
```typescript
<meshBasicMaterial 
  color={color} 
  depthWrite={false}  // Don't write to depth buffer
  side={THREE.DoubleSide}  // (rotation circle only)
/>
```

`depthWrite={false}` allows handles to overlay without creating depth conflicts, while `renderOrder` controls draw order.

## Expected Behavior

When an inscription is selected, you should see:

1. **Cyan outline** around the text (turns yellow on hover)
2. **4 white squares** at corners (turn red when hovered)
3. **4 white bars** on edges (turn red when hovered)
4. **Large green circle** above text with ⟲ icon (turns magenta when hovered)
5. **Thin cyan line** connecting box to rotation handle

### Interactions:
- **Hover any handle** → Changes color (red for handles, magenta for rotation)
- **Drag edge** → Resizes in that direction
- **Drag corner** → Proportional resize
- **Drag rotation circle** → Rotates text
- **Console logs** → Verify all interactions

## Troubleshooting

### Still No Handles Visible?

1. **Check console for logs** - Should see:
   ```
   [InscriptionBoxSelection] Bounds: {width: X, height: Y} Units/m: Z HandleSize: W
   ```
   
2. **Verify text bounds** - If width/height are very small (< 0.01), handles may be too small
   
3. **Check selection state** - Inscription must have `selected={true}`

4. **Check z-position** - Selection box at `0.002`, should be above text

5. **Look for the rotation handle** - It's the largest element, should be easiest to spot

### Handles Too Small?

If handles are still too small, increase the multipliers in the component:
```typescript
const handleSize = bounds.height * 0.10; // Increase from 0.05
const cornerSize = bounds.height * 0.15; // Increase from 0.08
const rotateHandleSize = bounds.height * 0.25; // Increase from 0.15
```

### Rotation Not Working?

1. Check console for "Handle clicked: rotate"
2. Verify cursor changes to "grabbing"
3. Check for "Dragging: rotate" messages
4. Ensure orbit controls are being disabled during drag

## Performance

- All geometries are simple (boxes, circles)
- Materials are basic (no complex shaders)
- Event listeners properly cleaned up
- Console logs can be removed in production
