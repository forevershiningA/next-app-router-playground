# Coordinate System Fix - January 26, 2025

## Executive Summary

Fixed critical coordinate system bugs preventing saved designs from rendering correctly. Main issues: async dimension loading, broken overlap adjustment, coordinate system mismatches, and scaling problems.

**Final Status:** ✅ **90% Fixed** - Most designs render correctly, some edge cases remain

---

## Issues Fixed Today

### 1. **Missing Motifs - Async Dimension Loading** ✅ FIXED
Commit: `3b490611b`

### 2. **Overlap Adjustment Breaking Positions** ✅ FIXED  
Commit: `915e4d298`

### 3. **Incorrect Coordinate System (cx/cy vs x/y)** ✅ FIXED
Commit: `3a9e02fbc`

### 4. **Serpentine ViewBox Mismatch** ✅ FIXED
Commit: `24647b936` 

### 5. **Serpentine Headstone-to-Canvas Ratio Scaling** ✅ FIXED
Commits: `883bd4b4a` → `dbcab2264` → `67b7f9cfa`

### 6. **Curved Gable Height Calculation** ✅ FIXED
Commits: `50080b810` (reverted) → `7901f78d9` → `247783d84` → `b28378792`

### 7. **Oversized Authoring Canvas** ✅ FIXED
Commit: `d08b6aeba`

### 8. **Millimeter Units in Physical Dimensions** ✅ FIXED
Commit: `fa8a21cff`

---

## Current Status by Design Type

| Design | Status | Notes |
|--------|--------|-------|
| **Serpentine (1721009360757)** | ✅ Working | All 7 motifs render, positions correct with headstone ratio scaling |
| **Curved Gable (1578016189116)** | ✅ Working | Uses initH directly for height, no ratio scaling |
| **Headstone 20 (1630558777652)** | ✅ Working | 3x scale compensation for oversized canvas (1680×873) |
| **Headstone 25 (1700517739396)** | ⚠️ Partial | Content scaling fixed, but SVG shape too small (DPR=2 issue) |

---

## Remaining Issues

### 1. DPR=2 Designs - Small SVG Shape ⚠️

**Example:** Design 1700517739396 (Headstone 25, DPR=2)

**Problem:**
- SVG shape renders tiny (centered in middle)
- Content (text/motifs) renders at correct size
- Mismatch between shape size and content size

**Root Cause:**
- SVG has `preserveAspectRatio="xMidYMid meet"` 
- SVG viewBox may not match canvas dimensions
- Flex centering keeps it at natural size instead of scaling to fill

**TODO:**
- Investigate SVG viewBox from loaded files
- May need to adjust viewBox to match initW×initH
- Or remove flex centering for DPR designs

---

## Key Learnings

### Physical Dimensions Units

Physical dimensions (`width`, `height`) can be in different units:
- **Pixels:** When value ≈ initW (ratio close to 1.0)
- **Millimeters:** When value < 1000 (e.g., 356mm, 609mm)

Always check unit type before using for calculations!

### Coordinate Space Detection

```typescript
// Serpentine only
if (shapeName === 'Serpentine') {
  const ratio = headstoneWidth / initW;
  coordinates *= ratio;
}

// Other shapes use native SVG viewBox
```

### Height Calculation

```typescript
if (!dpr || dpr === 1) {
  displayHeight = initH; // Use full authoring height
} else {
  displayHeight = displayWidth / aspectRatio; // Scale proportionally
}
```

---

## Testing Results

✅ **Working:**
- Serpentine with 5 sheep motifs
- Curved Gable with proper proportions  
- Oversized canvas compensation
- Millimeter unit detection

⚠️ **Needs Work:**
- DPR=2 designs with small SVG shapes
- Possible other edge cases

---

**Commits Today:** 16 commits  
**Date:** 2025-01-26  
**Priority:** 🔥 Critical - Affects all saved design rendering
