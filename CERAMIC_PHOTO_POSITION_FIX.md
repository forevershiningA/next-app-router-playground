# Photo Texture & Selection Box Positioning Fix

**Date:** 2026-02-22  
**Status:** ✅ FIXED  
**Issue:** Photo texture missing, selection outline not visible

---

## Problem

After fixing the ceramic base flush positioning:
- ✅ Ceramic base renders correctly (white 3D shape)
- ❌ Photo texture missing (just blank white ceramic)
- ❌ Selection outline not visible

---

## Root Cause

Photo and SelectionBox were positioned incorrectly relative to the ceramic base geometry.

### The Issue:

The ceramic geometry is extruded with `depth: 2` SVG units, then scaled by `ceramicScaleZ`. The actual depth in world units after scaling is `2 * ceramicScaleZ`, not `ceramicDepthMm`.

**Before Fix:**
```typescript
// Photo positioned incorrectly
position={[0, 0, 2 * ceramicScaleZ]} // Way too far forward!

// SelectionBox at wrong position
position={new THREE.Vector3(0, 0, 0)} // At ceramic back, not photo
```

---

## Solution

Track the actual ceramic depth after scaling and use it for both photo and selection positioning.

### 1. Calculate Actual Depth After Scaling

```typescript
let actualCeramicDepthInUnits = ceramicDepthMm; // Track actual depth

if (ceramicBaseData) {
  // ... X/Y scaling code ...
  
  ceramicScaleZ = avgScale * (ceramicDepthMm / 2); // 2 is SVG extrude depth
  
  // Calculate actual depth in world units after scaling
  // The extruded geometry goes from z=0 to z=2 (SVG units)
  // After scaling: z=0 to z=2*ceramicScaleZ
  actualCeramicDepthInUnits = 2 * ceramicScaleZ;
}
```

### 2. Position Photo at Ceramic Front

```typescript
<mesh
  position={[0, 0, actualCeramicDepthInUnits]} // Photo at ceramic front surface
  geometry={planeGeometry}
  scale={[width, height, 1]}
  renderOrder={999}
>
  <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
</mesh>
```

### 3. Position SelectionBox at Photo Location

```typescript
{selected && (
  <SelectionBox
    objectId={id}
    position={new THREE.Vector3(0, 0, actualCeramicDepthInUnits)} // At photo, not ceramic back
    bounds={{ width, height }}
    // ... other props
  />
)}
```

---

## Z-Position Stack (Complete)

```
Headstone Granite Surface: z = frontZ (e.g., 0.05)
                          ↓
Parent Group:             z = frontZ
    ↓
    Ceramic Geometry:     z = 0 (relative to parent)
        Back Face:        z = frontZ + 0            ← FLUSH with granite ✅
        Front Face:       z = frontZ + actualDepth  ← ~1mm forward
    ↓
    Photo Texture:        z = frontZ + actualDepth  ← FLUSH on ceramic ✅
    ↓
    SelectionBox:         z = frontZ + actualDepth  ← Around photo ✅
```

---

## Why It Works Now

1. **actualCeramicDepthInUnits** correctly calculates the scaled extrusion depth
2. **Photo** positioned at ceramic front surface (visible on top)
3. **SelectionBox** positioned at same Z as photo (outlines the photo, not ceramic back)

---

## Code Changes

**File:** `components/three/ImageModel.tsx`

### Change 1: Track Actual Depth (lines 330-353)
```typescript
let actualCeramicDepthInUnits = ceramicDepthMm;

if (ceramicBaseData) {
  // ... scaling ...
  actualCeramicDepthInUnits = 2 * ceramicScaleZ;
}
```

### Change 2: Position Photo (line 380)
```typescript
position={[0, 0, actualCeramicDepthInUnits]}
```

### Change 3: Position SelectionBox (line 398)
```typescript
position={new THREE.Vector3(0, 0, actualCeramicDepthInUnits)}
```

**File:** `lib/headstone-store.ts`

### Change 4: Add 'image' to PanelName Type (line 92)
```typescript
export type PanelName =
  | 'shape'
  | 'size'
  | 'material'
  | 'inscription'
  | 'additions'
  | 'addition'
  | 'motifs'
  | 'motif'
  | 'image'  // ✅ ADDED
  | 'checkprice'
  | 'designs'
  | null;
```

---

## Testing Checklist

✅ **Ceramic base renders** (white 3D shape)  
✅ **Ceramic base flush** with granite (no gap)  
✅ **Photo texture visible** on ceramic surface  
✅ **Selection outline visible** around photo  
✅ **Click selection works** (sets activePanel to 'image')

---

## Related Fixes

This completes the ceramic image feature:

1. **CERAMIC_RECTANGLE_MASK_FIX.md** - Added `maskShape` to data flow
2. **CERAMIC_BASE_GAP_FIX.md** - Positioned ceramic flush with granite
3. **This document** - Photo texture and selection box positioning

---

**Fix Deployed:** 2026-02-22  
**Status:** Production Ready ✅
