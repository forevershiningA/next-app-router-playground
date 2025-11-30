# Headstone Width Correction - MM to PX Scale

## Critical Discovery

The headstone width should NOT be used directly as pixels. Instead, it must be converted using the MM-to-PX scale derived from the base width.

## The Correct Formula

### Base Establishes the Scale:
```javascript
Base width:    700 mm
Canvas width:  1066 px

Scale factor = 1066 / 700 = 1.523 px/mm
```

### Headstone Dimensions in Canvas:
```javascript
Headstone (mm):  609.6 × 609.6 mm
Scale factor:    1.523 px/mm

Headstone (px) = 609.6 × 1.523 = 928.3 × 928.3 px
```

## What Was Wrong Before

### ❌ Previous Approach:
- Assumed: 609.6 mm = 609.6 px (1:1 mapping)
- Headstone width: 609.6 px
- Headstone centered at x = -304.8 px
- **This was incorrect!**

### ✅ Correct Approach:
- Base width (700mm) = full canvas width (1066px)
- Scale: 1.523 px/mm
- Headstone width: 609.6mm × 1.523 = 928.3 px
- Headstone centered at x = -464.15 px

## Updated Transform

### Old (Wrong):
```svg
<g transform="translate(-304.8, -539) scale(1.524)">
  <!-- Scale: 609.6 / 400 = 1.524 -->
```

### New (Correct):
```svg
<g transform="translate(-464.15, -539) scale(2.321)">
  <!-- Scale: 928.3 / 400 = 2.321 -->
```

## Calculation Breakdown

### Step 1: Determine Scale Factor
```
Base: 700mm spans 1066px
Scale = 1066px / 700mm = 1.523 px/mm
```

### Step 2: Convert Headstone to Pixels
```
Headstone width:  609.6mm × 1.523 = 928.3px
Headstone height: 609.6mm × 1.523 = 928.3px
```

### Step 3: Calculate SVG Scale
```
SVG viewBox: 400 × 400
Target size: 928.3 × 928.3px
SVG scale: 928.3 / 400 = 2.321
```

### Step 4: Calculate Position
```
Center horizontally: -928.3 / 2 = -464.15px
Align to top: y = -539px (canvas top)

Transform: translate(-464.15, -539) scale(2.321)
```

## Visual Comparison

### Before (Wrong - 609.6px width):
```
Canvas: 1066px wide
        ├─────────────────────────┤
        │                         │
        │      ┌─────────┐        │
        │      │Headstone│        │  ← Too narrow (609.6px)
        │      │ 609.6px │        │
        │      └─────────┘        │
        │                         │
```

### After (Correct - 928.3px width):
```
Canvas: 1066px wide
        ├─────────────────────────┤
        │                         │
        │   ┌───────────────┐     │
        │   │  Headstone    │     │  ← Proper size (928.3px)
        │   │   928.3px     │     │
        │   └───────────────┘     │
        │                         │
```

## Why This Matters

### Proportions:
- **Base:** 700mm = 1066px (100% width = full canvas)
- **Headstone:** 609.6mm = 928.3px (87% of canvas width)
- **Ratio:** 609.6 / 700 = 0.871 (headstone is 87.1% of base width)

### Verification:
```javascript
928.3 / 1066 = 0.871 ✅ (matches physical ratio)
609.6 / 1066 = 0.572 ❌ (wrong, too narrow)
```

## Impact on Inscriptions and Motifs

**Good news:** Inscriptions and motifs don't need to change!

They are positioned using **absolute coordinates relative to canvas center (0,0)**, not relative to the headstone shape.

- Inscription coordinates: already in canvas pixels
- Motif coordinates: already in canvas pixels
- Only the headstone shape size changes

## Updated Test HTML

The test HTML now correctly shows:

✅ **Headstone:** 928.3 × 928.3 px (from 609.6mm)  
✅ **Base reference:** 1066 px width (from 700mm)  
✅ **Scale factor:** 1.523 px/mm  
✅ **Proper proportions:** Headstone is 87% of base width  
✅ **Inscriptions/motifs:** Unchanged (already in canvas px)  

## Canvas Layout (Corrected)

```
                    Top: y = -539
        ├──────────── 1066px ────────────┤
        ┌─────────────────────────────────┐
        │                                 │
        │     ┌─────────────────┐         │
        │     │   HEADSTONE     │         │  928.3px wide
        │     │   928.3 × 928.3 │         │  (609.6mm)
        │     │                 │         │
        │     │                 │         │
        │     └─────────────────┘         │
        │                                 │
        ├─────────────────────────────────┤  y = 439
        │         BASE AREA               │  1066px wide
        │         (700mm = 1066px)        │  (700mm)
        └─────────────────────────────────┘
                  Bottom: y = 539
```

## Files Modified

1. **test-coordinate-approach.html**
   - Updated headstone transform: `translate(-464.15, -539) scale(2.321)`
   - Updated headstone label: "609.6mm = 928.3px"
   - Updated base label: "700mm = 1066px"
   - Updated analysis section with MM-to-PX scale explanation

## Verification Steps

1. Open test HTML
2. Check headstone width visually - should be ~87% of canvas width
3. Verify: 928.3 / 1066 ≈ 0.871 ✅
4. Compare with live page - headstone should now match size
5. Inscriptions/motifs should still be in correct positions

## Key Takeaway

**The base width (700mm) establishes the MM-to-PX scale for the entire canvas.**

All millimeter measurements must be converted to pixels using:
```
pixels = millimeters × (canvas_width_px / base_width_mm)
pixels = millimeters × (1066 / 700)
pixels = millimeters × 1.523
```

This is the **fundamental scaling relationship** that was missing!
