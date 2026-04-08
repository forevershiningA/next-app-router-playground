# Scripts & Tooling

## Overview

The `scripts/` directory contains ~60 Node.js utility scripts for asset conversion, database management, SEO generation, and batch operations. Most are run with `node scripts/<name>.js` or `npx tsx scripts/<name>.ts`.

---

## Data Analysis & Processing

| Script | Purpose | Usage |
|--------|---------|-------|
| `analyze-saved-designs.js` | Analyze saved designs; regenerate `saved-designs-data.ts` | `node scripts/analyze-saved-designs.js` |
| `categorize-saved-designs.js` | Categorize designs from ML exports for programmatic SEO | `node scripts/categorize-saved-designs.js` |
| `categorize-saved-designs-enhanced.js` | Enhanced categorization using filename patterns | `node scripts/categorize-saved-designs-enhanced.js` |
| `dedup-designs.ts` | Smart dedup with word overlap & feature growth detection | `npx tsx scripts/dedup-designs.ts [--dry-run]` |
| `audit-pets-category.js` | Audit Pets category using text analysis & ML | `node scripts/audit-pets-category.js [--with-images] [--apply]` |
| `extract-inscription-phrases.js` | Extract unique inscription phrases from designs | `node scripts/extract-inscription-phrases.js` |
| `extract-short-phrases.js` | Extract reusable short phrases (≤6 words, no names/dates) | `node scripts/extract-short-phrases.js` |
| `generate-unique-slugs.js` | Generate SEO-optimized unique slugs for all designs | `node scripts/generate-unique-slugs.js` |
| `import-reviewed-phrases.js` | Import reviewed phrases and update slug generation | `node scripts/import-reviewed-phrases.js` |
| `generate-saved-designs-ts.js` | Generate `saved-designs-data.ts` from analyzed JSON | `node scripts/generate-saved-designs-ts.js` |
| `generate-screenshot-metadata.js` | Generate metadata JSON for cropped screenshots | `node scripts/generate-screenshot-metadata.js` |

## Database Management

| Script | Purpose | Usage |
|--------|---------|-------|
| `setup-database.js` | Automated DB setup (schema + seed + verify) | `node scripts/setup-database.js` |
| `export-database.js` | Export local PostgreSQL database | `node scripts/export-database.js` |
| `sync-to-neon.js` | Backup & sync local PostgreSQL to Neon | `node scripts/sync-to-neon.js` |
| `import-to-neon.js` | Import SQL dump to Neon | `node scripts/import-to-neon.js` |
| `verify-database.js` | Verify all tables and seed data | `node scripts/verify-database.js` |
| `test-db.js` / `test-db.ts` | Database connection & query tests | `node scripts/test-db.js` |

## Seeding & Migration

| Script | Purpose | Usage |
|--------|---------|-------|
| `seed-test-user.mjs` | Seed test user data | `node scripts/seed-test-user.mjs` |
| `seed-shapes.ts` | Seed shapes table | `npx tsx scripts/seed-shapes.ts` |
| `seed-materials.ts` | Seed materials table | `npx tsx scripts/seed-materials.ts` |
| `seed-additions.ts` | Seed additions table | `npx tsx scripts/seed-additions.ts` |
| `migrate-individual-motifs.js` | Migrate individual motif data | `node scripts/migrate-individual-motifs.js` |
| `migrate-motif-categories.js` | Populate 49 motif categories from data | `npx tsx scripts/migrate-motif-categories.js` |

## Asset Conversion

| Script | Purpose | Usage |
|--------|---------|-------|
| `convert-jpg-to-webp.js` | Batch convert JPG → WebP (85% quality) | `node scripts/convert-jpg-to-webp.js` |
| `convert-textures-to-webp.js` | Convert all JPEG textures → WebP | `node scripts/convert-textures-to-webp.js` |
| `convert-to-gltf.js` | Convert 3D models → glTF format | `node scripts/convert-to-gltf.js` |
| `convert-legacy-design.js` | Convert legacy saved-design JSON → canonical v2026 | `node scripts/convert-legacy-design.js <id> [--mlDir] [--version] [--spec]` |
| `convert-p3d-design.js` | Convert legacy P3D files (monuments) → canonical JSON | `node scripts/convert-p3d-design.js [designId]` |
| `batch-convert-additions.js` | Batch convert FBX/3DS → glTF | `node scripts/batch-convert-additions.js` |
| `batch-convert-saved-designs.js` | Batch convert saved designs format | `node scripts/batch-convert-saved-designs.js` |
| `png-to-glb.js` | PNG → GLB with 3D relief (brightness-based depth) | `node scripts/png-to-glb.js` |

## Screenshot & Thumbnail Generation

| Script | Purpose | Usage |
|--------|---------|-------|
| `batch-screenshot.js` | Batch screenshot generator with anonymization | `node scripts/batch-screenshot.js [--skip-existing] [--category=pets] [--limit=10]` |
| `crop-screenshots.js` | Batch crop screenshots (remove white borders) | `node scripts/crop-screenshots.js` |
| `generate-addition-thumbnails.js` | Generate thumbnails for additions | `node scripts/generate-addition-thumbnails.js` |

> **Note**: `batch-screenshot.js` requires the dev server running on port 3000. Use `npx next dev --turbopack` first.

## SEO & Content Generation

| Script | Purpose | Usage |
|--------|---------|-------|
| `generate-additions-data.js` | Generate additions data from folder structure | `node scripts/generate-additions-data.js` |
| `generate-seo-from-ml-consolidated.js` | Generate SEO data from consolidated ML exports | `node scripts/generate-seo-from-ml-consolidated.js` |
| `generate-seo-json-split.js` | Generate split SEO JSON files | `node scripts/generate-seo-json-split.js` |
| `generate-seo-templates-from-ml.js` | Generate SEO templates from ML data | `node scripts/generate-seo-templates-from-ml.js` |
| `generate-unified-seo-templates.js` | Generate unified SEO templates | `node scripts/generate-unified-seo-templates.js` |
| `generate-sitemap.ts` | Generate XML sitemap | `npx tsx scripts/generate-sitemap.ts` |

## Cache & Utilities

| Script | Purpose | Usage |
|--------|---------|-------|
| `clear-all-caches.js` | Clear Next.js build cache and SVG cache | `node scripts/clear-all-caches.js` |
| `clear-svg-cache.js` | Clear expired SVG cache | `node scripts/clear-svg-cache.js` |
| `svg-cache-stats.js` | Show SVG cache statistics | `node scripts/svg-cache-stats.js` |
| `validate-design-layouts.js` | Validate inscription/motif layouts fit on products | `node scripts/validate-design-layouts.js` |
| `validate-design-layouts-v2.js` | V2 layout validation | `node scripts/validate-design-layouts-v2.js` |
| `report-rollout-summary.js` | Generate rollout summary report | `node scripts/report-rollout-summary.js` |
| `apply-layout-fixes.js` | Apply layout fixes to designs | `node scripts/apply-layout-fixes.js` |

## Python Utilities

| Script | Purpose | Usage |
|--------|---------|-------|
| `fix-pet-false-positives.py` | Fix miscategorized pet designs | `python scripts/fix-pet-false-positives.py` |
| `scan-pet-designs.py` | Scan and reclassify pet designs | `python scripts/scan-pet-designs.py` |

---

## Static Assets (`public/`)

| Directory | Content | Approximate Size |
|-----------|---------|-----------------|
| `public/textures/` | Granite/material WebP textures | ~17 MB |
| `public/shapes/` | SVG headstone outlines | Small |
| `public/additions/` | GLB 3D models + thumbnails | Large |
| `public/motifs/` | Decorative SVGs & PNGs | Medium |
| `public/designs/` | Canonical design JSONs (v2026, v2026-p3d) | Medium |
| `public/hdri/` | HDRI environment maps | ~27 MB |
| `public/fonts/` | Font files | Small |
| `public/emblems/` | Emblem/insignia graphics | ~33 MB |
| `public/png/` | PNG image assets | ~343 MB |
| `public/ml/` | Legacy ML exports & saved designs | Large |
| `public/screenshots/` | Screenshot captures (v2026-3d) | ~186 MB |
| `public/xml/` | Product catalog & pricing XMLs | Small |
| `public/workers/` | Web Worker scripts | Small |
| `public/upload/` | User-uploaded images | Variable |

**Total public assets**: ~1.2 GB

---

## Data Files (`data/`)

| File | Purpose |
|------|---------|
| `additions-parsed.json` | Parsed additions configuration |
| `favorite-designs.json` | User favorite design IDs |
| `hidden-designs.json` | Hidden/archived design IDs (793 entries from dedup) |

---

## Global Styles (`styles/globals.css`)

Tailwind CSS 4 with custom rules:

- Caret color suppressed globally (except inputs/textarea/contenteditable)
- Cursor defaults to `default` except on buttons, links, text inputs
- Button hover effects with shadow/scale transforms
- Link underline animations
- Source directories: `app/`, `components/`, `contexts/`, `lib/`, `ui/`

---

## React Context (`contexts/`)

Single context: **NavigationContext** (`NavigationContext.tsx`)

| Export | Purpose |
|--------|---------|
| `isMobileNavOpen` | Mobile nav open state |
| `setIsMobileNavOpen()` | Set mobile nav state |
| `toggleMobileNav()` | Toggle mobile nav |
| `useNavigation()` | Hook for accessing context |
