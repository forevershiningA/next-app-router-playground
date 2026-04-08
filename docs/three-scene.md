# 3D Scene System

## Overview

The DYO 3D scene uses **React Three Fiber (R3F)** to render an interactive WebGL scene. The scene is mounted once at the root layout and persists across all route navigations, avoiding expensive WebGL context recreation.

## Scene Graph

```
Canvas (React Three Fiber)
│
├── CameraController
│   └── OrbitControls (damped, constrained)
│
└── Scene.tsx
    │
    ├── Lighting
    │   ├── AmbientLight (intensity: 0.6)
    │   ├── HemisphereLight (intensity: 0.8, sky→ground bounce)
    │   ├── SpotLight "Key" (intensity: 2.5, position: [-10, 12, 12])
    │   └── SpotLight "Rim" (intensity: 2, position: [5, 5, -5])
    │
    ├── Environment
    │   ├── AtmosphericSky (gradient sky dome)
    │   ├── SunRays (dust particle effect)
    │   ├── Sparkles (floating particles)
    │   ├── Fog (#ADCCE7, near: 9, far: 48 desktop / 24 mobile)
    │   └── HDRI (/hdri/spring.hdr, low-res)
    │
    ├── GrassFloor
    │   ├── Textured plane (/textures/three/grass/*)
    │   ├── Normal maps + AO
    │   └── ContactShadows (baked at ground level)
    │
    └── HeadstoneAssembly
        │
        ├── ShapeSwapper
        │   SVG outline → extruded 3D geometry
        │   Material from headstoneMaterialUrl (WebP texture)
        │   Supports headstone, plaque, and slant geometries
        │
        ├── Surface Content (on headstone face)
        │   ├── HeadstoneInscription[] (3D text with fonts)
        │   ├── MotifModel[] (SVG ornaments as canvas textures)
        │   ├── ImageModel[] (photos with drag/crop)
        │   ├── AdditionModel[] (3D GLB models)
        │   └── EmblemModel[] (PNG-based logos)
        │
        ├── HeadstoneBaseAuto
        │   Auto-sized pedestal base
        │   Width = headstone width × 1.4 multiplier
        │   Own material from baseMaterialUrl
        │
        ├── LedgerSlab (full monument only)
        │   Horizontal ground-level slab
        │   Own dimensions & material
        │   └── LedgerSurfaceContent
        │       ├── HeadstoneInscription[] (ledger text)
        │       ├── ImageModel[] (ledger images)
        │       └── MotifModel[] (ledger motifs)
        │
        ├── KerbsetBorder (full monument only)
        │   Grave plot border frame (4 corners + sides)
        │   Own material from kerbsetMaterialUrl
        │
        └── Selection Indicators
            └── RotatingBoxOutline[] (animated corner brackets)
```

## Mount Chain

```
app/layout.tsx
  └── ClientLayout
       └── ConditionalCanvas.tsx ← Route-aware visibility gate
            └── ThreeScene.tsx ← Canvas wrapper + loading + rotation controls
                 └── <Canvas> (R3F)
                      └── Scene.tsx ← Core scene with lights, environment, assembly
```

### ConditionalCanvas Route Rules

The canvas is **shown** on these routes:
- `/select-size`, `/select-material`, `/select-additions`
- `/select-motifs`, `/select-border`, `/select-emblems`
- `/inscriptions`, `/select-images`

The canvas is **hidden** (but stays mounted) on:
- `/`, `/designs/*`, `/check-price`, `/select-product`
- `/select-shape`, `/my-account`, `/products/*`

## Key Components

### ShapeSwapper (`components/three/headstone/ShapeSwapper.tsx`)

Loads SVG shapes from `/public/shapes/` and extrudes them into 3D geometry:

1. Fetches SVG file (e.g., `/shapes/headstones/serpentine.svg`)
2. Parses SVG paths into Three.js `Shape` objects
3. Extrudes to 3D with `ExtrudeGeometry`
4. Applies granite texture from `headstoneMaterialUrl`
5. Exposes `tabletRef` and `headstoneMeshRef` for raycasting

### HeadstoneInscription (`components/HeadstoneInscription.tsx`)

Renders 3D text on monument surfaces:

- Uses `@react-three/drei` Text component (SDF text rendering)
- Supports multiple font families from `/public/fonts/`
- Position in mm-center coordinate space
- Draggable on the headstone face via raycaster
- Surfaces: `'headstone'` | `'base'` | `'ledger'`

### MotifModel (`components/three/MotifModel.tsx`)

Renders SVG ornaments as textured planes:

- SVG → Canvas → CanvasTexture pipeline
- `flipY=false` with `scaleY = planeHeight * -1` convention
- Supports colors: black, white, gold, silver
- Sandblasted effect for "Traditional Engraved" products
- Click to select → floating edit panel
- Drag to reposition on surface

### ImageModel (`components/three/ImageModel.tsx`)

Renders uploaded photos on monument surfaces:

- Supports crop, resize, rotate
- Grayscale conversion for laser etching
- Drag planes computed via raycaster
- Photo placeholder asset: `vitreous-enamel-image.png`

### AdditionModel (`components/three/AdditionModel.tsx`)

Renders 3D objects (vases, statues, crucifixes):

- Loads `.glb` models from `/public/additions/`
- Positioned relative to monument base
- Size variants with different pricing
- Drag to reposition

## Selection System

When a user clicks on a 3D object:

1. `Scene.tsx` `handleCanvasClick` fires
2. Raycaster determines which mesh was hit
3. Store's `selected` state updates (`'headstone'` | `'base'` | `'ledger'` | `'kerbset'`)
4. `RotatingBoxOutline` renders animated corner brackets around selected object
5. For content items (motifs, images, etc.), the corresponding `selectedXxxId` updates
6. Floating edit panel opens via `SceneOverlayController`

## Coordinate System

All positions are in **millimeters** with origin at **headstone center**:

- **X**: Left (−) to Right (+)
- **Y**: Bottom (−) to Top (+)
- **Z**: Back (−) to Front (+)

Three.js scene uses meters internally. Conversion: `1 unit = headstoneHeightMm / 1000`.

## Environment & Lighting

| Setting | Value |
|---------|-------|
| Sky top color | RGB(0.4, 0.7, 1.0) |
| Grass dark color | RGB(0.3, 0.5, 0.2) |
| Fog color | #ADCCE7 (pale blue) |
| Fog near/far (desktop) | 9 / 48 |
| Fog near/far (mobile) | 9 / 24 |
| HDRI | `/hdri/spring.hdr` |
| Camera 2D tilt | 12.6° |
| Camera 2D distance | 10 units |
| Animation lerp factor | 0.25 |

## Performance Considerations

- **Persistent canvas**: Never unmounted, preserves WebGL context
- **Optimized imports**: `optimizePackageImports` in `next.config.ts` for Three.js
- **Texture format**: WebP for granite textures (smaller than JPEG)
- **SVG caching**: `svg-cache.ts` caches parsed SVG shapes
- **Texture preloading**: `preload-texture.ts` warms GPU textures
- **Contact shadows**: Baked (not real-time) for ground shadows
- **Instancing**: Monument parts reuse geometries where possible
