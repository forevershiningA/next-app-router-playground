# Copilot Instructions — DYO Headstone Designer

## Project Overview

DYO (Design Your Own) is an interactive 3D headstone/memorial designer at [forevershining.org](https://forevershining.org/). Families select shapes, materials, inscriptions, motifs, photos, and 3D additions, with real-time WebGL visualization and dynamic pricing. The app migrated from a legacy Flash/PHP/Haxe stack (2008–2015) to a modern Next.js + Three.js stack.

## Tech Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript 5.9
- **3D Rendering**: Three.js 0.180 + React Three Fiber 9 + Drei 10
- **State**: Zustand 5 (`lib/headstone-store.ts` is the main store, ~2000+ LOC)
- **Styling**: Tailwind CSS 4 with custom gold theme (`#DEBD68`), Flowbite components
- **Database**: PostgreSQL with Drizzle ORM (schema at `lib/db/schema.ts`)
- **Auth**: JWT via `jose`, bcryptjs for passwords
- **Validation**: Zod 4
- **Package manager**: pnpm (≥8)

## Build, Lint, and Validate

```bash
pnpm dev              # Next.js dev server
pnpm build            # Production build (4GB heap via cross-env)
pnpm lint             # ESLint (flat config, --max-warnings 0)
pnpm lint:fix         # ESLint autofix
pnpm type-check       # tsc --noEmit
pnpm format           # Prettier write
pnpm format:check     # Prettier check
pnpm validate         # type-check + lint + format:check (all three)
```

There is no test suite (no Jest, Vitest, or Playwright). `pnpm build` is the primary validation gate.

### Database Commands

```bash
pnpm db:generate      # Drizzle schema codegen
pnpm db:migrate       # Run migrations
pnpm db:push          # Push schema to DB
pnpm db:studio        # Drizzle Studio GUI
pnpm db:seed-materials # Seed materials table
pnpm db:seed-shapes    # Seed shapes table
```

### CI

GitHub Actions (`.github/workflows/ci.yml`) runs type-check, lint, format:check, and build on PRs/pushes to `main` using pnpm 9 + Node 22.

## Architecture

### App Router Structure

Routes follow the design workflow as step-by-step pages:

```
app/
├── page.tsx                          # Homepage
├── select-product/                   # Step 1: Choose product type
├── select-shape/                     # Step 2: Choose shape
├── select-material/                  # Step 3: Choose stone/texture
├── select-size/                      # Step 4: Set dimensions
├── inscriptions/                     # Step 5: Add text
├── select-motifs/                    # Step 6: Add decorative symbols
├── select-additions/                 # Step 7: Add statues/vases
├── select-images/                    # Upload photos
├── select-border/                    # Plaque borders
├── select-emblems/                   # Plaque emblems (bronze only)
├── check-price/                      # Pricing breakdown
├── designs/[productType]/[category]/[slug]/  # Design gallery (SEO)
├── my-account/                       # User account + saved designs
├── login/                            # Authentication
├── api/                              # API routes
├── _hooks/, _internal/, _ui/         # Colocated private modules
└── shared/                           # Shared utilities
```

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `components/` | React components — selectors, panels, loaders, 3D scene |
| `components/three/` | React Three Fiber components (Scene, models, overlays) |
| `components/three/headstone/` | Monument assembly (ShapeSwapper, HeadstoneBaseAuto, LedgerSlab, KerbsetBorder) |
| `lib/` | Business logic, stores, utilities, pricing, design loading |
| `lib/db/` | Drizzle schema and DB client |
| `lib/auth/` | JWT session management |
| `contexts/` | Single context: `NavigationContext` (mobile nav state) |
| `ui/` | Low-level UI primitives (TailwindSlider, SegmentedControl) |
| `scripts/` | Node.js batch converters, DB seeds, cache tools |
| `public/` | Static assets (~1.2 GB): textures, SVG shapes, GLB models, motif PNGs, designs |
| `createJS/` | **Archived** legacy Flash-era code (reference only, not imported) |
| `haxe/` | **Archived** Haxe/Away3D code (reference only) |
| `legacy/` | **Archived** PHP backend code (reference only) |

### 3D Scene Architecture

The Three.js scene is mounted **once** at the root layout (`components/ConditionalCanvas.tsx` → `ThreeScene.tsx` → `Scene.tsx`) and persists across route navigation. Components react to Zustand store changes.

Scene graph hierarchy:
```
Scene.tsx
├── Lighting (Ambient + Hemisphere + 2 SpotLights)
├── GrassFloor (textured plane with ContactShadows)
├── HeadstoneAssembly
│   ├── ShapeSwapper (SVG → extruded 3D headstone with texture)
│   ├── HeadstoneBaseAuto (pedestal)
│   ├── LedgerSlab (full-monument: horizontal stone surface)
│   └── KerbsetBorder (full-monument: grave plot border)
├── Inscriptions (drei <Text> on stone surface)
├── Motifs (SVG → rasterized canvas texture on plane)
├── Images (photo with ceramic/enamel mask geometry)
├── Additions (GLB models: statues, vases)
├── Emblems (PNG textures on planes, bronze plaques only)
└── OrbitControls
```

`ConditionalCanvas.tsx` loads `ThreeScene` and `CropCanvas` with `next/dynamic({ ssr: false })` to avoid SSR memory issues with Three.js.

### State Management

- **`lib/headstone-store.ts`** (Zustand): All design state — shape, material, dimensions, inscriptions, motifs, additions, images, emblems, pricing, editing targets. ~60+ state properties. All components access state via `useHeadstoneStore((s) => s.field)`.
- **`lib/scene-overlay-store.ts`** (Zustand): UI panel visibility state.
- **`contexts/NavigationContext.tsx`** (React Context): Mobile nav toggle only.

No prop drilling for design state — everything goes through the Zustand store.

### Path Alias

TypeScript path alias `#/*` maps to the project root:
```typescript
import { calculatePrice } from '#/lib/xml-parser';
import { data } from '#/app/_internal/_data';
```

## Domain Concepts

### Product Types

| Type | Description | Key Differences |
|------|-------------|-----------------|
| Headstone (upright) | Single stone with optional base | Standard flow |
| Plaque | Wall-mounted memorial | No base, simplified |
| Bronze Plaque | Metal surface with engravings | Has emblems, borders; no additions |
| Full Monument | Headstone + base + ledger + kerbset | 4-part editing, complex camera |

### Coordinate System

- All positioning uses **millimeters** as the base unit
- Inscription/motif positions are in mm from headstone center (`coordinateSpace: 'mm-center'`)
- Three.js scene scale: SVG paths use `0.01` scale factor, so `unitsPerMeter ≈ 667`
- Z-positioning: headstone surface at `frontZ`, content at `frontZ + 0.05mm`

### Pricing Engine

Prices are computed from XML catalog formulas (`public/xml/en_EN/`), not hardcoded:
- Formula pattern: `"base+rate($q-offset)"` with retail multiplier
- Headstone/base priced by dimension quantity (Width+Height or Width)
- Inscriptions by font height (mm), motifs by height (mm), images by Width+Height
- Color-aware tiers (Gold Gilding, Silver Gilding, Paint Fill)
- Total = headstonePrice + basePrice + ledgerPrice + kerbsetPrice + inscriptionCost + motifCost + imageCost + additionCost

## Legacy Design System

The most complex part of the codebase. Three generations of saved designs must load correctly:

### Design Sources

| Source | Format | Position Units |
|--------|--------|---------------|
| `forevershining` | Legacy JSON | Positions in DPR-scaled physical px from center; motif heights in mm (despite field name `height_px`) |
| `headstonesdesigner` | Legacy JSON | Positions in DPR-scaled physical px; motif heights in design px (convert via `height_px × headstoneHeightMm / init_height`) |
| `bronze-plaque` | Legacy JSON | Positions in mm (stored as `_mm` fields) |
| P3D (haxe) | Binary `.p3d` → converted JSON | Positions in mm from surface center |

### Key Loading Pipeline Files

- **`lib/saved-design-loader-utils.ts`** (~2200+ LOC): Main loader with `convertPositionToMm()`, `resolveFontSizeMm()`, `resolveMotifHeightMm()`, `mapTexture()`, coordinate conversion, and fallback logic.
- **`scripts/convert-saved-design.js`**: Batch converter for legacy → canonical v2026 JSON. Outputs to `public/designs/v2026/`.
- **`scripts/convert-p3d-design.js`**: P3D binary → canonical JSON. Outputs to `public/designs/v2026-p3d/`.

### Critical Design-Loading Knowledge

- `legacy.raw[0]` contains `init_width`/`init_height` (CSS canvas dims) — different from `scene.viewportPx` (page viewport dims)
- DPR is deterministic: use stored `legacySavedDprRaw` or default to `1`
- Position conversion: `mmPerPxY = headstoneHeightMm / (init_height × DPR)`
- Font sizes from CSS strings (e.g., `"40px Arial"`) use a different ratio than position conversion
- `Glory-Black-2.webp` (1540 bytes) is intentionally a tiny solid black texture for laser etching — do NOT replace it
- `mapTexture()` must be called before `enforceTexture()` in the canonical loading path
- Motif flip convention: `flipY=false` / `1` = NOT flipped, `flipY=true` / `-1` = flipped
- P3D images render with `maskShape: ''` (no ceramic oval base)

## Conventions

### Component Patterns

- PascalCase filenames for components (e.g., `ShapeSelector.tsx`, `MotifModel.tsx`)
- `'use client'` directive at top of client components; server components are the default
- All 3D components are client components
- Loader pattern: `*Loader.tsx` components (e.g., `MaterialsLoader`, `MotifsLoader`) that fetch data on mount
- Data cancellation pattern with `useEffect` cleanup:
  ```typescript
  useEffect(() => {
    let cancelled = false;
    loadData().then((data) => { if (!cancelled) setState(data); });
    return () => { cancelled = true; };
  }, [deps]);
  ```

### ESLint Rules

- `@typescript-eslint/no-explicit-any`: warn
- `@typescript-eslint/no-unused-vars`: warn (prefix with `_` to suppress)
- `react-hooks/exhaustive-deps`: warn
- Ignored directories: `legacy/`, `docs/`, `scripts/`, `public/`

### Vercel Deployment

- `outputFileTracingExcludes` in `next.config.ts` excludes ~1.2GB of static assets from serverless bundles — this is critical to stay under Vercel's 250MB limit
- Large static data modules (e.g., `saved-designs-data.ts` at 2.7MB) must use dynamic `import()` in server components and `useEffect` in client components, not top-level static imports
- Screenshots stored as data URLs in DB on Vercel (no filesystem writes at runtime)

### Texture System

- Real textures are 150KB–330KB named `.webp` files (e.g., `African-Black.webp`, `Blue-Pearl.webp`)
- Numbered textures (`01.webp`–`35.webp`) in `/textures/forever/l/` are ~2KB placeholder files
- Texture paths may have dimension suffixes (e.g., `White-Carrara-600-x-600.webp`) that get stripped by regex

### Full Monument Dimension Sync Rules

When one part changes, related parts auto-sync:
- `kerbsetWidth = baseWidth` (same)
- `ledgerWidth = baseWidth - 200mm`
- `baseHeight = kerbHeight + 100mm`
