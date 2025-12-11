# Next-DYO (Design Your Own) Headstone Application

**Last Updated:** 2025-12-11  
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
10. [Performance Considerations](#performance-considerations)
11. [Memory Management](#memory-management)
12. [Common Issues & Solutions](#common-issues--solutions)
13. [Development Workflow](#development-workflow)

---

## Project Overview

A Next.js-based 3D headstone designer allowing users to:
- Select headstone shapes, materials, and sizes
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
5. `TEXTURE_IMPROVEMENTS_SUMMARY.md` - Texture optimization & known limitations

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
