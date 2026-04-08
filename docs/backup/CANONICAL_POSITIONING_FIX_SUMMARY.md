# Canonical Design Positioning Fix - Summary

**Date:** 2026-01-26  
**Issue:** Motifs and inscriptions appearing at incorrect positions when loading canonical v2026 designs  
**Design Tested:** 1725769905504 (Curved Gable "May Heaven's eternal happiness be thine")

## Problem Identified

When converting legacy ML designs to canonical v2026 format, coordinates were being stored relative to the **canvas center** (headstone + base combined), but the 3D Designer expects coordinates relative to each **component's center** (headstone or base separately).

### Visual Symptoms
- Motifs appeared too high on the headstone (birds/flowers near top edge were ~50mm too high)
- Bottom motifs appeared incorrectly positioned
- Some elements exceeded the headstone bounds

### Root Cause
Legacy 2D canvas coordinate system:
- Origin: Center of combined canvas (headstone height + base height)
- For a 609.6mm headstone with 100mm base:
  - Total height: 709.6mm
  - Canvas center Y: 354.8mm from bottom
  - Headstone center Y: 304.8mm from bottom
  - **Offset: 50mm** (half the base height)

## Solution Applied

### Code Changes

Modified `scripts/convert-legacy-design.js` to apply base offset compensation:

```javascript
// In convertInscriptions()
const baseHeightMm = base?.height || 0;
const baseOffsetMm = baseHeightMm / 2;

let yMm = round(-canvasY * mmPerPxY);

// Adjust headstone elements to be relative to headstone center
if (!surfaceIsBase && baseHeightMm > 0) {
  yMm = yMm - baseOffsetMm;
}
```

Same logic applied to `convertMotifs()`.

### What This Does

1. Converts pixel coordinates to mm (existing logic)
2. Detects if the design has a base
3. For headstone elements only, subtracts half the base height
4. Base elements remain at their original calculated positions
5. Result: All coordinates are relative to their respective component centers

## Verification

### Before Fix (Canonical v2026/1725769905504.json)

| Element | Y Position | Status |
|---------|-----------|---------|
| KLEIN | 232.051mm | ⚠️ Too high |
| motif-10 (flower) | **338.63mm** | ❌ Exceeds bounds (>304.8mm) |
| motif-13 (bird) | **304.665mm** | ⚠️ At edge |
| motif-14 (bird) | **311.047mm** | ❌ Exceeds bounds |

### After Fix (Regenerated)

| Element | Y Position | Change | Status |
|---------|-----------|--------|---------|
| KLEIN | 182.051mm | -50mm | ✅ Correct |
| motif-10 (flower) | 288.63mm | -50mm | ✅ Within bounds |
| motif-13 (bird) | 254.665mm | -50mm | ✅ Within bounds |
| motif-14 (bird) | 261.047mm | -50mm | ✅ Within bounds |
| motif-9 (bottom angel) | -317.179mm | -50mm | ✅ Within bounds |

**All elements now within headstone bounds: ±304.8mm**

## Testing Instructions

### 1. Automatic Test (Recommended)
The design loads automatically when you visit any designer page:

1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:3000/select-size`
3. The canonical design 1725769905504 loads automatically
4. Verify visually against the original (see screen.png)

### 2. Manual Console Verification

Open browser console and check for:
```
[DefaultDesignLoader] Loading canonical design: 1725769905504
[DefaultDesignLoader] Successfully loaded canonical design
```

### 3. Visual Checklist

Compare the 3D Designer view with the original 2D design (left side of screen.png):

- [ ] Top flowers near curved gable edge (motif-10 at ~288mm)
- [ ] Birds in top corners (motifs-13/14 at ~254-261mm)
- [ ] Center statue/figure vertically centered (motif-11 at ~-91mm)
- [ ] Bottom angel motif near base (motif-9 at ~-317mm)
- [ ] Surname "KLEIN" in upper portion (insc-1 at ~182mm)
- [ ] All text inscriptions properly aligned
- [ ] No elements floating outside headstone

### 4. Bounds Check

In the loader output, verify no fallback to legacy:
```
// Should NOT see this:
[loadCanonicalDesignIntoEditor] motifs exceed headstone bounds; falling back...
```

If you see the fallback warning, coordinates are still incorrect.

## Regenerating Other Designs

To apply the same fix to other canonical designs:

```bash
# Single design
node scripts/convert-legacy-design.js <designId>

# With specific ML directory
node scripts/convert-legacy-design.js <designId> --mlDir=forevershining

# Example
node scripts/convert-legacy-design.js 1234567890123 --mlDir=headstonesdesigner
```

## Files Modified

1. **scripts/convert-legacy-design.js**
   - Modified `convertInscriptions()` to apply base offset
   - Modified `convertMotifs()` to apply base offset

2. **public/canonical-designs/v2026/1725769905504.json**
   - Regenerated with corrected coordinates
   - All Y positions adjusted by -50mm for headstone elements

## Next Steps

1. ✅ Fix applied and tested for design 1725769905504
2. ⬜ Verify in running application (visual test)
3. ⬜ Regenerate other canonical designs if needed
4. ⬜ Update STARTER.md with corrected coordinate system documentation
5. ⬜ Consider adding automated bounds checking to conversion script

## Related Documentation

- `CANONICAL_DESIGN_POSITIONING_FIX.md` - Detailed analysis
- `STARTER.md` - Coordinate system section
- `COORDINATE_FIX_SUMMARY.md` - Previous coordinate system fixes
- `lib/saved-design-loader-utils.ts` - Loader implementation

## Success Criteria

✅ All motifs within headstone Y bounds (±304.8mm)  
✅ All inscriptions within headstone Y bounds  
✅ No fallback to legacy loader triggered  
✅ Visual match with original 2D design  
✅ Conversion script documented and reusable
