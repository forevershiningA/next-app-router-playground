# DPR Scaling - Final Solution with Browser Zoom Detection

## Problem
DPR 1.25 was being treated as a high-DPR device, but it's actually browser zoom (125%), not device pixel ratio. This caused inscriptions to be positioned incorrectly.

## Solution
Distinguish between "real" high DPR (2.0, 3.0 - Retina displays) and browser zoom (1.25, 1.5, 1.75).

### Detection Logic
```typescript
const isRealHighDPR = dpr >= 2.0 && Math.abs(dpr - Math.round(dpr)) < 0.1;
```

**Real High DPR:**
- 2.0, 3.0, 4.0 (Retina, high-DPI displays)
- Integer or very close to integer
- Apply special desktop DPR correction

**Browser Zoom:**
- 1.25, 1.5, 1.75 (125%, 150%, 175% zoom)
- Fractional values
- Treat as normal rendering (no DPR correction)

## Implementation

### Font Sizes
```typescript
const fontSize = (isDesktopDesign && isRealHighDPR)
  ? (item.font_size || 16) * scalingFactors.scaleY  // Real high DPR
  : ((item.font_size || 16) * scalingFactors.scaleY) / dpr * upscaleFactor;  // Normal/zoom
```

### Coordinate Ratios
```typescript
if (isDesktopDesign && isRealHighDPR) {
  xRatio = screenshotWidthLogical / canvasWidth;  // ~1.0
} else {
  xRatio = (screenshotWidthLogical * dpr) / canvasWidth;  // Normal calculation
}
```

### Inscription Positions
```typescript
if (isDesktopDesign && isRealHighDPR) {
  xPos = (item.x / dpr) * scalingFactors.scaleX;  // Divide by DPR
} else {
  xPos = (item.x / xRatio) * scalingFactors.scaleX;  // Use ratio
}
```

## Examples

### Desktop DPR 2.0 (Retina MacBook)
- isRealHighDPR = true
- Font: No DPR division (physical pixels)
- Coords: Divide by DPR first
- **Result:** Displays correctly ✅

### Desktop DPR 1.25 (Browser Zoom 125%)
- isRealHighDPR = false
- Font: Normal calculation with DPR
- Coords: Use ratio adjustment
- **Result:** Displays correctly ✅

### Desktop DPR 1.0 (Standard Display)
- isRealHighDPR = false
- Font: Normal calculation (÷1 = no change)
- Coords: Ratio = 1.0 (no adjustment)
- **Result:** Displays correctly ✅

### Mobile DPR 2.0
- isDesktopDesign = false
- Uses mobile logic (ratio + upscale)
- **Result:** Displays correctly ✅

## Changes Made

**File:** `app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx`

**Updated Sections:**
1. Headstone inscriptions font size & positioning
2. Motifs coordinate ratios
3. Base inscriptions font size

**Added Check:**
```typescript
const isRealHighDPR = dpr >= 2.0 && Math.abs(dpr - Math.round(dpr)) < 0.1;
```

## Status
✅ Real high DPR devices (Retina) work correctly
✅ Browser zoom (1.25, 1.5, etc.) now handled properly
✅ Standard displays (DPR 1.0) unaffected
✅ Mobile designs still work correctly




