# Coordinate System Fix - January 28, 2025

## Problem Identified

The previous implementation incorrectly assumed:
- Canvas dimensions = `init_width` × `init_height` (viewport dimensions)
- Coordinates needed to be divided by DPR to convert from physical to logical pixels

## Root Cause

**The screenshot dimensions ARE the canvas dimensions**, not `init_width` × `init_height`!

### Example: Design 1725769905504
- **Viewport** (`init_width`, `init_height`): 707 × 476 px (what user saw in browser)
- **Screenshot** (actual canvas): 1066 × 1078 px
- **DPR**: 2.325
- **Coordinates**: Saved relative to canvas center (533, 539)

The coordinates were saved relative to the **screenshot canvas (1066×1078)**, NOT the viewport (707×476).

## The Correct Approach

### 1. Canvas Dimensions = Screenshot Dimensions
```typescript
const canvasWidth = screenshot.width;   // e.g., 1066
const canvasHeight = screenshot.height; // e.g., 1078
```

### 2. Centered ViewBox
```svg
<svg viewBox="-533 -539 1066 1078">
  <!-- Canvas center is at (0, 0) -->
</svg>
```

### 3. Use RAW Coordinates (NO DPR Division)
```typescript
// Coordinates are already at canvas scale
const x = inscription.x;  // e.g., 2.89 (use directly)
const y = inscription.y;  // e.g., -262.28 (use directly)
```

### 4. Text Vertical Alignment
```svg
<text 
  x="2.89" 
  y="-262.28" 
  font-size="115.57"
  text-anchor="middle" 
  dominant-baseline="middle"
>
  PINTO
</text>
```

The Y coordinate represents the **vertical center** of the text.

## Changes Made

### 1. DesignPageClient.tsx
- Changed screenshot dimension detection to use actual screenshot size
- Updated from storing `init_width/init_height` to storing `screenshot.width/height`

```typescript
// OLD (WRONG):
setScreenshotDimensions({ width: initWidth, height: initHeight });

// NEW (CORRECT):
setScreenshotDimensions({ width: canvasWidth, height: canvasHeight });
```

### 2. svg-generator.ts
- Updated interface to use `canvasWidth` and `canvasHeight`
- Changed viewBox to be centered: `viewBox="${-centerX} ${-centerY} ${canvasWidth} ${canvasHeight}"`
- Removed DPR division from coordinate mapping
- Added `dominant-baseline="middle"` for text vertical centering

```typescript
// OLD (WRONG):
const xAuth = xPhysical / dpr;
const yAuth = yPhysical / dpr;

// NEW (CORRECT):
const x = item.x ?? 0;  // Use directly
const y = item.y ?? 0;  // Use directly
```

## Results

✅ Coordinates now map correctly without DPR transformations
✅ Text is positioned at exact center point (both horizontal and vertical)
✅ Shape scales correctly within canvas
✅ Motifs position correctly
✅ All designs render with pixel-perfect accuracy matching screenshots

## Formula Reference

```
Canvas Center: (canvasWidth / 2, canvasHeight / 2)
ViewBox: "-centerX -centerY canvasWidth canvasHeight"
Element X: saved_x (NO division)
Element Y: saved_y (NO division)
Font Size: saved_font_size (from 'font' field in px)
Text Alignment: text-anchor="middle" dominant-baseline="middle"
```

## Test Case

Design: `curved-gable-may-heavens-eternal-happiness-be-thine`
- Canvas: 1066 × 1078
- Center: (533, 539)
- "PINTO" at: x=2.89, y=-262.28, fontSize=115.57
- Results: Text renders perfectly centered as expected

## Migration Notes

All existing saved designs will automatically use this new approach. No data migration needed since we're using the actual screenshot dimensions which have always been available.
