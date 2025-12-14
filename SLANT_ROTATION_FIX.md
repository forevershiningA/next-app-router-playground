# Slant Headstone Rotation Fix

**Date:** 2025-12-13  
**Issue:** Inscriptions/motifs/additions not rotating with slant headstone  
**Based on:** advice34.txt, advice35.txt, advice36.txt, advice37.txt

---

## Problem

When selecting "Slant" style, the headstone geometry is correctly trapezoidal and slanted, but inscriptions, motifs, and additions remain upright (vertical) instead of following the slant angle.

---

## Root Cause

1. **Quaternion not being applied** - Was passing array instead of `THREE.Quaternion` object
2. **Wrong normal sign** - Used negative angle instead of positive
3. **Potential child component issues** - Children might be billboarding or using lookAt

---

## Solution Implemented

### 1. Use Actual THREE.Quaternion Object

**Before:**
```typescript
childWrapperRotation: wrapperQuaternion.toArray() as [number, number, number, number]
```

**After:**
```typescript
childWrapperRotation: wrapperQuaternion // Return THREE.Quaternion object directly
```

**Why:** React Three Fiber's `quaternion` prop expects a `THREE.Quaternion` object, not an array.

### 2. Fix Normal Sign

**Before:**
```typescript
const frontNormal = new THREE.Vector3(0, Math.sin(-slantAngleRad), Math.cos(-slantAngleRad));
```

**After:**
```typescript
const frontNormal = new THREE.Vector3(0, Math.sin(slantAngleRad), Math.cos(slantAngleRad));
```

**Why:** Positive angle correctly calculates the outward-facing normal of the slanted front face.

### 3. Force-Apply Quaternion

**Added:**
```typescript
useLayoutEffect(() => {
  if (scaledWrapperRef.current && childWrapperRotation) {
    scaledWrapperRef.current.quaternion.copy(childWrapperRotation);
  }
}, [childWrapperRotation]);
```

**Why:** R3F prop diffing sometimes doesn't detect stable Quaternion object changes.

### 4. Debug Helpers

**Added:**
```tsx
{/* DEBUG: Tilted plane to verify wrapper rotation */}
{headstoneStyle === 'slant' && apiData && (
  <>
    <mesh position={[0, (apiData.worldHeight || 1) * 0.5, apiData.frontZ]}>
      <planeGeometry args={[(apiData.worldWidth || 1) * 0.8, (apiData.worldHeight || 1) * 0.2]} />
      <meshBasicMaterial color="hotpink" transparent opacity={0.15} depthTest />
    </mesh>
    <axesHelper args={[0.2]} />
  </>
)}
```

**Purpose:**
- **Pink plane** - Visually confirms wrapper is rotating
- **Axes helper** - Shows local coordinate system orientation

---

## Testing Instructions

### 1. Verify Wrapper Rotation

1. Navigate to http://localhost:3001
2. Select a headstone design
3. **Select "Slant" from the style selector**
4. Look for:
   - **Hot pink semi-transparent plane** should be tilted matching the slant
   - **RGB axes** (Red=X, Green=Y, Blue=Z) should be tilted

### 2. Diagnose Results

**If pink plane is TILTED:**
- ✅ Wrapper rotation is working
- ❌ Child components are cancelling rotation
- **Fix:** Check for billboard, lookAt, or Html without transform in child components

**If pink plane is FLAT:**
- ❌ Quaternion not being applied
- **Fix:** Debug useLayoutEffect or quaternion calculation

---

## Potential Child Component Issues

### Components to Check:
1. `HeadstoneInscription.tsx` - Text inscriptions
2. `MotifModel.tsx` - SVG motifs
3. `AdditionModel.tsx` - 3D model additions

### Common Problems:
- `<Billboard>` component usage
- `<Text billboard={true}>` prop
- `<Html>` without `transform` prop
- `mesh.lookAt(camera.position)` in useFrame
- Manual rotation/quaternion assignment each frame
- `matrixAutoUpdate = false`

### Fixes:
```typescript
// ✅ Good - respects parent rotation
<Text billboard={false} /> // or just <Text /> (false is default)
<Html transform /> // transform must be true

// ❌ Bad - cancels parent rotation
<Billboard>...</Billboard>
<Text billboard={true} />
<Html> // without transform prop
mesh.lookAt(camera.position)
```

---

## Implementation Details

### Quaternion Calculation

```typescript
// Calculate slant angle from thickness ratio
const slantAngleRad = Math.atan2(frontTopZOffset, height_svg_units);

// Front face normal (outward)
const frontNormal = new THREE.Vector3(
  0, 
  Math.sin(slantAngleRad), 
  Math.cos(slantAngleRad)
).normalize();

// Quaternion that rotates local +Z to face normal
const wrapperQuaternion = new THREE.Quaternion()
  .setFromUnitVectors(new THREE.Vector3(0, 0, 1), frontNormal);
```

### Wrapper Structure

```tsx
<group 
  ref={scaledWrapperRef}
  position={[0, 0, (depth / 2) * scale * sCore]} // Bottom-front center
  quaternion={childWrapperRotation} // THREE.Quaternion object
>
  {/* Debug visuals */}
  
  <group scale={meshScale}>
    {/* Inscriptions/motifs/additions */}
  </group>
</group>
```

### Coordinate System

- **Local +Z axis** of wrapper points along face normal (perpendicular to slanted surface)
- Children at `z = api.frontZ` sit flush on the slanted face
- `api.frontZ = 0.001` (tiny offset for z-fighting prevention)

---

## Files Modified

- `components/SvgHeadstone.tsx`
  - Changed `childWrapperRotation` from array to `THREE.Quaternion` object
  - Fixed normal sign (positive slantAngleRad)
  - Added useLayoutEffect to force-copy quaternion
  - Added debug plane and axes helper
  - Updated all return paths to use `new THREE.Quaternion()`

---

## Next Steps

### After Testing

1. **If wrapper rotation works (pink plane tilted):**
   - Remove debug visuals (pink plane + axes helper)
   - Check child components for billboard/lookAt issues
   - Ensure all children use `api.frontZ` for Z positioning

2. **If wrapper rotation fails (pink plane flat):**
   - Add console.log to verify quaternion values
   - Check if slantAngleRad is calculated correctly
   - Verify useLayoutEffect is running

### Debug Console Commands

```javascript
// In browser console, check wrapper rotation
const wrapper = document.querySelector('canvas').__r3f.store.getState().scene.getObjectByName('headstone')?.parent;
console.log('Wrapper quaternion:', wrapper?.quaternion);
console.log('Wrapper euler:', wrapper?.rotation);
```

---

## Known Limitations

1. **Debug visuals must be removed** - Pink plane and axes are temporary
2. **Requires "Slant" selection** - Won't work if style is still "Upright"
3. **Child components not yet verified** - May still have billboard issues

---

## References

- **advice34.txt** - Quaternion alignment to face normal
- **advice35.txt** - THREE.Quaternion object vs array
- **advice36.txt** - Debug techniques and force-apply
- **advice37.txt** - Child component inheritance issues

---

**Status:** Implementation complete, awaiting visual testing with debug helpers ✅🔍
