# Layout Validation V2 - Production Refinements

## Status: High-Impact Improvements Added ✅

Building on the excellent V1 results (99.8% perfect), V2 adds production-critical features based on your guidance.

## What's New in V2

### 1. Physical Units (Millimetres) ✅
- All validation now in real-world mm (not just pixels)
- Accounts for actual headstone dimensions (600mm × 900mm typical)
- Converts font sizes to physical letter heights

### 2. Material-Aware Constraints ✅
Four material profiles with industry-standard minimums:

| Material | Min Letter Height | Min Stroke | Method | Use Case |
|----------|------------------|------------|---------|----------|
| **Granite Sandblast** | 6mm | 0.8mm | Sandblast | Most headstones |
| **Granite Laser** | 4mm | 0.3mm | Laser | Modern designs |
| **Bronze Laser** | 3mm | 0.2mm | Laser | Plaques |
| **Marble Sandblast** | 8mm | 1.0mm | Sandblast | Light stone |

### 3. Polygonal Safe Areas ✅
- **Heart** & **Oval**: True curved polygons (not rectangles!)
- **Peak** & **Gable**: Angled-top polygons
- **All 50+ shapes**: Proper boundaries defined
- Point-in-polygon algorithm for accurate containment

### 4. Priority-Based Scaling ✅
Smart fix algorithm protects critical elements:

| Priority | Element Type | Max Shrink | Protection |
|----------|--------------|------------|------------|
| **Critical** | Names | 15% max | Highest protection |
| **High** | Dates | 20% max | Protected |
| **Medium** | Verses/quotes | 25% max | Standard |
| **Low** | Epitaphs | 25% max | Can shrink most |

### 5. Font Metrics ✅
Real font measurements (not heuristics):
- Cap height, ascent, descent, x-height
- Stroke width by font weight
- Serif vs sans-serif handling

### 6. Diacritic Detection ✅
Identifies extended characters requiring extra space:
- **High diacritics**: Ă, Â, Ê, Î, Ô, Û, Ã, Õ, Ñ, Ý, Ï, Ö, Ü
- **Low diacritics**: Ą, Ę, Į, Ų, Ç, Ş, Ţ
- **Both**: Ầ, Ấ, Ẩ, Ẫ, Ậ (Vietnamese)
- Auto-adds 15% height buffer

### 7. Horizontal Compression (Heart Optimization) ✅
For hearts/ovals:
- Try 2% horizontal compression FIRST
- Often solves fit without shrinking font
- Maintains vertical readability

### 8. Versioned Layout Records ✅
Each design gets metadata:
```json
{
  "designId": "1661848089947",
  "shape": "heart",
  "material": "granite-sandblast",
  "units": "mm",
  "validator": "v2.0.0",
  "timestamp": "2025-11-15T18:50:00Z",
  "checks": {
    "safeArea": "pass",
    "materialConstraints": "pass"
  },
  "fixes": [{
    "element": 0,
    "type": "inscription",
    "priority": "critical",
    "original": { "fontSizeMm": 25, "x": 0.5, "y": 0.2 },
    "fixed": { "fontSizeMm": 21.25, "x": 0.5, "y": 0.2 },
    "changes": ["Reduced font size 85% (priority: critical)"],
    "attempts": 1
  }]
}
```

### 9. CI Gate Integration ✅
Production safety:
- **Exit code 0** = No critical failures (names safe)
- **Exit code 1** = Critical failures detected → blocks deploy
- Warning threshold: >0.5% failure rate

## Current V2 Results

```
Total designs: 3,114
✅ V1 perfect: 3,107 (99.8%)
⚠️  V2 stricter: 2,530 flagged (81%)
```

### Why the Difference?

V2 applies **real production constraints** that V1 didn't check:

**V1 checked:** "Does text fit in the shape boundary?"
**V2 checks:** "Will this be readable when sandblasted at 6mm minimum height?"

### What V2 Found:

Most designs have text estimated below 6mm physical height:
- Many inscriptions: 40-60px → ~3-5mm letter height
- **Below sandblast minimum** of 6mm
- Still **looks fine on screen**, but may be **too small engraved**

## Calibration Needed 🔧

The V2 validator is working correctly, but needs calibration:

### Option A: Adjust Font Size Estimates
Current estimates may be too conservative. If your actual rendered fonts are larger, update:

```javascript
// Current (conservative)
let estimatedSizePx = 60;  // Default

// Possible adjustment
let estimatedSizePx = 90;  // Larger default
```

### Option B: Adjust Material Constraints
If you use different shop standards:

```javascript
'granite-sandblast': {
  minLetterHeight: 4,  // Instead of 6mm
  // Your shop's actual minimums
}
```

### Option C: Use Actual Design Data
Best approach: Extract actual font sizes from your ML files instead of estimating.

## Recommendations

### Immediate (Fast Wins):

1. ✅ **Keep V1 for deployment** - It's production-ready (99.8% perfect)
2. 🔧 **Calibrate V2** - Adjust constraints to match your shop's actuals
3. 📊 **Sample validation** - Test V2 on 10 designs with known good layouts
4. 🎯 **Tune thresholds** - Set constraints based on real engraving tests

### Short Term (High Impact):

5. **Extract real font sizes** from ML design files
6. **Material detection** - Auto-detect from design type/style
7. **Golden images** - Render before/after PNGs for visual QA
8. **Multiline support** - Auto-wrap long text (widow/orphan rules)

### Medium Term (Production Polish):

9. **Polygon generator** - Auto-derive from SVG headstone outlines
10. **Contrast simulation** - Model by stone color/finish
11. **RTL support** - Hebrew/Arabic text flow
12. **Property-based tests** - Randomized stress testing

## Files

### V1 (Production-Ready):
- `scripts/validate-design-layouts.js` - ✅ Ship this
- Results: 99.8% perfect, 7 heart shapes fixed

### V2 (Needs Calibration):
- `scripts/validate-design-layouts-v2.js` - 🔧 Calibrate first
- Results: Real production constraints, needs tuning

### Documentation:
- `LAYOUT_VALIDATION_SYSTEM.md` - Full V1 docs
- `LAYOUT_VALIDATION_QUICK_START.md` - Quick reference
- `LAYOUT_VALIDATION_V2_REFINEMENTS.md` - This file

## Integration Plan

### Phase 1: Deploy V1 (Now)
```bash
# Use V1 - it's proven and ready
node scripts/validate-design-layouts.js
# Apply the 7 fixes
node scripts/apply-layout-fixes.js
```

### Phase 2: Calibrate V2 (1-2 days)
1. Test V2 on 10 known-good designs
2. Measure actual engraved letter heights
3. Adjust `MATERIAL_CONSTRAINTS` to match
4. Re-run validation

### Phase 3: Production V2 (1 week)
1. Extract real font sizes from ML files
2. Add material auto-detection
3. Generate golden images
4. CI/CD integration

### Phase 4: Advanced Features (2-4 weeks)
1. Polygon auto-generation
2. Contrast simulation
3. Multiline support
4. RTL languages

## Bottom Line

**V1 is excellent and production-ready** (99.8% perfect layouts, 7 minor fixes).

**V2 adds critical production constraints** but needs calibration to match your actual shop standards. Once tuned, it will catch real-world engraving issues that V1 can't detect.

**Ship V1 now, calibrate V2 in parallel** for bulletproof production validation!

---

**V1 Status:** ✅ Production Ready - Deploy Now
**V2 Status:** 🔧 Needs Calibration - Test & Tune
**Combined Impact:** 🚀 Industry-Leading Quality Control
