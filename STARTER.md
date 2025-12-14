# Next-DYO (Design Your Own) Headstone Application

**Last Updated:** 2025-12-14  
**Tech Stack:** Next.js 15.5.7, React 19, Three.js, R3F (React Three Fiber), Zustand, TypeScript, Tailwind CSS

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Key Directories](#key-directories)
4. [Core Components](#core-components)
5. [State Management](#state-management)
6. [3D Rendering Pipeline](#3d-rendering-pipeline)
7. [Coordinate System](#coordinate-system)
8. [Product Types & Rendering](#product-types--rendering)
9. [Rock Pitch Base Feature](#rock-pitch-base-feature)
10. [Slant Headstone Feature](#slant-headstone-feature)
11. [Performance Considerations](#performance-considerations)
12. [Memory Management](#memory-management)
13. [Common Issues & Solutions](#common-issues--solutions)
14. [Development Workflow](#development-workflow)

---

## Project Overview

A Next.js-based 3D headstone designer allowing users to:
- Select headstone shapes, materials, and sizes
- **Select headstone style** (Upright or Slant)
- **Select base finish** (Polished or Rock Pitch)
- Add inscriptions with custom fonts and positioning (simple click-and-drag)
- Place decorative motifs (SVG-based)
- Add 3D models (statues, vases, applications)
- View real-time 3D preview with texture mapping
- Calculate pricing based on configuration
- Save and load designs

### Product Types
- **Traditional Engraved Headstones**: Granite/marble with sandblasted and painted text (shadow effect)
- **Laser Etched Black Granite**: High-detail laser etching (outlined text)
- **Bronze Plaques**: Metal plaques with decorative borders

### Headstone Style Options
- **Upright**: Traditional vertical headstone (default)
- **Slant**: Beveled headstone tilted at 30° angle with trapezoidal profile

### Base Finish Options
- **Polished**: High-gloss polished granite with clearcoat (default)
- **Rock Pitch**: Hand-chiseled turtle shell pattern with polished flat top (PFT)

---

## Architecture

```
next-dyo/
├── app/                    # Next.js 15 App Router
│   ├── _internal/          # Internal data (fonts, products, inscriptions)
│   ├── designs/            # Design gallery pages
│   ├── inscriptions/       # Inscription selection
│   ├── products/           # Product landing pages
│   ├── select-*/           # Step-by-step designer pages
│   └── with-scene/         # Pages with 3D canvas
├── components/             # React components
│   ├── three/              # Three.js/R3F components
│   │   ├── headstone/      # Headstone assembly
│   │   ├── AdditionModel   # 3D model additions (GLB loader)
│   │   ├── MotifModel      # SVG motif overlay
│   │   ├── BoxOutline      # Selection outline
│   │   └── SelectionBox    # Simple drag handles (elderly-friendly)
│   ├── SvgHeadstone.tsx    # Main headstone geometry
│   ├── HeadstoneInscription.tsx # 3D text inscriptions
│   └── ThreeScene.tsx      # Canvas wrapper
├── lib/                    # Utilities & state
│   ├── headstone-store.ts  # Zustand global state
│   ├── xml-parser.ts       # Catalog/pricing parser
│   ├── motif-pricing.ts    # Motif pricing
│   └── headstone-constants.ts
├── public/
│   ├── shapes/             # SVG headstone outlines
│   ├── textures/           # Material textures (granite, etc.)
│   ├── motifs/             # SVG decorative motifs
│   ├── additions/          # GLB 3D models
│   └── fonts/              # Custom font files
└── styles/                 # Global CSS + Tailwind
```

---

## Coordinate System

### Units: **1 unit = 1mm**
All positioning uses millimeters as the base unit in the bounding box coordinate system.

### Headstone Geometry
- **SVG scale**: 0.01 (scaled down in world space)
- **BBox units**: Direct mm values (e.g., 600mm width)
- **unitsPerMeter**: ~667 (conversion factor from SVG to world space)

### Z-Positioning (Depth)
- **Headstone surface**: `headstone.frontZ` (front face of stone)
- **Inscriptions**: `frontZ + 0.5mm` (prevents z-fighting)
- **Motifs**: `frontZ + 0.5mm`
- **Additions (applications)**: `frontZ + 0.5mm`
- **Additions (statues/vases)**: `frontZ` (on base)

### Scaling
- **Inscriptions**: `sizeMm` is directly in mm (e.g., 50mm height)
- **Motifs**: `heightMm` target size in mm (e.g., 100mm)
- **Additions**: Target heights in mm (statue: 150mm, vase: 120mm, application: 100mm)
  - **Z-scale factor**: 0.1 (flattened to 10% depth for applications)

---

## Product Types & Rendering

### Traditional Engraved (Sandblasted & Painted)
**Visual Effect:** Carved letters with painted fill and shadow depth

**Implementation:**
- **No outline** on text/motifs
- **Multi-layer shadow** behind text (3 layers for blur simulation):
  - Outer: Size 1.08x, Opacity 0.2, Z -0.55mm
  - Middle: Size 1.05x, Opacity 0.3, Z -0.52mm
  - Core: Size 1.0x, Opacity 0.8, Z -0.5mm
- Shadow positioned at `[0, 0, -Z]` (no X/Y offset)
- Creates carved/recessed appearance

**Detection:**
```typescript
const isTraditionalEngraved = product?.name.includes('Traditional Engraved') ?? false;
```

### Laser Etched
**Visual Effect:** Surface etching with black outline

**Implementation:**
- **Black outline** (`outlineWidth: 0.002 * units`)
- **Colored fill**
- No shadow layers
- Flat appearance

---

## Core Components

### 1. **SvgHeadstone.tsx**
**Purpose:** Main 3D headstone geometry generator  
**Key Features:**
- Loads SVG outline, extrudes to 3D
- Applies texture mapping (face/side/top)
- Auto-scales to target dimensions
- Provides API for child positioning

**API Exposed:**
```typescript
type HeadstoneAPI = {
  group: RefObject<Group>;
  mesh: RefObject<Mesh>;
  frontZ: number;          // Front face Z position (in mm coordinate system)
  unitsPerMeter: number;   // Conversion factor (~667)
  worldWidth: number;      // World space width
  worldHeight: number;     // World space height
}
```

### 2. **HeadstoneInscription.tsx**
**Purpose:** 3D text overlay on headstone  
**Key Features:**
- Uses `@react-three/drei` `<Text>` component
- **Simple click-and-drag** positioning (elderly-friendly)
- Bounds checking against headstone geometry
- **Sandblasted shadow effect** for Traditional Engraved products
- Selection box with resize handles (Z-position: 0.01mm offset)

**Drag System:**
```typescript
onPointerDown → capture pointer → drag with raycasting → update position
```

### 3. **MotifModel.tsx**
**Purpose:** SVG-based decorative overlays  
**Key Features:**
- Converts SVG paths to 3D shapes using SVGLoader
- Supports color customization
- Y-flipped scale for correct orientation
- Positioned relative to headstone center
- Product-aware rendering (Traditional vs Laser)

### 4. **AdditionModel.tsx**
**Purpose:** GLB 3D model loader (statues, vases, applications)  
**Key Features:**
- GLTF loader with texture support
- Auto-scaling to target heights (in mm)
- **Flattened Z-scale** for applications (0.1x depth)
- Click to select (no navigation, keeps canvas visible)
- Positioned in mm coordinate system

**Target Heights:**
```typescript
const TARGET_HEIGHTS = {
  statue: 150,      // 150mm
  vase: 120,        // 120mm  
  application: 100, // 100mm
};
```

### 5. **SelectionBox.tsx**
**Purpose:** Simple drag/resize handles for selected elements  
**Key Features:**
- **depthTest: true** (doesn't show through headstone)
- Corner handles for resizing
- Rotation handle (top center)
- Minimal Z-offset (0.01mm) to stay flush with surface
- Elderly-friendly (simple, visible)

---

## State Management

### Zustand Store (`lib/headstone-store.ts`)

**Global State:**
```typescript
{
  // Product Configuration
  productId: string | null;
  shapeUrl: string | null;
  materialUrl: string | null;
  headstoneMaterialUrl: string | null;
  baseMaterialUrl: string | null;
  headstoneStyle: 'upright' | 'slant';   // Headstone style selector
  slantThickness: number;                // Slant depth in mm (100-300mm)
  baseFinish: 'default' | 'rock-pitch';  // Base finish selector
  borderName: string | null;      // Bronze plaque borders
  
  // Dimensions
  widthMm: number;
  heightMm: number;
  baseWidthMm: number;           // Independent base width
  baseHeightMm: number;          // Independent base height
  
  // Selections
  selected: 'headstone' | 'base' | null;
  editingObject: 'headstone' | 'base';
  selectedInscriptionId: string | null;
  selectedAdditionId: string | null;
  selectedMotifId: string | null;
  
  // Content
  inscriptions: Line[];            // Text overlays
  selectedAdditions: string[];     // 3D models
  selectedMotifs: Motif[];         // SVG motifs
  
  // UI
  activePanel: PanelName | null;
  is2DMode: boolean;
  loading: boolean;
  
  // Catalog
  catalog: CatalogData | null;     // Parsed XML
  inscriptionPriceModel: PriceModel | null;
  motifPriceModel: MotifProductData | null;
}
```

**Key Actions:**
- `setShapeUrl()` - Change headstone shape
- `setMaterialUrl()` - Change texture
- `setHeadstoneStyle()` - Toggle between upright/slant
- `setSlantThickness()` - Adjust slant depth (100-300mm)
- `setBaseFinish()` - Toggle between polished/rock-pitch
- `addInscription()` - Add new text
- `updateInscription()` - Modify existing text
- `addMotif()` - Add SVG motif
- `addAddition()` - Add 3D model
- `calculateInscriptionCost()` - Pricing
- `loadDesignFromXML()` - Import saved design

---

## 3D Rendering Pipeline

### Scene Setup (ThreeScene.tsx)
```typescript
<Canvas
  shadows="soft"
  dpr={[1, 2]}
  gl={{
    antialias: true,
    toneMapping: THREE.ACESFilmicToneMapping,
    toneMappingExposure: 1.0
  }}
>
  <Scene />
</Canvas>
```

### Lighting (Scene.tsx)
- **Ambient Light**: Base illumination (0.3)
- **Directional Light**: Main light with shadows (intensity 0.8, position [5, 8, 5])
  - **Critical for rock pitch visibility** - Side lighting reveals normal map depth
- **Point Light**: Blue-tinted accent light (0.5 intensity, color #badbff)
- **Environment**: HDRI "city" preset with intensity 1.5
  - Provides realistic reflections for polished granite surfaces

---

## Rock Pitch Base Feature

### Overview
**Rock Pitch** is a hand-chiseled finish applied to the sides of the base, creating a turtle shell pattern with distinct faceted chips. The top surface remains **polished flat** (PFT - Polished Flat Top).

### Implementation (`HeadstoneBaseAuto.tsx`)

#### Visual Characteristics
- **Sides**: Chiseled turtle shell pattern with deep cracks
- **Top/Bottom**: Polished high-gloss finish with clearcoat
- **Chips**: Fist-sized (2-3 inches) faceted geometric shapes
- **Appearance**: Heavy hammer strikes on granite

#### Technical Implementation

**1. Voronoi Normal Map Generation:**
```typescript
// Faceted Voronoi algorithm creates cellular pattern
const getHeight = (u: number, v: number) => {
  const scale = 12.0; // Bake 12x12 chips into 512x512 texture
  // ... Voronoi distance calculation
  return Math.pow(1.0 - minDist, 0.5); // Power curve for chunky appearance
};

// Sobel filter for normal map
const strength = 20.0; // Deep chisel cuts
const dX = (h0 - hRight) * strength;
const dY = (h0 - hDown) * strength;
```

**2. Multi-Material Setup:**
```typescript
// RoundedBoxGeometry with 6 materials (one per face)
const materials = [
  matShort,         // Right (rock pitch)
  matShort,         // Left (rock pitch)  
  polishedMaterial, // Top (polished)
  polishedMaterial, // Bottom (polished)
  matLong,          // Front (rock pitch)
  matLong,          // Back (rock pitch)
];

// fixRoundedBoxUVs() assigns materials based on face normals
```

**3. Material Settings:**
```typescript
// Rock Pitch (Sides)
MeshStandardMaterial({
  map: baseTexture,
  normalMap: rockNormalTexture,
  normalScale: (3.0, 3.0),      // Deep bumps
  color: 0x444444,               // Dark for contrast
  roughness: 0.65,               // Granite sparkle
  metalness: 0.0,
  envMapIntensity: 1.0,
  colorSpace: NoColorSpace,      // Linear (critical!)
});

// Polished (Top/Bottom)
MeshPhysicalMaterial({
  map: baseTexture,
  color: 0x888888,
  roughness: 0.15,               // High gloss
  metalness: 0.0,
  clearcoat: 1.0,                // Wet look
  clearcoatRoughness: 0.1,
  envMapIntensity: 1.5,
});
```

**4. Anti-Stretch Correction:**
```typescript
// Baked density prevents stretched chips
const density = 0.5; // 6 chips per meter (adjustable)
normalMap.repeat.set(
  dimensions.width * density * 4,  // *4 correction factor
  dimensions.height * 2
);
```

#### Key Features
✅ **Perfectly square chips** (no stretching)  
✅ **Baked 12x12 grid** in source texture  
✅ **Aspect ratio correction** for any base size  
✅ **Polished flat top** (PFT) with clearcoat  
✅ **Memory optimized** (no leaks)  
✅ **60 FPS performance** (memoized)  

#### Critical Requirements
1. **Directional lighting** - Must have side light for normal map visibility
2. **NoColorSpace** - Normal maps must be Linear (not sRGB)
3. **fixRoundedBoxUVs()** - Required for multi-material support
4. **Texture disposal** - Cleanup on unmount/finish change
5. **Memoization** - Materials created once, repeats updated imperatively

---

### Material Configuration (PBR)
**Updated to MeshPhysicalMaterial for polished granite effect:**
```typescript
MeshPhysicalMaterial({
  map: texture,
  color: 0x888888,           // Darker tint for better reflections
  roughness: 0.15,           // Low = high gloss (polished stone)
  metalness: 0.0,            // Stone is dielectric (non-metal)
  envMapIntensity: 1.5,      // Strong environment reflections
  clearcoat: 1.0,            // Maximum polish layer
  clearcoatRoughness: 0.1    // Very smooth coating ("wet" look)
})
```

**Key Improvements:**
- Switched from `MeshStandardMaterial` to `MeshPhysicalMaterial`
- Added clearcoat for polished granite "wet" appearance
- Optimized roughness/metalness for realistic stone
- Enhanced environment reflections

### Camera Setup
- **Type**: PerspectiveCamera
- **FOV**: 30 degrees
- **Position**: `[0, 4.8, 10]`
- **Controls**: OrbitControls (disabled in 2D mode)

---

## Slant Headstone Feature

### Overview
**Slant Headstones** are beveled markers that sit at an angle, commonly used in cemeteries. Unlike upright headstones that stand vertically, slant headstones have a **trapezoidal profile** with a slanted front face for inscriptions.

### User Controls
- **Headstone Style Selector**: Toggle between "Upright" and "Slant" styles
- **Thickness Slider**: Adjustable depth control (100-300mm) for slant headstones
  - **100mm**: Steep angle (~45°)
  - **150mm**: Standard cemetery angle (~30°) - Default
  - **300mm**: Shallow/gradual slant
- **Location**: DesignerNav → Select Size → Appears after Height slider when Slant is selected

### Implementation (`SvgHeadstone.tsx`)

#### Visual Characteristics
- **Front Face**: Slanted backward (angle varies with thickness slider)
- **Profile**: Trapezoidal shape (wider at bottom, narrower at top)
- **Texture**: Rock pitch texture on left/right sides with pop-out bumps
- **Inscriptions**: Rotated to follow the slanted surface
- **Back Alignment**: Back edge aligns with base at `-depth/2` position regardless of thickness

#### Technical Implementation

**1. Thickness Control (100-300mm):**
```typescript
// User-controlled thickness in millimeters (via slider in DesignerNav)
const baseThickness = slantThickness / 10; // Convert mm to cm for Three.js
const topThickness = baseThickness * 0.2; // 20% ratio for top (standard trapezoid)

// Calculate how far back the top-front edge is pushed
const frontTopZOffset = baseThickness - topThickness;
```

**2. Trapezoidal Geometry:**
```typescript
// Use thickness ratios instead of fixed angle for proper trapezoid
const baseThickness = depth;
const topThickness = baseThickness * 0.2; // 20% ratio (2"/10" cemetery standard)
const frontTopZOffset = baseThickness - topThickness;

// CRITICAL: Calculate slant angle in WORLD SPACE to account for non-uniform scaling
// sCore affects height(Y) but NOT depth(Z), so we must scale before atan2
const worldScaleY = Math.abs(scale) * sCore;
const worldScaleZ = Math.abs(scale);
const svgHeight = maxY - minY;
const worldHeight = svgHeight * worldScaleY;
const worldRun = frontTopZOffset * worldScaleZ;
const slantAngleRad = Math.atan2(worldRun, worldHeight); // Angle from vertical

// Calculate diagonal slant height for inscription scaling
const worldSlantH = Math.sqrt(worldHeight ** 2 + worldRun ** 2);
```

**2. Vertex Positioning:**
```typescript
// 8 vertices for trapezoidal box
// Front Face: Bottom at Z=0, Top pushed back to Z=-frontTopZOffset
const P_FBL = new THREE.Vector3(minX, minY, 0);                 // Front Bottom Left
const P_FBR = new THREE.Vector3(maxX, minY, 0);                 // Front Bottom Right
const P_FTL = new THREE.Vector3(minX, maxY, -frontTopZOffset);  // Front Top Left (pushed back)
const P_FTR = new THREE.Vector3(maxX, maxY, -frontTopZOffset);  // Front Top Right (pushed back)

// Back Face: Vertical back at Z=-baseThickness
const P_BBL = new THREE.Vector3(minX, minY, -baseThickness);    // Back Bottom Left
const P_BBR = new THREE.Vector3(maxX, minY, -baseThickness);    // Back Bottom Right
const P_BTL = new THREE.Vector3(minX, maxY, -baseThickness);    // Back Top Left
const P_BTR = new THREE.Vector3(maxX, maxY, -baseThickness);    // Back Top Right
```

**3. Back Alignment with Base:**
```typescript
// CRITICAL: Align back edge with upright headstone back at -depth/2
// Translate by (baseThickness - depth/2) so back moves from -baseThickness to -depth/2
slantGeometry.translate(
  -(minX + maxX) / 2,              // Center X
  -minY,                            // Bottom at Y=0
  baseThickness - depth / 2         // Align back edge
);

// Wrapper position matches translation
childWrapperPos: [0, 0, (baseThickness - depth / 2) * scale]
```

**4. Rock Pitch Texture on Sides:**
```typescript
// Left/Right faces get rock pitch normal map
const sideUVScale = 20.0; // Baked into geometry UVs
normalMap.repeat.set(1, 1); // No additional repeat (already in UVs)

MeshPhysicalMaterial({
  normalMap: rockNormalTexture,
  normalScale: (2.0, 2.0),
  color: 0x444444,
  roughness: 0.65,
  metalness: 0.0,
});
```

**4. Rock Pitch Texture on Sides:**
```typescript
// Left/Right faces get rock pitch normal map
const sideUVScale = 20.0; // Baked into geometry UVs
normalMap.repeat.set(1, 1); // No additional repeat (already in UVs)

MeshPhysicalMaterial({
  normalMap: rockNormalTexture,
  normalScale: (2.0, 2.0),
  color: 0x444444,
  roughness: 0.65,
  metalness: 0.0,
});
```

**5. UV Mapping:**
```typescript
// Coordinate-driven approach for left/right sides
for (let i = 0; i < posCount; i++) {
  const x = pos.getX(i);
  const y = pos.getY(i);
  const z = pos.getZ(i);
  
  if (Math.abs(x - localLeft) < EPS) {
    // Left face: map (z, y) to (u, v)
    uv.setXY(i, (z - localBackZ) * uvScale, y * uvScale);
  } else if (Math.abs(x - localRight) < EPS) {
    // Right face: map (z, y) to (u, v)
    uv.setXY(i, (localFrontZ - z) * uvScale, y * uvScale);
  }
}
```

**6. Child Wrapper Rotation:**
```typescript
// Build quaternion that aligns wrapper's local +Z to the front face normal
// CRITICAL: Y component must be POSITIVE for backward-leaning slant
const frontNormal = new THREE.Vector3(0, Math.sin(slantAngleRad), Math.cos(slantAngleRad)).normalize();
const wrapperQuaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), frontNormal);

// Position wrapper to match geometry translation
childWrapperPos: [0, 0, (baseThickness - depth / 2) * scale]
childWrapperRotation: wrapperQuaternion  // THREE.Quaternion object (not array!)

// apiData.frontZ is epsilon only (wrapper already at face)
apiData: {
  frontZ: 0.0005,  // Scale-aware epsilon (~0.5mm)
  worldHeight: worldSlantH  // Diagonal slant height for proper text scaling
}
```

**7. Real-Time Updates:**
```typescript
// CRITICAL: Add slantThickness to useMemo dependencies
}, [shapeParams, outline, depth, bevel, scale, headstoneStyle, slantThickness]);

// Geometry re-creates when thickness slider changes
```

#### Key Features
✅ **Adjustable thickness** (100-300mm via slider in DesignerNav)  
✅ **Back edge alignment** with base at `-depth/2` regardless of thickness  
✅ **Real-time geometry updates** when slider changes  
✅ **World-space angle calculation** (accounts for non-uniform scaling)  
✅ **Trapezoidal profile** (20% thickness ratio)  
✅ **Rock pitch sides** with pop-out bumps  
✅ **Quaternion-based rotation** (positive Y normal)  
✅ **Simplified hierarchy** (no FaceSpace complexity)  
✅ **Z-centered geometry** for proper base alignment  
✅ **Proper UV mapping** (no stretching)  
✅ **MeshPhysicalMaterial** (no clearcoat errors)  
✅ **No z-fighting** (polygonOffset on materials)  
✅ **Production-ready** (TypeScript build passes)  

#### Critical Requirements
1. **World-space angle calculation** - Use `worldScaleY * svgHeight` and `worldScaleZ * frontTopZOffset` in atan2
2. **Positive Y normal** - `frontNormal = (0, Math.sin(slantAngleRad), Math.cos(slantAngleRad))`
3. **THREE.Quaternion object** - Not array! R3F `quaternion` prop requires object
4. **Back alignment translation** - `baseThickness - depth/2` ensures back at `-depth/2`
5. **slantThickness dependency** - Must be in useMemo array for real-time updates
6. **Wrapper position** - `[0, 0, (baseThickness - depth/2) * scale]` matches geometry translation
7. **frontZ epsilon only** - `0.0005` (wrapper already at face, no full depth offset)
8. **No FaceSpace** - Removed for simplicity; children inherit rotation naturally
9. **renderOrder=10** - Children draw after granite (prevents z-fighting)
10. **polygonOffset** - On granite materials (factor: 1, units: 1)
11. **Force-apply quaternion** - useLayoutEffect to copy quaternion (R3F prop diffing workaround)
12. **worldSlantH** - Report diagonal height (not vertical) for proper inscription scaling
  -(minX + maxX) / 2,  // Center X
  -minY,                // Bottom at Y=0
  depth / 2             // Center Z at origin (CRITICAL for alignment)
);
```

**7. Simplified Hierarchy (No FaceSpace):**
```typescript
// FaceSpace component removed for simplicity and natural rotation inheritance
// Children now inherit rotation directly from scaledWrapperRef
<group 
  ref={scaledWrapperRef}
  position={childWrapperPos}
  quaternion={childWrapperRotation}
>
  {headstoneStyle === 'slant' ? (
    <group position-z={apiData?.frontZ || 0.001}>
      <group renderOrder={10} scale={meshScale}>
         {typeof children === 'function' && children(childApi, selectedAdditions)}
      </group>
    </group>
  ) : (
    <group position-z={apiData?.frontZ || 0}>
      <group renderOrder={10} scale={meshScale}>
         {typeof children === 'function' && children(childApi, selectedAdditions)}
      </group>
    </group>
  )}
</group>
```

#### Key Features
✅ **World-space angle calculation** (accounts for non-uniform scaling)  
✅ **Trapezoidal profile** (20% thickness ratio)  
✅ **Rock pitch sides** with pop-out bumps  
✅ **Quaternion-based rotation** (positive Y normal)  
✅ **Simplified hierarchy** (no FaceSpace complexity)  
✅ **Z-centered geometry** for proper base alignment  
✅ **Proper UV mapping** (no stretching)  
✅ **MeshPhysicalMaterial** (no clearcoat errors)  
✅ **No z-fighting** (polygonOffset on materials)  
✅ **Production-ready** (TypeScript build passes)  

#### Critical Requirements
1. **World-space angle calculation** - Use `worldScaleY * svgHeight` and `worldScaleZ * frontTopZOffset` in atan2
2. **Positive Y normal** - `frontNormal = (0, Math.sin(slantAngleRad), Math.cos(slantAngleRad))`
3. **THREE.Quaternion object** - Not array! R3F `quaternion` prop requires object
4. **Wrapper position** - `[0, 0, (depth/2) * scale]` matches mesh Z-scale (no sCore)
5. **frontZ epsilon only** - `0.0005` (wrapper already at face, no full depth offset)
6. **No FaceSpace** - Removed for simplicity; children inherit rotation naturally
7. **renderOrder=10** - Children draw after granite (prevents z-fighting)
8. **polygonOffset** - On granite materials (factor: 1, units: 1)
9. **Force-apply quaternion** - useLayoutEffect to copy quaternion (R3F prop diffing workaround)
10. **worldSlantH** - Report diagonal height (not vertical) for proper inscription scaling

#### FaceSpace Component (REMOVED)
**Note:** The FaceSpace component was removed in the December 2025 refactor for simplicity and to avoid `onBeforeRender` conflicts with React Three Fiber's natural rotation propagation. Children now inherit rotation directly from the parent `scaledWrapperRef` group, which is already positioned and rotated correctly for the slanted surface.

#### Differences from Upright Headstones

| Feature | Upright | Slant |
|---------|---------|-------|
| **Angle** | Vertical (90°) | Tilted (30°) |
| **Profile** | Rectangular | Trapezoidal |
| **Front Face** | Flat vertical | Slanted backward |
| **Wrapper Rotation** | None `[0,0,0]` | Tilted `[-30°,0,0]` |
| **Side Texture** | Polished | Rock pitch |
| **Geometry** | ExtrudeGeometry | Custom BufferGeometry |

#### Common Issues & Solutions

**Issue: Inscriptions not rotating with slant (appear upright)**
- **Cause**: Unit mismatch in angle calculation or wrong normal sign
- **Solution**: 
  ```typescript
  // CRITICAL: Calculate angle in world space
  const worldScaleY = Math.abs(scale) * sCore;
  const worldScaleZ = Math.abs(scale);
  const worldHeight = svgHeight * worldScaleY;
  const worldRun = frontTopZOffset * worldScaleZ;
  const slantAngleRad = Math.atan2(worldRun, worldHeight);
  
  // CRITICAL: Y component must be POSITIVE
  const frontNormal = new THREE.Vector3(0, Math.sin(slantAngleRad), Math.cos(slantAngleRad));
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1), frontNormal);
  ```

**Issue: Inscriptions at wrong angle or scale**
- **Cause**: Using SVG dimensions instead of world-space dimensions
- **Solution**: Always use `worldHeight` and `worldRun` (scaled by `sCore` and `scale`) before atan2

**Issue: Double rotation**
- **Cause**: Passing parent rotation to child wrapper again
- **Solution**: Remove FaceSpace or pass identity quaternion; let children inherit from parent naturally

**Issue: Inscriptions floating in front of headstone (both upright and slant)**
- **Cause**: Double Z-offset - wrapper at origin, frontZ includes full depth
- **Solution**:
  ```typescript
  // Position wrapper AT the face
  childWrapperPos: [0, 0, (depth / 2) * scale]
  // frontZ is epsilon only
  apiData: { frontZ: 0.0005 }
  ```

**Issue: Z-fighting shimmer between stacked text lines**
- **Cause**: Multiple texts writing to depth buffer (Note: `depthWrite` is not a valid Text prop)
- **Solution**: Use `renderOrder={10}` on parent group and `polygonOffset` on materials

**Issue: TypeScript build errors on Text components**
- **Cause**: `depthWrite` is not a valid prop on `@react-three/drei` Text component
- **Solution**: Remove `depthWrite` props; drei Text handles materials internally

**Issue: Rotation not applying (R3F prop diffing)**
- **Cause**: R3F doesn't detect quaternion object changes
- **Solution**:
  ```typescript
  useLayoutEffect(() => {
    if (ref.current && quaternion) {
      ref.current.quaternion.copy(quaternion);
    }
  }, [quaternion]);
  ```

**Issue: Child components "standing up" (ignoring parent rotation)**
- **Cause**: Complex FaceSpace logic interfering with React Three Fiber updates
- **Solution**: Remove FaceSpace; use simple group hierarchy for natural rotation inheritance

**Issue: Wrapper too far forward (z-position incorrect)**
- **Cause**: Using `(depth/2) * scale * sCore` but mesh Z-scale is only `scale`
- **Solution**: Match meshScale[2]: `(depth / 2) * scale` (no sCore on Z axis)

**Issue: Inscriptions floating far away (z=-1000)**
- **Cause**: `childWrapperPos` incorrectly set to `[0, 0, depth/2]` (double offset)
- **Solution**: Keep wrapper at origin `[0, 0, 0]` since geometry is already Z-centered

**Issue: Texture stretching on sides**
- **Cause**: UV mapping using normals instead of coordinates
- **Solution**: Map UVs based on vertex (x,y,z) positions directly

**Issue: Material clearcoat errors**
- **Cause**: Using MeshStandardMaterial with clearcoat properties
- **Solution**: Use MeshPhysicalMaterial for all materials

**Issue: Inscriptions at wrong angle**
- **Cause**: Positive rotation instead of negative
- **Solution**: Use `-slantAngleRad` (tilt backward, not forward)

**Issue: Wedge shape instead of trapezoid**
- **Cause**: Fixed 15° angle causes top to meet at sharp point
- **Solution**: Use thickness ratio approach: `topThickness = baseThickness * 0.2`

---

## Performance Considerations

### Texture Optimization
✅ **Good:**
- WebP format (smaller file size)
- Mipmap generation enabled
- **Anisotropic filtering (16x)** - Prevents blurriness at angles
- **Texture repeat (2-3x seamless tiling)** - Prevents stretched appearance
- **RepeatWrapping** mode for seamless edges
- Proper texture scale based on physical dimensions

**Texture Tiling Settings:**
- **Base**: `textureScale = 0.15` meters per tile
- **Headstone**: `tileSize = 0.35` meters per tile
- **Side/Top**: Same scale for consistency

❌ **Avoid:**
- Loading unnecessary texture variants
- Not disposing old textures
- Excessive texture resolution (> 4K)
- Single stretched texture (causes distortion)

### Geometry Management
✅ **Good:**
- `useMemo` for expensive calculations
- Geometry disposal on unmount
- Indexed geometries when possible

❌ **Avoid:**
- Recreating geometry on every render
- Not calling `dispose()` on old geometries

### Re-render Prevention
```typescript
// Good - memoized
const materials = useMemo(() => [
  new MeshStandardMaterial({ map: tex })
], [tex]);

// Bad - recreated every render
const materials = [new MeshStandardMaterial({ map: tex })];
```

### Animation Frame Management
✅ **Proper Cleanup:**
```typescript
useEffect(() => {
  const id = requestAnimationFrame(() => {...});
  return () => cancelAnimationFrame(id);
}, []);
```

---

## Memory Management

### Component Cleanup Checklist

#### Textures
```typescript
useEffect(() => {
  return () => {
    texture.dispose();
  };
}, [texture]);
```

#### Geometries
```typescript
useEffect(() => {
  return () => {
    geometries.forEach(g => g.dispose());
  };
}, [geometries]);
```

#### Materials
```typescript
useEffect(() => {
  return () => {
    materials.forEach(m => m.dispose());
  };
}, [materials]);
```

#### Event Listeners
```typescript
useEffect(() => {
  const handler = () => {...};
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);
```

#### Animation Frames
```typescript
useEffect(() => {
  let rafId: number;
  const animate = () => {
    rafId = requestAnimationFrame(animate);
  };
  animate();
  return () => cancelAnimationFrame(rafId);
}, []);
```

### Known Memory Leak Sources
✅ **Fixed:**
- Texture disposal in SvgHeadstone
- Geometry disposal in SvgHeadstone
- Event listener cleanup in ThreeScene
- Animation frame cleanup in drag handlers

⚠️ **Watch For:**
- Large inscription counts (> 20)
- Many motifs (> 30)
- Frequent shape/material changes
- Rapid design loading

---

## Common Issues & Solutions

### Issue: Blurry Textures
**Cause:** Missing mipmap or anisotropic filtering  
**Solution:**
```typescript
texture.generateMipmaps = true;
texture.minFilter = THREE.LinearMipmapLinearFilter;
texture.anisotropy = 16;
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
```

### Issue: Stretched Textures on Base/Headstone
**Cause:** Single texture stretched across large surface  
**Solution:**
```typescript
// Calculate proper repeat based on dimensions
const textureScale = 0.15; // meters per tile
const repeatX = width / textureScale;
const repeatY = height / textureScale;
texture.repeat.set(repeatX, repeatY);
```

### Issue: UV Stretching on Curved/Side Surfaces
**Cause:** Improper UV mapping in 3D geometry  
**Known Limitations:**
- Curved top edges show "zebra stripes" (UV stretching)
- Base top surface appears washed out (texture magnified 100x)
- Side faces have horizontal streaking

**Solutions:**
1. **Fix in Blender** (Recommended): Re-unwrap UVs using Smart UV Project
2. **Triplanar Mapping**: Shader-based solution that ignores UVs (complex)
3. **Current Workaround**: Texture repeat helps front/back faces but doesn't fully solve sides

*See TEXTURE_IMPROVEMENTS_SUMMARY.md for detailed analysis*

### Issue: Inscriptions Not Visible
**Cause:** Z-fighting or incorrect positioning  
**Solution:**
- Add `lift` prop (default 0.002m)
- Use `zBump` for layering multiple texts

### Issue: Slow Performance
**Causes:**
1. Too many geometries
2. High poly count
3. Texture thrashing
4. No memoization

**Solutions:**
- Reduce `curveSegments` in extrude settings
- Use texture atlases
- Memoize expensive calculations
- Implement LOD (Level of Detail)

### Issue: WebGL Context Lost
**Handled in ThreeScene.tsx:**
```typescript
gl.domElement.addEventListener('webglcontextlost', handler);
gl.domElement.addEventListener('webglcontextrestored', handler);
```

---

## Development Workflow

### Starting Development
```bash
npm install
npm run dev
```

### Building for Production
```bash
npm run build
npm start
```

### File Organization Rules
1. **Components**: One component per file
2. **Hooks**: Extract to `/hooks` if reusable
3. **Utils**: Pure functions in `/lib`
4. **Types**: Colocated or in `global.d.ts`

### Code Quality
- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended
- **Formatting**: Prettier (if configured)

### Performance Testing
1. Open Chrome DevTools
2. Performance tab
3. Record while interacting with 3D
4. Check for:
   - Long tasks (> 50ms)
   - Memory leaks (growing heap)
   - Excessive re-renders

### Memory Profiling
1. Chrome DevTools → Memory
2. Take heap snapshot
3. Interact with app
4. Take another snapshot
5. Compare - look for detached DOM nodes

---

## Critical Files to Understand

### Must Read First
1. `lib/headstone-store.ts` - Global state
2. `components/SvgHeadstone.tsx` - Core 3D logic
3. `components/ThreeScene.tsx` - Canvas setup
4. `components/three/Scene.tsx` - Lighting/environment
5. `SLANT_COMPLETE_SUMMARY.md` - Slant rotation implementation (production-ready)
6. `SLANT_ROTATION_FIX.md` - Rotation debugging process
7. `TEXTURE_IMPROVEMENTS_SUMMARY.md` - Texture optimization & known limitations

### For Adding Features
- **New Shape**: Add SVG to `/public/shapes/`, update data
- **New Texture**: Add WebP to `/public/textures/`, update catalog
- **New Font**: Add to `/public/fonts/`, update `_data/fonts.ts`
- **New Motif**: Add SVG to `/public/motifs/`, categorize

### For Debugging
- **Performance**: Check `SvgHeadstone.tsx` memoization
- **Positioning**: Check `HeadstoneInscription.tsx` raycasting
- **Materials**: Check texture loading in `ShapeSwapper.tsx`
- **Texture Issues**: Review `TEXTURE_IMPROVEMENTS_SUMMARY.md` for UV mapping limitations

---

## Unnecessary Files (Safe to Delete)

### Documentation Clutter
- `rev1.txt` through `rev34.txt` (34 files) - Old revision notes
- `audit1.txt` through `audit7.txt` - Texture improvement audit files (info captured in TEXTURE_IMPROVEMENTS_SUMMARY.md)
- `motif.txt`, `shape.txt`, `text.txt`, `style1.txt`, `style2.txt`, `shapeData.txt`
- Most `*.md` files in root (except readme.md, license.md, changelog.md, STARTER.md, TEXTURE_IMPROVEMENTS_SUMMARY.md)

### Backup Files
- `components/SvgHeadstone.v9.backup`
- `components/SvgHeadstone.tsx.backup`
- `app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx.backup`
- `app/select-material/MaterialPanelWrapper-old.tsx`
- `app/select-shape/ShapePanelWrapper-old.tsx`

### Temporary Files
- `logs.log`
- `temp_design.xml`
- `design-1721009360757.json`
- `original-screen.jpg`, `screen.jpg`, `screen.png`, `screen2.png`

### Build Artifacts
- `tsconfig.tsbuildinfo` (regenerated)
- `.next/` directory (gitignored, rebuilt)

---

## Best Practices

### ✅ Do This
- Always dispose Three.js objects
- Use `useMemo` for expensive calculations
- Memoize child render functions
- Clean up event listeners
- Cancel animation frames
- Use error boundaries for 3D content
- Lazy load heavy components
- Optimize images to WebP

### ❌ Don't Do This
- Create Three.js objects in render
- Forget to dispose textures/geometries
- Use inline functions in props unnecessarily
- Load all textures upfront
- Ignore TypeScript errors
- Commit large binary files
- Use `any` type excessively

---

## Quick Reference Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint

# Useful Scripts
git status              # Check uncommitted changes
git diff                # See file changes
git log --oneline -10   # Recent commits
```

---

## Support & Resources

- **Three.js Docs**: https://threejs.org/docs/
- **R3F Docs**: https://docs.pmnd.rs/react-three-fiber
- **Drei Helpers**: https://github.com/pmndrs/drei
- **Zustand**: https://github.com/pmndrs/zustand
- **Next.js 15**: https://nextjs.org/docs

---

## Version History

- **2025-12-14 (Evening)**: Adjustable Slant Thickness Slider (100-300mm)
  - Added user-controlled thickness slider in DesignerNav (appears after Height slider)
  - Changed from ratio-based (0.1-1.0) to absolute millimeter values (100-300mm)
  - Slider controls `baseThickness` which determines slant angle
  - 100mm = steep angle (~45°), 150mm = standard (~30°), 300mm = shallow/gradual
  - Fixed back edge alignment: translates by `baseThickness - depth/2` to keep back at `-depth/2`
  - Added `slantThickness` to useMemo dependencies for real-time geometry updates
  - Back edge remains perfectly aligned with base regardless of thickness value
  - Production-ready with proper TypeScript types and error handling
  - Commit: `7bd432fc59`
- **2025-12-14 (Morning)**: Slant Headstone Rotation Fix - World-Space Angle Calculation (Production-Ready)
  - **CRITICAL FIX**: Fixed unit mismatch in slant angle calculation (advice49-53)
  - Calculate angle using world-space dimensions: `atan2(worldRun, worldHeight)`
  - Account for non-uniform scaling: `worldScaleY = scale * sCore`, `worldScaleZ = scale`
  - Fixed inverted normal: Y component now positive `Math.sin(slantAngleRad)`
  - Removed FaceSpace component for simplified hierarchy
  - Natural rotation inheritance from parent wrapper eliminates `onBeforeRender` conflicts
  - Fixed TypeScript build errors: removed invalid `depthWrite` props from Text components
  - Wrapper position: `[0, 0, (depth/2) * scale]` matches meshScale[2] (no sCore)
  - frontZ epsilon: `0.0005` (wrapper already at face, no double offset)
  - Production build successful with all inscriptions/motifs properly aligned to slant surface
- **2025-12-13**: Slant Headstone Rotation & Positioning Fix (Superseded by 2025-12-14)
  - Implemented quaternion-based rotation for inscriptions/motifs on slant surfaces
  - Fixed double Z-offset bug in upright headstones (text floating at 2x distance)
  - Created FaceSpace component to lock children to slanted face plane (later removed)
  - Fixed normal direction (later corrected to positive Y)
  - Added `renderOrder={10}` to children group (draw after granite)
  - Added `polygonOffset` to all granite materials (factor: 1, units: 1)
  - Created comprehensive documentation: SLANT_ROTATION_FIX.md, SLANT_COMPLETE_SUMMARY.md
- **2025-12-12**: Slant Headstone Feature (Production-Ready)
  - Implemented upright vs slant headstone style selector in size-selector UI
  - Created trapezoidal geometry using thickness ratio (20% top/base) instead of fixed angle
  - Applied rock pitch texture to left/right sides with coordinate-driven UV mapping
  - Fixed inscription positioning: wrapper at `[0,0,0]` with `frontZ: 5.0` SVG units
  - Rotated child wrapper by `-slantAngleRad` for inscriptions/motifs to follow slant
  - Report `worldSlantH` (diagonal height) instead of vertical height for text scaling
  - Fixed MeshPhysicalMaterial usage (no clearcoat errors in logs)
  - Z-centered geometry with `translate(0, 0, depth/2)` for proper base alignment
  - Memory optimized with proper texture disposal
  - Debugged and fixed z=-1000 inscription positioning bug
  - Debugged and fixed embedded inscription visibility issue
  - Production-ready with all inscriptions/motifs/additions visible on slanted surface
- **2025-12-11**: Rock Pitch Base Feature (Production-Ready)
  - Implemented polished vs rock-pitch base finish selector
  - Created faceted Voronoi normal map generator (turtle shell pattern)
  - Fixed stretched noise with anti-stretch aspect ratio correction
  - Added multi-material RoundedBoxGeometry support with fixRoundedBoxUVs()
  - Optimized for 60 FPS with proper memoization and texture cleanup
  - Polished Flat Top (PFT) with clearcoat on top/bottom surfaces
  - Rock pitch sides: normalScale (3.0, 3.0), roughness 0.65, color 0x444444
  - Baked 12x12 chip density with *4 correction factor
  - Added directional lighting for normal map visibility
  - Memory leak prevention and proper disposal patterns
  - TypeScript build fixes for production deployment
- **2025-12-10**: Texture and PBR material improvements
  - Added seamless 2-3x texture tiling to prevent stretching
  - Upgraded to MeshPhysicalMaterial with clearcoat for polished granite
  - Added 16x anisotropic filtering for sharper textures at angles
  - Optimized material settings: roughness 0.15, metalness 0.0, clearcoat 1.0
  - Enhanced environment reflections (intensity 1.5)
  - Documented UV mapping limitations requiring Blender fixes
- **2025-12-07**: Initial STARTER.md creation
- **2025-12-07**: Added canvas click selection for headstone/base
- **2025-11-30**: Performance optimizations
- **2025-11-25**: Mobile editor layout fixes

---

**Happy Coding! 🚀**

For questions or issues:
- Check `TEXTURE_IMPROVEMENTS_SUMMARY.md` for material/texture optimization details
- Review existing documentation in the root directory
- See audit files for detailed texture improvement analysis
