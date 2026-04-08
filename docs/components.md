# Components Reference

## Component Hierarchy

```
ClientLayout
├── RouterBinder                         # Wires Next.js router to Zustand store
├── DefaultDesignLoader                  # Loads initial design on first visit
├── ConditionalNav                       # Route-aware navigation bar
│   └── DesignerNav                      # Breadcrumb nav for designer steps
├── MainContent                          # Content wrapper (sidebar offset: lg:pl-[400px])
│   ├── ConditionalCanvas                # Route-aware 3D canvas visibility
│   │   ├── SceneOverlayHost             # Portal host for floating panels
│   │   ├── SceneOverlayController       # Bottom-sheet panel manager
│   │   ├── CheckPricePanel              # Price breakdown overlay
│   │   ├── LoadDesignButton             # Load saved design trigger
│   │   └── ThreeScene                   # Canvas wrapper
│   │       └── <Canvas>                 # React Three Fiber canvas
│   │           └── Scene                # 3D scene (see three-scene.md)
│   └── {page children}                  # Route page content
└── ErrorBoundary                        # Global error catch
```

## Component Categories

### Scene Mounting & Canvas Control

| Component | File | Purpose |
|-----------|------|---------|
| `ConditionalCanvas` | `ConditionalCanvas.tsx` | Route-aware canvas visibility gate; shows/hides based on pathname |
| `ThreeScene` | `ThreeScene.tsx` | Canvas wrapper; manages loading states, rotation controls, WebGL cleanup |
| `Scene` | `three/Scene.tsx` | Core 3D scene; lights, environment, grass floor, orbit controls, selection handling |
| `ClientLayout` | `ClientLayout.tsx` | Root wrapper; mounts RouterBinder, DefaultDesignLoader, ConditionalNav, MainContent, ConditionalCanvas |

### Monument Assembly (`components/three/headstone/`)

| Component | File | Purpose |
|-----------|------|---------|
| `HeadstoneAssembly` | `HeadstoneAssembly.tsx` | Monument root; coordinates all monument parts with selection indicators |
| `ShapeSwapper` | `ShapeSwapper.tsx` | SVG → extruded 3D headstone mesh with texture |
| `HeadstoneBaseAuto` | `HeadstoneBaseAuto.tsx` | Auto-sized pedestal base (width = headstone × 1.4) |
| `LedgerSlab` | `LedgerSlab.tsx` | Horizontal ground slab for full monuments |
| `LedgerSurfaceContent` | `LedgerSurfaceContent.tsx` | Text/images/motifs rendered on ledger surface |
| `KerbsetBorder` | `KerbsetBorder.tsx` | Grave plot border frame for full monuments |

### 3D Content Models

| Component | File | Size | Purpose |
|-----------|------|------|---------|
| `ImageModel` | `three/ImageModel.tsx` | ~42KB | Photos on headstones/ledger; drag, crop, resize |
| `MotifModel` | `three/MotifModel.tsx` | ~42KB | SVG ornaments with color support and sandblast effect |
| `AdditionModel` | `three/AdditionModel.tsx` | ~42KB | 3D GLB models (vases, statues, crucifixes) |
| `EmblemModel` | `three/EmblemModel.tsx` | — | PNG-based logos/emblems |
| `HeadstoneInscription` | `HeadstoneInscription.tsx` | — | 3D text with font/color/positioning |

### Selection & Interaction

| Component | File | Purpose |
|-----------|------|---------|
| `SelectionBox` | `SelectionBox.tsx` | BoxHelper around selected 3D objects |
| `RotatingBoxOutline` | `RotatingBoxOutline.tsx` | Elegant animated corner-bracket selection indicator |
| `CanvasClickOverlay` | `CanvasClickOverlay.tsx` | Captures canvas clicks for object selection |

### 3D Environment

| Component | File | Purpose |
|-----------|------|---------|
| `AtmosphericSky` | `three/AtmosphericSky.tsx` | Gradient sky dome |
| `SkyShader` | `three/SkyShader.tsx` | Sky shader material (GLSL) |
| `SunRays` | `three/SunRays.tsx` | Dust particle ray effect |
| `GrassFloor` | (in Scene.tsx) | Textured ground plane with contact shadows |
| `AutoFit` | `three/AutoFit.tsx` | Auto-frame headstone in camera view |
| `FullMonumentFit` | `three/FullMonumentFit.tsx` | Auto-frame full monument in view |
| `BronzeBorder` | `three/BronzeBorder.tsx` | Bronze plaque border rendering |
| `InsetContourLine` | `three/InsetContourLine.tsx` | White border contour line |

### Selector Panels

| Component | File | Purpose | Key Store Actions |
|-----------|------|---------|-------------------|
| `MaterialSelector` | `MaterialSelector.tsx` | Material/texture thumbnails | `setHeadstoneMaterialUrl`, `setBaseMaterialUrl`, etc. |
| `ShapeSelector` | `ShapeSelector.tsx` | Headstone shape grid | `setShapeUrl` |
| `BorderSelector` | `BorderSelector.tsx` | Plaque border styles | `setBorderName` |
| `AdditionSelector` | `AdditionSelector.tsx` | 3D add-on items | `addAddition`, `removeAddition` |
| `MotifSelectorPanel` | `MotifSelectorPanel.tsx` | Ornament library with categories | `addMotif`, `removeMotif` |
| `ImageSelector` | `ImageSelector.tsx` | Photo upload & positioning | `addImage`, `setSelectedImageId` |
| `EmblemOverlayPanel` | `EmblemOverlayPanel.tsx` | Emblem placement | `setSelectedEmblemId` |

### Editing Panels

| Component | File | Purpose |
|-----------|------|---------|
| `InscriptionEditPanel` | `InscriptionEditPanel.tsx` | Edit text, font, size, color, position |
| `EditImagePanel` | `EditImagePanel.tsx` | Crop, resize, reposition photos |
| `EditMotifPanel` | `EditMotifPanel.tsx` | Reposition, resize, recolor motifs |
| `MotifOverlayPanel` | `MotifOverlayPanel.tsx` | Floating motif edit panel |
| `AdditionOverlayPanel` | `AdditionOverlayPanel.tsx` | Floating addition edit panel |

### Data Loaders

| Component | File | Purpose |
|-----------|------|---------|
| `MaterialsLoader` | `MaterialsLoader.tsx` | Fetches material catalog from XML/API → populates store |
| `ShapesLoader` | `ShapesLoader.tsx` | Fetches shape catalog → populates store |
| `BordersLoader` | `BordersLoader.tsx` | Fetches border options → populates store |
| `MotifsLoader` | `MotifsLoader.tsx` | Fetches motif catalog → populates store |
| `DefaultDesignLoader` | `DefaultDesignLoader.tsx` | Loads initial default design on first visit |
| `SavedDesignLoader` | `SavedDesignLoader.tsx` | Loads design from URL/saved project |

### Navigation & Layout

| Component | File | Purpose |
|-----------|------|---------|
| `ConditionalNav` | `ConditionalNav.tsx` | Top nav that shows/hides based on route |
| `DesignerNav` | `DesignerNav.tsx` | Designer section nav with step breadcrumbs |
| `DesignSidebar` | `DesignSidebar.tsx` | Left sidebar for design gallery |
| `MainContent` | `MainContent.tsx` | Wrapper with `lg:pl-[400px]` sidebar offset |
| `MobileHeader` | `MobileHeader.tsx` | Mobile-specific header |
| `MobileNavToggle` | `MobileNavToggle.tsx` | Hamburger menu button |
| `AccountNav` | `AccountNav.tsx` | My Account navigation links |

### Design Gallery

| Component | File | Purpose |
|-----------|------|---------|
| `DesignGallery` | `DesignGallery.tsx` | Browse saved/pre-made designs |
| `DesignSmartSearch` | `DesignSmartSearch.tsx` | Search designs with filters |
| `DesignsTreeNav` | `DesignsTreeNav.tsx` | Hierarchical product/category navigation |

### Utility Components

| Component | File | Purpose |
|-----------|------|---------|
| `ErrorBoundary` | `ErrorBoundary.tsx` | Catches React errors with fallback UI |
| `LoadingOverlay` | `LoadingOverlay.tsx` | Global loading state display |
| `CanvasFallback` | `CanvasFallback.tsx` | Loading spinner while canvas loads |
| `OverlayPortal` | `OverlayPortal.tsx` | React portal for modals |
| `SvgHeadstone` | `SvgHeadstone.tsx` | SVG 2D headstone renderer (alternative to 3D) |
| `CropCanvas` | `CropCanvas.tsx` | Separate canvas for image cropping |
| `CropMaskOverlay` | `CropMaskOverlay.tsx` | Crop tool UI overlay |
| `SaveDesignModal` | `SaveDesignModal.tsx` | Modal for saving designs |
| `HeroCanvas` | `HeroCanvas.tsx` | Large canvas for homepage showcase |
| `SelectSizeOverlayCard` | `SelectSizeOverlayCard.tsx` | Size picker (width × height) overlay |

### Colocated Route Components (`_ui/`)

Each design step has a colocated `_ui/` folder with its selection grid:

| Component | Route |
|-----------|-------|
| `ProductSelectionGrid` | `/select-product/_ui/` |
| `ShapeSelectionGrid` | `/select-shape/_ui/` |
| `MaterialSelectionGrid` | `/select-material/_ui/` |
| `AdditionSelectionGrid` | `/select-additions/_ui/` |
| `BorderSelectionGrid` | `/select-border/_ui/` |
| `EmblemSelectionGrid` | `/select-emblems/_ui/` |
| `MotifSelectionGrid` | `/select-motifs/_ui/` |
| `CheckPriceGrid` | `/check-price/_ui/` |

### UI Primitives (`ui/`)

| Component | File | Purpose |
|-----------|------|---------|
| `TailwindSlider` | `TailwindSlider.tsx` | Styled slider control |
| `Button` | `button.tsx` | Button with default/error variants |
| `Tabs` | `tabs.tsx` | Tabbed navigation with active state |
| `Skeleton` | `skeleton.tsx` | Loading skeleton |
| `SkeletonCard` | `skeleton-card.tsx` | Card loading skeleton |
| `Loader` | `loader.tsx` | Loading spinner |
| `ProductCard` | `product-card.tsx` | Product showcase card |
| `Prose` | `prose.tsx` | Rich text / markdown styling |
| `ExternalLink` | `external-link.tsx` | External link with icon |
