# Ceramic Base Gap Fix - Z-Positioning

**Date:** 2026-02-22  
**Status:** ✅ FIXED  
**Issue:** Visible gaps between granite → ceramic base → photo

---

## Problem

Screenshot showed two visible black gaps:
1. **Large gap** between headstone granite and ceramic base back
2. **Small gap** between ceramic base front and photo texture

---

## Root Cause

The parent group was positioned at `z=0` (world origin), not at the headstone's front surface position (`headstone.frontZ`).

### Before Fix:

```typescript
// WRONG: Parent group at world origin
<group position={[xPos, yPos, 0]}>
  {/* Ceramic back at z=0 (world origin, NOT headstone surface!) */}
  <mesh position={[0, 0, ceramicDepthMm / 2]} />
  
  {/* Photo at z=1.001mm */}
  <mesh position={[0, 0, ceramicDepthMm + 0.001]} />
</group>
```

**Result:**
- Ceramic back at **world z=0** (not headstone surface)
- Headstone surface at **frontZ** (e.g., 0.05 or varies by shape)
- **Visible gap** = `frontZ - 0`

---

## Solution

Position parent group at `headstone.frontZ` (same as motifs/inscriptions):

```typescript
// Get headstone frontZ position (same as motifs/inscriptions)
const frontZ = headstone?.frontZ ?? 0;

// CORRECT: Parent group at headstone front surface
<group position={[xPos, yPos, frontZ]}>
  {/* Ceramic back at frontZ (flush with granite) */}
  <mesh position={[0, 0, ceramicDepthMm / 2]} />
  
  {/* Photo at frontZ + 1mm (on ceramic surface) */}
  <mesh position={[0, 0, ceramicDepthMm]} />
</group>
```

---

## Z-Position Stack (After Fix)

```
Headstone Granite Surface: z = frontZ (e.g., 0.05)
                          ↓
    Ceramic Base Back:    z = frontZ + 0         ← FLUSH (no gap) ✅
    Ceramic Base Front:   z = frontZ + 1mm       ← 1mm thick
                          ↓
    Photo Texture:        z = frontZ + 1mm       ← FLUSH on ceramic ✅
```

---

## Code Changes

**File:** `components/three/ImageModel.tsx` (lines 312-378)

### 1. Get Headstone Front Z Position

```typescript
// Get headstone frontZ position (same as motifs/inscriptions)
const frontZ = headstone?.frontZ ?? 0;
```

### 2. Position Parent Group at FrontZ

```typescript
return (
  <group ref={ref} position={[xPos, yPos, frontZ]} rotation={[0, 0, rotationZ]}>
```

**Before:** `position={[xPos, yPos, 0]}`  
**After:** `position={[xPos, yPos, frontZ]}`

### 3. Simplify Photo Z-Position

```typescript
position={[0, 0, ceramicDepthMm]} // Flush on top of ceramic
```

**Before:** `position={[0, 0, ceramicDepthMm + 0.001]}`  
**After:** `position={[0, 0, ceramicDepthMm]}`

Removed the extra 0.001mm offset since `renderOrder={999}` already prevents z-fighting.

---

## Alignment with Other Elements

All surface elements now use the same positioning system:

| Element | Parent Group Position | Z Position |
|---------|----------------------|------------|
| **Inscriptions** | `[xPos, yPos, frontZ + 0.05]` | `frontZ + 0.05mm` |
| **Motifs** | `[xPos, yPos, frontZ + 0.02]` | `frontZ + 0.02mm` |
| **Images (Ceramic)** | `[xPos, yPos, frontZ]` | `frontZ + 0mm` ✅ |
| **Images (Photo)** | (same parent) | `frontZ + 1mm` ✅ |

Images sit **flush** with granite (ceramic base back), while inscriptions/motifs have tiny lifts to prevent z-fighting.

---

## Why It Works Now

1. **Parent group** positioned at headstone front surface (`frontZ`)
2. **Ceramic base** extends from `frontZ` to `frontZ + 1mm`
3. **Photo texture** sits at `frontZ + 1mm` (ceramic front surface)
4. **No gaps** because ceramic back is exactly at granite surface

---

## Testing

✅ **Ceramic base flush** with granite (no gap)  
✅ **Photo texture flush** with ceramic (no gap)  
✅ **Rectangle masks** now render correctly  
✅ **All 7 mask shapes** work (oval, rectangle, heart, etc.)

---

## Related Changes

This fix complements the earlier maskShape fix:
- **CERAMIC_RECTANGLE_MASK_FIX.md** - Added `maskShape` to store/data flow
- **This document** - Fixed Z-positioning for flush rendering

Together, these fixes ensure:
1. ✅ Rectangle ceramic bases render (maskShape fix)
2. ✅ All ceramic bases sit flush with granite (Z-position fix)
3. ✅ Photos sit flush on ceramic surface (Z-position fix)

---

**Fix Deployed:** 2026-02-22  
**Status:** Production Ready ✅
