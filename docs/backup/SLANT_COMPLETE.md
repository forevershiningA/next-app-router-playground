# Slant Headstone & Base Rock Pitch - COMPLETE IMPLEMENTATION

## ✅ ALL FEATURES IMPLEMENTED (advice13-23.txt)

All advice files successfully implemented including **critical architectural change from advice23.txt**!

### Complete Implementation Timeline
- ✅ advice13.txt: Basic slant geometry  
- ✅ advice14.txt: Front face slant orientation  
- ✅ advice15.txt: Vertex ordering fixes  
- ✅ advice16.txt: Material group calculations  
- ✅ advice17.txt: UV mapping and normalization  
- ✅ advice18.txt: Initial positioning & texture
- ✅ advice19.txt: Rock texture quality (1024px, 16×16)
- ✅ advice20.txt: Confirmed same as advice19
- ✅ advice21.txt: Final refinement (24×24, density 20)
- ✅ advice22.txt: Critical inversion & UV swap fixes
- ✅ **advice23.txt**: Baked UV scaling - **ARCHITECTURAL CHANGE**

---

## 🎯 Critical Architectural Change from advice23.txt

### Problem Identified
**Horizontal streaking/distortion** on slant headstone because:
- Single texture repeat value applied to all faces
- Faces have different dimensions (sides: depth×height, top: width×depth)
- Material's texture repeat can't handle this properly

### Solution: Bake UV Scaling into Geometry

Instead of using dynamic `texture.repeat.set()`, **multiply UVs by world dimensions * density directly in the geometry loop**.

#### Before (advice22):
```typescript
// UV coordinates in 0-1 range
uvAttr.setXY(i + j,
  (z - localBackZ) / (localFrontZ - localBackZ),  // 0-1
  (y - bb.min.y) / bb_dy                           // 0-1
);

// Then in useLayoutEffect:
rockNormalTexture.repeat.set(
  dims.worldDepth * density,  // 20× scaling
  dims.worldW * density
);
```

**Problem**: Single repeat value doesn't work when sides have different dimensions than top/bottom.

#### After (advice23):
```typescript
// Bake scaling directly into UVs during geometry creation
const textureDensity = 20.0;

uvAttr.setXY(i + j,
  ((z - localBackZ) / (localFrontZ - localBackZ)) * worldDepth * textureDensity,
  ((y - bb.min.y) / bb_dy) * worldH * textureDensity
);

// Then in useLayoutEffect:
rockNormalTexture.repeat.set(1, 1);  // No extra scaling!
```

**Benefit**: Each face gets proper UV scaling based on its actual dimensions, preventing distortion.

---

## 🔧 Technical Changes from advice23.txt

### 1. Voronoi Scale Adjustment
```typescript
// BEFORE (advice21-22):
const scale = 24.0;

// AFTER (advice23):
const scale = 20.0;  // Slightly reduced for balance
```

### 2. Normal Strength Adjustment
```typescript
// BEFORE (advice22):
const strength = -25.0;

// AFTER (advice23):
const strength = -15.0;  // Reduced to prevent lighting artifacts
```

### 3. UV Calculation Order
```typescript
// Calculate world dimensions BEFORE UV mapping (so they're available)
