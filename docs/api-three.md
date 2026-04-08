# Three.js Components Reference

Function-level documentation for all React Three Fiber components.

---

## Scene (`components/three/Scene.tsx`)

**Export:** `Scene` (default)

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `targetRotation` | `number` | `0` | Target Y-axis rotation (radians) |
| `currentRotation` | `MutableRefObject<number>` | — | Mutable ref tracking current rotation |
| `onReady` | `() => void` | — | Callback when scene finishes loading |

### Key Internal Functions

- **`GradientBackground()`** — Renders gradient sky sphere using custom vertex/fragment shaders with `SKY_TOP_COLOR` and `SKY_BOTTOM_COLOR`
- **`GrassFloor()`** — Textured grass plane with normal maps, AO, repeating UVs. Uses `ContactShadows`
- **`SimpleGrassFloor()`** — Fallback solid-color grass for 2D mode
- **`handleCanvasClick(e)`** — Deselection handler with 4px drag threshold to distinguish clicks from drags

### Store Subscriptions

`is2DMode`, `baseSwapping`, `loading`, `shapeUrl`, `catalog?.product.type`, `ledgerDepthMm`

### Renders

- **Lighting:** Ambient (0.6), Hemisphere (0.8), SpotLights (key: 2.5, rim: 2)
- **Effects:** AdaptiveDpr, Environment HDRI, Sparkles (30 count), Fog (9–48 range)
- **Children:** HeadstoneAssembly, GrassFloor, SunRays, GradientBackground
- **Interaction:** OrbitControls with configurable damping/zoom/pan

---

## ShapeSwapper (`components/three/headstone/ShapeSwapper.tsx`)

**Export:** `ShapeSwapper` (default) — 28KB, the largest headstone component

### Props

```typescript
interface ShapeSwapperProps {
  tabletRef: React.RefObject<THREE.Object3D>;
  headstoneMeshRef?: React.RefObject<THREE.Mesh>;
}
```

### Key Internal Functions

- **`remapLayoutsBetweenBoxes(oldBox, newBox)`** — Proportionally remaps inscriptions, motifs, additions between shape bounding boxes when shape changes
- **`getBoxMetrics(box)`** — Extracts center and dimensions from `Box3`
- **`remapPointBetweenBoxes(x, y, oldMetrics, newMetrics)`** — Proportional coordinate remapping between two boxes
- **`PreloadShape({ url, onReady })`** — Preloads SVG shape data
- **`PreloadTexture({ url, onReady })`** — Preloads material textures

### Store Subscriptions (20+)

`heightMm`, `widthMm`, `shapeUrl`, `headstoneMaterialUrl`, `borderName`, `inscriptions`, `selectedInscriptionId`, `selectedAdditions`, `additionOffsets`, `selectedMotifs`, `motifOffsets`, `selectedImages`, `selectedEmblems`, `emblemOffsets`, `fontLoading`, `baseSwapping`, `loading`, `is2DMode`

### Renders

- **SvgHeadstone** — SVG extruded to 3D with granite texture
- Per-inscription **HeadstoneInscription** components
- Per-addition **AdditionModel** (GLB 3D models)
- Per-motif **MotifModel** (SVG decorative graphics)
- Per-image **ImageModel** (photo overlays)
- Per-emblem **EmblemModel** (bronze emblems)
- **BronzeBorder** (conditional, plaques only)
- **InsetContourLine** (optional detail lines)
- **AutoFit** / **FullMonumentFit** (camera positioning)

---

## HeadstoneAssembly (`components/three/headstone/HeadstoneAssembly.tsx`)

**Export:** `HeadstoneAssembly` (default) — No props, reads entirely from store

### Store Subscriptions

`selected`, `setSelected`, `setEditingObject`, `showBase`, `showLedger`, `showKerbset`, `baseHeightMm`, `ledgerDepthMm`, `catalog?.product.type`, `borderName`

### Renders

- **Position offset:** Assembly at `[0, baseHeightMeters, 0]` (headstone on top of base)
- **Monument group** with z-offset for full-monument layout
- **ShapeSwapper** — Headstone + all overlays
- **HeadstoneBaseAuto** — Pedestal (if `showBase`)
- **LedgerSlab** + **LedgerSurfaceContent** (if `showLedger`)
- **KerbsetBorder** (if `showKerbset`)
- **RotatingBoxOutline** — Selection indicators for each part

---

## ImageModel (`components/three/ImageModel.tsx`)

**Export:** `ImageModel` (default) — 22KB, handles photo placement

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | — | Image instance ID |
| `imageUrl` | `string` | — | Photo URL |
| `widthMm` / `heightMm` | `number` | — | Image dimensions in mm |
| `xPos` / `yPos` | `number` | — | Position coordinates |
| `rotationZ` | `number` | — | Rotation angle (degrees) |
| `typeId` | `number` | — | Image product type |
| `maskShape` | `string` | `'oval_horizontal'` | SVG mask shape |
| `headstone` | `HeadstoneAPI` | — | Parent headstone ref |
| `index` | `number` | `0` | Z-order index |
| `surface` | `string` | `'headstone'` | Target surface |
| `coordinateSpace` | `string` | — | `'mm-center'` for absolute positioning |

### Key Internal Functions

- **`loadTexture()`** — Loads image with fallback candidates, configures anisotropy
- **`loadMaskShape()`** — Loads SVG mask → `ExtrudeGeometry` + `flatGeometry` for ceramic base
- **`placeOnVerticalSurface(clientX, clientY)`** — Raycast to headstone face
- **`placeOnBaseSurface(clientX, clientY)`** — Raycast to base plane
- **`placeOnLedgerSurface(clientX, clientY)`** — Raycast to ledger

### Renders

- **Ceramic Base** (if typeId ≠ 21/135): ExtrudeGeometry from SVG mask, 2mm depth, beveled
- **Photo Plane:** PlaneGeometry with photo texture, optional ShapeGeometry mask
- **SelectionBox** when selected
- Drag interaction with surface-specific plane constraints

---

## MotifModel (`components/three/MotifModel.tsx`)

**Export:** `MotifModel` (default) — 24KB, SVG-to-texture pipeline

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | — | Motif instance ID |
| `svgPath` | `string` | — | SVG file path |
| `color` | `string` | — | Fill color (hex) |
| `headstone` | `HeadstoneAPI` | — | Parent headstone ref |
| `index` | `number` | `0` | Z-order index |
| `surface` | `string` | `'headstone'` | Target surface |

### Key Internal Functions

- **`loadTexture()`** — Fetches SVG, rasterizes to canvas (up to 2048×2048), converts to grayscale alpha mask
- **`placeOnVerticalSurface(clientX, clientY)`** — Raycast to headstone face
- Drag handling with bounding box constraints

### Renders

- **Plane mesh** with CanvasTexture (SVG rasterized, grayscale alpha)
- MeshStandardMaterial with custom color, metallic sheen for Traditional Engraved (sandblasted effect)
- SelectionBox when selected

---

## AdditionModel (`components/three/AdditionModel.tsx`)

**Export:** `AdditionModel` (default) — 42KB, the largest component

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | — | Addition instance ID |
| `headstone` | `HeadstoneAPI` | — | Parent headstone ref |
| `index` | `number` | `0` | Z-order index |
| `surface` | `string` | `'headstone'` | Target surface |

### Key Internal Functions

- **`loadGLB()`** — `useGLTF` hook loads `.glb` 3D model from `/additions/{type}/{file}`
- **`colorMap`** — `useTexture` for `/additions/{dirNum}/colorMap.webp`
- **`placeOnVerticalSurface(clientX, clientY)`** — Raycast with bounding box clamping
- **`placeOnBaseSurface(clientX, clientY)`** — Raycast on base mesh with drag plane
- **`placeOnLedgerSurface(clientX, clientY)`** — Raycast on ledger with Y=normal plane
- Collision detection, depth clamping, footprint constraints

### Store Subscriptions (12+)

`additionOffsets[id]`, `setAdditionRef`, `setAdditionOffset`, `selectedAdditionId`, `setSelectedAdditionId`, `setActivePanel`, `baseMeshRef`, `productId`, `ledgerWidthMm`, `ledgerDepthMm`

### Renders

- **GLB Scene** (cloned) with transforms applied
- Applied textures/colors from colorMap
- RotatingBoxOutline + SelectionBox when selected
- Depth-sorted index for z-fighting prevention
- Surface-specific positioning

---

## HeadstoneInscription (`components/HeadstoneInscription.tsx`)

**Export:** `HeadstoneInscription` (forwardRef)

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | — | Inscription ID |
| `headstone` | `HeadstoneAPI` | — | Parent headstone ref |
| `text` | `string` | — | Display text |
| `height` | `number` | — | Font size (SVG units) |
| `color` | `string` | — | Text color (hex) |
| `font` | `string` | — | Font family name |
| `lift` | `number` | — | Z offset (meters) |
| `editable` | `boolean` | — | Allow editing |
| `selected` | `boolean` | — | Selected state |
| `xPos` / `yPos` | `number` | — | Position |
| `rotationDeg` | `number` | — | Rotation (degrees) |
| `surface` | `string` | `'headstone'` | Target surface |
| `coordinateSpace` | `string` | — | `'mm-center'` for absolute |

### Key Internal Functions

- **`getSurfaceBounds()`** — Computes bounding box for target surface
- **`updateLineStore(patch)`** — Syncs position/rotation to Zustand store
- Drag handling with per-surface constraint clamping
- Traditional Engraved detection for sandblasted text effect

### Renders

- **Text** (drei) with font, color, height, extrude depth
- Mesh group with position/rotation
- SelectionBox when selected

---

## LedgerSlab (`components/three/headstone/LedgerSlab.tsx`)

**Export:** `LedgerSlab` (forwardRef)

### Props

| Prop | Type | Description |
|------|------|-------------|
| `onClick` | `(e) => void` | Click handler |

### Key Internal Functions

- `configureGraniteTexture(texture, { repeatX: 3, repeatY: 1 })` — Tile granite pattern
- `createPolishedGraniteMaterial(...)` — Polished granite with clearcoat, envMapIntensity: 0.75
- **useFrame animation:** Smooth lerp of position/scale based on store dimensions

### Renders

- **RoundedBoxGeometry** (radius 0.004)
- PolishedGraniteMaterial (roughness 0.24, clearcoatRoughness 0.18)
- Animated via useFrame with `LERP_FACTOR` smoothing

---

## KerbsetBorder (`components/three/headstone/KerbsetBorder.tsx`)

**Export:** `KerbsetBorder` (forwardRef)

### Props

| Prop | Type | Description |
|------|------|-------------|
| `onClick` | `(e) => void` | Click handler |

### Key Internal Functions

- `configureGraniteTexture(texture, { repeatX: 4, repeatY: 1 })`
- `createPolishedGraniteMaterial(...)` — envMapIntensity: 0.78, roughness 0.26

### Renders

- **Group** of 4 BoxGeometry meshes (back, front, left, right walls)
- Wall thickness: `WALL_MM = 100mm`
- Shared PolishedGraniteMaterial
- useFrame animation with lerp

---

## AutoFit (`components/three/AutoFit.tsx`)

**Export:** `AutoFit` (default) — Utility component (renders null)

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `target` | `RefObject<Object3D>` | — | Object to frame |
| `anchor` | `RefObject<Object3D>` | — | Anchor for Y clamping |
| `margin` | `number` | `0.5` | Extra margin (≥1) |
| `duration` | `number` | `0.25` | Animation duration (seconds) |
| `pad` | `number` | `0` | Extra distance in front |
| `readyTimeoutMs` | `number` | `50` | Ready detection timeout |
| `resizeDebounceMs` | `number` | `1` | Resize debounce |
| `trigger` | `unknown` | — | Bump to force refit |

### Key Internal Functions

- **`fitCamera()`** — Computes camera position to frame target using bounding sphere. Calculates vertical & horizontal FOV. Applies anchor Y-clamping (±40%). Updates projection matrix.
- **Retry logic:** Up to 5 attempts with 100ms increments if mesh not ready

---

## BronzeBorder (`components/three/BronzeBorder.tsx`)

**Export:** `BronzeBorder`

### Props

| Prop | Type | Description |
|------|------|-------------|
| `borderName` | `string \| null` | Border SVG name |
| `plaqueWidth` / `plaqueHeight` | `number` | Plaque dimensions |
| `unitsPerMeter` | `number` | Scale factor |
| `frontZ` | `number` | Z position |
| `color` | `string` | Bronze color (e.g., `'#FFDFA3'`) |
| `depth` | `number` | Extrusion depth |

### Key Internal Functions

- **SVG-to-3D pipeline:** Loads border SVG → extracts paths → creates ExtrudeGeometry → slices to plaque bounds
- **`createBronzeTextures()`** — Generates metallic look with canvas-based roughness map
- **`ensureScratchCapacity(type, required)`** — Manages reusable Float32Array buffers
- **`buildBorder()`** — Combines geometry, applies materials, positions at plaque edges

### Constants

`BORDER_SCALE = 0.75`, `BORDER_THICKNESS_SCALE = 1.5`, `BORDER_RELIEF_SCALE = 0.33`

---

## ConditionalCanvas (`components/ConditionalCanvas.tsx`)

**Export:** `ConditionalCanvas` (default) — No props, reads pathname from router

### Visibility Rules

- **Hidden on:** `/`, `/designs/*`, `/select-product`, `/select-shape`, `/check-price`, `/my-account`
- **Shown on:** `/select-size`, `/inscriptions`, `/select-material`, `/select-additions`, `/select-motifs`, `/select-border`

### Renders

- `LoadDesignButton`, `SceneOverlayHost`, `CheckPricePanel`, `SEOPanel`
- `CropCanvas` (if `cropCanvasData` active) OR `ThreeScene`

---

## ThreeScene (`components/ThreeScene.tsx`)

**Export:** `ThreeScene` (default)

### Key Internal Components

- **`ProductNameHeader()`** — Displays product name + price pill. Calculates total: headstone + base + ledger + kerbset + inscriptions + motifs + images + additions + emblems
- **`CameraController()`** — Initializes camera position, calls OrbitControls reset
- **`rotateLeft()` / `rotateRight()`** — Updates `targetRotation` by ±π/6 (±30°)
- **`handleSceneReady()`** — Sets `sceneReady=true`, disables fade animation
- **WebGL cleanup** on unmount: releases context, disposes resources

### Store Subscriptions (15+)

`is2DMode`, `loading`, `shapeUrl`, `catalog`, `productId`, `widthMm`, `heightMm`, `baseWidthMm`, `baseHeightMm`, `baseThickness`, `showBase`, `inscriptionCost`, `motifCost`, `imageCost`, `additionCost`, `emblemCost`

### Renders

- **Canvas container** with IntersectionObserver visibility detection
- **ProductNameHeader** overlay (title top-left, price pill bottom-center)
- **R3F Canvas:** PerspectiveCamera at `[0, 4.2, CAMERA_3D_POSITION_Z]`, Scene, CameraController
- **Rotation buttons** (hidden in 2D mode)
- **Loading spinner** after initial load
- Fade animation on `/select-size` routes

---

## Component Size & Complexity Summary

| Component | File Size | Props | Store Reads | Primary Role |
|-----------|-----------|-------|-------------|--------------|
| Scene | — | 3 | 10+ | Lighting, fog, camera |
| ShapeSwapper | 28KB | 2 | 20+ | Shape swap, layout remap |
| HeadstoneAssembly | — | 0 | 8+ | Base/ledger/kerbset assembly |
| ImageModel | 22KB | 9 | 8+ | Photo placement, ceramic base |
| MotifModel | 24KB | 6 | 9+ | SVG rasterization |
| AdditionModel | 42KB | 4 | 12+ | GLB loading, collision |
| HeadstoneInscription | — | 12 | 5+ | Text rendering, fonts |
| LedgerSlab | — | 1 | 6+ | Granite slab with animation |
| KerbsetBorder | — | 1 | 6+ | Border walls |
| AutoFit | — | 7 | 3+ | Camera framing |
| BronzeBorder | — | 7 | 0 | SVG extrusion, bronze |
| ConditionalCanvas | — | 0 | 2+ | Route-based rendering |
| ThreeScene | — | 0 | 15+ | Canvas orchestration |
