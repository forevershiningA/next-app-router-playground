# Unified Design Loading Fix

## Problem Analysis

After examining the original `Design.js`, we found inconsistencies in how saved designs are loaded in the new Next.js system.

## Key Findings from Original Design.js

### 1. DPR Handling (Lines 2108-2162)
```javascript
// Get saved DPR
if (this.design_data[0].dpr != undefined) {
    _dpr = Number(this.design_data[0].dpr);
    dyo._dpr = _dpr;
}

// KEY: If current DPR equals saved DPR, no scaling needed
if (Number(dyo.dpr) == Number(_dpr)) { ratio = 1 }

// Calculate ratios for different screen sizes
ratio_width = (dyo.w / init_width) * (ratio);
ratio_height = (dyo.h / init_height) * (ratio);
```

### 2. Inscription Font Handling (Lines 2260-2296)
```javascript
case "Inscription":
    let font = d.font.split("px");
    font = Number(font[0]) + "px" + font[1];  // Uses font field directly!
    
    data.push({
        "font": font,                          // "27.216px Arial"
        "font_size": Number(d.font_size),      // Stored but not used for display
        "x": Math.round(ratio_height * Number(d.x)),
        "y": Math.round(ratio_height * Number(d.y)),
    });
```

**Critical**: The old system uses the `font` field (pixels) directly, NOT the `font_size` field!

### 3. Position Scaling (Lines 2291-2292, 2324-2325)
```javascript
// Inscriptions
"x": Math.round(ratio_height * Number(d.x)),
"y": Math.round(ratio_height * Number(d.y)),

// Motifs  
"x": Math.round(ratio_height * Number(d.x)),
"y": Math.round(ratio_height * Number(d.y)),
"height": Math.round(ratio_height * Number(d.height)),
```

Both X and Y use `ratio_height` for scaling!

## Current Implementation Problems

### Problem 1: Font Size Field Confusion
**Current code** (lib/saved-design-loader-utils.ts):
- Sometimes uses `insc.font_size` (which is often wrong - e.g., 50mm)
- Sometimes extracts from `insc.font` field (correct)
- **Inconsistent approach**

### Problem 2: DPR Normalization
**Current approach**:
- Desktop: normalize unusual DPR to 1.0
- Mobile: normalize to standard values (1.5, 2.0, etc.)

**Issue**: This changes the saved DPR, affecting coordinate calculations

### Problem 3: Coordinate System Mismatch
**New system**:
- Converts pixels to mm using `designPixelsPerMmX` and `designPixelsPerMmY`
- Uses product dimensions in mm

**Old system**:
- Applied ratio-based scaling to pixel coordinates
- Kept everything in pixels until final render

## Proposed Unified Solution

### Core Principle
**Match the old system's behavior exactly:**
1. Use saved DPR as-is for calculations (don't normalize)
2. Calculate scaling ratio between saved viewport and current viewport
3. Use `font` field (pixels) directly, scale by ratio if needed
4. Apply same ratio to X, Y, and height

### Implementation Plan

```typescript
// 1. Get saved design parameters
const saved_dpr = baseProduct?.dpr || 1;
const saved_init_width = baseProduct?.init_width || 1116;
const saved_init_height = baseProduct?.init_height || 654;
const saved_device = baseProduct?.device || 'desktop';

// 2. Get current viewport (for display)
const current_width = productWidthMm;   // e.g., 908mm
const current_height = productHeightMm; // e.g., 1047.75mm
const current_dpr = 1; // We always display at DPR 1

// 3. Calculate ratio (matching Design.js logic)
let ratio = 1;
if (current_dpr !== saved_dpr) {
    if (current_dpr > saved_dpr) {
        ratio = current_dpr / saved_dpr;
    } else {
        ratio = current_dpr / saved_dpr;
    }
}

// 4. Calculate viewport-based scaling
const ratio_width = (current_width / saved_init_width) * ratio;
const ratio_height = (current_height / saved_init_height) * ratio;

// 5. For inscriptions
for (const insc of inscriptions) {
    // Extract pixel size from 'font' field (NOT font_size!)
    const fontMatch = insc.font.match(/([\d.]+)px/);
    const fontPixels = fontMatch ? parseFloat(fontMatch[1]) : 27;
    
    // Convert to mm using current product's pixels-per-mm
    // BUT: old system used font in pixels directly!
    // We need to scale pixel font size by ratio
    const scaledFontPixels = fontPixels * ratio;
    const fontSizeMm = scaledFontPixels / pixelsPerMmAtCurrentSize;
    
    // Scale positions
    const x = Math.round(ratio_height * insc.x);
    const y = Math.round(ratio_height * insc.y);
    
    addInscription({ text, fontSizeMm, x, y });
}

// 6. For motifs
for (const motif of motifs) {
    const height = Math.round(ratio_height * motif.height);
    const x = Math.round(ratio_height * motif.x);
    const y = Math.round(ratio_height * motif.y);
    
    addMotif({ height, x, y });
}
```

## Action Items

1. **Remove DPR normalization** - Use saved DPR as-is
2. **Always use `font` field** - Extract pixels, never use `font_size`
3. **Implement ratio calculation** - Match Design.js logic exactly
4. **Use ratio_height for all scaling** - X, Y, height, font
5. **Test with problematic designs**:
   - Desktop DPR 1.47 design
   - Mobile DPR 2.0 design
   - Various product sizes

## Expected Results

All designs should load identically to how they appeared when saved, regardless of:
- Saved DPR value
- Desktop vs mobile
- Current viewing device
- Product dimensions

## Migration Notes

This is a **breaking change** - all existing saved design loading code needs to be updated to use the unified approach.

**Files to update**:
- `lib/saved-design-loader-utils.ts` - Main loading logic
- `app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx` - Preview rendering
- Any other components that load saved designs
