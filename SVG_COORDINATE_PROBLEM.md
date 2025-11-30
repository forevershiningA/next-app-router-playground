# SVG Coordinate System Problem - Need Help

## Current Status
We are trying to generate SVG files from saved design JSON data to replace the HTML overlay rendering. The SVG generation works, but the coordinate positioning is incorrect.

## The Design Data Structure

### Example Design: 1578016189116.json

**Canvas (authoring viewport):**
- `init_width: 1126` px (logical canvas width where design was created)
- `init_height: 561` px (logical canvas height where design was created)
- Screenshot: 1126 x 561 px (matches canvas exactly)

**Physical Headstone:**
- `width: 1200` mm (physical stone width in millimeters)
- `height: 1200` mm (physical stone height in millimeters)
- The headstone is a 1200mm x 1200mm SQUARE stone

**Inscriptions (example):**
```json
{
  "label": "Together forever in God's garden",
  "x": -10,
  "y": 221,
  "font_size": 90
}
```
- Coordinates (x, y) are in PIXELS relative to canvas center (0, 0)
- Canvas center is at (1126/2, 561/2) = (563, 280.5) px
- So this text should be at: (563 - 10, 280.5 + 221) = (553, 501.5) px
- Position 501.5 / 561 = 89% down the canvas = **near the bottom**

**Shape:**
- Headstone shape SVG file has viewBox "0 0 400 400" (square)
- Shape represents the physical 1200mm x 1200mm square stone
- Shape needs to be scaled to fit the canvas viewport

## The Problem

### What We've Tried:

**Attempt 1: ViewBox = Canvas dimensions**
```typescript
viewBox="0 0 1126 561"
centerX = 1126/2 = 563
centerY = 561/2 = 280.5
inscriptionY = 280.5 + 221 = 501.5 ✓ Correct position
```
**Issue:** Shape gets squeezed because we scale it (2.815, 1.4025) to fit the landscape canvas, but the headstone is physically square. The shape looks distorted.

**Attempt 2: ViewBox = Full headstone in pixels**
```typescript
// Convert mm to px: 1126px / 1200mm = 0.938 px/mm
fullHeadstoneWidth = 1200mm * 0.938 = 1126px
fullHeadstoneHeight = 1200mm * 0.938 = 1126px
viewBox="0 0 1126 1126" (square)
centerX = 563
centerY = 563
inscriptionY = 563 + 221 = 784
```
**Issue:** Now position 784 / 1126 = 69% down the viewBox = appears in the MIDDLE, not at the bottom where it should be.

**Attempt 3: preserveAspectRatio="none"**
```typescript
viewBox="0 0 1126 561"
preserveAspectRatio="none"
```
**Issue:** Everything (text, motifs, shape) gets squashed vertically when the container doesn't match the aspect ratio.

## Questions We Need Help With

1. **What should the SVG viewBox dimensions be?**
   - The authoring canvas (1126 x 561)?
   - The full physical headstone converted to pixels (1126 x 1126)?
   - Something else?

2. **How do we handle the coordinate system mismatch?**
   - The canvas is 1126 x 561 (landscape - shows a cropped view)
   - The headstone is 1200 x 1200 mm (square - full physical stone)
   - Text coordinates are relative to canvas center (563, 280.5)
   - But the shape represents the full square stone

3. **Should the shape be distorted or cropped?**
   - If we scale the shape to fit the landscape canvas, it gets squeezed
   - If we keep the shape square, it extends beyond the canvas vertically
   - What is the correct approach?

4. **How do the millimeter dimensions relate to pixel coordinates?**
   - Are text coordinates (x: -10, y: 221) positioned within the canvas (1126x561)?
   - Or are they positioned within the full headstone (1200x1200mm converted to px)?

## Current Code

### SVG Generator (lib/svg-generator.ts)
```typescript
// Currently using canvas dimensions
const viewBoxWidth = initWidth;  // 1126
const viewBoxHeight = initHeight; // 561
const centerX = initWidth / 2;    // 563
const centerY = initHeight / 2;   // 280.5

// Shape scaling
const scaleX = viewBoxWidth / 400;  // 2.815
const scaleY = viewBoxHeight / 400; // 1.4025 (non-uniform)

// Inscription positioning
const svgX = centerX + rawX; // 563 + (-10) = 553
const svgY = centerY + rawY; // 280.5 + 221 = 501.5
```

### Expected vs Actual

**Expected (from screenshot):**
- "Together forever" text should be at the bottom of the visible design
- Headstone shape should be square (not squeezed)
- All elements positioned exactly as in the 1126x561 screenshot

**Actual:**
- If viewBox = canvas: text position correct, shape squeezed
- If viewBox = full headstone: shape correct, text in wrong position
- Can't get both working together

## Additional Context

- The HTML overlay rendering works correctly (positions match screenshot)
- We're generating static SVG files for saved designs (not live editor)
- The screenshot (1126x561) shows what was visible during authoring
- The physical stone (1200x1200mm) extends beyond what's visible in screenshot

## Files to Review

1. `lib/svg-generator.ts` - SVG generation logic
2. `app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx` - Container sizing
3. `public/ml/forevershining/saved-designs/json/1578016189116.json` - Example design data
4. `public/ml/forevershining/saved-designs/screenshots/1578016189116.jpg` - Expected output

## What We Need

Clear guidance on:
1. The correct viewBox dimensions
2. How to position elements accounting for canvas vs headstone dimensions
3. Whether the shape should be cropped/distorted/letterboxed
4. The proper coordinate system transformation

Thank you for any help!
