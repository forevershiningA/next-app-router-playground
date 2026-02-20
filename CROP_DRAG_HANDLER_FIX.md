# Crop Canvas Center-Based Scaling Fix (2026-02-19)

## Problem
When dragging corner handles to resize the crop area, it was scaling from the opposite corner (anchor-based). This meant when centering an oval portrait mask over a face and then dragging the bottom-right corner, the mask would move away from the face instead of staying centered on it.

## User Expectation
When an oval mask is centered over a face:
- Drag bottom-right corner → Mask should **grow in all directions** from center
- Drag top-left corner → Mask should **grow in all directions** from center
- The center point should **remain fixed** over the face
- Both opposite corners should move during resize

## Solution: Center-Based Scaling

Changed from **anchor-based scaling** (opposite corner stays fixed) to **center-based scaling** (center point stays fixed).

### Key Algorithm Changes

**Before (Anchor-Based)**:
```typescript
// Opposite corner was anchor (stayed fixed)
const anchorX = handle.includes('w') ? initialCropArea.x + initialCropArea.width : initialCropArea.x;
const anchorY = handle.includes('n') ? initialCropArea.y + initialCropArea.height : initialCropArea.y;

// Position calculated from anchor
let nextX = handle.includes('w') ? anchorX - nextWidth : anchorX;
let nextY = handle.includes('n') ? anchorY - nextHeight : anchorY;
```

**After (Center-Based)**:
```typescript
// Center point stays fixed
const centerX = initialCropArea.x + initialCropArea.width / 2;
const centerY = initialCropArea.y + initialCropArea.height / 2;

// Deltas multiplied by 2 (both sides change)
const deltaWidth = handle.includes('w') ? -deltaX * 2 : deltaX * 2;
const deltaHeight = handle.includes('n') ? -deltaY * 2 : deltaY * 2;

// Position calculated from center
let nextX = centerX - nextWidth / 2;
let nextY = centerY - nextHeight / 2;
```

### Why Multiply by 2?

When dragging bottom-right corner to the right by 10px:
- **Anchor-based**: Width increases by 10px (left edge stays, right edge moves)
- **Center-based**: Width increases by 20px (left edge moves left 5px, right edge moves right 5px)

By multiplying delta by 2, we ensure both sides move equally from the center.

## Implementation Details

### 1. Calculate Fixed Center Point
```typescript
const centerX = initialCropArea.x + initialCropArea.width / 2;
const centerY = initialCropArea.y + initialCropArea.height / 2;
```

### 2. Double the Deltas
```typescript
// User drags right by deltaX, but we want both sides to change
const deltaWidth = handle.includes('w') ? -deltaX * 2 : deltaX * 2;
const deltaHeight = handle.includes('n') ? -deltaY * 2 : deltaY * 2;
```

### 3. Position from Center
```typescript
// New position keeps center fixed
let nextX = centerX - nextWidth / 2;
let nextY = centerY - nextHeight / 2;
```

### 4. Clamp to Bounds (Center-Aware)
When hitting bounds, calculate maximum size that keeps the center fixed:

```typescript
const clampHorizontal = () => {
  if (nextX < 0) {
    nextX = 0;
    nextWidth = centerX * 2; // Max width that keeps center at centerX
    nextHeight = nextWidth / aspectRatio;
    nextY = centerY - nextHeight / 2;
  } else if (nextX + nextWidth > 100) {
    nextWidth = (100 - centerX) * 2; // Max width that keeps center at centerX
    nextX = centerX - nextWidth / 2;
    nextHeight = nextWidth / aspectRatio;
    nextY = centerY - nextHeight / 2;
  }
};
```

## Behavior Examples

### Dragging SE (Bottom-Right) Corner

**Scenario**: Oval mask centered over face at x: 30%, y: 20%, size: 40×60%

**Action**: Drag SE corner right +10%, down +15%

**Old Behavior (Anchor-Based)**:
- Top-left stays at (30, 20)
- Width: 40 → 50 (+10)
- Height: 60 → 75 (+15)
- Center moves from (50, 50) to (55, 57.5) ❌ Mask moves off face

**New Behavior (Center-Based)**:
- Center stays at (50, 50) ✅ Stays on face
- Width: 40 → 60 (+20, both sides)
- Height: 60 → 90 (+30, both sides)
- Top-left moves to (20, 5)
- Bottom-right moves to (80, 95)

### Dragging NW (Top-Left) Corner

**Action**: Drag NW corner left -10%, up -10%

**New Behavior (Center-Based)**:
- Center stays at (50, 50) ✅
- Width increases by 20% (both sides)
- Height increases by 20% (both sides)
- All four corners move outward from center

## Files Modified
- `components/CropCanvas.tsx` - Changed to center-based scaling
- `lib/headstone-store.ts` - TypeScript types (already added)
- `CROP_DRAG_HANDLER_FIX.md` - Updated documentation

## Constraints
- **Aspect ratio**: Maintained during resize
- **Center point**: Fixed at initial position
- **Minimum size**: 10% (prevents too-small crops)
- **Canvas bounds**: 0-100%, clamps while keeping center fixed
- **Both sides move**: Each corner drag affects all four corners

## Testing Checklist
- [x] TypeScript compilation passes
- [x] Center-based scaling implemented
- [x] Deltas multiplied by 2
- [ ] Manual QA: Center oval over face, drag SE - stays centered
- [ ] Manual QA: Center oval over face, drag NW - stays centered
- [ ] Manual QA: Center oval over face, drag NE - stays centered
- [ ] Manual QA: Center oval over face, drag SW - stays centered
- [ ] Manual QA: Drag to canvas bounds - center maintained
- [ ] Manual QA: Aspect ratio preserved
- [ ] Manual QA: All four corners move during resize

## Benefits
✅ **Stays centered**: Mask remains on face during resize  
✅ **Intuitive**: Scales outward from center like most image editors  
✅ **Aspect ratio preserved**: Still maintains proportions  
✅ **Smooth scaling**: Both sides adjust simultaneously  
✅ **Bounds-safe**: Clamping keeps center fixed when possible  

## Visual Comparison

**Anchor-Based (Old)**:
```
Before:     After (drag SE →↓):
┌─────┐     ┌─────────┐
│  O  │     │  O      │      ← Center moved right/down
│     │     │         │
└─────┘     │         │
            └─────────┘
```

**Center-Based (New)**:
```
Before:     After (drag SE →↓):
  ┌───┐       ┌─────────┐
  │ O │       │    O    │    ← Center stayed fixed
  └───┘       │         │
              └─────────┘
```

## Reference
- **Implementation Date**: 2026-02-19
- **Status**: Center-based scaling implemented, ready for testing
