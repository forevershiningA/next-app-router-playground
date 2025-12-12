# Slant Headstone Feature Implementation

## Summary
Added a new "Headstone Style" option in the Select Size panel, allowing users to choose between:
- **Upright**: Traditional vertical monument with polished finish (default)
- **Slant**: True trapezoidal prism geometry with 30-degree beveled top and rock pitch texture on all sides except the front face

This implementation follows the same pattern as the Base Finish selector (Polished vs Rock Pitch).

## Files Modified

### 1. lib/headstone-store.ts
- Added `headstoneStyle: 'upright' | 'slant'` state property
- Added `setHeadstoneStyle()` action
- Default value: 'upright'

### 2. components/DesignerNav.tsx
- Added store selectors: `headstoneStyle`, `setHeadstoneStyle`
- Added Headstone Style UI selector in Select Size panel
- Only visible when editing Headstone (not Base)
- Two-button toggle: "Upright" vs "Slant"
- Similar styling to Base Finish selector
- Descriptive text for each option

### 3. components/SvgHeadstone.tsx
- Added `headstoneStyle` prop to component
- **Trapezoidal Prism Geometry** (custom BufferGeometry):
  - Front face: Full height rectangle at z=0 (polished)
  - Back face: Slanted top (shorter by `depth * tan(30°)`) at z=-depth
  - Sides/Top/Bottom: Connect front to back faces
  - Material groups: Group 0 = front face, Group 1 = all other faces
  - Proper vertex normals and UV mapping
- **Rock Pitch Texture Generation** (same algorithm as HeadstoneBaseAuto):
  - Voronoi-based faceted normal map (512x512 canvas)
  - 12x12 chip grid baked into texture
  - Sobel filter for normal map generation
  - Density: 0.5 (6 chips per meter)
  - Anti-stretch correction with *4 multiplier
- **Material Configuration for Slant**:
  - Front face (Material 0): Polished finish
    - Color: 0x888888
    - Roughness: 0.15
    - Clearcoat: 1.0
  - All other faces (Material 1): Rock pitch with normal map
    - Color: 0x444444 (dark gray for contrast)
    - Roughness: 0.65 (granite sparkle)
    - Normal scale: (3.0, 3.0) for deep bumps
    - No clearcoat (matte finish)
    - EnvMapIntensity: 1.0

### 4. components/three/headstone/ShapeSwapper.tsx
- Read `headstoneStyle` from store
- Pass `headstoneStyle` prop to SvgHeadstone component

### 5. app/with-scene/select-size/size-selector.tsx
- Initial UI implementation (main UI moved to DesignerNav)

## Technical Details

### Trapezoidal Prism Geometry
Instead of rotating a flat headstone, the slant creates proper 3D geometry:

```typescript
// 8 vertices for trapezoidal prism
const slantAngle = 30 * Math.PI / 180;
const heightReduction = depth * Math.tan(slantAngle);

// Front face: Full height (minY to maxY)
// Back face: Reduced height (minY to maxY - heightReduction)
// Creates natural slant with proper UV mapping
```

**Faces:**
- Front: Full rectangle (polished)
- Back: Shorter rectangle (rock pitch)
- Top: Slanted trapezoid connecting top edges
- Bottom: Rectangle connecting bottom edges
- Left/Right: Trapezoids connecting side edges

**Material Groups:**
- Group 0 (indices 0-5): Front face → Material 0 (polished)
- Group 1 (indices 6+): All other faces → Material 1 (rock pitch)

### Rock Pitch Texture (All Sides Except Front)
The slant headstone uses the same faceted Voronoi algorithm as the rock pitch base:

```typescript
// Pseudo-random Voronoi cells create turtle shell pattern
const getHeight = (u: number, v: number) => {
  const scale = 12.0; // 12x12 grid baked in
  // ... Voronoi distance calculation
  return Math.pow(1.0 - minDist, 0.5); // Power curve for chunky chips
};

// Sobel filter converts height map to normal map
const strength = 20.0; // Deep chisel cuts
const dX = (h0 - hRight) * strength;
const dY = (h0 - hDown) * strength;
```

### Material Comparison

**Upright (Polished All Sides):**
- Color: 0x888888 (light gray)
- Roughness: 0.15 (high gloss)
- Clearcoat: 1.0 (wet look)
- EnvMapIntensity: 1.5 (strong reflections)
- No normal map
- Uses SVG extrusion geometry

**Slant (Polished Front, Rock Pitch Sides):**
- **Front Face:**
  - Color: 0x888888
  - Roughness: 0.15 (polished)
  - Clearcoat: 1.0
- **All Other Faces:**
  - Color: 0x444444 (dark gray for contrast)
  - Roughness: 0.65 (granite sparkle)
  - Normal map: Faceted Voronoi texture
  - Normal scale: (3.0, 3.0) for deep bumps
  - Clearcoat: 0 (matte finish)
  - EnvMapIntensity: 1.0
- Uses custom trapezoidal BufferGeometry

### Texture Repeat (Anti-Stretch)
```typescript
const density = 0.5; // 6 chips per meter (same as base)
rockNormalTexture.repeat.set(
  Math.max(1, dims.worldPerim * density * 4),  // *4 correction factor
  Math.max(1, dims.worldDepth * 2)
);
```

### Geometry Calculation
- **Height Reduction**: `depth * tan(30°)` ≈ `depth * 0.577`
- **Front Z**: 0 (full height)
- **Back Z**: -depth (reduced height at top)
- **Top Face**: Slopes from front to back
- **No rotation transform needed** - geometry is naturally slanted

### UI/UX Location
The Headstone Style selector appears in the **DesignerNav sidebar** (not in the overlay):
- Navigate to `/select-size` page
- Ensure "Headstone" tab is selected (not "Base")
- Selector appears below Height slider, above Base Finish selector
- Toggle button design matches Base Finish selector
- Gold highlight (#D7B356) for active selection
- Hover states on inactive buttons
- Descriptive text: "Traditional vertical monument" vs "Beveled marker at an angle"

## Testing
✅ TypeScript compilation successful
✅ Production build successful
✅ Dev server running on http://localhost:3001

## How to Test
1. Navigate to http://localhost:3001/select-size
2. In left sidebar, ensure **"Headstone"** tab is selected (not "Base")
3. Find **"Headstone Style"** selector below Height slider
4. Click "Slant" to see trapezoidal geometry
5. Verify:
   - Front face is polished (smooth)
   - Back/sides/top have rock pitch texture (chunky faceted pattern)
   - Natural 30-degree slant (not rotation, true geometry)
   - Headstone sits on base properly
6. Toggle back to "Upright" to see standard extrusion
7. Test with different shapes and sizes
8. Verify inscriptions and motifs align correctly on front face
9. Switch to "Base" tab - Headstone Style disappears, Base Finish appears

## Performance Notes
- Normal map canvas generated once per style change (memoized)
- Trapezoidal geometry created once per dimension/style change
- Texture properly disposed on cleanup (memory safe)
- Same optimization pattern as HeadstoneBaseAuto rock pitch feature
- No performance impact when Upright style is selected

## Key Features
✅ **True trapezoidal prism geometry** (not just rotation)
✅ Perfectly square chips (no stretching)
✅ Baked 12x12 grid in source texture
✅ Aspect ratio correction for any headstone size
✅ 30-degree slant angle (calculated via tan formula)
✅ Polished front face + rock pitch on all other faces
✅ Proper material groups for multi-material support
✅ Custom BufferGeometry with normals and UVs
✅ Memory optimized (proper disposal)
✅ Consistent UI/UX with Base Finish selector

## Advantages Over Rotation Approach
1. **More realistic**: Actual slant headstone geometry, not tilted upright
2. **Better UV mapping**: Each face has proper texture coordinates
3. **Multi-material support**: Different materials for front vs. sides
4. **No positioning issues**: Natural geometry placement on base
5. **Follows industry standard**: Matches advice13.txt recommendations

## Files Modified

### 1. lib/headstone-store.ts
- Added `headstoneStyle: 'upright' | 'slant'` state property
- Added `setHeadstoneStyle()` action
- Default value: 'upright'

### 2. components/DesignerNav.tsx
- Added store selectors: `headstoneStyle`, `setHeadstoneStyle`
- Added Headstone Style UI selector in Select Size panel
- Only visible when editing Headstone (not Base)
- Two-button toggle: "Upright" vs "Slant"
- Similar styling to Base Finish selector
- Descriptive text for each option

### 3. components/SvgHeadstone.tsx
- Added `headstoneStyle` prop to component
- **Rock Pitch Texture Generation** (same algorithm as HeadstoneBaseAuto):
  - Voronoi-based faceted normal map (512x512 canvas)
  - 12x12 chip grid baked into texture
  - Sobel filter for normal map generation
  - Density: 0.5 (6 chips per meter)
  - Anti-stretch correction with *4 multiplier
- **Material Configuration for Slant**:
  - Face: Polished finish (unchanged)
  - Sides: Rock pitch with normal map
    - Color: 0x444444 (dark gray for contrast)
    - Roughness: 0.65 (granite sparkle)
    - Normal scale: (3.0, 3.0) for deep bumps
    - No clearcoat (matte finish)
    - EnvMapIntensity: 1.0
- **Transformation**:
  - Rotation: -30 degrees on X-axis (Math.PI * 30 / 180)
  - Position adjustment: [0, worldH * 0.3, worldH * 0.3]
  - Applied to root group

### 4. components/three/headstone/ShapeSwapper.tsx
- Read `headstoneStyle` from store
- Pass `headstoneStyle` prop to SvgHeadstone component

### 5. app/with-scene/select-size/size-selector.tsx
- Initial UI implementation (main UI moved to DesignerNav)

## Technical Details

### Rock Pitch Texture (Slant Only)
The slant headstone uses the same faceted Voronoi algorithm as the rock pitch base:

```typescript
// Pseudo-random Voronoi cells create turtle shell pattern
const getHeight = (u: number, v: number) => {
  const scale = 12.0; // 12x12 grid baked in
  // ... Voronoi distance calculation
  return Math.pow(1.0 - minDist, 0.5); // Power curve for chunky chips
};

// Sobel filter converts height map to normal map
const strength = 20.0; // Deep chisel cuts
const dX = (h0 - hRight) * strength;
const dY = (h0 - hDown) * strength;
```

### Material Comparison

**Upright (Polished):**
- Color: 0x888888 (light gray)
- Roughness: 0.15 (high gloss)
- Clearcoat: 1.0 (wet look)
- EnvMapIntensity: 1.5 (strong reflections)
- No normal map

**Slant (Rock Pitch Sides):**
- Color: 0x444444 (dark gray for contrast)
- Roughness: 0.65 (granite sparkle)
- Normal map: Faceted Voronoi texture
- Normal scale: (3.0, 3.0) for deep bumps
- Clearcoat: 0 (matte finish)
- EnvMapIntensity: 1.0

### Texture Repeat (Anti-Stretch)
```typescript
const density = 0.5; // 6 chips per meter (same as base)
rockNormalTexture.repeat.set(
  Math.max(1, dims.worldPerim * density * 4),  // *4 correction factor
  Math.max(1, dims.worldDepth * 2)
);
```

### Transformation Applied (Slant Mode)
- **Rotation**: -30 degrees on X-axis (Math.PI * 30 / 180)
- **Position Adjustment**: [0, worldH * meshScale[1] * 0.3, worldH * meshScale[1] * 0.3]
- Transformations applied to root group, affecting entire headstone and children

### UI/UX Location
The Headstone Style selector appears in the **DesignerNav sidebar** (not in the overlay):
- Navigate to `/select-size` page
- Ensure "Headstone" tab is selected (not "Base")
- Selector appears below Height slider, above Base Finish selector
- Toggle button design matches Base Finish selector
- Gold highlight (#D7B356) for active selection
- Hover states on inactive buttons
- Descriptive text: "Traditional vertical monument" vs "Beveled marker at an angle"

## Testing
✅ TypeScript compilation successful
✅ Dev server running on http://localhost:3001
⚠️ Production build has unrelated error with /api/cache-svg (pre-existing)

## How to Test
1. Navigate to http://localhost:3001/select-size
2. In left sidebar, ensure **"Headstone"** tab is selected (not "Base")
3. Find **"Headstone Style"** selector below Height slider
4. Click "Slant" to rotate headstone to 30 degrees
5. Verify rock pitch texture appears on slant headstone sides
6. Toggle back to "Upright" to see polished finish
7. Test with different shapes and sizes
8. Verify inscriptions and motifs follow the rotation
9. Switch to "Base" tab - Headstone Style disappears, Base Finish appears

## Performance Notes
- Normal map canvas generated once per style change (memoized)
- Texture properly disposed on cleanup (memory safe)
- Same optimization pattern as HeadstoneBaseAuto rock pitch feature
- No performance impact when Upright style is selected

## Key Features
✅ Perfectly square chips (no stretching)
✅ Baked 12x12 grid in source texture
✅ Aspect ratio correction for any headstone size
✅ 30-degree tilt (adjustable angle)
✅ Rock pitch sides with polished face
✅ Memory optimized (proper disposal)
✅ Consistent UI/UX with Base Finish selector
