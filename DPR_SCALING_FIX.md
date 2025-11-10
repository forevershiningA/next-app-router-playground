# DPR Scaling - Final Corrected Solution

## Key Insight
Desktop designs save values in PHYSICAL pixels (already multiplied by DPR), while mobile designs save in logical pixels.

## Desktop Design (DPR 2) Example:
- Canvas: 1296×773 (logical)
- Font size saved: 153px (physical = 153, not 76.5)
- Motif size saved: 80px (physical)
- Screenshot: 2592×1546 (physical = 1296×2, 773×2)

When loaded, screenshot is divided by DPR:
- screenshotDimensions: 1296×773 (logical)

## Correct Approach

### 1. Display Dimensions
Desktop and mobile both skip upscaling:
```typescript
const upscaleFactor = (dpr > 1 && !isDesktopDesign) ? 2 : 1;
displayWidth = screenshotDimensions.width * upscaleFactor;
```
- Desktop: `1296 * 1 = 1296` ✅
- Mobile: `800 * 2 = 1600` ✅

### 2. Font Sizes
Desktop: Don't divide by DPR (already physical)
Mobile: Divide by DPR, multiply by upscale

```typescript
const fontSize = isDesktopDesign
  ? (item.font_size || 16) * scalingFactors.scaleY
  : ((item.font_size || 16) * scalingFactors.scaleY) / dpr * upscaleFactor;
```
- Desktop: `153 * 1.0 = 153px` ✅
- Mobile: `(16 * 1.0) / 2 * 2 = 16px` ✅

### 3. Coordinate Ratios
Desktop: Use logical dimensions (ratio ~1.0)
Mobile: Multiply by DPR first (ratio ~2.0)

```typescript
if (isDesktopDesign) {
  xRatio = screenshotWidthLogical / canvasWidth;  // 1296/1296 = 1.0
} else {
  xRatio = (screenshotWidthLogical * dpr) / canvasWidth;  // (800*2)/800 = 2.0
}
```

## Why Desktop Values Are Physical

When a design is created on desktop with DPR 2:
- User selects font size 76.5px (visual)
- Browser stores it as 153px (76.5 * 2 DPR)
- This 153px is saved in the design file
- Motif sizes, coordinates, etc. are all in physical pixels

Mobile designs work differently - they save logical values.

## Changes Made

**File:** `app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx`

### Font Sizes (Inscriptions & Base)
- Desktop: Use font_size directly (no DPR division)
- Mobile: Divide by DPR, multiply by upscale

### Coordinate Ratios (Inscriptions & Motifs)
- Desktop: `ratio = logical / canvas` (~1.0)
- Mobile: `ratio = (logical * dpr) / canvas` (~2.0)

### Display Dimensions
- Desktop: Use screenshot dimensions (no upscale)
- Mobile: Upscale by 2x

## Status
✅ Complete - Font sizes correct
✅ Complete - Motif sizes correct
✅ Complete - Positions correct
✅ Desktop and mobile both work properly



