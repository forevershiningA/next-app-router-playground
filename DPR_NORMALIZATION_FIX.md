# DPR Normalization Fix for Desktop Designs

## Problem

Desktop-made designs with unusual DPR (Device Pixel Ratio) values were displaying incorrectly:
- **Font sizes too large** (50mm instead of ~18mm)
- **SVG viewBox too small** (285px x 317px instead of 930px x 523px)

**Example Issue:**
- Design: `1730813199650` (Mother Memorial)
- URL: `/designs/laser-etched-headstone/mother-memorial/1730813199650_beautiful-flower-and-he-saw-you-rest-in-peace-i-will-miss-yo`
- DPR: `1.4700000286102295` (unusual value from browser zoom at ~147%)
- Device: `desktop`
- Product: `908mm x 1047.75mm`
- Navigator: `Chrome (desktop), 930x523`

## Root Causes

### Issue 1: Incorrect Font Size Field
The `font_size` field contained 50mm (incorrect), while the `font` field contained "18.771183846705306px Garamond" (correct pixel size). The system was using the wrong field.

### Issue 2: DPR Used in Multiple Places
Desktop designs should **always use DPR = 1.0**. The unusual DPR value 1.47 was being used in:
1. **Coordinate conversion** (in `saved-design-loader-utils.ts`)
2. **Screenshot dimension calculation** (in `DesignPageClient.tsx`)
3. **Font size scaling**

This caused:
- Font size: 18.77px ÷ 1.5056 (pixels/mm with DPR 1.47) = **12.47mm** → but `font_size` of 50mm was used instead
- SVG viewBox: Screenshot 420px ÷ 1.47 = **285px** (too small!)

## Solutions

### Fix 1: Extract Font Size from `font` Field

**File:** `lib/saved-design-loader-utils.ts`

```typescript
// Extract font size from the 'font' field if available
// Format: "18.771183846705306px Garamond" or "27px Arial"
let fontPixels = 0;
if (insc.font && typeof insc.font === 'string') {
  const fontMatch = insc.font.match(/([\d.]+)px/);
  if (fontMatch) {
    fontPixels = parseFloat(fontMatch[1]);
  }
}

if (fontPixels > 0) {
  // Font size was in pixels at design time, convert to mm
  // Use the X-axis pixels-per-mm ratio for font sizing
  sizeMm = fontPixels / designPixelsPerMmX;
  console.log(`📝 Extracted font: ${fontPixels.toFixed(2)}px → ${sizeMm.toFixed(2)}mm`);
} else {
  // Fallback to font_size field (may be incorrect for some designs)
  sizeMm = insc.font_size || 10;
}
```

### Fix 2: Normalize DPR for Desktop Designs

**File:** `lib/saved-design-loader-utils.ts`

```typescript
if (device === 'desktop') {
  // For desktop designs, always use DPR = 1.0
  if (Math.abs(raw_dpr - 1.0) > 0.01) {
    console.warn(`⚠️ Desktop design with unusual DPR: ${raw_dpr.toFixed(4)}, normalizing to 1.0`);
    design_dpr = 1.0;
  }
}
```

**File:** `app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx`

```typescript
// Normalize DPR: desktop designs should always use DPR = 1.0
let designDPR = rawDPR;
if (device === 'desktop' && Math.abs(rawDPR - 1.0) > 0.01) {
  console.warn(`Desktop design with unusual DPR ${rawDPR.toFixed(4)}, normalizing to 1.0`);
  designDPR = 1.0;
}
```

## Results

For design `1730813199650` with DPR 1.47 → normalized to 1.0:

### Before Fix
- Font size: 50mm (incorrect `font_size` field)
- SVG viewBox: `0 0 285.7 317.7` (420px screenshot ÷ 1.47 DPR)
- Display: Fonts way too large, SVG too small

### After Fix
- Font size: 18.33mm (18.77px ÷ 1.0242 pixels/mm)
- SVG viewBox: `0 0 930 523` (screenshot dimensions with DPR 1.0)
- Display: Correct font sizes, correct SVG dimensions

## Impact

- **Desktop Designs:** Always loaded with DPR = 1.0 (fixes zoom-related issues)
- **Mobile Designs:** Normalized to standard DPR values (1.0, 1.5, 2.0, 2.5, 3.0, 4.0)
- **Font Sizes:** Extracted from `font` field pixel values, converted properly to mm
- **SVG Dimensions:** Calculated correctly using normalized DPR
- **Backward Compatibility:** All existing designs work with automatic correction

## Files Modified

1. `lib/saved-design-loader-utils.ts`
   - Added DPR normalization for desktop vs mobile
   - Extract font size from `font` field instead of `font_size`
   
2. `app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx`
   - Added DPR normalization for screenshot dimension calculation

3. `DPR_NORMALIZATION_FIX.md` - This documentation

## Related Files

- Design example: `public/ml/headstonesdesigner/saved-designs/json/1730813199650.json`

## Future Considerations

1. Add client-side validation to prevent saving designs with browser zoom active (DPR ≠ 1.0 on desktop)
2. Display warning in design tool if DPR ≠ 1.0 on desktop
3. Consider adding "Reset Zoom" reminder in design interface
4. Fix the `font_size` field generation in the original design saving code
