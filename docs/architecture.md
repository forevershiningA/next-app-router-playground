# Architecture Overview

## System Design

DYO is a **step-by-step memorial designer** that guides families through product customization with real-time 3D visualization. The app migrated from a legacy Flash/PHP/Haxe stack (2008–2015) to a modern Next.js + Three.js stack.

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER                                  │
│                                                                 │
│  ┌──────────────┐  ┌───────────────────┐  ┌──────────────────┐ │
│  │  App Router   │  │  3D Canvas (R3F)  │  │  Zustand Store   │ │
│  │  (Pages/UI)   │──│  (Persistent)     │──│  (Global State)  │ │
│  └──────┬───────┘  └───────────────────┘  └────────┬─────────┘ │
│         │                                          │           │
│         │  API Routes (Next.js)                    │           │
│         ▼                                          ▼           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Server Layer                           │  │
│  │  ┌─────────────┐  ┌────────────┐  ┌──────────────────┐  │  │
│  │  │ Auth (JWT)   │  │ Projects   │  │ XML Catalog      │  │  │
│  │  │ Middleware   │  │ Orders     │  │ Pricing Engine   │  │  │
│  │  └──────┬──────┘  └─────┬──────┘  └──────────────────┘  │  │
│  │         │               │                                │  │
│  │         ▼               ▼                                │  │
│  │  ┌──────────────────────────────┐                        │  │
│  │  │   PostgreSQL (Drizzle ORM)   │                        │  │
│  │  │  Accounts, Projects, Orders  │                        │  │
│  │  └──────────────────────────────┘                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Architectural Decisions

### 1. Persistent 3D Scene

The Three.js canvas is mounted **once** at the root layout (`ClientLayout` → `ConditionalCanvas` → `ThreeScene` → `Scene`) and persists across all route navigations. This avoids expensive WebGL context recreation and preserves the user's design state.

Routes control canvas **visibility**, not mounting:
- **Canvas visible**: `/select-size`, `/select-material`, `/select-additions`, `/select-motifs`, `/select-border`, `/select-emblems`, `/inscriptions`, `/select-images`
- **Canvas hidden**: `/`, `/designs/*`, `/check-price`, `/select-product`, `/select-shape`, `/my-account`, `/products/*`

### 2. Zustand as Single Source of Truth

All design state lives in one large Zustand store (`lib/headstone-store.ts`, ~2000+ LOC). Both the React UI and the Three.js scene subscribe to the same store, ensuring consistency without prop-drilling or context providers.

### 3. XML-Based Product Catalogs

Product definitions, pricing formulas, and configuration come from XML files in `/public/xml/`. The `xml-parser.ts` module parses these into typed structures. This preserves compatibility with the legacy system's data format.

### 4. Step-by-Step Wizard Flow

The design process follows a linear wizard pattern mapped to URL routes:

```
/select-product → /select-shape → /select-material → /select-size
       → /inscriptions → /select-motifs → /select-additions
       → /select-images → /select-border → /select-emblems → /check-price
```

Each step's page renders a selector panel alongside the persistent 3D canvas.

### 5. Server/Client Component Split

- **Server Components**: Data-fetching pages (`/designs`, `/select-product`), SEO landing pages (`/products`)
- **Client Components**: Interactive forms (`/login`, `/account`), 3D scene, selector panels
- **Database fallbacks**: Root layout gracefully handles missing `DATABASE_URL` using `app/_internal/_data.ts`

## Directory Map

```
project-root/
├── app/                    # Next.js App Router (pages, layouts, API routes)
│   ├── api/                # REST API endpoints
│   ├── _internal/          # Private: fallback data, loaders
│   ├── _ui/                # Private: app-level UI (HomeSplash)
│   ├── designs/            # Design gallery (SEO)
│   ├── select-*/           # Step pages (shape, material, size, etc.)
│   ├── inscriptions/       # Text editing step
│   ├── my-account/         # User dashboard
│   └── products/           # SEO landing pages (no 3D canvas)
├── components/             # React components
│   ├── three/              # R3F components (Scene, models, overlays)
│   │   └── headstone/      # Monument assembly parts
│   ├── system/             # Infrastructure components
│   └── ui/                 # Reusable UI pieces
├── lib/                    # Business logic
│   ├── db/                 # Drizzle ORM schema + client
│   ├── auth/               # JWT session management
│   ├── headstone-store.ts  # Main Zustand store
│   └── *.ts                # Pricing, loaders, utilities
├── ui/                     # Low-level UI primitives
├── contexts/               # React contexts (NavigationContext only)
├── styles/                 # Global CSS (Tailwind)
├── scripts/                # Node.js batch tools (~60 scripts)
├── public/                 # Static assets (~1.2 GB)
│   ├── textures/           # Material textures (WebP)
│   ├── shapes/             # SVG headstone outlines
│   ├── additions/          # GLB 3D models
│   ├── motifs/             # Decorative SVGs & PNGs
│   ├── designs/            # Canonical design JSONs
│   ├── hdri/               # Environment maps
│   └── xml/                # Product catalogs & pricing
├── drizzle/                # Database migrations
├── createJS/               # [ARCHIVED] Legacy Flash-era code
├── haxe/                   # [ARCHIVED] Haxe/Away3D code
└── legacy/                 # [ARCHIVED] PHP backend code
```

## Product Types

| Product ID | Type | 3D Components |
|-----------|------|---------------|
| Headstone | Upright tablet | ShapeSwapper + HeadstoneBaseAuto |
| Plaque (Granite) | Flat plaque | ShapeSwapper only |
| Plaque (Bronze) | Bronze plate | ShapeSwapper + borders + emblems |
| Full Monument | Complete grave | ShapeSwapper + Base + LedgerSlab + KerbsetBorder |
| Slant Marker | Angled tablet | ShapeSwapper (tilted) + Base |

## Design Data Flow

```
User Interaction → Zustand Store Action → Store State Update
                                              │
                           ┌──────────────────┼──────────────────┐
                           ▼                  ▼                  ▼
                     React UI Panel     3D Scene (R3F)      Pricing Engine
                     (re-renders)       (re-renders mesh)   (recalculates)
```

When a user saves their design, the full Zustand state is serialized as JSON via `project-serializer.ts` and stored in the `projects.designState` JSONB column in PostgreSQL.
