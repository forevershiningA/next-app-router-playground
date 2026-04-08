# Hooks, Constants & Config Reference

Documentation for custom hooks, Zustand secondary stores, constants, data mappings, and middleware.

---

## Constants (`lib/headstone-constants.ts`)

### Dimension Constraints

| Constant | Value | Description |
|----------|-------|-------------|
| `MIN_HEADSTONE_DIM` | `300` | Minimum dimension (mm) |
| `MAX_HEADSTONE_DIM` | `1200` | Maximum dimension (mm) |
| `MIN_INSCRIPTION_SIZE_MM` | `5` | Minimum font size (mm) |
| `MAX_INSCRIPTION_SIZE_MM` | `1200` | Maximum font size (mm) |
| `MIN_INSCRIPTION_ROTATION_DEG` | `-45` | Min text rotation (degrees) |
| `MAX_INSCRIPTION_ROTATION_DEG` | `45` | Max text rotation (degrees) |

### Base & Monument

| Constant | Value | Description |
|----------|-------|-------------|
| `BASE_HEIGHT_METERS` | `0.5` | Base height (500mm) |
| `BASE_WIDTH_MULTIPLIER` | `1.4` | Base width = headstone × 1.4 |
| `BASE_DEPTH_MULTIPLIER` | `1.5` | Base depth = headstone × 1.5 |
| `BASE_MIN_WIDTH` | `0.05` | Minimum base width (m) |
| `BASE_MIN_DEPTH` | `0.05` | Minimum base depth (m) |
| `FULL_MONUMENT_WIDTH_DIFF` | `200` | Kerbset/base width diff (mm) |
| `FULL_MONUMENT_HEIGHT_DIFF` | `100` | Base height diff (mm) |
| `FULL_MONUMENT_DEPTH_DIFF` | `100` | Kerbset depth diff (mm) |

### Additions

| Constant | Value | Description |
|----------|-------|-------------|
| `ADDITION_TARGET_HEIGHT_METERS` | `0.18` | Default addition height (18cm) |
| `ADDITION_MIN_SCALE` | `0.05` | Min addition scale |
| `ADDITION_MAX_SCALE` | `5` | Max addition scale |

### Animation & Rendering

| Constant | Value | Description |
|----------|-------|-------------|
| `LERP_FACTOR` | `0.25` | Animation smoothing factor |
| `EPSILON` | `1e-3` | Float comparison tolerance |
| `Z_TOLERANCE` | `0.25` | Z-axis tolerance |

### Camera

| Constant | Value | Description |
|----------|-------|-------------|
| `CAMERA_2D_TILT_ANGLE` | `12.6` | 2D view tilt (degrees) |
| `CAMERA_2D_DISTANCE` | `10` | 2D view distance |
| `CAMERA_3D_POSITION_Y` | `1` | 3D camera Y position |
| `CAMERA_3D_POSITION_Z` | `10` | 3D camera Z distance |
| `CAMERA_FOV` | `35` | Field of view (degrees) |
| `CAMERA_NEAR` | `0.1` | Near clipping plane |
| `CAMERA_FAR` | `100` | Far clipping plane |

### Colors (RGB 0–1)

| Constant | Value | Description |
|----------|-------|-------------|
| `SKY_TOP_COLOR` | `{ r: 0.4, g: 0.7, b: 1.0 }` | Sky gradient top |
| `SKY_BOTTOM_COLOR` | `{ r: 0.7, g: 0.9, b: 1.0 }` | Sky gradient bottom |
| `GRASS_DARK_COLOR` | `{ r: 0.3, g: 0.5, b: 0.2 }` | Grass dark shade |
| `GRASS_LIGHT_COLOR` | `{ r: 0.4, g: 0.6, b: 0.3 }` | Grass light shade |

### Asset Paths

| Constant | Value | Description |
|----------|-------|-------------|
| `DEFAULT_SHAPE_IMAGE` | `'serpentine.svg'` | Default headstone shape |
| `SHAPES_BASE` | `'/shapes/headstones/'` | Shape SVGs base URL |
| `DEFAULT_SHAPE_URL` | `'/shapes/headstones/serpentine.svg'` | Full default shape URL |
| `TEX_BASE` | `'/textures/forever/l/'` | Textures base URL |
| `DEFAULT_TEX` | `'Imperial-Red.webp'` | Default texture file |

---

## Custom Hooks

### `useMotifCategory` (`lib/use-motifs.ts`)

```typescript
function useMotifCategory(options: UseMotifCategoryOptions): UseMotifCategoryResult
```

Loads and manages motif files for a category with pagination.

**Options:** `categoryIndex`, `formula`, `pageSize`, `initialLoad`

**Returns:**
| Field | Type | Description |
|-------|------|-------------|
| `files` | `string[]` | Loaded motif file paths |
| `totalCount` | `number` | Total available |
| `hasMore` | `boolean` | More pages available |
| `isLoading` | `boolean` | Loading state |
| `error` | `Error \| null` | Error state |
| `loadMore` | `() => Promise<void>` | Load next page |
| `reload` | `() => Promise<void>` | Reload from start |

### `useMotifCategoryAll` (`lib/use-motifs.ts`)

```typescript
function useMotifCategoryAll(categoryIndex: number, formula?: ProductFormula): {
  files: string[];
  isLoading: boolean;
  error: Error | null;
}
```

Loads all motif files at once (no pagination). Useful for search/filter views.

### `useSvg` (`lib/use-svg.ts`)

```typescript
function useSvg(url: string, onLoad?: (data: any) => void): SVGResult
```

Loads SVG using Three.js `SVGLoader` via React Three Fiber's `useLoader`. Wraps with anonymous cross-origin loading.

### `useUnitSystem` (`lib/use-unit-system.ts`)

```typescript
function useUnitSystem(): 'metric' | 'imperial'
```

Returns unit system from cookie or defaults to `'metric'`. Uses `useMemo` to parse the `unit_system` cookie.

### `useHiddenDesigns` (`lib/useHiddenDesigns.ts`)

```typescript
function useHiddenDesigns(): {
  isLocalhost: boolean;
  hiddenIds: Set<string>;
  hideDesign: (id: string) => Promise<void>;
  favoriteIds: Set<string>;
  toggleFavorite: (id: string) => Promise<void>;
}
```

Manages hidden and favorite designs. Hidden designs only work on localhost (dev tool). Favorites are public. Persists to `data/hidden-designs.json` and `data/favorite-designs.json`.

---

## Secondary Zustand Stores

### `useSceneOverlayStore` (`lib/scene-overlay-store.ts`)

Manages the floating overlay panel that appears over the 3D scene.

**State:**

| Field | Type | Initial | Description |
|-------|------|---------|-------------|
| `open` | `boolean` | `false` | Overlay visible |
| `title` | `string` | `''` | Panel title |
| `section` | `'size' \| 'shape' \| 'material' \| string` | `undefined` | Current section |
| `content` | `ReactNode \| null` | `null` | Panel content |
| `pos` | `{ x: number; y: number }` | `{ x: 24, y: 24 }` | Position |
| `collapsed` | `boolean` | `false` | Collapsed state |

**Actions:**

| Action | Signature | Description |
|--------|-----------|-------------|
| `show` | `({ section?, title?, content }) => void` | Show overlay. Title defaults to section title map |
| `hide` | `() => void` | Hide overlay, clear content |
| `setPos` | `(pos: { x, y }) => void` | Update position |
| `toggleCollapsed` | `() => void` | Toggle collapsed state |

### `useCounterStore` (`lib/counter-store.ts`)

Simple counter store (likely for testing/development).

**State:** `count: number` (initial: `0`)

**Actions:** `increment()`, `setCount(count: number)`

---

## Type Exports (`lib/three-types.ts`)

```typescript
interface ThreeContextValue {
  camera: Camera;
  gl: WebGLRenderer;
  scene: Scene;
  controls?: any;
  raycaster?: any;
  pointer?: any;
  mouse?: any;
  clock?: any;
  size?: { width: number; height: number };
}

type ThreeHookResult = Partial<ThreeContextValue>;
```

---

## Image Size Config (`lib/image-size-config.ts`)

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `IMAGE_SIZE_CONFIGS` | `Record<string, ImageSizeOption[]>` | Size options per product type. 6 types: `'7'`, `'200'`, `'201'`, `'202'`, `'2300'`, `'2400'` (10–11 sizes each) |
| `FLEXIBLE_IMAGE_TYPE_IDS` | `Set<string>` | Types supporting free-form sizing: `'21'`, `'135'`, `'136'`, `'137'` |

### Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `getImageSizeOptions` | `(typeId: number \| string) => ImageSizeOption[]` | Get all sizes for product type |
| `getImageSizeOption` | `(typeId: number \| string, variant?: number) => ImageSizeOption \| null` | Get specific size (1-indexed) |
| `isFlexibleImageType` | `(typeId: number \| string) => boolean` | Check if flexible sizing supported |
| `getFlexibleImageBounds` | `(typeId: number \| string) => bounds \| null` | Get min/max/init bounds |

### Flexible Image Bounds

| Type ID | Min Height | Max Height | Init Height |
|---------|-----------|------------|-------------|
| `21` | 30mm | 1200mm | 50mm |
| `135` | 30mm | 1200mm | 50mm |
| `136` | 30mm | 300mm | 50mm |
| `137` | 30mm | 1200mm | 50mm |

---

## Motif Category Mappings (`lib/motif-category-mappings.ts`)

**39 categories** mapping category names to filename patterns for motif SVG file matching.

### Exported Constant

```typescript
const categoryFilePatterns: Record<string, string[]>
```

### Sample Categories

| Category | Pattern Examples |
|----------|----------------|
| `Animals/Aquatic` | `whale`, `dolphin`, `fish`, `shark`, `turtle` |
| `Animals/Birds` | `bird`, `eagle`, `owl`, `parrot`, `peacock` |
| `Hearts` | `1_001` through `1_009` |
| `Flowers` | `flower`, `rose`, `lotus`, `ivy` |
| `Religion` | `cross`, `church`, `angel`, `bible` |
| `Sports` | `cricket`, `football`, `golf`, `tennis` |

### Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `getFilePatternsForCategory` | `(categorySrc: string) => string[]` | Get patterns for category (empty if not found) |
| `filenameMatchesCategory` | `(filename: string, categorySrc: string) => boolean` | Case-insensitive filename match |

---

## Motif Translations (`lib/motif-translations.ts`)

**47 translation keys** for motif category display names.

### Exported Constant

```typescript
const motifTranslations: Record<string, string>
```

### Sample Translations

| Key | Display Name |
|-----|-------------|
| `AQUATIC` | Aquatic |
| `BIRDS` | Birds |
| `FARM_ANIMAL` | Farm Animals |
| `AUS_WILDLIFE` | Australian Wildlife |
| `FLOWER_INSERTS` | Flower Inserts |
| `VEHICLES` | Vehicles |
| `ALL_MOTIFS` | All Motifs |

### Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `getMotifCategoryName` | `(key: string) => string` | Get translated name. Falls back to `window.dyo.config.language`, then static map, then key itself |
| `getAllMotifCategoryNames` | `() => Array<{ key: string; name: string }>` | Get all categories with translations |

---

## Middleware (`middleware.ts`)

### `middleware(request: NextRequest): Promise<NextResponse>`

Auth + localization middleware applied to all non-static routes.

**Logic:**
1. Extracts country from `x-vercel-ip-country` or `x-country-code` headers
2. Resolves unit system (metric/imperial) via `resolveUnitSystemFromCountry()`
3. **Protected routes** (`/api/account`, `/api/orders`):
   - Verifies session via `verifySessionFromRequest()`
   - Returns `401 Unauthorised` if no session
4. Sets/updates `unit_system` cookie if resolved system differs from existing
5. Cookie config: `path: '/'`, `sameSite: 'lax'`, `secure: true` (production only)

### `config.matcher`

Applies middleware to all routes **except**: static assets, images, fonts, `_next` internal routes.
