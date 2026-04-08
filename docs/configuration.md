# Configuration

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/headstonesdesigner` |
| `SESSION_SECRET` | JWT signing secret (change in production!) | `your-secret-key-here` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Public base URL | `https://forevershining.org` |
| `NEXT_JS_SHOW_BOUNDARIES` | Debug layout boundaries | `false` |
| `WEBPACK_PARALLELISM` | Webpack build parallelism | Auto |

Copy `.env.local.example` to `.env.local` to get started.

---

## Package Scripts

### Development

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Production build (4GB heap via cross-env) — **primary validation gate** |
| `pnpm start` | Start production server |

> **Tip**: Use `npx next dev --turbopack` instead of `pnpm dev` to avoid middleware EvalError with Edge Runtime.

### Code Quality

| Command | Description |
|---------|-------------|
| `pnpm lint` | ESLint (flat config, `--max-warnings 0`) |
| `pnpm lint:fix` | ESLint with autofix |
| `pnpm type-check` | `tsc --noEmit` |
| `pnpm format` | Prettier write |
| `pnpm format:check` | Prettier check |
| `pnpm validate` | All three: type-check + lint + format:check |

### Database

| Command | Description |
|---------|-------------|
| `pnpm db:generate` | Drizzle schema codegen |
| `pnpm db:migrate` | Run migrations |
| `pnpm db:push` | Push schema to DB (dev only) |
| `pnpm db:studio` | Drizzle Studio GUI |
| `pnpm db:seed-materials` | Seed materials table |
| `pnpm db:seed-shapes` | Seed shapes table |
| `pnpm db:setup` | Full database setup |
| `pnpm db:verify` | Verify tables and seed data |
| `pnpm db:export` | Export database |
| `pnpm db:import` | Import database |
| `pnpm db:sync` | Sync to Neon |

### Cache

| Command | Description |
|---------|-------------|
| `pnpm cache:clear` | Clear expired SVG cache |
| `pnpm cache:clear-all` | Clear all caches (Next.js build + SVG) |
| `pnpm cache:stats` | Show SVG cache statistics |

---

## Next.js Configuration (`next.config.ts`)

### Key Settings

- **React Strict Mode**: Enabled
- **Powered By Header**: Disabled
- **Page Extensions**: `.js`, `.jsx`, `.mdx`, `.ts`, `.tsx`
- **ESLint/TypeScript**: Build errors ignored (validated separately via `pnpm validate`)

### Experimental Features

```typescript
experimental: {
  useCache: true,                    // Enable 'use cache' directives
  optimizePackageImports: [          // Tree-shake Three.js packages
    'three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'
  ]
}
```

### Output File Exclusions

Large static assets are excluded from serverless functions to stay within size limits:

| Path | Size | Reason |
|------|------|--------|
| `public/ml/**/*` | — | Legacy ML exports |
| `public/designs/**/*` | — | Design JSONs |
| `public/png/**/*` | ~343 MB | PNG assets |
| `public/emblems/**/*` | ~33 MB | Emblem graphics |
| `public/hdri/**/*` | ~27 MB | HDRI environment maps |
| `public/saved-designs/**/*` | ~20 MB | Saved designs |
| `public/textures/**/*` | ~17 MB | Texture files |
| `node_modules/@img/**/*` | — | Sharp binaries |
| `node_modules/three/**/*` | — | Three.js (client-only) |

### Image Optimization

- **Formats**: AVIF, WebP
- **Quality Levels**: 75, 90, 100
- **Remote Patterns**: `**.vercel.app` (HTTPS)

### Cache Headers

| Pattern | Cache Duration |
|---------|---------------|
| `/xml/*`, `/json/*` | 1 day, stale 7 days |
| `/shapes/*` | 1 year, immutable |
| `/ml/*` | 7 days, stale 30 days |

---

## TypeScript (`tsconfig.json`)

| Setting | Value |
|---------|-------|
| Target | ES5 |
| Module | ESNext |
| Resolution | Node |
| Strict | true |
| JSX | preserve |
| Incremental | true |
| Path Alias | `#/*` → `./*` |

**Excluded**: `node_modules`, `ml`, `legacy`, `docs`, `archive`, `.backup`

---

## Tailwind CSS (`tailwind.config.js`)

### Theme

- **Primary Color**: `#DEBD68` (gold) with full 50–900 shade palette
- **Font Family**: Playfair Display (serif) via CSS variable
- **Drop Shadows**: Custom enhanced scale with higher opacities (0.4–0.7)

### Content Paths

```
app/**/*.{js,ts,jsx,tsx,mdx}
components/**/*.{js,ts,jsx,tsx,mdx}
ui/**/*.{js,ts,jsx,tsx,mdx}
lib/**/*.{js,ts,jsx,tsx,mdx}
node_modules/flowbite/**/*.js
```

### Plugin

- **Flowbite**: UI component library

---

## ESLint (`eslint.config.js`)

### Base Configs
- Next.js core-web-vitals
- Next.js TypeScript

### Rules
| Rule | Level |
|------|-------|
| `@typescript-eslint/no-explicit-any` | warn |
| `@typescript-eslint/no-unused-vars` | warn (ignores `_` prefix) |
| `react-hooks/exhaustive-deps` | warn |

### Ignored
`legacy/`, `docs/`, `scripts/`, `public/`, `.next/`, `node_modules/`

---

## CI/CD (`.github/workflows/ci.yml`)

### Triggers
- Push to `main`
- Pull requests to `main`

### Job 1: Code Quality
- **Runner**: ubuntu-latest
- **Node**: 22, **pnpm**: 9
- **Steps**: Type check → Lint → Format check

### Job 2: Build
- **Runner**: ubuntu-latest
- **Node**: 22, **pnpm**: 9
- **Steps**: Frozen lockfile install → Build

---

## PostCSS (`postcss.config.js`)

Single plugin: `@tailwindcss/postcss` (Tailwind CSS v4)

---

## Prettier (`prettier.config.js`)

Configured with Tailwind plugin for class sorting.

---

## Middleware (`middleware.ts`)

- **Protected**: `/api/account`, `/api/orders` (require valid JWT session)
- **Unit system**: Resolves from `x-vercel-ip-country` header → sets `unit_system` cookie
- **Matcher**: All routes except static assets
