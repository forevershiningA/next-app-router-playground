# Texture and Material Improvements Summary

## Completed Improvements ✅

### 1. Texture Repetition (Fixed Stretching)
- **Base**: Changed from stretched single texture to 2-3x seamless repeat
  - `textureScale = 0.15` meters per tile
  - Applied `THREE.RepeatWrapping` 
  - Added anisotropic filtering (16x) for sharpness at angles

- **Headstone**: Optimized tile sizes
  - `tileSize = 0.35` meters per tile
  - `sideTileSize = 0.35`
  - `topTileSize = 0.35`
  - Already had anisotropic filtering enabled

### 2. PBR Material Upgrade
Switched from `MeshStandardMaterial` to `MeshPhysicalMaterial` with clearcoat

**Current Settings (Both Headstone & Base):**
```javascript
{
  color: 0x888888,           // Darker base for better reflections
  roughness: 0.15,           // Low = High gloss (polished granite)
  metalness: 0.0,            // Stone is dielectric (non-metal)
  envMapIntensity: 1.5,      // Strong environment reflections
  clearcoat: 1.0,            // Maximum polish layer
  clearcoatRoughness: 0.1    // Very smooth coating (wet look)
}
```

### 3. Environment Lighting
- Enhanced `Environment` component with `environmentIntensity: 1.5`
- Provides realistic reflections on polished surfaces

### 4. Anisotropic Filtering
- Enabled 16x anisotropic filtering on all textures
- Eliminates blurriness at oblique viewing angles

## Known Limitations (Require Model/UV Fixes) ⚠️

These issues **cannot** be fixed in Three.js code alone and require 3D modeling software:

### 1. Zebra Stripes on Curved Top Edge
- **Cause**: Extreme UV stretching on curved geometry
- **Fix Required**: Re-unwrap UVs in Blender for curved top faces
- **Alternative**: Implement Triplanar Mapping shader (complex)

### 2. White/Washed Out Base Top Surface
- **Cause**: Texture is magnified 10x on top face due to UV scale
- **Fix Required**: Scale up UV islands for top/bottom faces in Blender
- **Result**: Top face shows tiny patch of light grain instead of full pattern

### 3. Streaked Side Textures
- **Cause**: UV projection from front causes horizontal stretching on sides
- **Fix Required**: Separate UV unwrapping for side faces in Blender
- **Current Workaround**: Texture repeat helps but doesn't fully solve

### 4. Material Inconsistency on Sides
- **Cause**: Possible roughness variation or lighting angle
- **Fix Required**: Verify material applies uniformly to all faces

## Recommendations for Full Photorealism

### Option A: Fix in Blender (Recommended)
1. Import model into Blender
2. Apply "Checker texture" to visualize UV distortion
3. Select problematic faces (curved top, base top, sides)
4. Use "Smart UV Project" to re-unwrap
5. Scale UV islands until checker pattern is uniform across all faces
6. Export and reload in Three.js

### Option B: Implement Triplanar Mapping Shader
- Ignores UVs and projects textures based on world position
- More complex implementation
- Better performance than fixing UVs for procedural geometry
- Search: "Three.js Triplanar Shader" or "NodeMaterial Triplanar"

## Files Modified

1. `components/three/headstone/HeadstoneBaseAuto.tsx`
   - Added texture repeat logic
   - Upgraded to MeshPhysicalMaterial with clearcoat
   - Added anisotropic filtering

2. `components/SvgHeadstone.tsx`
   - Upgraded to MeshPhysicalMaterial with clearcoat
   - Adjusted material properties for polished granite

3. `components/three/headstone/ShapeSwapper.tsx`
   - Adjusted tileSize from 10 to 0.35

4. `components/three/Scene.tsx`
   - Enhanced Environment component intensity

## Result

The materials now have professional-grade PBR properties that make the granite look polished and realistic (like "wet" sealed stone), with proper texture repetition preventing obvious stretching on front/back faces. However, UV mapping issues on curved surfaces and the base top remain architectural limitations of the 3D model that require fixing in modeling software.
