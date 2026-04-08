# Bronze Border Rails Implementation

**Date:** 2026-01-18  
**Status:** Simplified dual-line rail system implemented

---

## Problem

Bronze plaque borders were rendering with decorative corners but **no connecting rails** between corners, leaving gaps. See `screen.png` for visual reference.

---

## Legacy 2D System (CreateJS)

The old system (documented in `legacy1.txt`) used a different approach:

### How It Worked:
1. **Separate bitmap files** for each edge segment:
   - `detail_top` - Top rail repeating pattern
   - `detail_bottom` - Bottom rail repeating pattern  
   - `detail_left` - Left rail repeating pattern
   - `detail_right` - Right rail repeating pattern

2. **Bitmap fill with repeat**:
   ```javascript
   .beginBitmapFill(this.drawBitmap(this.detail_top, color, w, h), "repeat", m)
   .drawRect(-this.maxX / scale, 0, (this.maxX * 2) / scale, h);
   ```

3. **Scaled rectangles**: Each edge was a rectangle filled with the tiled bitmap pattern

### Why It Worked:
- **2D canvas system** made tiling simple
- **Separate assets** for each rail direction
- **CreateJS `beginBitmapFill`** with `"repeat"` mode handled tiling automatically

---

## 3D System Challenges

Our 3D Three.js system has different constraints:

1. **Single corner SVG** - We only have `border1.svg` through `border10.svg` (corner designs)
2. **No separate rail assets** - Legacy had 4 separate rail bitmaps per border
3. **3D geometry required** - Can't just "fill" a rectangle with a repeating texture
4. **Complex extraction** - Trying to extract rail patterns from corner SVG proved unreliable

---

## Attempted Solutions

### ❌ Attempt 1: Extract Edge Segments
```typescript
// Tried to extract the outermost 20% of corner geometry
const threshold = edgeType === 'horizontal' ? 
  bounds.max.x * 0.8 : 
  bounds.max.y * 0.8;
```
**Problem:** Extracted irregular fragments, not clean tileable patterns

### ❌ Attempt 2: Slice and Tile
```typescript
// Tried to slice a thin section (60-75%) and repeat it
minRange = bounds.max.x * 0.6;
maxRange = bounds.max.x * 0.75;
```
**Problem:** Vertices didn't form coherent repeatable segments, just scattered triangles

---

## ✅ Final Solution: Dual-Line Rails

### Approach:
Instead of trying to extract complex decorative patterns, create **simple dual-line rails** that match the bronze aesthetic:

```typescript
const createDecorativeRails = (
  length: number,
  orientation: 'horizontal' | 'vertical'
): THREE.BufferGeometry[] => {
  const rails: THREE.BufferGeometry[] = [];
  
  // Outer line
  const outerLine = orientation === 'horizontal' ?
    new THREE.BoxGeometry(length, lineThickness, reliefDepth) :
    new THREE.BoxGeometry(lineThickness, length, reliefDepth);
  outerLine.translate(0, 0, reliefDepth / 2);
  rails.push(outerLine);
  
  // Inner line with gap
  const innerLine = orientation === 'horizontal' ?
    new THREE.BoxGeometry(length, lineThickness, reliefDepth) :
    new THREE.BoxGeometry(lineThickness, length, reliefDepth);
  innerLine.translate(0, 0, reliefDepth / 2);
  rails.push(innerLine);
  
  return rails;
};
```

### Why This Works:
1. **Simple and reliable** - No complex geometry extraction
2. **Clean bronze look** - Dual parallel lines mimic traditional border styling
3. **Seamless corners** - Lines extend from outer edges of corner decorations
4. **Consistent material** - Same bronze MeshPhysicalMaterial as corners
5. **Performance** - Minimal geometry, fast rendering

### Visual Result:
- **Corners**: Decorative SVG-based 3D shapes (border1-10)
- **Rails**: Two parallel bronze lines connecting corners
- **Gap**: `lineGap = lineThickness * 0.6` creates visual separation
- **Positioning**: Rails extend from corner outer edges to create continuous frame

---

## Key Implementation Details

### Line Thickness
```typescript
const edgeThicknessBase = Math.max(0.01, Math.min(width, height) * 0.02 * BORDER_SCALE);
const edgeThickness = edgeThicknessBase * BORDER_THICKNESS_SCALE;
const lineThickness = edgeThickness * 0.4;
const lineGap = lineThickness * 0.6;
```

### Rail Positioning
```typescript
// Top edge
const topOuterY = topLineY - lineThickness / 2;
const topInnerY = topOuterY - (lineThickness + lineGap);
addEdgeBar(topRails[0], topFullCenterX, topOuterY);  // Outer line
addEdgeBar(topRails[1], topFullCenterX, topInnerY);  // Inner line
```

### Span Calculation
```typescript
// Extend rails to corner OUTER edges (not inner edges)
const leftLineX = leftEdgeOuterX ?? fallbackLeftOuterX;
const rightLineX = rightEdgeOuterX ?? fallbackRightOuterX;
const topFullSpan = clampSpan(rightLineX - leftLineX);
```

---

## Future Enhancements (Optional)

If more decorative rails are needed in the future:

1. **Create separate rail SVGs** - Design dedicated `border1_top.svg`, `border1_left.svg`, etc.
2. **Texture-based approach** - Create small decorative textures and tile them on flat planes
3. **Procedural patterns** - Generate repeating geometric patterns (beads, grooves, etc.)

For now, the dual-line system provides a clean, professional bronze border that works consistently across all border styles (Border 1-10).

---

## Files Modified

- `components/three/BronzeBorder.tsx` - Replaced complex extraction with simple dual-line rails
- Added `createDecorativeRails()` function
- Simplified positioning logic
- Removed `createBridgeSegments()` complexity

---

## Testing

To verify borders render correctly:

1. Navigate to `/select-product`
2. Select a bronze plaque product (e.g., "Bronze Plaque - Rectangle Landscape")
3. Click "Select Border" in left sidebar
4. Choose any border (Border 1-10)
5. **Expected**: Four decorative corners connected by dual bronze rails
6. **No gaps** between corners and rails
7. Rails should be centered on plaque edges

---

## Comparison: Legacy vs New

| Feature | Legacy (2D) | New (3D) |
|---------|-------------|----------|
| Rail Source | 4 separate bitmap files | Procedural BoxGeometry |
| Pattern | Tiled bitmap | Dual parallel lines |
| Complexity | Medium (asset management) | Low (simple geometry) |
| Visual Style | Decorative tiled pattern | Clean dual-line frame |
| Performance | Good (canvas 2D) | Excellent (minimal 3D) |
| Maintainability | Requires rail assets per border | Self-contained code |

---

## Conclusion

The simplified dual-line rail system successfully bridges the gap between decorative corners while maintaining the bronze aesthetic. While not identical to the legacy system's tiled bitmap approach, it provides a clean, professional result that works reliably in 3D without requiring separate rail asset files.
