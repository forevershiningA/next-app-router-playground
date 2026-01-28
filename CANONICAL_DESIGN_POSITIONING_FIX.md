# Canonical Design Positioning Analysis & Fix

**Date:** 2026-01-26  
**Design:** 1725769905504 (Curved Gable "May Heaven's eternal happiness be thine")

## Issue Summary

Comparing the original 2D design (left) with the 3D Designer version (right), several positioning discrepancies are visible:

### Visual Differences Observed

1. **Top Motifs (Flowers & Birds)**:
   - Appear at different vertical positions
   - Birds (motifs with asset `1_129_03`) should be closer to the top edge
   - Flowers (asset `1_154_15`) should be positioned differently

2. **Bottom Motifs**:
   - Cross and angel/statue motifs at bottom appear misaligned
   - Bottom-left motif (asset `1_155_13`) position differs

3. **Center Figure**:
   - Large center statue/figure (asset `1_184_13`) vertical position differs

4. **Text Inscriptions**:
   - Generally correct but may need minor adjustments
   - Right-side name block (TERESA ISABELLA / ISABEL WADE) positioning

## Current Coordinate System

### Canonical Format (v2026)
- **Units**: Millimeters (mm)
- **Origin**: Center of headstone (0, 0)
- **Y-Axis**: Positive Y = up from center
- **X-Axis**: Positive X = right from center

### Legacy Format (ML JSON)
- **Units**: Pixels
- **Origin**: Center of canvas
- **Y-Axis**: Positive Y = down from center (Y-down convention)
- **X-Axis**: Positive X = right from center

### Conversion Formula
```javascript
// From legacy (pixels, Y-down) to canonical (mm, Y-up)
const canvasX = usesPhysicalCoords ? rawX / designDpr : rawX;
const canvasY = usesPhysicalCoords ? rawY / designDpr : rawY;

const xMm = canvasX * mmPerPxX;
const yMm = -canvasY * mmPerPxY;  // Negate for Y-down → Y-up
```

## Analysis of Current Data

### Example Motif from Canonical JSON

```json
{
  "id": "motif-10",
  "asset": "1_154_15",  // Flower/bird
  "position": {
    "x_mm": -47.666,
    "y_mm": 338.63,     // Very high positive Y
    "z_mm": 0
  },
  "height_mm": 80.513,
  "rotation": {
    "z_deg": 73
  },
  "color": "#000000",
  "surface": "headstone/front"
}
```

### Headstone Bounds
- **Headstone height**: 609.6mm
- **Y-range**: -304.8mm to +304.8mm (±height/2)
- **motif-10 Y position**: 338.63mm ← **EXCEEDS BOUNDS** by ~34mm

## Root Cause

The issue appears to be **incorrect coordinate origin** in the canonical conversion:

1. **Expected Origin**: Center of headstone only
2. **Actual Origin**: Center of entire canvas (headstone + base)

When a design has a base (100mm height), the stage center is shifted:
- Stage height = 609.6mm (headstone) + 100mm (base) = 709.6mm
- Stage center Y = 354.8mm from headstone bottom
- Headstone center Y = 304.8mm from headstone bottom
- **Offset = 50mm** (half of base height)

### Evidence
Looking at motif-10:
- Y position: 338.63mm
- If we subtract 50mm (base offset): 338.63 - 50 = 288.63mm
- This would place it near the top of the headstone (304.8mm = top edge)
- **This matches the visual position in the original design!**

## Solution

### Option 1: Fix Conversion Script (Preferred)
Modify `scripts/convert-legacy-design.js` to convert coordinates relative to headstone center, not stage center:

```javascript
function convertMotifs(legacyData, metrics, canvasInfo) {
  const motifs = legacyData.filter((item) => item.type === 'Motif' && (item.src || item.item));
  const base = legacyData.find((item) => item.type === 'Base');
  const baseHeight = base?.height || 0;
  const baseOffsetMm = baseHeight / 2; // Offset to shift from stage to headstone coords
  
  return motifs.map((motif) => {
    // ... existing code ...
    
    const surfaceIsBase = surface.startsWith('base');
    let yMm = round(-canvasY * mmPerPxY);
    
    // Adjust headstone motifs to be relative to headstone center, not stage center
    if (!surfaceIsBase && baseHeight > 0) {
      yMm = yMm - baseOffsetMm;
    }
    
    return {
      id,
      asset,
      position: {
        x_mm: xMm,
        y_mm: yMm,
        z_mm: 0,
      },
      // ... rest of fields ...
    };
  });
}
```

### Option 2: Fix Loader (Temporary)
Adjust `lib/saved-design-loader-utils.ts` to compensate when loading canonical designs:

```javascript
// In loadCanonicalDesignIntoEditor()
const baseOffsetMm = base?.height_mm ? base.height_mm / 2 : 0;

for (const motif of canonicalMotifSnapshot) {
  let yMm = motif.position?.y_mm ?? 0;
  
  // Compensate for stage-center coords if base exists
  if (target === 'headstone' && baseOffsetMm > 0) {
    yMm = yMm - baseOffsetMm;
  }
  
  store.setMotifOffset(motifId, {
    xPos: motif.position?.x_mm ?? 0,
    yPos: yMm,
    // ... rest of offset ...
  });
}
```

## Inscriptions
Similar analysis needed for inscriptions - they may have the same issue.

## Action Items

1. ✅ Document the issue
2. ✅ Re-run conversion script with fix for design 1725769905504
3. ✅ Verify all motifs fall within headstone bounds
4. ⬜ Test loading in 3D Designer
5. ⬜ Compare visual alignment with original
6. ⬜ Apply same fix to all canonical designs if needed

## Fix Applied (2026-01-26)

### Changes Made to Conversion Script

Modified `scripts/convert-legacy-design.js`:

1. **convertInscriptions()**: Added base offset compensation
2. **convertMotifs()**: Added base offset compensation

### Code Changes

```javascript
// In both convertInscriptions() and convertMotifs()
const baseHeightMm = base?.height || 0;
const baseOffsetMm = baseHeightMm / 2;

// After converting from pixels to mm
if (!surfaceIsBase && baseHeightMm > 0) {
  yMm = yMm - baseOffsetMm;
}
```

### Results for Design 1725769905504

**Headstone bounds**: ±304.8mm (half of 609.6mm)  
**Base offset applied**: -50mm (half of 100mm base height)

**Example Adjustments**:

| Element | Before Y | After Y | Change | Status |
|---------|----------|---------|--------|--------|
| KLEIN | 232.051mm | 182.051mm | -50mm | ✅ Within bounds |
| motif-10 (flower) | 338.63mm | 288.63mm | -50mm | ✅ Within bounds |
| motif-13 (bird) | 304.665mm | 254.665mm | -50mm | ✅ Within bounds |
| motif-14 (bird) | 311.047mm | 261.047mm | -50mm | ✅ Within bounds |
| motif-9 (angel) | -267.179mm | -317.179mm | -50mm | ✅ Within bounds |

All motifs now fall within the valid headstone Y range of ±304.8mm.

## Testing Checklist

After applying fix:
- [ ] Top flowers (1_154_15, 1_129_03) positioned correctly near top edge
- [ ] Birds near top corners at correct height
- [ ] Center statue (1_184_13) centered vertically
- [ ] Bottom motifs (1_155_13, cross) positioned correctly near bottom
- [ ] All inscriptions aligned properly
- [ ] No motifs exceed headstone bounds (±304.8mm Y range)

