# Next-DYO (Design Your Own) Headstone Application

**Last Updated:** 2026-06-29
**Tech Stack:** Next.js 15.5.7, React 19, Three.js, R3F (React Three Fiber), Zustand, TypeScript, Tailwind CSS, PostgreSQL (local PostgreSQL + remote home.pl PostgreSQL), Nodemailer + React Email (email system), Playwright (dev screenshots), **Vitest 4.1.8** (unit tests), **Playwright 1.59.1** (E2E tests)

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Key Directories](#key-directories)
4. [Core Components](#core-components)
5. [Sidebar Navigation & Full-Screen Panels](#sidebar-navigation--full-screen-panels)
6. [State Management](#state-management)
7. [3D Rendering Pipeline](#3d-rendering-pipeline)
8. [Coordinate System](#coordinate-system)
9. [Product Types & Rendering](#product-types--rendering)
10. [Rock Pitch Base Feature](#rock-pitch-base-feature)
11. [Slant Headstone Feature](#slant-headstone-feature)
12. [Design Gallery & SEO](#design-gallery--seo)
13. [Hero Search Bar](#hero-search-bar)
14. [Check Price Feature](#check-price-feature)
15. [Pricing System](#pricing-system)
16. [Save Design Feature](#save-design-feature)
17. [My Account System](#my-account-system)
18. [Authentication System](#authentication-system)
19. [Email System](#email-system)
20. [File Storage System](#file-storage-system)
21. [Database & Catalog System](#database--catalog-system)
22. [ML Smart Search](#ml-smart-search)
23. [Load Design Popup](#load-design-popup)
24. [P3D Format & Converter](#p3d-format--converter)
25. [Performance Considerations](#performance-considerations)
26. [Memory Management](#memory-management)
27. [Common Issues & Solutions](#common-issues--solutions)
28. [UI Theming & Primary Color](#ui-theming--primary-color)
29. [Design Management Scripts](#design-management-scripts)
30. [Development Workflow](#development-workflow)
31. [Stainless Steel Plaque — Mounting Holes](#stainless-steel-plaque--mounting-holes)
32. [Unit Testing (Vitest)](#unit-testing-vitest)
33. [E2E Testing (Playwright)](#e2e-testing-playwright)
34. [Design Gallery Search UX (2026-06-03)](#current-status-2026-06-03--design-gallery-search-ux--sidebar-redesign)
35. [Design Gallery Pixel-Perfect Polish (2026-06-04)](#current-status-2026-06-04--design-gallery-pixel-perfect-polish)
36. [Audit Fixes: Protected Sharing, Security, Tests, Migrations (2026-06-18)](#current-status-2026-06-18--audit-fixes-protected-sharing-security-tests-migrations)
37. [Vercel Build Payload Optimization (2026-06-19)](#current-status-2026-06-19--vercel-build-payload-optimization)
38. [Minimal Email Template Redesign (2026-06-19)](#current-status-2026-06-19--minimal-email-template-redesign)
39. [3D Designer Material and Panel Polish (2026-06-22)](#current-status-2026-06-22--3d-designer-material-and-panel-polish)
40. [Stainless Steel Headstones Initial Catalog Implementation (2026-06-22)](#current-status-2026-06-22--stainless-steel-headstones-initial-catalog-implementation)
41. [Meadow Ground Texture Repeat Standardization (2026-06-24)](#current-status-2026-06-24--meadow-ground-texture-repeat-standardization)
42. [Stainless Headstone Motif Silhouette Rendering (2026-06-25)](#current-status-2026-06-25--stainless-headstone-motif-silhouette-rendering)
43. [Saved Design Email Delivery Fix (2026-06-26)](#current-status-2026-06-26--saved-design-email-delivery-fix)
44. [Stainless Headstone Inscription Stencil Bridge Investigation (2026-06-27)](#current-status-2026-06-27--stainless-headstone-inscription-stencil-bridge-investigation)
45. [Stainless Headstone UI and Rendering Update (2026-06-29)](#current-status-2026-06-29--stainless-headstone-ui-and-rendering-update)

---

## Current Status (2026-06-29) - Stainless Headstone UI and Rendering Update

This session continued the stainless steel headstone work after comparing the current canvas screenshots, `Cook headstone.jpg`, and the old DYO spec documents.

### Legacy Stainless Specs Read

Two legacy Word `.doc` specs were extracted via binary text runs because `pandoc` cannot read `.doc` and Word COM automation was blocked in the shell session.

| File | Key Knowledge |
|------|---------------|
| `dyo-specs-reflective-stainless-headstones-2010-12-16.doc` | Product code `23`; Stainless Steel Light Reflective Headstone; pricing based on `width + height`; size range `300-1200mm`; no ratio limits; supports 12 shapes: `gable`, `curved gable`, `peak`, `curved peak`, `cropped peak`, `curved top`, `serpentine`, `half round`, `gothic`, `left wave`, `right wave`, `square/rectangle`; fonts limited to `Arial`, `Franklin-Demi`, `French Script`, `Lucida Calligraphy`; note required that other shapes/sizes are special options. |
| `dyo-specs-transmitting-stainless-plaques-2010-12-06.doc` | Product code `39`; Stainless Steel Light Transmitting Plaque; comes with inbuilt stand; pseudo-shapes `Plain` (`100x100-600x600`) and `Border` (`175x175-600x600`); border options include `Flush Border Transmitting`, `Raised Border Transmitting`, and `Raised Border - No Pattern`. |

Important interpretation:
- Stainless steel headstones and stainless plaques should stay separate in the UI and renderer.
- The current app product IDs for stainless headstones are still `1` and `23`; product `52` is the existing stainless plaque path.
- Product `23` from the old spec is the reflective stainless headstone.

### Designer Panel Refresh

The left-sidebar designer panels were refreshed to follow the Select Product card/list styling:

| Area | Current Direction |
|------|-------------------|
| Select Shape | Updated toward the same card/list styling as Select Product. |
| Select Material | Should not be available for stainless steel headstones. |
| Select Size | Updated toward the current sidebar style. |
| Add Your Inscription | Updated toward the current sidebar style. |
| Add Your Image | Sidebar, crop section, and selected-image panel updated toward the current style. |
| Select Additions | Should not be available for stainless steel headstones. |
| Select Motifs | Sidebar and selected-motif panel updated toward the current style. |

Stainless steel headstone workflow rule:
- Hide or skip Select Material and Select Additions for stainless steel headstone products.
- `components/DesignerNav.tsx`, `app/select-shape/_ui/ShapeSelectionGrid.tsx`, and `lib/headstone-store.ts` contain related navigation/flow changes.

Canvas label rule:
- The top-left canvas label should include both product name and selected shape name when available.

### Stainless Rim and Material Rendering

The stainless headstone now has a generated raised border/rim based on the same outline points used by the selected SVG shape.

| File | Current Behavior |
|------|------------------|
| `components/SvgHeadstone.tsx` | Adds private `StainlessHeadstoneRim`, using `TubeGeometry` along `apiData.outlinePoints`. It renders a subtle raised stainless bead and a thin darker inset groove. Geometry/materials are disposed in cleanup. |
| `components/SvgHeadstone.tsx` | Adds `showStainlessRim?: boolean`. When true, stainless headstone body material uses the same clean physical-metal settings as the raised rim instead of the older generated brushed canvas maps. |
| `components/three/headstone/ShapeSwapper.tsx` | `isStainlessSteel` includes product IDs `1`, `23`, and `52`, but `showStainlessRim` is enabled only for product IDs `1` and `23` so plaque product `52` is not affected. |

Current stainless headstone visual target:
- Use the Cook reference look: reflective steel face, raised rim following the silhouette, and a thin darker inset/shadow line.
- The first rim pass was too heavy and too black; it was reduced to a smaller, more inset rim and a thinner grey groove.
- The headstone face now uses the same clean PBR steel settings as the rim for product IDs `1` and `23`.

### Stainless Inscription Bridge Status

Stencil bridge masking for stainless inscriptions is still the major unresolved rendering issue.

Current state:
- `components/HeadstoneInscription.tsx` contains stainless-specific bridge-mask attempts.
- Screenshots still showed bridge masks not convincingly cutting the glyph counters, especially examples like `o` and `p` in `Jose`.
- Rectangular overlay masks are not a reliable final approach because Troika SDF text does not expose true glyph counter geometry.

Recommended next implementation remains:
- Use glyph-path or raster-alpha processing for stainless inscriptions.
- Apply bridge cuts directly into the text alpha/mask, rather than placing separate rectangles in front of the inscription.
- Keep fabrication-oriented constraints in mind: island detection, minimum bridge width, cut gap, stroke width, and eventual SVG/DXF export.

### Known Runtime Issue Fixed/Investigated

There was a maximum update depth issue when an image was selected and clicking Next caused route/section switching between Add Your Image and Select Additions. The stainless-headstone flow now needs to keep Select Additions unavailable/skipped for stainless products, which reduces one trigger path for that loop.

### Recent Verification

The current stainless rim/material changes passed:

```bash
pnpm exec tsc --noEmit
pnpm lint
```

Known screenshot gap:
- A fresh automated Playwright screenshot was not captured in the latest pass because `localhost:3001` did not respond within the short timeout.
- Manual screenshot review drove the rim tuning.

---

## Current Status (2026-06-27) - Stainless Headstone Inscription Stencil Bridge Investigation

Flash reference screenshot for the stainless steel headstone inscription preview shows stencil-safe text: enclosed counters in letters such as `o`, `b`, `e`, and similar glyphs are opened near the top so cut-out islands do not fall out after laser cutting.

### What Was Tried

| File | Change |
|------|--------|
| `components/HeadstoneInscription.tsx` | Added stainless-headstone detection for product IDs `1` and `23`, plus headstone catalogs with `formula="Steel"` |
| `components/HeadstoneInscription.tsx` | Removed the normal black outline from stainless headstone inscriptions so text does not look artificially bold |
| `components/HeadstoneInscription.tsx` | Added a Troika `caretPositions`-based bridge-mask preview attempt for counter glyphs (`o`, `b`, `e`, `a`, `d`, `p`, `q`, `B`, `O`, `P`, `R`, `8`, etc.) |
| `components/HeadstoneInscription.tsx` | Tried material/depth changes for the bridge masks: smaller masks, `meshBasicMaterial`, higher `renderOrder`, `depthTest={false}`, and `depthWrite={false}` |

### Current Result

The boldness issue is partly addressed by removing the stainless text outline, but the bridge masking approach is **not visually correct**. The latest `screen.png` still shows thin grey vertical bars over the letters rather than convincing cut-open stencil gaps matching the Flash reference.

Do not treat the current bridge-mask overlay as complete.

### Why The Current Approach Is Weak

- The current inscription renderer uses `@react-three/drei` / Troika SDF text, not real glyph path geometry.
- The attempted masks are rectangular overlays positioned from per-character caret bounds, so they do not know the actual counter shape inside each glyph.
- Because they are separate planes above the text, they can look like extra strokes rather than subtractive cut-outs.

### Recommended Next Implementation

Replace the rectangular overlay attempt with a stainless-only raster/SDF or path-based text treatment:

- Render stainless inscription text into a canvas texture using the selected font.
- Apply bridge cuts directly into the alpha mask before creating the texture, so the holes are actually transparent/surface-colored.
- Position bridge cuts per glyph using measured text metrics or a glyph path library, not just Troika caret bounds.
- Longer-term fabrication work should still use true glyph path processing, island detection, minimum bridge-width validation, and SVG/DXF export.

Verification after the attempted code changes:

```bash
pnpm exec tsc --noEmit
pnpm exec eslint components\HeadstoneInscription.tsx
```

TypeScript passed. ESLint on `components/HeadstoneInscription.tsx` had no errors, only pre-existing warnings in that file.

---

## Current Status (2026-06-26) - Saved Design Email Delivery Fix

Saved Design confirmation emails were verified working again on the live site after moving the save-flow email send out of an untracked fire-and-forget promise.

### What Changed

| File | Change |
|------|--------|
| `app/api/projects/route.ts` | Replaced the fire-and-forget `sendEmail(...).catch(...)` call with a Next.js `after(async () => { ... })` callback |
| `app/api/projects/route.ts` | Added explicit result checking so failed sends log `[api/projects] Email send failed: ...` |

Root cause:
- The save endpoint returned `NextResponse.json({ project: summary })` immediately after starting `sendEmail()`.
- On Vercel/serverless, work not awaited or registered with `after()` can be frozen or terminated after the response is sent.
- `STARTER.md` already documented this as a pending risk from the April email work; the live failure matched that risk.

Current behavior:
- The project save response still returns quickly.
- Screenshot/file uploads continue to run in their existing `after()` callback.
- Saved-design email sending now also runs in an `after()` callback, so Vercel keeps it attached to the request lifecycle.
- If SMTP is missing or rejects the message, logs should now include either the existing `[Email] Skipping send ... no SMTP host configured` warning or `[api/projects] Email send failed: ...`.

Live verification:
- After deployment, saving a design on the live site successfully delivered the Saved Design email.

Verification before deployment:

```bash
pnpm exec tsc --noEmit
pnpm lint
```

Related note:
- Quote-table styling changes are independent of delivery. They only affect rendered email HTML after `sendEmail()` runs.
- If saved-design emails fail again, first check Vercel Runtime Logs and Production env vars: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` or country-specific `SMTP_AU_*`.

---

## Current Status (2026-06-25) - Stainless Headstone Motif Silhouette Rendering

Stainless steel headstone motifs were updated after comparing `screen.png` from the current implementation with the old Flash reference. The old/current detailed line-art duck motif would imply many tiny stainless cuts. The desired behavior is a single filled outer shape: trace the bitmap's outside contour, make the interior solid black/opaque, and preview that as stainless steel.

### What Changed

| File | Change |
|------|--------|
| `components/three/MotifModel.tsx` | Adds stainless-specific motif detection for product IDs `1` and `23`, plus any headstone catalog with `formula="Steel"` |
| `components/three/MotifModel.tsx` | Splits normal motif masking (`applyLineArtAlphaMask`) from stainless silhouette masking (`applySolidSilhouetteMask`) |
| `components/three/MotifModel.tsx` | Stainless motifs now render with a metallic `meshPhysicalMaterial` and subtle contact shadow instead of the standard flat `meshBasicMaterial` |

Current stainless motif behavior:
- Applies to Stainless Steel Light Transmitting Headstone (`productId === '1'`) and Stainless Steel Light Reflective Headstone (`productId === '23'`).
- SVG motif assets are still rasterized to a canvas, but stainless products now use a flood-fill silhouette pass:
  - pixels reachable from the bitmap border and considered transparent/near-white become background;
  - everything not reachable from the outside becomes the solid motif mask;
  - the final mask is white RGB with alpha `255` for the silhouette and `0` for background.
- The resulting mask is displayed in stainless silver (`#e4e8ea`) using high metalness, clearcoat, stronger environment response, and polygon offset.
- A slightly enlarged dark mask behind the motif provides a contact-shadow/raised-piece cue.

Why this matters:
- The customer-facing preview now communicates one stainless motif shape, not dozens of fine cut lines.
- It better matches a manufacturable interpretation for stainless steel motifs where internal feather/eye/detail strokes should not be individually cut.
- Non-stainless products keep the previous line-art/luminance-alpha behavior.

Known limitation:
- The silhouette pass assumes the motif has a mostly closed outer contour. If the outer line has gaps, the outside flood fill can leak into the figure and prevent the silhouette from filling correctly.
- If that happens, add a small close-gaps/dilation pass before flood fill, or use an explicit silhouette asset for that motif category.

Verification:

```bash
pnpm exec tsc --noEmit
pnpm lint
```

Dev server note:
- `pnpm dev -p 3001` was started successfully after correcting the argument syntax from `pnpm dev -- -p 3001` to `pnpm dev -p 3001`.
- The running app responded with HTTP `200` at `http://localhost:3001`.

Working-tree note:
- `screen.png` is a local reference/screenshot file and may show as modified. Do not commit it unless intentionally preserving the latest visual evidence.

---

## Current Status (2026-06-24) - Meadow Ground Texture Repeat Standardization

The meadow scenery grass floor was corrected so it no longer becomes visibly pixelated on close camera angles, especially for smaller bronze plaques.

### What Changed

| File | Change |
|------|--------|
| `components/three/Scene.tsx` | `GrassFloor` now uses the full grass textures (`grass_color.webp`, `grass_normal.webp`, `grass_ao.webp`) with `THREE.RepeatWrapping` and a single fixed repeat value |

Current grass-floor behavior:
- The grass repeat is now static across product sizes.
- `grassRepeat` is fixed at `144` for every product, instead of changing with plaque/headstone size.
- This keeps the ground sampling stable between 600×600 mm headstones and 300×200 mm bronze plaques.
- The outback floor remains separate and unchanged.

Why this mattered:
- The previous size-dependent repeat made the plaque view sample the meadow texture too coarsely at close range.
- A fixed repeat density keeps the same visual pattern and prevents the floor from blowing up into visible texels when the camera autofits smaller products.

Verification:
- `pnpm exec eslint components/three/Scene.tsx` still passes with the existing unrelated warning about the unused `shapeUrl` binding in the same file.

---

## Current Status (2026-06-22) - Stainless Steel Headstones Initial Catalog Implementation

This batch adds the first implementation slice for legacy stainless steel headstones, using `pricing-au.xml` as the precursor catalog source and the existing traditional headstone geometry as the initial 3D shape set.

### Implemented Products

The first pass intentionally covers only the two requested products:

| Product ID | Product | Source in `pricing-au.xml` |
|------------|---------|----------------------------|
| `1` | Stainless Steel Light Transmitting Headstone | `D-X-HS-SS-LT-XX` |
| `23` | Stainless Steel Light Reflective Headstone | `D-X-HS-SS-LR-XX` |

Current catalog files:

| File | Purpose |
|------|---------|
| `public/xml/catalog-id-1.xml` | Current-format catalog for Stainless Steel Light Transmitting Headstone |
| `public/xml/catalog-id-23.xml` | Current-format catalog for Stainless Steel Light Reflective Headstone |

Both catalog files:
- Use the 11 traditional headstone shapes as the initial shape set.
- Use stainless material swatches from `/textures/forever/l/*ss-swatch.webp`.
- Include the stainless headstone base product `26` as a nested `type="base"` product so base pricing is picked up by `parseCatalogXML()`.
- Include postage/fixing products `44` and `45`.
- Use `pricing-au.xml` formulas and multipliers for the main product and base.

### Product Selection

| File | Change |
|------|--------|
| `app/_internal/_data.ts` | Adds product cards for IDs `1` and `23` under `headstones` |
| `app/select-product/page.tsx` | Adds fallback descriptions because language XML does not yet have dedicated description tags |
| `public/webp/products/APP_ID_1-*.webp` | Generated product card images from `Blomfield headstone.jpg` |
| `public/webp/products/APP_ID_23-*.webp` | Generated product card images from `Cook headstone.jpg` |

Reference source images currently exist in the working tree:
- `Blomfield headstone.jpg`
- `Abela headstone inlay.jpg`
- `Cook headstone.jpg`

Do not assume those root JPG files should be committed unless they are intentionally kept as source/reference assets. The generated `public/webp/products/APP_ID_1-*` and `APP_ID_23-*` files are the app-facing product card assets.

### Stainless Headstone Rendering Fix

Initial screenshot review (`screen.png`) showed the new stainless steel headstones rendering as plain matte grey. Root cause: the renderer only treated product `52` as stainless steel, so product IDs `1` and `23` fell through to the default non-metal headstone material.

| File | Change |
|------|--------|
| `components/three/headstone/ShapeSwapper.tsx` | `isStainlessSteel` now includes product IDs `1`, `23`, and `52` |
| `components/three/headstone/HeadstoneBaseAuto.tsx` | Bases using `ss-swatch` textures now use a `MeshPhysicalMaterial` with metalness, clearcoat, roughness, and stronger environment response |

Important behavior:
- Product `1` uses `high-polished-ss-swatch.webp` in the XML, so it enters the polished stainless branch.
- Product `23` uses `brushed-ss-swatch.webp`, so it enters the brushed stainless branch.
- The upright and base now use stainless PBR treatment; there is still no dedicated stainless headstone mesh geometry.

### Inscription Entries

The old stainless inscription products existed in `pricing-au.xml` but were missing from the current AU inscription XML. Without these entries, parser smoke tests fell back and logged missing inscription IDs.

| File | Change |
|------|--------|
| `public/xml/au_EN/inscriptions.xml` | Adds compact products `2` and `41` with old first-60-free formulas |

Mapped inscription products:

| ID | Meaning | Pricing |
|----|---------|---------|
| `2` | Stainless Steel Inscription Reflective (first 60 free) | `0.00+0($q-0)` to 60, then `0.00+1.60($q-60)` at multiplier `1.25` |
| `41` | Stainless Steel Inscription Transmitting (first 60 free) | `0.00+0($q-0)` to 60, then `0.00+3.20($q-60)` at multiplier `1.25` |

Both use `min_height="7"`, `max_height="300"`, and `init_height="20"` from the old pricing/catalog constraints.

### What Is Not Implemented Yet

This batch is only catalog + initial rendering support. It does not implement the candidate R&D/manufacturing work package from `ForeverShining_SoftwareSpecificGuide_FY2026.docx`.

Still pending:
- Laser-cut bridge-safe text geometry.
- Enclosed glyph island detection.
- Minimum bridge width / cut gap / stroke width validation.
- SVG/DXF fabrication export for stainless steel headstones.
- Supplier/fabricator validation table.
- Dedicated stainless headstone models or construction-specific light-transmitting/backing geometry.
- Product-specific language XML description tags.
- Broader migration of products `25`, `29`, `131`, or the stainless base as an independently selectable product.

### Verification

Passed:

```bash
pnpm exec tsc --noEmit
pnpm lint
```

Parser/catalog smoke test passed with the same DOM implementation used by the server path:

```text
1 Stainless Steel Light Transmitting Headstone 11 1300 4444.20 true 7 2
23 Stainless Steel Light Reflective Headstone 11 1300 3971.00 true 7 2
```

Meaning:
- Both catalogs parse.
- Each exposes 11 shapes.
- Main price calculation works at the default 600 x 600 x 100 mm dimensions.
- Base price model is present.
- Inscription min height and two-tier inscription price model are present.

Known verification gap:
- A fresh browser screenshot was not captured after the stainless material fix because the local dev-server background start failed in the shell environment. `screen.png` is the pre-fix evidence showing matte grey rendering.

---

## Current Status (2026-06-22) - 3D Designer Material and Panel Polish

This batch is uncommitted working-tree context from the 3D Designer polish session. It covers plaques, inscriptions, image cropping, and design-detail page copy/layout improvements.

### Design Gallery Detail Pages

The `/designs/...` detail pages were improved in a batch-friendly way:

| File | Change |
|------|--------|
| `app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx` | Cleaner product-page structure and copy for design detail pages |
| `components/DesignContentBlock.tsx` | Updated content section presentation/copy |
| `lib/saved-designs-data.ts` | Gallery data/content support for the updated detail-page experience |

The intent is to improve all current gallery designs through shared templates and generated/supporting content rather than hand-editing each page.

### Bronze Plaque Text Rendering

Bronze plaque inscriptions were changed from flat white text to a more realistic raised bronze look based on the supplied plaque photos.

| File | Change |
|------|--------|
| `components/HeadstoneInscription.tsx` | Detects plaque products more broadly and applies bronze-specific text color/material properties |

Current behavior:
- Bronze plaque text uses a warm bronze color (`#c7a06a`) with high metalness and stronger environment response.
- A subtle dark backing/shadow is rendered behind bronze plaque text to mimic raised letters on the dark plaque surface.
- Non-bronze plaque/headstone text behavior remains separate.

### Stainless Steel Plaque and Urn Material

Single Thickness Stainless Steel Plaque and Stainless Steel Inlaid Urn material rendering were updated to avoid the previous overly dark/flat look.

| File | Change |
|------|--------|
| `components/SvgHeadstone.tsx` | Adds procedural stainless steel color, roughness, and normal maps via `CanvasTexture` |
| `components/MaterialSelector.tsx` | Uses `/textures/forever/l/*ss-swatch.webp` stainless finish URLs and normalizes older swatch paths |
| `app/select-material/_ui/MaterialSelectionGrid.tsx` | Same stainless finish URL normalization for material selection |
| `components/three/headstone/ShapeSwapper.tsx` | Detects polished finish by filename substring instead of exact old JPG path |

Current stainless behavior:
- Brushed stainless uses a light silver base with anisotropic-looking horizontal texture variation.
- Polished stainless is brighter, smoother, and more reflective than brushed.
- Generated stainless textures are disposed on cleanup.
- Finish detection accepts both old and new swatch path formats by checking for `ss-swatch` / `high-polished-ss-swatch`.

Important caveat:
- `components/three/headstone/UrnEnamelInlay.tsx` was intentionally reverted to its original behavior after several heart-border/glitch attempts made the result worse. Do not continue from the failed heart-outline experiments unless the inlay geometry is redesigned more carefully.

### Stainless Steel Default Inscription Color

The Single Thickness Stainless Steel Plaque should honor the XML `default-color="#000000"` even when `color="0"` disables the color picker.

| File | Change |
|------|--------|
| `lib/headstone-store.ts` | Product default inscription color is read from `catalog.product.defaultColor` before falling back to legacy defaults |

Current behavior:
- When inscription color selection is hidden, the store now still uses the product XML default color if present.
- For SS Plaque this means black text by default instead of forced white.

### Add Your Inscriptions Panel

The inscription edit panel UI was tightened after screenshots showed overly long CTAs and crowded action states.

| File | Change |
|------|--------|
| `components/InscriptionEditPanel.tsx` | Shorter labels, compact action area, clearer selected/non-selected states |

Current behavior:
- Input toggle labels are `Single` and `Multiple`.
- Empty/single state CTA is `+ Add line`.
- Multi-line state CTA is `+ Add inscription`.
- Selected inscription action row is `+ Add line`, `Copy`, `Delete`.
- Actions are separated with a top divider and use compact button sizing.

### Add Your Image Crop Panel

The image crop UI was tightened for readability and shorter actions.

| File | Change |
|------|--------|
| `components/ImageSelector.tsx` | Compact crop controls, clearer step labels, shorter crop CTA, centered default placement |

Current behavior:
- Step labels are `Step 1 · Mask`, `Step 2 · Photo finish`, and `Step 3 · Crop area`.
- Size and rotation controls show current values.
- Smaller/larger and `-5°`/`+5°` controls use compact two-column rows.
- Flip and 90-degree rotate controls are grouped before the main CTA.
- Main crop CTA is `Apply crop`; update mode says `Update photo`.
- Newly added cropped images now use `xPos: 0`, `yPos: 0`, and `coordinateSpace: 'mm-center'`, so images appear centered horizontally and vertically on the headstone instead of low on the stone.

### Verification

The following checks passed during this batch:

```bash
pnpm exec tsc --noEmit
pnpm lint
git diff --check
```

Notes:
- `pnpm lint` reports a Babel deoptimization notice for large `lib/saved-designs-data.ts`; this is informational.
- `git diff --check` reports LF/CRLF warnings for touched files; no whitespace errors were reported.
- `screen.png` and the uploaded bronze reference photos are local working files and should not be committed unless intentionally needed.

---

## Current Status (2026-06-19) - Minimal Email Template Redesign

Email templates were redesigned to match the simple minimal aesthetic used by the `/designs/` pages: white surfaces, slate typography, thin dividers, compact rounded controls, and the gold logo as the primary brand accent.

### Commit

Committed in `9d03bc3353`:

```bash
design: simplify email templates
```

### Scope

Updated the shared React Email template system:

| File | Change |
|------|--------|
| `lib/email/templates/components/EmailLayout.tsx` | Replaced dark decorative shell with a white minimal layout, thin slate borders, centered logo, serif title, light footer |
| `lib/email/templates/components/DesignPreview.tsx` | Simplified image frame and CTA buttons to match `/designs/` styling |
| `lib/email/templates/components/QuoteTable.tsx` | Removed dark table header/footer; now uses light rows, slate borders, and restrained totals |
| `lib/email/templates/components/ContactInfo.tsx` | Converted contact box to a simple light slate panel |
| `lib/email/templates/SavedDesignEmail.tsx` | Removed decorative icons/copy, simplified hero, price card, access-code panel, next steps, and guarantee block |
| `lib/email/templates/OrderInvoiceEmail.tsx` | Updated invoice details and info panels to the minimal light style |
| `lib/email/templates/EnquiryEmail.tsx` | Updated message/details styling to the minimal light style |
| `lib/email/templates/RegistrationEmail.tsx` | Updated typography and links to match the shared palette |
| `lib/email/templates/PasswordResetEmail.tsx` | Updated reset CTA and text styling to match the shared palette |

### Design Direction

- Main email shell is white with `#e2e8f0` borders and `8px` radius.
- Text uses slate tones: `#0f172a`, `#334155`, `#475569`, `#64748b`.
- Email titles use `Georgia, "Times New Roman", serif` to echo the `/designs/` page title treatment.
- Heavy dark/gold cards, large shadows, pill buttons, and decorative symbols were removed.
- Email behavior, payloads, URLs, translations, and delivery logic were not changed.

### Verification

Passed:

```bash
pnpm type-check
```

Only unrelated local file left outside the email commit at the time of the change:

- `screen.png`

---

## Current Status (2026-06-19) - Vercel Build Payload Optimization

The local production build is not the main bottleneck anymore. `pnpm build` completed successfully in about 5 minutes, while the Vercel deployment path was still taking roughly 25 minutes. That points to deployment payload size and static asset handling rather than pure Next.js compile time.

### Build Timing

- Local `pnpm build` completed successfully in about 5m 10s.
- Next reported compilation in about 4.4 minutes.
- Static generation was fast: `Generating static pages (106/106)` finished quickly.
- ESLint is already skipped during production builds via `eslint.ignoreDuringBuilds: true` in `next.config.ts`.

### Repo Size Findings

The repository still contains a very large `public/` tree:

- `public/` total size is about 10 GB.
- `public/` contains roughly 395k files.
- Largest directories include:
  - `public/ml` at about 5.5 GB
  - `public/designs` at about 1.2 GB
  - `public/screenshots` at about 1.0 GB
  - `public/shapes` at about 618 MB
  - `public/additions` at about 567 MB

This makes the deployment payload itself a plausible source of slow Vercel builds, even when the code build is healthy.

### Deployment Payload Optimization

I updated [.vercelignore](./.vercelignore) to exclude assets that are not needed at runtime:

- `public/**/*.avi`
- `public/**/*.psd`
- `public/**/*.rar`
- `public/**/*.zip`
- superseded rollout folders under `public/designs/` that are no longer part of the active runtime path

The change is committed in `2ab7750086` (`chore: reduce vercel deployment payload`).

### Remaining Work

The main remaining optimization is structural: move large historical/static asset sets out of the Git/Vercel deployment path and into object storage or a CDN-backed asset store.

The biggest candidates are:

- `public/ml`
- `public/designs`
- `public/screenshots`
- `public/shapes`

Those directories are still large enough that Vercel deploy time may remain high even after the ignore-file reduction.

---

## Current Status (2026-06-18) — Audit Fixes: Protected Sharing, Security, Tests, Migrations

This update captures the current audit/fix batch. The project is not yet widely used, so backward compatibility was intentionally not preserved where simplifying security was the better choice.

### Protected Family Review Links

Family sharing is now protected by a one-time generated review code returned only when the share is created.

**Core behavior:**
- Owners/admins create a share through `/api/share/create`.
- The API returns the `shareToken`, `shareUrl`, and a generated 6-digit `accessCode` once.
- Family members open `/shared/{token}` and must enter the review code before seeing the design.
- Successful verification sets a signed, HTTP-only cookie scoped to that share token.
- Failed attempts are counted; 5 wrong attempts lock the share for 15 minutes.
- Direct `/design/{id}` access is owner/admin only, so it cannot bypass the family review code.

**Main files:**
| File | Purpose |
|------|---------|
| `lib/share-access.ts` | Access-code generation, signed share access cookie helpers |
| `app/api/share/create/route.ts` | Authenticated owner/admin share creation; bcrypt-hashed code storage |
| `app/api/share/[token]/verify/route.ts` | Code verification, lockout handling, access cookie issuance |
| `app/shared/[token]/SharedAccessGate.tsx` | Public review-code entry form |
| `app/shared/[token]/page.tsx` | Enforces code/cookie before rendering the shared design |
| `app/design/[id]/page.tsx` | Owner/admin-only direct design access |
| `components/EmailShareModal.tsx` | Shows/copies share link and review code |
| `lib/email/templates/SavedDesignEmail.tsx` | Includes review link/code in family email |

### Database Migration

New migration added:

| File | Purpose |
|------|---------|
| `drizzle/0004_strange_grim_reaper.sql` | Adds order workflow timestamps/notes and protected-share access columns |
| `drizzle/meta/0004_snapshot.json` | Drizzle snapshot for migration 0004 |
| `drizzle/meta/_journal.json` | Journal updated through 0004 |

New columns:
- `orders.notes`
- `orders.paid_at`
- `orders.factory_order_at`
- `orders.factory_finish_at`
- `orders.shipped_at`
- `orders.processed_at`
- `shared_designs.access_code_hash`
- `shared_designs.failed_access_attempts`
- `shared_designs.locked_until`

**Local DB repair performed:** the local database already had older schema objects, but `drizzle.__drizzle_migrations` was empty, causing `pnpm db:migrate` to try replaying migration `0000` and fail on existing tables. The local journal was seeded with the real hashes/timestamps for migrations `0000` through `0004`, after confirming the schema matched. `pnpm db:migrate` now reports migrations applied successfully.

**Caution:** do not blindly seed `drizzle.__drizzle_migrations` in production. Only do it after verifying the target schema exactly matches the migration history, and take a backup first.

### Security Hardening

Completed audit fixes:
- Removed `typescript.ignoreBuildErrors` from `next.config.ts`; production builds no longer ignore TypeScript errors.
- `/api/seed-materials` now returns 404 in production and is admin-only outside production.
- Stripe checkout/order flow no longer trusts client-supplied amount/currency/design name; the server derives pricing/project data.
- Upload endpoints now include stronger MIME, size, dimension, and path traversal checks.
- Share creation now requires an authenticated project owner/admin.
- Public review links are protected by code + signed cookie.

### Build and Static Generation

The production build previously stalled while generating many design detail pages. The detail route now avoids pre-rendering the entire catalog:

| File | Change |
|------|--------|
| `app/designs/[productType]/[category]/[slug]/page.tsx` | `generateStaticParams()` returns `[]`, `dynamicParams = true`, `revalidate = 86400` |

This keeps detail pages available on demand while avoiding an expensive full static generation pass.

### Lint and TypeScript Gate

The lint gate is now usable on the current codebase:
- `package.json`: `lint` uses `eslint . --quiet`.
- `package.json`: `lint:strict` remains available as `eslint . --max-warnings 0`.
- ESLint ignores generated/archived output such as `src`, `archive`, `test-results`, and `playwright-report`.
- Several current React Compiler advisory rules are disabled for now because the existing app has many legacy patterns that are not practical to rewrite in this audit batch.
- Multiple lint/type errors in active files were fixed, including hook-order, `prefer-const`, internal `Link`, config import style, and component typing issues.

### Tests Added or Updated

| File | Coverage |
|------|----------|
| `tests/unit/share-flow.test.ts` | Share auth required, owner enforcement, code generation, malformed/wrong codes, lockout, correct-code cookie |
| `tests/e2e/share-flow.spec.ts` | Authenticated user creates project/share; unauthenticated family member must enter valid code |
| `tests/e2e/auth.setup.ts` | Uses API login and saves Playwright storage state |
| `playwright.config.ts` | 60s test timeout to tolerate cold Next.js route compilation |

### Verified Commands

These commands passed on 2026-06-18:

```bash
pnpm db:migrate
pnpm lint
pnpm type-check
pnpm test -- tests/unit/share-flow.test.ts
pnpm exec playwright test tests/e2e/share-flow.spec.ts --project=chromium --reporter=list
pnpm build
```

Notes:
- `pnpm build` passed before the final Playwright timeout/assertion cleanup. No production code changed after that, only `playwright.config.ts` and the E2E assertion.
- The focused E2E test needs valid `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` in `.env.test.local`.

### Vercel Deployment Status

Vercel initially failed during type-check because two share routes imported `nanoid`, which was not a direct dependency in `package.json`.

Fixed by replacing `nanoid(32)` with Node's built-in crypto token generation:

```ts
randomBytes(24).toString('base64url')
```

Updated files:
- `app/api/share/create/route.ts`
- `app/api/share/email/route.ts`

After those fixes, the Vercel build completed successfully.

Deployed-site smoke test completed on 2026-06-19:
1. Login on the Vercel site worked.
2. Saving two designs worked.
3. Sending the design email worked.
4. Viewing an owned saved design worked:
   `https://forevershining.org/design/4a486f8e-6ba3-489a-a61c-cd708af25544`

Remote database follow-up completed on 2026-06-19:
- Ran `npm run db:sync` to sync the remote database used by the deployed site.

### Current Working-Tree Context

This audit batch touches many files across:
- protected share flow
- checkout/order trust boundaries
- upload validation
- lint/build configuration
- Drizzle schema/migrations
- focused unit and E2E tests

Before committing, review the full diff and consider grouping into one audit/security commit or a small series of commits:
1. protected sharing and migration
2. security hardening
3. lint/build/test gate cleanup

---

## Current Status (2026-06-04) — Design Gallery Pixel-Perfect Polish

A full round of layout, accessibility, and SEO fixes across the `/designs` gallery and design detail pages. All changes were surgical — no unrelated code touched.

### ✅ ThemeToggle — Hidden on `/designs` Routes

**Problem:** The global `ThemeToggle` button (fixed `top-20px left-20px z-[9999]`) overlapped the sidebar logo/header on all `/designs` pages.

**Fix (`components/ThemeToggle.tsx`):** Added `usePathname()` guard — returns `null` when `pathname?.startsWith('/designs')`. The designs section always uses a forced white background so the toggle is unnecessary there.

---

### ✅ Sidebar Badge — Design Count (not Category Count)

**Problem:** Product-type badges in `DesignsTreeNav` showed the number of *categories* (e.g. 4), not the number of *designs* (e.g. 812). Misleading at a glance.

**Fix (`components/DesignsTreeNav.tsx`):**
```ts
// Before (category count)
Object.keys(productNode.categories).length

// After (design count)
Object.values(productNode.categories).reduce((sum, cat) => sum + cat.designs.length, 0)
```

---

### ✅ "Found X of Y" Bar — Aligned with Card Grid

**Problem:** The results status bar had `max-w-3xl mx-auto` which made it narrower and offset from the card grid below it (optical misalignment).

**Fix (`components/DesignSmartSearch.tsx`):** Removed `max-w-3xl mx-auto` from the results bar container — it now aligns flush with the card grid.

---

### ✅ Sidebar Logo — Replaced Text with Image

**Before:** `<span className="font-serif text-xl font-light text-slate-900 tracking-tight">Forever Shining</span>`

**After (`components/DesignsTreeNav.tsx`):**
```tsx
<Image
  src="/ico/forever-transparent-logo-bw.png"
  alt="Forever Shining"
  width={400}
  height={246}
  className="w-full h-auto"
  priority
/>
```

- File used: `public/ico/forever-transparent-logo-bw.png` (400×246, transparent BW, same natural size as the `forever-transparent-logo.png` used in `DesignerNav`)
- Container updated to `px-6` to match `DesignerNav` desktop header padding exactly
- A `h-px bg-slate-200` thin divider separates the logo from the "Memorial Designs" label below

---

### ✅ Sidebar Loading State — Dark Background Flicker Eliminated

**Problem:** During data load, `DesignsTreeNav` returns early (before its `<nav className="bg-white">` wrapper renders), exposing the parent container's old dark `bg-[#1b1511]` background + blue loading text.

**Fixes:**
- **`components/ConditionalNav.tsx`**: Wrapper div changed from `bg-[#1b1511] day:bg-stone-100 ... md:bg-transparent md:border-gray-800` → `bg-white md:bg-white md:border-slate-200` everywhere
- **`components/DesignsTreeNav.tsx`**: Loading and empty states now explicitly have `bg-white h-full` so no parent bleed-through

---

### ✅ Sidebar Active State — Lighter Accent Style

**Before:** `bg-slate-900 text-white` (heavy solid black block) for both product-type buttons and individual design links.

**After:**
| Element | Before | After |
|---------|--------|-------|
| Product-type button (active) | `bg-slate-900 text-white font-normal` | `bg-slate-100 text-slate-900 font-semibold` |
| Product-type badge (active) | `bg-white/20 text-white/80` | `bg-slate-200 text-slate-600` |
| Design leaf link (active) | `bg-slate-900 text-white font-normal` | `border-l-2 border-slate-500 bg-slate-50 text-slate-900 font-semibold pl-[10px]` |
| Design leaf link (inactive) | `text-slate-500 font-light` | `text-slate-600 font-normal` (WCAG AA contrast) |

---

### ✅ Sidebar Font Size — Subcategories & Designs

**Problem:** Category buttons and individual design links used `text-xs` (12px) — too small for older users.

**Fix (`components/DesignsTreeNav.tsx`):**
- Category buttons: `text-xs` → `text-sm`
- Design leaf links: `text-xs` → `text-sm`

---

### ✅ Long Design Names — Truncation

**Fix (`components/DesignsTreeNav.tsx`):** Added `line-clamp-2` to design link text so names longer than 2 lines are cut with ellipsis rather than wrapping to 3–4 lines.

---

### ✅ Design Detail Page — H1, Breadcrumb & Subtitle (Client + SSR)

**Problem — Three conflicting signals:**
1. Sidebar active item: "Cropped Peak - Dedicated Mother" (correct — from slug)
2. Breadcrumb last item: "In loving memory" (wrong — was `designMetadata.title`, the first inscription text)
3. H1: "Biblical Memorial – Laser-Etched Black Granite Headstone (Cropped Peak)" (wrong — verbose category+product+shape)
4. Subtitle: empty string (broken `slugText` variable assumed old `id_slug` format)

**Fix — two files needed (CSR + SSR):**

#### `DesignPageClient.tsx` (client-rendered — what users see after JS hydrates)
- Breadcrumb last item: `{designMetadata.title}` → `{formattedDesignTitle}`
- H1: verbose string → `{formattedDesignTitle}` (e.g. "Cropped Peak – Dedicated Mother")
- Subtitle `<p>`: broken `{slugText}` → `{categoryTitle} · {simplifiedProductName} {productTypeDisplay}` (e.g. "Biblical Memorial · Laser-Etched Black Granite Headstone")
- Breadcrumb also simplified (removed redundant `productType` crumb)

#### `app/designs/[productType]/[category]/[slug]/page.tsx` (server-rendered — what Google sees)
- Added `formattedH1` computed from existing `shapeName` + `phraseFromSlug`:
  ```ts
  const formattedH1 = shapeName && phraseFromSlug
    ? `${shapeName} – ${phraseFromSlug}`
    : shapeName
    ? `${shapeName} – ${categoryTitle}`
    : formatSlugForDisplay(slug);
  ```
- SSR `#design-ssr-content` block updated: breadcrumb last item, `<h1>`, and subtitle all use `formattedH1`
- JSON-LD `BreadcrumbList` position 6 (`design.title`) → `formattedH1`
- Result: Google, crawlers, and `<noscript>` users all see the correct, concise design title

#### Files Changed (2026-06-04)

| File | Change |
|------|--------|
| `components/ThemeToggle.tsx` | Returns `null` on `/designs` routes |
| `components/DesignsTreeNav.tsx` | Logo image; loading state bg-white; lighter active styles; `text-sm` font sizes; `line-clamp-2`; `px-6` container padding; design count badges |
| `components/ConditionalNav.tsx` | Sidebar wrapper: `bg-white`, `border-slate-200` (was dark bg + gray-800 border) |
| `components/DesignSmartSearch.tsx` | Removed `max-w-3xl mx-auto` from results status bar |
| `app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx` | H1 → `formattedDesignTitle`; breadcrumb last item fixed; subtitle fixed |
| `app/designs/[productType]/[category]/[slug]/page.tsx` | SSR H1, breadcrumb, subtitle, and JSON-LD all use new `formattedH1` |

---

## Current Status (2026-06-03) — Design Gallery Search UX & Sidebar Redesign

### ✅ `/designs` Smart Search — Full UX Overhaul

Three rounds of iterative UX improvements to the `/designs?q=` search page, driven by detailed visual review.

#### 1. Tiered Search Scoring (`lib/ml-search-service.ts`)

The old flat text-bag scoring returned wrong results for visual queries (e.g. `?q=heart` showed a plain square headstone because a long inscription contained the word "heart" many times). Replaced with **tiered scoring**:

| Bucket | Fields | Weight |
|--------|--------|--------|
| Visual | `shapeName`, `mlMotif`, `mlStyle`, motif names | ×3 |
| Title | `title`, `slug` | ×2 |
| Inscription | inscription/description text | ×0.5, **capped at 5 pts** |

The inscription cap prevents long epitaphs from dominating over a heart-shaped monument.

Added `matchedOn?: 'visual' | 'inscription' | 'mixed'` to `SearchResult` — used by the card UI to show a subtle hint ("Matched inscription text") without exposing private memorial text.

#### 2. Sort on Full Result Set (`app/designs/DesignsPageClient.tsx`)

- `fullSearchResults` state — uncapped, stores all matches
- `displayResults` — `useMemo([fullSearchResults, sortBy])` derives the display slice (sorted + `.slice(0, 60)`)
- Sort options: Best Match, Price ↑, Price ↓, Name A–Z
- Sort is applied **before** the 60-result cap, so price-sort considers all matches, not just the top-60 relevance hits

#### 3. ML-Ready Race Condition Fix

Initial `?q=heart` page loads hit an empty ML index because `loadMLData` is async. Added `useEffect([mlReady, allDesigns.length])` to re-run search once both ML data and design list are loaded — ensuring the initial URL query gets ML-scored results.

#### 4. Active Filter Chips

Filter chips appear below the search bar whenever ML type/style/motif or feature toggles are active. Each chip has an ✕ to remove that one filter. Chips are hidden when the filter panel is open (panel already shows the controls).

#### 5. Sort Dropdown — Strikethrough Bug Fixed (`components/DesignSmartSearch.tsx`)

The native `<select>` showed strikethrough text in Chromium because `@plugin "@tailwindcss/typography"` in `styles/globals.css` injects `del { text-decoration: line-through }` which bleeds into native select text when `font-light` is applied.

**Fix**: Replaced the native `<select>` with a custom sort dropdown using `appearance-none` + `font-normal` + a React-rendered `<ChevronDownIcon>` chevron. The wrapper pattern:
```tsx
<div className="relative">
  <select
    className="appearance-none pl-3 pr-7 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-700 font-normal ..."
  >...</select>
  <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
</div>
```

#### 6. Filter Button — Moved Outside Search Input

The funnel icon was inside the text input (`pr-24` padding) which is a UX anti-pattern — it suggests filtering the *typed text*, not the *results*. Restructured the search bar as `flex gap-2`:
```
[ 🔍 Search input with ✕ clear         ] [ 🝖 Filters ]
```
The Filters button turns dark (`bg-slate-900`) and shows an amber badge count when ML/feature filters are active.

#### 7. "Clear all filters" — Only Shown When Filters Active

Previously showed whenever any search was active (including plain text). Now only renders when `activeFilterCount > 0` (ML type/style/motif or feature toggle filters). The text input has its own ✕ button inside it.

#### 8. Card UI Simplification

**Removed:**
- ML confidence badge (color-coded indigo/violet/amber/green — visually chaotic)
- `MOTIFS` header label
- Feature count badges ("3 MOTIFS", "PHOTO", "ADDITIONS")
- `ALL CAPS` product names

**Added:**
- Motif names as **unified gray pills** (`bg-slate-100 text-slate-600 rounded-full`), max 3 shown + `+N more` overflow
- **Deduplication** of motif pills — `heart` and `hearts` collapse to one tag via stemming (`replace(/s$/, '')`)
- **"Quote on request"** fallback when `mlData?.design_price` is null/zero (uniform card height)
- **"VIEW →"** CTA: changed from `font-light text-slate-600` to `font-medium text-slate-500 tracking-widest` with `group-hover:text-slate-900` — makes the CTA visible as a visual anchor without being aggressive

#### 9. "✨ Smart Search" / "AI Ranked" Badge — Removed

The badge was creating false expectations ("Smart Search active" but results didn't always feel smart). Removed entirely. The `mlReady` and `mlRanked` states were cleaned up from both the component and its props interface.

#### Files Changed

| File | Change |
|------|--------|
| `lib/ml-search-service.ts` | `matchedOn` field on `SearchResult`; tiered scoring replacing flat text-bag |
| `components/DesignSmartSearch.tsx` | Filter button outside input; sort dropdown (no native `<select>`); filter chips; "Clear all" condition; removed AI badge + `mlReady`/`mlRanked` props |
| `app/designs/DesignsPageClient.tsx` | `fullSearchResults` (uncapped); `displayResults` via `useMemo`; `sortBy` state; ML-ready re-run fix; card UI rewrite (gray pills, no colored tags, deduplication, "Quote on request", VIEW CTA) |

---

### ✅ `DesignsTreeNav` Sidebar — Unified Light Theme

The designs sidebar (`components/DesignsTreeNav.tsx`) used `bg-gradient-to-tr from-sky-900 to-yellow-900` — a dark gradient that visually clashed with the clean white main content area. Redesigned to match the light aesthetic.

#### Visual Changes

| Before | After |
|--------|-------|
| `bg-gradient-to-tr from-sky-900 to-yellow-900` | `bg-white` |
| White/slate-300 text | slate-900/slate-700/slate-500 text |
| `bg-white/15` active state (frosted glass) | `bg-slate-900 text-white` (crisp) |
| `bg-white/10` hover | `hover:bg-slate-100` |
| `forever-transparent-logo.png` (white glowing logo on dark bg) | Serif text `"Forever Shining"` (works on white) |
| `bg-white/10 text-white` "3D Designer" button | `border border-slate-300 text-slate-600 hover:bg-slate-50` — matches Filters button style |
| `"3114 thoughtfully crafted designs"` count (mismatched with 2278 in main content) | Removed — count confusion eliminated |
| Visible default scrollbar | `[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200` — 1px subtle |
| `border-r border-gray-800` on wrapper | `border-r border-slate-200` |

#### Count Discrepancy — Root Cause & Fix

- Sidebar used `getAllSavedDesigns()` → 3114 total designs (ALL historical designs)
- Main page filters to `v2026Set` → 2278 designs (only those with 3D screenshot renders)
- **Fix**: Removed the count from the sidebar entirely. The sidebar is a navigation tree (links to individual design pages), not a catalog count display. The main content area already shows the authoritative "2278 designs across N collections" count.

#### Architecture: Sidebar = Navigation, Filters = Search

The sidebar links navigate to `/designs/[productType]/[category]` pages (Option B architecture). The `[ 🝖 Filters ]` button in the search bar handles keyword/ML filtering of the results on the same page. These are distinct UX affordances and both are kept.

#### Files Changed

| File | Change |
|------|--------|
| `components/DesignsTreeNav.tsx` | Light theme throughout; text logo; thin scrollbar; removed count; unified button/link styles |
| `components/ConditionalNav.tsx` | `border-r border-gray-800` → `border-r border-slate-200` on sidebar wrapper div |

---

## Current Status (2026-06-02) — Hero Search Bar & v2026-3D Design Gallery

### ✅ Hero Search Bar on Home Page

A search input was added to the homepage hero (`app/_ui/HomeSplash.tsx`) between the trust badges and the 3D canvas, allowing visitors to find inspiration before entering the designer.

#### Implementation

- **State**: `heroSearchQuery` + `handleHeroSearch` handler in `HomeSplash.tsx`
- **UI**: Glassmorphic `<form>` (dark/day theme compatible) with text input + "Search" submit button
- On submit, navigates to `/designs?q={query}` using `router.push()`

#### Hero Layout Tweaks (same session)

- **Canvas height −10%**: `h-[50vh] sm:h-[55vh] min-h-[400px]` → `h-[45vh] sm:h-[49.5vh] min-h-[360px]`
- **Content shifted up**: `justify-center` → `justify-start`, padding `pt-[129px] sm:pt-24` → `pt-[100px] sm:pt-16`

---

### ✅ `/designs` Search Results — v2026-3D Thumbnails

The `/designs` search results page (`app/designs/DesignsPageClient.tsx`) was updated to show only designs with 3D-regenerated screenshots and display those regenerated thumbnails.

#### Filter: only 3,041 designs with 3D renders

- **`public/screenshots/v2026-3d-ids.json`** — generated index of all 3,041 design IDs that have a `_small.png` in `public/screenshots/v2026-3d/`
- `DesignsPageClient` fetches this JSON alongside `SAVED_DESIGNS` and filters to the intersection → `v2026Set.has(d.id)`
- Replaces the previous filter against `public/designs/v2026-ids.json` (22,226 IDs, too broad)

#### Thumbnail: v2026-3D PNG with fallback

```tsx
<Image
  src={`/screenshots/v2026-3d/${design.id}_small.png`}
  onError={(e) => {
    const img = e.currentTarget;
    const fallback = design.preview
      ? design.preview.replace(/\.(jpg|jpeg|png)$/i, '_small.jpg')
      : null;
    if (fallback && img.src !== fallback) img.src = fallback;
    else img.style.display = 'none';
  }}
/>
```

Priority chain matches `LoadDesignButton.tsx`:
1. `/screenshots/v2026-3d/{id}_small.png` (3D transparent PNG)
2. Legacy `_small.jpg` derived from `design.preview`
3. Hidden if both fail

#### Pre-populated search from URL

- `app/designs/page.tsx` is an `async` server component; reads `await searchParams` and passes `initialQuery` to client
- On mount, `DesignsPageClient` runs `searchDesigns(designs, mlIndexRef.current, filters)` synchronously with the locally-loaded `designs` array (avoids stale closure on `runSearch`)

#### Files Changed

| File | Change |
|------|--------|
| `app/_ui/HomeSplash.tsx` | Hero search form, canvas −10% height, content shifted up |
| `app/designs/page.tsx` | Made `async`, reads `searchParams`, passes `initialQuery` |
| `app/designs/DesignsPageClient.tsx` | Filters by v2026-3d-ids, thumbnails from `/screenshots/v2026-3d/` |
| `public/screenshots/v2026-3d-ids.json` | Generated — 3,041 IDs with 3D `_small.png` renders |

---



### ✅ Playwright E2E Test Suite Added

Full browser E2E tests covering the design creation and save flow, plus direct API tests for `/api/projects`.

#### Installed

```bash
# @playwright/test 1.59.1 was already present as a devDependency
pnpx playwright install chromium   # install Chromium browser binary
```

#### Configuration (`playwright.config.ts`)

Key settings:
- `testDir: 'tests/e2e'`
- Two projects: `setup` (auth) → `chromium` (depends on setup)
- `webServer`: `pnpm dev`, `reuseExistingServer: !CI` — reuses running dev server locally
- Auth state saved to `playwright/.auth/user.json` (gitignored)
- Reads `.env.test.local` via dotenv (gitignored) for `TEST_USER_EMAIL` / `TEST_USER_PASSWORD`

#### Required Setup (one-time)

Create `.env.test.local` (gitignored — see `.env.test.local.example`):
```
TEST_USER_EMAIL=your-test-account@example.com
TEST_USER_PASSWORD=your-test-password
```

#### New Scripts (`package.json`)

| Command | Description |
|---------|-------------|
| `pnpm test:e2e` | Run all 13 E2E tests (headless) |
| `pnpm test:e2e:ui` | Interactive Playwright UI mode |
| `pnpm test:e2e:debug` | Step-by-step debugger |
| `pnpm test:e2e:report` | Open last HTML report |

#### Test Files (`tests/e2e/`)

| File | Tests | What's covered |
|------|-------|----------------|
| `auth.setup.ts` | 1 | Login via `/login` UI → saves `storageState` for all authenticated tests |
| `designer.spec.ts` | 5 | Save modal open/submit/validate/close; auth guard (unauthenticated → 401) |
| `projects-api.spec.ts` | 7 | `POST /api/projects` (save, 400 on missing state, default title), `GET` (list, limit), `DELETE` (delete + verify gone, 400 on missing ID) |

**Total: 13 E2E tests.**

#### Page Object Models (`tests/e2e/pages/`)

- **`LoginPage.ts`** — `goto()`, `login(email, password)`, `expectError()`, `expectRedirectTo()`
- **`DesignerPage.ts`** — `goto(path)`, `waitForReady()`, `openSaveModal()`, `saveDesign(name)`, `waitForCanvasRender()`

#### Auth Strategy

Uses Playwright's `storageState` pattern (not NextAuth):
- `auth.setup.ts` logs in via the real UI → cookie `session` (JWT, httpOnly, 7-day expiry) is captured
- All `[chromium]` project tests load `playwright/.auth/user.json` so they start already authenticated
- `auth.setup.ts` runs before any `[chromium]` tests via `dependencies: ['setup']`

#### Architecture Notes

- Session cookie name: `session` (defined in `lib/auth/session.ts`)
- Login page: no `htmlFor` on labels → use `getByPlaceholder('you@example.com')` and `getByPlaceholder('••••••••')`
- "Save Design" button: nav item with `slug === 'save-design'` → opens `SaveDesignModal`
- Save modal submit: `page.locator('form').getByRole('button', { name: 'Save Design' })`
- After successful save: app redirects to `/my-account`

---

### ✅ Vitest Unit Test Suite Added

The project had **no automated tests** — `pnpm build` was the only validation gate. A Vitest suite now covers the core pure-logic modules.

#### Installed

```bash
pnpm add -D vitest @vitest/coverage-v8   # vitest 4.1.8
```

#### Configuration (`vitest.config.ts`)

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.ts'],
    },
  },
  resolve: {
    alias: { '#': path.resolve(__dirname, '.') },  // mirrors tsconfig #/* alias
  },
});
```

#### New Scripts (`package.json`)

| Command | Description |
|---------|-------------|
| `pnpm test` | Run all unit tests once |
| `pnpm test:watch` | Watch mode (re-runs on file change) |
| `pnpm test:coverage` | Run with V8 coverage report |

#### Test Files (`tests/unit/`)

| File | Tests | What's covered |
|------|-------|----------------|
| `unit-system.test.ts` | 26 | `resolveUnitSystemFromCountry`, `parseUnitSystemCookie`, `formatImperialFromMm`, `formatLengthFromMm`, `formatDimensionPair/Triplet` |
| `slug.test.ts` | 9 | `toSlug` — lowercasing, hyphens, punctuation stripping, numbers |
| `xml-parser-price.test.ts` | 18 | `calculatePrice` (linear formula, noteFilter, range matching), `calculatePricePowerLaw` (power-law + minimum-size surcharge), `computeQuantity` (all quantity types) |
| `inscription-sanitizer.test.ts` | 20 | `hashString`, `getGenderFromCategory`, `sanitizeInscription` (memorial phrase preservation, name replacement, pattern-only mode) |
| `motif-pricing.test.ts` | 9 | `calculateMotifPrice` (laser=free, color tiers, fallback, retail multiplier) |

**Total: 82 tests — all passing.**

#### What Is Intentionally Not Tested

- Zustand stores (`headstone-store.ts`, `scene-overlay-store.ts`) — require React environment
- 3D components (`components/three/`) — require WebGL/R3F
- API routes — require database / HTTP server
- Files with server-only imports (`lib/db/`, `lib/auth/`, `lib/email/`)

#### Adding New Tests

Place test files in `tests/unit/` as `*.test.ts`. Focus on pure functions in `lib/`:
- No `fetch()`, no DOM, no React hooks
- Import using the `#/` alias: `import { fn } from '#/lib/my-module'`

---

### ✅ Additional Pages / Components Updated for Day Mode

Continuing the day/night rollout from the prior session. All changes follow the same `day:` Tailwind variant pattern.

#### New Files Updated

| File | What was fixed |
|------|---------------|
| `components/DesignerNav.tsx` (Add Inscription section) | Tabs (`day:bg-gray-100`, `day:text-gray-900`), input fields (`day:bg-white day:border-gray-300 day:text-gray-900`), labels, font size slider, color swatches |
| `components/DesignerNav.tsx` (Add Your Image section) | Upload zone, image list cards, position/size sliders, action buttons |
| `components/DesignerNav.tsx` (Crop section) | Crop canvas overlay, control buttons, dimension inputs |
| `components/DesignerNav.tsx` (Select Additions section) | Addition thumbnails, category tabs, size sliders |
| `components/DesignerNav.tsx` (Select Motifs section) | Motif grid, category filter, size/position controls |
| `app/check-price/_ui/CheckPriceGrid.tsx` | Full page: header, both cards (Your Design + Price Summary), all expandable sections, section dividers, price values, notes box, "What's Included" section |
| `components/ProjectActions.tsx` | Save card, saved designs list card, inputs, buttons, list items |
| `app/_ui/HomeSplash.tsx` | Full homepage: hero, How It Works, CTA, footer — see details below |

#### ✅ Critical Bug: Gradient Override Pattern

Tailwind `bg-gradient-to-br` / `bg-gradient-to-r` sets `background-image: linear-gradient(...)`. Adding `day:bg-white` only sets `background-color`, which CSS renders **behind** `background-image` — so the gradient wins.

**Fix**: Always add `day:bg-none` (sets `background-image: none`) **before** the `day:bg-[color]`:
```tsx
// ✅ Correct
className="bg-gradient-to-br from-gray-800 to-gray-900 day:bg-none day:bg-white"

// ❌ Wrong — gradient will still show in day mode
className="bg-gradient-to-br from-gray-800 to-gray-900 day:bg-white"
```

Also, **dark-only decorative overlay divs** (glow orbs, black vignette gradients) must be hidden in day mode:
```tsx
<div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70 day:hidden" />
<div className="absolute -top-32 right-0 bg-[#d4af37]/30 blur-[180px] day:hidden" />
```

#### ✅ Homepage Day Mode — `isDayMode` MutationObserver Pattern

The homepage (`app/_ui/HomeSplash.tsx`) uses many inline `style={{ background: '...' }}` backgrounds (radial/linear gradients). Inline styles **cannot** be overridden by Tailwind `day:` classes — inline styles always win in CSS specificity.

**Solution**: local `isDayMode` React state driven by a `MutationObserver` on `<html data-theme>`:

```tsx
const [isDayMode, setIsDayMode] = useState(false);
useEffect(() => {
  const html = document.documentElement;
  setIsDayMode(html.dataset.theme === 'day');
  const observer = new MutationObserver(() =>
    setIsDayMode(html.dataset.theme === 'day')
  );
  observer.observe(html, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}, []);
```

Then use it in JSX:
```tsx
<div style={{ background: isDayMode ? '#f9fafb' : 'radial-gradient(circle at 50% 100%, #3E3020 0%, #121212 60%)' }}>
```

**Use this pattern in any component that has inline `style=` backgrounds and needs day-mode support.**

#### Day Mode Color Palette (Homepage / Sections)

| Section | Day background | Notes |
|---------|---------------|-------|
| Root wrapper | `#f9fafb` (gray-50) | Replaces dark radial gradient |
| "How It Works" | `#f3f4f6` (gray-100) | Replaces dark linear gradient |
| CTA section | `#fffbeb` (amber-50) | Replaces dark radial gradient |
| Footer | `day:bg-gray-100` | Tailwind class (no inline style needed) |
| Step / feature cards | `day:bg-white day:border-amber-200` | White on gray section bg |
| Headings | `#1a1a1a` / `day:text-gray-900` | Near-black |
| Body text | `#374151` / `day:text-gray-600` | Gray-700 |
| Gold accents | `#b45309` / `day:text-amber-700` | Amber-700 replaces gold |

#### Default Theme Decision

**Dark mode is the default** — `useState('dark')` in `ThemeProvider.tsx`. The gold-on-dark aesthetic is the brand identity and makes the 3D scene and stone textures pop. Day mode is user opt-in via the ☀️/🌙 toggle.

---

## Current Status (2026-05-28) — Day/Night UI Theme Rollout

### ✅ Day/Night Theme System

A full **Day / Night** (light / dark) mode toggle has been implemented across the entire application UI (not the 3D scene — the scene always uses its own dark sky/grass environment).

#### Core Implementation

**`styles/globals.css`** — Tailwind v4 custom variant:
```css
@custom-variant day (&:where([data-theme=day], [data-theme=day] *));
```
This gives `day:` a specificity of `(0,1,1)`, which beats all standard utilities — no `!important` needed.

**`app/layout.tsx`**:
- `<html data-theme="dark">` as default (dark mode on first load)
- Inline no-FOUC script reads `localStorage.getItem('theme')` and applies it before hydration
- `<ThemeProvider>` (React context) + `<ThemeToggle>` button in layout

**`components/ThemeToggle.tsx`** — Circular ☀️/🌙 button, `top-5 left-5` fixed, 20px margin from corner, `z-50`. Reads/writes `localStorage.theme` and sets `document.documentElement.dataset.theme`. Animates with a spin transition on swap.

**`components/ThemeProvider.tsx`** — React context (`ThemeContext`) exposing `{ theme, setTheme }`. Wrap your whole app to give any component access via `useTheme()`.

#### Tailwind `day:` Variant Pattern

The convention used throughout the app:
```tsx
// Backgrounds
className="bg-[#0A0A0A] day:bg-white"
className="bg-gradient-to-br from-[...] to-[...] day:bg-none day:bg-gray-50"

// Text
className="text-white day:text-gray-900"         // headings
className="text-white/70 day:text-gray-600"      // body
className="text-white/40 day:text-gray-400"      // muted

// Borders
className="border-white/10 day:border-gray-200"

// Hide dark-only decorative gradients
className="bg-gradient-to-br from-[...] to-[...] day:hidden"

// Inputs
className="bg-white/5 border-white/15 text-white day:bg-white day:border-gray-300 day:text-gray-900"
```

#### Pages / Components Updated for Day Mode

| File | What was fixed |
|------|---------------|
| `app/layout.tsx` | Theme system bootstrap, no-FOUC script |
| `components/ThemeToggle.tsx` | Toggle button (new) |
| `components/ThemeProvider.tsx` | Theme context (new) |
| `components/DesignerNav.tsx` | Full sidebar: header, nav links, section panels, pill buttons (No Base/Polished/Rock Pitch) |
| `components/ui/SegmentedControl.tsx` | Track bg `day:bg-gray-100`, inactive tabs `day:text-gray-500` |
| `components/QuickEnquiryForm.tsx` | Sidebar accordion form — bg, title, labels, inputs |
| `components/QuickEnquiryModal.tsx` | Modal dialog — backdrop, card bg (gradient suppressed), all labels/inputs/buttons |
| `app/my-account/page.tsx` | Account overview |
| `app/my-account/designs/page.tsx` | Saved designs list |
| `app/my-account/designs/[id]/page.tsx` | Single design detail + Share Email panel |
| `app/my-account/details/page.tsx` | Account details form (CSS constants + all elements) |
| `app/my-account/invoice/page.tsx` | Invoice page |
| `app/orders/page.tsx` | Orders list |
| `app/select-product/_ui/ProductSelectionGrid.tsx` | Product selector page |
| `app/select-shape/_ui/ShapeSelectionGrid.tsx` | Shape selector (both urn + regular render paths) |
| `app/privacy/page.tsx` | Privacy policy page (new — see below) |
| `app/inscriptions/InscriptionOverlayPanel.tsx` | Select Font / Select Color tabs |

#### ✅ Privacy Page Created

`app/privacy/page.tsx` — server component with `metadata`. Content extracted from `languages24.xml` tag `<privacy_policy_iframe>` CDATA block and rendered via `dangerouslySetInnerHTML`. Uses `@tailwindcss/typography` (`prose`) for typography with full day/night variant overrides.

Link to `/privacy` already existed in `AccountNav.tsx`.

#### Admin Theme — Separate Scope

The admin panel (`/admin/**`) uses a **separate** `[data-admin-theme=dark]` CSS scope. Do NOT add `day:` classes to admin components — they have their own theme.

---

## Current Status (2026-05-27) — Admin Charts, Quick Enquiry CTA on Canvas & Striped Tables

### ✅ Admin Dashboard Analytics Charts

Installed **Recharts 3.8.1** (`pnpm add recharts`).

`app/admin/_components/DashboardCharts.tsx` — four chart components:
- `RevenueOrdersChart` — dual-axis area chart (orders/month left axis, revenue right axis)
- `OrderStatusChart` — donut/pie chart with percent labels per status
- `CustomersChart` — bar chart of new customers per month
- `DesignsChart` — bar chart of new saved designs per month

`app/admin/page.tsx` — added four raw SQL queries via `db.execute(sql`...`)`:
- Monthly orders + revenue (last 12 months) using `date_trunc('month', ...)` + `to_char(..., 'Mon YY')`
- Monthly new customers
- Monthly new designs
- Orders by status (grouped count)

Results are transformed in JS into a 12-month label series (filling months with 0 if no data). Charts rendered in a 2-row × 2-column responsive grid below the KPI stat cards.

**Recharts 3 type quirks**: `ValueType` and `NameType` are NOT re-exported from the `recharts` package root — define them locally:
```ts
type TooltipValue = number | string | ReadonlyArray<number | string>;
type TooltipName = number | string;
```
Pie label function uses `PieLabelRenderProps`; access the slice name via `props.name` (set by `nameKey="status"`).

---

### ✅ Admin Dashboard Top Padding Removed

`app/admin/page.tsx`: changed `py-8` → `pb-8 pt-0` on the outer wrapper `div` to eliminate the gap above the stat cards.

---

### ✅ Quick Enquiry CTA — Moved to Canvas (Below Product Name Chip)

The Quick Enquiry button was relocated from the bottom of the DesignerNav sidebar to the **3D canvas overlay**, stacked directly below the `• Product Name` pill at `top-6 left-6`.

**`components/ThreeScene.tsx`** — changes inside `ProductNameHeader()` (the inner component that renders the canvas overlays):
- Added `import QuickEnquiryModal from '#/components/QuickEnquiryModal'`
- Added `const [showQuickEnquiry, setShowQuickEnquiry] = useState(false)` to `ProductNameHeader()`
- Wrapped the product name chip and new Quick Enquiry button in a shared `absolute top-6 left-6 z-10 hidden lg:flex flex-col gap-2 items-start` container
- Both elements use `h-8` (explicit fixed height, no `py-*`) so they render at identical height
- Quick Enquiry button uses same frosted-glass style as the product chip: `bg-black/55 backdrop-blur-md border border-primary/40 rounded-full pl-2.5 pr-3.5 shadow-lg`
- `<QuickEnquiryModal>` rendered directly in `ProductNameHeader` return

**`components/DesignerNav.tsx`** — the sidebar Quick Enquiry block (pinned below the logo) now has `lg:hidden` so it is a **mobile-only fallback** (hidden on desktop where the canvas button is visible).

**Layout summary**:
| Breakpoint | Quick Enquiry location |
|------------|----------------------|
| Desktop (≥lg) | Canvas overlay, below product name pill |
| Mobile/tablet (<lg) | Sidebar, below logo header |

---

### ✅ Product Name Chip & Quick Enquiry Button — Equalised Height

Both elements in the canvas overlay now use `h-8` as the single source of truth for height (with `pl-2.5 pr-3.5`, no `py-*`). This prevents the icon inside the button from causing a height discrepancy vs the text-only chip.

---

### ✅ Admin Tables — Alternating Row Striping

Every admin list table now has zebra striping: odd rows are white/transparent, even rows are `bg-gray-100 dark:bg-gray-700/50`. Hover state bumped to `hover:bg-gray-100` on all rows.

Files updated:
- `app/admin/designs/page.tsx`
- `app/admin/orders/page.tsx`
- `app/admin/customers/page.tsx`
- `app/admin/customers/[id]/page.tsx` (projects table + orders table)
- `app/admin/enquiries/page.tsx`
- `app/admin/payments/page.tsx`
- `app/admin/system/page.tsx`
- `app/admin/orders/[id]/page.tsx` (order items table + payments table)

Pattern used in all:
```tsx
{rows.map((row, index) => (
  <tr
    key={row.id}
    className={`hover:bg-gray-100 dark:hover:bg-gray-700/50 ${
      index % 2 === 1 ? 'bg-gray-100 dark:bg-gray-700/50' : 'bg-white dark:bg-transparent'
    }`}
  >
```

---

## Current Status (2026-05-26) — Admin Improvements, Public Share Page & Quick Enquiry

### ✅ Chunk Loading Timeout Fix (`app/layout.tsx`)

Heavy client-only modules (`RouterBinder`, `DefaultDesignLoader`, `ConditionalCanvas`) were statically imported in the server layout, causing `Loading chunk app/layout failed` timeout errors on `/admin`.

**Fix**: created `components/ClientShell.tsx` — a `'use client'` wrapper that lazy-loads all three via `next/dynamic({ ssr: false })`. The server layout now imports only `ClientShell` instead of the heavy modules directly. (`ssr: false` is not permitted in Server Components — it must live in a client component.)

---

### ✅ Admin Orders Page Improvements

`app/admin/orders/page.tsx`:
- Thumbnail image doubled in size (`h-12` → `h-24`)
- "Export SVG" button moved below the thumbnail in the Design cell

`app/admin/orders/[id]/edit/_design-elements-section.tsx`:
- Motif name and thumbnail image are now links opening the SVG in a new tab
- Inscription text has a **CopyText** inline button — click to copy, shows "Copied!" for 2 s

`app/admin/orders/[id]/edit/page.tsx`:
- Main design image shown via `ThumbnailModal` (click to view full-size popup)

---

### ✅ Admin Designs Page Improvements

`app/admin/designs/page.tsx`:
- Added **Thumbnail** column (2nd after Title) using `ThumbnailModal h-16 w-16`
- Added **Edit Design** button (`app/admin/_components/EditDesignButton.tsx`) — client component that replicates My Account's `handleEdit` flow: `fetch /api/projects/${id}` → `applyDesignSnapshot` → `router.push('/select-size')`
- Added **View Design** link to `/design/${id}` (public share page)

---

### ✅ Price Quote Display Fix (`components/PriceQuoteDisplay.tsx`)

Old approach: iframe loading static HTML files at `/saved-designs/html/{year}/{month}/design_{id}.html`. Files missing for new designs caused Next.js to serve the 3D designer inside the iframe.

**Fix**: replaced iframe in `my-account/designs/[id]/page.tsx` and `shared/[token]/page.tsx` with a new `PriceQuoteDisplay` React component that computes the quote inline using `buildPdfQuoteFromProject`.

---

### ✅ Public Share Page (`/design/[id]`)

New shareable URL for any saved design — usable in emails and social media.

**Files created**:
- `app/api/design/[id]/route.ts` — public (no auth) endpoint returning only `id`, `title`, `designState`
- `app/design/[id]/page.tsx` — server component with OG/Twitter metadata, Forever Shining logo header, compact title + price, 50%-width clickable design image, "Open in Designer" button, inline Price Quote
- `app/design/[id]/_open-button.tsx` — `'use client'` component: renders clickable image with hover "Open in Designer" overlay + gold button; both call `handleOpen` which fetches the public API, applies the design snapshot, navigates to `/select-size`

**Shell exclusion**: `ConditionalNav`, `MainContent`, `ConditionalCanvas` all check `pathname?.startsWith('/design/')` to hide the 3D designer shell on share pages.

**Share page layout** (final):
- Header: Forever Shining logo (`h-20`) left + "Create Your Own" gold CTA right
- Compact title + price line (side-by-side, below header)
- Design image at 50% width, centred, clickable (triggers Open in Designer)
- Price Quote below image

---

### ✅ Admin Payments Page

`app/admin/payments/page.tsx`:
- Removed the **Ref** column (was causing table overflow)
- Added **+ Add Payment** CTA button (same style as Add Order)

`app/admin/payments/new/page.tsx` — new payment form matching orders/new style:
- Fields: Order ID, Provider (Bank Transfer / Stripe / PayPal / PayWay / Cash / Cheque / Other), Transaction/Reference, Amount, Currency, Status, Received At
- Same header layout (title + description left, "← Back to Payments" right, border-bottom), section heading, 2-col grid, red error box

`app/api/admin/payments/route.ts` — admin-protected POST endpoint inserting into `payments` table.

---

### ✅ Quick Enquiry Form (Designer)

Two entry points exist for the Quick Enquiry feature — both POST to `app/api/enquiries/route.ts` and attach `projectId`/`accountId` automatically:

1. **Canvas CTA** (`components/ThreeScene.tsx` → `ProductNameHeader()`): Gold-bordered frosted pill button in the 3D canvas, stacked below the `• Product Name` chip at top-left. Desktop only (`hidden lg:flex`). Opens `<QuickEnquiryModal>`.
2. **Sidebar fallback** (`components/DesignerNav.tsx`): Same button below the logo, visible on mobile/tablet only (`lg:hidden`).
3. **Check-price card** (`components/QuickEnquiryForm.tsx`): Collapsible dark-themed card on the `/check-price` page below Saved Designs.

`components/QuickEnquiryModal.tsx` — dark-themed modal (matching DesignerNav style), uses `createPortal` to `document.body`:
- Fields: Name, Email*, Phone, Message*
- Reads `currentProjectId` from Zustand store; attaches it to the POST body if set
- Shows green "✓ Enquiry sent!" success message and auto-closes

`app/api/enquiries/route.ts` — public POST endpoint (no auth required). Saves to the `enquiries` DB table. Admin can view at `/admin/enquiries`.

---

### 📌 Pending / Next Steps (2026-05-26)

- [ ] **SVG export coordinate fix**: Apply `<g transform>` Y-scale in `computePathBounds()` to fix ~1.6 mm outline mismatch
- [ ] **Supplier email template**: Polish HTML email body — add headstone image, nicer formatting
- [ ] **Retrieve Stripe keys**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` + `STRIPE_SECRET_KEY` → `.env.local` + Vercel env vars
- [ ] **Submit sitemap in GSC**: Google Search Console → Sitemaps → `https://forevershining.org/sitemap.xml`
- [ ] **Test Quick Enquiry end-to-end**: verify submission appears in `/admin/enquiries`

---



### ✅ Admin Orders — Invoice View

`app/admin/orders/[id]/page.tsx` — read-only order detail page (server component):

- **Header**: Invoice number `INV-YYYYMM-XXXX`, status badge, action buttons (Edit, Export SVG, Back)
- **Details section** (directly below invoice number): customer name/email, order date, payment method, amount
- **Quote / Design Preview**: lists every inscription, motif, image, and addition from `designState`, matching the email quote format
- **Design screenshot**: shows `screenshotPath` thumbnail (stored as data URL or remote URL)

Layout uses the same admin white/dark-mode card styling as the rest of the admin panel.

---

### ✅ Admin Orders — Edit View

`app/admin/orders/[id]/edit/page.tsx` — interactive client component for editing an order:

**Top section** (read-only):
- Invoice number, status badge, customer info

**Order details** (editable): status selector, payment method, notes

**Design Elements section** (the key feature):
- Every inscription, motif, ceramic image, and 3D addition from `designState` is listed as a card
- Each card has a **checkbox on the right side** for selection
- "**Mail Selected**" button (a `<select>` / button composite) **above** the design elements list — sends the checked items to the supplier via the supplier-mail API
- Removing the old "Order Items" table (which showed raw order line-items) — replaced entirely by Design Elements cards

**Supplier select box**: a `<select>` dropdown to pick which supplier/email address to send to, placed to the left of "Mail Selected".

---

### ✅ Supplier Mail Feature

`app/api/orders/[id]/send-supplier/route.ts` — POST endpoint:

- Accepts `{ supplierEmail, items: string[] }` (items = human-readable lines for selected design elements)
- Uses Nodemailer + the existing email config to send a plain-text / HTML email to the supplier
- Email body lists the design elements the admin checked, plus the order invoice number and screenshot URL
- Returns `{ ok: true }` on success

The admin Edit page calls this API when "Mail Selected" is clicked with at least one checkbox ticked.

---

### ✅ SVG Export — Ordered Design as Vector

`app/api/orders/[id]/export-svg/route.ts` — `GET` endpoint (admin-only, requires `adminToken` cookie):

**Purpose**: Suppliers use the SVG to position elements in Illustrator/Photoshop for laser etching or sandblasting. The SVG is overlaid at 50% opacity over the saved design screenshot to verify placement.

**Output**: A single SVG file (`order-INV-xxx.svg`) containing:
1. **Stone outline** — the shape path scaled to the stone's `widthMm × heightMm` dimensions in mm
2. **Inscriptions** — `<text>` elements positioned using the stored `xPos`/`yPos` coordinates
3. **Motifs** — SVG paths scaled to the motif's `heightMm`, positioned at the motif offset

**Coordinate system** (critical — matches Three.js geometry pipeline):
- `geoToMm = widthMm / dx` where `dx` = actual path bounding-box width (from `computePathBounds()`)
- Stone outline: `translate(tx, ty) scale(geoToMm, geoToMm)` — isotropic transform
  - `tx = cx - centerX * geoToMm`, `ty = -minY * geoToMm`
- Inscriptions (`coordinateSpace` handling):
  - `undefined` or `'absolute'` → `svgY = stoneH - yPos * geoToMm` (geo Y=0 is stone bottom)
  - `'mm-center'` → `svgY = cy - yPos`, `svgX = cx + xPos`  
  - `'offset'` → `svgY = cy + yPos * geoToMm`, `svgX = cx + xPos * geoToMm`
  - Default zero `(0,0)` → always maps to stone centre `(cx, cy)`
- Motifs: same `geoToSvg()` function, then positioned with `translate(mx, my)` + aspect-correct scale

**`computePathBounds()` helper** (lines 39–65 of route.ts):
- Parses all number-pairs from SVG `d` attributes as `(X, Y)` coordinates
- Returns `{ minX, maxX, minY, maxY, dx, dy, centerX }`
- Used to compute isotropic `geoToMm = widthMm / dx` (replaces the old `widthMm / shapeViewW` which used viewBox width 400 regardless of actual path extent)
- **Limitation**: treats bezier control points as actual curve points → dx may be ≈1–2% larger than Three.js's sampled dx (which uses `shape.getPoints(256)`). For the test order (`cropped_peak.svg`, dx=400) this is exact.

**"Export SVG" button** added to the admin orders list (`app/admin/orders/page.tsx`) as a direct download link next to the Edit button.

**Known open issue**: For some orders, inscriptions still appear shifted by a few mm relative to the 3D screenshot overlay. Root cause is under investigation — see SVG Coordinate Investigation section below.

---

### 🔬 SVG Export — Coordinate Investigation (In Progress)

**Symptom**: Inscriptions in the exported SVG appear "moved to the top" when overlaid on the saved design screenshot in Illustrator.

**Test order**: `INV-202605-81AH`, shape `cropped_peak.svg`, stone 850×850mm.

**Actual DB values** (confirmed by querying `orders` + `projects`):
- Inscriptions have no `coordinateSpace` field → treated as absolute geometry-local coords
- "Larkin Watts": `yPos=306.54` → `svgY = 850 - 306.54×2.125 = 198.6mm` from stone top (76.6% up from bottom)
- Motif butterfly: `coordinateSpace='mm-center'`, `yPos=44.15` → `svgY = cy - 44.15 = 380.85mm`

**Three.js coordinate pipeline** (confirmed by reading `SvgHeadstone.tsx` + `AutoFit.tsx`):
- `dx_3js = 400` (from `getPoints(256)` sampling of cropped_peak.svg after Y-scale 0.9975)
- `geoToMm = 850/400 = 2.125` ← this is what the code computes AND what Three.js uses → no error here
- Stone bottom at geo Y=0, stone top at geo Y=400 (targetH_SV)
- AutoFit camera: `dir = (0,0,1)` → perfectly front-on, zero elevation → perspective distortion is negligible (<3mm)

**Math check**: `svgY = 850 - 306.54 × 2.125 = 198.6mm` is provably correct.

**Current hypothesis**: The visual mismatch may be caused by the stone outline in the SVG not perfectly matching the 3D-rendered shape, causing the user to misalign when overlaying. The `cropped_peak.svg` has a Y-scale transform `matrix(1,0,0,0.9975,0,0)` in the SVG source that `computePathBounds` ignores (reads raw path from `<defs>` without applying the parent `<g>` transform). Effect is a ~0.25% Y stretch in the SVG outline → 1.6mm difference at the stone bottom.

**Next steps**:
- Apply the `<g transform>` matrix when extracting path coordinates in `computePathBounds`
- Add an SVG debug comment showing all computed values (`dx`, `geoToMm`, per-inscription `xPos`/`yPos`/`svgX`/`svgY`) to help verify
- Check whether `cropped_peak.svg`'s 0.9975 Y-scale is significant enough to cause visible misalignment at the bottom

---

### 📌 Pending / Next Steps (2026-06-02)

- [ ] **SVG export coordinate fix**: Apply `<g transform>` Y-scale when computing path bounds in `computePathBounds()` — so stone outline exactly matches Three.js rendering
- [ ] **SVG debug mode**: Add `?debug=1` query param to the export endpoint to include SVG comments with all computed values for troubleshooting
- [ ] **Supplier email template**: Polish the HTML email body sent to supplier — add headstone image, nicer formatting
- [ ] **Retrieve Stripe keys**: Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY` from Stripe dashboard → `.env.local` + Vercel env vars
- [ ] **Submit sitemap in GSC**: Google Search Console → Sitemaps → `https://forevershining.org/sitemap.xml`

---

## Current Status (2026-05-25) — GSC Analysis & SEO Indexing Fixes

### 🔍 Google Search Console Analysis (forevershining.org)

GSC data as of 2026-05-25:
- **2,100 pages indexed** — green trend rising since ~May 7 (positive signal)
- **1,370 not indexed** breakdown:
  | Reason | Count |
  |--------|-------|
  | Discovered – not currently indexed | 1,147 |
  | Crawled – not indexed | 204 |
  | Page has redirect | 10 |
  | Soft 404 | 3 |
  | Noindex tag | 1 |
  | Duplicate without canonical | 1 |

Root causes identified:
1. **Near-duplicate content** — intro paragraph was picked from 4 templates by `parseInt(design.id) % 4`; within the same category/product, hundreds of pages were nearly identical
2. **Fake structured data review** — same hardcoded `"Margaret T."` review with `4.8/247` rating on all 3,114 design pages → Google spam signal
3. **Zero pre-rendering** — `generateStaticParams()` returned `[]`; every Googlebot hit triggered a cold ISR render
4. **Broken sitemap image entries** — ~73 design pages referenced screenshots that didn't exist on disk

---

### ✅ Fix 1 — Unique Per-Design Intro Content (`components/DesignContentBlock.tsx`)

Replaced the 4-template rotating `generateIntro()` with a truly unique paragraph per design:
- Decodes `design.inscriptions` HTML entities and extracts the first ~10 words as a quoted inscription snippet
- Incorporates `design.motifNames`, `design.shapeName`, `categoryTitle`, and `productType`
- Falls back to shape + motif description when inscriptions are absent
- Eliminates near-duplicate content across all 3,114 gallery pages — the primary indexing blocker

> **Privacy note**: `design.inscriptions` in `SavedDesignMetadata` is the raw customer inscription text. Using the first 10 words as a snippet is intentional — it is already publicly visible on the design preview screenshot, and it makes each page genuinely unique. Do NOT render full inscription text in SSR (personal names/dates of people still living).

---

### ✅ Fix 2 — Removed Fake Review Structured Data (`app/designs/[productType]/[category]/[slug]/page.tsx`)

Removed the hardcoded `aggregateRating` (4.8 / 247 reviews) and `review` (author: "Margaret T.") blocks from the Product JSON-LD schema. These were **identical** across all 3,114 design pages — Google detects fabricated identical reviews and can suppress or penalise the entire site's structured data.

If real reviews become available (e.g. from a reviews DB table), add `aggregateRating` at the product-type level only (not per-design page).

---

### ✅ Fix 3 — Sitemap Filtered to Designs With Screenshots (`app/sitemap.ts`)

Added `getScreenshotIds()` using `fs.readdirSync('public/screenshots/v2026-3d')`:
- Builds a `Set<string>` of design IDs with a real `.png` on disk (excludes `_small` variants)
- `indexableDesigns` only includes designs where `screenshotIds.has(design.id)` is true
- Eliminated ~73 broken `images:` entries (out of 3,114) pointing to non-existent PNGs
- Category pages still use the full `designs` array for `lastModified` tracking

---

### ✅ Fix 4 — Pre-render Top 500 Designs at Build Time (`app/designs/.../page.tsx`)

Changed `generateStaticParams()` from `return []` to returning the 500 most-recently added designs:
```typescript
return getAllSavedDesigns()
  .sort((a, b) => parseInt(b.id) - parseInt(a.id))
  .slice(0, 500)
  .map((design) => ({ productType: design.productSlug, category: design.category, slug: design.slug }));
```
These pages are now pre-rendered as static HTML at build time. Googlebot no longer triggers cold ISR renders for the most-visited URLs. Remaining ~2,600 pages continue to use `revalidate = 86400` ISR.

---

### 📌 Pending / Next Steps (2026-05-25)

- [ ] **Monitor GSC weekly** — expect the 1,147 "Discovered – not indexed" to reduce over 2–4 weeks as Google re-crawls. Trigger reindex via GSC URL Inspection on the most important category pages
- [ ] **Request GSC reindex** of `/sitemap.xml` after this deployment so Google picks up the cleaned sitemap
- [ ] **Improve category page content** — `/designs/[productType]/[category]` pages may be among the 204 "Crawled – not indexed"; adding more unique descriptive text per category could help
- [ ] **Add real reviews** — if a reviews table exists or is added to the DB, surface `aggregateRating` on product-type pages only (not individual design pages)
- [ ] **Submit sitemap in GSC**: Google Search Console → Sitemaps → `https://forevershining.org/sitemap.xml`

---

## Current Status (2026-05-20) — Admin Panel, Payment Integration & Order Persistence

### ✅ Modern Admin Panel (`/admin`)

A full modern admin panel was created at `app/admin/` — white/dark-mode design, separate from the Designer UI.

**Auth**: Admin login renders inline at `/admin` (no URL change, no register). First admin account: `admin@forevershining.online` / `TechPar123` — seeded directly in the DB. `lib/auth/admin-session.ts` stores a separate `adminToken` cookie; `requireAdminSession()` helper used by all admin pages.

**Layout** (`app/admin/layout.tsx`): Left sidebar with nav links (Dashboard, Orders, Customers, Designs, Payments, Enquiries, System), dark-mode toggle (Day/Night button, top-right), responsive.

**Pages created**:
- `app/admin/page.tsx` — Dashboard with stat cards (Total Orders, Customers, Designs, Enquiries, New Enquiries) + Recent Orders table
- `app/admin/orders/page.tsx` — Orders list with status badges, invoice numbers, customer info
- `app/admin/orders/new/page.tsx` — Add Custom Order form: `CustomerPicker` combobox (debounced search via `GET /api/admin/customers/search?q=`), line items with multi-line `<textarea>` descriptions, totals
- `app/admin/customers/page.tsx` — Customers list
- `app/admin/customers/new/page.tsx` — New Customer form: Account (email, password, role), Personal Details (name, phone, DOB, gender), Business Details (org, tradingName, taxId, website), Address (4-field, country dropdown defaulting to Australia)

**API routes added**:
- `GET /api/admin/customers/search?q=` — case-insensitive search on email, firstName, lastName, organization; returns up to 20 results

---

### ✅ Place Order — Three Payment Options

`app/my-account/designs/[id]/buy/page.tsx` updated with three payment methods:

1. **Credit Card** — Stripe Checkout (redirect-based)
2. **PayPal** — PayPal Buttons SDK rendered inline
3. **Pay by Phone / BPAY / Cheque** — shows real business details:
   - Phone: `(08) 6191 0396 / 0419 945 950 / 1300 851 181 / +61 8 6191 0396`
   - BPAY: Biller Code `566380`, reference = order ID
   - Direct Deposit: The Stainless Steel Monument Company Pty Ltd, BSB 034-604, Acc 192-715
   - Cheque: PO Box 1268, Bibra Lake WA 6965

Both payment SDKs loaded via `next/script` with `strategy="lazyOnload"`:
- `https://js.stripe.com/v3/`
- `https://www.paypal.com/sdk/js?client-id=ARAQC6sW5wGhZbGbPoaqMhKYylVVgDXkLP3PVKGhDd_OywkKfwoqybq9Wf0-wPVghD4qxkbKIOHquUpt&currency=AUD`

---

### ✅ Stripe Checkout Integration

`app/api/checkout/stripe/route.ts` — POST handler: instantiates `Stripe` inside the handler (not module-level, so missing key returns a clean 500 instead of crash), validates `STRIPE_SECRET_KEY`, creates a `stripe.checkout.sessions.create()` with `price_data` (line-item mode), returns `{ sessionId }`.

Client calls `window.Stripe(NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY).redirectToCheckout({ sessionId })`.

**Image URL guard**: only passes `images` to Stripe if `screenshotUrl` starts with `http` (Stripe requires absolute URLs).

**Required env vars** (set in `.env.local` + Vercel Environment Variables):
- `STRIPE_SECRET_KEY=sk_live_...` (retrieve from Stripe dashboard — do NOT commit)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...` (retrieve from Stripe dashboard)

---

### ✅ PayPal Buttons Integration

`paypal.Buttons()` rendered into a `ref` container when `paymentType === 'paypal'` and `paypalReady === true`. `paypalRendered` ref prevents double-render. Re-renders when `testMode` changes.

`onApprove` captures payment and calls `POST /api/orders` to persist the order (status=`paid`).

---

### ✅ Localhost Test Mode ($1)

Amber checkbox "🧪 Test mode — charge $1.00 instead of real price" shown only when `window.location.hostname === 'localhost'`.

`effectiveAmountCents = testMode ? 100 : project?.totalPriceCents ?? 0` — passed to both Stripe and PayPal. Real price shown with strikethrough when test mode is active.

---

### ✅ Order Persistence — Orders Saved to Database

**Critical bug fixed**: previously, completed payments (Stripe, PayPal, BPAY) never wrote to the `orders` table, so the admin dashboard always showed 0.

**New API routes**:
- `POST /api/orders` — creates `orders` + `orderItems` + `payments` records. Accepts `{ projectId, amountCents, currency, paymentMethod, paymentRef, status, designName }`. Generates invoice number `INV-YYYYMM-RAND`. Returns `{ orderId, invoiceNumber }`.
- `PATCH /api/orders/[id]` — updates order status + payment status. Used by Stripe success redirect to mark order as `paid`.

**Flow per payment method**:
- **Stripe**: `POST /api/orders` (status=`pending`) → store `orderId` in `sessionStorage` → redirect to Stripe. On `?payment=success` return: read `orderId`, `PATCH /api/orders/[id]` → status=`paid`.
- **PayPal**: `POST /api/orders` (status=`paid`) in `onApprove` callback with PayPal `details.id` as `providerRef`.
- **BPAY/Other**: `POST /api/orders` (status=`pending`) before showing confirmation.

---

### 📌 Pending / Next Steps (2026-05-20)

- [ ] Retrieve and set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` from Stripe dashboard → add to `.env.local` and Vercel env vars
- [ ] Test full Stripe flow end-to-end on production with test card `4242 4242 4242 4242` + test mode checkbox
- [ ] **Update `DetailedPriceQuote`** in `DesignPageClient.tsx`: change fetch URLs from `html/${designId}.html` → `html-anon/${designId}.html`
- [ ] **Fix TS error in `ShapeSwapper.tsx` ~line 541**: `faceTexture` is `string | null` for polished
- [ ] **Submit sitemap in GSC**: Google Search Console → Sitemaps → `https://forevershining.org/sitemap.xml`
- [ ] **db:sync to remote**: Run `pnpm db:sync` to ensure remote home.pl DB has `json_path` column

---

## Current Status (2026-05-19) — Panel Header UX Redesign & Card Selector Polish

### ✅ Panel Header — Prev/Next Navigation Buttons

`components/DesignerNav.tsx`: Added step-based navigation so users can move between fullscreen panels without returning to the menu.

**New computed values** (in the main component body):
- `navigablePanelSlugs` — `useMemo` that filters `menuItems` to those in `fullscreenPanelSlugs` and visible for the current product type (hides `select-material` for laser, `select-border` when no border, `select-additions` for plaques, `select-emblems` when not product 5)
- `currentPanelIndex` — index of `activeFullscreenPanel` within `navigablePanelSlugs`
- `prevPanelSlug` / `nextPanelSlug` — adjacent slugs (undefined at boundaries → buttons disabled)
- `handleNavigateToPanel(slug)` — routes via `router.push()` for route-based panels; calls `openFullscreenPanel()` for canvas-only panels (e.g. `select-shape` when canvas is visible)

**Buttons**: Pill style `rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80`, disabled at boundary with `opacity-30`. Chevron SVG icons.

---

### ✅ Panel Header — Full Layout Redesign

The fullscreen panel header (`hidden md:block` section in `DesignerNav.tsx`) was fully rebuilt into 3 rows:

```
  Guided Step  [3 / 6]        ← Row 1: centered flex, italic Playfair label + gold step badge
     Select Size              ← Row 2: h2 centered, font-serif font-light tracking-tight text-3xl
  ──── ◆ ────                 ← Row 3: fancy divider — gradient lines + rotated diamond in gold
[‹ Menu] [⊞ List?]   [‹ Prev] [Next ›]   ← Row 4: buttons row
```

- **"Guided Step"** label: `font-playfair-display italic tracking-[0.35em]` in `#aaaaaa`
- **Step badge** `[3 / 6]`: gold number / dim slash / dim total — `rounded-full border border-white/20 bg-white/5`
- **Section title**: `font-serif font-light tracking-tight text-3xl` — matches the `select-product` page heading style (`ProductSelectionGrid.tsx` h1)
- **Fancy divider**: two gradient lines (`from-transparent via-white/20 to-primary/40`) with a small rotated square diamond (gold `bg-primary/50`) in the center
- **Menu** button: left side with chevron icon; **List** button (conditional, shown in additions/motifs panels) beside it
- **Prev / Next** buttons: right side

The two sub-panel headers ("Corners", "Holes") also use the same `Guided Step` label and were updated to `color: '#aaaaaa'`.

---

### ✅ Card Selectors — Selected State & Hover Polish

**`components/MaterialSelector.tsx`**:
- Selected card outer button: `ring-2 ring-[#D7B356] ring-offset-1 ring-offset-[#1b1511]`
- Gold checkmark badge: `absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D7B356]` with SVG check path `M5 13l4 4L19 7`
- Unselected hover: `hover:ring-1 hover:ring-[#D7B356]/50 hover:ring-offset-1`

**`components/ShapeSelector.tsx`**:
- Gold checkmark badge added to both urn shapes and standard shapes selected cards

**`components/BorderSelector.tsx`**:
- Unselected cards: `hover:border-[#D7B356]/40`
- Selected card: gold checkmark badge inside the preview div

---

### ✅ Step Indicator — Dynamic "Step X of Y"

The "Guided Step" row shows a step badge using `currentPanelIndex + 1` / `navigablePanelSlugs.length`. Updates automatically as the user navigates between panels. Step count is product-aware (excludes panels hidden for the current product type).

---

### 📌 Pending / Next Steps (2026-05-19)

- [ ] **Update `DetailedPriceQuote`** in `DesignPageClient.tsx`: change fetch URLs from `html/${designId}.html` → `html-anon/${designId}.html` (and `-desktop`)
- [ ] **Fix TS error in `ShapeSwapper.tsx` ~line 541**: `faceTexture` is `string | null` for polished — pass swatch URL as fallback or widen prop type to `string | null`
- [ ] **Submit sitemap in GSC**: Google Search Console → Sitemaps → `https://forevershining.org/sitemap.xml`
- [ ] **db:sync to remote**: Run `pnpm db:sync` to ensure remote home.pl DB has `json_path` column
- [ ] **Add 6 failures to KNOWN_FAILURES** in `scripts/batch-screenshot.js`: `1662337522025`, `1667480366612`, `1670405007473`, `1673437084641`, `1675259335154`, `1752619990342`

---

## Current Status (2026-05-14 evening) — SS Plaque Physical Mounting Holes (Product 52)

### ✅ Holes Nav Item & Sub-Panel (Product 52 only)

`lib/headstone-store.types.ts` + `lib/headstone-store.ts`: Added `ssHoles: 'corner' | 'side-center' | 'none'` state (default `'none'`) + `setSsHoles` setter.

`components/DesignerNav.tsx`:

- **Nav item**: "Mounting Holes" appears only when `productId === '52'`, same pattern as the Corners nav item — not in `fullscreenPanelSlugs`, not in `shouldShowFullscreenPanel`, route-sync `else` branch guarded with `activeFullscreenPanel !== 'holes'`.
- **3-way render ternary**: `shouldShowFullscreenPanel ? <fullscreen panel> : activeFullscreenPanel === 'holes' ? <holes sub-panel> : <normal menu>` — sub-panel has a "← Back to Menu" button, title header, and three option cards:
  - **Hole on each corner** (`ssHoles === 'corner'`) — 4 holes, one per corner
  - **Holes in the center of each side** (`ssHoles === 'side-center'`) — 2 holes, midpoint of left & right edges
  - **No drilled holes** (`ssHoles === 'none'`) — no holes
- Selected card highlighted with gold border (`border-[#DEBD68]`); unselected with `border-white/10`.

---

### ✅ Physical Punch-Through Holes in 3D Canvas (front & back)

`components/three/headstone/SsPlaqueHoles.tsx` *(new file, completely rewritten from circle geometry to canvas alpha map)*:

Implements true transparent cutouts using a canvas `alphaMap` on cloned face materials:

1. Creates a `1024×1024` canvas (white = opaque everywhere by default).
2. Draws grey ellipses (rim, `HOLE_RADIUS_M * RIM_RATIO`) then black ellipses (`HOLE_RADIUS_M = 0.004 m`) at each hole's UV position.
3. UV positions:
   - `EDGE_INSET_M = 0.018 m` from each edge
   - `iu = EDGE_INSET_M / worldWidth`, `iv = EDGE_INSET_M / worldHeight`
   - Canvas y-flip: `cy = (1 - v) * CANVAS_SIZE` (canvas y=0 is top, UV v=0 is bottom)
4. Clones both `material[0]` (front face) and `material[1]` (back face + sides) from the mesh; applies the same `alphaMap` canvas texture to both with `alphaTest = 0.5` (hard discard — no sorting issues).
5. Full cleanup in `useLayoutEffect` teardown: restores original materials, disposes both clones and the canvas texture.

`components/three/headstone/ShapeSwapper.tsx`: renders `<SsPlaqueHoles>` inside the `SvgHeadstone` callback when `isStainlessSteel`. Passes `meshRef={api.mesh}`, `worldWidth={api.worldWidth}`, `worldHeight={api.worldHeight}`. Component is always rendered (handles `'none'` internally via early return in the effect — no guard in ShapeSwapper).

**Key constants** (`SsPlaqueHoles.tsx`):
- `HOLE_RADIUS_M = 0.004` — 4 mm radius hole
- `EDGE_INSET_M = 0.018` — 18 mm from each edge
- `RIM_RATIO = 1.4` — rim is 40% larger than hole
- `CANVAS_SIZE = 1024`

**Material group note**: `material[1]` covers sides too (12 mm deep plaque). Side UVs use perimeter coordinates, so the hole circles appear negligible (~0.4% of perimeter UV) and produce no visible artefacts.

> **`alphaTest` vs `transparent`**: Use `alphaTest = 0.5` for hard cutouts — fragments below threshold are fully discarded and don't write the depth buffer. `transparent: true` would cause PBR sorting issues with metallic materials.

> **Coordinate space warning (SvgHeadstone children)**: Children in the `SvgHeadstone` render callback live inside `<group scale={meshScale}>` where `meshScale = [scale*sCore, scale*sCore, scale]`. World-metre values passed as local positions get scaled again → invisible. Must convert: `localPos = worldPos * api.unitsPerMeter`. `SsPlaqueHoles` bypasses this by working directly on `mesh.material` via `meshRef` — no R3F scene-graph positioning needed.

> **PowerShell template literal corruption**: When injecting JSX with backtick template literals via PowerShell string replacement, backticks get corrupted to `\x0C` (form-feed char). Always use the `edit` tool for JSX with template literals.

---

### 📌 Pending / Next Steps (2026-05-14 evening)

- [ ] **Update `DetailedPriceQuote`** in `DesignPageClient.tsx`: change fetch URLs from `html/${designId}.html` → `html-anon/${designId}.html` (and `-desktop`); remove client-side JSON comparison + HTML replacement block (lines ~3268–3290)
- [ ] **Fix TS error in `ShapeSwapper.tsx` ~line 541**: `faceTexture` is `string | null` for polished — pass swatch URL as fallback or widen prop type to `string | null`
- [ ] **Submit sitemap in GSC**: Google Search Console → Sitemaps → `https://forevershining.org/sitemap.xml`
- [ ] **db:sync to remote**: Run `pnpm db:sync` to ensure remote home.pl DB has `json_path` column
- [ ] **Add 6 failures to KNOWN_FAILURES** in `scripts/batch-screenshot.js`: `1662337522025`, `1667480366612`, `1670405007473`, `1673437084641`, `1675259335154`, `1752619990342`

---

## Current Status (2026-05-14) — SEO Structured Data, Sitemap Fixes & Price-Quote Privacy

### ✅ Google Search Console — Structured Data Fixes

`app/designs/[productType]/[category]/[slug]/page.tsx`: Added `highPrice` (product-type-specific AUD tiers), `aggregateRating` (4.8/5, 247 reviews), and `review` to Product JSON-LD schema.

`app/products/[productSlug]/page.tsx`: Added `lowPrice`/`highPrice` (695–9995 AUD), `aggregateRating`, `review` to JSON-LD; changed currency from USD to AUD.

`app/products/[productSlug]/[templateType]/[venue]/[inscription]/page.tsx`: Improved `aggregateRating` (added `bestRating`/`worstRating`), added `review`.

---

### ✅ Sitemap Fixes (3,293 unindexed pages)

`app/sitemap.ts`:
- Replaced `force-dynamic` with `revalidate = 86400` (ISR caching — was rebuilding on every Googlebot request)
- Fixed all `lastModified` to use actual dates: design pages now use `new Date(parseInt(design.id))` (design IDs are Unix ms timestamps)
- Added `images` array to design page sitemap entries (image sitemap)
- Category pages now use max-design-date per category
- Added `SITE_LAUNCH_DATE` constant (~Feb 13, 2026) for static pages

`app/robots.ts`: Added `/ml/` to disallow list.

---

### ✅ SSR Content — Design Detail Pages

`app/designs/[productType]/[category]/[slug]/page.tsx`: Replaced the minimal 4-tile grid + feature bullets in `div#design-ssr-content` with:
- A full **Design Specifications `<dl>` table** (material, shape, finish, category, inscription count, motifs, photo, size)
- A **Price Guide `<table>`** with line-item breakdown (headstone range, inscriptions, motifs, ceramic photo, delivery — AUD, no personal data)

> **Critical**: `design.inscriptions` contains raw customer names — NEVER render in SSR. Only `design.inscriptionCount`, `design.motifNames`, `design.hasPhoto`, etc. are safe.
> **Note**: The SSR content is hidden post-hydration — `DesignPageClient.tsx` line ~1194 runs `document.getElementById('design-ssr-content').style.display = 'none'` on mount. Google sees it before JS loads.

---

### ✅ Price-Quote Privacy — Anonymization at Rest

`/public/ml/*/saved-designs/html/*.html` files contain real customer names, dates, and prices and were publicly accessible. Fixed with two layers:

**`middleware.ts`**: Added `BLOCKED_PATHS = /^\/ml\/[^/]+\/saved-designs\/html\/[^/]+\.html$/` — returns 404 for direct URL access before any auth/cookie logic (lines 22–25). The middleware matcher deliberately excludes `.html` from its static-asset bypass regex, so this works.

**`lib/inscription-sanitizer.ts`** *(new)*: Shared pure-function anonymization library extracted from `DesignPageClient.tsx`. Exports: `NameDatabase`, `hashString`, `getGenderFromCategory`, `getRandomName`, `getRandomSurname`, `getRandomFirstName`, `sanitizeInscription`. Anonymization is seeded-deterministic — same input always gives same output (hash of original text).

**`scripts/anonymize-price-quotes.ts`** *(new)*: Pre-processing script — generates `html-anon/` directories with anonymized HTML for all 3 mlDirs (`forevershining`, `headstonesdesigner`, `bronze-plaque`). Includes mtime check (skip if `html-anon/` output newer than source) for safe re-runs. Run via: `pnpm anonymize-quotes`.

**`package.json`**: Added `"anonymize-quotes": "tsx scripts/anonymize-price-quotes.ts"` script.

> **Name database files**: `public/json/firstnames_f_small.json`, `public/json/firstnames_m_small.json`, `public/json/surnames_small.json` — simple string arrays (1050 first names, 381 surnames).

---

### ✅ SSR Performance — Removed Circular Self-HTTP Fetch

`app/designs/[productType]/[category]/[slug]/page.tsx`: Removed `getDesignShape()` (~50 lines) that made an HTTP fetch to `/ml/{dir}/saved-designs/json/{id}.json` on every SSR render, adding 200–2000ms TTFB. `design.shapeName` is already in `SavedDesignMetadata` — replaced with a synchronous `formatShapeName()` helper.

---

### 📌 Pending / Next Steps (2026-05-14)

- [ ] **Update `DetailedPriceQuote`** in `DesignPageClient.tsx`: change fetch URLs from `html/${designId}.html` → `html-anon/${designId}.html` (and `-desktop`); remove client-side JSON comparison + HTML replacement block (lines ~3268–3290); delete the `originalDesignResponse` fetch + `originalInscriptions.forEach` loop
- [ ] **Optional**: Refactor `DesignPageClient.tsx` to import from `lib/inscription-sanitizer.ts` (removes duplication — logic is currently identical)
- [ ] **Fix TS error in `ShapeSwapper.tsx` ~line 541**: `faceTexture` yields `string | null` for polished — pass swatch URL as fallback or widen prop type to `string | null`
- [ ] **Enable legacy DYO payments**: Port the payment flow from the legacy Flash/PHP DYO app into the Next.js stack. See `legacy/` folder for reference PHP payment handling.
- [ ] **Submit sitemap in GSC**: Google Search Console → Sitemaps → `https://forevershining.org/sitemap.xml`
- [ ] **db:sync to remote**: Run `pnpm db:sync` to ensure remote home.pl DB has `json_path` column
- [ ] **Add 6 failures to KNOWN_FAILURES** in `scripts/batch-screenshot.js`: `1662337522025`, `1667480366612`, `1670405007473`, `1673437084641`, `1675259335154`, `1752619990342`

---

## Current Status (2026-05-13 evening) — SS Plaque Corners Feature & Geometry Fix (Product 52)

### ✅ Brushed Finish Default Selection Fix

`components/MaterialSelector.tsx`: Added `SS_URLS` constant (array of brushed + polished swatch URLs). Added `useEffect` that fires when `isStainlessSteel && !SS_URLS.includes(headstoneMaterialUrl)` — auto-sets `headstoneMaterialUrl` to the brushed SS URL so the swatch always appears highlighted on first load (store default is `Imperial-Red.webp` which doesn't match either SS swatch). Changed `activeSsUrl` fallback to use `SS_URLS.includes(...)` guard so the yellow selection border shows immediately before the effect fires.

---

### ✅ Corners Nav Item & Sub-Panel (Product 52 only)

`lib/headstone-store.ts` + `lib/headstone-store.types.ts`: Added `ssCorners: 'straight' | 'rounded'` state (default `'straight'`) + `setSsCorners` setter.

`components/DesignerNav.tsx`:

- **Nav item**: "Select Corners" appears only when `productId === '52'`, uses `ViewfinderCircleIcon`, no badge text, no inline panel expansion.
- **Panel system**: `'corners'` is intentionally **not** in `fullscreenPanelSlugs` (prevents the route-sync `useEffect` from clearing the state and causing flicker). `shouldShowFullscreenPanel` excludes `'corners'`. The auto-clear `else` branch in the route-sync effect is guarded with `activeFullscreenPanel !== 'corners'`.
- **3-way render ternary**: `shouldShowFullscreenPanel ? <fullscreen panel> : activeFullscreenPanel === 'corners' ? <corners sub-panel> : <normal menu>` — the corners sub-panel has a "← Back to Menu" button, title header, and two SVG-preview cards (Straight / Rounded).

`components/three/headstone/ShapeSwapper.tsx`: reads `ssCorners` from store; passes `cornerRadius={isStainlessSteel && ssCorners === 'rounded' ? 25 : 0}` to `SvgHeadstone`.

---

### ✅ Rounded Corners 3D Geometry Fix (All 4 Corners)

`components/SvgHeadstone.tsx` — root cause and fix:

The SS plaque (300×200 mm) uses the 400×400 square SVG. With `targetHeight = 0.2m` but `coreH_world = 0.3m`, the shape is **shrinking** (not expanding), so `bottomTarget_SV = 266.67 < maxY = 400`. The old code used `effectiveBottom = Math.max(maxY, bottomTarget_SV) = 400`, but then the vertex-clamp pass (`P[i+1] > bottomTarget_SV → bottomTarget_SV`) sliced off all bottom rounded-corner vertices, making them flat.

**Fixes applied:**

1. **`effectiveBottom`**: Changed from `Math.max(maxY, bottomTarget_SV)` to simply `bottomTarget_SV`. The rounded rect is now built to exactly the target height in both the expanding and shrinking cases.

2. **Vertex-clamp guard**: `else if (preserveTop && wantH < coreH_world - 1e-9 && !cornerRadius)` — skip vertex clamping when `cornerRadius > 0` (the rounded rect is already sized to `bottomTarget_SV`).

3. **Outline `isExpanded` guard**: `const isExpanded = preserveTop && wantH > coreH_world + 1e-4 && !shapeParams.cornerRadius` — skip the outline stitching path when rounded corners are active (the base shape already has the correct bounds, the stitcher would insert sharp corner points).

4. **Band guard** (from prior session): `if (preserveTop && wantH > coreH_world + 1e-9 && !cornerRadius)` — skip the rectangular extension band when rounded corners are used.

> **Key insight**: `outline` is only used for UV/texture projection and child positioning — it does NOT affect the 3D mesh shape. The mesh is determined purely by `new THREE.ExtrudeGeometry(base, extrudeSettings)` where `base` is the `THREE.Shape` returned from `shapeParams`.

---

### 📌 Pending / Next Steps (2026-05-13 evening) — moved to 2026-05-14 section above

---

## Current Status (2026-05-13) — Stainless Steel Plaque Finish Options (Product 52)

### ✅ Finish Picker UI for Product 52

`app/select-material/_ui/MaterialSelectionGrid.tsx` and `components/MaterialSelector.tsx`: both components detect `productId === '52'` (`isStainlessSteel`) and render a dedicated 2-option finish picker instead of the standard material grid:

- **Brushed Finish** (default) → `/jpg/metals/l/brushed-ss-swatch.jpg`
- **Highly Polished Finish** → `/jpg/metals/l/high-polished-ss-swatch.jpg`

Full-page view uses image cards; sidebar view uses a compact 2-button grid. Thumbnails use plain `<img>` (not `<Image fill>`) to bypass Next.js image optimization which was returning blank images for the JPEG swatches.

---

### ✅ PBR Material Presets in 3D Scene

`components/SvgHeadstone.tsx`: added `isStainlessSteel` and `ssFinish: 'brushed' | 'polished'` props. When `isStainlessSteel` is true the `useMemo` builds a `MeshPhysicalMaterial` preset instead of the granite material:

| Preset | metalness | roughness | clearcoat | clearcoatRoughness | envMapIntensity |
|--------|-----------|-----------|-----------|-------------------|-----------------|
| **Brushed** | 0.88 | 0.32 | 0.70 | 0.25 | 1.6 |
| **Polished** | 1.00 | 0.05 | 1.00 | 0.04 | 3.0 |

Brushed uses the swatch JPEG as an albedo map (`clonedFaceMap`). Polished has no face texture (warm silver color `0xdedad6`).

`components/three/headstone/ShapeSwapper.tsx`: detects `catalog?.product.id === '52'`, derives `ssFinish` from `headstoneMaterialUrl`, passes both to `SvgHeadstone`, and returns `null` from `urnInlayTexUrl` for product 52 (prevents enamel inlay rendering).

> **Known TS issue**: `faceTexture` prop in `SvgHeadstone` is typed as `string` (non-nullable). For polished finish, ShapeSwapper line ~541 passes `null`, causing a type error. Fix: pass the polished swatch URL as a fallback string, or widen the prop type to `string | null`.

---

### ✅ Shape Filtering & Post-Shape Routing for Product 52

`components/three/headstone/ShapeSelectionGrid.tsx`: product 52 added to the rectangle-only filter (alongside `isFullColourPlaque`) — only **Landscape** and **Portrait** rectangle shapes are shown.

Post-shape routing: after shape selection, product 52 routes to `/select-material` (same as product 32 bronze plaques).

---

### ✅ Grass Texture Fix for Tiny SS Plaque

The 300×200 mm plaque puts the camera only ~0.28 m away, causing the grass repeat tiles to appear enormous and pixelated.

`components/three/Scene.tsx` + `GrassFloor`: added `repeat` prop to `GrassFloor`; product 52 uses `repeat={150}` (tiles are ~2×2 m instead of ~11×11 m), producing fine grass texture at close range. The `pad={3}` approach (pushing camera back 3 m) was tried and reverted — autofit remains unmodified.

---

### 📌 Pending / Next Steps — moved to 2026-05-13 evening section above

---

## Current Status (2026-05-12 evening) — Legacy Texture Mapping, Email Logo, Product Name Chip, SEO/Schema Fixes

### ✅ Legacy Numbered Material ID → Named Texture Mapping

`lib/saved-design-loader-utils.ts`: Added `NUMBERED_MATERIAL_TEXTURES` lookup table (materials 01–31) built from `public/xml/en_EN/stones.xml`. Previously, old saved designs storing `material: "01"` would fall through to the 2KB placeholder `01.webp` instead of the correct named texture.

`mapTexture()` now checks numbered patterns **first** (before all other named-string fallbacks):
- `01` → `Sandstone.webp`
- `02` → `White-Carrara.webp`
- `08` → `G654.webp`
- `29` → `Blue-Pearl.webp`
- …all 31 entries, with best-effort fallbacks for renamed materials (e.g., `04` Kashmire White → `White-Carrara`, `12` Noble Grey → `Noble-Black`)

Also expanded `MATERIAL_TEXTURES` with all named granite variants that were previously missing.

> **Key rule:** Numbered textures `01.webp`–`35.webp` in `/textures/forever/l/` are ~2KB placeholder files. Real textures are named `.webp` files (Sandstone.webp, Blue-Pearl.webp, etc.). `mapTexture()` must resolve numbered IDs to named filenames.

Commit: `547e67319a`

---

### ✅ Email Logo Updated to forever-transparent-logo.png

`lib/email/config/data/countries24.json`: Updated `logo` field for AU, UK, EU, PG, JP to `https://forevershining.org/ico/forever-transparent-logo.png` (400×246 px PNG).

`lib/email/templates/components/EmailLayout.tsx`: `<Img>` dimensions set to `width={200} height={123}` (2× retina-ready display size).

Countries NOT changed: `us`/`ca` keep their bronze-plaque.com logo; `pl` keeps wiecznapamiec.pl logo.

> **Important:** `countries24.json` is pre-parsed from XML at build time. Do NOT re-run `scripts/embed-email-xml.mjs` — it would overwrite the JSON from source XML and lose these logo changes.

Commit: `f87e3c69b1`

---

### ✅ Product Name — Modernized Frosted-Glass Chip UI

`components/ThreeScene.tsx`: Product name display redesigned from a plain `<h1 className="text-shadow-hero">` to a frosted-glass pill chip matching the price indicator aesthetic:

- `bg-black/55 backdrop-blur-md border border-white/10 rounded-full shadow-lg`
- Gold accent dot `#DEBD68` (1.5px circle) on the left
- `text-white/90 text-sm font-medium tracking-wide` text

Positioned top-left `absolute top-4 left-4` inside the canvas overlay.

Commit: `1a0767b21b`

---

### ✅ Design Page SSR — Removed Redundant HTTP Self-Call

`app/designs/[productType]/[category]/[slug]/page.tsx`: Removed `getDesignShape()` function (~50 lines) that made an outbound HTTP fetch to `/ml/{dir}/saved-designs/json/{id}.json` on every SSR render. This was adding 200–2000ms TTFB on every Googlebot crawl (circular Vercel function → Vercel function cold-start cascade).

`design.shapeName` is already available in `SavedDesignMetadata` — replaced with a synchronous `formatShapeName()` helper (17 lines).

Commit: `02df115653`

---

### ✅ Product Schema (JSON-LD) — Fixed GSC Rich Result Errors

`app/designs/[productType]/[category]/[slug]/page.tsx`: Fixed two "enhancement" errors shown in Google Search Console:

**1. Missing `price` (Opisy produktów / Product descriptions error)**
- Switched `"@type": "Offer"` → `"@type": "AggregateOffer"` with `lowPrice` per product type:
  - Granite headstone: AUD 695
  - Stainless steel: AUD 795
  - Bronze: AUD 895
  - Full monument: AUD 2495
- `priceCurrency` changed to `"AUD"` (primary market)

**2. Missing `hasMerchantReturnPolicy` + `shippingRate` (Informacje o sprzedawcy / Seller info error)**
- Added `hasMerchantReturnPolicy`: `MerchantReturnNotPermitted` for AU/GB/US/CA (custom memorial products cannot be returned)
- Added `shippingRate`: `MonetaryAmount { value: "0", currency: "AUD" }` (free delivery)
- Added `transitTime` to `ShippingDeliveryTime` (1–2 weeks, was only `handlingTime`)
- Added `seller.url` to `Organization`

To verify: paste any `/designs/…` URL into [Google's Rich Results Test](https://search.google.com/test/rich-results).

Commits: `c6355c7a8c`, `b553bacf41`

---

### 📌 Remaining SEO / GSC Actions

- [ ] **Submit sitemap in GSC**: Google Search Console → Sitemaps → `https://forevershining.org/sitemap.xml`
- [ ] **Request indexing for key pages**: GSC → URL Inspection → "Poproś o zindeksowanie"
- [ ] **`generateStaticParams`** for top ~200 design pages to ensure instant Googlebot response (currently all 3100 pages are ISR, generated on first hit)
- [ ] **FAQ content uniqueness**: All 3100 design pages have identical FAQ answers — Google treats as thin content. Vary by product type/category
- [ ] **`#design-ssr-content` visibility**: Both SSR HTML and 3D editor show simultaneously after hydration — add `useEffect` in `DesignPageClient.tsx` to hide the SSR div after mount if intentional behaviour has changed

---

## Current Status (2026-05-12) — Outback Scenery, Meadow Rename, Nav Label, My Account Fix, White Screenshot

### ✅ Outback Scenery Variant

Added a second scenery option **"Outback"** alongside the existing scenery in `components/three/Scene.tsx`:

- **Sky**: warm amber top (`#d4895a`) + horizon haze, no animated clouds
- **Ground**: CC0 texture `red_sand_diff_2k.jpg` + normal map `red_sand_nor_gl_2k.jpg` (downloaded from Poly Haven), tiled at repeat 12, ground colour `#e0a870`; plane 180×180
- **Treeline**: two-layer `InstancedMesh` — 160 low scrubs (radius 48–62, colour `#3d5428`) + 40 taller shrubs (colour `#2e4020`); deterministic LCG seeds; pushed to horizon
- **Fog**: outback-only (`near=25, far=80` desktop). `GrassFloor` and `SimpleGroundFloor` expanded to 300×300 so the Meadow scene edge is never visible without fog
- **No `AtmosphericSky`** component for outback (clear open sky)

New `SCENERY` config object in `Scene.tsx` keyed by `'day' | 'outback'`; `sceneryVariant` state in the store (`lib/headstone-store.ts` + types).

Textures stored in `public/textures/three/outback/`:
- `red_sand_diff_2k.jpg` (2.2 MB) — active diffuse
- `red_sand_nor_gl_2k.jpg` (4.4 MB) — active normal map
- `outback_diff_2k.jpg` / `outback_nor_gl_2k.jpg` — unused originals (can be deleted to save ~9 MB)

---

### ✅ Renamed "Day" → "Meadow"

`components/SceneryToggleButton.tsx`: label changed from `"Day"` / `"Spring day"` to **`"Meadow"`** / `"Green meadow"`. Store key `'day'` unchanged (no type/state breaking changes).

---

### ✅ Fog Removed from Meadow Scenery

`Scene.tsx`: fog element now gated by `sceneryVariant === 'outback'` — Meadow scene has no fog/haze. Ground planes expanded to 300×300 to prevent visible edge.

---

### ✅ Updated Scenery Color Swatches

`components/SceneryToggleButton.tsx`: six background colour swatches updated to:

| Label | Hex |
|-------|-----|
| Pure White (Light) | `#ffffff` |
| Light Gray (Light/Neutral) | `#efefef` |
| Warm Beige (Light/Warm) | `#e8e4dc` |
| Medium Gray (Mid-tone) | `#9ca3af` |
| Dark Charcoal (Dark) | `#1e2228` |
| Deep Navy (Dark/Cool) | `#1a2035` |

---

### ✅ "Select Size & Base" Nav Label for Headstones

`components/DesignerNav.tsx`: sidebar nav item "Select Size" now shows **"Select Size & Base"** when `catalog?.product.type === 'headstone'`. Implemented via `displayName` computed variable in the map callback (mirrors the `materialLabel` pattern). All 5 render paths (button, border selector, disabled, link, save-design button) use `displayName`.

---

### ✅ My Account Page — Canvas Bleed-Through Fix

Two fixes in the same commit:

1. **Removed scenery-like gradient** from `app/my-account/page.tsx` — the `radial-gradient` overlay (`rgba(244,160,80,0.18)` warm amber top + `rgba(88,144,255,0.18)` blue bottom) looked identical to the outback scenery colours and was causing the page background to appear as "scenery". Removed the gradient div entirely; page background is now pure `bg-[#050301]`.

2. **`!pathname` guard in `ConditionalCanvas.tsx`** — when `usePathname()` returns `null` (SSR edge case on Vercel before router context is ready), the canvas now hides by default instead of rendering. Both the early return and the `useEffect` guard were updated.

---

### ✅ White Background for Saved Design Screenshots/Email

Changed screenshot capture background from warm beige `#e8e4dc` to pure white `#ffffff` in two places:

- `components/three/Scene.tsx` line ~472: `<color attach="background" args={['#ffffff']} />` during `screenshotMode`
- `components/DesignerNav.tsx` `encodeCanvasForUpload()`: `ctx.fillStyle = '#ffffff'` before compositing

Saved design email and My Account thumbnails now show the headstone on a clean white background (no scenery, no warm tint).

---

### 📌 Pending / Next Steps (2026-05-12)

- [ ] **Delete unused outback textures**: `public/textures/three/outback/outback_diff_2k.jpg` + `outback_nor_gl_2k.jpg` (~9 MB)
- [ ] **db:sync to remote**: Run `pnpm db:sync` to ensure remote home.pl DB has `json_path` column
- [ ] **Add 6 failures to KNOWN_FAILURES** in `scripts/batch-screenshot.js`: `1662337522025`, `1667480366612`, `1670405007473`, `1673437084641`, `1675259335154`, `1752619990342`
- [ ] **Email screenshot URL**: `screenshotUrl` passed to save-design email is the data URL from the fast-path DB write. Consider moving `sendEmail()` inside `after()` so the email is sent after upload completes and includes a real file URL

---

## Current Status (2026-05-11) — Scenery Toggle, Load Design UX, Screenshot Mode, Email & Grass Fixes

### ✅ Email: Logo Full Size (290×180 px)

Increased the Forever Shining logo in `lib/email/templates/components/EmailLayout.tsx` to `width={290}` `height={180}` (was ~120×74).

---

### ✅ Email: BCC Addresses (biuro@wiecznapamiec.pl + polcreation@gmail.com)

Both BCC recipients were already configured in `lib/email/config/countries.ts` via the `BCC_MAP` / `always` field — no new Vercel env vars (`SMTP_BCC_1`, `SMTP_BCC_2`) were needed.

---

### ✅ Email: "MEMORIAL DESIGN SAVED" Heading Styled in Dark Grey

First line of the saved-design email template changed from a lighter placeholder colour to the same dark grey (`#2d2d2d` or equivalent) used for the customer name, giving the email a consistent, premium look.

---

### ✅ Grass Texture Improvements

Replaced the flat repeating grass texture with a multi-layered approach in `components/three/headstone/GrassFloor.tsx` (and `Scene.tsx` fog/lighting tweaks):
- Reduced repeat tiling to eliminate obvious pattern repetition
- Added subtle colour variation and dirt-blend overlay texture
- Tuned fog near/far values so grass fades naturally without pixelation near the base
- Final result: realistic lawn appearance without visible repeat artefacts

---

### ✅ Crop Screen: Immediate Loading Indicator

When the **Crop** button is clicked, a spinner overlay now appears immediately before the cropped canvas is computed. Previously there was a 1–2 s blank pause. Fix in `components/ImageSelector.tsx` — set a local `isCropping` state to `true` on button click and render `<LoadingOverlay>` (or inline spinner) while it is `true`; reset to `false` after the crop promise resolves.

---

### ✅ My Account Saved Designs — Consistent Thumbnail Style

Saved design thumbnails in the My Account page now use the same transparent/neutral-background style as the Design Gallery cards. Previously they showed the grass/sky scenery which looked inconsistent.

Implementation: `DesignerNav.tsx` `handleSaveDesign` now:
1. Calls `setScreenshotMode(true)` to enter clean capture mode.
2. Waits 2 × `requestAnimationFrame` so R3F re-renders.
3. Captures the canvas (background fill `#e8e4dc` warm neutral via `encodeCanvasForUpload`).
4. Calls `setScreenshotMode(false)` in `finally`.

`Scene.tsx` gates all scenery behind `!screenshotMode` (and `!hideScenery`), producing a clean headstone-on-neutral background.

New store fields in `lib/headstone-store.types.ts` + `lib/headstone-store.ts`:
- `screenshotMode: boolean` / `setScreenshotMode(v)`

---

### ✅ "Back to Designer" → `/design-menu`

`components/AccountNav.tsx`: changed the "Back to Designer" link from `href: '/select-product'` to `href: '/design-menu'`.

---

### ✅ Load Design Popup — Clear Selection + Navigate to `/design-menu`

**Bug:** loading a design with an image auto-selected it and caused the sidebar to flash between Select Size and Add Your Image panels.

**Root cause:** `store.addImage()` and `store.addMotif()` set `activePanel`, `selectedImageId`, and `selectedMotifId` as side-effects during design loading.

**Fix** (`components/LoadDesignButton.tsx`):
After a successful load, imperatively clear:
```tsx
useHeadstoneStore.getState().setActivePanel(null);
useHeadstoneStore.getState().setSelectedMotifId(null);
useHeadstoneStore.getState().setSelectedImageId(null);
```
Then `router.push('/design-menu')` so nothing is selected and the URL is clean.

---

### ✅ SceneryToggleButton — Bottom-Right Background Toggle

New component `components/SceneryToggleButton.tsx` (mounted in `ConditionalCanvas.tsx`):
- Fixed `bottom-6 right-4` floating button
- Opens a popover with a **Scenery** option + 6 colour swatches: Warm white `#e8e4dc`, Light grey `#efefef`, Stone `#d0c9bc`, Dark slate `#2d3748`, Charcoal `#1e2228`, Navy `#1a2035`
- Persisted to `localStorage` key `fs_scene_bg` as `{ hideScenery, color }`
- Restored on mount

New store fields:
- `hideScenery: boolean` / `setHideScenery(v)`
- `solidBgColor: string` / `setSolidBgColor(color)`

---

### ✅ Fixed: Scenery Toggle Not Replacing Background (Hybrid CSS + Imperative Approach)

**Bug:** selecting a colour replaced the button indicator but the 3D background (grass, sky gradient) remained visible.

**Root cause:** R3F reconciler timing — `<color attach="background">` JSX and conditional rendering of `GradientBackground` / `GrassFloor` weren't guaranteed to take effect immediately when `hideScenery` flipped.

**Three-layer fix:**

1. **CSS background on canvas container** (`components/ThreeScene.tsx`):
   ```tsx
   const hideScenery = useHeadstoneStore((s) => s.hideScenery);
   const solidBgColor = useHeadstoneStore((s) => s.solidBgColor);
   // ...
   <div
     ref={containerRef}
     className="relative w-full h-screen"
     style={hideScenery ? { backgroundColor: solidBgColor } : undefined}
   >
   ```
   Since the Canvas has `alpha: true` + `style={{ background: 'transparent' }}`, transparent WebGL pixels show the CSS background through.

2. **Imperative `useEffect`** (`components/three/Scene.tsx`):
   ```tsx
   useEffect(() => {
     if (hideScenery) {
       scene.background = null; // let CSS show through
       scene.fog = null;
     }
   }, [hideScenery, scene]);
   ```
   Bypasses R3F reconciler timing by directly clearing `scene.background` and `scene.fog`.

3. **`visible` prop on scenery groups** instead of conditional rendering:
   ```tsx
   <group visible={!noScenery}>         {/* GrassFloor */}
   <group visible={!is2DMode && !noScenery}> {/* Sparkles + AtmosphericSky + GradientBackground */}
   ```
   Setting `THREE.Group.visible = false` is a direct THREE.js property update — more reliable than unmounting in R3F for visibility toggling.

**`<color attach="background">` logic** after fix:
```tsx
{screenshotMode && <color attach="background" args={['#e8e4dc']} />}  {/* screenshot: warm neutral */}
{!is2DMode && !noScenery && <color attach="background" args={['#A8C9E6']} />}  {/* normal: sky blue */}
{/* hideScenery: no <color> — CSS backgroundColor on container handles it */}
```

---

### 📌 Pending / Next Steps (2026-05-11)

- [ ] **db:sync to remote**: Run `pnpm db:sync` (type `SYNC` to confirm) to ensure remote home.pl DB has `json_path` column.
- [ ] **Add 6 failures to KNOWN_FAILURES** in `scripts/batch-screenshot.js`: `1662337522025`, `1667480366612`, `1670405007473`, `1673437084641`, `1675259335154`, `1752619990342`
- [ ] **Email screenshot URL**: `screenshotUrl: undefined` passed to save-design email since upload hasn't completed at send time. Consider moving `sendEmail()` inside `after()` after upload completes.

---

## Current Status (2026-05-08) — Thumbnail Fix, Image Auto-Select, Nav & Crop UI Refactor

### ✅ Fixed: Thumbnails Showing `/screen.png` on Live Site

After saving a design on the live site, `<img src="/screen.png">` appeared instead of a real thumbnail.

#### Root Cause
`UPLOAD_REMOTE_URL` / `UPLOAD_REMOTE_SECRET` env vars may not be set → `after()` upload silently fails → `screenshotPath`/`thumbnailPath` remain `null` in DB → UI falls back to `/screen.png`.

#### Fix (`app/api/projects/route.ts`)
Store the raw screenshot data URL directly into `screenshotPath` and `thumbnailPath` in the **fast-path DB write** (before `after()` fires). The `after()` callback still runs and overwrites with real file URLs if the upload to wiecznapamiec.pl succeeds. On Vercel without upload env vars, the data URL is shown as-is — always a real thumbnail. **Commit:** `63fb58a144`

---

### ✅ Fixed: Save Design 500 Error on Localhost (Missing `json_path` Column)

#### Root Cause
`ALTER TABLE "projects" ADD COLUMN "json_path" text` had been applied to the remote DB via Drizzle schema but **not** run locally. The fallback `isJsonPathColumnMissing()` was present in `lib/projects-db.ts` but not triggering reliably.

#### Fix
Ran `pnpm db:push` locally (confirmed via interactive prompt). Column added. **Commit:** `d4e50aa774`

---

### ✅ Auto-Select Image + Show Edit Panel After Adding

When "Add Your Image" was placed on the headstone the image wasn't selected and no edit panel appeared — the user had to manually click it.

#### Fix (`lib/headstone-store.ts` — `addImage()`)
Added `selectedImageId: image.id` and `activePanel: 'image'` to the `set()` call, mirroring the pattern used by `addMotif()`. **Commit:** `57ec1d0755`

---

### ✅ Moved "Save Design" to Design Nav Section

Save Design was buried under the Account accordion. Moved it to the last position of the **Design** group in `components/DesignerNav.tsx` — it still triggers the account gate when unauthenticated. **Commit:** `b419d41fc5`

---

### ✅ Crop Section UI Refactor (`components/ImageSelector.tsx`)

Multiple improvements to reduce vertical space and improve usability:

| Change | Detail |
|--------|--------|
| Removed type-info header | Large image thumbnail + "Ceramic Photo" + "Selected image type" block removed from above crop section |
| Compacted title | "Crop Section" header + info button replaced with a small `selectedType.name` label |
| Mask filtering | Ceramic / Vitreous Enamel / Plana → only show oval, horizontal-oval, square, rectangle (4 masks); Granite/laser-etched → all 7 masks |
| Smaller mask grid | `grid-cols-5`, 28px thumbnails, `p-1` padding, `rounded-md` |
| Gold "Crop Image" button | Background `#D7B356`, text black — matches slider gold theme |
| Rotation range 0–360 | Slider changed from `-180/180` to `0/360`; Decrease/Increase ±5 buttons wrap with modulo |
| Rotate ↺/↻ wrapping | `handleRotateLeft` / `handleRotateRight` (±90) now use `((deg % 360) + 360) % 360` — no longer escape 0–360 range |

**Commit:** `7bab619cde`

---

### ✅ Removed Accordion Animation in Left Sidebar

Accordion sections (Setup / Design / Account) now open/close instantly — `transition-all duration-300 ease-in-out` removed from the collapsible content div, and `transition-transform duration-300` removed from the chevron icon. **Commit:** `debd74eac1`

---

### 📌 Pending / Next Steps (2026-05-08)

- [ ] **db:sync to remote**: Run `pnpm db:sync` (type `SYNC` to confirm) to ensure remote home.pl DB has the `json_path` column in sync with local schema.
- [ ] **Visual QA on crop section**: Verify mask filtering works correctly for each image type (Ceramic 7, Vitreous Enamel 2300, Plana 2400 vs Granite 21/135). Confirm Crop Image button is gold.
- [ ] **Add 6 failures to KNOWN_FAILURES** in `scripts/batch-screenshot.js`: `1662337522025`, `1667480366612`, `1670405007473`, `1673437084641`, `1675259335154`, `1752619990342`
- [ ] **Email screenshot URL**: `screenshotUrl: undefined` is passed to save-design email since upload hasn't completed yet at send time. Consider moving `sendEmail()` call inside `after()` after upload completes so the email includes the real screenshot URL.

---

## Current Status (2026-05-07) — Save Design 500 Fix, CORS Fix, Saving Overlay

### ✅ Fixed: Save Design 500 Error on Live Vercel (Timeout)

Saving a design on the live site (forevershining.org) returned HTTP 500 / "Unable to save project".

#### Root Cause
`app/api/projects/route.ts` (POST handler) was doing **3 sequential HTTP uploads** to wiecznapamiec.pl (screenshot → thumbnail → JSON) before returning a response. Vercel Hobby plan enforces a **10-second function timeout**; the combined upload time exceeded this limit and Vercel killed the function.

#### Fix — Next.js 15 `after()`
Used `after()` from `next/server` (Next.js 15 stable) to run all file uploads **after the response has been sent** to the client:

1. **Fast path** (synchronous): Write design state to PostgreSQL → return `{ project: summary }` immediately (typically <1 second)
2. **Background** (via `after()`): Upload screenshot + generate thumbnail + upload JSON to wiecznapamiec.pl → update DB record with file paths

The client now sees an instant save success. File paths (`screenshotPath`, `thumbnailPath`, `jsonPath`) are populated in the DB record a few seconds later once the background uploads complete.

```typescript
// app/api/projects/route.ts
import { NextRequest, NextResponse, after } from 'next/server';

// ...inside POST handler:
const summary = await saveProjectRecord({ ...baseFields });

after(async () => {
  // upload screenshot, thumbnail, JSON → update DB record
});

return NextResponse.json({ project: summary }); // returns immediately
```

**Commit:** `b9b10c47d1`

---

### ✅ Fixed: CORS Error for Uploaded Images in WebGL

Three.js reported `Could not load https://www.wiecznapamiec.pl/forevershining/uploads/backgrounds/…jpg: undefined` because the `Access-Control-Allow-Origin` response header had value `"e"` (a literal character) instead of a real origin or `"*"`.

#### Root Cause
`legacy/.htaccess` used Apache's `SetEnvIf` + `%{CORS_ORIGIN}e` pattern. When the environment variable is unset (or unsupported by the server's Apache version), `%{CORS_ORIGIN}e` expands to just the letter `e` — resulting in `Access-Control-Allow-Origin: e`.

#### Fix
Replaced the conditional env-var pattern with a simple unconditional wildcard in `legacy/.htaccess`:
```apache
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, OPTIONS"
```
This file must be deployed to `public_html/forevershining/uploads/.htaccess` on wiecznapamiec.pl.

---

### ✅ Added: Save Loading Overlay in ProjectActions

`components/ProjectActions.tsx` now shows a full-screen spinner overlay (matching `LoadingOverlay.tsx` styling) while `isSaving === true`. Uses `createPortal` to render above everything.

---

### ✅ DB: `json_path` Column Added to Production

`drizzle/0003_mute_carnage.sql` (`ALTER TABLE "projects" ADD COLUMN "json_path" text;`) was run on the production database. `lib/projects-db.ts` was rewritten with a resilient fallback — all INSERT/UPDATE/SELECT operations catch `42703` ("undefined column") errors and retry without `jsonPath`, so the app remains backward-compatible with DB schemas that haven't been migrated yet.

---

### ✅ Upload Year/Month Subfolder Structure

`legacy/upload.php` creates `YEAR/MONTH/` subdirectories inside each upload type folder so uploads are organized chronologically:
```
uploads/
  backgrounds/2026/05/{uuid}.jpg
  images/2026/05/{uuid}.jpg
  screenshots/2026/05/{uuid}.jpg
  designs/2026/05/{uuid}.json
```

---

### 📌 Pending / Next Steps (superseded by 2026-05-08 section above)

- [x] **Visual verify save on live**: fixed — thumbnails now store data URL immediately in DB (`63fb58a144`).
- [x] **Thumbnail fix**: `screenshotPath`/`thumbnailPath` now populated with data URL on initial save; upgraded to file URL by `after()` if upload succeeds.
- [ ] **Add 6 failures to KNOWN_FAILURES** in `scripts/batch-screenshot.js`: `1662337522025`, `1667480366612`, `1670405007473`, `1673437084641`, `1675259335154`, `1752619990342`

---



### Urn Background Inlay — Final Fixes

#### Default White Inlay
All urn shapes now default to **white** background inlay (instead of transparent/none).
- `lib/headstone-store.ts` — initial state for `urnBackgroundColor` set to `'#ffffff'`
- `components/three/headstone/UrnEnamelInlay.tsx` — `defaultColor` fallback is `'#ffffff'`

#### Background Thumbnails Disappear After Shape Change
**Bug**: Selecting a background, then changing the urn shape, cleared all background thumbnails from the panel.
**Root cause**: Shape change reset the `headstoneMaterial` store slice, which `MaterialSelectionGrid` relied on for its local list.
**Fix**: `app/select-material/_ui/MaterialSelectionGrid.tsx` — persists the loaded backgrounds list in `useRef` so re-renders triggered by shape changes don't empty the thumbnail grid.

---

### Unified File Upload Architecture

All binary file uploads (background images, portrait photos, screenshots, PDFs) are now stored as real files on the wiecznapamiec.pl server instead of being embedded as base64 data URLs in the PostgreSQL `designState` column.

#### Problem
- **Vercel filesystem is read-only** at runtime — `writeFile` to `public/` in a serverless function silently fails or throws.
- Old `/api/upload-background` route wrote to `public/uploads/` → worked on localhost, failed on Vercel.
- Portrait images and background uploads were stored as 1–5 MB base64 strings in Zustand → saved into PostgreSQL `designState` jsonb column.
- `cleanDesignState()` only stripped `metadata.screenshot` and `selectedImages.data`; the actual `imageUrl` fields were never cleaned.

#### Architecture

```
Client (browser)
    │
    ▼
/api/upload-background  (Next.js route, 7 lines)
/api/upload-image       (Next.js route, 7 lines)
    │
    ▼
lib/upload/proxy.ts     (shared helper)
    ├── NODE_ENV === 'development'
    │       └── saveLocally() → public/uploads/{subdir}/{uuid}.ext
    │           returns /uploads/{subdir}/{uuid}.ext
    └── production
            └── saveRemotely() → POST to UPLOAD_REMOTE_URL (PHP endpoint)
                returns https://www.wiecznapamiec.pl/forevershining/uploads/{subdir}/{uuid}.ext
```

#### PHP Endpoint (`legacy/upload.php`)
Single unified endpoint — deploy to `public_html/forevershining/upload.php`:
- Accepts `multipart/form-data` with `file` + `subdir` fields
- Subdir whitelist: `backgrounds`, `images`, `screenshots`, `pdfs`
- Per-subdir MIME validation and file-size limits
- Auth: `Authorization: Bearer {UPLOAD_REMOTE_SECRET}` header
- Returns JSON `{ url: "https://www.wiecznapamiec.pl/forevershining/uploads/{subdir}/{uuid}.ext" }`
- Uses `__DIR__` for filesystem path, hardcoded public URL `https://www.wiecznapamiec.pl/forevershining/uploads/`

#### Apache CORS (`legacy/.htaccess`)
Deploy to `public_html/forevershining/uploads/.htaccess`:
```apache
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, OPTIONS"
```
Required so browsers can load images from wiecznapamiec.pl into WebGL canvases (Three.js taints the canvas without CORS headers).

#### Next.js Proxy Helper (`lib/upload/proxy.ts`)
```typescript
export type UploadSubdir = 'backgrounds' | 'images' | 'screenshots' | 'pdfs';
export async function proxyUpload(file: File | Blob, subdir: UploadSubdir): Promise<string>
export async function extractFile(request: NextRequest): Promise<File | Blob>
```
- Dev: saves to `public/uploads/{subdir}/` using `fs.writeFile`
- Prod: POSTs to `UPLOAD_REMOTE_URL` with `UPLOAD_REMOTE_SECRET` header

#### Vercel Environment Variables (Production)
```bash
UPLOAD_REMOTE_URL=https://www.wiecznapamiec.pl/forevershining/upload.php
UPLOAD_REMOTE_SECRET=<strong random secret — must match $secret in upload.php>
```

#### crossOrigin Fix for WebGL
Loading cross-origin URLs into WebGL requires `loader.crossOrigin = 'anonymous'` AND CORS headers from the server.
- `components/three/ImageModel.tsx` — added `loader.crossOrigin = 'anonymous'`
- `components/three/headstone/UrnEnamelInlay.tsx` — added `loader.crossOrigin = 'anonymous'`

#### Server Deployment Checklist
1. Upload `legacy/upload.php` → `public_html/forevershining/upload.php`
2. Edit `$secret` in `upload.php` to match `UPLOAD_REMOTE_SECRET` Vercel env var
3. Upload `legacy/.htaccess` → `public_html/forevershining/uploads/.htaccess`
4. Ensure `public_html/forevershining/uploads/` exists and is writable by PHP (`chmod 755`)
5. Set `UPLOAD_REMOTE_URL` and `UPLOAD_REMOTE_SECRET` in Vercel → Settings → Environment Variables

#### Adding a New Upload Type
1. Add subdir to PHP whitelist in `upload.php`
2. Create new Next.js route:
   ```typescript
   export async function POST(request: NextRequest) {
     const file = await extractFile(request);
     const url = await proxyUpload(file, 'new-subdir');
     return NextResponse.json({ url });
   }
   ```

#### Design State Stays in PostgreSQL
Only binary files go to the file server. Design state JSON (shape, material, inscriptions, motifs, etc.) continues to be stored in the `designState` jsonb column in PostgreSQL — it's structured, queryable, and needed for listing, reloading, and email generation.

---

## Current Status (2026-05-05) — Urn Border Glitches (Deferred) & Pricing

### Work Done Today

#### 1. Urn Inlay Border — `removeLoops` symmetry improvement
**File**: `components/three/headstone/UrnEnamelInlay.tsx`

Changed `removeLoops()` from picking the **first** crossing found to picking the crossing whose intersection point is **closest to X=0** (the heart's axis of symmetry). This makes the top-cleft joint collapse symmetrically.

Three glitches remain (deferred):
- Top cleft: V-joint still slightly asymmetric
- Top-right lobe: small gray blob outside heart boundary
- These are earcut triangulation artifacts from the self-intersecting inset polygon at the concave cleft

#### 2. Urn Pricing — `lib/xml-parser.ts` + `CheckPriceGrid.tsx`

**Bug 1 — `end_quantity="0"` treated as max 0 (never matched)**
- `calculatePrice()` condition was `quantity <= p.endQuantity` → `1 <= 0` = false → returned $0
- Fix: `endQuantity === 0` is now the legacy sentinel for "unlimited" (no upper bound)

**Bug 2 — `computeQuantity` for "Units" returned `max(width, height) = 307`**
- Formula `2016.88+2016.88($q-1)` with q=307 → ~$800,231 (wrong!)
- Fix: `"Units"` quantity type now returns `1` (number of items ordered)

**Bug 3 — `isUrnProduct` needed fallback**
- `catalog` loads async; during load `catalog = null` so `type` check fails
- Fix: `isUrnProduct = catalog?.product?.type === 'urn' || productId === '2350'`

**Correct urn prices** (quantity=1, matched by `note` field in price model):
| Shape     | Base price | × 1.2924  | Final     |
|-----------|------------|-----------|-----------|
| Heart     | $2,016.88  | ×1.2924   | $2,606.14 |
| Oval      | $1,937.67  | ×1.2924   | $2,503.89 |
| Rectangle | $1,915.52  | ×1.2924   | $2,475.29 |
| Triangle  | $1,741.32  | ×1.2924   | $2,250.26 |

**Files Modified**:
- `lib/xml-parser.ts` — `calculatePrice()` now accepts optional `noteFilter?: string`; `computeQuantity()` "Units" → returns 1
- `app/check-price/_ui/CheckPriceGrid.tsx` — urn detection, `quantity=1`, `urnShapeCode` as noteFilter, display "Background" instead of "Material/Size"

#### 3. Rectangle & Triangle Inlay — Seam-Duplicate Root Cause + Fix
**File**: `components/three/headstone/UrnEnamelInlay.tsx`

**Root cause — THREE.js `getSpacedPoints` + SVGLoader `autoClose` interaction:**
- `CurvePath.getSpacedPoints(N)` returns `N+1` base points **plus** an extra `pts[0]` when `autoClose = true` → **N+2 total**
- SVGLoader sets `autoClose = true` on any path that ends with `Z`/`z` (all urn SVGs do)
- So `getSpacedPoints(4096)` returns **4098** points, not 4097
- The old fix `i < pts.length - 1 = 4097` still sampled `pts[4096]` — the seam duplicate

**Why linear-closed shapes (Rectangle, Triangle) broke:**
- Rectangle SVG ends with `L 50 30` → `LineCurve.getPointAt(1)` = P3 **exactly** → `pts[4096]` is a **zero-distance duplicate** of `pts[0]`
- Zero-length edge triggers fallback normal `(1, 0)` in `insetPolygon` → catastrophically wrong inset
- Triangle has the same issue: ends with `L 198.9 50.7`

**Why Oval/Heart appeared fine:**
- They end with cubic bezier curves → `getPointAt(1)` has ~1e-8 floating-point error → near-duplicate, not exact → tiny miter error (~3e-8 units = invisible)

**Fix implemented** (lines 221-245, `geomData` useMemo):
- Strip all trailing points within **0.1 SVG units** of `pts[0]` before sampling
- Safe epsilon: nearest real perimeter neighbour is always ≥ 4 SVG units away (segment spacing ≈ 0.25–0.39 SVG units)
- Handles exact linear duplicates (0 distance), bezier near-duplicates (~1e-8), and the autoClose extra point

**Status**: Fix implemented, pending browser verification

#### 4. Pre-existing type errors (14 total, unchanged)
| File | Count | Error |
|------|-------|-------|
| `app/api/share/email/route.ts:54` | 1 | TS2322 type mismatch |
| `discountheadstones/vite.config.ts:3` | 1 | TS2307 missing @tailwindcss/vite types |
| `lib/ml-search-service.ts` | 8 | TS2802 Set/Map iterator downlevelIteration |
| `scripts/dedup-designs.ts` | 4 | TS2802 Set/Map iterator downlevelIteration |

---

## Current Status (2026-05-04) — Product 2350 Urn Vitreous Enamel Inlay (IN PROGRESS)

### Context
Product 2350 is the **Stainless Steel Vitreous Enamel Inlaid Urn** (`catalog-id-2350.xml`, `type="urn"`, `background="1"`).
Shapes: Heart, Oval, Rectangle, Triangle.
Only Heart and Oval get the landscape oval base stand. Rectangle and Triangle do NOT.

### Architecture
- **Urn body**: `MeshPhysicalMaterial` metalness=0.98, roughness=0.18 → brushed stainless steel. No texture on body.
- **Vitreous enamel inlay**: separate `<UrnEnamelInlay>` mesh rendered inside `SvgHeadstone` children callback.
- **Background panel**: same as Full Colour Plaque. Opens automatically on first shape select. No Headstone/Base tab.

### UrnEnamelInlay — current working approach

File: `components/three/headstone/UrnEnamelInlay.tsx`

```
ShapeGeometry (urn outline scaled inward by BORDER_MM=20mm on all sides)
  + THREE.TextureLoader (NOT canvas, NOT drei useTexture)
  + MeshBasicMaterial (unlit, like Full Colour Plaque face)
  + flipY=true (THREE.js default) — correct for ShapeGeometry UV mapping
  + position [0, cy, 0.5] where cy=outH/2 centres inlay on urn face
```

Only renders when texture is loaded (`if (!geomData || !tex) return null`).

### Coordinate system — critical facts

- `outlinePoints` are in the children wrapper coordinate space (pre-meshScale).
  `outlinePoints.y = bottomTarget_SV - p.y` (Y-inverted from raw geometry).
- The **Y RANGE** `outH = maxY - minY` equals the true mesh height.
- `cy = outH / 2` centres the inlay. Do NOT use `api.worldHeight` — it is wrong for urns (`preserveTop=false`).
- `api.unitsPerMeter = 1 / (scale × sCore)` — use to convert mm → pre-meshScale units.
- `borderPU = BORDER_MM × unitsPerMeter / 1000`
- `scaleX = (outW - 2×borderPU) / outW`, `scaleY = (outH - 2×borderPU) / outH`

### What FAILED (do not retry)

| Approach | Failure reason |
|---|---|
| Polygon inset (miter-join insetPolygon) | Self-intersections at heart notch and triangle tip → earcut glitches |
| `canvas + ctx.drawImage + CanvasTexture` | Texture never appeared on mesh; only reflective clearcoat (blue sky reflection) showed |
| `MeshPhysicalMaterial transparent:true + alphaTest:0.01` | When tex=null, rendered as blue-sky reflective surface instead of nothing |
| `flipY = false` | Image appeared upside-down on shape |
| Legacy "contain" scale `ch/max(imgW,imgH)` on canvas | Still didn't fix canvas not appearing |

### What WORKS

- `THREE.TextureLoader` direct load (same pattern as `ImageModel.tsx`)
- `MeshBasicMaterial` (unlit) → same as Full Colour Plaque face material
- `flipY = true` (THREE.js default)
- Return `null` until texture loads (clean, no placeholder artifact)
- XY scale-factor border (not polygon inset) → stable triangulation

### Background URL

Store: `headstoneMaterialUrl` holds the selected background URL.
Format: `/jpg/backgrounds/forever/l/{id}.jpg`
Passed via `resolvedTex` in ShapeSwapper → `textureUrl` prop of UrnEnamelInlay.

---

## Current Status (2026-05-03) — Inscription Multiple Lines & Drag-to-Transfer (IN PROGRESS)

### ✅ Fixed: Align Controls Hidden on Single Line Tab

`Align Left / Center / Right` buttons in `InscriptionEditPanel.tsx` are now only rendered when the **Multiple Lines** tab is active — they were incorrectly showing on the Single Line tab.

**Fix:** Wrapped `<AlignControls>` (or equivalent) in a conditional `activeTab === 'multi'` check in `components/InscriptionEditPanel.tsx`.

---

### ✅ Fixed: Infinite Loop — `setPendingTextAlign` (line 94)

`useEffect` at line 94 of `InscriptionEditPanel.tsx` was calling `setPendingTextAlign` with the selected inscription's `textAlign`, but `pendingTextAlign` was also listed in the dependency array. When the effect ran, it updated state → re-render → effect ran again → infinite loop.

**Fix:** Removed `pendingTextAlign` from the `useEffect` dependency array (or restructured to only fire on inscription selection change).

---

### ✅ Fixed: Infinite Loop — `setMultiText` (line 146)

`useEffect` at line 146 was syncing `multiText` state from the selected inscription's text. The effect deps included the derived `multiText` itself, or the effect was triggered by the store update it caused, creating a feedback loop.

**Fix:** Architectural refactor — separated seed logic (runs once on inscription select) from live-sync logic. Used a ref (`seededRef`) to track whether initial seed has fired, preventing re-entry on subsequent re-renders.

---

### ✅ Fixed: Auto-Switch to Correct Tab for Multi-Line Inscriptions

When a user selected an existing **Multiple Lines** inscription from the 3D canvas, the panel was opening on the **Single Line** tab instead of the **Multiple Lines** tab.

**Fix:** Added detection logic in `InscriptionEditPanel.tsx` — when the selected inscription's text contains `\n` (newline), auto-switch `activeTab` to `'multi'` on mount/selection-change.

---

### 🔴 NOT WORKING: Inscription Drag-to-Transfer (Headstone ↔ Base)

**Goal:** When dragging an inscription below the bottom edge of the headstone (with base visible), it should appear on the base front face. Dragging it back above the top edge of the base should return it to the headstone.

**What happens:** Inscription disappears from the headstone correctly (transfer detection fires, `updateInscription` called with `target: 'base'`) but **never appears on the base** — it's invisible.

#### Root Causes Diagnosed

1. **Stale `null` closure in `useFrame`** — `const baseMesh = headstone.mesh.current` captured `null` during the render phase (before React commits the ref). The `useFrame` callback closed over this `null`, so its `!baseMesh` guard fired every frame and returned early, never positioning or showing the inscription.
   - **Fix applied:** `useFrame` now reads `headstone.mesh.current` directly inside the callback (`const bm = headstone.mesh.current`). Refs are committed before R3F's RAF loop runs, so `bm` is always non-null after commit.

2. **Wrong `yPos` on transfer** — the store's `withLineSurfaceDimensions` was using `baseHeightMm * 0.3` as the initial `yPos`, but `baseHeightMm` could fall back to the headstone height (900mm), placing the inscription 270mm above base center — outside the base mesh entirely.
   - **Fix applied:** `yPos: 0` (base center) is now used unconditionally.

3. **`trySetup` guard edge case** — `if (isBaseSurface && Math.abs(stone.scale.y - 1) < 0.01)` meant that if `baseHeightMm === 1000mm` exactly, `stone.scale.y ≈ 1.0` and `setSurfaceBounds` would never be called. The `useFrame` fix bypasses needing `surfaceBounds` for positioning, but React's `visible` prop still depends on `!!surfaceBounds`.

4. **`groupPosition` z-offset** — `surfaceBounds.centerY = 0` (unit cube geometry center at origin) but the actual base mesh center in assembly-space is at `baseMesh.position.y = -baseHeightMeters/2`. `useFrame` override should correct this, but only after `surfaceBounds` is set.

#### Current State (as of 2026-05-03)

Both fixes (#1 + #2) applied and build passes cleanly. **User reports the transfer still does not work** — inscription disappears from headstone but does not appear on base.

#### Next Debug Steps

1. Add `console.log` inside `HeadstoneInscription.tsx` `useFrame` (base-surface path) to confirm:
   - `bm` (base mesh ref) is non-null when inscription is on base
   - `surfaceBounds` is set (not null)
   - `visible` is being set to `true`
2. Check that `state.showBase` is `true` at time of drag — if base is not shown, transfer shouldn't fire at all.
3. Verify `HeadstoneBaseAuto` is actually rendering a `<HeadstoneInscription surface="base">` for the transferred line (check `line.target === 'base'` condition in `HeadstoneBaseAuto.tsx`).
4. Check whether `surfaceBounds` is ever set for the base surface — the `trySetup` effect may be firing too early (before `baseRef.current` is available) or hitting the `Math.abs(scale.y - 1) < 0.01` guard.
5. Consider removing the scale guard entirely and instead checking `hasTx.current` flag on the base mesh (set once geometry is first positioned in `HeadstoneBaseAuto`'s own `useFrame`).

#### Key Architecture Notes

- `ShapeSwapper` renders inscriptions where `line.target ?? 'headstone' === 'headstone'`
- `HeadstoneBaseAuto` renders inscriptions where `line.target === 'base'` — changing `target` unmounts old component, mounts new one
- Base mesh: unit cube ±0.5, scaled to `(baseWTotal, baseHeightMeters, baseDTotal)`, positioned at `y = -baseHeightMeters/2` in assembly group space
- Assembly group lifted by `position.y = showBase ? baseHeightMeters : 0`
- `coordinateSpace: 'mm-center'` + `isBaseSurface`: `useFrame` computes `bm.position.x + xPos * 0.001`, `bm.position.y + yPos * 0.001`, z from `bm.position.z + bm.scale.z / 2`

---

**Files Modified (2026-05-03):**
- `components/HeadstoneInscription.tsx` — `useFrame` null-closure fix (reads `headstone.mesh.current` inside callback); `yPos: 0` on headstone→base transfer
- `components/InscriptionEditPanel.tsx` — align controls hidden on single tab; infinite loop fixes; auto-tab-switch on multi-line inscription selection

---

## Current Status (2026-05-01) — Bronze Plaque UI & Border Fixes

### ✅ Fixed: Bronze Plaque Shape-Select Panel Flicker

Clicking a shape in **Select Shape** for Bronze Plaque caused a half-second flash of the Select Border panel before navigating correctly.

**Root cause:** `handleShapeSelect` in `app/select-shape/_ui/ShapeSelectionGrid.tsx` called both `router.push('/select-border')` AND `openPanel('select-border')`. The `openPanel` custom event fired synchronously before navigation completed, briefly rendering the border panel on the wrong route. `DesignerNav` already has a `useEffect` (lines 620–640) that auto-opens the border panel when `pathname === '/select-border'`, making the explicit `openPanel` call redundant and harmful.

**Fix:** Removed `openPanel('select-border')` from both `handleShapeSelect` and `handleFileChange` in `ShapeSelectionGrid.tsx`. The `openPanel('select-material')` call for Full Colour Plaque was intentionally kept (no auto-open exists for that case).

### ✅ Fixed: Bronze Border Sizing (Bar 2× Too Big, Others 2× Too Small)

All bronze plaque borders use the `integratedRails` path (SVG geometry with rails spanning the full 4800px viewBox). The sizing had two bugs:

1. **Bar border (border1a) excluded from coverage shrink** — kept its initial `uniformScale × 7.5` (no shrink), producing a ~46mm thick frame on a 560×400mm plaque.
2. **Coverage target too low (0.97–0.99)** — other borders were shrunk until bounding box ≈ 97–99% of plaque width, leaving frame elements only ~6mm thick.

**Fix in `components/three/BronzeBorder.tsx`:**
- Removed `&& borderSlug !== 'border1a'` exclusion — bar now gets coverage shrink like all others.
- Changed `targetCoverage` from `lerp(0.97, 0.99, ...)` to a constant **`3.0`** (1.5× increase from the initial 2.0 baseline).

`targetCoverage > 1.0` is intentional: `createCornerMesh` slices each quadrant, so geometry extending beyond the plaque renders cleanly. The higher coverage makes frame elements physically thicker:
- Simple borders: ~18mm frame on a 560×400mm plaque
- Bar border: ~25mm frame (naturally thicker due to SVG bar-element widths)

Note: `components/three/BronzeBorde_gpt5.tsx` is an **unused backup** — do not edit it; all active border logic lives in `BronzeBorder.tsx`.

---



## Current Status (2026-04-22) — Multiple Line Inscriptions

- Added support for multiple inscription lines: users can add, duplicate, edit, and position multiple lines independently.
- UI updates: Inscription editor overlay and edit panel now support per-line selection and an "Add New Line" flow (app/inscriptions/InscriptionOverlayPanel.tsx, components/InscriptionEditPanel.tsx).
- Rendering updates: components/HeadstoneInscription.tsx and LedgerSurfaceContent.tsx fixed positioning and z-ordering for stacked lines and ledger-targeted text.
- State updates: lib/headstone-store.ts: manage inscriptions as an ordered array, addInscriptionLine, duplicateInscription, updateInscription, and cost calculation adjustments.
- Minor related changes: ShapeSwapper and ConditionalCanvas tweaks for consistent layout; small UI fixes on login/my-account/orders; email helper/template cleanup (lib/email/*).

Files changed in the commit: STARTER.md, app/api/projects/route.ts, app/login/page.tsx, app/my-account/page.tsx, app/orders/page.tsx, components/ConditionalCanvas.tsx, components/HeadstoneInscription.tsx, components/InscriptionEditPanel.tsx, components/three/headstone/HeadstoneBaseAuto.tsx, components/three/headstone/LedgerSurfaceContent.tsx, components/three/headstone/ShapeSwapper.tsx, lib/email/helpers.ts, lib/email/templates/components/EmailLayout.tsx, lib/headstone-store.ts, lib/headstone-store.types.ts, screen.png

Notes:
- QA: Verify inscription spacing on narrow plaques and ledger surfaces; run a quick visual QA for dates and multi-line wrapping.
- Follow-up: Consider adding an explicit "line order" UI (up/down) if users expect reordering frequently.

Session focused on fixing broken save-design confirmation emails on `forevershining.org` (Vercel production) and reducing deploy upload size.

### ✅ Fixed: Broken Email Body (Screenshot Data URI Leaking as Raw Text)

First production email arrived but with the design screenshot rendered as raw text (`<img alt="test email10" src="data:image/jpeg;base64,…"` literally visible in the body).

#### Root Cause
The screenshot was embedded as a `data:image/jpeg;base64,…` URI inside `<img src>`. Problems:
- Gmail clips messages >102 KB; a 100–300 KB base64 data URI alone blows past that.
- Gmail sanitizes/strips `data:` URIs in `<img>` tags in many flows → after clipping/sanitization, remaining markup shows as text.
- Large single-line base64 in an HTML attribute interacts poorly with SMTP encoding.

#### Fix — CID Inline Attachment
`lib/email/index.ts`:
- Added `dataUriToInlineImage()` helper that parses `data:image/...;base64,...` and returns a nodemailer-ready attachment (`filename`, `content: Buffer`, `contentType`, `cid`).
- In `sendEmail()`: before rendering the template, if `data.screenshotUrl` is a data URI, convert it once, build a copy of the payload with `screenshotUrl: 'cid:design-screenshot'`, and pass THAT copy to `renderTemplate()` and `getSubject()`.
- Append the inline attachment to `mailOptions.attachments` (alongside the PDF if present) with `contentDisposition: 'inline'`.
- **PDF generation still receives the original `data` (with the real data URI)** so `jsPDF.addImage()` keeps working — only the HTML body uses the CID reference.

Result: HTML body stays tiny (~few KB), Gmail/Outlook/Apple Mail all render the inline image reliably via `cid:design-screenshot`.

### ✅ Fixed: `ENOENT` on `public/xml/countries24.xml` in Serverless Runtime

Emails failed on live site because `lib/email/config/countries.ts` and `translations.ts` did `readFileSync('public/xml/...')` at runtime, but `next.config.ts` `outputFileTracingExcludes` strips `public/xml/**/*` from serverless bundles.

#### Approach (after two failed attempts)

Attempt 1 — `outputFileTracingIncludes` for `/api/projects` + `/api/email`: unreliable, the include trace didn't consistently override the wildcard exclude.

Attempt 2 — Copy XMLs into `lib/email/config/data/` and read via `__dirname`: Next.js bundled the code into `.next/server/chunks/` without tracing the XML files → new `ENOENT`.

Attempt 3 — Embed XMLs as escaped TS string literals: worked, but the 663 KB `languages24.ts` string triggered heavy webpack/SWC minification → build time regressed from 23 → 35 min.

**Final solution (Option A):** Pre-parse XML → JSON at build time, lazy dynamic import at runtime.

#### Changes

Files created:
- `scripts/embed-email-xml.mjs` — build-time parser. Reads `public/xml/countries24.xml` + `languages24.xml` via `@xmldom/xmldom`, writes pre-shaped JSON.
- `lib/email/config/data/countries24.json` (17 KB, 8 countries)
- `lib/email/config/data/languages24.json` (490 KB, 8 locales)

Files rewritten:
- `lib/email/config/countries.ts` — removed `fs`/`path`/`DOMParser`. Static `import countries24 from './data/countries24.json'`. `getCountryConfig(code)` remains sync. `BCC_MAP` / `DEFAULT_BCC` retained and attached at runtime (emails not stored in JSON).
- `lib/email/config/translations.ts` — lazy `import('./data/languages24.json')` with promise cache (`inflight`). `getTranslationMap(locale)` and `t(locale, key)` are now **async**.

Files edited:
- `lib/email/index.ts` — added `await` before `getTranslationMap(locale)` (~line 199).
- `next.config.ts` — removed the previously-added `outputFileTracingIncludes` block (back to original).

Files deleted:
- `lib/email/config/data/countries24.xml`, `languages24.xml` (intermediate copies)
- `lib/email/config/data/countries24.ts`, `languages24.ts` (string-literal wrappers from Attempt 3)

### ✅ Removed "Browse Designs" Sidebar CTA

- `components/DesignerNav.tsx` — removed `<Link href="/designs">…Browse Designs…</Link>` block (was around lines 3327–3334).

### ✅ `.vercelignore` Rewritten (~1 GB Trim)

Measured top-level dir sizes: `q/` 496 MB, `haxe/` 154 MB, `discountheadstones/` 95 MB, `database-exports/` 76 MB, `archive/` 41 MB, `sql/` 18 MB, `createJS/` 1.6 MB + root debug files (`screen.jpg` 9 MB, `tsconfig.tsbuildinfo` 964 KB, `build1.txt`/`build2.txt`, `logs.csv`, `motifs_data.js`, `temp-response.json`, `test-*`, `rename-package_Version2.sh`).

Rewrote `.vercelignore` to exclude: `legacy/`, `docs/`, `archive/`, `haxe/`, `createJS/`, `discountheadstones/`, `q/`, `database-exports/`, `sql/`, `drizzle/`, `drizzle.config.ts`, `package-lock.json`, and the root debug files.

`public/` (9.3 GB) left untouched — must upload for CDN. Biggest subdirs: `ml/` 5.3 GB, `designs/` 1.2 GB, `screenshots/` 1 GB, `shapes/` 617 MB.

### ✅ Diagnosed: DNS `EBUSY` on `'wiecznapamiec.home.pl'`

Vercel env var value had a literal leading apostrophe — Vercel does **not** strip shell-style quotes. User must remove stray `'` / `"` from `SMTP_HOST` (and other `SMTP_*` values) in Vercel dashboard → Settings → Environment Variables → Production, then redeploy.

### ✅ Diagnosed: 45-Minute Build (from `build1.txt`)

Cold-cache build ≈ 24 min total: 4:51 clone, 2 min vercelignore processing, 30 s pnpm install, 6:20 `next build`, 3 min trace/functions/static, 7:04 deploy upload, 45 s cache. "Ready 23m 50s" matches. 45 min wall-clock includes queueing + upload. `.vercelignore` trim should shave clone + vercelignore + upload time.

### ⏳ Work Not Yet Validated / Pending

- [ ] Full `pnpm build` on refactored email module (only targeted `tsc --noEmit` was run; type-check on `lib/email/` is clean)
- [ ] `.vercelignore` safety check — grep verification that `drizzle/`, `sql/`, `archive/`, `haxe/`, `createJS/`, `discountheadstones/`, `q/`, `database-exports/` aren't imported from `app/`, `lib/`, `components/` (earlier grep timed out)
- [ ] Commit & push the batch:
  ```
  git add lib/email scripts/embed-email-xml.mjs next.config.ts .vercelignore components/DesignerNav.tsx
  git commit -m "fix(email): pre-parse XMLs to JSON + lazy-load; send screenshot as CID inline attachment; trim .vercelignore"
  git push
  ```
- [ ] **User action:** strip quotes from `SMTP_HOST` (and all `SMTP_*`) in Vercel Production env vars, redeploy
- [ ] **Verify on next save** after redeploy: email body shows the rendered 3D screenshot (via `cid:design-screenshot`), no raw `<img>` text, no "Message clipped" in Gmail
- [ ] **Optional follow-up:** replace fire-and-forget `sendEmail(...)` in `app/api/projects/route.ts:186–196` with Next 15's `after()` or explicit `await` — otherwise serverless freeze can kill in-flight SMTP
- [ ] **Optional:** un-hardcode `countryCode: 'au'` at `app/api/projects/route.ts:189` if per-user country routing is desired
- [ ] **Optional cosmetic:** header logo `https://www.forevershining.com.au/design/logo.webp` is WebP — spotty support in older Outlook / Windows Mail clients. Gmail also requires user to click "show images" for external URLs. Consider a PNG fallback.

### Key Technical Notes

- **Vercel tracing quirk:** `outputFileTracingIncludes` does NOT reliably win over wildcard `outputFileTracingExcludes`. Avoid runtime filesystem reads — bundle data as JS/JSON imports.
- **`__dirname` after bundling** points into `.next/server/chunks/`, so relative reads fail unless Next traces the file (it doesn't for dynamic paths).
- **JSON vs TS string literal:** Webpack/SWC skip minification for JSON asset modules. A 663 KB escaped-string `.ts` file triggers heavy minification → caused the 23 → 35 min build regression.
- **`tsconfig.json` has `resolveJsonModule: true`** — JSON imports work natively.
- **Fire-and-forget on serverless:** Vercel functions may be frozen/terminated immediately after `NextResponse.json(...)` returns, killing unfinished `.then()` callbacks. Recommended fix: `after()` from Next 15 or explicit `await`.
- **Country hardcoded:** `countryCode: 'au'` in `app/api/projects/route.ts:189` — all save-design emails currently route through `au` → PL mailbox fallback regardless of user country.
- **Never embed large data URIs in email `<img src>`.** Gmail clips messages >102 KB and strips/sanitizes `data:` URIs. Always use nodemailer CID inline attachments (`cid:some-id` + `attachments: [{ cid, content, contentDisposition: 'inline' }]`). Data URIs remain fine for PDF generation via `jsPDF.addImage()` because that path doesn't go through an SMTP body.
- **Data flow after this fix:** `app/api/projects/route.ts` stores screenshot as data URL (`screenshotPath`) on Vercel (ephemeral FS). `sendEmail()` now converts that data URI once — PDF attachment still gets the raw data URI, while the HTML body gets `cid:design-screenshot` and the binary is attached inline.

## Current Status (2026-04-24) — STARTER extraction; Bronze Plaque border fixes & store reset

- Created `starter-short.md`: extracted dated "Status (YYYY-MM-DD) — Title" entries from STARTER.md into concise 1–2 sentence summaries (includes older dates). File created at `starter-short.md`.
- Fixed New Design behavior for Bronze Plaque: `lib/headstone-store.ts` (`resetDesign`) updated to preserve product-specific defaults (plaque dimensions and visibility) when a catalog/product is loaded so "New Design" no longer resets Bronze Plaque to headstone defaults (900×900) or adds a granite Base.
- Investigated and updated Bronze border sizing (`components/three/BronzeBorder.tsx`): switched to prefer width-based scaling, removed a global multiplier that caused sudden size jumps at ~400mm, added conservative clamping for extreme dimensions, and (per user request) applied a 3× scale multiplier to integrated and non-integrated border geometry to increase visual thickness.
- Build validated: `pnpm run build` completed successfully after these edits.
- Next steps: Visual QA on plaque sizes (300×200, 560×200, 560×400). If border still needs tuning, will implement legacy ratio-based behavior from `createJS/dyo/Monument.getRatio()` to match historical visuals precisely.

---

## Current Status (2026-04-20, Part 2) — Screenshot Fix, Login→Save Flow, SMTP Guard

Follow-up session on 2026-04-20 after initial email system deployment.

### ✅ Blank/White Thumbnail Fix on Saved Designs

Designs saved after the email-system deployment produced blank/white thumbnails instead of proper 3D screenshots.

#### Root Cause
Two combined issues:
1. **Timing** — `canvas.toDataURL()` could return a blank frame if the WebGL drawing buffer was stale (no render between last frame and capture).
2. **Alpha transparency** — The Three.js canvas has `alpha: true`, so transparent areas rendered as white in JPEG exports (previous compositor only added a background when resizing).

#### Fix
- `components/three/Scene.tsx`: Expose `window.__r3fCamera` alongside existing `__r3fGL` / `__r3fScene` so external capture code has access to the camera.
- `components/DesignerNav.tsx` (`captureBestCanvasScreenshot`):
  - Preferred path calls `gl.render(scene, camera)` directly to force a fresh frame before reading the drawing buffer.
  - `encodeCanvasForUpload` now **always** composites onto a solid `#1a1a1a` background (removed the "only composite when resizing" branch).
  - DOM canvas search is now only a fallback if the R3F globals aren't present.
- Saved designs now consistently produce proper thumbnails matching the on-screen 3D preview.

### ✅ Auto-Open Save Design Modal After Login

When an unauthenticated user clicked "Save Design", the flow redirected to `/my-account` for login but did not return them to the save action.

#### Fix
- `components/DesignerNav.tsx`:
  - On "Save Design" click while unauthenticated, redirects to `/my-account?returnTo=/current-path?action=save-design`.
  - On mount, checks `window.location.search` for `?action=save-design`; if present, cleans up the URL via `history.replaceState` and opens the Save Design modal.
- `app/my-account/page.tsx`:
  - `onLogin` callback in `AuthGate` reads `returnTo` from `window.location.search` and routes back if present; otherwise shows the My Account page as before.
- Uses `window.location.search` instead of `useSearchParams()` to avoid SSG bailout requiring Suspense boundaries (was breaking `/select-size/[section]/[category]` prerender).

### ✅ SMTP Configuration Guard & Clearer Logs

Email sending silently failed on `forevershining.org` because no SMTP env vars were set on Vercel.

#### Fix
- `lib/email/index.ts`: `sendEmail()` now checks for `SMTP_{COUNTRY}_HOST` / `SMTP_HOST` before attempting to send. If neither is configured, logs a single clear warning:
  ```
  [Email] Skipping send (type=..., to=...): no SMTP host configured.
  Set SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS (or SMTP_AU_HOST etc.) in environment variables.
  ```
  and returns `{ success: false, error: 'SMTP not configured' }` instead of throwing a generic network error.

#### SMTP Setup (home.pl / wiecznapamiec)
The legacy `dyo5.php` uses a single home.pl mailbox for **PL / EU / UK** routes (AU uses office365):
```php
// case "pl": case "eu": case "co.uk": case "uk":
Host     = 'wiecznapamiec.home.pl'
Port     = 587          // STARTTLS
Username = 'biuro@wiecznapamiec.pl'
Password = <mailbox password>   // legacy value available in dyo5.php
SMTPSecure = 'tls'
From / ReplyTo = 'biuro@wiecznapamiec.pl'
BCC: biuro@wiecznapamiec.pl, polcreation@gmail.com
```

On Vercel, set these env vars (use the generic fallback so all countries route through this mailbox for now, or use the PL prefix to restrict to PL only):
```bash
# Generic fallback — used by every country that has no country-specific override
SMTP_HOST=wiecznapamiec.home.pl
SMTP_PORT=587
SMTP_USER=biuro@wiecznapamiec.pl
SMTP_PASS=<mailbox password — do NOT commit>

# Optional: pin PL specifically (same mailbox, explicit)
SMTP_PL_HOST=wiecznapamiec.home.pl
SMTP_PL_PORT=587
SMTP_PL_USER=biuro@wiecznapamiec.pl
SMTP_PL_PASS=<mailbox password>
```
`lib/email/transport.ts` tries `SMTP_{COUNTRY}_*` first, then falls back to `SMTP_*`. Port 587 with STARTTLS is handled automatically (secure: false when port !== 465).

Note: `forevershining.org` is the AU site — its legacy `countryCode: 'au'` routes via office365 in `dyo5.php`, but without AU-specific SMTP env vars set, it will fall back to the wiecznapamiec mailbox above, which is fine for testing.

#### Vercel Setup Checklist (forevershining.org — **current sole test target**)

Only the forevershining.org Vercel project is being tested right now. Configure the generic `SMTP_*` fallback there and every country will route through wiecznapamiec:

1. Vercel dashboard → `forevershining.org` project → **Settings → Environment Variables** (Production scope).
2. Add the four vars exactly as shown:
   ```
   SMTP_HOST = wiecznapamiec.home.pl
   SMTP_PORT = 587
   SMTP_USER = biuro@wiecznapamiec.pl
   SMTP_PASS = <mailbox password — from legacy dyo5.php>
   ```
3. Redeploy (any trivial commit or "Redeploy" button on the latest deployment).
4. Save a design while logged in → expect:
   - `polcreation@gmail.com` receives a BCC copy (AU country config `always` recipient).
   - `biuro@wiecznapamiec.pl` receives the From/Reply-To copy via SMTP auth.
5. Check **Vercel → Runtime Logs** for one of:
   - ✅ `[Email] Sent: saved-design → …`
   - ⚠️ `[Email] Skipping send … no SMTP host configured.` → env var not set in right scope.
   - ❌ nodemailer `EAUTH` / `535` → password wrong.

Other country SMTPs (`SMTP_AU_*`, `SMTP_US_*`, `SMTP_PL_*`, etc.) are **not** needed while only forevershining.org is live. Add them per country later when individual region deployments come online.

---

## Current Status (2026-04-20) — Email System, Grab Cursor, No-Base Fix, Price Popup Fix, Menu Drawer Memory

### ✅ Email System — Nodemailer + React Email + PDF Attachments

Complete email system migrated from legacy PHP/PHPMailer to modern Next.js stack.

#### Architecture
- **Transport**: Nodemailer with per-country SMTP configuration from environment variables
- **Templates**: React Email JSX components (type-safe, server-rendered to HTML)
- **Translations**: Parsed from existing `public/xml/languages24.xml` (~300+ keys per language)
- **Country Config**: Parsed from existing `public/xml/countries24.xml` (AU, US, UK, PL, EU, PG, NZ, CA)
- **PDF Attachments**: Server-side generation using jsPDF for saved-design and order emails

#### Email Types (Discriminated Union on `type` field)
| Type | Template | PDF | Trigger Point |
|------|----------|-----|---------------|
| `saved-design` | `SavedDesignEmail.tsx` | ✅ Quote PDF | `POST /api/projects` after successful save |
| `order` | `OrderInvoiceEmail.tsx` | ✅ Invoice PDF | Buy page via `POST /api/email` |
| `enquiry` | `EnquiryEmail.tsx` | ❌ | `POST /api/share/email` (replaced 501 stub) |
| `registration` | `RegistrationEmail.tsx` | ❌ | `POST /api/auth/register` after account creation |
| `password-reset` | `PasswordResetEmail.tsx` | ❌ | `POST /api/auth/forgot-password` |

#### Key Files
| File | Purpose |
|------|---------|
| `lib/email/types.ts` | TypeScript types (EmailData union, CountryEmailConfig, QuoteLineItem, SendEmailResult) |
| `lib/email/index.ts` | Main `sendEmail()` orchestrator — renders template, generates PDF, sends via SMTP |
| `lib/email/transport.ts` | Nodemailer SMTP transport factory with per-country config caching |
| `lib/email/config/countries.ts` | Parses `countries24.xml` → `Map<string, CountryEmailConfig>`, BCC routing |
| `lib/email/config/translations.ts` | Parses `languages24.xml` → `TranslationsByLocale`, `t(locale, key)` helper |
| `lib/email/helpers.ts` | `breakdownToQuoteItems()` converts PricingBreakdown → QuoteLineItem[], `countryToCode()` |
| `lib/email/pdf-email.ts` | Server-side PDF generation using jsPDF, returns Buffer for attachment |
| `lib/email/templates/components/` | Shared: `EmailLayout.tsx`, `DesignPreview.tsx`, `QuoteTable.tsx`, `ContactInfo.tsx` |
| `app/api/email/route.ts` | `POST /api/email` endpoint with auth check (password-reset skips auth) |

#### SMTP Configuration (Environment Variables)
```bash
# Generic fallback
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=password

# Per-country overrides (optional)
SMTP_AU_HOST=smtp.au.example.com
SMTP_AU_PORT=587
SMTP_AU_USER=au@example.com
SMTP_AU_PASS=password
```

#### BCC Routing (from legacy dyo5.php)
Each country has BCC addresses for `savedDesigns`, `orders`, `admin`, and `always` — configured in `lib/email/config/countries.ts`.

#### Email Branding
- Gold theme: `#DEBD68` for headers and links
- Dark header: `#060709` background
- Footer: Country-specific contact info from `countries24.xml`
- Logo: Per-country logo URL from config

#### Dependencies Added
- `nodemailer@8.0.5` — SMTP transport
- `@react-email/components@1.0.12` — JSX email templates
- `@types/nodemailer@8.0.0` — TypeScript types

### ✅ Password Reset Flow (New)

Complete forgot-password / reset-password flow using the existing `password_resets` DB table.

#### API Routes
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/forgot-password` | POST | Generates secure random token (SHA-256 hashed), stores in DB, sends reset email. Always returns success to prevent email enumeration. |
| `/api/auth/reset-password` | POST | Validates token (unconsumed + not expired), updates password hash, marks token consumed. 24-hour expiry. |

#### Security
- Token: `crypto.randomBytes(32)` → hex string in URL, SHA-256 hash stored in DB
- Anti-enumeration: Same success response regardless of whether email exists
- Token consumed in same transaction as password update
- 24-hour expiry on reset links

### ✅ Grab Cursor for Draggable 3D Items

All draggable items (inscriptions, motifs, images, additions, emblems) now show a grab/grabbing cursor on hover/drag.

#### Root Cause
`styles/globals.css` has a wildcard CSS rule `*:not(input)... { cursor: default; }` that overrides `document.body.style.cursor`. The fix uses `gl.domElement.style.cursor` (inline styles override non-`!important` CSS).

#### Files Modified (7 files)
- `components/HeadstoneInscription.tsx` — inscription drag cursor
- `components/three/MotifModel.tsx` — motif drag cursor
- `components/three/ImageModel.tsx` — image drag cursor
- `components/three/EmblemModel.tsx` — emblem drag cursor
- `components/three/AdditionModel.tsx` — addition drag cursor
- `components/SelectionBox.tsx` — selection box drag cursor
- `components/InscriptionBoxSelection.tsx` — inscription box drag cursor

### ✅ Menu Drawer Memory

When clicking "Back to Menu" from a sub-page (e.g., Inscriptions), the sidebar now reopens the last-used accordion section (Setup/Design/Account) instead of always defaulting to Setup.

#### Implementation
- `DesignerNav.tsx`: Tracks `lastManualGroup` ref that updates on manual accordion clicks
- "Back to Menu" handler restores `lastManualGroup` instead of resetting to index 0

### ✅ Headstone Sits on Ground When No Base Selected

When the base is set to "No Base" in Select Size, the headstone was floating in the air because the assembly group always offset Y by `baseHeightMeters`.

#### Fix
- `HeadstoneAssembly.tsx` line 96: Changed `position={[0, baseHeightMeters, 0]}` → `position={[0, showBase ? baseHeightMeters : 0, 0]}`
- Now only applies Y offset when `showBase` is true; headstone rests at ground level (y=0) without a base

### ✅ Price Popup Table Header Scroll Fix

The sticky table header (PRODUCT / QTY / PRICE / ITEM TOTAL) in the Check Price popup had a semi-transparent background (`bg-[#d4af37]/12`), causing scrolled content to show through.

#### Fix
- `CheckPricePanel.tsx`: Changed to solid `bg-[#1a1508]` with `z-10` and bottom shadow
- Content no longer overlaps header when scrolling the quote table

### ✅ Full Color Plaque — Free Inscriptions & Motifs

Product 32 (Full Color Plaque) inscriptions and motifs are now free, matching the XML catalog config:
```xml
<addition id="1701" type="inscription" name="Inscription" />
<addition id="1700" type="motif" name="Motif" formula="Enamel" />
```

#### Implementation
- `lib/headstone-store.ts`: Early returns in `recalculateInscriptionPrices()` and `recalculateMotifPrices()` for product 32
- `lib/motif-pricing.ts`: Early return for product 32 motifs
- Sidebar inscription/motif panels no longer show prices for product 32

## Previous Status (2026-04-15) — Nav Redesign, Accordion Menu, Gilding Filter, Product 32 Image, Image Update Feature

### ✅ Sidebar Navigation Redesign — Elegant Memorial Brand Identity

The sidebar navigation section headers (Setup / Design / Account) have been completely redesigned to match the "Forever Shining" memorial brand identity, moving from a generic app look to a dignified, inviting experience.

#### Design Approach: Classic Serif + Golden Thread (Options 1 + 2)
- **Typography**: Section titles ("Setup", "Design", "Account") use **Playfair Display** serif font (already loaded in `app/layout.tsx`), replacing the default sans-serif
- **Roman Numerals**: Step numbers changed from "01"/"02"/"03" to Roman numerals I / II / III in thin gold-stroked circles (`border-[#DEBD68]`, `text-[#DEBD68]`)
- **Italic Step Labels**: "Step I" / "Step II" / "Step III" rendered in serif italic for a softer, human touch
- **Golden Thread Connector**: A thin vertical gold line (`w-px bg-gradient-to-b from-[#DEBD68]/40 via-[#DEBD68]/20 to-transparent`) connects sections visually
- **Browse Designs CTA**: Styled with gold border (`border-[#DEBD68]/30`), Playfair Display font, and sparkle icon to match brand

#### Accordion Behavior (Collapsible Sections)
- Only **one section open at a time** — clicking a section closes the others
- State: `openGroup` (single number index, `-1` = all collapsed)
- `toggleGroup(index)` — opens clicked group, closes others; re-clicking closes it
- **Auto-expand**: Section containing the active route auto-opens on navigation
- **Smooth animation**: Uses `max-h-0 opacity-0` → `max-h-[2000px] opacity-100` with 300ms CSS transition
- **Chevron indicator**: Rotates on open/close (`transition-transform duration-300`)
- Header row is a clickable `<button>` with hover feedback (`hover:bg-white/5`)
- Collapsed cards have equal top/bottom padding around the circle indicator

#### Updated Headers
- **Mobile header** (~line 2826): Matches serif + Roman numeral styling
- **Fullscreen panel header** (~line 2689): Same serif treatment
- **Spacing**: `gap-5` (20px) between section cards, `mt-5` above Browse Designs

#### Key Files
- `components/DesignerNav.tsx` — Section headers at ~lines 2964-3005, accordion state at ~lines 381-408

### ✅ Select Emblems — Bronze Plaque Only

The "Select Emblems" menu item now only appears for Bronze Plaque products (product ID 5).

- Changed `requiresPlaque` flag to `requiresBronzePlaque` in menu item definition
- Filter: `productId !== '5'` hides the item for all other products
- Previously showed for all plaque types including Full Color Plaque (product 32) which doesn't support emblems

### ✅ Product 32 (Full Color Plaque) — Free Image Auto-Selection

For Full Color Plaque (product 32), the image workflow is simplified:
- **Auto-selects Free Image** (type ID 137) on mount — skips the image type selection grid
- **Hides "Back to image types" button** — no need to go back since there's only one relevant type
- **No ceramic mesh**: Free Image (type 137) excluded from `needsCeramicBase` in `ImageModel.tsx`
- **No mask selection**: Oval/rectangle/heart mask UI hidden for product 32; `maskShape` set to `''`
- **Flat on plaque surface**: Photo mesh at `0.05mm` offset (not ceramic depth ~1mm+), SelectionBox at `0.1mm`
- These images will be printed directly on the plaque, not applied as ceramic overlays

#### Key Files
- `components/ImageSelector.tsx` — Auto-select logic, hidden back button, hidden mask UI
- `components/three/ImageModel.tsx` — Ceramic base exclusion, flat z-positioning

### ✅ Gold/Silver Gilding — Traditional Engraved Products Only

Gold Gilding and Silver Gilding color options now only appear for products with `formula="Engraved"` (Traditional Engraved Headstone, Traditional Engraved Plaque, Traditional Engraved Full Monument).

#### Implementation
- **Added `formula` field** to `CatalogData.product` interface in `lib/xml-parser.ts`
- **Parsed from XML**: `productElement.getAttribute('formula')` — values: `"Engraved"`, `"Laser"`, `"Enamel"`, `"Bronze"`
- **Filter condition**: `const isEngraved = catalog?.product.formula === 'Engraved'`
- **Applied in 3 files**:
  1. `components/EditMotifPanel.tsx` — Gilding grid wrapped in `{isEngraved && ...}`
  2. `components/InscriptionEditPanel.tsx` — Added `catalog` from store, gilding wrapped in `{isEngraved && ...}`
  3. `components/DesignerNav.tsx` — Gilding section in sidebar motif color picker wrapped in `{isEngraved && ...}`
- The "Select Color" label and regular color palette grid remain visible for all products that support color — only the Gold/Silver Gilding shortcuts are hidden

#### Product Formula Values (from XML catalogs)
| Formula | Products | Gilding |
|---------|----------|---------|
| `Engraved` | Traditional Engraved Headstone (124), Plaque (34), Full Monument (101) | ✅ Yes |
| `Laser` | Laser Etched products (8, 22, 30, 51, 100) | ❌ No (entire color section hidden by `isLaser`) |
| `Enamel` | Full Color Plaque (32), Vitreous Enamel products (11, 50, 2350) | ❌ No |
| `Bronze` | Bronze products (5, 53) | ❌ No |

### ✅ Motif Preview Color Consistency

Motif category thumbnails in the sidebar now use the product's `defaultColor` from the catalog instead of a hardcoded bronze color.

- **Before**: `BRONZE_HEX = '#CD7F32'` (hardcoded copper/bronze) — didn't match the actual motif color on the headstone
- **After**: `catalog?.product?.defaultColor || '#c99d44'` — matches the color the motif actually renders with in the 3D scene
- **Applies to**: Both category grid thumbnails and individual motif thumbnails in `MotifSelectorPanel.tsx`
- For Traditional Engraved products, this is `#c99d44` (Gold Gilding); other products use their own `default-color` from XML

### ✅ New Design — Styled Confirm Modal & Base Reset

The "New Design" button now uses a styled confirmation modal instead of `window.confirm()`, and properly resets all dimensions including base.

#### Styled Confirm Modal
- **Created `components/ConfirmModal.tsx`** — Reusable portal-based modal (`createPortal` to `document.body`, z-[9999])
- **Styling**: Dark gradient background, gold confirm button (`bg-[#D7B356]`), rounded card — matches `SaveDesignModal` design
- **Props**: `title`, `message`, `confirmLabel`, `cancelLabel`, `onConfirm`, `onCancel`
- **Replaces** browser `confirm()` in `DesignerNav.tsx` New Design handler

#### Base Dimension Reset
- `resetDesign()` in `lib/headstone-store.ts` now resets:
  - `baseWidthMm: 1260` (900 × 1.4 ratio)
  - `baseHeightMm: 100`
  - `baseThickness: 250`
  - `baseFinish: 'default'`
  - `uprightThickness: 150`
  - `slantThickness: 150`
- Previously only reset headstone width/height, leaving base at the old design's dimensions

### ✅ Image Update (Replace Photo) Feature

Selected images now have an **"Update"** button alongside Duplicate and Delete, allowing users to replace the photo while preserving position, size, mask, type, and rotation.

#### How It Works
1. **User selects an image** on the headstone → sidebar shows editing panel with Update / Duplicate / Delete
2. **Click "Update"** → file picker opens (hidden `<input type="file">` triggered via ref)
3. **User selects new photo** → crop screen shows with the new image, sidebar switches from editing panel to crop controls
4. **Crop button says "Update Photo"** instead of "Crop Image" to indicate update mode
5. **After cropping** → `updateImageData(id, imageUrl, croppedAspectRatio, colorMode)` replaces only the photo data on the existing image
6. **Preserved properties**: `xPos`, `yPos`, `widthMm`, `heightMm`, `rotationZ`, `maskShape`, `typeId`, `typeName`, `sizeVariant`, `target`

#### Implementation
- **Store action** (`lib/headstone-store.ts`): `updateImageData(id, imageUrl, croppedAspectRatio, colorMode)` — maps over `selectedImages`, replaces only photo-related fields, clears `cropCanvasData`
- **Type** (`lib/headstone-store.types.ts`): Added `updateImageData` to `HeadstoneState` interface
- **UI** (`components/ImageSelector.tsx`):
  - `updatingImageId` state tracks which image is being updated
  - `updateFileInputRef` — hidden file input inside the editing panel's early-return block (must be co-located since the component returns early when an image is selected)
  - `handleUpdateUpload` — reads file, auto-sets `selectedType` from existing image's `typeId`, opens crop UI
  - Condition `!(showCropSection && updatingImageId)` on the editing panel early-return — allows the crop controls to render during update flow
  - Cleanup: `updatingImageId` cleared on Cancel, Back, crop error, and successful crop

#### Key Files
- `lib/headstone-store.ts` — `updateImageData` action (after `duplicateImage`)
- `lib/headstone-store.types.ts` — Type definition
- `components/ImageSelector.tsx` — Update button, file input, crop flow branching

### 📌 Next Steps

1. **Add 6 new failures to KNOWN_FAILURES** — `1662337522025`, `1667480366612`, `1670405007473`, `1673437084641`, `1675259335154`, `1752619990342`
2. **Fix plaque inscription positioning** — Design 1636593295668 inscriptions start above plaque top
3. **Batch re-anonymize designs** — 18k designs potentially affected by sanitizer regex bug
4. **Visual QA pass** — Compare designs with original screenshots
5. **Update PRODUCT_STATS** — Pets count still shows 254, should be 111
6. **Migrate `fullColourPlaqueBorders`** from `_data.ts` to database

---

## Previous Status (2026-04-14) — Product 32 Data Migration to DB/XML, Background/Color Toggle, Upload Image, No Background

### ✅ Product 32 Data Migrated from Hardcoded TypeScript to Database & XML

All product 32 (Full Color Plaque) configuration data has been moved out of `app/_internal/_data.ts` into PostgreSQL tables and XML catalog files, following the principle that product config should never be hardcoded in TypeScript.

#### Sizes → Database (`sizes` table)
- **9 fixed sizes** migrated from hardcoded `fullColourPlaqueSizes` array to `sizes` table
- **Source XML**: `public/xml/au_EN/sizes.xml` (product 201)
- **Seed script**: `scripts/seed-sizes.ts` — parses XML, inserts rows with `widthMm`, `heightMm`, `priceCents`
- **API**: `GET /api/catalog/sizes/?productType=full-colour-plaque` returns sizes with dollars/mm
- **Store**: `headstone-store.ts` `setProductId()` fetches from API → `setFixedSizes()`
- **Consumers**: `DesignerNav.tsx`, `CheckPricePanel.tsx`, `ThreeScene.tsx` all use `fixedSizes` from store

#### Backgrounds → Database (`backgrounds` table)
- **40 backgrounds** migrated from hardcoded `backgrounds` array to `backgrounds` table (category: `background`)
- **35 color textures** discovered from `public/jpg/backgrounds/colors/s/*.jpg` and seeded (category: `color`)
- **Source XML**: `public/xml/au_EN/backgrounds.xml` — names updated to generic "Background 1" through "Background 40"
- **Seed script**: `scripts/seed-backgrounds.ts` — parses XML + filesystem discovery for colors
- **API**: `GET /api/catalog/backgrounds/` returns all backgrounds with `category` field
- **Schema**: `lib/db/schema.ts` `backgrounds` table has `category` column (`background` | `color`)
- **DB totals**: 77 rows (40 active backgrounds + 2 inactive + 35 colors)

#### Removed from `_data.ts`
- `fullColourPlaqueSizes` array and `FixedSize` type → now in DB + `lib/headstone-store.types.ts`
- `backgrounds` array → now in DB
- `fullColourPlaqueBorders` remains in `_data.ts` (not yet migrated)

### ✅ Background/Color Toggle (SegmentedControl)

Product 32 material selector shows a toggle switch to filter between Backgrounds and Color Textures.

- **UI component**: `SegmentedControl` (from `ui/SegmentedControl.tsx`)
- **Sidebar**: `MaterialSelector.tsx` — toggle above the grid, filters `displayMaterials` by `bgTab` state
- **Fullscreen**: `MaterialSelectionGrid.tsx` — same toggle with consistent styling
- **Background textures**: `/jpg/backgrounds/forever/l/{1-40}.jpg` (2474×1365px), thumbnails in `/m/`
- **Color textures**: `/jpg/backgrounds/colors/l/{01-35}.jpg`, thumbnails in `/s/` (zero-padded filenames)

### ✅ No Background Option

First position in Background tab. Resets plaque to default brushed stainless steel texture.

- **Default texture**: `jpg/metals/l/brushed-ss-swatch.jpg` — sourced from `catalog-id-32.xml` `<file type="table" color="...">`, not hardcoded
- **Store sets this on shape load**: `headstone-store.ts` line ~826 reads `shape.table.color` from parsed XML catalog
- **Selected-state highlighting**: Gold border/ring when active (matches current `headstoneMaterialUrl`)
- **Both sidebar and fullscreen**: Consistent icon (circle-slash) + "None" label

### ✅ Upload Image as Background

Second position in Background tab. Allows uploading a custom photo as the plaque background.

#### How It Works
1. **Sidebar** (`MaterialSelector.tsx`): Click "Upload Image" → file picker → image goes to existing `CropCanvas` (via `useImageCropState` hook + `setCropCanvasData`)
2. Inline crop controls shown: size slider (Smaller/Larger), rotation slider (Decrease/Increase), Flip X/Y, Apply/Cancel — styled to match `ImageSelector.tsx`
3. **Apply Background** → crop processed on canvas → `canvas.toBlob()` → `POST /api/upload-background` → returns server URL → set as `headstoneMaterialUrl`
4. **Fullscreen** (`MaterialSelectionGrid.tsx`): Simpler flow — file picker → FormData POST to `/api/upload-background` → set URL → navigate to next step

#### Server-Side Upload API (`app/api/upload-background/route.ts`)
- `POST /api/upload-background` — thin proxy using `lib/upload/proxy.ts`
- Dev: saves to `public/uploads/backgrounds/{uuid}.jpg`, returns `/uploads/backgrounds/{uuid}.jpg`
- Production: proxies to `https://www.wiecznapamiec.pl/forevershining/upload.php`, returns full `https://www.wiecznapamiec.pl/forevershining/uploads/backgrounds/{uuid}.jpg`
- See **File Storage System** section for full architecture

#### Why Server-Side Upload (not blob/data URLs)
drei's `useTexture` pipeline (R3F's memoized `TextureLoader` singleton → Three.js `ImageLoader.load()`) corrupts blob: and data: URLs by prepending `/`. This causes `Could not load /blob:http://...` errors. Standard file paths (and cross-origin HTTPS URLs with CORS headers) bypass this entirely.

**Defense-in-depth guards remain:**
- `SvgHeadstone.tsx`: `useBlobTexture` hook (lines ~20-51) — loads blob/data URLs via native `THREE.TextureLoader().loadAsync()`, bypassing drei
- `ShapeSwapper.tsx`: `isBlobOrDataTex` flag skips `PreloadTexture` component for blob/data URLs
- `ShapeSwapper.tsx`: `requestedTex` useMemo has blob/data passthrough checks

### ✅ Background Only on Front Face

For product 32, background textures only apply to the front face of the plaque. Back and sides show plain grey material.

- `SvgHeadstone.tsx`: `stretchFace` prop forces `repFaceX=1, repFaceY=1` (no texture tiling)
- `SvgHeadstone.tsx`: `sideTexture={null}` creates plain grey `MeshPhysicalMaterial` for back+sides
- `ShapeSwapper.tsx`: passes `stretchFace={true}` and `sideTexture={null}` when `isFullColourPlaque`
- Front-face material group assignment ensures only front triangles get the background texture

### ✅ Workflow Routing for Product 32

After Select Shape, product 32 goes to Background selection (not Select Border like other products).

- `ShapeSelector.tsx` and `ShapeSelectionGrid.tsx`: route to `/select-material` for product 32
- The `/select-material` page shows "Background" label instead of "Select Material"

### ✅ Product 32 (Full Color Plaque / Stainless Steel Plaque) — Base Configuration

Complete implementation of Product 32, a ceramic full-colour plaque on a stainless steel frame.

#### Product Configuration (`public/xml/catalog-id-32.xml`)
- **Product ID**: 32, **Type**: `plaque`, **Material type**: `backgrounds`, **materialID**: `17`
- **Shapes**: Only 2 — Rectangle (Landscape) and Rectangle (Portrait)
- **Borders**: 2 options — "No Border" and "Stainless Steel Border" (Border 4)
- **Default texture**: `jpg/metals/l/brushed-ss-swatch.jpg` (brushed stainless steel) — set via `<file type="table" color="...">`
- **Flags**: `border="1"`, `fixed="1"`, `sizes="9"`, `background="1"`, `laser="0"`

#### Fixed Size System (Database)
Product 32 uses 9 preset sizes (not continuous sliders), now served from the `sizes` database table:

| # | Width × Height (mm) | Price |
|---|---------------------|-------|
| 1 | 110 × 150 | $350 |
| 2 | 122 × 152 | $390 |
| 3 | 130 × 180 | $440 |
| 4 | 150 × 200 | $500 |
| 5 | 180 × 240 | $570 |
| 6 | 200 × 250 | $600 |
| 7 | 240 × 300 | $700 |
| 8 | 216 × 381 | $780 |
| 9 | 280 × 380 | $990 |

- **UI**: Discrete-step slider (1–9 stops) in `DesignerNav.tsx` `renderSelectSizePanel()`
- **Pricing**: `CheckPricePanel.tsx` uses price lookup from `fixedSizes` store state
- **Orientation**: Width↔height transposed for landscape shapes
- **Stainless Steel Border**: Fixed $299 add-on (product ID 37), shown in Check Price when SS border selected

#### Stainless Steel Border (`BronzeBorder.tsx`)
- Border 4 SVG rendered with stainless steel texture (dedicated `generateStainlessSteelTexture()`)
- **Fixed physical frame width**: SVG scale uses `fixedFrameFactor = 200 / minDimensionMm` (no clamping)
- **Coverage clamping skipped** for SS borders (bronze borders clamp to 97-99% coverage)
- **Instant rebuild**: Debounce disabled for SS borders since sizes are discrete steps
- Data: `fullColourPlaqueBorders` in `_data.ts` (2 entries: No Border + SS Border)

#### Key Files
- `components/MaterialSelector.tsx` — Background/Color toggle, No Background, Upload Image, crop controls
- `app/select-material/_ui/MaterialSelectionGrid.tsx` — Fullscreen version of same
- `components/SvgHeadstone.tsx` — `stretchFace`, `sideTexture`, `useBlobTexture` hook
- `components/three/headstone/ShapeSwapper.tsx` — Product 32 prop forwarding, blob/data guards
- `app/api/upload-background/route.ts` — Server-side image upload endpoint
- `app/api/catalog/sizes/route.ts` — Sizes API
- `app/api/catalog/backgrounds/route.ts` — Backgrounds API (with category)
- `lib/db/schema.ts` — `sizes` and `backgrounds` tables
- `scripts/seed-sizes.ts` — Sizes seeder from XML
- `scripts/seed-backgrounds.ts` — Backgrounds + color textures seeder
- `components/ConditionalCanvas.tsx` — `{cropCanvasData ? <CropCanvas /> : <ThreeScene />}` swap

### 📌 Next Steps

1. **Add 6 new failures to KNOWN_FAILURES** — `1662337522025`, `1667480366612`, `1670405007473`, `1673437084641`, `1675259335154`, `1752619990342`
2. **Fix plaque inscription positioning** — Design 1636593295668 inscriptions start above plaque top
3. **Batch re-anonymize designs** — 18k designs potentially affected by sanitizer regex bug
4. **Visual QA pass** — Compare designs with original screenshots
5. **Update PRODUCT_STATS** — Pets count still shows 254, should be 111
6. **Migrate `fullColourPlaqueBorders`** from `_data.ts` to database

---

## Previous Status (2026-04-13) — 3D Screenshots Replace 2D Previews, Design Page CTA, Loading Overlay, Build Optimization

### ✅ 3D Screenshots Replace All Legacy 2D Previews

All design pages now use generated 3D screenshots (`/screenshots/v2026-3d/{id}.png`) instead of legacy 2D screenshots from `/ml/*/saved-designs/screenshots/`. This change spans:

#### Category Pages (`/designs/[productType]/[category]`)
- `CategoryPageClient.tsx` — Removed `graniteThumb` legacy screenshot `<img>` element and `onError` handler from design cards. Kept dimensions + granite name text.
- Design cards already had 3D screenshots at the top; the old legacy thumbnail in the specs section was the duplicate removed.

#### Individual Design Pages (`/designs/.../[slug]`)
- **2D preview block removed** — The entire old 2D preview rendering (~509 lines: SVG shape rendering, inscriptions overlay, motifs overlay, draggable elements, inscription editing UI) was removed from `DesignPageClient.tsx`.
- **Replaced with** a simple `<img>` tag loading `/screenshots/v2026-3d/{designId}.png` with `_small.png` fallback on error.
- **SSR content** (`page.tsx`) already used 3D screenshot path — confirmed at line ~541.

#### Related Designs Sections
- `DesignContentBlock.tsx` — "Similar Designs" and "More Memorial Designs" sections updated to use `/screenshots/v2026-3d/{id}_small.png` instead of `relatedDesign.preview` / `catDesign.preview`. Changed `object-cover` to `object-contain p-2` for transparent PNGs.
- Removed "Customize This Design" CTA button at the bottom of `DesignContentBlock.tsx`. Cleaned up unused `editUrl` / `getEditUrl()` code.

#### SEO Metadata (page.tsx)
- **OpenGraph images**: Changed from `design.preview` to `/screenshots/v2026-3d/${design.id}.png`
- **Twitter card images**: Same change
- **JSON-LD Product schema `image`**: Now uses absolute URL `${baseUrl}/screenshots/v2026-3d/${design.id}.png`
- **JSON-LD ImageObject**: Unconditionally included (was conditional on `design.preview`)
- **`<link rel="preload">`**: Points to 3D screenshot (unconditional, was conditional)

#### extract-design-specs.ts
- `getScreenshotPath()` and `getFallbackThumbnailPath()` now return `/screenshots/v2026-3d/{designId}_small.png` instead of old `/ml/{mlDir}/saved-designs/screenshots/...` paths.

### ✅ "Personalize Design" CTA Button

Added a "Personalize Design" button below the 3D screenshot on individual design pages. Loads the design into the local 3D editor (same flow as My Account → Edit).

#### How It Works
1. `DesignPageClient.tsx` loads the design into the Zustand store on mount via `useEffect` → `fetchCanonicalDesign()` → `loadCanonicalDesignIntoEditor()`
2. Button is **disabled** until `canonicalLoadState === 'success'` — shows inline spinner with "Loading Design…" while loading
3. On click: sets `loadingIntoEditor = true` (triggers full-screen overlay) → `router.push('/select-size')`
4. **Mobile sticky CTA** at the bottom also updated — was linking to external `headstonesdesigner.com`, now uses same local `router.push('/select-size')` flow

#### FORCE_LEGACY_PARITY_IDS Removed
- The `FORCE_LEGACY_PARITY_IDS` set (only contained `1578016189116`) forced certain designs through `loadSavedDesignIntoEditor` instead of `loadCanonicalDesignIntoEditor`. This was needed for the old 2D preview rendering but is wrong for the 3D editor.
- All designs now use the canonical loader path — same path the Load Design popup uses successfully.
- `shouldForceLegacyParity` hardcoded to `false`, legacy branch removed from the loading `useEffect`.

### ✅ Full-Screen Loading Overlay

Dark overlay with spinner shown during design loading transitions. Matches the existing popup/modal pattern used across the app.

#### Design Pages (`DesignPageClient.tsx`)
- Overlay shown when user clicks "Personalize Design" button (`loadingIntoEditor` state)
- `fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm` with centered white spinner
- Text: "Loading design…" in `font-mono`

#### Load Design Popup (`LoadDesignButton.tsx`)
- Overlay shown after modal closes while design is loading (`loading && !isOpen`)
- Uses `createPortal(…, document.body)` to render above everything
- Same visual style as design page overlay

#### SSR Content Hiding Fix
- `document.getElementById('design-ssr-content')?.remove()` caused `NotFoundError: Failed to execute 'removeChild' on 'Node'` when `router.push` triggered React unmounting
- Fixed to `el.style.display = 'none'` — node stays in DOM for React's cleanup

### ✅ Build Optimization — .vercelignore Excludes Old Screenshots

The old 2D screenshots in `public/ml/*/saved-designs/screenshots/` totalled **4.3 GB across 95,119 files** — the main cause of Vercel build timeouts (45-minute limit exceeded).

#### Changes
- `.vercelignore` updated: replaced individual JPG exclusion rules with a single `public/ml/**/screenshots/` line that excludes the entire screenshots directories
- **Before**: Excluded full-size JPGs but kept `_small.jpg` thumbnails (~850 MB)
- **After**: Excludes everything in screenshots dirs (~4.3 GB saved)
- The `_cropped.json` metadata files in those dirs are no longer critical — the loading effect has a fallback that derives dimensions from the design JSON

#### Size Impact
| Directory | Size | Files | Status |
|-----------|------|-------|--------|
| `public/ml/bronze-plaque/saved-designs/screenshots/` | 853 MB | 12,634 | **Excluded** |
| `public/ml/forevershining/saved-designs/screenshots/` | 2,289 MB | 52,727 | **Excluded** |
| `public/ml/headstonesdesigner/saved-designs/screenshots/` | 1,204 MB | 29,758 | **Excluded** |
| `public/screenshots/v2026-3d/` | 1,005 MB | 9,124 | **Included** (3D renders) |

### 📌 Next Steps

1. **Add 6 new failures to KNOWN_FAILURES** — `1662337522025`, `1667480366612`, `1670405007473`, `1673437084641`, `1675259335154`, `1752619990342`
2. **Fix plaque inscription positioning** — Design 1636593295668 inscriptions start above plaque top
3. **Batch re-anonymize designs** — 18k designs potentially affected by sanitizer regex bug
4. **Visual QA pass** — Compare designs with original screenshots
5. **Update PRODUCT_STATS** — Pets count still shows 254, should be 111

---

## Previous Status (2026-04-12) — Menu Navigation Fixes, /design-menu Route, Additions Panel Fixes

### ✅ "Back to Menu" Navigation & `/design-menu` Route

Clicking **"Back to Menu"** from any fullscreen panel (e.g., Select Material, Select Size) previously left the URL on the panel's route (e.g., `/select-material`) and kept the corresponding menu item highlighted. Now "Back to Menu" navigates to a new **`/design-menu`** route that shows the full sidebar menu + 3D canvas with no item highlighted.

#### Implementation
- **New route `app/design-menu/page.tsx`** — minimal page that returns `null` (sidebar + canvas render from layout)
- **`handleBackToMenu`** callback in `DesignerNav.tsx` (~line 382): calls `closeFullscreenPanel()` + `router.push('/design-menu')`
- **"Back to Menu" button** wired to `handleBackToMenu` instead of bare `closeFullscreenPanel`
- **Canvas visibility**: `/design-menu` added to `canvasVisiblePages` in `DesignerNav.tsx` and to canvas-visibility guards in `ConditionalCanvas.tsx`
- **Sidebar visibility**: `/design-menu` added to `isDesignerRoute` in `ConditionalNav.tsx` so the designer nav renders (not the global nav)
- **No menu item highlighted**: since `/design-menu` doesn't match any `fullscreenPanelSlug`, the route-sync `useEffect` auto-closes any active panel, and no menu item gets the active/highlighted style

#### Files Changed
- `app/design-menu/page.tsx` — New file (returns null)
- `components/DesignerNav.tsx` — `handleBackToMenu`, `canvasVisiblePages` includes `/design-menu`, Back to Menu onClick
- `components/ConditionalCanvas.tsx` — `isDesignMenuPage` keeps canvas visible
- `components/ConditionalNav.tsx` — `isDesignerRoute` includes `/design-menu`

### ✅ Additions Panel Bounce-Back Fix

The Select Additions panel showed an empty state when returning to it after previously selecting an addition and navigating away. The additions catalog was invisible because `selectedAdditionId` was stale (still set from the prior session) even though `activePanel !== 'addition'`.

#### Root Cause
The catalog visibility check used `!selectedAdditionId` — if any addition had ever been selected, the catalog was hidden (even when the user wasn't actively editing). Motifs correctly used `!hasActiveMotif` which checks both selection AND active panel state.

#### Fix
- Added `hasActiveAdditionForPanel` computed value (~line 467): checks `selectedAdditionId && activePanel === 'addition'`
- Changed `isAdditionCatalogVisible` and the catalog render guard from `!selectedAdditionId` to `!hasActiveAdditionForPanel`
- Now follows the same pattern as motifs: catalog shows unless the user is actively editing a specific addition

#### Files Changed
- `components/DesignerNav.tsx` — `hasActiveAdditionForPanel`, `isAdditionCatalogVisible` fix, catalog render guard fix

### ✅ Additions Grid Desktop Flash Fix

On desktop, the `AdditionSelectionGrid` briefly flashed over the canvas for one frame when navigating to `/select-additions`. The grid is mobile-only but rendered during SSR because `isDesktop` started as `false`.

#### Fix
- Changed `isDesktop` state from `useState(false)` to `useState<boolean | null>(null)`
- Changed render guard from `!isDesktop` to `isDesktop === false` (strict equality)
- Grid only renders after client-side media query confirms mobile — no SSR flash

#### Files Changed
- `app/select-additions/page.tsx` — `isDesktop` initialization and `showGrid` check

### 📌 Next Steps

1. **Add 6 new failures to KNOWN_FAILURES** — `1662337522025`, `1667480366612`, `1670405007473`, `1673437084641`, `1675259335154`, `1752619990342`
2. **Fix plaque inscription positioning** — Design 1636593295668 inscriptions start above plaque top
3. **Batch re-anonymize designs** — 18k designs potentially affected by sanitizer regex bug
4. **Visual QA pass** — Compare designs with original screenshots
5. **Update PRODUCT_STATS** — Pets count still shows 254, should be 111

---

## Previous Status (2026-04-11) — Volume-Based Pricing, PNG Thumbnails, Load Design & Nav Fixes

### ✅ Volume-Based Pricing with Thickness (computeQuantity)

**Critical discovery:** The legacy 3D system (`createJS/Quote.js:1476-1486`) overrides `quantityType` to `"Area"` for ALL products in 3D mode except IDs 4, 5, 30, 34. `"Area"` pricing uses `MODEL_STONE_VOLUME_CUBIC_METERS` (actual 3D mesh volume) × material m³ price × retail multiplier. This is fundamentally different from the XML formula-based pricing.

Since we don't have m³ material pricing data, we adapted by including `depth` (thickness) in the formula-based quantity calculation:

- **Created `computeQuantity()`** — shared helper in `lib/xml-parser.ts` (replaces duplicated switch logic across 7 files)
- **`"Width + Height"`** formula changed: `width + height` → `width + height + depth` (headstone thickness now affects price)
- **`"Width"`** formula unchanged: `width + depth` (base thickness already affected price)
- **Default fallback**: `width + height + depth`

```typescript
// lib/xml-parser.ts
export function computeQuantity(
  priceModel: PriceModel,
  dims: { width: number; height: number; depth: number },
): number {
  switch (priceModel.quantityType) {
    case 'Width * Height':  return dims.width * dims.height;
    case 'Width + Height':  return dims.width + dims.height + dims.depth;
    case 'Width':           return dims.width + dims.depth;
    case 'Area':            return dims.width * dims.height;
    default:                return dims.width + dims.height + dims.depth;
  }
}
```

**Files updated to use `computeQuantity()`:**
- `components/ThreeScene.tsx` — bottom price chip
- `components/CheckPricePanel.tsx` — price popup
- `components/DesignerNav.tsx` — sidebar price
- `components/MobileHeader.tsx` — mobile header price
- `components/DesignsTreeNav.tsx` — tree nav price
- `app/check-price/_ui/CheckPriceGrid.tsx` — /check-price page
- `app/select-size/(checkout)/checkout/page.tsx` — checkout

### ✅ Thickness Dimensions in Pricing UI

All pricing displays now show **W × H × D** (width × height × depth/thickness) instead of just W × H:

- **CheckPricePanel** (popup) — headstone row changed from `formatDimensionPair` to `formatDimensionTriplet`
- **CheckPriceGrid** (/check-price page) — headstone and base rows show `{widthMm}mm × {heightMm}mm × {uprightThickness}mm`
- **Bug fix**: CheckPricePanel headstone row was incorrectly showing `ledgerMaterialUrl` instead of `headstoneMaterialUrl`

### ✅ PNG Thumbnails for Load Design Popup

- **Generated 3,041 `_small.png` thumbnails** (56.7 MB total, ~19KB avg) from full-size transparent PNGs using `scripts/generate-png-thumbnails.js` (Sharp, 300px wide, preserves transparency, concurrency=8)
- **Load Design popup** now uses `_small.png` (was `_small.jpg`) with `bg-[#cccccc]` backgrounds (was `bg-black`)
- **Removed `opacity-80`** from thumbnails — only hover zoom animation remains
- **"Open Design" chip** styled with `border-2 border-[#d4af37] bg-black`

### ✅ Popular Category: Grid Layout & Auto-Expand

The "Popular" (favorites) drawer in the Load Design popup now uses the **same thumbnail grid layout** as all other categories (2-3 column responsive grid with aspect-4/3 cards, hover zoom, "Open Design" button, localhost tools). Previously it used a flat list with small inline thumbnails.

**Auto-expand:** Popular is now toggled open by default whenever it has designs (via `useEffect` on `favoriteDesigns.length`).

### ✅ Navigation Bounce Fix

Fixed a visual glitch when clicking panel items (e.g., "Select Size") from non-canvas routes (e.g., `/select-product`). The panel would briefly flash open, bounce back to the main nav, then re-open after ~1 second.

**Root cause:** `handleMenuClick` called `openFullscreenPanel()` immediately, but the route-sync `useEffect` saw the old non-canvas route, cleared the panel (`setActiveFullscreenPanel(null)`), then re-opened it once navigation settled.

**Fix:** When navigating to a different route, only call `router.push()` — let the route-sync effect open the panel once the route settles on a canvas-visible page.

### ✅ Vercel Build Size Fix

Added `'public/screenshots/**/*'` to `outputFileTracingExcludes` in `next.config.ts`. The `public/screenshots/` directory (~245 MB) was being bundled into the serverless function, exceeding Vercel's 300 MB limit.

### 📌 Next Steps

1. **Add 6 new failures to KNOWN_FAILURES** — `1662337522025`, `1667480366612`, `1670405007473`, `1673437084641`, `1675259335154`, `1752619990342`
2. **Fix plaque inscription positioning** — Design 1636593295668 inscriptions start above plaque top
3. **Batch re-anonymize designs** — 18k designs potentially affected by sanitizer regex bug
4. **Visual QA pass** — Compare designs with original screenshots
5. **Update PRODUCT_STATS** — Pets count still shows 254, should be 111

---

## Previous Status (2026-04-11) — Batch Screenshot Generation Complete & Thumbnail Fix

### ✅ Batch Screenshot Generation Complete (3,041/3,092)

All screenshot generation is now finished. The batch ran for ~15 hours overnight, capturing the remaining ~1,200 designs.

#### Final Results
| Metric | Value |
|--------|-------|
| **Total PNGs on disk** | **3,041** |
| **JPG thumbnails** | **3,040** |
| **New this session** | **+1,208** |
| **Skipped (existing)** | 1,878 |
| **Known failures (blocklisted)** | 47 designs |
| **New failures** | 6 designs |
| **Remaining (no JSON)** | 22 designs |
| **Capture rate** | ~2/min (~120/hour) with concurrency=1 |
| **Total runtime** | ~15 hours |

#### New Failures (Headstone Not Visible)
6 additional designs failed with "Headstone not visible in render" — likely missing viewport dimensions in their JSON:
- `1662337522025`, `1667480366612`, `1670405007473`, `1673437084641`, `1675259335154`, `1752619990342`

These should be added to the `KNOWN_FAILURES` set in `scripts/batch-screenshot.js`.

### ✅ Load Design Popup: 3D Thumbnails for All Designs

Removed the hardcoded `V2026_3D_IDS` Set (~221 IDs) from `LoadDesignButton.tsx`. This set was created during the first batch run and never updated — causing ~2,800 designs to still show old legacy screenshots even though 3D screenshots existed.

#### Before
```typescript
// Hardcoded set of 221 design IDs — all other designs used legacy thumbnails
const V2026_3D_IDS = new Set(['1578016189116', '1593953642523', ...]);
function getPopupPreviewSrc(designId, preview) {
  if (V2026_3D_IDS.has(designId)) return `/screenshots/v2026-3d/${designId}_small.jpg`;
  return preview.replace(/\.(jpg|jpeg|png)$/i, '_small.jpg'); // legacy fallback
}
```

#### After
```typescript
// Always try 3D screenshot first — onError fallback handles the ~50 missing ones
function getPopupPreviewSrc(designId, preview) {
  return `/screenshots/v2026-3d/${designId}_small.png`;
}
```

The `onError` fallback chain on both `<img>` elements (Popular grid + category grid) gracefully handles the ~50 designs without 3D screenshots:
1. Try `/screenshots/v2026-3d/{id}_small.png` (3D transparent PNG)
2. Try legacy `_small.jpg` path (ML screenshot)
3. Try full-size legacy preview
4. Hide image element

#### Files Changed
- `components/LoadDesignButton.tsx` — Removed `V2026_3D_IDS` set, simplified `getPopupPreviewSrc()` to always use 3D path, updated both `onError` handlers to remove `V2026_3D_IDS` guard

### 📌 Next Steps

1. **Add 6 new failures to KNOWN_FAILURES** — `1662337522025`, `1667480366612`, `1670405007473`, `1673437084641`, `1675259335154`, `1752619990342`
2. **Fix plaque inscription positioning** — Design 1636593295668 inscriptions start above plaque top
3. **Batch re-anonymize designs** — 18k designs potentially affected by sanitizer regex bug
4. **Visual QA pass** — Compare designs with original screenshots
5. **Update PRODUCT_STATS** — Pets count still shows 254, should be 111

---

## Previous Status (2026-04-10) — Batch Screenshot Generation Progress & Script Hardening

### 🔄 Batch Screenshot Generation (In Progress — 1,827/3,092)

Continued batch screenshot generation for all 3,092 designs with canonical JSON. Major stability improvements to the script after repeated browser crashes.

#### Progress Summary
| Metric | Value |
|--------|-------|
| **Total PNGs on disk** | **1,827** (was 641 at session start) |
| **New this session** | **+1,186** |
| **JPG thumbnails** | 1,826 |
| **Known failures** | 41 designs (blocklisted) |
| **Remaining** | ~1,265 designs |
| **Capture rate** | ~2/min (~120/hour) with concurrency=1 |

#### Script Improvements (`scripts/batch-screenshot.js`)

1. **Chunked browser relaunch** — Instead of one long-lived browser, the script now launches a fresh Chromium every 200 designs. Prevents OOM crashes from accumulated WebGL/SwiftShader memory.

2. **Known-failures blocklist** — `KNOWN_FAILURES` Set (41 IDs) skips designs that permanently fail. Two failure types:
   - "Headstone not visible" — missing viewport/init dimensions in JSON (older 2020-2022 designs)
   - "Canvas timeout" — page never renders the WebGL canvas

3. **Context refresh after failures** — Browser context is recreated after any failed design to prevent corruption propagating to subsequent captures.

4. **Incremental error saving** — `_errors.json` is written after each failure so crash doesn't lose error data.

5. **Chromium stability flags** — Added `--disable-dev-shm-usage`, `--no-sandbox`, `--disable-setuid-sandbox`, `--disable-extensions`, `--disable-background-networking`.

6. **maxRetries=0** — No retries (was 2). Each failure costs ~20s instead of ~2min. Known-failing designs are blocklisted instead.

#### How to Resume
```bash
# Start dev server (must use Turbopack to avoid middleware EvalError)
npx next dev --turbopack --port 3001

# Run batch (skips existing PNGs + blocklisted designs)
node scripts/batch-screenshot.js --skip-existing --concurrency=1
```

#### Files Changed
- `scripts/batch-screenshot.js` — Chunked browser relaunch, KNOWN_FAILURES blocklist (41 IDs), context refresh after failures, incremental error saving, stability flags, maxRetries=0

### 📌 Next Steps

1. **Complete screenshot generation** — ~1,265 designs remaining (~10.5 hours at current rate)
2. **Review `_errors.json`** — Add any new failures to KNOWN_FAILURES blocklist
3. **Fix plaque inscription positioning** — Design 1636593295668 inscriptions start above plaque top
4. **Batch re-anonymize designs** — 18k designs potentially affected by sanitizer regex bug
5. **Visual QA pass** — Compare designs with original screenshots
6. **Update PRODUCT_STATS** — Pets count still shows 254, should be 111

---

## Previous Status (2026-04-09) — Popup Restyling, Mass Design Conversion & Screenshot Generation

### ✅ Check Price Popup Restyled (Dark Luxury Theme)

The Check Price popup (`components/CheckPricePanel.tsx`) was restyled to match the HomeSplash modal aesthetic from the home page.

#### Changes
- **Outer shell**: `rounded-3xl` container with `border-[#d4af37]/35` gold border and gold gradient glow overlay (`bg-gradient-to-b from-[#d4af37]/18 via-[#d4af37]/6 to-transparent`)
- **Eyebrow pill badge**: "Price Breakdown" pill with `border-[#d4af37]/45 bg-[#d4af37]/10 text-[#f3d48f]`
- **Native dark classes**: Replaced all CSS override hacks (`.check-price-panel__table .text-gray-900 { color: #f5eee1 !important; }`) with native Tailwind dark-theme classes throughout
- **Gold-accented expand/collapse buttons**: Matching HomeSplash close button style (`rounded-full border border-white/25 bg-black/25`)
- **Serif title**: "Your Design Pricing" in `font-serif` matching HomeSplash pattern

#### Files Changed
- `components/CheckPricePanel.tsx` — Complete restyle of header, table headers, all row sections, footer; removed all CSS override hacks

### ✅ Load Design Popup Restyled (Dark Luxury Theme)

The Load Design popup (`components/LoadDesignButton.tsx`) was restyled with the same HomeSplash modal aesthetic.

#### Changes
- **Outer container**: `rounded-3xl` with gold border, gold gradient glow overlay
- **Eyebrow pill badge**: "Design Gallery" pill badge
- **Search bar**: Gold-accented focus ring (`focus:ring-[#d4af37]/50 focus:border-[#d4af37]/50`)
- **ML filter buttons**: Gold-themed active state styling
- **Category sections**: `rounded-2xl` containers with `bg-white/[0.03]` subtle backgrounds
- **Card grid**: Gold star icons for favorites, gold "Open Design" hover button
- **Close button**: Matching HomeSplash style

#### Files Changed
- `components/LoadDesignButton.tsx` — Complete restyle of outer container, header, search bar, ML filters, favorites drawer, category sections, card grid, and action buttons

### ✅ Mass Legacy Design Conversion (22,226 Designs)

Batch-converted all legacy designs from three `ml/` source directories to canonical JSON format.

#### Before
- **3,114** designs in catalog (`lib/saved-designs-data.ts`)
- **223** had canonical JSON (from prior P3D conversions)
- **2,891** missing — no screenshots possible

#### Conversion Run
```bash
node scripts/batch-convert-saved-designs.js --out-dir public/designs/v2026
```

#### Source Breakdown
| mlDir | JSON source files | In catalog |
|-------|------------------|------------|
| `forevershining/` | 12,487 | 1,426 |
| `headstonesdesigner/` | 7,529 | 1,224 |
| `bronze-plaque/` | 2,814 | 241 |
| **Total** | **22,830** | **2,891** |

#### Results
- **22,226 converted** (0 failures), all high confidence
- **3,092 of 3,114** catalog designs now have canonical JSON (was 223)
- **22 remaining** — no source files in any mlDir
- Output: `public/designs/v2026/{id}.json`
- Report: `database-exports/conversion-report-*.json`

#### Files Used (not modified)
- `scripts/batch-convert-saved-designs.js` — Handles all three mlDirs (forevershining, headstonesdesigner, bronze-plaque)

### ✅ Batch Screenshot Generation (Initial Runs — see 2026-04-10 for latest)

Regenerating 3D screenshots for all 3,092 designs with canonical JSON.

#### First Run (223 original designs)
```bash
node scripts/batch-screenshot.js
```
- **221/223 success**, 2 failures (designs 1636037970908 and 1726182269646 — "Headstone not visible")
- Runtime: ~113 min (~30s per design)

#### Second Run (all 3,092 designs, skip existing)
```bash
node scripts/batch-screenshot.js --skip-existing
```
- Completed 616/3,092 before stalling — continued in 2026-04-10 session
- Rate: ~90 designs/hour
- ⚠️ Process hung on problematic designs — fixed in 2026-04-10 with chunked browser relaunch + blocklist
- Dev server (`npx next dev --turbopack --port 3001`) needs restart if it crashes under load

### 📌 Next Steps

1. **Complete screenshot generation** — ~2,476 designs remaining
2. **Fix plaque inscription positioning** — Design 1636593295668 inscriptions start above plaque top
3. **Batch re-anonymize designs** — 18k designs potentially affected by sanitizer regex bug
4. **Visual QA pass** — Compare designs with original screenshots
5. **Update PRODUCT_STATS** — Pets count still shows 254, should be 111

---

## Current Status (2026-04-08) — Base Inscription/Motif Rendering, Border Sizing, Anonymization Fix, Load Design Filtering, VitePress Docs

### ✅ Base Inscription Rendering (Full Monuments)

Base inscriptions (e.g., "CICERO" on the pedestal base of a full monument) were completely invisible in loaded designs. This was a deep multi-layered bug:

#### Root Cause Chain
1. **`INSCRIPTION_SIZE_SCALE = 0.85` was declared but NEVER applied** — font sizes in loaded designs were 15% too large
2. **Base mesh `unitsPerMeter = 1000`** was wrong — base is a unit cube scaled in meters, changed to `unitsPerMeter = 1`
3. **`useEffect` for `surfaceBounds` was perpetually cancelled** — 19 headstone inscriptions each call `updateLineStore`, causing re-renders that cancel the base inscription's useEffect before it can compute bounds
4. **`baseMesh.position` is `(0,0,0)` at React render time** — `HeadstoneBaseAuto` sets position via `useFrame` (not React state), so the inscription group was placed at the origin

#### Solution
- **useFrame hook** in `HeadstoneInscription.tsx` (~line 517): imperatively tracks base mesh `position` and `scale` every frame, matching `HeadstoneBaseAuto`'s own pattern. Bypasses React rendering entirely.
- **Visibility guard**: `visible={coordinateSpace !== 'mm-center' || !!surfaceBounds || (isBaseSurface && !!baseMesh)}`
- **mm-center branch**: dedicated coordinate handling for base surface inscriptions (unit-cube local coords → assembly meters)

#### Files Changed
- `components/HeadstoneInscription.tsx` — useFrame position tracking, visibility guard, base mm-center branch
- `components/three/headstone/HeadstoneBaseAuto.tsx` — `baseAPI.unitsPerMeter = 1` (was 1000)
- `lib/saved-design-loader-utils.ts` — Applied `INSCRIPTION_SIZE_SCALE` to font sizes

### ✅ Base Motif Rendering & Drag (Full Monuments)

Base motifs now render correctly and can be dragged on the base surface.

#### Fixes
- **mm-center groupPosition branch** in `MotifModel.tsx` (~lines 607-614): reads `stone.position` directly for base surface placement
- **Drag handler** in `MotifModel.tsx` (~lines 247-275): converts unit-cube local coords to mm offsets for base surface
- **Inscription drag handler** in `HeadstoneInscription.tsx` (~lines 289-357): base-specific unit-cube → assembly-meters conversion

### ✅ Bronze Plaque Border Sizing

Border ornaments on bronze plaques were too small compared to legacy original designs.

#### Root Cause
The `buildBorderGroup()` function in `BronzeBorder.tsx` had two issues:
1. **`uniformScale *= 2.5`** — initial SVG scale was too small, border stayed undersized
2. **Coverage targets too low** — `minTargetCoverage = 0.78`, `maxTargetCoverage = 0.90` capped the border at 78-90% of plaque area. Original legacy borders filled ~97%+ of the plaque

#### Fix
- `uniformScale` multiplier: `2.5` → `5.0`
- `minTargetCoverage`: `0.78` → `0.97`
- `maxTargetCoverage`: `0.90` → `0.99`

For a 306×200mm plaque, border ornaments now cover 97% of the plaque area (was 78%), placing decorative elements right near the edges like the original.

#### Files Changed
- `components/three/BronzeBorder.tsx` — Coverage targets and scale multiplier

### ✅ Anonymization Sanitizer Fixes

Design 1635118332028 showed real names ("Margaret Edith SEATON", "nee (DICKINS)") — the sanitizer had three bugs:

#### Bug 1: Substring Matching in Sentence Regex
The `sentenceRegex` used `/(are|or|is|be|me|...)/i` WITHOUT word boundaries (`\b`). This matched substrings inside names:
- "M**are**garet" → matched `are` → classified as "sentence" → skipped anonymization
- "Vict**or**ia", "Rob**ert**" (contains `be`), "Ja**me**s" (contains `me`), etc.

**Fix:** Added `\b` word boundaries: `/\b(the|you|me|...)\b/i`

#### Bug 2: Parentheses Not Stripped
`upperWords` cleanup regex `['".,!?]` didn't include `()`. So `"(DICKINS)"` was never matched against the surname database.

**Fix:** Extended regex to `['".,!?()]`

#### Bug 3: "nee (SURNAME)" Pattern Not Handled
The maiden name pattern "nee (DICKINS)" or "née SURNAME" was never explicitly handled.

**Fix:** Added dedicated handler before word-level analysis:
```javascript
const neeMatch = text.match(/\b(?:nee|née)\s*\(?([A-Za-z'-]+)\)?/i);
```

#### Impact Assessment
Full scan of 23,086 designs found 18,090 potentially affected by the regex bug. Many are already-anonymized replacement names being re-matched (harmless), but some contain real names that slipped through.

#### Files Changed
- `scripts/utils/inscription-sanitizer.js` — All three fixes + nee handler
- `public/designs/v2026-rollout-full-20260324-190828/1635118332028.json` — Re-anonymized

### ✅ Load Design Popup: Product Filtering

The Load Design popup now filters designs by the **current product ID** (not just broad product type). Previously selecting "Traditional Engraved Headstone" still showed "Laser Etched Black Granite" designs.

#### Implementation
- `getProductTypeFromId()` in `LoadDesignButton.tsx` maps product IDs to their exact product type
- Each design in `SAVED_DESIGNS` has a `productId` that is matched against the currently selected product
- Fallback: if no product is selected, all designs are shown

### ✅ VitePress Documentation

Created structured project documentation in `/docs/` with VitePress static site generator.

#### Documentation Pages
| Page | Contents |
|------|----------|
| `docs/index.md` | Overview & quick start |
| `docs/architecture.md` | Tech stack, directory structure, data flow |
| `docs/routes.md` | App Router structure, all routes |
| `docs/three-scene.md` | 3D scene graph, lighting, camera |
| `docs/components.md` | React component inventory |
| `docs/state-management.md` | Zustand store architecture |
| `docs/database-schema.md` | Drizzle ORM schema |
| `docs/configuration.md` | Config files, env vars |
| `docs/scripts.md` | Build & utility scripts |
| `docs/api-store.md` | Store API reference |
| `docs/api-utilities.md` | Utility functions reference |
| `docs/api-three.md` | Three.js components reference |
| `docs/api-auth-db.md` | Auth & DB API reference |
| `docs/api-hooks-constants.md` | Hooks & constants reference |

#### Commands
```bash
pnpm docs:dev    # Dev server with hot reload
pnpm docs:build  # Static HTML build (14 pages)
```

VitePress configured with `base: './'` for `file://` protocol browsing.

### ✅ Type Error Fixes

Reduced pre-existing TypeScript errors from 28 to 13 across 7 files:
- `app/designs/DesignsPageClient.tsx` — Fixed `useRef` for React 19
- `lib/headstone-store.types.ts` — Added `'absolute'` to emblem coordinateSpace union
- `lib/headstone-store.ts` — Removed 3 duplicate properties
- `components/three/Scene.tsx` — Fixed window cast
- `lib/project-schemas.ts` — Added coordinate space values to unions

Remaining 13 errors are config-level (`downlevelIteration` tsconfig issues).

### 📌 Next Steps

1. **Fix plaque inscription positioning** — Design 1636593295668 inscriptions start above plaque top (math analysis shows positions SHOULD be correct; likely useEffect timing or geometry bounds issue)
2. **Batch re-anonymize designs** — 18k designs potentially affected by sanitizer regex bug. Need user approval before bulk re-run.
3. **Visual QA pass** — Continue comparing designs with original screenshots
4. ~~**Batch-convert remaining ~2,891 designs**~~ — ✅ Done (2026-04-09): 22,226 converted, 3,092/3,114 now have canonical JSON
5. **Update PRODUCT_STATS** — Pets count still shows 254, should be 111

---

## Current Status (2026-04-06) — 3D Screenshot Thumbnails, Design Dedup Siblings, Transparent PNGs, Image Placeholder Fix

### ✅ 3D Screenshots Wired into Load Design Popup

The Load Design popup now uses `public/screenshots/v2026-3d/` 3D screenshots as thumbnail images, with proper fallback to legacy ML screenshots.

#### Thumbnail Source Priority
```typescript
// getPopupPreviewSrc(id: string) in LoadDesignButton.tsx
// Always tries 3D screenshot first — onError fallback handles missing ones
1. v2026-3d screenshot (always tried first)  →  /screenshots/v2026-3d/{id}_small.jpg
2. Legacy ML screenshot (onError fallback)   →  /ml/{mlDir}/saved-designs/screenshots/*/{id}_small.jpg
3. Full-size legacy preview (final fallback) →  original preview URL
```

As of 2026-04-11, 3,040 designs have `_small.jpg` thumbnails in `v2026-3d/`. The ~50 designs without 3D screenshots gracefully fall back to legacy previews via the `onError` chain. The original hardcoded `V2026_3D_IDS` Set (222 IDs from April 6) was removed — no longer needed since nearly all designs now have 3D screenshots.

#### Files Changed
- `components/LoadDesignButton.tsx` — `getPopupPreviewSrc()` always returns 3D path, both `<img>` onError handlers fall back through legacy paths

### ✅ Design Dedup: Sibling Detection (148 New Duplicates)

The dedup script (`scripts/dedup-designs.ts`) previously only detected "drafts that grew richer" (older → newer with more content). It missed **reverse evolution** — families simplifying designs over time.

#### New Sibling Detection Pass (Step 1b)
For pairs in the same `shapeName + mlDir` group with ≥70% **bidirectional** word overlap in inscriptions:
- Keeps the **richest** design (highest richness score)
- Hides all others as siblings
- Bidirectional: both `wordsA⊂B ≥ 70%` AND `wordsB⊂A ≥ 70%`

**Results:** 148 new sibling duplicates found. `data/hidden-designs.json` grew from 657 → 793 entries.

#### Example (LOCI Family)
- `1708723212727` — **kept** (richest: 4 inscriptions + 2 motifs)
- `1712843604404` — hidden (3 inscriptions + 2 motifs, sibling)
- `1708790342849` — hidden (2 inscriptions + 2 motifs, sibling)

#### Files Changed
- `scripts/dedup-designs.ts` — Added sibling detection pass (~lines 163-200)
- `data/hidden-designs.json` — Updated (657 → 793 entries)

### ✅ Batch Screenshot Overhaul: Transparent PNGs, Environment Strip, Auto-Crop

The batch screenshot script was completely reworked to produce clean, tightly-cropped monument-only images.

#### Environment Strip
Before capture, the script accesses the Three.js scene via `window.__r3fScene` (exposed by `Scene.tsx`) and hides all environment objects:

| Object | Detection Method |
|--------|-----------------|
| GrassFloor / SimpleGrassFloor | PlaneGeometry with width or height ≥ 10 |
| GradientBackground sky dome | SphereGeometry + BackSide (side === 1) |
| AtmosphericSky dome | SphereGeometry + BackSide |
| SunRays | ShaderMaterial with `uInnerColor` or `colorTop` uniforms |
| ContactShadows | Group containing OrthographicCamera child |
| Sparkles | Points objects |
| SelectionBox outlines | LineSegments objects |
| Clouds (drei) | Group containing Sprite or InstancedMesh children |
| Fog | `scene.fog = null` |

#### Transparent Background
- `scene.background = null` + `gl.setClearColor(0x000000, 0)` → fully transparent WebGL canvas
- Auto-crop uses **alpha channel** detection (`alpha > 10` threshold) instead of color matching
- Full-size PNG saved with RGBA transparency (color type 6)
- JPEG thumbnails get `#1a1a1a` dark background fill (JPEG has no transparency)

#### Auto-Crop Pipeline
1. `gl.readPixels()` — Read all pixels from WebGL canvas (bottom-to-top, Y-flipped)
2. Alpha-threshold scan — Find tight bounding box of non-transparent pixels
3. Add 4% padding (minimum 8px) on each side
4. Draw cropped region to offscreen 2D canvas → export as base64 PNG + JPEG
5. Save both files; fallback to uncropped Playwright screenshot if crop fails

#### Scene.tsx Exposure
`Scene.tsx` now exposes `window.__r3fScene` and `window.__r3fGL` via useEffect for external tooling (batch screenshots, debugging).

#### Results (April 6, 2026 → Completed April 11, 2026)
- **Initial:** 222 transparent PNGs + 222 JPEG thumbnails
- **Final (April 11):** **3,041 transparent PNGs** + **3,040 JPEG thumbnails** in `public/screenshots/v2026-3d/`
- Tightly cropped to monument bounds (typical: 350-800px wide × 500-960px tall)
- No grass, sky, fog, sun rays, selection outlines, or sparkles
- Total runtime: ~15 hours for ~1,208 new captures + ~5 hours for earlier batches

#### Files Changed
- `scripts/batch-screenshot.js` — Environment strip, transparent background, alpha-based auto-crop, configurable BASE_URL (default port 3001)
- `components/three/Scene.tsx` — Added `window.__r3fScene` / `window.__r3fGL` exposure (~line 165-172)

### ✅ Vitreous Enamel Image Placeholder: JPG → PNG

The photo placeholder image was migrated from `.jpg` to `.png` across the entire codebase.

#### Code References Fixed
| File | Change |
|------|--------|
| `components/three/ImageModel.tsx` | `vitreous-enamel-image.jpg` → `.png` |
| `components/HeroCanvas.tsx` | `vitreous-enamel-image.jpg` → `.png` |
| `lib/saved-design-loader-utils.ts` | Fallback URL + motif asset remap (`.jpg` → `.png`) |
| `scripts/convert-p3d-design.js` | Converter output uses `.png` |

#### Design JSON Batch Fix
421 P3D design JSON files in `public/designs/v2026-p3d/` had `vitreous-enamel-image.jpg` baked into the `asset` field. All were batch-updated to `.png`.

#### Loader Safety Net
`saved-design-loader-utils.ts` line 2005: motif assets with `assetType: "photo-placeholder"` now apply `.replace('vitreous-enamel-image.jpg', 'vitreous-enamel-image.png')` — catches any remaining old JSONs that weren't batch-fixed.

### 📌 Next Steps

1. **Update PRODUCT_STATS** — Pets count still shows 254 in `saved-designs-data.ts`, should be 111
2. **Batch-convert remaining ~2,891 designs** — Only 223 have canonical JSON; the rest need conversion before screenshotting
3. **Photo anonymization** — Stock photos from original designs remain as-is (not yet handled)
4. **Visual QA pass** — Compare more designs side-by-side with original screenshots
5. **Category sidebar navigation** — Deferred from UX review; prevents "accordion jump" when browsing many folders
6. ~~**Update V2026_3D_IDS set**~~ — ✅ Done (2026-04-11): Removed hardcoded set entirely; all designs now try 3D screenshots first with legacy fallback

---

## Current Status (2026-04-04) — Load Design Category-First Redesign, Pets Cleanup, Batch 3D Screenshot Generator

### ✅ Load Design Popup: Category-First Redesign

The Load Design modal was **completely rewritten** from product-first grouping to category-first grouping with a polished thumbnail grid.

#### Architecture Change
- **Before:** `PickerTree` — Product → Category → Design (list rows with 64px thumbnails)
- **After:** `CategoryTree` — Category → Design (visual grid cards, no product nesting)

```typescript
// New CategoryTree structure (replaces PickerTree)
{
  [categorySlug]: {
    categoryLabel: string;
    designs: Array<{ id, displayTitle, metadata }>;
  }
}
```

`buildCategoryTree()` groups all designs by category regardless of product type. `CATEGORY_ORDER` array controls curated sort priority (Pets first, then family categories, themes, religious).

#### Visual Grid Cards
- **Layout:** `grid-cols-2 gap-3 sm:grid-cols-3` — 2 columns on mobile, 3 on desktop
- **Thumbnails:** `aspect-[4/3]` container, `object-contain` on black background — all designs uniform
- **Opacity:** 80% idle → 100% on hover with scale `1.03` transition
- **Metadata:** Date derived from 13-digit timestamp ID instead of repeating category name

#### Hover UX
- Centered **"Open Design"** button appears on hover with semi-transparent backdrop
- ⭐ Favorite and ↗ Open-in-new-tab icons in top-right (localhost only)
- 🗑️ Trash icon isolated at bottom-left to prevent accidental deletion

#### Files Changed
- `components/LoadDesignButton.tsx` — Complete rewrite (~578 lines)

### ✅ Pets Category Cleanup (254 → 111 Designs)

The Pets product category contained many human memorials that were miscategorized.

#### Audit Script (`scripts/audit-pets-category.js`)
Created a text-based classifier using:
- **Name detection**: Common first/last name databases
- **Lifespan analysis**: Short lifespans typical for pets vs human lifespans
- **Keyword matching**: Pet-specific ("paw", "furry friend") vs human-specific ("wife", "mother") keywords
- **Inscription structure**: Memorial phrase patterns

#### Results
- **140 automatic reclassifications** — Designs with human relationship words, human-length lifespans, or no pet indicators
- **4 manual reclassifications** — Confirmed by visual inspection (1659117755289, 1744068681242, 1727308984905, 1668799359538)
- **1 pet found in other categories** — Winston (`1741675923334`) moved to Pets
- **Final count: 111 genuine pet designs** (down from 254)

#### Files Changed
- `lib/saved-designs-data.ts` — 145 design entries reclassified
- `scripts/audit-pets-category.js` — Audit/reclassification script (created)

### ✅ Batch 3D Screenshot Generator (3,041/3,092 — Complete as of April 11)

> **Note:** This section describes the initial implementation. See **Current Status (2026-04-06)** for the overhaul (transparent PNGs, environment strip, auto-crop) and **Current Status (2026-04-11)** for final completion results.

Playwright-based automation that loads each design into the 3D editor, anonymizes inscriptions via route interception, hides UI chrome, and captures a clean canvas screenshot.

#### Pipeline Overview
1. **Chromium with SwiftShader** (`--use-angle=swiftshader`) for headless WebGL
2. **Route interception**: `page.route()` intercepts design JSON fetches, applies `sanitizeInscription()` before fulfilling
3. **Load design** via `window.__loadDesignById(id)` (dev-only bridge)
4. **Wait for render**: `store.loading === false` (30s hard gate) → `store.baseSwapping === false` (8s soft gate, force-clear if stuck) → 1500ms settle
5. **Deselect all items**: Clears selection outlines before capture
6. **Visibility check**: WebGL pixel sampling at 3 center points — skips sky-only renders
7. **DOM tree walk**: Hides all non-canvas elements (product title, price pill, nav arrows, buttons)
8. **`canvas.screenshot()`** — Playwright's native screenshot (NOT `canvas.toDataURL()` — troika-three-text fonts aren't in framebuffer)

#### Anonymization
- `scripts/utils/inscription-sanitizer.js` — Gender-aware name replacement
- Name databases: `public/json/firstnames_f_small.json`, `firstnames_m_small.json`, `surnames_small.json`
- Deterministic replacement via hash of original text
- Preserves memorial phrases, dates, and structure
- **2026-04-08 Fixes:**
  - Added `\b` word boundaries to sentence-detection regex (was matching "are" inside "Margaret", "be" inside "Robert", etc.)
  - Added `()` to word cleanup regex so `"(DICKINS)"` is matched in surname database
  - Added "nee (SURNAME)" / "née SURNAME" dedicated pattern handler
  - Impact: ~18k of 23k designs potentially affected by the original regex bug

#### Known Issues & Workarounds
- **baseSwapping stuck**: `enforceTexture()` sets `baseSwapping: true`; if `PreloadTexture.onReady` never fires, stays true forever. Script force-clears after 8s.
- **Sky-only renders**: Some P3D designs have `coordinateSpace: "headstone-center-mm"` → missing viewport dims → elements scaled to ~0.7px. Only 2 affected: `1636037970908` (failed), `1752608698736` (removed).
- **`canvas.toDataURL()` DOES NOT WORK**: troika-three-text loads fonts async — text not in framebuffer when `toDataURL()` is called. Always use Playwright `canvas.screenshot()`.

#### Results (Final — April 11, 2026)
- **3,041 transparent PNGs** + **3,040 JPEG thumbnails** in `public/screenshots/v2026-3d/`
- **53 failures** total: 47 original blocklisted + 6 new (all "headstone not visible" — missing viewport dims)
- **22 designs** have no canonical JSON at all (no source files in any mlDir)
- Error report: `public/screenshots/v2026-3d/_errors.json`

#### Dev-Only Bridges Added
- `window.__loadDesignById` in `components/DefaultDesignLoader.tsx` (line ~50)
- `window.__headstoneStore` in `lib/headstone-store.ts` (line ~1940)
- Both guarded by `isDevEnvironment` check — not exposed in production

#### Files Created
- `scripts/batch-screenshot.js` — Main batch generator (~548 lines)
- `scripts/utils/inscription-sanitizer.js` — Name anonymizer
- `public/screenshots/v2026-3d/*.png` — 221 anonymized screenshots

#### Files Modified
- `components/DefaultDesignLoader.tsx` — Added `window.__loadDesignById`
- `lib/headstone-store.ts` — Added `window.__headstoneStore`
- `package.json` — Added `playwright@1.59.1` and `@playwright/test@1.59.1` as devDependencies

### ⚠️ Dev Server: Turbopack Required

**`pnpm dev` (webpack) causes `EvalError` in Edge Runtime middleware.** Webpack uses `eval()` at line 348 of compiled middleware.js — disallowed in Edge Runtime.

**Fix:** Always use Turbopack for local development:
```bash
npx next dev --turbopack
```

The `turbopack: { root: process.cwd() }` config already exists in `next.config.ts`. Turbopack compiles middleware without `eval()` and works correctly.

### 📌 Next Steps (Completed in April 6 session — see above)

1. ~~**Wire 3D screenshots into Load Design popup**~~ ✅ Done — V2026_3D_IDS set + fallback chain
2. **Update PRODUCT_STATS** — Pets count still shows 254 in `saved-designs-data.ts`, should be 111
3. **Batch-convert remaining ~2,891 designs** — Only 223 have canonical JSON; the rest need conversion before screenshotting
4. **Photo anonymization** — Stock photos from original designs remain as-is (not yet handled)
5. **Visual QA pass** — Compare more designs side-by-side with original screenshots
6. **Category sidebar navigation** — Deferred from UX review; prevents "accordion jump" when browsing many folders

---

## Current Status (2026-04-03) — P3D Motif/Inscription Positioning, Bronze Plaque Fixes, Load Design Popup & Pet Categories

### ✅ P3D Converter: Universal Motif & Inscription Positioning (12 fixes)

All fixes are **universal mechanisms** applied to all 860 P3D designs, not design-specific tweaks.

#### Coordinate System Fixes
- **Forevershining P3D positions**: Negate BOTH X and Y (`p3dSign = -1`). The haxe 3D model faces the opposite direction; P3D regionPosition uses Y-DOWN + X-LEFT convention.
- **Forevershining companion JSON positions**: Negate Y only (`ySign = -1`). Companion JSON uses Y-DOWN (negative Y = upward) but X is already correct.
- **Headstonesdesigner**: No negation needed (Y-UP convention matches canonical).
- P3D positions exactly match companion JSON positions when both exist (verified: design 1595787261483, motif 2 at y=104.9 in both sources).

#### Auto-Layout Algorithm (for motifs with lost positions)
~80% of P3D headstone motifs have `(0,0)` positions — original layouts from the haxe renderer were never saved.

The converter handles these with a multi-stage layout:
1. **Memorial phrases** ("IN LOVING MEMORY", "REST IN PEACE" etc.) placed ABOVE the positioned reference inscription
2. **Names/dates** placed BELOW the reference inscription
3. **Deco zone** computed from lowest inscription Y position (init `Infinity`, not `0`)
4. **Zero-group motifs**: Flow layout in rows below text, size-capped to 10% headstone height / 35% width
5. **All motifs**: Universal size cap — no motif exceeds headstone dimensions

#### Embedded PNG Rendering
- **No oval mask**: P3D embedded-png and photo-placeholder motifs render with `maskShape: ''` (empty string) → no ceramic oval base, flat plane rendering
- **Photo placeholders**: Companion JSON `type='Photo'` recognized; uses `jpg/photos/vitreous-enamel-image.png` as placeholder (migrated from `.jpg` in April 2026)
- **Photo dimensions**: Uses companion JSON width/height when available (P3D stores oversized dimensions)

#### Anonymization Fix
- `sanitizeInscription()` regex for sentence detection (the, you, me, etc.) now uses `\b` word boundaries
- Prevents false matches like "the" in "HEATHER" or "or" in "DOROTHY"

#### Files Changed
- `scripts/convert-p3d-design.js` — P3D→canonical converter (12 fixes, see below)
- `lib/saved-design-loader-utils.ts` — Added `photo-placeholder` to image loading, `maskShape: ''` for all P3D images
- `public/designs/v2026-p3d/*.json` — All 860 designs re-converted

#### Batch Results
- **860/869** designs convert successfully (9 corrupted p3d files — unchanged)
- `pnpm build` passes ✅

### ✅ Bronze Plaque Position & Border Fix (Rollout Designs)

Bronze plaque designs (`mlDir: 'bronze-plaque'`) from the rollout conversion pipeline had two issues:

#### Problem: Positions Treated as Pixels Instead of Millimeters
The bronze-plaque companion JSON stores inscription/motif positions in **mm** (like forevershining), but the rollout converter (`batch-convert-saved-designs.js` / `convert-saved-design.js`) stored them as `x_px`/`y_px`. The loader then applied a px→mm conversion ratio, shrinking positions to ~1/3 of correct values.

**Fix:** When `mlDir === 'bronze-plaque'`, store positions as `x_mm`/`y_mm` with Y negation (companion uses Y-DOWN), and font sizes as `size_mm`. The loader's `convertPositionToMm()` returns `_mm` values directly (line 1621) — no scaling, no stage compensation.

Example: Design 1669305872595 (560×241mm plaque, 20 inscriptions)
- Before: y_px=-88 → converted to yMm=31.8 (wrong, clustered in center)
- After: y_mm=88 → used directly (correct, 88mm above center = near top)

#### Problem: Border Not Loading in Canonical Loader
`loadCanonicalDesignIntoEditor()` didn't extract border name from embedded legacy data. The legacy loader (`loadSavedDesignIntoEditor()`) did call `setBorderName()`, but the canonical path skipped it.

**Fix:** Added extraction of `legacyRawHeadstoneItem.border` in canonical loader → `store.setBorderName()`.

#### Files Changed
- `scripts/batch-convert-saved-designs.js` — Bronze-plaque `_mm` position/font handling
- `scripts/convert-saved-design.js` — Same changes in `buildInscription`/`buildMotif`
- `lib/saved-design-loader-utils.ts` — Border extraction from legacy raw data in canonical loader
- `public/designs/v2026-rollout-full-*/1669305872595.json` — Re-converted with correct `_mm` fields

### 📌 Next Steps

1. **Visual QA pass** — Compare more designs side-by-side with original screenshots
2. **Bronze plaque batch reconversion** — Run full batch for all 2,814 bronze-plaque designs with `_mm` fix
3. **Forevershining rollout designs** — May need same `_mm` fix (companion JSON also stores mm, not px)
4. **Border rendering at non-standard sizes** — Border SVG artwork needs manual design work for large/unusual plaque dimensions
5. **Lid/top motif rendering** — Positions in mm need proper conversion to ledger surface coordinates

---

## Current Status (2026-04-01) — P3D Converter, Inset Borders, Camera Fixes

### ✅ Inset Contour Border Lines

A **white/coloured inset contour line** that follows the headstone shape a few cm inside the edges, rendered with Three.js fat lines (`Line2` + `LineGeometry` + `LineMaterial`).

#### Implementation (`components/three/InsetContourLine.tsx`)
- Samples the headstone SVG path at `SAMPLE_COUNT = 200` points
- Offsets each point inward by `INSET_MM = 15` using vertex normals
- Trims bottom edge (below `BOTTOM_TRIM_Y`) and top region for certain shapes
- Renders as `Line2` with `linewidth: 2`, `worldUnits: true`, white default color
- Limited to first 11 traditional shapes (not slant/ogee/gothic etc.)

#### Store Integration
- `borderName: string | null` in Zustand store (via `setBorderName()`)
- Toggle in `ShapeSelector` panel — shows/hides border toggle for supported shapes
- Persisted in saved designs

### ✅ P3D Binary Format Converter

Decodes the proprietary `.p3d` file format (used by the legacy haxe 3D designer) and converts to canonical v2026 JSON.

#### P3D Format (`haxe/` directory heritage)
- **Header:** `FF FF 00 00` + `"WPF0"` (magic) + `00 00 FF FF` + `"PROJ"` + 10 metadata bytes = 26 bytes total
- **Payload:** zlib-compressed → 3 skip bytes + XML scene tree + binary section (embedded PNGs)
- **Variant:** 12 files use text-CSV encoding (byte values as comma-separated ASCII decimals)
- **Corrupted:** 9 files are undecompressable

#### XML Hierarchy
```
project > scenery > base > kerb > (lid-back > lid > elements[motifs])
                                 + (stand-back > stand > table[headstone] > inscriptions[motifs])
```

Each motif has:
- `<regionPosition x="" y="" rotation="">` — position in mm from surface center
- `<storageObject>` with model properties (width, height, depth, texture)
- `<displayObjectValue embed-pointer="">` — pointer to PNG in binary section
- `<extra type="json"><![CDATA[{"id":N,"src":"path/to/motif.svg"}]]></extra>` — links to companion JSON via `itemID`

#### Converter Script (`scripts/convert-p3d-design.js`)
- **Companion JSON cross-reference**: `itemID` in companion JSON (`ml/*/saved-designs/json/`) matches p3d `extraJson.id`
- **Inscriptions → editable text**: Extracts label, font_family, font_size (mm), color, position from companion JSON
- **Motifs → SVG refs**: Maps `companionMotif.src` (e.g., `"butterfly_005"`) to `/shapes/motifs/butterfly_005.svg`
- **Photos → placeholder**: Companion `type='Photo'` → `vitreous-enamel-image.jpg`, uses companion dimensions over P3D's oversized values
- **Fallback → embedded PNG**: Items without companion match use extracted PNG from p3d binary
- **Name anonymization**: `sanitizeInscription()` replaces real names with fake ones (uses `\b` word boundaries to avoid false matches)
- **Coordinate negation**: Forevershining P3D positions negate both X and Y; companion positions negate Y only
- **Auto-layout algorithm**: Flow layout below text with size capping; memorial phrases above reference, names below
- **Universal size cap**: All motifs capped to headstone dimensions; zero-group motifs capped to 10%/35%

```bash
# Convert single design
node scripts/convert-p3d-design.js 1680456686045

# Batch convert all p3d designs
node scripts/convert-p3d-design.js
```

#### Batch Results
- **860/869** designs converted successfully (9 corrupted p3d files)
- **651** designs with editable inscriptions (5,065 inscription elements total)
- **428** designs with SVG motif references (1,187 motif elements total)
- Output: `public/designs/v2026-p3d/`
- Extracted PNG assets: `public/designs/p3d-assets/`

#### Position Data Limitations (KEY KNOWLEDGE)
- **P3D `regionPosition`**: ~80% of headstone motifs have `(0,0)`. The haxe renderer used an internal auto-layout system NOT captured in saved files.
- **Companion JSON `x`/`y`**: Inscriptions have partially-correct positions. Motifs mostly `(0,0)`. Multiple inscriptions can share the same y-coordinate (e.g., several at `y=119.619`) causing overlap.
- **Auto-layout handles 3 cases**:
  - All items positioned (601 designs) → use as-is
  - All items at (0,0) (38 designs) → full auto-stack
  - Mixed positions (147 designs) → hybrid: keep positioned items, auto-distribute (0,0) items in grid
- **Lid/top motif positions**: Correct mm values from p3d XML but relative to lid center coordinate system

### ✅ P3D Loader Integration

#### `fetchCanonicalDesign()` (`lib/saved-design-loader-utils.ts`)
- **Priority order**: tries `v2026-p3d/` first, then falls back to main rollout `v2026/`
- **Position mode**: `p3d-mm-center` — positions in mm from surface center, no DPR or stage compensation
- **Shape loading**: Reads from `product.shape` OR `components.headstone.shape` (fallback added for p3d designs)
- **Kerb component**: Loads kerb dimensions and texture when present in canonical JSON
- **Embedded-PNG routing**: P3d motifs with `assetType: 'embedded-png'` or `'photo-placeholder'` → `pendingImages` with `maskShape: ''` (no ceramic oval base — flat plane rendering)
- **Border loading**: Extracts `border` from `legacy.raw` headstone item → `store.setBorderName()` (added 2026-04-02)
- `headstoneShiftMm = 0` for p3d designs (already in headstone-center coords)
- `GLOBAL_LAYOUT_SCALE = 1` for p3d designs

#### Callers Updated
- `components/DefaultDesignLoader.tsx` — uses `fetchCanonicalDesign()`
- `app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx` — uses `fetchCanonicalDesign()`
- `components/TestCanonicalLoader.tsx` — uses `fetchCanonicalDesign()`

### ✅ Camera Zoom Fix for Full Monument Components

**Problem:** Clicking Base or Ledger caused camera to zoom way out (1800m bounding box) because `Box3.setFromObject()` included motif meshes positioned at mm coordinates in a meters scene.

#### Fix (`components/three/FullMonumentFit.tsx`)
- **`computeMeshBox()`**: Mesh-only bounding box traversal — skips `motif-*` named meshes, meshes >10m from origin, and `LineSegments` (border/outline helpers)
- **`shouldFocusBase`**: Detects base click → targets upright-assembly group (headstone+base) instead of full monument
- **`shouldZoomIn` / `shouldFocusHeadstone`**: Proper zoom levels per component
- **`UPRIGHT_ASSEMBLY_NAME`** constant in `components/three/constants.ts`
- **`HeadstoneAssembly.tsx`**: Names the assembly group `'upright-assembly'` via useEffect

### ⚠️ Known Position Limitations (P3D Designs)

1. **Haxe auto-layout not captured**: The haxe renderer placed items in bordered frames and two-column layouts using an internal system. These spatial arrangements are NOT saved in p3d or companion JSON data. The converter uses a flow-layout algorithm to approximate the original placement.
2. **~80% of headstone motifs at (0,0)**: Original positions permanently lost. Converter auto-layouts these below text content with size capping.
3. **Some inscription positions inaccurate**: Items like "September 21, 1960" have `x=0` (center) in companion JSON but were visually positioned to the right by the auto-layout engine.
4. **Font sizes are mm-accurate**: The companion JSON stores font_size in real mm, but the haxe renderer used bordered text frames that made text appear smaller relative to the headstone.
5. **Lid motif coordinate system**: Lid motifs have correct mm positions but relative to lid center. They render on the ledger surface.

### ✅ Position Issues Resolved (2026-04-02)

1. ~~Motifs rendered with oval grey ceramic masks~~ → `maskShape: ''` for all P3D images
2. ~~Forevershining positions inverted (X/Y)~~ → `p3dSign = -1` for P3D, `ySign = -1` for companion
3. ~~Motifs oversized (100%+ of headstone)~~ → Universal size cap + zero-group flow layout cap
4. ~~Photo placeholders not loaded~~ → `type='Photo'` recognized, vitreous-enamel-image.jpg used
5. ~~Name anonymization false positives~~ → `\b` word boundaries on sentence regex
6. ~~Bronze plaque positions shrunk to 1/3~~ → `_mm` fields for bronze-plaque companion positions

### 📌 Next Steps (Updated 2026-04-02)

1. ~~Improve p3d inscription layout~~ — ✅ Done (flow layout, text ordering, size capping)
2. **Fix lid/top motif rendering** — Positions in mm need proper conversion to ledger surface coordinates
3. ~~Visual QA pass~~ — Ongoing; multiple designs verified with original screenshots
4. **Build verification** — `pnpm build` passes ✅

---

## Current Status (2026-03-31) — Bronze Plaque Emblems & Fixes

### ✅ Emblem System for Bronze Plaques (Product ID 5)

Bronze Plaques now support **Emblems** — decorative PNG icons placed on the plaque surface. The entire feature is plaque-only and hidden for other product types.

#### Data Layer (`app/_internal/_emblems-loader.ts`)
- **236 emblem IDs** sourced from `createJS/dyo/Data.js` EmblemsData array
- PNG images in 3 sizes: `/public/png/emblems/{xs,s,m}/{id}.png`
- **7 fixed height sizes** from `public/xml/en_EN/emblems.xml`: 50, 75, 100, 150, 220, 300, 400mm
- Sizes control the **largest dimension** — if the emblem is landscape (wider than tall), the size sets the width and height is auto-calculated from the image aspect ratio; if portrait, the size sets the height
- Default size variant: 3 (100mm on largest dimension)

#### Store (`lib/headstone-store.ts` + `lib/headstone-store.types.ts`)
- `selectedEmblems: Array<{ id, emblemId, imageUrl }>` — added emblems list
- `emblemOffsets: Record<string, EmblemOffset>` — per-emblem position/size/rotation/flip state
- `EmblemOffset` includes: `xPos, yPos, sizeVariant, rotationZ, flipX, flipY, widthMm, heightMm, target, coordinateSpace`
- Actions: `addEmblem()`, `removeEmblem()`, `duplicateEmblem()`, `setEmblemOffset()`, `setSelectedEmblemId()`
- `activePanel: 'emblem'` triggers emblem edit panel
- Uses `withOffsetSurfaceDimensions<EmblemOffset>()` for surface-aware positioning

#### UI Components
- **`app/select-emblems/_ui/EmblemSelectionGrid.tsx`** — Flat grid of all 236 emblem thumbnails with search filter, lazy-loaded images, renders in sidebar panel (not fullscreen overlay)
- **`components/EmblemOverlayPanel.tsx`** — Edit panel with size slider (TailwindSlider, 7 discrete steps), rotation slider, flip X/Y buttons, duplicate/delete. Size label shows `Size WIDTHxHEIGHTmm` with actual computed dimensions
- **`app/select-emblems/page.tsx`** — Route page, hidden on desktop (returns null), shows grid on mobile only. Auto-selects Bronze Plaque (product '5') if not already selected

#### 3D Rendering (`components/three/EmblemModel.tsx`)
- Loads emblem PNG as `THREE.Texture` (tries `/m/` then `/s/` then `/xs/` size)
- Renders as textured `PlaneGeometry` on the headstone front face
- **Proportional sizing**: Derives aspect ratio from loaded texture. If landscape (aspect ≥ 1), `sizeVariant` controls width, height = width/aspect. If portrait, `sizeVariant` controls height, width = height×aspect. Writes computed `widthMm`/`heightMm` back to store for UI display
- Supports drag-to-reposition via raycasting to headstone mesh surface
- Selection box with rotation handle when active
- Integrated in `ShapeSwapper.tsx` scene graph

#### Sidebar Integration (`components/DesignerNav.tsx`)
- Menu item "Select Emblems" with `requiresPlaque: true` — only visible for plaque products
- Menu item "Select Additions" with `hiddenForPlaque: true` — hidden for plaque products (additions not applicable to plaques)
- `/select-emblems` added to `canvasVisiblePages` array (required for panel to stay open)
- `/select-emblems` added to `fullscreenPanelSlugs` set
- `renderSelectEmblemsPanel()` renders emblem grid + edit panel inside sidebar content area
- `ConditionalCanvas.tsx` updated to show 3D canvas on `/select-emblems` route

### ✅ Bronze Plaque Landscape Default

- Default plaque dimensions changed from 300×300mm (square) to **300×200mm (landscape)**
- `setProductId()` in `headstone-store.ts`: `shouldForceSquarePlaque` now sets `desiredWidth=300, desiredHeight=200`
- Navigating to `/select-emblems` auto-selects Bronze Plaque if no plaque product is active

### ✅ Bronze Plaque Coordinate Fixes

1. **Landscape plaque scaling** — Legacy loader now uses `maxMonumentDimensionMm = max(width, height)` for landscape plaques where width constrains the viewport fit
2. **Headstone dimension fallback** — Added tertiary fallback: reads `width`/`height` from `legacy.raw[0]` (headstone item) when `headstone` section is empty `{}`
3. **legacyUsePx canvas dims** — Now prefers `init_width/init_height` from legacy item over viewport dims

### ✅ Bronze Border Drag Smoothness

- Removed `localWidth`/`localHeight` from build effect dependencies in `BronzeBorder.tsx`
- Added `unitScale` to dependencies, uses `debouncedDims` consistently
- Prevents full SVG rebuild on every pixel during resize, eliminates flickering

### ✅ Camera Framing for Plaques

- **Scene.tsx**: Orbit target lowered to `[0, 0.15, 0]` for plaque products (vs `[0, 3.8, 0]` for headstones)
- **AutoFit.tsx**: Refactored with retry mechanism (up to 5 retries, 100–500ms delays) when bbox is empty on initial render

### 📌 Next Steps

1. **Emblem pricing** — Wire emblem costs into the price pill and Check Price panel
2. **Emblem save/load** — Persist emblems in saved design JSON and restore on load
3. **Test emblem rendering** with various plaque shapes (oval, circle, landscape, portrait)

---

## Current Status (2026-03-30) — Pricing & ML Smart Search

The legacy design loading pipeline now has a **deterministic, universal** coordinate conversion system that handles any device pixel ratio (DPR) without heuristics or per-design tweaks.

#### Root Cause Discovery

Legacy CreateJS designs stored item positions in **DPR-scaled stage coordinates** (physical pixels from center), NOT CSS pixels. The old loader used the viewport CSS dimensions in the mm-per-pixel ratio, which was wrong for DPR > 1 devices:
- **Old formula (WRONG for DPR>1):** `mmPerPx = headstoneHeightMm / viewportCssHeight`
- **New formula (CORRECT):** `mmPerPx = headstoneHeightMm / (init_height × DPR)`

Evidence from CreateJS source code (`createJS/modules/Canvas.js`):
- `canvas.width = dyo.w * dyo.dpr; canvas.height = dyo.h * dyo.dpr` — canvas IS DPR-scaled
- `dyo.w = window.innerWidth - headerWidth` — these are CSS dimensions = init_width/init_height
- `stage.scaleX = dyo.dpr` — stage coordinates are in DPR-scaled physical pixels
- `Item.js`: `this.data.x = container.x` — positions saved as raw stage coordinates

#### Changes Made (commit 9120a4844e)

**`lib/saved-design-loader-utils.ts`:**
1. **Deterministic DPR** (line ~1421-1424): `effectiveLegacySavedDpr = hasLegacySavedDpr ? legacySavedDprRaw : 1` — uses stored value directly, defaults to 1. Removed `inferLegacySavedDprHeuristic()` and `inferLegacySavedDprDeterministic()` calls (both functions still exist as dead code for future cleanup).
2. **Broadened useDirectCssStageDesktopMapping** (line ~1431-1433): Now enabled for ALL `positionMode === 'legacy-stage-px'` designs with init dimensions. Removed gates: `effectiveCoordinateSpace === 'css-stage'`, `isDesktopLegacyPayload`, `effectiveLegacySavedDpr <= 1.05`, `canonicalViewportDpr <= 1.05`.
3. **DPR in denominator** (line ~1482-1489): `mmPerPxY = headstoneHeightMm / (legacyInitHeight * effectiveLegacySavedDpr)` — divides by DPR to convert from physical-pixel stage coords to mm.

**`components/three/MotifModel.tsx`:**
1. **Texture flip fix** (line 166): `activeTexture.flipY = false` — CanvasTexture with default flipY=true renders right-side-up, but our PlaneGeometry UV mapping needs flipY=false.
2. **ScaleY negation** (line 564): `scaleY = planeHeightUnits * (flipY ? 1 : -1)` — non-flipped motifs get negative scaleY to compensate the canvas Y-down origin in GL.

#### Heuristics REMOVED (replaced by deterministic logic)
- `inferLegacySavedDprHeuristic()` — guessed DPR from candidate list by minimizing spread error
- `inferLegacySavedDprDeterministic()` — async fetch of _cropped.json to compute DPR from screenshot dimensions
- `effectiveLegacySavedDpr <= 1.05` threshold — blocked init-based mapping for DPR>1 designs
- `shouldTreatCssStageAsBufferPx` — no longer relevant since `useDirectCssStageDesktopMapping` now covers all init-dimension designs

#### Verification Math

| Design | DPR | init_h | viewport_h | Old mmPerPxY | New mmPerPxY | Change |
|--------|-----|--------|------------|-------------|-------------|--------|
| 1725769905504 | 2.325 | 476 | 689 | 0.885 | 0.551 | -37.7% (FIXED) |
| 1755301653966 | 1 | 860 | 1080 | 1.211 | 1.211 | 0% (unchanged) |
| 1597573022772 | None→1 | 663 | 663 | 0.905 | 0.905 | 0% (unchanged) |

Design 1725769905504 angel motif verification:
- y_px=47.239 × 0.551 = 26.0mm below center (8.5% of headstone half) — matches reference screenshot ✓
- With old ratio: 47.239 × 0.885 = 41.8mm (13.7%) — too far below, triggered range-fit shifting

#### Important: Font/Motif Sizes vs Positions use DIFFERENT ratios

- **Positions**: DPR-scaled physical pixels → use `headstoneHeightMm / (init_height × DPR)` — in `convertPositionToMm()`
- **Font sizes (CSS px available)**: CSS px (from font string like "40px Arial") → use `HEADSTONE_MM_PER_PX_Y_CANONICAL` (viewport-based) — in `resolveFontSizeMm()`
- **Font sizes (no CSS px)**: `size_px` field is ALREADY in mm (both forevershining and headstonesdesigner) → return directly
- **Motif heights (forevershining)**: `height_px` is ALREADY in mm (product catalog units, converter misnamed the field) → return directly
- **Motif heights (headstonesdesigner)**: `height_px` is in design pixel coordinates (proportional to init_height) → convert with `height_px × headstoneHeightMm / init_height`

---

## Current Status (2026-03-30) — Pricing & ML Smart Search

### ✅ Dynamic Pricing Across All Panels

All sidebar panels now display **dynamic prices** from XML catalog data instead of hardcoded flat rates. Prices update reactively when items are resized, duplicated, or changed.

#### Panel Price Displays

| Panel | Source | Calculation |
|-------|--------|-------------|
| **Motif** | `motifs-biondan.xml` via `motif-pricing.ts` | `calculateMotifPrice(heightMm, color, priceModel, isLaser)` — height-based tiers, color note matching (Gold/Silver Gilding, Paint Fill) |
| **Inscription** | `inscriptions.xml` via store `inscriptionPriceModel` | `calculatePrice(priceModel, sizeMm)` — Height quantity type, color-aware tier matching. Shows "Free" for free products (e.g., Black Granite laser) |
| **Image** | `images.xml` via `lib/image-pricing.ts` | `calculateImagePrice(product, widthMm, heightMm, colorMode)` — Width+Height quantity, BW/Color note tiers |
| **Addition** | `FALLBACK_SIZES` in `_additions-loader.ts` | `activeAdditionSize.retailPrice` — Pre-computed from `motifs-biondan.xml` per sourceId + sizeVariant |

#### Price Pill (Canvas Bottom)

The floating price pill (`components/ThreeScene.tsx`) now includes **all** cost components:

```
totalPrice = headstonePrice + basePrice + ledgerPrice + kerbsetPrice
           + inscriptionCost + motifCost + imageCost + additionCost
```

New store fields added:
- `imageCost: number` — recalculated on add/remove/duplicate/resize image
- `additionCost: number` — recalculated on add/remove/duplicate/resize/sizeVariant change
- `calculateImageCost()` — async, fetches XML pricing map, sums per-image prices
- `calculateAdditionCost()` — sync, sums `retailPrice` from `FALLBACK_SIZES`

#### Save/Checkout Pricing

`DesignerNav.tsx` `handleSaveDesign()` now computes actual per-item prices:
- **Additions**: Iterates `selectedAdditions`, looks up `retailPrice` from `data.additions[baseId].sizes[variant-1]`
- **Inscriptions**: Iterates valid inscriptions, applies `calculatePrice()` with color-tier matching

#### Files Modified
- `components/InscriptionEditPanel.tsx` — Dynamic inscription price display
- `components/ImageSelector.tsx` — Dynamic image price display (already existed)
- `components/DesignerNav.tsx` — Dynamic addition price, save pricing, panel UI cleanup
- `components/ThreeScene.tsx` — Price pill includes imageCost + additionCost
- `lib/headstone-store.ts` — Added imageCost, additionCost, calculate functions, recalc triggers
- `lib/headstone-store.types.ts` — Added type definitions for new fields

### ✅ Panel UI Consistency

All item panels (Motif, Addition, Inscription, Image) now share a consistent style:
- **Removed**: Grey wrapper div (`rounded-2xl border border-[#3A3A3A] bg-[#1F1F1F]/95`)
- **Removed**: "Selected: {long-instance-id}" text and "Clear selection" button
- **Unified**: `space-y-4` layout, gold Duplicate button (`bg-[#D7B356]`), red Delete button
- Pattern established by `InscriptionEditPanel.tsx` — other panels now match

### ✅ TF.js Smart Search for Design Gallery

Implemented ML-powered search and filtering for the `/designs` gallery page and the Load Design modal.

#### ML Data Structure (`public/ml/`)
- **forevershining**: `ml/forevershining/ml.json` — 3,021 entries with classification labels
- **headstonesdesigner**: `ml/headstonesdesigner/ml.json` — 1,100 entries
- Each entry has: `ml_style`, `ml_type`, `ml_motif`, `ml_tags` (comma-separated keywords)
- Categories: 6 types, 5 styles, 40+ motif categories

#### TF.js Model
- `public/ml/forevershining/my-model.json` — Model topology (generated)
- `public/ml/forevershining/my-model.weights.bin` — 626,672 bytes (3,018 output units)
- Architecture: Dense(3→50) → LeakyReLU → Dropout → Dense(50→50) → LeakyReLU → Dropout → Dense(50→N, softmax)
- Input: `[type_idx/types_count, style_idx/styles_count, motif_idx/motifs_count]`

#### Search Service (`lib/ml-search-service.ts`)
- Loads and caches ML data from both forevershining and headstonesdesigner
- **Text search**: Tokenized multi-word scoring against design titles, descriptions, ml_tags
- **Category filters**: Type, Style, Motif dropdown filtering
- **TF.js ranking**: Lazy-loads model, runs inference for similarity scoring
- **Feature toggles**: Filter by photo/motif/addition presence

#### UI Components
- `components/DesignSmartSearch.tsx` — Search bar + Type/Style/Motif filter dropdowns + feature toggles
- `app/designs/DesignsPageClient.tsx` — Integrated smart search with debounced queries, ML tag badges, AI Recommended markers, pricing from ml.json
- `components/LoadDesignButton.tsx` — ML filter dropdowns, enhanced search with ml_tags, motif tag badges

#### Dependencies Added
- `@tensorflow/tfjs` (v4.22.0) — TensorFlow.js for browser-side model inference

### 📌 Next Steps

1. **Continue testing additional legacy designs** — verify more designs across both systems
2. **Dead code cleanup** (low priority): remove `inferLegacySavedDprHeuristic()`, `inferLegacySavedDprDeterministic()`, `shouldTreatCssStageAsBufferPx`
3. **Re-run batch converter with `--include-photos`** to populate `photos[]` in canonical JSONs
4. **Update Check Price detail modal** — addition price column still shows "$75.00" (should use dynamic pricing)
5. **Script-based ML categorization** — for auto-categorizing newly downloaded saved designs from all 3 sites

---

## Current Status (2026-03-30) — Legacy Design Loading

### ✅ Legacy Design Loading — Major Fixes (16+ issues resolved)

Comprehensive debugging of legacy saved design loading across both **forevershining** and **headstonesdesigner** systems. Multiple test designs verified.

#### 1. ReferenceError Fix — `hasLegacyInitViewport` hoisting
- `hasLegacyInitViewport` was used before its `const` declaration (block-scoped, doesn't hoist)
- **Fix**: Moved definition to outer scope before first use

#### 2. Motif Flip Handling — Direct Legacy.raw Read
- **Root cause**: Batch converter used `item.flipx === -1` (strict equality) which fails for STRING values like `"1"` vs number `1`
- Legacy convention: `flipx=-1` = flipped, `flipx=1` = not flipped (values may be string or number)
- **Fix**: Reads flip values directly from `legacy.raw` using `Number(item.flipx) === -1`
- Removed `invertFlips` / `flipMode` logic entirely — legacy.raw flip values are authoritative
- Built `legacyMotifFlipByCanonicalId` map in the loader
- Fixed both converter scripts to use `Number()` coercion

#### 3. Uniform mmPerPx Position Scaling
- Legacy CreateJS uses `use = min(w*dpr, h*dpr) * 0.975` with uniform scaling
- **Fix**: `uniformMmPerPx = totalMonumentHeightMm / (min(initW, initH) * DPR * 0.975)`
- DPR falls back to `designData.scene?.viewportPx?.dpr` when not in headstone item

#### 4. Forevershining Motif Height Fix
- **Critical discovery**: Forevershining stores motif heights in **mm** (product catalog units), NOT CSS px
- The converter misnames them as `height_px`
- **Fix**: `resolveMotifHeightMm` returns `height_px` directly as mm when `isForevershining`

#### 5. Headstonesdesigner Motif Height Fix
- `height_px` is in **design pixel coordinates** (proportional to `init_height`), NOT physical draw px
- Verified empirically: design 1725769905504 has both `height_mm` and `height_px` → ratio = `headstoneHeightMm / init_height` exactly
- **Fix**: `resolveMotifHeightMm` uses `height_px × canonicalHeadstoneHeightMm / legacyInitHeight`

#### 6. Font Size Fallback Fix
- Both systems store `font_size` / `size_px` in **mm** (product catalog units) in the saved JSON
- The CSS font string (e.g., "104.34px Garamond") is the ONLY value in rendering px
- **Fix**: When CSS font string unavailable, return `size_px` directly as mm (both systems)

#### 7. Texture Mapping System
- ALL numbered textures (`01.webp`–`35.webp`) are ~2KB tiny placeholder files in the texture directory
- `Glory-Black-2.webp` (1540 bytes) is intentionally a solid black texture for laser etching — NOT a placeholder
- Added `MATERIAL_TEXTURES` dictionary and `mapTexture()` function for named texture resolution
- Added dimension-suffix stripping regex (`-\d+-x-\d+`) for paths like `White-Carrara-600-x-600.webp`
- `mapTexture()` is now called before `enforceTexture()` in the canonical loading path
- `enforceTexture()` sets `store.setIsMaterialChange(true)` so ShapeSwapper updates `visibleTex`

**Texture mappings:**
| Legacy path | Maps to |
|-------------|---------|
| `/17.jpg` (catalog ID 18) | `Glory-Black-1.webp` (Glory Gold Spots) |
| `/18.jpg` or `/19.jpg` | `Glory-Black-2.webp` (Glory Black — solid black for laser etching) |
| `White-Carrara-*` | `White-Carrara.webp` |
| `Blue-Pearl` | `Blue-Pearl.webp` |

#### 8. Base Element Routing
- Converter `convert-saved-design.js` was hardcoding `surface: "headstone/front"` for all items
- **Fix**: Uses legacy `item.part` field for surface detection
- Loader also has position-based fallback: items with `yMm < -(HEADSTONE_HALF_MM * 1.02)` are reclassified to base
- Built `legacyItemPartByCanonicalId` map from `legacy.raw` items for cross-referencing

#### 9. Photo/Image Element Loading
- Batch converter excluded photos by default (requires `--include-photos` flag)
- All rollout designs have `photos: []` even when `legacy.raw` contains Photo/Picture items
- **Fix**: Loader now synthesizes photo entries from `legacy.raw` when `canonicalPhotoSnapshot` is empty
- Extracts: `typeId`, `typeName`, `surface`, `position`, `size` (parsed from "180 x 240 mm"), `mask.shape`, `source`
- Falls back to `/jpg/photos/vitreous-enamel-image.jpg` placeholder when original images unavailable

#### 10. Photo Rendering — Oval/Rect Masking
- Photos rendered as rectangular planes would cover the ceramic base (JPG has no alpha channel)
- **Fix**: `ImageModel.tsx` creates a flat `ShapeGeometry` from the same SVG mask used for the ceramic base
- UV coordinates normalized to [0,1] with Y-flip compensation for negative scale
- Photo plane now clips to oval/rect shape, with white ceramic base visible as border
- Fallback to rectangular `PlaneGeometry` when no mask SVG available

#### Files Modified
- `lib/saved-design-loader-utils.ts` — 16+ fixes (coordinate conversion, texture mapping, photo synthesis, flip handling, font/motif sizes, base routing)
- `components/three/ImageModel.tsx` — Photo masking with SVG ShapeGeometry, vitreous enamel placeholder fallback
- `scripts/convert-saved-design.js` — Surface detection from `item.part`, flip `Number()` coercion
- `scripts/batch-convert-saved-designs.js` — Flip `Number()` coercion, texture mappings
- `scripts/convert-legacy-design.js` — Texture mapping fixes
- `public/canonical-designs/v2026/1725769905504.json` — Corrected flip values
- Various rollout JSON files — Texture path fixes

#### Designs Verified
| Design ID | System | Status |
|-----------|--------|--------|
| 1725769905504 | headstonesdesigner | ✅ Positions, motifs, flips correct |
| 1578016189116 | forevershining | ✅ Textures, motif heights, font sizes correct |
| 1654222051474 | forevershining | ✅ White-Carrara dimension suffix fixed |
| 1704011685894 | forevershining | ✅ Base routing for 40-motif floral border |
| 1630558777652 | forevershining | ✅ Texture mapping (mapTexture before enforceTexture) |
| 1714311178594 | headstonesdesigner | ✅ Motif heights (init_height ratio) |
| 1739765356856 | headstonesdesigner | ✅ Motif flips (legacy.raw direct read) |
| 1610832359060 | forevershining | ✅ Glory-Black-2 laser etching texture confirmed correct |
| 1702923274519 | headstonesdesigner | ✅ Photo element loading with ceramic oval mask |

### 🔑 Key Architecture Knowledge for Legacy Design Loading (Updated)

**Canonical JSON structure** (`public/designs/v2026-rollout-full-20260324-190828/<id>.json`):
- `legacy.raw[]` — array of items, first item is headstone with `init_width`, `init_height`, `dpr` fields
- `scene.viewportPx` — `{ width, height, dpr }` — represents PAGE viewport (larger than canvas)
- `scene.coordinateSystem` — `{ positionMode, headstonePlacement, coordinateSpace, flipMode }`
- Elements: `inscriptions[]`, `motifs[]`, `photos[]` with `position: { x_px, y_px }` in DPR-scaled stage coords
- **Note**: Batch converter excluded photos by default — `photos: []` in most rollout files. Loader synthesizes from `legacy.raw`.

**Key dimensions distinction**:
- `init_width/init_height` = CSS canvas dimensions (viewport minus UI chrome) = `dyo.w/dyo.h`
- `scene.viewportPx.width/height` = may be PAGE viewport dimensions (NOT the same as init!)
- Physical canvas pixels = `init_width × DPR` by `init_height × DPR`
- Stored positions are in physical canvas pixel space (center-relative, Y-down)

**Loader pipeline** (`lib/saved-design-loader-utils.ts`, ~2200+ lines):
- `convertPositionToMm()` — converts legacy px positions to mm using uniform mmPerPx scaling
- `resolveFontSizeMm()` — CSS px font string → mm via viewport ratio; OR returns `size_px` directly (already mm)
- `resolveMotifHeightMm()` — forevershining: `height_px` is mm; headstonesdesigner: `height_px × headstoneHeightMm / init_height`
- `mapTexture()` — maps legacy texture paths (numbered files, dimension suffixes) to real named textures
- `enforceTexture()` — applies texture to store with `isMaterialChange=true` for ShapeSwapper
- `legacyMotifFlipByCanonicalId` — reads flips from `legacy.raw` using `Number()` coercion
- `legacyItemPartByCanonicalId` — reads surface target (headstone/base) from `legacy.raw`
- Photo synthesis from `legacy.raw` when `canonicalPhotoSnapshot` is empty

**Motif rendering** (`components/three/MotifModel.tsx`):
- Uses CanvasTexture with `flipY=false` (compensated by negative scaleY)
- flipX/flipY convention: `1` or `false` = NOT flipped, `-1` or `true` = flipped
- Flip values read directly from `legacy.raw` (handles string/number types via `Number()`)
- Supports coordinateSpace: 'mm-center' (loaded designs) and 'offset' (user-placed)

**Photo rendering** (`components/three/ImageModel.tsx`):
- Creates 3D ceramic/enamel base from SVG mask shape (extruded with bevels)
- Photo texture masked to SVG shape via flat `ShapeGeometry` (not rectangular plane)
- UV coordinates normalized [0,1] with Y-flip for negative scale compensation
- Fallback image: `/jpg/photos/vitreous-enamel-image.jpg` when original photos unavailable
- `typeId=7` (Ceramic Image) gets ceramic base; `typeId=21` (Granite Image) renders flat

**Texture system**:
- ALL numbered textures (`01.webp`–`35.webp`) in `/textures/forever/l/` are ~2KB placeholders
- `Glory-Black-2.webp` (1540 bytes) is intentionally solid black for laser etching — NOT broken
- Real textures are 150KB–330KB named files (e.g., `African-Black.webp`, `Blue-Pearl.webp`)
- `mapTexture()` must be called before `enforceTexture()` in the canonical loading path
- ShapeSwapper `visibleTex` only updates when `isMaterialChange=true` (set by `enforceTexture`)

### 📌 Next Steps

1. **Continue testing additional legacy designs** — verify more designs across both systems
2. **Dead code cleanup** (low priority): remove `inferLegacySavedDprHeuristic()`, `inferLegacySavedDprDeterministic()`, `shouldTreatCssStageAsBufferPx`
3. **Re-run batch converter with `--include-photos`** to populate `photos[]` in canonical JSONs (currently synthesized at load time)
4. **Audit remaining placeholder textures** — verify which named `.webp` files are real vs placeholder

---

## Current Status (2026-03-27)

### ⚠️ Legacy design loading parity (in progress)

1. **Legacy coordinate-space pipeline hardening - IN PLACE**
   - Canonical converter scripts now emit explicit legacy coordinate metadata:
     - `scene.coordinateSystem.coordinateSpace` (`css-stage` or `buffer-px`)
     - `scene.coordinateSystem.stageCssPx`
     - `scene.coordinateSystem.bufferPx`
   - Updated scripts:
     - `scripts/convert-saved-design.js`
     - `scripts/batch-convert-saved-designs.js`
     - `scripts/convert-legacy-design.js`

2. **Canonical loader universal legacy-stage normalization - IN PLACE**
   - `lib/saved-design-loader-utils.ts` now reads coordinate-space metadata and maps stage pixels to mm without blanket DPR replay.
   - Added adaptive reinterpretation (`css-stage` → effective `buffer-px`) for legacy-stage payloads with clear DPR-inflated spread.
   - Replaced one-off vertical nudge with a universal **range-fit shift** for all `legacy-stage-px` loads so headstone content is top-priority and overflow-safe.
   - Conditioned headstone stage-offset normalization by effective coordinate space to avoid double-shifting.

3. **Shape remap safety during design load - IN PLACE**
   - `components/three/headstone/ShapeSwapper.tsx` now skips bbox remap enqueue/apply while `loading === true` to prevent load-time coordinate mutation.

4. **Canonical source update for active regression ID - COMPLETE**
   - Regenerated `public/canonical-designs/v2026/1725769905504.json` with the new coordinate-space metadata.

5. **Load Design popup thumbnails on Vercel - FIXED**
   - Root cause: `.vercelignore` excludes full screenshot JPGs under `public/ml/**/saved-designs/screenshots/**`, keeping `_small.jpg`.
   - Updated `components/LoadDesignButton.tsx` to prefer `_small.jpg` and fallback to original preview URL on image error.
   - Result: popup thumbnails now resolve on Vercel deployments.

6. **Debug cleanup after parity iteration - COMPLETE**
   - Removed transient loader debug logs added during coordinate-system investigation.
   - Kept functional warnings/info for fallback and failure paths.

7. **Current verification status**
   - `1725769905504`: major parity improvement after universal legacy-stage normalization updates.
   - `1597573022772`: major parity improvement after universal range-fit application.
   - `1578016189116`: still flagged for follow-up parity verification.
   - Build validation remains green:
     - `pnpm build` ✅

### 📌 Next technical steps (legacy parity)
- Final visual sign-off pass for `1578016189116`.
- If residual mismatch appears on any additional ID, capture per-element diagnostics (`x_px/y_px` → computed `xMm/yMm` → final rendered `xPos/yPos`) and adjust shared mapping rules only.
- Re-run canonical regeneration for additional affected legacy IDs using the new coordinate-space metadata pipeline.

---

## Current Status (2026-03-25)

### ✅ Recent Changes (March 25, 2026)

1. **Canonical runtime switched to full rollout output - COMPLETE**
   - Default canonical source now points to `public/designs/v2026-rollout-full-20260324-190828`.
   - Shared canonical URL helper now routes runtime fetches through `/designs/<version>/<id>.json`.
   - Files: `lib/saved-design-loader-utils.ts`, `app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx`, `components/DefaultDesignLoader.tsx`, `components/TestCanonicalLoader.tsx`.

2. **Skipped-ID artifact policy integration - COMPLETE**
   - Loader policy now consumes `database-exports/rollout-full-skipped-ids-20260324-190828.json`.
   - Skipped IDs are automatically routed to legacy fallback behavior.
   - Files: `lib/saved-design-loader-utils.ts`.

3. **Outlier parity hardening for `1578016189116` - IN PLACE**
   - Kept explicit legacy-parity fallback behavior for this medium-confidence outlier to reduce canonical mismatch risk.
   - Design page screenshot link logic now avoids broken `*_cropped.jpg` URLs when only original JPG exists.
   - Files: `lib/saved-design-loader-utils.ts`, `app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx`.

4. **Rollout operations scripts added - COMPLETE**
   - Added npm wrappers:
     - `pnpm rollout:batch`
     - `pnpm rollout:report`
     - `pnpm rollout:resume`
   - Added resume support (`--resume-from-report`) to batch converter flow.
   - Files: `package.json`, `scripts/batch-convert-saved-designs.js`, `scripts/report-rollout-summary.js`.

5. **Load Design UX upgraded to a single modal tree picker - COMPLETE**
   - Replaced 3 fixed regression buttons with one `Load Design` canvas button.
   - Modal picker shows hierarchical tree (product -> category -> design), supports search, and loads any design via shared loader.
   - Design labels now use SEO-friendly shape+slug naming consistent with `/designs` navigation.
   - Product/category ordering now follows dataset insertion order to better match `/designs` popularity ordering.
   - Files: `components/ConditionalCanvas.tsx`, `components/LoadDesignButton.tsx`, `components/DefaultDesignLoader.tsx`.

6. **Validation**
   - `pnpm type-check` passes after each major change slice in this batch.

### ⚠️ Known Gaps (March 25, 2026)
- **`1578016189116` still requires visual parity confirmation in browser**: fallback path is enforced, but final UX parity should be re-verified against legacy SVG/div expectation.
- **Canonical rollout remains mixed-mode by policy**: non-skipped IDs use rollout-full canonical, while skipped/fallback IDs intentionally route through legacy behavior.

### 📌 March 25 Action Plan Status
- Runtime rollout switch: ✅ done
- Skipped-ID integration: ✅ done
- Outlier parity routing for `1578016189116`: ✅ implemented (final visual sign-off pending)
- Batch/report/resume scripts: ✅ done
- Type-check + targeted validation: ✅ done

---

## Current Status (2026-03-23)

### ✅ Recent Changes (March 23, 2026)

1. **Quality gates restored for active codebase - COMPLETE**
   - Migrated to ESLint 9 flat config (`eslint.config.js`) and aligned Next.js config usage.
   - Resolved active TypeScript errors across app/components/lib and excluded legacy `archive/` from active compile scope.
   - Validation now passes on active code:
     - `pnpm lint` ✅
     - `pnpm type-check` ✅
     - `pnpm build --no-lint` ✅

2. **Canvas price chip + Check Price modal integration - COMPLETE**
   - Bottom canvas price chip is clickable and opens the existing Check Price flow (`activePanel = 'checkprice'`) over the canvas.
   - Popup is rendered via portal to `#scene-root` so centering is within canvas, not full window.
   - Pricing fallback reliability fixed by loading `/xml/catalog-id-<productId>.xml` with safe product ID fallback when store product is temporarily null.
   - Files: `components/ThreeScene.tsx`, `components/ConditionalCanvas.tsx`, `components/CheckPricePanel.tsx`, `lib/check-price-utils.ts`.

3. **Locale-aware unit display rollout (safe scope) - COMPLETE**
   - Added country-driven unit detection (`US`, `LR`, `MM` => imperial; others => metric) and persisted `unit_system` cookie in middleware.
   - Added shared unit formatting helpers/hooks and applied to:
     - canvas chip dimensions,
     - Check Price size/height labels,
     - DesignerNav main dimension label,
     - MobileHeader dimensions.
   - Internal calculations remain in millimeters; display formatting only changed.
   - Files: `middleware.ts`, `lib/unit-system.ts`, `lib/use-unit-system.ts`, `components/ThreeScene.tsx`, `components/CheckPricePanel.tsx`, `components/DesignerNav.tsx`, `components/MobileHeader.tsx`.

4. **Refresh consistency fix on `/select-size` - COMPLETE**
   - Fixed direct-refresh mismatch where `/select-size` could initialize a different default product/catalog than the Select Product flow.
   - RouterBinder now initializes product state on designer-route refresh (with optional `?productId=` override), keeping granite/material/price consistent.
   - File: `components/system/RouterBinder.tsx`.

5. **Check Price canvas popup visual simplification - COMPLETE**
   - Removed "Pricing Breakdown" chip in popup header.
   - Removed Download PDF button from the canvas popup (reserved for registered-user workflow later).
   - Rethemed table away from white backgrounds to dark/gold styling and removed decorative gradients as requested.
   - Adjusted popup width to a narrower layout for readability.
   - File: `components/CheckPricePanel.tsx`.

### ⚠️ Known Gaps (March 23, 2026)
- **Saved Design 2 (`1578016189116`)** remains unresolved; current evidence still points to loader interpretation / non-text asset hydration behavior rather than simple reconversion.
- **Unit-system rollout is partial by design**: safe-scope surfaces are done, but additional `mm` labels remain in deeper Designer panels and can be migrated in a follow-up pass.

### 📌 Tomorrow Action Plan (March 25, 2026) — Completed

1. **Switch runtime to prefer full rollout output**
   - Point loader/default canonical source to `public/designs/v2026-rollout-full-20260324-190828`.
   - Keep legacy fallback for skipped IDs and any runtime parse/load failures.

2. **Use skipped IDs artifact for triage**
   - Review `database-exports/rollout-full-skipped-ids-20260324-190828.json`.
   - Split skipped designs into:
     - intentional skips (`test-inscription`, `single-image-only`),
     - potential false positives to recover.

3. **Resolve medium-confidence outlier**
   - Re-verify `1578016189116` against the legacy SVG/div reference and confirm loader parity path.
   - Document whether this ID should stay in design overrides or move back to default high-confidence flow.

4. **Operational hardening**
   - Add npm script wrappers for batch rollout commands and summary generation.
   - Add a small “resume from report” workflow for interrupted long runs.

---

## Current Status (2026-03-22)

### ✅ Recent Changes (March 22, 2026)

1. **Homepage conversion flow simplified (Variant B cleanup) - COMPLETE**
   - Kept the homepage focused on a single core goal: **Start Your Free Design**.
   - Removed duplicated support/promotional messaging and reduced repeated information density.
   - **File**: `app/_ui/HomeSplash.tsx`.

2. **How It Works streamlined to steps-only narrative - COMPLETE**
   - Retained Step 1 / Step 2 / Step 3 cards as the central guidance element.
   - Removed secondary highlight/stat blocks that duplicated already-present value messaging.
   - Tightened card copy and kept visual step progression cleaner.
   - **File**: `app/_ui/HomeSplash.tsx`.

3. **Redundant and heavy lower-homepage sections removed/replaced - COMPLETE**
   - Replaced the previous heavy pre-footer testimonial/CTA composition with a cleaner CTA strip.
   - Removed the entire interactive `DesignPossibilitiesSection` block (the section beginning with “Tap the steps below to customize every detail in our 3D studio.”).
   - Removed leftover conversion-path prompts for premium support (e.g., “Talk with a designer”) from the homepage flow.
   - **File**: `app/_ui/HomeSplash.tsx`.

4. **Validation notes for this batch**
   - `pnpm lint` remains blocked by repo-level ESLint 9 config migration gap (`eslint.config.*` missing).
   - TypeScript still has known baseline issues outside this homepage simplification scope.

---

## Current Status (2026-03-21)

### ✅ Recent Changes (March 21, 2026)

1. **Home hero headstone front layout updated for ceramic-photo showcase - COMPLETE**
   - Inscriptions on the front of the hero headstone were moved upward to create dedicated space below for a photo insert.
   - **File**: `components/HeroCanvas.tsx`.

2. **Hero photo switched from flat rectangle to masked ceramic/enamel style - COMPLETE**
   - Replaced the temporary rectangular photo plane with a dedicated `HeroCeramicImage` renderer in `HeroCanvas`.
   - The hero image now uses the existing oval mask asset (`/shapes/masks/oval_horizontal.svg`) and SVG-based shape geometry, so the photo no longer shows a rectangular white background around the oval.
   - Added ceramic-style base geometry + front photo layering to mirror the Designer ceramic image look-and-feel in the homepage hero.
   - **File**: `components/HeroCanvas.tsx`.

3. **Hero ceramic/photo visual tuning pass based on screenshot feedback - COMPLETE**
   - Reduced over-deep ceramic extrusion from the first implementation pass, then adjusted it upward by ~15% for a more natural enamel depth.
   - Fixed missing/unstable photo rendering by adding explicit UV generation for the mask-shaped photo geometry.
   - Increased photo offset and added polygon offset material settings to reduce z-fighting/flashing and detail loss while rotating.
   - Applied a second inscription upward nudge after visual check.
   - **File**: `components/HeroCanvas.tsx`.

4. **Validation status for this batch**
   - `pnpm build --no-lint` succeeded after each hero update slice in this session (initial placement, ceramic-mask conversion, depth/UV fix, and final polish pass).

### ⚠️ Known Gaps (March 21, 2026)
- **TypeScript baseline**: `pnpm type-check` still fails because of unrelated existing issues, including `app/_internal/_data.ts`, `app/_ui/HomeSplash.tsx`, `app/api/motifs/db/route.ts`, `app/select-motifs/_ui/MotifSelectionGrid.tsx`, and multiple `archive/*` files.
- **Lint baseline**: `pnpm lint` remains unusable because the repository is on ESLint 9 without a matching `eslint.config.*` migration.
- **Saved Design 2 (`1578016189116`) still not resolved**: Remaining issue still appears to be loader interpretation and/or missing non-text asset hydration, not simply “needs reconversion”.

---

## Current Status (2026-03-20)

### ✅ Recent Changes (March 20, 2026)

1. **Crop overlay drag alignment corrected after refactor - COMPLETE**
   - `CropCanvas` drag rectangle now uses the same pixel-space `object-contain` image-box mapping (`cropPx`) as the green mask overlay.
   - This removes horizontal (and vertical) drift between drag handles and mask output after the recent crop-section refactor.
   - **File**: `components/CropCanvas.tsx`.

2. **Saved design account isolation enforced end-to-end - COMPLETE**
   - Closed a data isolation bug where `/api/projects` operations were not scoped to the authenticated account and could expose other users' designs.
   - Project DB helpers now require `accountId` and enforce ownership in list/get/update/delete queries.
   - Project API routes now require session and pass `session.accountId` for:
     - `GET /api/projects`
     - `POST /api/projects`
     - `DELETE /api/projects`
     - `GET /api/projects/[id]`
   - Removed guest-account fallback behavior from project persistence path.
   - **Files**: `lib/projects-db.ts`, `app/api/projects/route.ts`, `app/api/projects/[id]/route.ts`.

3. **Validation status for this batch**
   - `pnpm build --no-lint` succeeded after the crop alignment fix.
   - `pnpm build --no-lint` succeeded after the account-isolation API fix.

### ⚠️ Known Gaps (March 20, 2026)
- **TypeScript baseline**: `pnpm type-check` still fails because of unrelated existing issues, including `app/_internal/_data.ts`, `app/_ui/HomeSplash.tsx`, `app/api/motifs/db/route.ts`, `app/select-motifs/_ui/MotifSelectionGrid.tsx`, and multiple `archive/*` files.
- **Lint baseline**: `pnpm lint` remains unusable because the repository is on ESLint 9 without a matching `eslint.config.*` migration.
- **Saved Design 2 (`1578016189116`) still not resolved**: Remaining issue still appears to be loader interpretation and/or missing non-text asset hydration, not simply “needs reconversion”.

---

## Current Status (2026-03-19)

### ✅ Recent Changes (March 19, 2026)

1. **Local refactor campaign continued with behavior-safe slices - COMPLETE**
   - Repeatedly used extract-and-validate workflow (small slice -> `pnpm build` -> next slice) to reduce risk while preserving current UI/3D behavior.
   - Session tracked with explicit SQL todos and dependency ordering for each slice.

2. **ImageSelector UX/structure cleanup - COMPLETE**
   - Replaced `alert()` paths in `components/ImageSelector.tsx` with inline feedback banner state (`feedbackMessage`, `feedbackTone`) for upload/crop failure messaging.
   - Completed earlier decomposition by keeping crop/mask logic in dedicated helpers:
     - `components/useImageCropState.ts`
     - `lib/image-mask.ts`
   - Result: lower component complexity and more consistent in-app error UX.

3. **Hook dependency cleanup in overlay controllers - COMPLETE**
   - Removed `react-hooks/exhaustive-deps` suppressions in:
     - `components/SceneOverlayHost.tsx`
     - `components/SceneOverlayController.tsx`
   - Updated effects to rely on stable updater/dependency patterns.

4. **Check Price panel modularization - COMPLETE**
   - Added `lib/check-price-utils.ts` and extracted:
     - section state defaults/types
     - shape/material display helpers
     - mm -> imperial formatting helper
   - Updated `components/CheckPricePanel.tsx` to consume shared helpers.

5. **AdditionModel decomposition progressed through multiple slices - COMPLETE**
   - Added/expanded `lib/addition-utils.ts` with reusable typed helpers:
     - ID normalization: `normalizeAdditionBaseId`
     - depth safety clamp: `clampDepthWithinRange`
     - geometry helpers: `clampValue`, `getBoundsCenter`, `getInteractionClampBounds`
     - conversion helpers: `getHeadstoneCenterXY`, `convertPointBetweenMeshLocals`
     - base sampling helpers: `getMeshBoundingBox`, `sampleBaseSurfaceMetrics`, `BaseSurfaceSamples`
   - Updated `components/three/AdditionModel.tsx` to consume these helpers across default placement, drag interaction, and base-surface sampling.
   - Reused `normalizeAdditionBaseId` in:
     - `app/select-additions/AdditionCard.tsx`
     - `lib/headstone-store.ts`
   - Result: reduced duplicated geometry/conversion logic and clearer extraction seams for future slices.

6. **Validation status for this batch**
   - `pnpm build` succeeded after each completed slice in this session.
   - Type-check/lint baselines remain unchanged from prior status (see Known Gaps).

### ⚠️ Known Gaps (March 19, 2026)
- **TypeScript baseline**: `pnpm type-check` still fails because of unrelated existing issues, including `app/_internal/_data.ts`, `app/_ui/HomeSplash.tsx`, `app/api/motifs/db/route.ts`, `app/select-motifs/_ui/MotifSelectionGrid.tsx`, and multiple `archive/*` files.
- **Lint baseline**: `pnpm lint` remains unusable because the repository is on ESLint 9 without a matching `eslint.config.*` migration.
- **Saved Design 2 (`1578016189116`) still not resolved**: Remaining issue still appears to be loader interpretation and/or missing non-text asset hydration, not simply “needs reconversion”.

---

## Current Status (2026-03-18)

### ✅ Recent Changes (March 18, 2026)

1. **My Account session identity corrected - COMPLETE**
   - Replaced hardcoded account email in `AccountNav` with live `/api/auth/session` data.
   - Added `session-changed` refresh behavior so sidebar updates immediately after login/logout.
   - **File**: `components/AccountNav.tsx`.

2. **Default sample cards removed from My Account - COMPLETE**
   - Saved designs list now renders only persisted `/api/projects` records for the current account view.
   - Removed static dataset/fallback-card merge from active account card rendering.
   - **File**: `app/my-account/page.tsx`.

3. **Crop-to-render mismatch fixed for Add Your Image - COMPLETE**
   - Crop math now maps to the real `object-contain` image box (not full preview container).
   - Horizontal/vertical crop selections now align with headstone render output.
   - **Files**: `components/CropCanvas.tsx`, `components/ImageSelector.tsx`.

4. **Saved-design storage pipeline hardened - COMPLETE**
   - Fixed screenshot decode to support generic `data:image/*;base64,...` payloads.
   - Prevented empty image writes by validating screenshot buffers and using placeholder fallback when invalid.
   - Normalized saved screenshot/thumbnail public URLs to forward slashes.
   - Added path normalization in project DB mapping (`\` -> `/`) for persisted paths.
   - **Files**: `app/api/projects/route.ts`, `lib/fileStorage.ts`, `lib/projects-db.ts`.

5. **Saved Design PDF made print-friendly and quote-complete - COMPLETE**
   - Switched to white-background print layout and added full quote breakdown (line items + subtotal + GST + total).
   - Wired PDF generation to fetch project details and include `pricingBreakdown`.
   - Added richer detail sections for Additions, Motifs, and Inscriptions.
   - Added motif/addition thumbnails in both Check Price detail rows and PDF detail sections.
   - **Files**: `lib/pdf-generator.ts`, `lib/design-quote.ts`, `app/my-account/page.tsx`, `app/my-account/designs/[id]/page.tsx`, `app/check-price/_ui/CheckPriceGrid.tsx`.

6. **Save Design pricing parity aligned with Check Price - COMPLETE**
   - `DesignerNav` save flow now persists additions/motifs/inscriptions/subtotal/tax/total in `pricingBreakdown`.
   - Removed invalid payload fields (`catalog.material/shape/border`) from save request.
   - **File**: `components/DesignerNav.tsx`.

7. **Post-change regressions addressed - COMPLETE**
   - Fixed white saved thumbnails by improving canvas selection (largest non-blank canvas capture).
   - Fixed black-square motif thumbnails in PDF by preserving transparency (PNG raster path).
   - Improved Check Price thumbnail chip contrast for dark assets.
   - **Files**: `components/DesignerNav.tsx`, `lib/pdf-generator.ts`, `app/check-price/_ui/CheckPriceGrid.tsx`.

8. **Vercel Save Design reliability and preview rendering fixed - COMPLETE**
   - Save API now avoids filesystem writes on Vercel runtime and still persists project records.
   - For Vercel saves, `screenshotPath` and `thumbnailPath` are now stored as data URLs so cards do not fall back to `/screen.png`.
   - Save response parsing in `DesignerNav` now handles non-JSON error bodies safely and surfaces clearer diagnostics.
   - Client screenshot payload is downscaled/compressed before upload to reduce request-size failures.
   - **Files**: `app/api/projects/route.ts`, `components/DesignerNav.tsx`.

### ⚠️ Known Gaps (March 18, 2026)
- **TypeScript baseline**: `pnpm type-check` still fails because of unrelated existing issues, including `app/_internal/_data.ts`, `app/_ui/HomeSplash.tsx`, `app/api/motifs/db/route.ts`, `app/select-motifs/_ui/MotifSelectionGrid.tsx`, and multiple `archive/*` files.
- **Lint baseline**: `pnpm lint` remains unusable because the repository is on ESLint 9 without a matching `eslint.config.*` migration.
- **User re-save needed for legacy projects**: older saved records with incomplete historical pricing/asset data may require re-saving to fully reflect the latest PDF quote and thumbnail behavior.
- **Vercel preview persistence mode**: screenshots/thumbnails are intentionally stored as data URLs in DB on Vercel (instead of public filesystem paths) until durable object storage is introduced.
- **Saved Design 2 (`1578016189116`) still not resolved**: The remaining issue still appears to be loader interpretation and/or missing non-text asset hydration, not simply “needs reconversion”.

---

## Current Status (2026-03-17)

### ✅ Recent Changes (March 17, 2026)

1. **Full Monument headstone zoom now ends upright en face - COMPLETE**
   - `components/three/FullMonumentFit.tsx` now derives the zoom-in camera direction for `selected === 'headstone'` from the headstone object's world quaternion instead of using a generic static fallback angle.
   - Zooming in on the headstone now ends front-facing and upright, while zooming back out to the whole monument still preserves the user's current orbit direction.
   - **File**: `components/three/FullMonumentFit.tsx`.

2. **Blue Pearl full-monument granite response normalized across parts - COMPLETE**
   - Introduced `lib/granite-material.ts` as the shared polished-granite helper for texture setup and `MeshPhysicalMaterial` creation.
   - `LedgerSlab.tsx`, `KerbsetBorder.tsx`, and `HeadstoneBaseAuto.tsx` were aligned to the same calibrated polished-granite family so Blue Pearl no longer blows out on ledger/kerbset relative to the other monument parts.
   - The non-slant headstone was then brought back into the same calibrated range as ledger/base/kerbset after a brighter intermediate tuning pass made it stand out too much.
   - **Files**: `lib/granite-material.ts`, `components/three/headstone/LedgerSlab.tsx`, `components/three/headstone/KerbsetBorder.tsx`, `components/three/headstone/HeadstoneBaseAuto.tsx`, `components/SvgHeadstone.tsx`.

3. **Granite helper no longer emits undefined normal-map warnings - COMPLETE**
   - Fixed the runtime warning source in `lib/granite-material.ts`: optional `normalMap` and `normalScale` are now only passed into `THREE.MeshPhysicalMaterial` when actually defined.
   - This removes warnings such as:
     - `THREE.Material: parameter 'normalMap' has value of undefined`
     - `THREE.Material: parameter 'normalScale' has value of undefined`
   - **File**: `lib/granite-material.ts`.

4. **Full Monument camera focus now respects the actual selected surface - COMPLETE**
   - `components/three/FullMonumentFit.tsx` now keeps the close-up only for headstone-surface content selections.
   - Selecting inscriptions, motifs, images, or additions on the headstone keeps the headstone zoom active.
   - Selecting content on ledger or base no longer incorrectly triggers the headstone zoom.
   - Clicking monument parts still behaves as expected:
     - `Headstone` -> zoom in
     - `Base` / `Ledger` / `Kerbset` -> monument-part view
   - **File**: `components/three/FullMonumentFit.tsx`.

5. **Inscription duplication and reset behavior refined - COMPLETE**
   - Duplicated inscriptions on headstone/base now use the rendered inscription bounds via live refs instead of a loose canvas estimate, so the copied line lands directly below the source.
   - Fixed a unit mismatch where world-space measured height was being applied to local surface coordinates, which previously caused duplicates to overlap perfectly.
   - Removed the redundant extra green inscription `SelectionBox` from `HeadstoneAssembly.tsx`; the duplicate/selected inscription now shows only one correct outline.
   - `InscriptionEditPanel.tsx` now recenters a brand-new inscription (`yPos: 0`) whenever there is no active inscription selected, so after deleting all inscriptions the next new line starts centered again instead of reusing the old bottom position.
   - **Files**: `lib/headstone-store.ts`, `components/three/headstone/ShapeSwapper.tsx`, `components/three/headstone/HeadstoneBaseAuto.tsx`, `components/three/headstone/LedgerSurfaceContent.tsx`, `components/three/headstone/HeadstoneAssembly.tsx`, `components/InscriptionEditPanel.tsx`.

6. **Ledger-mounted statues/vases now stay ledger-scoped - COMPLETE**
   - `hasStatue()` in the store now expands the base only for base-mounted `statue` / `vase` additions, not for ledger-mounted ones.
   - `components/three/AdditionModel.tsx` ledger drag bounds were corrected to clamp in the ledger mesh's local coordinate system, so ledger statues/vases remain within the slab footprint front-to-back instead of sliding half off the ledger.
   - This avoids the single-headstone base-expansion side effect when adding a statue to the ledger of a full monument.
   - **Files**: `lib/headstone-store.ts`, `components/three/AdditionModel.tsx`.

7. **Validation status for this batch**
   - `pnpm build` succeeded after each shipped change set in this session.
   - `pnpm type-check` was not re-run after every follow-up because the repo still has unrelated baseline failures outside these files.

### ⚠️ Known Gaps (March 17, 2026)
- **TypeScript baseline**: `pnpm type-check` still fails because of unrelated existing issues, including `app/_internal/_data.ts`, `app/_ui/HomeSplash.tsx`, `app/api/motifs/db/route.ts`, `app/select-motifs/_ui/MotifSelectionGrid.tsx`, and multiple `archive/*` files.
- **Lint baseline**: `pnpm lint` remains unusable because the repository is on ESLint 9 without a matching `eslint.config.*` migration.
- **Pricing regression tests**: Full-monument and additions-related pricing behavior still relies heavily on manual regression after catalog, material, camera, or UI changes.
- **Saved Design 2 (`1578016189116`) still not resolved**: The remaining issue still appears to be loader interpretation and/or missing non-text asset hydration, not simply “needs reconversion”.

---

## Current Status (2026-03-16)

### ✅ Recent Changes (March 16, 2026)

1. **Full Monument camera + selection UX refined - COMPLETE**
   - `components/three/FullMonumentFit.tsx` now supports:
     - headstone-focused zoom-in,
     - slower animated transitions,
     - orbit-preserving zoom-out from headstone to whole-monument view,
     - suppression of camera moves during material application,
     - initial fit correction based on actual loaded monument bounds rather than trigger-only reruns.
   - Clicking `Headstone` still zooms in; clicking `Base`, `Ledger`, or `Kerbset` still zooms out.
   - Material application no longer forces the camera back to the front view while previewing granite from a custom orbit angle.
   - **Files**: `components/three/FullMonumentFit.tsx`.

2. **Monument-part clicks now retarget editing without changing sidebar section - COMPLETE**
   - `ShapeSwapper.tsx` and `HeadstoneAssembly.tsx` now set both `selected` and `editingObject` for `headstone`, `base`, `ledger`, and `kerbset`.
   - This keeps selection outlines and camera behavior working while leaving the user in the current panel (for example `Select Material`) instead of opening `Select Size`.
   - Full monuments still initialize with `editingObject = 'ledger'` and `selected = 'ledger'`.
   - **Files**: `components/three/headstone/ShapeSwapper.tsx`, `components/three/headstone/HeadstoneAssembly.tsx`.

3. **Ledger and Kerbset materials are now first-class targets - COMPLETE**
   - Added independent `ledgerMaterialUrl` and `kerbsetMaterialUrl` state and persistence.
   - Material UI now supports `Headstone`, `Base`, `Ledger`, and `Kerbset` targeting, and thumbnails/textures are normalized through `lib/material-utils.ts`.
   - `LedgerSlab.tsx` and `KerbsetBorder.tsx` now render their own materials rather than reusing base material state.
   - **Files**: `lib/headstone-store.ts`, `components/MaterialSelector.tsx`, `app/select-material/_ui/MaterialSelectionGrid.tsx`, `components/three/headstone/LedgerSlab.tsx`, `components/three/headstone/KerbsetBorder.tsx`, `lib/material-utils.ts`, serializer/check-price files.

4. **Database workflow moved away from Neon assumptions - COMPLETE**
   - `scripts/sync-to-neon.js` is now a generic remote sync script despite the legacy filename. It loads `.env.local`, backs up the local DB, drops remote tables, imports the dump, and verifies record counts.
   - Default remote target is now the `home.pl` PostgreSQL database, with env-driven overrides:
     - `DB_SYNC_TARGET_HOST`
     - `DB_SYNC_TARGET_PORT`
     - `DB_SYNC_TARGET_DATABASE`
     - `DB_SYNC_TARGET_USER`
     - `DB_SYNC_TARGET_PASSWORD`
     - `DB_SYNC_TARGET_SSL`
   - SQL cleanup now strips `\restrict`, `\unrestrict`, and `SET transaction_timeout = ...;` so imports work against PostgreSQL 13 on `home.pl`.
   - `home.pl` PostgreSQL was verified reachable externally, but it **does not support SSL**, so remote connection strings currently require `sslmode=disable`.
   - **Files**: `scripts/sync-to-neon.js`, `scripts/import-to-neon.js`.

5. **Vercel build OOM regression fixed - COMPLETE**
   - `ConditionalCanvas.tsx` now loads `ThreeScene` and `CropCanvas` with `next/dynamic(..., { ssr: false })`.
   - This prevents the heavy React Three Fiber scene from being rendered during static generation, which was the main Vercel build memory spike after the DB/camera work.
   - `pnpm build` now completes locally through static page generation after this change.
   - **File**: `components/ConditionalCanvas.tsx`.

6. **Account registration/login flow is now functional - COMPLETE**
   - Added `POST /api/auth/register` to create accounts, create the matching profile row, and sign the user in immediately.
   - `app/my-account/page.tsx` now posts the Register tab to `/api/auth/register` instead of incorrectly reusing `/api/auth/login`.
   - Important operational note: login/registration always uses whichever database `DATABASE_URL` points to. Localhost and remote deployments can therefore have different account data until explicitly synced or seeded.
   - **Files**: `app/api/auth/register/route.ts`, `app/my-account/page.tsx`.

7. **Saved-design canonical contract investigation advanced - PARTIAL**
   - `lib/saved-design-loader-utils.ts` now supports explicit canonical `scene.coordinateSystem` metadata instead of relying purely on source-directory heuristics.
   - `scripts/convert-legacy-design.js` and `scripts/convert-saved-design.js` now emit:
     - `positionMode`
     - `headstonePlacement`
     - `flipMode`
   - Re-generated the three manual regression samples:
     - `1725769905504`
     - `1578016189116`
     - `1723691641046`
   - Fixed a real loader bug where the canonical out-of-bounds fallback check was evaluated before the detector function was assigned, making the legacy fallback effectively unreachable.
   - Also confirmed that `scripts/convert-saved-design.js` writes to `public/designs/v2026/` rather than the runtime-loaded `public/canonical-designs/v2026/`.
   - **Files**: `lib/saved-design-loader-utils.ts`, `scripts/convert-legacy-design.js`, `scripts/convert-saved-design.js`, regenerated canonical JSON samples.

### ⚠️ Known Gaps (March 16, 2026)
- **TypeScript baseline**: `pnpm type-check` still fails because of unrelated existing issues, including `app/_internal/_data.ts`, `app/_ui/HomeSplash.tsx`, `app/api/motifs/db/route.ts`, `app/select-motifs/_ui/MotifSelectionGrid.tsx`, and multiple `archive/*` files.
- **Lint baseline**: `pnpm lint` remains unusable because the repository is on ESLint 9 without a matching `eslint.config.*` migration.
- **Pricing regression tests**: Full-monument and additions-related pricing behavior still relies heavily on manual regression after catalog, material, or UI changes.
- **home.pl SSL limitation**: The current remote PostgreSQL target rejects SSL connections, so Vercel/local connection strings need `sslmode=disable`. This is less robust than managed Postgres providers.
- **Legacy script naming**: `scripts/sync-to-neon.js` and `scripts/import-to-neon.js` still carry Neon-era filenames even though the logic is now generic and `home.pl`-oriented by default.
- **Saved Design 2 (`1578016189116`) still not resolved**: Re-running the converter and adding explicit canonical coordinate metadata did **not** eliminate the `screen.png` mismatch. The remaining problem appears to be loader interpretation and/or missing non-text asset hydration, not simply “needs reconversion”.
- **Canonical vs batch design outputs are still split**: `convert-legacy-design.js` updates `public/canonical-designs/v2026/`, while `convert-saved-design.js` writes to `public/designs/v2026/`. The batch output for Design 2 preserves `photos`, but the runtime loader is still pointed at the canonical path.

---

## Current Status (2026-03-13)

### ✅ Recent Changes (March 13, 2026)

1. **Additions panel size-variant UI restored - COMPLETE**
   - Re-aligned the selected-addition card in `components/DesignerNav.tsx` with the intended `ADDITION_SIZE_VARIANT_FIX.md` behavior.
   - Single-size additions now show a read-only dimensions summary instead of an unnecessary size slider.
   - Multi-size additions now use `sizeVariant` controls driven by the actual `addition.sizes.length`, rather than a hardcoded maximum.
   - This keeps the panel simpler and closer to the pre-regression UX while still exposing real catalog size choices where available.
   - **Files**: `components/DesignerNav.tsx`.

2. **Ledger statue/addition sizing and fallback metadata improved - COMPLETE**
   - Added fallback size metadata for `K0096` in `app/_internal/_additions-loader.ts` so the additions UI can resolve meaningful size data even when the parsed catalog payload is incomplete.
   - Updated `components/three/AdditionModel.tsx` so ledger-mounted statues/vases use catalog-driven physical size data (mm converted to metres) instead of oversized raw model bounds.
   - The catalog-height scaling was then scoped back to `surface === 'ledger'` only so base/headstone additions would not inherit the oversized or invisible behavior.
   - **Files**: `app/_internal/_additions-loader.ts`, `components/three/AdditionModel.tsx`.

3. **React 19 ledger hydration mismatch fixed - COMPLETE**
   - **Root cause**: `components/three/headstone/LedgerSurfaceContent.tsx` returned `null` before the ledger mesh was ready, then later swapped in multiple `React.Suspense` children once `useFrame` detected the mesh. Under React 19 hydration this could produce the runtime error: `There should always be an Offscreen Fiber child in a hydrated Suspense boundary.`
   - **Fix**: Kept the outer ledger content group stable from the first render and gated only the inner mapped children once the mesh becomes ready.
   - This preserves the server/client tree shape during hydration and keeps ledger creative content mount timing predictable.
   - **File**: `components/three/headstone/LedgerSurfaceContent.tsx`.

4. **Base statue/vase targeting regression fixed (local-to-parent coordinate conversion) - COMPLETE (visual verification still pending)**
   - `HeadstoneBaseAuto.tsx` already writes its live mesh ref into the store via a layout effect so `AdditionModel` can access the base geometry even when Suspense delays mount timing.
   - **Confirmed root cause**: base-targeted additions were being positioned using coordinates derived in the base mesh's local space, but the final render group in `AdditionModel.tsx` was treating those values as if they were already in the parent monument space.
   - **Fix**: added an explicit base-mesh local -> world -> parent conversion before assigning `groupPosition` for `surface="base"`, so statues and vases inherit the base slab transform instead of rendering offset toward the upright.
   - `pnpm build` succeeds after the change. `pnpm type-check` still fails only because of unrelated baseline issues elsewhere in the repository (including `components/DesignerNav.tsx` and `archive/*`).
   - **Files**: `components/three/AdditionModel.tsx`, `components/three/headstone/HeadstoneBaseAuto.tsx`, `lib/headstone-store.ts`.

### ⚠️ Known Gaps (March 13, 2026)
- **Base additions need visual re-check**: The base-space/parent-space transform bug has been fixed in `components/three/AdditionModel.tsx`, but the change still needs in-app visual confirmation against the latest `screen.png` regression scenario.
- **TypeScript baseline**: `pnpm type-check` still fails because of pre-existing errors, most notably in `components/DesignerNav.tsx` (`TS2554`, missing `CatalogData.material`, `shape`, `border`).
- **Lint baseline**: `pnpm lint` remains unusable because the repository is on ESLint 9 without a matching `eslint.config.*` migration.
- **Registration flow**: `/api/auth/register` now exists, but sub-page auth guards still need a fuller pass.
- **Pricing regression tests**: Full-monument and additions-related pricing behavior still relies heavily on manual regression after catalog or UI changes.

---

## Current Status (2026-03-12)

### ✅ Recent Changes (March 12, 2026)

1. **Ledger Panel creative tooling — positioning fixes - COMPLETE**
   - **Root cause**: `LedgerSlab` uses a unit-cube `RoundedBoxGeometry(1,1,1)` with mesh `scale` lerped to actual dimensions. All four content components (`HeadstoneInscription`, `MotifModel`, `ImageModel`, `AdditionModel`) were using `stone.geometry.boundingBox` (always `±0.5` in geometry space) instead of `stone.position + stone.scale/2` for actual monument-local bounds. This caused content to render at `Y ≈ 0.5` (half a metre above the floor) instead of on top of the real ledger slab. Drag fallback planes were also at the wrong Y, causing click-to-place to fail when clicking off the ledger edge.
   - **Fix 1 — Positioning**: Replaced `bbox.max.y` / `ledgerCenterZ` / `centerX` (geometry space) with `stone.position.y + stone.scale.y/2`, `stone.position.z`, `stone.position.x` in all four components for the `isLedgerSurface` branch.
   - **Fix 2 — Scale conversion**: Stored `xPos`/`yPos` offsets come from `stone.worldToLocal()` on the unit-cube mesh, so they are fractional (±0.5). The render path now multiplies them by `stone.scale.x` / `stone.scale.z` to convert to monument-local metres before setting `groupPosition`.
   - **Fix 3 — Fallback planes**: All four drag handlers now compute `topY = stone.position.y + stone.scale.y / 2` for the horizontal fallback `THREE.Plane`, so clicking off the ledger edge still places items on the correct surface.
   - **Fix 4 — Initial render**: `LedgerSurfaceContent` was returning `null` when `ledgerRef.current` was null (first render, before commit), and there was no subsequent trigger to re-render — meaning saved designs with ledger content never appeared on load. Added a `useFrame` hook that sets `meshReady = true` as soon as the ledger mesh mounts, releasing the null guard.
   - **Files**: `components/three/headstone/LedgerSurfaceContent.tsx`, `components/HeadstoneInscription.tsx`, `components/three/MotifModel.tsx`, `components/three/ImageModel.tsx`, `components/three/AdditionModel.tsx`.

2. **Full Monument — Ledger/Kerbset Z-positioning (start at Base front face) - COMPLETE**
   - **Root cause**: `LedgerSlab` and `KerbsetBorder` computed their Z start as `-(uprightThickness/2000)` — the base's *back* face — causing them to overlap (clip through) the entire base volume.
   - **Fix**: Changed `standBackZ` in both components to `-(uprightThickness/2000) + baseThickness/1000`, i.e., the base *front* face. Both components now read `baseThicknessMm` from the store (`stand.initDepth`), which is the base's depth in mm.
   - **Files**: `components/three/headstone/LedgerSlab.tsx`, `components/three/headstone/KerbsetBorder.tsx`.

3. **Full Monument — Arrow-key rotation pivot fixed - COMPLETE**
   - **Root cause**: In `Scene.tsx`, the `useFrame` rotation set `groupRef.rotation.y = angle`, rotating around world origin `[0,0,0]`. The monument visual center is at `Z ≈ -(ledgerDepth/1000)*0.55` due to the `zGroupOffset` applied in `HeadstoneAssembly`. OrbitControls already used the correct `orbitTarget = [0, 0.8, -(ledgerDepthMm/1000)*0.55]` — arrow keys did not.
   - **Fix**: Added pivot-corrected position offsets in `useFrame` for full-monument products:
     - `group.position.x = -pivotZ * sin(angle)`
     - `group.position.z = pivotZ * (1 - cos(angle))`
     - where `pivotZ = orbitTarget[2] = -(ledgerDepthMm/1000)*0.55`
   - **File**: `components/three/Scene.tsx`.

4. **Full Monument — Width sync across Base / Ledger / Kerbset - COMPLETE**
   - **Business rule** (from legacy code): `kerbsetWidth = baseWidth` (same), `ledgerWidth = baseWidth - 200mm`.
   - Added `FULL_MONUMENT_WIDTH_DIFF = 200` constant to `lib/headstone-constants.ts`.
   - Fixed four setters in `lib/headstone-store.ts`:
     - `setBaseWidthMm`: sets kerb = base, ledger = base − 200
     - `setKerbWidthMm`: sets base = kerb, ledger = kerb − 200
     - `setLedgerWidthMm`: sets base = ledger + 200, kerb = ledger + 200
     - `setWidthMm` (headstone): when headstone widens past base, sets base = headstone+200, kerb = headstone+200, ledger = headstone
   - **Files**: `lib/headstone-store.ts`, `lib/headstone-constants.ts`.

5. **Full Monument — Height sync across Base / Kerbset - COMPLETE**
   - **Business rule** (from legacy code): `baseHeight = kerbHeight + 100mm` (diff/2 where legacy diff=200).
   - Catalog confirms: stand `init_height=350`, kerb `init_height=250` — exactly 100mm apart.
   - Added `FULL_MONUMENT_HEIGHT_DIFF = 100` constant to `lib/headstone-constants.ts`.
   - Fixed two setters in `lib/headstone-store.ts`:
     - `setBaseHeightMm`: also sets kerbHeightMm = base − 100 (floored at 50mm)
     - `setKerbHeightMm`: derives base = kerb + 100 (clamped to catalog min/max), then sets kerb = clamped_base − 100
   - **Files**: `lib/headstone-store.ts`, `lib/headstone-constants.ts`.

6. **Full Monument — Additions now render on Base and Ledger - COMPLETE**
   - **Bug 1 — Base**: `HeadstoneBaseAuto.tsx` had zero `AdditionModel` rendering (inscriptions and motifs were present, additions were not). Added `AdditionModel` import, `selectedAdditions`/`additionOffsets` store selectors, and a rendering block that filters for `targetSurface === 'base'`.
   - **Bug 2 — Targeting**: `addAddition()` in the store used `s.selected` to determine `targetSurface`. When the user opened the Additions full-screen panel, route-level effects could reset `selected` to `'headstone'` even if the user was editing the ledger. Fixed by using `s.editingObject` (which persists through panel navigation) as primary, with `s.selected` as fallback.
   - **Files**: `components/three/headstone/HeadstoneBaseAuto.tsx`, `lib/headstone-store.ts`.

---

## Current Status (2026-03-11)

### ✅ Recent Changes (March 11, 2026)

1. **Laser Full Monument camera + refresh stability - COMPLETE**
   - **Context**: After visiting Select Product/Shape or reloading, the AutoFit camera regularly drifted to a top-down sky view for the Laser Etched Black Granite Full Monument.
   - **Fix**: Added a runtime Box3-driven fitting tick that re-runs `FullMonumentFit` (and `Scene.tsx` orbit target updates) whenever product, shape, or ledger toggles change. The grave plot now stays centered after every navigation hop.
   - **Files**: `components/three/FullMonumentFit.tsx`, `components/three/headstone/HeadstoneAssembly.tsx`, `components/three/headstone/ShapeSwapper.tsx`, `components/Scene.tsx`.

2. **Select Size sidebar launch from canvas clicks - COMPLETE**
   - **Root cause**: Clicking the 3D meshes used to set selection state but no longer opened the Select Size panel once the fullscreen flow was refactored.
   - **Fix**: Introduced `useSelectSizePanelOpener` and wired headstone/base/ledger/kerbset mesh `onClick` handlers (plus DesignerNav tab changes) to dispatch the fullscreen panel open event and keep router navigation in sync.
   - **Files**: `lib/useSelectSizePanelOpener.ts`, `components/three/headstone/HeadstoneAssembly.tsx`, `components/three/headstone/ShapeSwapper.tsx`, `components/DesignerNav.tsx`.

3. **Ledger/Kerb data now included in Check Price + Save Design - COMPLETE**
   - Added ledger/kerb visibility flags, dimensions, and pricing models to the store, serializer, and pricing helpers so totals reflect all monument parts.
   - UI now renders ledger/kerb line items with correct catalog IDs, and `project-serializer.ts` persists the additional dimensions/editing target so reopening a saved design restores the ledger state.
   - **Files**: `lib/headstone-store.ts`, `lib/project-serializer.ts`, `lib/project-schemas.ts`, `lib/saved-design-loader-utils.ts`, `components/DesignerNav.tsx`, pricing helpers in `lib/pricing/*`.

4. **Ledger surface creative tooling - COMPLETE**
   - `LedgerSurfaceContent.tsx` renders ledger-targeted inscriptions, motifs, images, and additions using a faux HeadstoneAPI derived from the ledger mesh.
   - Each creative component understands `surface="ledger"`: we clamp to ledger width/depth, rotate assets -90° to lie flat, and serialize offsets in ledger space. Store APIs now default to ledger when the Ledger tab is active.
   - **Files**: `components/three/headstone/LedgerSurfaceContent.tsx`, `components/HeadstoneInscription.tsx`, `components/three/MotifModel.tsx`, `components/three/ImageModel.tsx`, `components/three/AdditionModel.tsx`, `lib/headstone-store.ts`.

5. **Selection overlays + picker cursor polish - COMPLETE**
   - `SelectionBox` now scales handle geometry using `headstone.unitsPerMeter`, preventing gigantic outlines when editing ledger assets.
   - Converted ledger image placement math from mm → local units so Ceramic Images land on the slab at the expected size.
   - Updated global cursor rules plus the Select Product/Shape grids so hovering any image tile shows the hand cursor, signaling that each card is clickable.
   - **Files**: `components/SelectionBox.tsx`, `components/three/ImageModel.tsx`, `styles/globals.css`, `app/select-product/_ui/ProductSelectionGrid.tsx`, `app/select-shape/_ui/ShapeSelectionGrid.tsx`.

### ⚠️ Known Gaps (March 11, 2026)
- **Registration flow**: `/api/auth/register` now exists, but sub-page auth guards still need a fuller pass.
- **TypeScript baseline**: `pnpm run type-check` fails due to pre-existing errors; we haven’t addressed them yet this cycle.
- **Pricing regression tests**: Ledger/Kerb totals were added, but automated coverage is still missing—manual regression is required after catalog changes.

---

## Current Status (2026-03-10)

### ✅ Recent Changes (March 10, 2026)

1. **Full Monument — SelectionBox Outlines for Ledger & Kerbset - COMPLETE**
   - **Root cause**: Click handlers in `HeadstoneAssembly.tsx` called `setSelected('headstone')` for both Ledger and Kerbset meshes; additionally `DesignerNav.tsx` had a `useEffect` that silently overrode any `selected` value back to `'headstone'` on the select-size page.
   - **Part type extended** (`lib/headstone-store.ts` line 77): `'headstone' | 'base' | 'ledger' | 'kerbset' | null`
   - **Click handlers fixed** (`HeadstoneAssembly.tsx`): Kerbset mesh calls `setSelected('kerbset')`, Ledger mesh calls `setSelected('ledger')`.
   - **`RotatingBoxOutline` components added** for both Ledger and Kerbset (outside the assemblyRef group, same level as the meshes). Constants: `ledgerOutlinePad=0.004`, `ledgerOutlineDepthPad=0.002`, `kerbsetOutlinePad=0.005`, `kerbsetOutlineDepthPad=0.003`.
   - **DesignerNav tab handler fixed** (~line 1475): now calls `setSelected(value)` for all four tabs instead of just headstone/base.
   - **DesignerNav useEffect sync fixed** (~lines 1113–1122): was mapping everything except `'base'` to `'headstone'`, immediately overriding ledger/kerbset selections. Now maps all four values correctly.

2. **Full Monument — Ledger Slab Positioned on Top of Kerbset - COMPLETE**
   - **Root cause**: `LedgerSlab.tsx` positioned the flat slab at `Y = ledgerHeightMm/2` (ground level), meaning it phased through the kerbset border.
   - **Fix** (`components/three/headstone/LedgerSlab.tsx`): Added `kerbHeightMm` from the store. Ledger Y is now `kerbHeightMm/1000 + ledgerHeightMm/2` so it rests on top of the kerbset border (default: 0.3 m above ground).

3. **Full Monument — Assembly Z-Offset - COMPLETE**
   - The whole assembly group (`<group position={[0, 0, zGroupOffset]}>` in `HeadstoneAssembly.tsx`) is shifted by `-(ledgerDepthMm/1000)` in Z for full-monument products, moving the ledger/kerbset away from the camera and aligning the headstone at the back of the grave plot.

4. **Full Monument — Dedicated Camera Fit (`FullMonumentFit`) - COMPLETE**
   - **New file**: `components/three/FullMonumentFit.tsx`
   - Computes the world-space bounding box of the complete grave plot (headstone + base + kerbset + ledger) from store dimensions and positions the camera at a fixed elevated-front offset (`aboveCenter=1.4 m`, `inFrontOfCenter=1.8 m` relative to the grave-plot centre). No FOV/radius math — easy to tune by changing two constants.
   - Re-fires via `useLayoutEffect` whenever any monument dimension changes.
   - **ShapeSwapper.tsx** updated: renders `<FullMonumentFit />` when `catalog.product.type === 'full-monument'`; renders `<AutoFit>` for all other product types. AutoFit is unchanged and continues to work correctly for headstones.
   - **`AutoFit.tsx`** kept at its pre-session state (original front-on headstone fit, debug `console.log` removed).
   - **`Scene.tsx`**: Dynamic `orbitTarget` (`[0, 0.8, -(ledgerDepthMm/1000)*0.55]` for full-monument; `[0, 3.8, 0]` otherwise) and relaxed `minPolarAngle` for full-monument added as complementary controls.

### ⚠️ Known Gaps (March 10, 2026)
- **Full Monument pricing**: `catalog.product.ledgerPriceModel` and `kerbsetPriceModel` are parsed from XML but not yet included in the price total (`DesignerNav.tsx` ~line 1152 only sums `headstonePrice + basePrice`).
- **Registration flow**: `/api/auth/register` now exists, but account-area coverage is still incomplete.

---

## Current Status (2026-03-07)

### ✅ Recent Changes (March 7, 2026)
1. **Seed Materials API Route Import Fix - COMPLETE**
   - **Root cause**: `next build` on Vercel escalated the long-standing warning in `app/api/seed-materials/route.ts` into a hard failure because webpack couldn't resolve `db` from the bare alias `#/lib/db`.
   - **Fix**: Updated the route to import from `#/lib/db/index`, matching every other API route that uses the Drizzle connection exported there.
   - **Verification**: Local `pnpm run build` now passes and Vercel no longer aborts during the API bundling stage.

2. **Cross-Platform Build Script Update - COMPLETE**
   - **Root cause**: The build script relied on the POSIX-only syntax `NODE_OPTIONS='--max-old-space-size=4096' next build`, which fails on Windows shells.
   - **Fix**: Added `cross-env` as a dev dependency and switched the script to `cross-env NODE_OPTIONS=--max-old-space-size=4096 next build` so the environment variable is set consistently across operating systems.
   - **Verification**: `pnpm run build` succeeds on Windows (and Linux/macOS) while still honoring the 4 GB heap cap that prevents OOMs on Vercel.

### ⚠️ Known Gaps (March 7, 2026)
- **Full Monument designer tabs**: Ledger and Kerbset dimension tabs still aren't wired into the pricing logic.
- **Registration flow**: `/api/auth/register` now exists, but auth/authorization coverage outside the main gate still needs work.

---

## Current Status (2026-03-06)

### ✅ Recent Changes (March 6, 2026)

1. **Full Monument — Base / Ledger / Kerbset Now Rendering - COMPLETE**
   - **Root cause**: `showBase` was gating on `productType === 'monument'`, which excluded `'full-monument'`. Fixed in `lib/headstone-store.ts` to accept both values.
   - **New components**:
     - `components/three/headstone/LedgerSlab.tsx` — flat granite slab rendered on the ground plane at the correct Z position relative to the headstone's back face
     - `components/three/headstone/KerbsetBorder.tsx` — hollow rectangular frame rendered around the kerbset perimeter
   - **Store extensions** (`lib/headstone-store.ts`):
     - `editingObject` type now accepts `'ledger'` and `'kerbset'` in addition to `'headstone'` and `'base'`
     - New fields: `ledgerWidthMm`, `ledgerDepthMm`, `ledgerHeightMm`, `kerbWidthMm`, `kerbDepthMm`, `kerbHeightMm`, `kerbThicknessMm`
     - `setProductId()` reads the `<lid>` and `<kerb>` XML elements and seeds the initial dimensions
   - **HeadstoneAssembly.tsx**: Conditionally renders `<LedgerSlab>` and `<KerbsetBorder>` outside the upright stone group at world Y=0
   - **DesignerNav.tsx**: When `productType === 'full-monument'`, shows 4 tabs — Headstone, Base, Ledger, Kerbset — each controlling the relevant dimensions
   - **XML mapping** (catalog-id-100.xml): `table` = headstone, `stand` = base, `lid` = ledger, `kerb` = kerbset, `base` = deprecated (all 1s)

2. **Vercel Build OOM Fix — `saved-designs-data` Dynamic Import Refactor - COMPLETE**
   - **Root cause**: `lib/saved-designs-data.ts` is a 2.7 MB static TypeScript module with 3,114 designs. During `next build`'s static page generation phase, multiple SSG workers are spawned. Any route whose module (or its SSR-rendered client components) has a **top-level static import** of `saved-designs-data.ts` forces every SSG worker to load the full dataset into RAM. With 4 parallel workers on Vercel's 8 GB container, this triggers an OOM SIGKILL.
   - **Fix applied to all affected files** — static `import { ... } from '#/lib/saved-designs-data'` replaced with `await import('#/lib/saved-designs-data')` inside async function bodies (server components) or `import('#/lib/saved-designs-data').then(...)` inside `useEffect` (client components):
     - `app/designs/page.tsx` — added `export const dynamic = 'force-dynamic'`; uses `PRODUCT_STATS`/`CATEGORY_STATS` (lightweight, not the full array)
     - `app/designs/DesignsPageClient.tsx` — dynamic import inside `useEffect`
     - `app/designs/[productType]/page.tsx` — `await import()` inside `generateMetadata`
     - `app/designs/[productType]/ProductPageClient.tsx` — dynamic import inside `useEffect`
     - `app/designs/[productType]/[category]/page.tsx` — `await import()` inside `generateMetadata`
     - `app/designs/[productType]/[category]/CategoryPageClient.tsx` — dynamic import inside `useEffect`
     - `app/designs/[productType]/[category]/[slug]/page.tsx` — `await import()` inside both `generateMetadata` and the default export function
     - `app/my-account/page.tsx` — `import type { SavedDesignMetadata }` (type-only, zero runtime cost) + `import().then()` inside `useEffect` to populate state
   - **Also fixed**: `public/sitemap.xml` deleted (conflicted with `app/sitemap.ts`); `app/sitemap.ts` now has `export const dynamic = 'force-dynamic'`

3. **Vercel Build Prerender Fix — my-account `projectCards` Error**
   - An edit that removed the `getAllSavedDesigns()` call from the render body accidentally concatenated a `// comment` with `const projectCards = ...` onto one line, making `projectCards` a comment and causing `ReferenceError: projectCards is not defined` during SSR prerendering.
   - Fixed by restoring the newline separator. The page now prerenders cleanly with `allDesigns` starting as `[]` and populating client-side via the `useEffect` dynamic import.

### ⚠️ Known Gaps (March 6, 2026)
- **`app/api/seed-materials/route.ts`**: Emits a build warning — `'db' is not exported from '#/lib/db'`. Non-fatal (dev utility route only), doesn't block the build. _(Resolved March 7 — see Current Status above.)_
- **Full Monument designer tabs**: Ledger and Kerbset size tabs appear but dimensions are not yet connected to pricing.
- **Register endpoint**: `/api/auth/register` not yet created (AuthGate register tab present).

---

## Current Status (2026-03-05)

### ✅ Recent Changes (March 5, 2026)
1. **Authentication System - COMPLETE**
   - **Real JWT auth** replacing mocked auth: `lib/auth/session.ts` fully rewritten using `jose` (edge-compatible JWT library, v6.2.0)
   - **Session cookie**: httpOnly, secure in prod, sameSite lax, 7-day max age, cookie name `session`
   - **`SESSION_SECRET`** env var required (added to `.env.local` and `.env.local.example`)
   - **API endpoints**:
     - `POST /api/auth/login` — bcrypt password verify, JWT cookie set, `lastLoginAt` updated
     - `POST /api/auth/logout` — clears session cookie
     - `GET /api/auth/session` — returns `{ session }` or 401
   - **Test user**: `admin@forevershining.com` / `admin123` (role: admin) — seeded via `scripts/seed-test-user.mjs`
   - **Middleware** (`middleware.ts`): Protects only `/api/account/*` and `/api/orders/*`; `/my-account` pages handle auth inline
   - **Files**: `lib/auth/session.ts`, `app/api/auth/login/route.ts`, `app/api/auth/logout/route.ts`, `app/api/auth/session/route.ts`, `scripts/seed-test-user.mjs`

2. **My Account Auth Gate**
   - `/my-account` page shows **login/register tabs** when not logged in (no redirect)
   - When logged in, shows Saved Designs content with session email in header
   - Session state: `undefined` = loading, `null` = not logged in, object = logged in
   - Logout redirects back to `/my-account` which then shows the login/register gate
   - `session-changed` custom event triggers re-check without page reload (sidebar + page stay in sync)
   - **Save Design** button checks auth before opening modal; redirects to `/my-account` if not logged in
   - **Files**: `app/my-account/page.tsx`, `components/DesignerNav.tsx`

3. **Context-Aware Sidebar Navigation**
   - `ConditionalNav.tsx` fetches `/api/auth/session` when on account routes
   - Not logged in on `/my-account` → shows `DesignerNav` (same as designer mode)
   - Logged in → shows `AccountNav`
   - Switches instantly on login/logout via `session-changed` event (no page reload)
   - **Files**: `components/ConditionalNav.tsx`

4. **Security Audit Fixes**
   - **Path traversal**: Segment sanitization in `/api/motifs/[...path]/route.ts`; integer-only `designId` in `/api/cache-svg/route.ts`
   - **Share email**: Returns 501 Not Implemented instead of fake 200
   - **ID collisions**: `genId`/`genMotifId` in headstone-store now use `crypto.randomUUID()`
   - **DB indexes**: Added 11 indexes on FK columns in `lib/db/schema.ts`
   - **Console.logs**: Removed unguarded debug logs from store and API routes
   - **404 page**: `app/not-found.tsx` replaced with proper dark-themed page
   - **resetDesign()**: Now resets all fields including `editingObject`, `showBase`, `showInscriptionColor`, `selectedImageId`, `cropCanvasData`, `selectedImages`

5. **PDF Generator Redesign**
   - Dark-themed PDF matching View Details page aesthetics
   - `generateDesignPDF({ title, screenshot, priceLabel, createdLabel, description, productName })`
   - Must be called client-side only (uses DOM APIs)
   - **File**: `lib/pdf-generator.ts`

6. **AccountNav Improvements**
   - **New Design** button calls `resetDesign()` then navigates to `/select-size` (canvas reset, last product kept)
   - **Logout** dispatches `session-changed` event only — no `router.push` (avoids race condition where navigation would skip the event listener). Page and sidebar update in-place.
   - **File**: `components/AccountNav.tsx`

7. **Logout Race Condition Fix**
   - **Problem**: After logout, the Saved Designs list stayed visible instead of switching to login/register gate.
   - **Root cause**: `router.push('/my-account')` fired immediately after `session-changed`, causing a navigation that potentially bypassed the event listener on the page.
   - **Fix**: Removed `router.push` from `handleLogout`. Since the user is already on `/my-account`, the `session-changed` event alone triggers `checkSession()` → sets `session = null` → renders `AuthGate`.
   - **File**: `components/AccountNav.tsx`

8. **Vercel Build Fixes**
   - **pnpm lockfile out of sync**: `jose@6.2.0` was installed but not in `pnpm-lock.yaml`. Fixed by running `pnpm install` locally and committing the updated lockfile.
    - **OOM (Out of Memory) build kill**: Build container ran out of 8 GB RAM. Fixed by adding `NODE_OPTIONS='--max-old-space-size=4096'` to the build script in `package.json`.
      - _Update (March 7, 2026):_ `cross-env` now wraps the build script so Windows developers can set `NODE_OPTIONS` identically.
   - **38-minute build**: After OOM fix, `config.cache = false` (added to reduce memory) backfired — it disabled webpack's filesystem cache, forcing full recompilation of Three.js/R3F/etc. on every build. Fixed by removing `cache = false` and instead setting `config.parallelism = 2` to limit concurrent module compilation.
   - **Files**: `package.json`, `next.config.ts`, `pnpm-lock.yaml`

9. **Remote PostgreSQL Setup (current target: `home.pl`)**
   - **Current direction**: production/staging DB work is now oriented around the externally reachable `home.pl` PostgreSQL instance rather than Neon.
   - **`db:sync`** now targets the configured remote database and imports local dumps after stripping commands unsupported by PostgreSQL 13.
   - **Credentials model**: the sync script defaults to `home.pl`, but remote host/database/user/password/SSL are all overridable via env vars.
   - **`SESSION_SECRET` required on Vercel**: Must be set as a Vercel environment variable. Without it, `lib/auth/session.ts`'s `getSecret()` throws and login returns 500.

### ⚠️ Known Gaps (March 5, 2026)
- **Sub-page auth gates**: `/my-account/details`, `/my-account/invoice`, `/my-account/designs/[id]`, etc. don't yet have a full auth/authorization pass
- **Sub-page auth gates**: `/my-account/details`, `/my-account/invoice`, `/my-account/designs/[id]`, etc. don't guard against unauthenticated access
- **Email sharing**: Returns 501 — needs real SendGrid/Resend implementation
- **Orders page**: `/my-account/orders` linked from AccountNav but page doesn't exist yet
- **Remote account parity**: `db:sync` copies local DB contents to the remote DB, but local and remote accounts can drift whenever either side is seeded manually afterward.
- **Legacy naming**: Some helper scripts and notes still use "neon" naming even though the live remote target has moved.

### 🔑 Vercel Environment Variables Required
| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Active PostgreSQL connection string (local or remote) |
| `SESSION_SECRET` | JWT signing secret (any long random string) |

---

## Current Status (2026-03-02)

### ✅ Recent Changes (March 2, 2026)
1. **Materials Database Migration - COMPLETE**
   - **Issue Fixed**: Database contained wrong placeholder materials (Polished Black Granite, Luka Grey, etc.)
   - **Solution**: Replaced with correct 29 granite materials from `app/_internal/_data.ts`
   - **Texture Paths**: All materials now point to `/textures/forever/l/*.webp`
   - **Seeding Script**: `scripts/seed-materials.ts` with dotenv loading
   - **Materials Seeded**:
     - African Black, African Red, Australian Calca, Australian Grandee
     - Balmoral Green, Balmoral Red, Blue Pearl, Chinese Calca
     - Darwin Brown, Emerald Pearl, English Brown
     - G439, G623, G633, G654, G788, G9426
     - Glory Gold Spots, Glory Black
     - Imperial Red, Marron Brown, Multicolour Red
     - Noble Black, Noble Red, Paradiso, Sandstone
     - Sapphire Brown, Visage Blue, White Carrara
   - **Database Schema**:
     ```typescript
     materials {
       id: serial
       slug: text (unique)
       name: text
       category: 'granite'
       finish: 'polished'
       thumbnailUrl: text
       attributes: jsonb ({ textureUrl: '...' })
       isActive: boolean
     }
     ```
   - **Files Created**:
     - `scripts/seed-materials.ts`
     - `MATERIALS_DATABASE_FIX.md`
   - **NPM Script**: `npm run db:seed-materials`

2. **Shapes Database Migration - COMPLETE**
   - **Issue Fixed**: Database contained wrong placeholder shapes (Oval Landscape, Heart Classic, etc.)
   - **Solution**: Replaced with correct 55 headstone shapes from `app/_internal/_data.ts`
   - **Shape Paths**: All shapes now point to `/shapes/headstones/*.svg`
   - **Seeding Script**: `scripts/seed-shapes.ts` with dotenv loading
   - **Shapes Seeded**:
     - **Traditional (11)**: Cropped Peak, Curved Gable, Curved Peak, Curved Top, Half Round, Gable, Left Wave, Peak, Right Wave, Serpentine, Square
     - **Modern (44)**: Headstone 1-39, Guitar 1-5 (guitar-shaped memorials)
   - **Database Schema**:
     ```typescript
     shapes {
       id: serial
       slug: text (unique)
       name: text
       section: text ('traditional' | 'modern')
       maskKey: text (filename without .svg)
       previewUrl: text
       attributes: jsonb ({ svgPath: '...', category: '...' })
       isActive: boolean
     }
     ```
   - **Files Created**:
     - `scripts/seed-shapes.ts`
     - `SHAPES_DATABASE_FIX.md`
   - **NPM Script**: `npm run db:seed-shapes`

### ✅ Recent Changes (February 28, 2026)
1. **Additions Migration to PostgreSQL - COMPLETE**
   - **XML Parsing System**: Created custom regex-based parser for `public/xml/en_EN/motifs-biondan.xml`
     - Extracts all product data including size variants, dimensions, pricing
     - Handles duplicate IDs by appending suffixes (e.g., `B2581S_2`, `B2581S_3`)
     - Outputs structured JSON with all addition metadata
   
   - **Database Schema**: Added `additions` table to PostgreSQL
     - Columns: id, name, type, categoryId, categoryName, thumbnailUrl, model3dUrl
     - **sizes**: JSONB column storing array of size variants with:
       - variant (1-4), code, width/height/depth (mm), weight (kg)
       - availability flag, wholesale/retail pricing, notes
     - Indexes and timestamps for efficient querying
   
   - **Migration Scripts**: Created automated seeding pipeline
     - `scripts/parse-additions-xml.ts`: XML → JSON converter
     - `scripts/seed-additions.ts`: PostgreSQL seeder with direct connection
     - Seeded 82 additions across 5 categories
   
   - **Data Statistics**:
     - **Total**: 82 additions migrated
     - **Categories**: Biondan Bronze (24), Crosses (13), Roses (24), Statues (11), Vases (10)
     - **Size Variants**: 60 single-size (73%), 22 multi-size (27%), max 4 variants
     - **Example**: B2225 has 2 sizes (100×100×20mm @ $131.74, 140×140×20mm @ $162.79)
   
   - **Next Steps**: Update DesignerNav size slider to:
     - Fetch selected addition's data from database
     - Show only available size variants (not generic 1-4)
     - Display actual dimensions (e.g., "100×100mm", "140×140mm")
     - Update pricing based on selected size variant
   
   - **Files Created**:
     - `scripts/parse-additions-xml.ts`, `scripts/seed-additions.ts`
     - `data/additions-parsed.json` (82 additions with full metadata)
     - `ADDITIONS_MIGRATION_COMPLETE.md` (comprehensive documentation)
   
   - **Files Modified**:
     - `lib/db/schema.ts`: Added additions table schema
     - `drizzle/0001_kind_wide_pack.sql`: Migration SQL

### ✅ Recent Changes (February 27, 2026)
1. **My Account Page - Complete Redesign**
   - **Redesigned More Popup** - Comprehensive design quote modal
     - Wider layout (max-w-4xl) for better content display
     - Clickable thumbnail preview opens full-resolution image in separate modal
     - Embedded HTML quote iframe showing detailed product table
     - Share options at top (Email, URL, Facebook, Twitter/X, LinkedIn) in horizontal bar
     - Action buttons: Export PDF, Edit Design, Buy Now, Delete, Close (all in one row)
     - Modal height reduced by 15% for more compact display
     - Delete button moved after Buy Now, Close button at end with ml-auto
     - No backdrop blur (changed to simple 90% black overlay for performance)
   
   - **Thumbnail Display** - Real-size thumbnails in list and modals
     - Thumbnails show at natural size (no oversizing/stretching)
     - List view uses `thumbnailPath` field from database
     - Full screenshot displayed only in preview modal
     - Centered thumbnail in More popup with hover effect
   
   - **HTML Quote Generation** - Detailed product breakdown
     - **NO screenshots** in HTML - only product table
     - Main product row: Product ID, name, shape, material, size
     - Motif rows: Each motif with file name, color (marked as included)
     - Image rows: Each photo/ceramic with size
     - Inscription rows: Each text with font, size, color, character count
     - Total row with final price sum
     - Dark gradient background matching popup (`linear-gradient(to bottom right, #1a1410, #0f0a07)`)
     - White text throughout for consistency with app theme
     - Responsive table design with mobile-friendly styles
   
   - **Screenshot Generation System**
     - Canvas screenshot captured during save
     - Thumbnail generated (300x200px max) using Sharp library
     - Both stored in year/month directory structure
     - Paths: `/saved-designs/screenshots/{yyyy}/{mm}/design_{id}.png`
     - Thumbnails: `/saved-designs/thumbnails/{yyyy}/{mm}/design_{id}_thumb.png`
   
   - **Database Integration**
     - Added `thumbnailPath` field to projects table
     - Updated `listProjectSummaries()` to SELECT thumbnailPath
     - Product name extracted from `designState.productId`
     - Price stored as `totalPriceCents` (integer cents)
   
   - **Save Design Fixes**
     - Fixed variable scope bug: `tempSummary` declared outside try block
     - Removed duplicate saves by using `tempSummary.id` for update
     - Added safety check before using tempSummary
     - Console logging for debugging product name lookup
   
   - **Performance Optimizations**
     - Removed `backdrop-blur-sm` from modals (causes slowness)
     - Modal backgrounds use simple `bg-black/90` instead
     - More popup height reduced by 15% (iframe: 450px → 380px)
     - Tighter spacing throughout (mb-6 → mb-4, mb-3)

2. **File Export System**
   - **Clean Export Files** - No embedded images in exports
     - XML, JSON, P3D files use URL references instead of base64 screenshots
     - Reduces file size dramatically
     - Example: `screenshot: "/saved-designs/screenshots/2026/02/design_{id}.png"`
     - Function: `cleanDesignState()` removes embedded image data

## Current Status (2026-02-26)

### ✅ Recent Changes (February 26, 2026)
1. **Save Design Feature - Complete Implementation**
   - Added "Save Design" button in main menu (after My Account link)
   - Redirects to My Account login if user is not authenticated
   - When logged in, shows centered modal popup asking for design name
   - Saves design to database with automatic screenshot generation from canvas
   - Generates and stores multiple file formats:
     - **JSON**: Complete design state (`/public/saved-designs/json/{yyyy}/{mm}/{designId}.json`)
     - **XML**: Legacy format for compatibility (`/public/saved-designs/xml/{yyyy}/{mm}/{designId}.xml`)
     - **HTML**: Price quote/design details (`/public/saved-designs/html/{yyyy}/{mm}/{designId}.html`)
     - **Screenshot**: Canvas capture (`/public/saved-designs/screenshots/{yyyy}/{mm}/{designId}.png`)
     - **P3D**: Binary format for design data (`/public/saved-designs/p3d/{yyyy}/{mm}/{designId}.p3d`)
   - After successful save, automatically redirects to My Account page
   - All folders auto-created with year/month structure (e.g., `2026/02/`)

2. **File Storage System - Organized by Date**
   - Implemented date-based folder structure for all saved designs
   - Upload directory: `/public/upload/{yyyy}/{mm}/` for original images
   - Saved designs directory: `/public/saved-designs/` with subdirectories:
     - `html/` - Price quotes and design details
     - `json/` - Design state data
     - `screenshots/` - Design preview images
     - `xml/` - Legacy XML format
     - `p3d/` - Binary design files
   - Auto-creates directories if they don't exist
   - Files: `lib/file-storage.ts`, `app/api/save-design/route.ts`

3. **My Account - Full Implementation**
   - **Saved Designs List**: Grid view with design thumbnails, names, creation dates
   - **Design Actions**: Each design has Edit, Buy, Email, More buttons (gold #D4A84F with black text)
   - **More Modal**: Popup with design preview, price, quote HTML
     - Share options: Email, URL, Facebook, Twitter/X, LinkedIn (with text labels)
     - Actions: PDF download, Edit, Buy, Delete, Close
     - Compact layout with 3 share buttons per row
     - Image preview at top (optimized size to avoid scrollbar)
   - **Delete Functionality**: Confirmation dialog before deleting design
   - **Account Navigation**: 
     - Saved Designs (default view)
     - Orders, Account Details, Invoices, Privacy
     - Back to Designer (returns to main designer)
     - Logout
   - Files: `app/my-account/page.tsx`, `components/AccountNav.tsx`

4. **UI/UX Enhancements**
   - Save Design modal centered over entire window (not just sidebar)
   - Consistent gold color (#D4A84F) for primary action buttons with black text
   - All interactive buttons have cursor:pointer (hand icon)
   - Horizontal padding (40px) added to saved designs container
   - Social media share buttons show text labels for better UX

5. **Database Integration**
   - Designs saved to `designs` table with user association
   - Stores design name, canvas state, file paths, timestamps
   - Screenshot path stored with proper year/month structure
   - Design ID used in all file names for easy retrieval
   - Supports CRUD operations via API routes

6. **Image Upload System**
   - Original images stored in `/public/upload/{yyyy}/{mm}/`
   - Resized images for designer use
   - Cropped images stored separately
   - Automatic directory creation with date structure

### ⚠️ Known Issues (February 26, 2026)
- None currently reported.

---

## Current Status (2026-02-25)

### ✅ Recent Changes (February 25, 2026)
1. **My Account Admin Hub Refresh**
   - Rebuilt `app/my-account/page.tsx` so the account dashboard matches the designer’s premium aesthetic: the content column now mirrors the main canvas styling (dark gradient backdrop, metric chips, saved-design grid) while the Saved Designs list focuses on proof details, created/updated timestamps, and primary call-to-actions without any status badges or hover affordances.
   - Tab-level navigation (New Design, Saved Designs, Orders, Account Details, Invoices, Privacy) moved into the global left rail using the same “01 Setup” card style, and the Saved Designs feed permanently filters out `awaiting-approval` cards so the page only highlights actionable work plus fallback cards for ready/in-production/completed concepts.

2. **Forever Shining Sidebar Integration**
   - Updated `components/AccountNav.tsx` to render inside the persistent left sidebar with the Forever Shining logo lockup, gold-accented cards, signed-in admin block, and contextual help footer so visiting `/my-account` inherits the same navigation patterns as the designer steps.
   - The left rail now mirrors the designer menu’s gradient, spacing, and typography, giving the account workspace the same premium look as “01 Setup” while keeping quick-enquiry entry points.

3. **Admin Seed & Postgres Guardrails**
   - Seeded a default admin record (`admin@forevershining.com` / `admin`) directly in Postgres so QA can log into the rebuilt My Account hub immediately, pairing it with a profile row for future role-based features.
   - Hardened `app/layout.tsx` catalog calls by wrapping the materials/shapes/borders/motifs fetch Promise in a try/catch so local dev keeps running even when the Postgres catalog tables are empty or offline (logs the error and falls back to empty arrays).

### ⚠️ Known Issues (February 25, 2026)
- My Account remains a statically rendered dashboard; logging in as admin does not yet unlock role-based controls or an actual project workflow beyond the saved-design summaries.

## Current Status (2026-02-24)

### ✅ Recent Changes (February 24, 2026)
1. **Image Crop Overlay Alignment - COMPLETED**
   - `components/CropCanvas.tsx` now measures the rendered preview with `ResizeObserver`, converts the canonical percent-based crop into live pixel coordinates, and renders mask, fill, and handles inside a single SVG overlay so everything remains 1:1 aligned.
   - The mask renderer uses the precise mask bounds (`maskMetrics.bounds`) to compute translations/scales, ensuring Oval Landscape, Rectangle Landscape, Heart, Triangle, and freeform granite/YAG crops display the correct shape immediately on load (no more slider tap to fix aspect ratio).
   - Drag handles for fixed-size masks follow the mask’s tight bounding box, while freeform granite/YAG still get full-rect handles; all duplicate outlines and legacy ellipses were removed to avoid confusing second borders.

2. **Granite/YAG Crop Stability**
   - Resolved the regression where the “Adjust Size” slider snap-back fought user input by eliminating the auto-resize effect after load; granite/YAG products continue to respect flexible height sliders while keeping the new mask-fit math.

3. **Postgres Schema + Env Template**
   - Added `sql/postgres-schema.sql`, a clean start-from-scratch schema for accounts, projects, catalog reference tables (materials/shapes/borders/motifs), orders, payments, and audit logs; includes seed rows so the designer panels have data immediately after bootstrap.
   - `.env.local.example` now ships with a default `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/headstonesdesigner`; create the database via `psql -U postgres -c "CREATE DATABASE headstonesdesigner;"` and then run `psql -U postgres -d headstonesdesigner -f sql/postgres-schema.sql`.

4. **Drizzle ORM Data Layer**
   - Installed `drizzle-orm`, `postgres`, `drizzle-kit`, and `tsx`, then defined the full 15-table schema in `lib/db/schema.ts`, connection helpers in `lib/db/index.ts`, and a typed catalog API in `lib/catalog-db.ts` with matching docs (`DRIZZLE_SETUP.md`, `DRIZZLE_IMPLEMENTATION.md`).
   - Added `drizzle.config.ts`, generated migrations, and wired npm scripts (`drizzle:push`, `drizzle:studio`) so local dev and Vercel builds share the same type-safe queries.

5. **Sidebar Selectors on Live Postgres Data**
   - `app/layout.tsx` now fetches catalog datasets server-side, maps them through `lib/catalog-mappers.ts`, and hydrates the designer store so `MaterialSelector`, `ShapeSelector`, `BorderSelector`, and `MotifSelector` pull live rows instead of JSON mocks.
   - Selector components gained graceful asset fallbacks, loading states, and category segmentation; `SIDEBAR_INTEGRATION_COMPLETE.md` documents the pipeline from Next.js layout → mappers → Zustand store → 3D canvas.

6. **Catalog Seed Expansion (40 Items)**
   - Populated 10 materials, 8 shapes, 7 borders, and 15 motifs via `sql/seed-data.sql`, matching realistic pricing tiers, metadata, and tag sets for filtering; `SEED_DATA_EXPANSION.md` captures the dataset.
   - Verified queries via `npm run drizzle:test` (catalog harness) and ensured `.env.local` points to `postgresql://postgres:postgres@localhost:5432/headstonesdesigner` for immediate local usage.

### ⚠️ Known Issues (February 24, 2026)
- Legacy Three.js/image panel files still emit pre-existing TypeScript errors unrelated to the new catalog pipeline; they need a dedicated cleanup pass but do not block dev server usage.

## Current Status (2026-02-23)

### ✅ Recent Changes (February 23, 2026)
1. **Mask-Aware Image Cropping Pipeline - COMPLETED**
   - Added `lib/mask-metrics.ts` to parse each SVG mask’s true bounds (width, height, offsets) and thread that data through `ImageSelector`, the store, and `CropCanvas`.
   - Crop UI now seeds aspect ratios directly from mask metrics (instead of hardcoded oval math), and on export the new pipeline crops to the exact mask footprint before compositing so triangle/heart masks match production references.
   - `ImageModel` and Check Price now consume canonical size metadata via `image-size-config`, ensuring pricing, thumbnails, and final renderings all share the same millimeter dimensions.

2. **Granite Image Freeform + B&W Enforcement - COMPLETED**
   - Granite and YAG laser image types (IDs 21 & 135) detect automatically, forcing crop color mode to Black & White, disabling the Step 2 selector, and showing an explanatory note.
   - Their crop handles ignore mask bounds (full-rectangle resizing + movement) so users can define any freeform cutout before the image is etched directly onto granite.
   - Updated thumbnail references to `/jpg/photos/m/granite-image.jpg` and ensured Check Price rows display "Product ID" plus human-readable size labels sourced from the XML tiers.

### ⚠️ Known Issues (February 23, 2026)
- None currently reported.

## Current Status (2026-02-22)

### ✅ Recent Changes (February 22, 2026)
1. **Image Crop Canvas Aspect Ratio Fix - COMPLETED**
   - **Root Cause Fixed**: Oval crop canvas was being scaled incorrectly (1.25× compensation made it square)
   - **Issue**: Canvas dimensions were `1.0` (square) instead of `0.8` for oval_vertical (portrait)
   - **Solution**: Removed incorrect `effectiveAspect = targetMaskAspect * 1.25` compensation
   - **Result**: 
     - Oval portrait now correctly: width 80mm, height 100mm (0.8 aspect ratio)
     - Heart maintains correct proportions
     - All mask shapes preserve their intended aspect ratios
   - Files: `components/ImageSelector.tsx`

2. **3D Ceramic/Enamel Base Improvements - COMPLETED**
   - **Photo Material Update**: Changed from `meshBasicMaterial` to `meshStandardMaterial`
     - Better lighting response (roughness 0.8, metalness 0)
     - More realistic appearance under scene lighting
     - Fixes oval photo visibility issues
   
   - **Z-Positioning Refined**:
     - Photo positioned at `actualCeramicDepthInUnits + 0.5mm` above ceramic surface
     - Prevents z-fighting and ensures visibility from all camera angles
     - Photo stays clearly on top during orbit camera rotations
   
   - **Ceramic Scaling Fix - Uses Crop Canvas Logic**:
     - Added `getMaskShapeBounds()` function (same as CropCanvas)
     - Scale based on actual mask bounds within 500×500 SVG viewBox
     - Example: Oval vertical uses 400×500 area, not full 500×500
     - Formula: `scaleX/Y = width/maskBounds.width * (1 + borderPercentage)`
   
   - **Border Sizing**:
     - Heart: 7% border (looks perfect)
     - Oval: 3% border (smaller, more appropriate for oval shapes)
     - Ceramic shape now perfectly matches the masked photo outline
   
   - **Transparency & Masking**:
     - Photo material: `transparent={true}` with `alphaTest={0.5}`
     - Black mask areas rendered transparent
     - Only visible photo content shows (heart/oval shaped)
     - No black rectangular remnants
   
   - Files: `components/three/ImageModel.tsx`, `components/ImageSelector.tsx`

### ✅ Recent Changes (February 21, 2026)
1. **3D Ceramic/Enamel Base Feature - COMPLETED**
   - Ceramic, Vitreous Enamel, and Premium Plana images render with 3D ceramic base
   - SVG mask shape loaded and extruded to create actual 3D geometry
   - White glossy ceramic material (roughness 0.2, metalness 0.05)
   - Very thin 1mm depth for realistic appearance
   - Applied to: Ceramic (ID 7), Vitreous Enamel (ID 2300), Premium Plana (ID 2400)
   - NOT applied to: Granite Image (ID 21) and YAG Laser (ID 135)
   - Files: `components/three/ImageModel.tsx`, `components/three/headstone/ShapeSwapper.tsx`

### ⚠️ Known Issues (February 22, 2026)
- None currently reported

## Previous Status (2026-02-20)

### ✅ Recent Changes (February 20, 2026)
1. **Add Your Image Feature - Image Placement & Crop System (IN PROGRESS)**
   - **3D Image Rendering on Headstone**:
     - Cropped images now render as masked textures on 3D headstone model
     - Uses canvas-based masking pipeline: draw image → apply mask with `destination-in` compositing
     - Images positioned via `ImageModel.tsx` component (similar to MotifModel)
     - Draggable positioning on headstone surface with pointer interaction
     - Selection outline with corner handles (matching motif/inscription UX)
   
   - **Image Panel & Controls**:
     - New "Images" panel in sidebar navigation (matches Motifs/Additions layout)
     - Shows selected image details: type, size options, duplicate/delete actions
     - Size selection via discrete variants from XML catalog (not continuous slider)
     - Fixed sizes per image type (e.g., Ceramic Oval: 40×60mm to 180×240mm in 9 sizes)
     - Granite images support free-form sizing (no fixed variants)
   
   - **Aspect Ratio & Mask Alignment Fixes**:
     - Fixed oval mask SVG padding issue (10% internal padding on left/right)
     - Compensated for viewBox offset with `effectiveAspect = targetAspect × 1.25` for ovals
     - Final canvas dimensions now match visible mask area in crop screen
     - Image texture properly fills selection box width on headstone
     - Selection outline corners align with actual image edges
   
   - **Crop Canvas Improvements**:
     - Removed "Duplicate" button from crop interface (per user request)
     - Mask overlay and drag handlers properly aligned
     - Size slider keeps crop centered during adjustments
     - Corner drag handlers visible and functional (50% outside crop area)
   
   - **Known Issues**:
     - Initial crop handler positioning sometimes misaligned on first load (fixed after slider use)
     - Selection outline needs fine-tuning for all mask shapes (currently optimized for oval)
   
   - Files: `components/ImageSelector.tsx`, `components/CropCanvas.tsx`, `components/three/ImageModel.tsx`, `components/ImagePanel.tsx` (new), `lib/headstone-store.ts`

### ⚠️ Known Issues (February 20, 2026)
- **Image Drag Movement**: Images not yet draggable on headstone despite pointer handlers
- **Crop Handler Initial Position**: Handlers occasionally misaligned on first render (fixed after slider interaction)
- **Size Variant Loading**: Need to wire XML size variants into image panel controls

## Previous Status (2026-02-18)

### ✅ Recent Changes (February 18, 2026)
1. **Add Your Image Feature (INITIAL IMPLEMENTATION)**
   - New "Add Your Image" section in left sidebar navigation (02 Design group)
   - Image type selection panel matching motif selector layout
   - Five image types supported:
     - **Granite Image (ID 21)**: Laser-etched directly on stone (free-form cropping)
     - **Ceramic Image (ID 7)**: Ceramic photo overlay with fixed aspect ratio
     - **Vitreous Enamel (ID 2300)**: Durable porcelain enamel with fixed aspect ratio
     - **Premium Plana (ID 2400)**: High-quality plana image with fixed aspect ratio
     - **YAG Lasered Image (ID 135)**: YAG laser-etched image
   - Image types loaded from `public/xml/en_EN/images.xml`
   - Available images filtered from catalog `<additions>` section (per product)
   - **Mobile /select-images Landing Page** now mirrors sidebar content with guided storytelling (stats, workflow cards, mask gallery, care notes) so tablets/phones gain parity even before functionality ships.
   - **Image Upload & Crop Workflow**:
     - Step 1: Select image type from grid (thumbnail + name)
     - Step 2: Upload image file
     - Step 3: Interactive crop canvas with mask overlay
       - Green semi-transparent mask (alpha 50%) shows crop area
       - 7 mask shapes: Circle Portrait, Horizontal Oval, Rectangle Portrait, Rectangle Landscape, Heart, Teardrop, Triangle
       - SVG masks loaded from `public/shapes/masks/` directory
       - Corner drag handlers with connecting border lines for resize
       - Size slider to adjust mask height
       - Drag-to-reposition within uploaded image
     - Step 4: Cropped image placed on headstone 3D model (pending wiring)
   - **Crop Area Controls** (latest refactor):
     - Position: Drag mask anywhere on uploaded image
     - Resize: Slider control for mask height (maintains aspect ratio for fixed-ratio types), now keeps the crop centered instead of snapping to middle
     - Drag handles enabled for all mask types (granite + fixed sizes); sidebar slider + +/- buttons reuse shared helpers to respect bounds
   - **Crop Canvas Rendering**:
     - Mask SVGs use per-shape viewBox overrides to eliminate squashing and keep portrait ovals framed correctly
     - Overlay shares exact bounds with the drag handles so users see a 1:1 relationship between mask and controls
   - Files: `components/ImageSelector.tsx`, `components/CropCanvas.tsx`, `app/select-images/page.tsx`, `lib/_data.ts`, `public/jpg/photos/`
2. **Bronze Border Integrated Scale Guardrails**
   - `components/three/BronzeBorder.tsx` now measures the merged SVG coverage against the plaque width/height and automatically shrinks every border except Border 1 when the artwork would overrun the plaque face.
   - The shrink factor lerps between 0.78–0.9 target coverage (based on plaque size) so downstream rail placement/texture math continues to use the recomputed bounding box.
   - Prevents oversized integrated rails like those shown in `screen.png` while keeping Border 1 (already tuned) untouched.

### ⚠️ Known Issues (February 18, 2026)
- **Image Crop Handlers**: Mask + overlay alignment is corrected, but drag handles intermittently fail to resize the mask (especially on higher-DPI monitors). Slider-driven resizing works, yet dragging still needs a stable pointer math fix.
- **Size Slider Recentering**: Although the new helper keeps crops centered during slider changes, QA still reports edge cases where the mask re-centers after repeated drags + slider adjustments; need additional state sync between CropCanvas and sidebar state.
- **3D Placement**: Cropped image rendering on headstone not yet implemented.

## Current Status (2026-02-13)

### ✅ Recent Changes (February 13, 2026)
1. **Canonical Loader Auto-Centering for Forevershining Layouts**
   - The loader now samples every headstone-target inscription and motif before applying the legacy HEADSTONE_HALF/2 vertical shift.
   - If a design's pre-shift coordinates are already centered within 5% of the headstone envelope (e.g., the forevershining multi-person memorial), the extra lift is skipped so motifs/inscriptions stop floating above the 2D reference.
   - Legacy designs that rely on the historic offset (like canonical design 1725769905504) still receive the original shift, and both code paths clamp the applied shift to keep geometry within the stone's physical bounds.
2. **Rotating Selection Outline Uses True OBBs**
   - `RotatingBoxOutline.tsx` now transforms each child mesh’s bounding box directly into the target’s local space (single `inverse * world` matrix mul), so the headstone selection frame stays glued to the stone at every 30° arrow rotation—no more Z-axis drifting or width-as-depth stretching.
   - The helper reattaches to the target mesh each frame, ensuring Load Design 1 once again shows its headstone outline immediately after loading (base outline was already unaffected).
3. **Mesh-Space Coordinate Preservation & Shape Conversion Remap**
   - Removed the incorrect “scale by mm width/height” math for inscriptions, motifs, and additions—offsets now stay in mesh-local units, matching how `HeadstoneInscription`, `MotifModel`, and `AdditionModel` capture drag results.
   - `HeadstoneInscription` writes the active headstone/base dimensions alongside every drag so future conversions know the source surface, while `ShapeSwapper` snapshots the previous SVG’s bounding box, waits for the new shape to load, and remaps all headstone-surface elements via normalized bbox coordinates (additions on the base remain untouched).
   - This eliminates the plaque conversion collapse (elements piling near the center) and keeps duplicated items aligned because they all inherit the updated headstone-local offsets.

### ⚠️ Known Issues (February 13, 2026)
- None currently reported.

## Current Status (2026-02-12)

### ✅ Recent Changes (February 12, 2026)
1. **Bronze Border Scale Normalization**
   - `BronzeBorder.tsx` now lerps the aggressive `borderXa` scale overrides based on the plaque’s shortest dimension, so 300×300 mm plaques stick to a 1× scale while larger canvases gradually regain the extra amplification needed to fill wider rails.
   - Integrated rails inherit the same logic, preventing the 3D frame from ballooning relative to the legacy 2D reference in `screen.png` while preserving full-edge coverage on 400 mm+ products.
   - A follow-up multiplier now applies a 2.5× boost to the final integrated border scale so the updated 3D outline keeps pace with the legacy 2D system’s apparent thickness even after the previous downscale changes.
   - Files: `components/three/BronzeBorder.tsx`.

2. **Canonical Loader Rollback for Stability**
   - Reverted `lib/saved-design-loader-utils.ts` to the February 11 baseline after stage-compensation experiments caused Load Design 1 motifs (canonical design `1725769905504`) to shrink and flip.
   - The revert restores canonical flip handling, height math, and compensation rules exactly as they shipped on Feb 11 so QA can continue using the trusted loader while we design a universal fix.
   - Files: `lib/saved-design-loader-utils.ts`.

3. **Selection Outline Rotation Sync**
   - `RotatingBoxOutline` now attaches its helper geometry to the target’s parent instead of the global scene root, so the headstone/base viewfinder corners inherit the same Y-axis rotations triggered by the 15° arrow buttons (no more drifting forward/back after repeated clicks).
   - Files: `components/three/RotatingBoxOutline.tsx`.

### 🧪 Canonical Loader Investigation (Rolled Back on February 12, 2026)
- Tried scoping stage-compensation heuristics (directory + thickness filters) to fix Load Design 2 but the variant caused Load Design 1 motifs to shrink/flip; reverted `lib/saved-design-loader-utils.ts` to the Feb 11 baseline for stability.
- Tested direct flip flag passthrough and pixel-derived motif heights; both improved Design 2 but regressed Design 1, so they were also rolled back pending a more universal converter.
- Reference snapshots (see `screen.png`, `design2.txt`) remain the source of truth while we design a single loader/converter that works for all 10 k+ designs.

### ⚠️ Known Issues (February 12, 2026)
- **Load Design 2 canonical alignment:** Motifs/inscriptions from the forevershining source still sit higher than expected in 3D compared to the SVG/div reference despite the rollbacks; needs a universal stage-space vs physical-space detection strategy. *(Resolved February 13 via the auto-centering shift described above.)*

## Current Status (2026-02-11)

### ✅ Recent Changes (February 11, 2026)
1. **Addition Duplication Reliability & Metadata**
   - `lib/headstone-store.ts` now persists per-instance metadata (`additionType`, `assetFile`, `footprintWidth`, finalized `zPos`) when additions are added or duplicated, so clones keep their GLB paths and exact placement.
   - `components/three/AdditionModel.tsx` can fall back to stored metadata when the catalog lacks a `file`, preventing "has no file data" errors, and each addition reports its true footprint width so duplicates offset by their own size instead of a hardcoded value.

2. **Statue/Vase Grounding & Base Alignment**
   - Addition meshes are re-centered differently per type: statues/vases snap their origin to the GLB’s base while applications stay centered, keeping silhouettes upright.
   - Base-mounted additions compute the base-top plane in headstone space and clamp both `yPos` and `zPos` to that surface, eliminating the sinking/stacking drift that happened after repeated duplicates or base edits.

3. **Application Selection Outline Centering**
   - Because GLB centering is now type-aware, application selection boxes stay centered on the motif instead of hugging the bottom edge, restoring the cinematic outline animation introduced on Feb 8.

4. **Statue/Vase Drag & Outline Polish**
   - Drag start math now samples the current headstone-space position before computing deltas, so statues and vases no longer lurch sideways or backwards on the first click-drag.
   - Selection outlines for statues/vases render with depth testing plus a 25 mm `bottomLift`, keeping back corners hidden behind the model and lifting brackets above the base surface.
   - Depth scaling constants were halved (`STATUE_DEPTH_SCALE` 0.28→0.14, `VASE_DEPTH_SCALE` 0.32→0.16) to eliminate the 50 % Z-stretch QA spotted in `screen.png`.

5. **Canonical Loader Safety Net**
   - `canonicalOutOfBounds()` inside `loadCanonicalDesignIntoEditor` was converted to a hoisted function declaration so it exists before invocation, fixing the `ReferenceError: canonicalOutOfBounds is not defined` regression that blocked canonical design loading on February 10 builds.

### ⚠️ Known Issues (February 11, 2026)
- None currently reported.

## Current Status (2026-02-10)

### ✅ Recent Changes (February 10, 2026)
1. **Addition Placement Uses Real Units & Base-Aligned Anchors**
   - `components/three/AdditionModel.tsx` now defines a shared `MM` helper and converts every default offset, collision pad, and application lift from millimeters to meters before doing bounding-box math. This fixes the long-standing clamp bug that snapped statues to the base’s minX edge because offsets were previously interpreted as meters.
   - Statues and vases sample the base’s top-front plane in headstone space, then subtract half their scaled depth plus a 10 mm safety margin so they rest flush on the base without hanging over the front or disappearing behind it. Default statue (left pad) and vase (right pad) anchors now land 80 mm and 30 mm in from their respective edges and persist correctly when duplicating or reloading thanks to the stored `zPos`.

### ⚠️ Known Issues (February 10, 2026)
- None currently reported.

## Current Status (2026-02-08)

### ✅ Recent Changes (February 8, 2026)
1. **Cinematic Selection Outlines & Depth Masking**
   - `RotatingBoxOutline.tsx` gained a `bottomLift` prop plus an optional reveal animation. Headstone/base outlines now render with depth testing again so rear corners never leak through the stone, while downward corners lift 10‑25 mm to keep brackets visible above the base/ground without floating.
   - HeadstoneAssembly wires the new props for both the headstone and base, and extension models (statues/vases) opt into the reveal so every viewfinder indicator matches the premium “draw-on” look from `screen.png`.
   - Files: `components/three/RotatingBoxOutline.tsx`, `components/three/headstone/HeadstoneAssembly.tsx`, `components/three/AdditionModel.tsx`.

2. **Animated Selection Boxes & Single-Selection Enforcement**
   - `components/SelectionBox.tsx` now animates its corner arms and resize handles whenever inscriptions, motifs, or application-style additions become selected; handles fade/scale in after the line draw completes for a high-end feel without obscuring the stone.
   - All SelectionBox call sites (inscriptions, motifs, additions) enable the animation. The store’s `setSelected` helper also clears motif/addition/inscription IDs whenever the user selects the headstone/base, guaranteeing only one outline is visible at a time.
   - Files: `components/SelectionBox.tsx`, `components/HeadstoneInscription.tsx`, `components/three/MotifModel.tsx`, `components/three/AdditionModel.tsx`, `lib/headstone-store.ts`.

### ⚠️ Known Issues (February 8, 2026)
- None currently reported.

## Current Status (2026-02-07)

### ✅ Recent Changes (February 7, 2026)
1. **Convert Design Panel & Button Refresh**
   - Replaced the legacy "3D Preview" shortcut with a persistent **Convert Design** button in the left sidebar; clicking it opens a dedicated panel that mirrors the Select Product layout but forces a single product per row for readability.
   - Selecting a product from this panel dispatches `setProductId()` immediately so catalog XML, pricing, and materials swap in-place without navigating away from the designer.
   - Panel shares the same guided-step chrome (Back to Menu pill, warm gradient) to keep seniors oriented while experimenting with alternate products.

2. **Product Conversion Pipeline Updates**
   - When switching products we now detect prior square canvases (≈610 mm × 610 mm) or any non-plaque source product and automatically clamp plaque targets to 300 mm × 300 mm so Bronze plaques stay within their catalog envelope.
   - Inscriptions and motifs have their **sizes** scaled down to respect the new product’s height limits, but their **Y positions remain untouched**, preventing the mid-canvas pileups that happened earlier.
   - Colors refresh to the destination catalog’s `default-color`, inscription/motif targets retarget to the plaque surface (base nodes drop away), and min/max sliders reuse catalog min/max values immediately after conversion.

3. **Bronze Plaque Defaults & Border Handling**
   - Catalogs flagged with `border="1"` now auto-enable the first decorative border when loaded via Convert Design; non-border products clear the state so granite uprights don’t inherit plaque rails.
   - Bronze border meshes use a lighter highlight color (`#FFDFA3`) to match the art direction supplied in `screen.png` and look less orange against dark backgrounds.
   - Added aspect-aware limits so square plaques inherit 300 mm × 300 mm defaults and landscape plaques stay at 300 mm × 200 mm unless the catalog allows larger values.

4. **Bronze Border Geometry & Selection Rail Tweaks**
   - `BronzeBorder.tsx` now derives edge thickness, decorative corner span, and dual-line selection rails from the plaque’s **shorter** dimension with aggressive compression for near-square aspect ratios (≤0.95) so borders no longer dominate 300 mm × 300 mm canvases.
   - Corner fallback anchors, line thickness, and gaps are scaled with a `sizeCompression` factor, bringing the inner selection rails closer to the plaque edges and reducing their width.
   - Square conversions get an additional inset clamp so dual selection rails hug the plaque edge and decorative corners stay compact after Convert Design forces a 300 mm × 300 mm canvas.
   - Border thickness, line gaps, and corner spans now derive from real millimeter measurements (unitScale-aware), keeping 300 mm plaques delicate while still allowing larger monuments to feel substantial.
   - Integrated rails remain available (via suffixed `borderXa.svg`) but non-integrated slugs now respect the same size-aware math, ensuring consistent visuals regardless of slug.
   - Fixed a React crash introduced during the mm-scaling work by threading `unitScale` through `buildBorderGroup()`—Convert Design can swap into plaques again without hitting `ReferenceError: safeUnitScale is not defined`.

5. **Selection Outline Cleanup**
   - `RotatingBoxOutline.tsx` now renders classic two-axis viewfinder corners only, removing the depth leg that previously protruded toward the camera on flat plaques and causing the corners to look oversized.
   - Headstone/Base outlines are flagged as **front-facing only**, so rear corners never leak through the stone even though we still render “through” to keep bottom edges visible.
   - Front-facing logic now uses a real clipping plane derived from the active camera normal (via R3F local clipping) instead of heuristic dot products, which keeps bottom edges visible while allowing the renderer to trim any geometry physically behind the headstone.

### ⚠️ Known Issues (February 7, 2026)
- None currently reported.

## Current Status (2026-02-23)

### ✅ Recent Changes (February 23, 2026)
1. **Granite Image Flexible Sizing UI**
   - Granite/YAG image products (IDs 21, 135, 136, 137) now detect their `min_height`, `max_height`, and `init_height` directly from `public/xml/*/images.xml` via the new `getFlexibleImageBounds()` helper.
   - `ImageSelector` switches from the discrete “Size 1-4” variant slider to a millimeter-based height slider/input when a flexible product is selected, clamping values to the XML bounds (30–1200 mm for Granite) and auto-deriving width from the stored aspect ratio.
   - Fixed-size ceramic/vitreous items keep the existing variant slider, so established workflows remain unchanged.
   - Files: `lib/image-size-config.ts`, `components/ImageSelector.tsx`.

### ⚠️ Known Issues (February 23, 2026)
- None currently reported.

## Current Status (2026-02-06)

### ✅ Recent Changes (February 6, 2026)
1. **Statue/Vase Depth Controls & Collision Guardrails**
   - Addition offsets now persist a `zPos` field so statues and vases remember their depth when saved, duplicated, or reloaded.
   - Z placement is clamped between the headstone front plane and the back half of the base with a 5 mm safety pad, preventing models from intersecting the upright.
   - Selection logic only applies the clamp after a user actually drags in Z, keeping canonical defaults untouched.
   - Files: `components/three/AdditionModel.tsx`, `lib/headstone-store.ts`, `components/AdditionOverlayPanel.tsx`.

2. **Base-Friendly Dragging**
   - Dragging statues/vases now projects pointer movement onto a calculated plane aligned with the base top; movement continues even if the cursor leaves the mesh until mouse-up.
   - Shared pointer tracking mirrors the application/motif fallback so all additions feel identical to move.
   - Files: `components/three/AdditionModel.tsx`.

3. **Geometry Readiness Guards**
   - AdditionModel now waits for base/headstone bounding boxes before rendering base-mounted items to avoid hook-order warnings and undefined geometry.
   - Files: `components/three/AdditionModel.tsx`.

### ⚠️ Known Issues (2026-02-06)
- None currently reported.

## Current Status (2026-02-03)

### ✅ Recent Changes (February 3, 2026)
1. **Check Price Page Enhancements**: Improved motif and inscription detail modals
   - **Motif Images**: Changed from card backgrounds to clean white/grey-tinted images (2x larger)
   - **Color Column Simplified**: Removed duplicate empty "Color" column in motif details
   - **Color Display**: Shows color name (e.g., "Black") + hex value below it (no swatch box)
   - **Filename Positioning**: Moved filename below motif image as alt text
   - **Column Headers**: Changed "Name" to "Motif", left-aligned content
   - **Removed Filename Link**: Filename now appears as image alt text, image is clickable
   - **Inscription Color**: Matched motif color display format (name + hex)
   - **Product Details Added**: Shows "Product ID: X - Name" format with shape, material, size for headstone and base
   - **Price Integration**: Added prices for headstone, base, motifs, and inscriptions
   - **Column Width Adjustment**: Your Design (60%), Price Summary (40%)
   - **Link Cursors**: Added cursor pointer to motif/inscription count links
   - **Real Price Calculations**: Motif and inscription totals now calculate from actual item prices
   - Files: `app/check-price/_ui/CheckPriceGrid.tsx`

2. **Addition Catalog Behavior**: Fixed addition list visibility after deletion
   - **Delete Button**: Keeps `activePanel = 'addition'` instead of setting to null
   - **Result**: Catalog immediately reappears for quick addition of another item
   - Files: `components/DesignerNav.tsx`

3. **Addition Auto-Selection**: Fixed additions not being selected after adding
   - **Issue**: `addAddition()` creates instance ID but selector was setting wrong ID
   - **Fix**: Removed redundant `setSelectedAdditionId` calls since `addAddition()` handles it
   - **Result**: Newly added additions auto-select and edit panel opens
   - Files: `components/AdditionSelector.tsx`, `lib/headstone-store.ts`

4. **Addition Size Control**: Implemented discrete size slider (Size 1-4)
   - **Changed from**: Continuous scale (0.1-3.0×)
   - **Changed to**: Integer size variants (1, 2, 3, 4)
   - **Purpose**: Prepare for XML-based fixed size selection from catalog
   - **Store**: Added `sizeVariant` field to addition offsets
   - **UI**: Shows "Size 1" to "Size 4" with integer steps
   - Files: `components/DesignerNav.tsx`, `lib/headstone-store.ts`

5. **Statue/Vase Placement Pipeline**: Statues and vases now snap to the base surface
   - Addition offsets track a `targetSurface` so saved coordinates resnap once the base mesh loads
   - Default placement converts base top/world coordinates into headstone space, constraining anchors to left/right pads
   - **X Position**: Statues positioned in **left pad** (center between base left edge and headstone left edge)
   - **X Position**: Vases positioned in **right pad** (center between headstone right edge and base right edge)
   - **Y Position**: On top surface of base (`targetBBox.max.y`)
   - **Z Position**: Centered within the pad depth (fixed 2026-02-14 via midpoint sampling + stored `zPos`)
   - Dragging statues stays locked to those pads while applications continue using the headstone plane fallback
   - ElegantSelection replaces the blue handle box for statues/vases, while applications keep resize handles
   - **Rotation**: Statues rotate around Y-axis (vertical spin), not Z-axis
   - **Store Fields**: `xPos`, `yPos`, `zPos` (optional), `rotationZ`, `scale`, `sizeVariant`, `targetSurface`
   - Files: `components/three/AdditionModel.tsx`, `lib/headstone-store.ts`

6. **Statue Depth & Scale Normalization**
   - Introduced `STATUE_DEPTH_SCALE` / `VASE_DEPTH_SCALE` so GLB Z-depth is clamped to ~30% of original, preventing stretched silhouettes
   - Z-positioning now derives from the scaled depth rather than raw mesh bounds
   - Files: `components/three/AdditionModel.tsx`

7. **Base Auto-Resize When Statues Present**
   - Base width expands by 30% and depth by 1.5× whenever `hasStatue()` is true, giving statues breathing room on both sides
   - Base center alignment logic updated so the enlarged base still stays flush with the upright back plane
   - Files: `components/three/headstone/HeadstoneBaseAuto.tsx`

### ⚠️ Known Issues (2026-02-04)
- None currently reported.

### ✅ Recent Changes (February 2, 2026)
1. **Check Price Interactive Details**: Added clickable detail modals for inscriptions, motifs, and additions
   - **Clickable Counts**: "8 motifs", "9 inscriptions", "2 items" are now clickable links (white with underline, hover → gold)
   - **Zero Items**: When count is 0, displays as plain text (not clickable) - e.g., "0 items"
   - **Detail Modals**: Click count to open modal with full item breakdown
     - **Inscriptions Modal**: Text, font, character count (Qty), size (mm), color swatch + name, price
     - **Motifs Modal**: Thumbnail image (48×48px), name (linked to SVG file), size (mm), color swatch + display name, price
     - **Additions Modal**: Name with ID, type, price
   - **Motif Thumbnails**: SVG preview in first column with clickable link to open full SVG in new tab
   - **Modal Styling**: Dark gradient theme matching Check Price page, gold accents, sticky table headers
   - **Files**: `app/check-price/_ui/CheckPriceGrid.tsx`

### ✅ Recent Changes (January 31, 2026)
1. **Homepage Visual Refinements**: Comprehensive UI improvements across all sections
   - **Hero Section Text Colors**: Enhanced readability and visual hierarchy
     - Main headline: Warm white (#FFFEF8) with enhanced shadow for depth
     - Subheadline: Pure white (#FFFFFF) with stronger shadow (was gray)
     - Trust badge "Trusted by 5,000+ families": Gold (#F8D64F) to match CTA button
     - Bullet points: Pure white (#FFFFFF) with medium weight (was light gray)
     - All text now has professional shadows: `0 2px 8-12px rgba(0,0,0,0.5-0.6)`
   
   - **How It Works Section Cards**: Updated Step 1, 2, 3 cards styling
     - Lighter gradient backgrounds: `from-[#2a1f15]/80 to-[#1a120c]/90`
     - Gold borders: `border-[#d4af37]/30` with hover brightening to `/60`
     - Subtle glow effect overlay on hover
     - Enhanced spacing: `gap-6` between cards, better padding
     - Gold "STEP 01/02/03" labels with improved typography
     - Files: `app/_ui/HomeSplash.tsx`
   
   - **Icon Highlights**: Three icon row (See every change..., Transparent pricing, Save drafts)
     - Removed card backgrounds, kept transparent for cleaner look
     - Enhanced icon boxes: Larger (w-14 h-14), gradient backgrounds, gold tints
     - Better hover effects with smooth transitions
     - Files: `app/_ui/HomeSplash.tsx`
   
   - **Stat Cards** (5,284 families, 40 shapes, 5000+ accents):
     - Much lighter backgrounds: Gradient `from-[#2a1f15]/80 to-[#1a120c]/90`
     - Gold borders with subtle glow on hover
     - Larger text, better spacing, backdrop blur
     - Hover effects: scale, enhanced shadow with gold tint
     - Files: `app/_ui/HomeSplash.tsx`
   
   - **Ready When You Are Section**:
     - Updated CTA button "Request a Designer's Help": Gold theme with enhanced visibility
     - Border: `border-[#d4af37]/60`, gradient background, shadow with gold tint
     - Testimonial card: Same elegant design as stat cards (lighter, gold border, glow)
     - Background: Hero gradient `radial-gradient(circle at 50% 100%, #3E3020 0%, #121212 60%)`
     - Files: `app/_ui/HomeSplash.tsx`
   
   - **Design Possibilities Section** (Interactive Studio):
     - Step cards: Updated to match "How It Works" elegant styling
     - Enhanced icon boxes: Larger, gradient backgrounds with gold accents
     - Gold "STEP 01/02/03" labels with better contrast
     - Shape selection icons: Larger (h-16 w-16), card-style with gradients
     - Removed drop shadow from headstone preview for cleaner look
     - Files: `app/_ui/HomeSplash.tsx`

2. **Motif System Enhancements**: Fixed Vercel deployment and improved UI consistency
   - **Vercel Motif Loading Fix**: Added `public/motifs/` directory structure to git
     - Created `files.txt` manifests for each motif category
     - API endpoint now serves motifs from correct public directory
     - Fixed "No motifs available" error on production
     - Files: `app/api/motifs/[category]/route.ts`, `public/motifs/*/files.txt`
   
   - **Inscription Panel Sliders**: Updated Size and Rotation to match Select Size design
     - Added +/- buttons with icon SVGs for precise 1mm/1° adjustments
     - Number input fields between buttons (w-16, right-aligned)
     - Min/max labels below sliders (e.g., "18mm - 200mm", "-180° - 180°")
     - Gold gradient slider track with enhanced thumb styling
     - Files: `components/DesignerNav.tsx`
   
   - **Motif Panel Sliders**: Updated Height and Rotation in Select Motifs panel
     - Same +/- button and input design as inscriptions
     - Consistent styling across all dimension controls
     - Files: `components/DesignerNav.tsx`

3. **Design System Consistency**: Unified card styling and visual language
   - All section cards now use consistent:
     - Gradient backgrounds: `from-[#2a1f15]/80 to-[#1a120c]/90`
     - Gold borders: `border-[#d4af37]/30` with hover effects
     - Backdrop blur for modern glass effect
     - Glow overlays on hover
     - Professional shadows with gold tints
   - Slider controls unified across:
     - Select Size (Width/Height)
     - Inscriptions (Size/Rotation)
     - Select Motifs (Height/Rotation)
   - Icon boxes standardized: w-14 h-14, gradients, gold accents

### ✅ Recent Changes (January 30, 2026)
1. **Default Color from XML**: Catalog default-color attribute now used for inscriptions and motifs
   - Added `defaultColor` field to catalog XML parser (`lib/xml-parser.ts`)
   - Bronze Plaques use `#ffb35a` (Texas Rose) from catalog-id-5.xml
   - Traditional Headstones use `#c99d44` (Gold) from catalog-id-124.xml
   - Fallback to hardcoded values if not specified in XML
   - Files: `lib/xml-parser.ts`, `lib/headstone-store.ts`

2. **Check Price Modal Redesign**: Updated to match design from screen.png
   - Green header/footer background (#a8d5ba) with total price in title
   - Clean table layout with Product, Qty, Price, Item Total columns
   - Right-aligned prices, center-aligned quantities
   - Individual rows for each inscription and motif
   - Bronze color details shown in product descriptions
   - Files: `components/CheckPricePanel.tsx`

3. **Motif Smooth Dragging**: Fixed jumpy motion with requestAnimationFrame throttling
   - Store updates reduced from ~200-500/sec to ~60/sec (70-90% reduction)
   - RAF-based throttling locks to display refresh rate
   - Drag position stored in ref, final update on release
   - Smooth 60fps dragging performance
   - Files: `components/three/MotifModel.tsx`

4. **Motif Visual Enhancements**: Matches border selector styling
   - Thicker borders (2px instead of 1px)
   - Bronze color (#CD7F32) for products with `color="1"` using CSS mask
   - Removed unnecessary info card
   - Consistent styling across sidebar and fullscreen panels
   - Files: `components/MotifSelectorPanel.tsx`, `app/select-motifs/_ui/MotifSelectionGrid.tsx`, `components/DesignerNav.tsx`

5. **Motif Flip Fix**: Corrected default orientation
   - Removed negative scaleY default that caused Y-axis flip
   - Initialize `flipX: false, flipY: false` when adding motifs
   - Updated canonical loader to invert flipY logic
   - Motifs now appear in correct orientation by default
   - Files: `components/three/MotifModel.tsx`, `lib/headstone-store.ts`, `lib/saved-design-loader-utils.ts`

6. **Motif Selector Improvements**: Enhanced hover and cursor states
   - Cursor changes to pointer (hand) on hover
   - Grid padding prevents border cutoff on top/bottom rows
   - Consistent with border selector behavior
   - Files: `components/MotifSelectorPanel.tsx`, `app/select-motifs/_ui/MotifSelectionGrid.tsx`

7. **Motif Path Fix**: Updated to use public/motifs/ directory
   - Changed from old XML paths to new public directory structure
   - Uses files.txt for category-to-folder mappings
   - API endpoint serves SVG files from correct location
   - Files: `components/MotifSelectorPanel.tsx`, `app/api/motifs/[category]/route.ts`

8. **Bronze Plaque Color Control**: Hides color selection when color="0"
   - Checks `catalog?.product?.color === '0'` to hide color controls
   - Motif and inscription colors remain fixed (no color picker)
   - Only shows colors for products with `color="1"`
   - Files: `components/DesignerNav.tsx`

9. **Hydration Error Fix**: Removed SSR/client mismatch in MotifSelectorPanel
   - Eliminated `typeof window !== 'undefined'` check in useState
   - State now initialized uniformly on client and server
   - Files: `components/MotifSelectorPanel.tsx`

### ✅ Recent Changes (January 29, 2026)
1. **Canonical Loader Scaling Fix**: Reduced one canonical scaling issue, but did not fully solve Design 2
   - Removed dynamic scale factor calculation that compared old design dimensions with new ones
   - Set all scale factors to 1.0 for canonical designs (coordinates already in correct space)
   - This improved one class of canonical scaling errors, but later investigation showed `1578016189116` still has unresolved forevershining-specific layout issues
   - Files: `lib/saved-design-loader-utils.ts`

2. **Texture Mapping Enhancement**: Added numbered texture mapping to converter
   - Converter now maps `forever2/l/17.jpg` → `Glory-Black-1.webp`
   - Converter now maps `forever2/l/18.jpg` → `Glory-Gold-Spots.webp`
   - Matches DesignPageClient texture mapping logic
   - Files: `scripts/convert-legacy-design.js`

3. **Motif Color Recoloring Fixed**: SVG rasterization now supports dynamic color changes
   - Converts rasterized SVG to grayscale alpha mask (white shape + alpha channel)
   - Material `color` prop now properly tints the white mask
   - Uses luminance inversion to preserve shape detail in alpha
   - Files: `components/three/MotifModel.tsx`

4. **Load Design Buttons Always Active**: Removed "loaded" state that disabled buttons
   - All "Load Design" buttons stay clickable for back-to-back comparisons
   - Allows switching between designs freely
   - Each click clears existing design and loads fresh
   - Files: `components/LoadDesignButton.tsx`, `components/DefaultDesignLoader.tsx`

5. **Multi Design Loading**: Added dedicated loader buttons for each canonical regression sample
   - "Load Design 1": Loads canonical design `1725769905504` (Curved Gable biblical)
   - "Load Design 2": Loads canonical design `1578016189116` (forevershining 3-person memorial)
   - "Load Design 3": Loads canonical design `1723691641046` (Laser-etched Serpentine family memorial)
   - Buttons stacked in top-right corner (top-4, top-20, top-36 positioning)
   - Files: `components/ConditionalCanvas.tsx`, `components/LoadDesignButton.tsx`

6. **Loading Spinner Drop Shadow Removed**: Cleaned up loader styling
   - Removed `drop-shadow` class from loading overlays
   - Files: `components/LoadingOverlay.tsx`, `components/ThreeScene.tsx`

### ✅ Recent Changes (January 28, 2026)
1. **Manual Design Loading**: Automatic design loading disabled. Headstone now starts completely empty.
   - `components/DefaultDesignLoader.tsx` converted to manual trigger via `useLoadDesign()` hook
   - New "Load Design" buttons in top-right corner
   - See `LOAD_DESIGN_BUTTON.md` for implementation details

2. **Default 3D Additions Removed**: 
   - Removed `B2127` (Cross) and `B1134S` (Angel) from default state
   - `selectedAdditions: []` in `lib/headstone-store.ts`
   - Users start with clean empty headstone

3. **Check Price Always Enabled**:
   - Modified `components/DesignerNav.tsx` to enable "Check Price" even with empty headstone
   - Users can see base price before adding any content
   - Exception added: `item.slug !== 'check-price'` in disabled logic

### 🔧 Fixed Issues
- ✅ **Canonical loader scaling bug**: Scale factors now set to 1.0, preventing dimension mismatch
- ✅ **Texture mapping**: Numbered textures (17.jpg, 18.jpg) now properly mapped to named files
- ✅ **Motif recoloring**: Color picker now works with rasterized SVG motifs
- ✅ **Design switching**: Load buttons remain active, allowing free design switching

### ⚠️ Known Issues
- None currently reported

## Project Overview

A Next.js-based 3D headstone designer allowing users to:
- Select headstone shapes, materials, and sizes
- **Select headstone style** (Upright or Slant)
- **Select base finish** (Polished or Rock Pitch)
- Add inscriptions with custom fonts and positioning (simple click-and-drag)
- Place decorative motifs (SVG-based with dynamic color changes)
- Add 3D models (statues, vases, applications)
- **Upload and crop custom images** (ceramic, vitreous enamel, laser-etched)
- View real-time 3D preview with texture mapping
- Calculate pricing based on configuration
- Save and load designs

### Product Types
- **Traditional Engraved Headstones**: Granite/marble with sandblasted and painted text (shadow effect, no outline)
- **Laser Etched Black Granite**: High-detail laser etching (outlined text with 0.002 unit black outline)
- **Bronze Plaques**: Metal plaques with decorative borders and emblems (no outline on inscriptions)
  - **Rectangle (Landscape)**: 300×200mm (default)
  - **Rectangle (Portrait)**: 200×300mm
  - **Square**: 300×300mm
  - **Oval (Landscape)**: 400×275mm
  - **Oval (Portrait)**: 275×400mm
  - **Circle**: 400×400mm

### Headstone Style Options
- **Upright**: Traditional vertical headstone (default)
- **Slant**: Beveled headstone tilted at 30° angle with trapezoidal profile

### Base Finish Options
- **Polished**: High-gloss polished granite with clearcoat (default)
- **Rock Pitch**: Hand-chiseled turtle shell pattern with polished flat top (PFT)

### Plaque-Specific Features
**Plaques** have a simplified UI compared to headstones:
- **No Base Toggle**: Plaques don't show Headstone/Base tabs (single "Plaque" label)
- **No Thickness Control**: Fixed 10mm depth (from XML catalog)
- **Border Options**: 
  - "No Border" (maps to `headstoneStyle: 'upright'`)
  - "Border" (maps to `headstoneStyle: 'slant'`)
  - Convert Design automatically toggles a decorative border when the destination catalog exposes `border="1"`, and clears it for non-border products.
- **Color Defaults**: When switching into plaques we immediately repaint inscriptions and motifs with the catalog’s `default-color` (Bronze Plaque uses `#ffb35a`) so legacy gold/white schemes don’t clash.
- **No Outline**: Inscriptions render without black outline for clean appearance
- **Shape Sources**:
  - Rectangles: `/shapes/headstones/landscape.svg`, `portrait.svg`
  - Ovals & Circle: `/shapes/masks/oval_horizontal.svg`, `oval_vertical.svg`, `circle.svg`
- **Sizing Guardrails**: Square-to-plaque conversions clamp to 300 mm × 300 mm (catalog min/max permitting) while landscape plaques default to 300 mm × 200 mm.
- **Pricing**: Uses `quantity_type="Width + Height"` from catalog

### Load Design Feature (updated March 25, 2026)
**Manual Design Loading** with modal tree picker:
- Headstone starts **completely empty** (no inscriptions, motifs, or 3D additions)
- Single **"Load Design" button** in the canvas opens a searchable modal
- Modal presents hierarchical tree:
  - product type -> category -> design
- Design rows use SEO-style names (shape + cleaned slug) matching `/designs` nav conventions
- Product/category order follows source dataset order (not forced alphabetical sorting)
- Each load clears existing design before loading new one

**Components:**
- `components/LoadDesignButton.tsx` - Canvas button + modal tree/search picker
- `components/DefaultDesignLoader.tsx` - Exports shared `loadDesignById()` and `useLoadDesign(designId)` helpers
- `components/ConditionalCanvas.tsx` - Renders the single load button in the canvas overlay

---

## Architecture

```
next-dyo/
├── app/                    # Next.js 15 App Router
│   ├── _internal/          # Internal data (fonts, products, inscriptions)
│   ├── designs/            # Design gallery pages (SEO-optimized)
│   │   ├── [productType]/  # Product pages with metadata
│   │   │   ├── page.tsx            # Server component with SEO metadata
│   │   │   ├── ProductPageClient.tsx  # Client component for UI
│   │   │   └── [category]/         # Category pages
│   │   │       ├── page.tsx            # Server component with metadata
│   │   │       ├── CategoryPageClient.tsx  # Client with price display
│   │   │       └── [slug]/             # Individual design pages
│   │   │           ├── page.tsx            # Server component with metadata
│   │   │           └── DesignPageClient.tsx  # Full design viewer
│   ├── inscriptions/       # Inscription selection
│   ├── design-menu/        # Clean menu view (no panel highlighted, canvas visible)
│   ├── products/           # Product landing pages
│   └── select-*/           # Step-by-step designer pages
├── components/             # React components
│   ├── three/              # Three.js/R3F components
│   │   ├── headstone/      # Headstone assembly
│   │   ├── AdditionModel   # 3D model additions (GLB loader)
│   │   ├── MotifModel      # SVG motif overlay
│   │   ├── ImageModel      # Custom image overlay (ceramic, enamel, laser-etched)
│   │   ├── BoxOutline      # Selection outline
│   │   └── SelectionBox    # Simple drag handles (elderly-friendly)
│   ├── SvgHeadstone.tsx    # Main headstone geometry
│   ├── HeadstoneInscription.tsx # 3D text inscriptions
│   ├── ImageSelector.tsx   # Image type selection panel
│   ├── ImageCropPanel.tsx  # Interactive crop interface with mask overlay
│   └── ThreeScene.tsx      # Canvas wrapper
├── lib/                    # Utilities & state
│   ├── headstone-store.ts  # Zustand global state
│   ├── xml-parser.ts       # Catalog/pricing parser
│   ├── motif-pricing.ts    # Motif pricing
│   ├── extract-price.ts    # Price extraction from HTML quotes
│   ├── saved-designs-data.ts  # Design metadata & indexing
│   └── headstone-constants.ts
├── public/
│   ├── shapes/             # SVG shape outlines
│   │   ├── headstones/     # Headstone shapes + rectangle plaques
│   │   └── masks/          # Plaque oval & circle shapes + image crop masks
│   ├── textures/           # Material textures (granite, etc.)
│   ├── motifs/             # SVG decorative motifs
│   ├── additions/          # GLB 3D models
│   ├── fonts/              # Custom font files
│   ├── jpg/photos/         # Image type thumbnails (ceramic, enamel, etc.)
│   └── xml/en_EN/          # Translation files including images.xml
│   ├── canonical-designs/  # Canonical v2026+ JSON snapshots for mm-accurate loading
│   └── ml/                 # Saved designs & price quotes
│       └── forevershining/
│           └── saved-designs/
│               ├── html/       # Price quote HTML files
│               ├── json/       # Design data JSON
│               └── xml/        # Legacy design XML
├── scripts/               # Conversion/diagnostic tools (see below)
└── styles/                 # Global CSS + Tailwind
```

### Conversion Scripts (2026-01-25)
- `scripts/convert-legacy-design.js`: Rebuilds a canonical v2026 JSON snapshot from the original ML/legacy JSON, including sanitized inscription text, mm scaling, and motif metadata. As of 2026‑01‑25 the converter parses the `navigator` viewport string first (e.g., `1102x689`) so we know the exact canvas size that the legacy user worked within, preserves any desktop DPR > 1 if physical coordinates are detected, and mirrors the DesignPageClient math for mm-per-pixel + Y-down handling. Use it to regenerate `/public/canonical-designs/v2026/{designId}.json` before loading designs in the new 3D editor.
- `scripts/convert-saved-design.js`: Batch helper for transforming multiple legacy saves; currently mirrors the legacy converter’s API and is kept for experimentation.

---

## Coordinate System

### Units: **1 unit = 1mm**
All positioning uses millimeters as the base unit in the bounding box coordinate system.

#### Legacy vs Canonical Coordinate Systems (2026-01-23)

**Legacy JSON Format** (`/public/ml/**/saved-designs/json/*.json`):
- Stores `x/y` pixel offsets relative to **canvas center**
- Coordinate system: **Y-down** (positive Y = below center)
- Canvas represents the viewport at design time (e.g., 1102×689 pixels parsed from the `navigator` string)
- DPR (device pixel ratio) affects the canvas resolution; we now preserve the raw desktop DPR whenever coordinates fall outside the logical half-width/height + 50px window (physical-mode saves), otherwise we fall back to 1.0

**Coordinate Conversion (Pixels → Millimeters):**
``javascript
// At design time:
designCanvasWidth = viewportWidth × designDpr
designCanvasHeight = viewportHeight × designDpr
pixelsPerMmX = designCanvasWidth / productWidthMm
pixelsPerMmY = designCanvasHeight / productHeightMm

// Convert to 3D editor coordinates (mm from center):
xPos = xPixels / pixelsPerMmX
yPos = yPixels / pixelsPerMmY  // NO negation - both use same conversion
``

**Key Insight:** Despite the legacy system using Y-down convention, the conversion to the 3D editor does NOT negate Y. Both inscriptions and motifs use identical conversion: `yPos = yPixels / pixelsPerMmY`.

**Viewport Detection Update (2026-01-25):** The loader and converter now prefer the `navigator` string’s `width×height` dimensions over `init_width/height`. This keeps the pixel-to-mm ratio anchored to the actual design-time viewport and prevents the physical-coordinate heuristic from triggering when coordinates only appeared “too large” because we had defaulted to a smaller canvas.

**Canonical JSON Format** (`/public/canonical-designs/v2026/*.json`):
- Created by `scripts/convert-legacy-design.js`
- Stores `position.x_px` and `position.y_px` in stage pixels (centre-origin); loaders convert to mm using the canonical viewport metadata
- Values are pre-converted and ready to use directly in 3D editor
- **Inscriptions:** Use `legacyYToCanonical()` which accounts for base offset
- **Motifs:** Use simple `pixels / pixelsPerMm` conversion (same as legacy loader)
- Both are loaded without additional transformations

**Legacy Fallback Path:**
- When canonical JSON includes `legacy.raw` array, the loader uses this for motifs
- Recalculates positions from pixel data using same formula as legacy loader
- Ensures backward compatibility with existing designs

**Canonical Loader Guardrails (2026-01-25):**
- `loadCanonicalDesignIntoEditor()` now sanity-checks the canonical millimeter coordinates before applying them.
- If any inscription/motif exceeds the physical headstone+base envelope (or the spread suggests the data is still in stage-space pixels), the loader automatically swaps to the embedded legacy JSON and calls `loadSavedDesignIntoEditor()` so the design still renders correctly.
- The legacy fallback path shares the same viewport/DPR inference as the converter (navigator-first sizing + preserved DPR for physical saves) so loading a regenerated canonical file produces the exact layout seen in the DesignPageClient 2D preview.
- This keeps problematic canonical snapshots (e.g., partially converted files) from spawning clustered motifs or missing inscriptions while we regenerate the JSON via `scripts/convert-legacy-design.js`.
- **March 16, 2026 correction:** a later audit found the fallback reason was being checked before the real out-of-bounds detector was assigned, so this safeguard was not actually firing in the broken path. That bug has now been fixed in `lib/saved-design-loader-utils.ts`.

**Canonical Loader Behavior Update (2026-01-26):**
- Canonical JSON already stores physical millimeter values, so `loadCanonicalDesignIntoEditor()` now treats `size_mm` (fonts) and `height_mm` (motifs) as absolute numbers. The previous SIZE_SCALE_FACTOR-based approach caused “double scaling” and oversized text; that multiplier has been removed.
- Only positional coordinates use `X/Y_SCALE_FACTOR`, and that scaling exists solely to stretch layouts to the active stone dimensions—element dimensions themselves remain untouched.
- All design-specific hacks (e.g., special offsets for the surname “KLEIN”, epitaph lines, or bird/ivy motifs) have been deleted. The loader now applies one data-driven path for every design, making it safe to ingest thousands of canonical files without bespoke tweaks.
- Motif flips still mirror `flip.x` correctly (canvas vs canonical parity), and the loader continues to fall back to legacy JSON when canonical coordinates fail the physical-bounds sanity check.
- ⚠️ **Known Regression (2026-01-28):** The current canonical loader still produces major Y-offset errors for the newly converted design `1578016189116` (forevershining ML set). Until the stage→component transform is normalized per design, expect motifs/inscriptions to land too high and, in some cases, mirrored vertically. Use `public/screenshots/1.png` as the visual reference when reworking this math.
- **March 16, 2026 update:** the codebase now carries an explicit canonical `scene.coordinateSystem` contract (`positionMode`, `headstonePlacement`, `flipMode`) so future regenerated files no longer need to rely only on `mlDir` heuristics. This improved the loader architecture, but it did **not** fully fix `1578016189116`; that design still needs another pass.

**Common Pitfall:** 
The old comment "// OLD designs: saved in Y-down coordinates (entire group was Y-flipped)" was misleading. The legacy 3D renderer did NOT flip the entire scene. The conversion formula `yPos = yPixels / pixelsPerMm` works for both inscriptions and motifs without negation.
### Headstone Geometry
- **SVG scale**: 0.01 (scaled down in world space)
- **BBox units**: Direct mm values (e.g., 600mm width)
- **unitsPerMeter**: ~667 (conversion factor from SVG to world space)
- **`mmToLocalUnits`**: varies per surface — ~1.0 for standard headstones, ~1.739 for landscape plaques, 0.001 for base

### Base Surface Coordinate System (Updated 2026-04-08)
- **Base mesh**: `BoxGeometry(1,1,1)` — unit cube, `unitsPerMeter = 1`
- **Position/scale**: Set by `HeadstoneBaseAuto.useFrame()` via lerp, NOT React state
- **`mmToLocalUnits = 0.001`** — converts mm to base local units (unit cube scaled in meters)
- **Inscription/motif rendering**: Must use `useFrame` to track base mesh position every frame (React render sees `(0,0,0)`)
- **Drag conversion**: Unit-cube local coords → mm offsets via `localPoint * baseDim` (where baseDim comes from mesh scale × 1000)

### Legacy Position Conversion Chain (Updated 2026-04-08)
1. Legacy px coordinates (center-origin, from CreateJS canvas at DPR-scaled resolution)
2. → mm offsets via `uniformMmPerPx = maxMonumentDimensionMm / legacyMonumentDrawPx`
3. → stored as `coordinateSpace: 'mm-center'` in Zustand store
4. → `HeadstoneInscription.useEffect` converts to absolute SVG local units: `absY = bounds.centerY + yPosMm * mmToLocalUnits`
5. → stored back with `coordinateSpace: undefined`
6. → rendered via default `groupPosition` path: `[pos.x + xPos, pos.y + yPos, pos.z]`

**Key Ratios:**
- Position conversion: `mmPerPx = headstoneHeightMm / (init_height × DPR)` — DPR-scaled physical px
- Font size conversion: viewport-based `HEADSTONE_MM_PER_PX_Y_CANONICAL` — CSS px (not DPR-scaled)

### Z-Positioning (Depth)
- **Headstone surface**: `headstone.frontZ` (front face of stone)
- **Inscriptions**: `frontZ + 0.05mm` (prevents z-fighting while keeping flush)
- **Motifs**: `frontZ + 0.05mm`
- **Additions (applications)**: `frontZ + 0.05mm`
- **Additions (statues/vases)**: `frontZ` (on base)

### Scaling
- **Inscriptions**: `sizeMm` is directly in mm (e.g., 50mm height)
- **Motifs**: `heightMm` target size in mm (e.g., 100mm)
- **Additions**: Target heights in mm (statue: 150mm, vase: 120mm, application: 100mm)
  - **Z-scale factor**: 0.1 (flattened to 10% depth for applications)

---

## Product Types & Rendering

### Traditional Engraved (Sandblasted & Painted)
**Visual Effect:** Painted infill without outlines (shadow stack removed Jan 26 to match canonical reference art)

**Implementation:**
- **No outline** on text/motifs
- **No faux shadow layers** – inscriptions now render flush at `frontZ + 0.05mm`, relying on fill color alone
- Keeps surfaces readable in both 2D mockups and the 3D designer without the blurry halo we previously added

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

### Bronze Plaques
**Visual Effect:** Clean metal surface without outlines

**Implementation:**
- **No outline** on text/motifs (same as Traditional Engraved)
- Bronze material texture from XML catalog
- Fixed 10mm depth
- Simplified UI (no base, no thickness controls)
- **Emblems**: Decorative PNG icons (236 available), placed on plaque surface with drag-to-position, 7 fixed sizes (50–400mm controlling largest dimension, proportional aspect), rotation, flip. Sidebar panel with search grid + edit controls.
- **No Additions**: Select Additions menu item hidden for plaques (not applicable)

**Border Workflow (2026-01-17, updated 2026-02-07):**
- Catalog products flagged with `border="1"` (all bronze plaques) automatically advance to **Select Border** after the user confirms a shape. The shape selector now pushes to `/select-border` and dispatches `openFullscreenPanel('select-border')` so the sidebar panel opens immediately.
- `BronzeBorder.tsx` loads `/public/shapes/borders/{slug}.svg`, extrudes the supplier corner SVG once, scales it to ~25 % of the shorter plaque edge (70 % final size), mirrors it into each corner, and generates the connecting rails procedurally. All mirrored parts are converted to non‑indexed geometries and merged into a single mesh, eliminating the old floating box lines and ensuring a continuous bronze frame that sits flush on the plaque face.
- **2026-01-19 update:** every catalog slug now maps to a dedicated `borderXa.svg` file that already contains the extended rail artwork. BronzeBorder scales the merged SVG to the plaque bounds, clamps it inside a four-plane mask (±width/2, 0→height), and disposes/rehydrates textures for each load so the rail artwork stretches perfectly to whatever width/height the user selects without overlapping neighboring corners. The legacy dual-line rail generator still runs for any slug that lacks a suffixed SVG.
- **2026-01-20 rollback:** the experimental 9-slice border system from advice8/9 was reverted after a console error surfaced; BronzeBorder is presently back to the "single merged mesh" workflow with whole-group scaling plus the debounced rebuild/fast-path stretch described below. The 9-slice plan (per advice7‑9) remains documented for future reimplementation once the runtime error is understood, and the refreshed `border1a.svg` now ships at 4800×4800px so its engraved detail stays crisp even though the current code continues to scale the entire mesh uniformly.
- **2026-02-07 update:** edge thickness, line gaps, and decorative rail spans now scale off the plaque’s shorter side with aggressive compression on near-square plaques, fallback inset anchors inherit the same scaling so the dual selection rails hug the plaque edges, and the bronze highlight color lightened to `#FFDFA3` for better contrast. *(Resolved 2026-02-14 — inset clamps now subtract an extra 12 mm per edge on ≤0.9 aspect plaques, matching the latest QA captures.)*
- **2026-04-08 fix:** border coverage targets increased from 78-90% to 97-99% and initial `uniformScale` multiplier from 2.5× to 5.0×. Small plaques (e.g., 306×200mm) now match legacy border sizing where ornaments fill nearly the entire plaque face.

**Detection:**
```typescript
const isPlaque = catalog?.product.type === 'plaque';
```

### Full Color Plaque (Product 32)
**Visual Effect:** Photographic background image on a stainless steel frame

**Implementation:**
- **Ceramic plaque** with full-colour photographic backgrounds (40 options in `/jpg/backgrounds/forever/`)
- **Stainless steel frame** — not bronze. Uses `generateStainlessSteelTexture()` in `BronzeBorder.tsx`
- **Fixed sizes only** — 9 preset dimensions (110×150 to 280×380mm) with fixed prices ($350–$990)
- **2 shapes**: Rectangle Landscape + Rectangle Portrait (width↔height transposed)
- **2 border options**: No Border, Stainless Steel Border (Border 4, fixed $299 add-on)
- **Fixed physical frame width**: SS border frame stays ~constant physical width regardless of plaque size (thicker-looking on small plaques, thinner on large). Uses `fixedFrameFactor = 200 / minDimensionMm` with no clamping, and skips coverage clamping that bronze borders use.
- **Background selector**: "Select Material" renamed to "Background" in nav. Shows 40 background thumbnails (`/jpg/backgrounds/forever/m/`) in the MaterialSelector grid. Selecting one sets it as the plaque face texture.
- **No Additions, no Emblems**: Simplified workflow — shape → border → background → size → inscriptions
- **Free Image auto-selection**: Only Free Image (type 137) is relevant. Auto-selected on mount, skipping the image type grid. No ceramic mesh — image is printed flat on plaque surface at `0.05mm` z-offset. No mask shape selection (oval/rectangle/heart hidden).
- **No Gold/Silver Gilding**: Product uses `formula="Enamel"`, so gilding color shortcuts are hidden (only regular color palette shown)

**Detection:**
```typescript
const isFullColourPlaque = catalog?.product.id === '32';
// productId is string|null — use === '32' not === 32
```

**Config:** `public/xml/catalog-id-32.xml` — `material="backgrounds"`, `materialID="17"`, `border="1"`, `fixed="1"`, `sizes="9"`

### Motif Color Recoloring(2026-01-29)
**Implementation:** Dynamic color changes on rasterized SVG motifs

**Challenge:** SVGs are rasterized to high-quality bitmaps for sharp rendering. Original colors were baked into the texture, preventing color changes.

**Solution:** Alpha mask extraction + material tinting
```typescript
// Convert rasterized image to white shape with alpha channel
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const data = imageData.data;
for (let i = 0; i < data.length; i += 4) {
  const luminance = (data[i] + data[i + 1] + data[i + 2]) / 3;
  // Set all pixels to white
  data[i] = data[i + 1] = data[i + 2] = 255;
  // Use inverted luminance as alpha (dark = opaque, light = transparent)
  if (data[i + 3] > 0) {
    data[i + 3] = 255 - luminance;
  }
}
```

**Material Setup:**
```typescript
<meshBasicMaterial
  color={color}  // User-selected color tints the white texture
  map={alphaTexture}
  transparent
  alphaTest={0.01}
/>
```

**Result:**
- SVG detail preserved in alpha channel
- Color picker dynamically recolors motifs
- High quality maintained (2048px textures)
- No performance impact

---

## Pricing System

### Shared Quantity Helper: `computeQuantity()`
All pricing calculations go through `computeQuantity(priceModel, dims)` in `lib/xml-parser.ts`. This replaced duplicated switch/if logic across 7 files.

```typescript
export function computeQuantity(
  priceModel: PriceModel,
  dims: { width: number; height: number; depth: number },
): number {
  switch (priceModel.quantityType) {
    case 'Width * Height':  return dims.width * dims.height;
    case 'Width + Height':  return dims.width + dims.height + dims.depth;
    case 'Width':           return dims.width + dims.depth;
    case 'Area':            return dims.width * dims.height;
    default:                return dims.width + dims.height + dims.depth;
  }
}
```

### Legacy 3D Volume-Based Pricing (Critical Reference)
The legacy 3D system (`createJS/Quote.js:1476-1486`) overrides `quantityType` to `"Area"` for ALL products in 3D mode **except** IDs 4, 5, 30, 34. In legacy "Area" mode, pricing uses `MODEL_STONE_VOLUME_CUBIC_METERS` (actual 3D mesh volume) × material m³ price × retail multiplier — fundamentally different from XML formula pricing.

Since we don't have m³ material pricing data, we adapted by including `depth` (thickness) in the formula-based quantity for `"Width + Height"`. This means headstone thickness always affects price, matching the legacy system's behavior where volume (which inherently includes depth) determines cost.

### Quantity Type Calculation
Pricing is based on the `quantity_type` specified in the XML catalog for each product.

**Headstone Pricing:**
- **Quantity Type**: `"Width + Height"` (perimeter + depth)
- **Formula**: `quantity = widthMm + heightMm + uprightThickness`
- **Model**: `"600.00+1.32($q-600)"` (base price + rate per mm over threshold)
- **Example**: 600mm wide × 900mm tall × 50mm thick = 1550mm quantity

**Base Pricing:**
- **Quantity Type**: `"Width"` (width + thickness)
- **Formula**: `quantity = baseWidthMm + baseThickness`
- **Model**: `"294.00+0.34($q-300)"` (base price + rate per mm over threshold)
- **Example**: 700mm wide + 250mm thick = 950mm quantity
- **IMPORTANT**: Base thickness affects price (changes when slider moves)

**Plaque Pricing:**
- **Quantity Type**: `"Width + Height"` (perimeter-based)
- **Formula**: `quantity = widthMm + heightMm`
- **Model**: `"143.00+0.4273($q-160)"` (base price + rate per mm over threshold)

**Inscription Pricing** (`xml/en_EN/inscriptions.xml`):
- **Quantity Type**: `"Height"` — uses `sizeMm` (font height in mm) as quantity
- **Color-aware tiers**: Prices have `note` field (Gold Gilding, Silver Gilding, Paint Fill)
- **Product examples**: Product 16 (Free/Black Granite), Product 41/42 (Steel), Product 78 (Bronze), Product 125 (Traditional Engraved), Product 1701 (Enamel/Free)
- **Store field**: `inscriptionPriceModel` set during `setProductId()`, `inscriptionCost` recalculated via `calculateInscriptionCost()`

**Motif Pricing** (`xml/en_EN/motifs.xml` via `lib/motif-pricing.ts`):
- **Quantity Type**: Height-based — uses motif `heightMm`
- **Color-aware**: Gold Gilding, Silver Gilding, Paint Fill tiers
- **Laser exemption**: Laser-etched products have free motifs (`isLaser = true`)
- **Store field**: `motifPriceModel` fetched on product load, `motifCost` recalculated via `calculateMotifCost()`

**Image Pricing** (`xml/en_EN/images.xml` via `lib/image-pricing.ts`):
- **Quantity Type**: `"Width + Height"` — image widthMm + heightMm
- **Color mode**: BW vs Color tiers (note field matching)
- **Size variants**: `getImageSizeOption(typeId, sizeVariant)` returns predefined widths/heights
- **Store field**: `imageCost` recalculated via `calculateImageCost()` (async — fetches XML on first call)

**Addition Pricing** (`xml/en_EN/motifs-biondan.xml` pre-computed in `_additions-loader.ts`):
- **Pre-computed**: `FALLBACK_SIZES[sourceId][variant-1].retailPrice` — retail price per product + size variant
- **Formula**: XML formula × retail_multiplier (e.g., `76.11+0($q-245)` × 2.6 = $197.89)
- **Store field**: `additionCost` recalculated via `calculateAdditionCost()`

### Price Calculation
```typescript
function calculatePrice(priceModel: PriceModel, quantity: number): number {
  // Find applicable price tier
  const applicablePrice = priceModel.prices.find(
    (p) => quantity >= p.startQuantity && quantity <= p.endQuantity
  );
  
  // Parse model formula: "base+rate($q-offset)"
  const match = model.match(/(\d+(?:\.\d+)?)\+([\d.]+)\(\$q-(\d+)\)/);
  const base = parseFloat(match[1]);
  const rate = parseFloat(match[2]);
  const offset = parseInt(match[3]);
  
  // Calculate
  const adjustedQuantity = Math.max(0, quantity - offset);
  const price = base + rate * adjustedQuantity;
  
  // Apply retail multiplier
  return price * applicablePrice.retailMultiplier;
}
```

### Total Price Composition (Price Pill)
The floating price pill at the bottom of the 3D canvas (`ThreeScene.tsx`) shows:
```
totalPrice = headstonePrice + basePrice + ledgerPrice + kerbsetPrice
           + inscriptionCost + motifCost + imageCost + additionCost
```

Each `*Cost` field is a reactive store value updated via `calculate*Cost()` when items change.

---

## Core Components

### 1. **SvgHeadstone.tsx**
**Purpose:** Main 3D headstone geometry generator  
**Key Features:**
- Loads SVG outline, extrudes to 3D
- Applies texture mapping (face/side/top)
- Auto-scales to target dimensions, but preserves fixed-scale silhouettes for any SVG named `headstone_*` so sculpted shapes (guitar, wolf, seahorse, etc.) keep their surrounding surface/outline.
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
- **Smooth drag plane fallback** keeps motifs attached to the headstone even when the pointer briefly leaves the mesh (raycasts fall back to a Z-aligned plane and pointer-move tracking listens on `window`).

### 4. **AdditionModel.tsx**
**Purpose:** GLB 3D model loader (statues, vases, applications)  
**Key Features:**
- GLTF loader with texture support
- Auto-scaling to target heights (in mm)
- **Flattened Z-scale** for applications (0.1x depth)
- Click to select (no navigation, keeps canvas visible)
- Positioned in mm coordinate system
- **Shared drag smoothing** mirrors the motif logic: statues/vases stick to the base mesh, applications fall back to the headstone plane, and pointer tracking moves to `window` so fast drags never jump.

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

## Sidebar Navigation & Full-Screen Panels

### Overview
The designer sidebar now doubles as a modal-style workspace: clicking any "deep" section (Select Size, Shape, Material, Inscriptions, Additions, Motifs) hides the grouped menu and opens a full-height overlay with a warm gradient background, "Guided Step" label, and a prominent **Back&nbsp;to&nbsp;Menu** pill button. This keeps seniors focused on one task at a time, mirrors the calm tone used across the site, and prevents menu scroll fatigue on smaller displays. The overlay is powered by `activeFullscreenPanel`/`dismissedPanelSlug` state inside `components/DesignerNav.tsx`, and it preserves the current URL instead of using modals or query params.

### Section Headers — Elegant Memorial Brand (2026-04-15)
The three grouped sections (Setup / Design / Account) are styled to match the "Forever Shining" brand identity:
- **Playfair Display serif font** for section titles and step labels
- **Roman numerals** (I, II, III) in thin gold-stroked circles (`border-[#DEBD68]`)
- **Italic step labels**: "Step I", "Step II", "Step III" in serif italic
- **Golden thread**: A thin vertical gold gradient line connects sections visually
- **Accordion behavior**: Only one section open at a time. State: `openGroup` (number, `-1` = all closed). `toggleGroup(index)` opens clicked section, closes others. Auto-opens section matching active route.
- **Collapse animation**: `max-h-0 opacity-0` → `max-h-[2000px] opacity-100` with 300ms transition
- **Browse Designs CTA**: Gold border, Playfair Display font, sparkle icon
- **Select Emblems**: Only visible for Bronze Plaque (product ID 5) — uses `requiresBronzePlaque` filter

### Panels Covered
- **Select Size** – Shares the exact sliders/toggles documented earlier, but now consumes the entire sidebar height for effortless scrolling.
- **Select Shape** and **Select Material** – Their grids sit inside `flex-1 overflow-hidden` containers so the selectors stretch to the bottom of the viewport; the previous `max-h-*` caps were removed to avoid double scroll bars. **Note:** For Product 32 (Full Color Plaque), "Select Material" is relabeled "Background" in the sidebar, fullscreen panel header, and loading text. The `select-material` slug is excluded from the generic `fullscreenPanelSlugs` handler so the special-handling block with the conditional label runs instead.
- **Inscriptions** – Embeds `InscriptionEditPanel` so editing text or fonts feels identical whether opened from the menu or a canvas selection.
- **Select Additions** – Provides a split experience: if an addition is actively selected (`activePanel === 'addition'`), the top card reveals size, rotation, duplicate/delete controls, and context text; otherwise the full catalog grid is shown. Hidden for plaque products. Catalog visibility uses `hasActiveAdditionForPanel` (not bare `selectedAdditionId`) to avoid stale-selection bugs when returning to the panel.
- **Select Emblems** – Bronze plaque only (product ID 5). Shows a flat grid of 236 emblem thumbnails with search filter. Clicking adds the emblem to the plaque. When an emblem is selected on canvas, the edit panel shows a size slider (7 fixed steps controlling largest dimension), rotation, flip X/Y, duplicate/delete.
- **Select Motifs** – Mirrors the additions flow but also surfaces price estimates (non-laser products) plus the full color palette. Gold/Silver Gilding shortcuts only shown for Traditional Engraved products (`formula="Engraved"`). Motif preview thumbnails use the product's `defaultColor` from catalog for consistent coloring.
- **Convert Design** – Replaces the old 3D Preview link with a fullscreen product picker; it mirrors Select Product but enforces a single column list, so seniors can quickly audition alternate catalogs without leaving the designer.

### Layout & UX Notes
- The header button uses non-breaking spaces so "Back to Menu" never wraps (we no longer need a fixed 147px width).
- When the canvas is visible (select-size/material/etc.), clicking **Select Shape** now exclusively opens this fullscreen sidebar panel so the main column continues to host the Canvas instead of swapping in the gallery.
- Each panel runs inside `flex flex-col h-full -> flex-1 overflow-y-auto` stacks, giving ScrollViews predictably smooth momentum on tablets.
- Warm gold gradients, thin borders, and serif-friendly spacing match the memorial brand guidelines called out in SIDEBAR_IMPROVEMENTS.md.
- **Desktop header (Jan 2026)**: The fixed sidebar header now renders only the Forever Shining logotype; catalog-dependent "Current Product" copy, price, and dimensions were removed from desktop to keep the chrome calm, but the mobile drawer still surfaces that contextual info for smaller screens.
- **Mobile drawer (Jan 2026)**: On screens under 768px the hamburger opens the same DesignerNav content as a left-edge sheet (80% viewport width) while keeping the canvas visible. The drawer hides the "Back to Menu"/"Guided Step" chrome and relies on the hamburger toggle plus a translucent backdrop that closes on tap. Desktop retains the persistent sidebar.
- **Mobile header visibility (Jan 2026)**: `MobileHeader` now renders only on routes where the canvas is present (`/select-size`, `/inscriptions`, `/select-material`, `/select-additions`, `/select-motifs`). Homepage/marketing surfaces skip the header entirely so the larger hero logo and hamburger never overlap when the canvas is hidden.

### Context-Aware Editing
- Canvas selections still set `activePanel` (`'addition'`, `'motif'`, `'inscription'`), and the fullscreen overlays simply respect that state so users can tweak a piece the moment they click it in 3D.
- Addition and motif panels hide their detail cards when nothing is selected, reducing confusion and reinforcing the "select first, then adjust" mental model.
- Material and shape selectors keep the headstone/base toggle in view so seniors always know which part they are updating.

### Implementation Highlights
- `fullscreenPanelSlugs` defines which menu items should open over the nav. Current slugs: `select-size`, `select-shape`, `select-material`, `select-border`, `inscriptions`, `select-images`, `select-additions`, `select-emblems`, `select-motifs`.
- **Navigation from non-canvas routes** (e.g., `/select-product` → `/select-size`): `handleMenuClick` only calls `router.push()` and lets the route-sync `useEffect` open the panel once the page settles on a canvas-visible route. Opening the panel eagerly causes a bounce — the effect clears it (old route isn't canvas-visible) then re-opens after navigation.
- **Navigation from canvas routes** (e.g., `/inscriptions` → `/select-size`): `handleMenuClick` calls `openFullscreenPanel()` immediately (no route change needed or route already matches).
- **/design-menu route for Back to Menu** — `handleBackToMenu` (~line 382) calls `closeFullscreenPanel()` + `router.push('/design-menu')`. This route shows the full menu with no item highlighted and keeps the 3D canvas visible.
- Closing the overlay sets `dismissedPanelSlug` so re-opening the page doesn't auto-trigger the panel unless the user explicitly clicks again.
- See `FULLSCREEN_PANEL_SYSTEM.md` for wireframes, state diagrams, and future enhancement ideas (e.g., ESC shortcuts, slide animations).

### Testing Checklist
1. Click each fullscreen section → menu hides, overlay appears.
2. Press **Back to Menu** → overlay closes, navigates to `/design-menu`, menu restores with no item highlighted, canvas remains visible.
3. Select additions/motifs on the headstone → detail card appears with sliders and duplicate/delete buttons.
4. Scroll shape/material grids on small laptops → lists fill the column with a single scrollbar.
5. Switch between headstone/base toggles inside material/size panels → selection state stays synced with the canvas.
6. Navigate to `/select-additions` on desktop → additions grid should NOT flash over the canvas.

### Menu Item Enabled States (2026-01-28)
**Check Price Always Enabled:**
- Modified `components/DesignerNav.tsx` to enable "Check Price" menu item even with empty headstone
- Logic change: `const needsProduct = index >= 2 && item.slug !== 'check-price'`
- **Reason:** Users can view base price before adding any content (inscriptions, motifs, additions)
- Useful for price comparison and budgeting before starting design
- All other menu items (Select Material, Select Size, etc.) still require product selection

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
  uprightThickness: number;      // Upright headstone thickness (catalog-driven, e.g., 100-300mm)
  slantThickness: number;        // Slant headstone thickness (catalog-driven, e.g., 100-300mm)
  baseWidthMm: number;           // Independent base width (loaded from catalog XML)
  baseHeightMm: number;          // Independent base height (loaded from catalog XML)
  
  // Selections
  selected: 'headstone' | 'base' | null;
  editingObject: 'headstone' | 'base';
  selectedInscriptionId: string | null;
  selectedAdditionId: string | null;
  selectedMotifId: string | null;
  selectedEmblemId: string | null;  // Plaque emblems
  
  // Content (2026-01-28: Now starts empty by default)
  inscriptions: Line[];            // Text overlays (empty array on init)
  selectedAdditions: string[];     // 3D models (empty array on init - no default angel/cross)
  selectedMotifs: Motif[];         // SVG motifs (empty array on init)
  selectedEmblems: Array<{ id: string; emblemId: string; imageUrl: string }>;  // Emblem PNGs (plaque-only)
  emblemOffsets: Record<string, EmblemOffset>;  // Per-emblem position/size/rotation/flip
  
  // UI
  activePanel: PanelName | null;
  is2DMode: boolean;
  loading: boolean;
  
  // Catalog
  catalog: CatalogData | null;     // Parsed XML (see lib/xml-parser.ts)
  // CatalogData.product fields: id, name, type, laser, formula, border, color, defaultColor, shapes, additions, priceModel
  // formula values: "Engraved" | "Laser" | "Enamel" | "Bronze" (used for gilding filter, product behavior)
  inscriptionPriceModel: PriceModel | null;
  motifPriceModel: MotifProductData | null;
}
```

**Key Actions:**
- `setProductId()` - Load product catalog and initialize dimensions from XML (including base dimensions from stand element)
- `setShapeUrl()` - Change headstone shape
- `setMaterialUrl()` - Change texture  
- `setHeadstoneStyle()` - Toggle between upright/slant
- `setUprightThickness()` - Adjust upright depth (catalog-driven min/max, e.g., 50-50mm for Mini Headstone, 100-300mm for Traditional)
- `setSlantThickness()` - Adjust slant depth (catalog-driven min/max)
- `setBaseFinish()` - Toggle between polished/rock-pitch
- `addInscription()` - Add new text
- `updateInscription()` - Modify existing text
- `addMotif()` - Add SVG motif
- `addAddition()` - Add 3D model
- `addEmblem()` - Add emblem PNG to plaque (plaque-only)
- `setEmblemOffset()` - Update emblem position/size/rotation/flip
- `calculateInscriptionCost()` - Pricing
- `loadDesignFromXML()` - Import saved design

**Default State (2026-01-28):**
- Headstone starts **completely empty**: `inscriptions: []`, `selectedAdditions: []`, `selectedMotifs: []`
- Previous defaults removed: `B2127` (Cross) and `B1134S` (Angel) no longer auto-loaded
- Users can load any design via the canvas "Load Design" modal (uses shared `loadDesignById()` / `useLoadDesign(designId)` helpers)
- Design loading is now manual, not automatic on first visit

**Catalog-driven dimension rails (Jan 2026):** `setProductId()` now records the active shape’s min/max width, height, base, and thickness limits straight from the catalog XML. Every slider/input (including base width/height and upright/slant thickness) clamps against those live bounds, so compact products such as the Laser-etched Black Granite Mini Headstone (id 22) retain their exact 200 mm × 300 mm × 50 mm proportions on the canvas while still allowing larger monuments to use their broader ranges.

---

## 3D Rendering Pipeline

### Scene Setup (ThreeScene.tsx)
```tsx
<div className={`w-full h-full transition-opacity duration-500 ${sceneReady ? 'opacity-100' : 'opacity-0'}`}>
  <Canvas
    key="main-canvas"
    shadows
    dpr={[1, 2]}
    gl={{
      alpha: true,
      preserveDrawingBuffer: false,
      antialias: true,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false,
      stencil: false,
      depth: true,
    }}
    camera={{
      position: [0, 4.2, CAMERA_3D_POSITION_Z],
      fov: CAMERA_FOV,
      near: CAMERA_NEAR,
      far: CAMERA_FAR,
    }}
  >
    <Suspense fallback={null}>
      <Scene
        targetRotation={targetRotation}
        currentRotation={currentRotation}
        onReady={() => setSceneReady(true)}
      />
      <CameraController />
    </Suspense>
  </Canvas>
</div>
```
- A dedicated `sceneReady` flag now gates the entire `<Canvas>` behind a CSS opacity transition so `/select-size` regains its original fade-in. The flag resets whenever the shape/material changes **and** when `/select-size` mounts, ensuring the marketing handoff (“canvas should always fade in fresh on the size step”) stays true even when the user revisits the page with cached assets.
- To avoid unnecessary flashes, the fade sequence only retriggers when the user comes to `/select-size` from a non-canvas route (e.g., `select-product` or marketing pages); hopping between designer steps that already show the canvas keeps the preview visible instantly.
- `CameraController` was rewritten as a hook-based helper that taps directly into `useThree()`. It force-resets both the R3F camera and OrbitControls whenever the shape or material URL changes, so we no longer rely on a declarative `<PerspectiveCamera />` tree that the App Router might recycle between transitions.
- `Scene` still mounts `<AdaptiveDpr pixelated />`, so whenever the user rotates/zooms the memorial the renderer temporarily lowers DPR for smoother interaction, then restores full resolution when idle.

### Lighting (Scene.tsx)
- **Ambient Light**: Intensity `1.0` white fill so dark granite never disappears on tablets.
- **Hemisphere Light**: Sky `#fff8e7`, ground `#dcdcdc`, intensity `0.8` for warm upward bounce without adding blue.
- **Key Spot**: Warm sun (`#fffce6`) at `[-10, 12, 12]`, intensity `1.8`, angle `0.6`, penumbra `1`, casts the only dynamic shadow (ContactShadows handle ground contact).
- **Rim Spot**: Cool-white (`#ffffff`) at `[5, 5, -5]`, intensity `2`, distance `30` – adds a gentle outline between stone and background without overpowering inscriptions.
- **Environment**: Local HDRI (`/hdri/spring.hdr`) described below provides subtle reflections; no additional fill point lights are needed now that Ambient+Hemisphere are higher.

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

## 3D Scene Environment & Atmosphere

### Gradient Sky & Volumetric Accents (`Scene.tsx` + `SunRays.tsx` + `AtmosphericSky.tsx`)
**Purpose:** Keep the lightweight gradient dome for guaranteed horizon control while layering back art-directed volumetric clouds and a localized sunburst.

**GradientBackground:**
- Big sphere (`scale={[100, 100, 100]}`) rendered with a simple shader that keeps the lower 45% locked to fog color `#dcebf5` before easing into richer blue `#5ca0e5`.
- Positioned slightly below the world origin (`y = -10`) so the horizon line always sits behind the headstone base.
- Renders with `depthWrite={false}` and `renderOrder={-1}` so nothing clips against it.

**Volumetric Clouds:**
- `AtmosphericSky` now renders only the Drei `<Clouds>` layer (`showDome={false}`) so the gradient dome stays active while clouds float in front of it.
- Custom `MeshStandardMaterial` props (opaque white, emissive tint, disabled depthWrite/test) keep the clouds bright even against the sunburst.
- Five staggered cloud banks (different seeds/bounds) span `[ -12…+10 ]` on X and heights 9–13.5 to fill the horizon without obscuring the memorial.

**SunRays overlay:**
- Custom shader plane (`components/three/SunRays.tsx`) now sits at `[0, 4, -6]`, scaled to `[20, 9, 1]`, and `renderOrder={10}` so the animated rays glow **above** the cloud layer.
- Uses additive blending plus inner (`#fff8dc`) and outer (`#f2cf95`) colors with tunable opacity (0.65) and faster time-based pulsing for a shimmering sunrise effect.
- Ray density increased (`cos(angle * 14.0)`) so there are more individual beams, but each beam still eases off via cubic falloff to stay soft.
- Rendering is wrapped inside the same `<Suspense>` block as `HeadstoneAssembly` and additionally gated by `!is2DMode && !loading && !baseSwapping`, so the rays no longer appear on their own while the stone geometry or base swap is still loading.

**Sparkle Dust:**
- Drei `<Sparkles>` adds ~30 slow-moving particles around `[0, 2, 0]` for a subtle floating-dust effect. Opacity 0.4 and warm color tie into the gold UI accents.

### Grass Floor System (`Scene.tsx`)

**Grass Configuration:**
- **Color**: `#5a7f3c` (warmer green tuned to the new blue fog).
- **Plane Size**: `105×105` world units (down from 120) so more of the horizon and sun rays stay visible on ultrawide screens.
- **Texture Repeat**: `80×80` for long shots without clear tiling.
- **Wrapping**: `RepeatWrapping` to keep seams invisible with the larger repeat count.
- **Normal Scale**: `(0.5, 0.5)` for gentle bumps; `roughness={1}` keeps it matte.
- **Maps Loaded**: color, normal, AO (no dedicated roughness map anymore).
- **Fog**: Still enabled on the material so it fades into the gradient horizon.

**Texture Loading Snippet:**
```typescript
const props = useTexture({
  map: '/textures/three/grass/grass_color.webp',
  normalMap: '/textures/three/grass/grass_normal.webp',
  aoMap: '/textures/three/grass/grass_ao.webp',
});
```
- All textures switch to `THREE.RepeatWrapping`, share the same repeat, and clamp anisotropy to `Math.min(maxAnisotropy, 16)`.

**Grounding:**
- `ContactShadows` now bake in one frame (`frames={1}`) with `resolution={256}` so OrbitControls interactions stay smooth while keeping an anchored shadow oval under the base.

### Fog System

**Configuration:**
- **Color**: `#A8C9E6` (matches the new background color assigned via `<color attach="background" />`).
- **Range**: Start `1`, end `4` world units because the scene uses millimeter-scaled meshes — the short range keeps the fade tight to the subject.
- **Backplate Color:** Even though fog is short-range, the GradientBackground bottom color remains `#dcebf5`, so distant pixels still match.

### Click-Capture Plane

**Purpose:** Allows clicking empty space to deselect inscriptions/motifs.

**Implementation:**
- Horizontal plane at world origin (`planeGeometry[200, 200]`) rotated -90° on X.
- Transparent `meshBasicMaterial` with `opacity={0}` and `DoubleSide` so it never blocks the sunburst.
- Still critical to keep it horizontal; any tilt intrudes on the gradient + ray stack.

### Environment Map

**Current Setup:**
```tsx
<Environment
  files="/hdri/spring.hdr"
  background={false}
  blur={1.0}
  resolution={256}
  environmentIntensity={0.5}
/>
```
- Swapped from the remote `preset="forest"` to a local HDRI to avoid Vercel build stalls.
- Materials still tune their own `envMapIntensity` (grass stays at 0 to prevent blue spill) while the granite benefits from the warmer reflections.

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

**Issue: Canonical motifs float far above the stone**
- **Cause**: Many canonical v2026 files still store raw CreateJS stage coordinates (positive Y down, origin at the headstone+base midpoint). When `loadCanonicalDesignIntoEditor()` trusts those `position.y_mm` values, motifs are offset by the base height and appear in the sky.
- **Workarounds**:
  1. Prefer the legacy JSON fallback loader (it still divides by stage px-per-mm and shifts by ±half base/headstone heights).
  2. Re-run `node scripts/convert-legacy-design.js <designId>` to regenerate the canonical JSON immediately before loading.
  3. If the canonical loader must be used, add a detection flag (e.g., `meta.coordinates = 'stage'`) and only call the stage→mm shim when that flag is present.

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

**Issue: Statue Z-Position on Base (Resolved - 2026-02-14)**
- **Problem**: Statues position at front edge of base instead of centered in base depth
- **Symptoms**: 
  - X position: ✅ Correctly centered in left pad
  - Y position: ✅ Correctly on top surface
  - Z position: ❌ At front edge (near viewer) instead of centered
- **Attempted Solutions**:
  1. Calculate base center Z in base-local coords, convert to headstone space
  2. Use `baseMesh.localToWorld()` → `stone.worldToLocal()` transformation
  3. Get base world position via `getWorldPosition()`, convert to stone parent space
- **All Fail**: Despite different coordinate transformation approaches, statue still appears at front edge
- **Coordinate System Context**:
  - Base mesh has its own position/rotation in headstone parent coordinate system
  - Base position: `baseZCenter = -(alignmentDepth/2) + baseDTotal/2`
  - Statue parent group uses `position={[centerX + xPos, centerY - yPos, zPosition]}`
  - `zPosition` is in headstone parent coordinate system, not base-local
- **Debug Logging Added**: Lines 328-345 log coordinate transformations
- **Resolution (2026-02-14)**: `AdditionModel` now samples the base bbox midpoint in headstone space and persists that value as `zPos`, so statues and vases automatically clamp to the center of the pad depth when placed or reloaded.

---

## Design Gallery & SEO

### Overview
The design gallery system (`/designs/*`) provides a three-level hierarchy for browsing saved memorial designs with comprehensive SEO optimization:

```
/designs/[productType]/[category]/[slug]
         └─ Traditional  └─ Biblical  └─ curved-gable-may-heavens...
            Headstone       Memorial
```

### URL Structure & Metadata

#### Level 1: Product Pages (`/designs/traditional-headstone`)
**Purpose:** Browse design categories for a specific product type

**SEO Features:**
- **Dynamic Metadata**: Title, description, keywords based on product + design counts
- **Canonical URLs**: With language alternates (en-GB, en-US, en-AU)
- **OpenGraph Tags**: For social media sharing
- **Product Information Map**: Detailed descriptions for each product type

**Example Metadata:**
```typescript
{
  title: "Traditional Engraved Headstone Designs | Forever Shining",
  description: "Browse 847 traditional engraved designs across 42 categories. 
    Timeless granite memorials with sandblasted inscriptions...",
  keywords: "traditional engraved headstone, memorial designs, granite headstone, 
    biblical memorial, mother memorial, father memorial..."
}
```

**Files:**
- `app/designs/[productType]/page.tsx` - Server component with metadata generation
- `app/designs/[productType]/ProductPageClient.tsx` - Client component for UI

**Product Metadata Map:**
```typescript
const productMap = {
  'traditional-headstone': {
    name: 'Traditional Engraved Headstone',
    shortName: 'Traditional Engraved',
    description: 'Timeless granite memorials with sandblasted inscriptions...',
    type: 'Headstone'
  },
  'laser-etched-headstone': { ... },
  'bronze-plaque': { ... },
  // etc.
}
```

#### Level 2: Category Pages (`/designs/traditional-headstone/biblical-memorial`)
**Purpose:** Browse individual designs within a category

**SEO Features:**
- **Dynamic Metadata**: Category + product specific titles/descriptions
- **Design Specs Display**: Dimensions, granite name, and thumbnails for each design
- **Price Display**: Extracts total price from saved HTML quotes
- **Design Cards**: Grid layout with specs, descriptions, motif badges

**Design Specifications (`lib/extract-design-specs.ts`):**
- **Dimensions**: Width × Height in mm, rounded up with `Math.ceil()`
- **Granite Name**: Mapped from texture ID (e.g., "18" → "Glory Gold Spots")
- **Thumbnail**: 3D screenshot at `/screenshots/v2026-3d/{designId}_small.png` (300px wide, transparent PNG)

**Price Extraction:**
- Reads from: `/ml/{mlDir}/saved-designs/html/{designId}-desktop.html`
- Falls back to: `/ml/{mlDir}/saved-designs/html/{designId}.html`
- Displays: "From $X,XXX.XX" under each design card
- Implementation: `lib/extract-price.ts` utility

**Files:**
- `app/designs/[productType]/[category]/page.tsx` - Server component with metadata
- `app/designs/[productType]/[category]/CategoryPageClient.tsx` - Client with price display

**Example Price Display:**
```tsx
{designPrices[design.id] ? (
  <p className="text-lg font-serif text-slate-900">
    <span className="font-light text-sm text-slate-500">From </span>
    {designPrices[design.id]}
  </p>
) : (
  <p className="text-xs text-slate-500 font-light">
    View detailed pricing on design page
  </p>
)}
```

#### Level 3: Design Pages (`/designs/.../curved-gable-may-heavens-eternal...`)
**Purpose:** View individual design with full 3D preview and price quote

**SEO Features:**
- **Comprehensive Metadata**: Design-specific titles with shape names
- **Structured Data**: Product schema, BreadcrumbList, FAQ schema
- **Price Quote Modal**: Full HTML quote with clickable materials/motifs/shapes
- **Name Sanitization**: Replaces personal names with generic placeholders for privacy
- **Dynamic ML Directory**: Uses design's `mlDir` to load resources (supports all directories)

**Price Quote Loading:**
- **Dynamic Path**: Uses `mlDir` from design metadata (forevershining, headstonesdesigner, bronze-plaque)
- **Mobile/Desktop**: Loads different HTML based on viewport
  - Desktop: `/ml/{mlDir}/saved-designs/html/{designId}-desktop.html`
  - Mobile: `/ml/{mlDir}/saved-designs/html/{designId}.html`
- **Fallback**: Shows nothing if HTML doesn't exist (returns null)
- **Implementation**: `DetailedPriceQuote` component in `DesignPageClient.tsx`

**Files:**
- `app/designs/[productType]/[category]/[slug]/page.tsx` - Server component
- `app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx` - Full viewer

**Design Viewer Features (April 2026):**
- 3D screenshot display (`/screenshots/v2026-3d/{designId}.png`) — replaced old 2D SVG/inscription preview
- "Personalize Design" CTA button — loads design into 3D editor (gated on canonical load state)
- Full-screen loading overlay on navigation (dark bg + spinner)
- Detailed price quote with expandable sections
- "Similar Designs" and "More Memorial Designs" sections with 3D thumbnails

### Design Data Storage

**Directory Structure:**
```
public/ml/{mlDir}/saved-designs/
├── html/
│   ├── {designId}.html              # Mobile price quote
│   └── {designId}-desktop.html      # Desktop price quote
├── json/
│   └── {designId}.json              # Design configuration data
├── xml/
│   └── {designId}.xml               # Legacy design format
└── screenshots/                     # ⚠️ EXCLUDED from Vercel deploy via .vercelignore
    ├── {year}/{month}/              # Old 2D screenshots (4.3 GB total)
    │   ├── {designId}.jpg
    │   └── {designId}_small.jpg
    └── {designId}_small.jpg

public/screenshots/v2026-3d/          # NEW 3D screenshots (1 GB, 9,124 files)
├── {designId}.png                    # Full-size transparent RGBA PNG
└── {designId}_small.png              # Thumbnail (300px wide, ~19KB avg)
```

> **Note (April 2026):** The old 2D screenshots under `public/ml/*/saved-designs/screenshots/` are no longer used by any display code. All design pages, category pages, SEO metadata, and the Load Design popup now use `/screenshots/v2026-3d/` paths. The old directories (~4.3 GB, 95K files) are excluded from Vercel deploys via `.vercelignore` to prevent build timeouts.

**Supported ML Directories:**
- `forevershining` - Main design collection
- `headstonesdesigner` - Secondary collection
- `bronze-plaque` - Bronze plaque designs

### Canonical v2026 Saved Design Pipeline
- Canonical millimetre snapshots live under `public/canonical-designs/v2026/{designId}.json`, safely outside the `/designs/*` route tree.
- **P3D-converted designs** live under `public/designs/v2026-p3d/{designId}.json` — these come from the haxe 3D designer's binary `.p3d` format.
- **Rollout designs** live under `public/designs/v2026-rollout-full-*/` — batch-converted from companion JSON via `scripts/batch-convert-saved-designs.js`.
- `fetchCanonicalDesign()` (in `lib/saved-design-loader-utils.ts`) tries `v2026-p3d/` first, falls back to main rollout `v2026/` — this means p3d designs take priority when both exist.
- `loadCanonicalDesignIntoEditor` ingests these files and directly seeds the Zustand store—product, dimensions, materials, inscriptions, motif offsets, and **border name** (extracted from legacy raw data).
- `DesignPageClient.tsx`, `DefaultDesignLoader.tsx`, and `TestCanonicalLoader.tsx` all use `fetchCanonicalDesign()`.
- Position modes supported: `legacy-stage-px`, `surface-mm`, `p3d-mm-center`
- `p3d-mm-center` mode: positions are in mm from surface center, no DPR/stage compensation applied.
- **Bronze-plaque rollout designs**: Positions stored as `x_mm`/`y_mm` (not `_px`), font sizes as `size_mm`. Companion JSON uses mm units with Y-DOWN convention; converter negates Y for canonical Y-UP.

**Design Metadata** (`lib/saved-designs-data.ts`):
```typescript
interface SavedDesignMetadata {
  id: string;                    // Design ID (timestamp)
  slug: string;                  // SEO-friendly URL slug
  title: string;                 // Display title
  category: DesignCategory;      // Category slug
  productId: string;             // Product ID from catalog
  productSlug: string;           // Product URL slug
  productType: 'headstone' | 'plaque';
  productName: string;           // Full product name
  shapeName?: string;            // Shape display name
  preview: string;               // Legacy screenshot URL (no longer rendered — all display uses /screenshots/v2026-3d/)
  mlDir: string;                 // ML directory (e.g., 'forevershining')
  inscriptionCount: number;      // Number of inscriptions
  hasMotifs: boolean;            // Has motif decorations
  motifNames: string[];          // Motif display names
  hasPhoto: boolean;             // Has photo addition
  hasAdditions: boolean;         // Has 3D additions
}
```

### Price Extraction System

**Implementation** (`lib/extract-price.ts`):
```typescript
export async function extractTotalPrice(
  designId: string, 
  mlDir: string = 'forevershining'
): Promise<string | null> {
  // Try desktop HTML first
  let htmlPath = `/ml/${mlDir}/saved-designs/html/${designId}-desktop.html`;
  let response = await fetch(htmlPath);
  
  // Fall back to mobile HTML
  if (!response.ok) {
    htmlPath = `/ml/${mlDir}/saved-designs/html/${designId}.html`;
    response = await fetch(htmlPath);
  }
  
  if (!response.ok) return null;
  
  const htmlText = await response.text();
  
  // Extract price from HTML table
  const totalRegex = /<td[^>]*class="total-title"[^>]*>\s*Total:?\s*<\/td>\s*<td[^>]*>\s*\$?([\d,]+\.?\d*)\s*<\/td>/i;
  const match = htmlText.match(totalRegex);
  
  if (match && match[1]) {
    return `$${match[1]}`;  // Returns: "$3,791.75"
  }
  
  return null;
}
```

**HTML Structure:**
```html
<tr class="total-flex">
  <td class="empty-cell"></td>
  <td class="empty-cell"></td>
  <td class="total-title">Total</td>
  <td>$3791.75</td>
</tr>
```

### SEO Best Practices

**Metadata Generation:**
1. **Unique Titles** - Each page has distinct, descriptive title
2. **Rich Descriptions** - Include counts, features, materials
3. **Relevant Keywords** - Product terms + actual category names
4. **Canonical URLs** - Prevent duplicate content issues
5. **OpenGraph Tags** - Better social media previews
6. **Structured Data** - JSON-LD for Google rich results

**URL Structure:**
- Clean, descriptive slugs (kebab-case)
- Hierarchical paths matching content structure
- No unnecessary parameters or IDs in URLs

**Performance:**
- Server components for metadata (no client-side JS needed)
- ISR revalidation: 24 hours (86400 seconds)
- Static generation at build time where possible

### Documentation Files

- **PRICE_DISPLAY_FEATURE.md** - Price extraction implementation details
- **PRODUCT_PAGE_METADATA.md** - SEO metadata enhancement documentation

### Recent Updates (December 21, 2025)

1. **Price Display Feature**:
   - Added automatic price extraction from HTML quotes
   - Display "From $X,XXX.XX" on category pages
   - Created `extract-price.ts` utility
   - Updated `CategoryPageClient.tsx` with price state

2. **Product Page Metadata**:
   - Refactored to server component pattern
   - Added comprehensive SEO metadata
   - Created product information map
   - Added OpenGraph and Twitter cards
   - Language alternates for international SEO

3. **Design Gallery Architecture**:
   - Three-level hierarchy with consistent metadata
   - Client/server component separation
   - Price quotes integrated throughout
   - Proper TypeScript types for all design data

---

## Hero Search Bar

The homepage (`app/_ui/HomeSplash.tsx`) has an inline search form in the hero section that lets visitors find designs before entering the designer.

### How It Works

1. User types a query and submits the form
2. `router.push('/designs?q={query}')` navigates to the gallery with the query pre-filled
3. `app/designs/page.tsx` (async server component) reads `await searchParams` and passes `initialQuery` to `DesignsPageClient`
4. On mount, the client runs `searchDesigns(designs, mlIndex, { query: initialQuery })` with the locally-loaded `designs` array and renders results immediately

### Search Scope

Results are restricted to the **3,041 designs** that have 3D-regenerated screenshots (`public/screenshots/v2026-3d-ids.json`). This ensures every result card shows a high-quality rendered thumbnail.

### Thumbnail Chain

Each result card loads `/screenshots/v2026-3d/{id}_small.png` (transparent 3D PNG). On error, falls back to legacy `_small.jpg` derived from `design.preview`. If both fail, the image slot is hidden.

### Hero Layout

| Property | Value |
|----------|-------|
| Canvas height | `h-[45vh] sm:h-[49.5vh] min-h-[360px]` (−10% vs original) |
| Content padding | `pt-[100px] sm:pt-16` (shifted up) |
| Content alignment | `justify-start` (top-anchored) |

---

## Check Price Feature

### Overview
The Check Price page (`/check-price`) provides an interactive pricing breakdown with detailed item inspection.

### Main Layout
**Two-Column Design:**
- **Left Column**: "Your Design" - Summary of all selections
- **Right Column**: "Price Summary" - Subtotal, tax, and total

### Interactive Item Details (February 2, 2026)

**Clickable Counts:**
- Item counts are clickable links that open detail modals
- **Zero items** display as plain text (not clickable)
- **1+ items** display as white underlined text (hover → gold)

**Examples:**
```
Additions: 0 items (plain text)
Decorative Motifs: 8 motifs (clickable)
Custom Inscriptions: 9 inscriptions (clickable)
```

### Detail Modals

#### Inscription Details Modal
**Columns:**
1. **Name**: Inscription text + font name (below in small gray)
2. **Qty**: Character count (e.g., "15 chars" or "1 char")
3. **Size**: Font size in mm
4. **Color**: Color swatch (16×16px) + color name
5. **Price**: Individual inscription price

#### Motif Details Modal
**Columns:**
1. **Name**: Thumbnail image (48×48px) + motif filename
   - Entire row links to SVG file (opens in new tab)
   - Border changes to gold on hover
   - SVG inverted to white if color isn't black
2. **Size**: Height in mm
3. **Color**: Color swatch + display name (Gold Gilding, Silver Gilding, Paint Fill, etc.)
4. **(Empty)**: Alignment column
5. **Price**: Individual motif price

#### Addition Details Modal
**Columns:**
1. **Name**: Addition name + ID (below in small gray)
2. **Size**: Type (statue, vase, application)
3. **Color**: "-" (not applicable)
4. **(Empty)**: Alignment column
5. **Price**: Individual addition price (from `FALLBACK_SIZES[sourceId][sizeVariant-1].retailPrice`)

### Modal Styling
- **Dark luxury theme** (April 2026): Matches HomeSplash modal from home page — `rounded-3xl` container, `border-[#d4af37]/35` gold border, gold gradient glow overlay, eyebrow pill badge, serif title
- **Native dark classes**: All dark-theme styling via Tailwind classes (no CSS override hacks)
- **Gold accents**: Headers with gold gradient, `#d4af37` border accents, `#f3d48f` light gold text
- **Sticky headers**: Table headers stay visible while scrolling
- **Hover effects**: Rows highlight with subtle white/5 background
- **Close button**: `rounded-full border border-white/25 bg-black/25` matching HomeSplash style

### Implementation Files
- **Component**: `app/check-price/_ui/CheckPriceGrid.tsx`
- **State**: Uses `useState` for `detailModal` ('inscriptions' | 'motifs' | 'additions' | null)
- **Data**: Pulls from Zustand store (inscriptions, selectedMotifs, selectedAdditions)

### Technical Details

**Item Processing:**
```typescript
// Motif items with color display names
const motifItems = useMemo(() => {
  return selectedMotifs.map((motif) => {
    const offset = motifOffsets[motif.id];
    const heightMm = offset?.heightMm ?? 100;
    
    let colorDisplay = 'Standard';
    if (motif.color === '#c99d44') colorDisplay = 'Gold Gilding';
    else if (motif.color === '#eeeeee') colorDisplay = 'Silver Gilding';
    // ... etc
    
    return { id, name, svgPath, heightMm, color, colorDisplay, price };
  });
}, [selectedMotifs, motifOffsets, motifPriceModel, catalog]);
```

**Conditional Rendering:**
```typescript
{selectedMotifs.length > 0 ? (
  <button onClick={() => setDetailModal('motifs')}>
    {selectedMotifs.length} motif{selectedMotifs.length !== 1 ? 's' : ''}
  </button>
) : (
  <p>0 motifs</p>
)}
```

---

## Database & Catalog System

### PostgreSQL Schema (Drizzle ORM)

The application uses PostgreSQL with Drizzle ORM for type-safe database access.

**Core Tables:**
```typescript
// Accounts & Authentication
accounts { id, email, passwordHash, role, status }
profiles { accountId, firstName, lastName, phone, address }
accountSessions { id, accountId, refreshTokenHash, expiresAt }

// Catalog Data
materials { id, slug, name, category, finish, thumbnailUrl, attributes }
shapes { id, slug, name, section, maskKey, previewUrl, attributes }
borders { id, slug, name, category, svgUrl, attributes }
motifs { id, sku, name, category, tags, priceCents, previewUrl, svgUrl }
additions { id, name, type, categoryId, thumbnailUrl, model3dUrl, sizes }
sizes { id, productType, widthMm, heightMm, priceCents, sortOrder, isActive }
backgrounds { id, name, slug, category, textureUrl, thumbnailUrl, sortOrder, isActive }

// Design Data
projects { id, accountId, name, designState, screenshotPath, totalPriceCents }

// Orders & Payments
orders { id, accountId, status, totalCents }
orderItems { id, orderId, itemType, itemData, priceCents }
payments { id, orderId, method, status, amountCents }
```

### Database Seeding Scripts

**Materials Seeding:**
```bash
npm run db:seed-materials
```
- Seeds 29 granite materials from `app/_internal/_data.ts`
- Texture paths: `/textures/forever/l/*.webp`
- Categories: granite, finish: polished
- Script: `scripts/seed-materials.ts`
- Documentation: `MATERIALS_DATABASE_FIX.md`

**Shapes Seeding:**
```bash
npm run db:seed-shapes
```
- Seeds 55 headstone shapes from `app/_internal/_data.ts`
- Traditional (11): Cropped Peak, Curved Gable, etc.
- Modern (44): Headstone 1-39, Guitar 1-5
- SVG paths: `/shapes/headstones/*.svg`
- Script: `scripts/seed-shapes.ts`
- Documentation: `SHAPES_DATABASE_FIX.md`

**Additions Seeding:**
```bash
npm run db:seed-additions
```
- Seeds 82 additions from XML parser
- Categories: Biondan Bronze, Crosses, Roses, Statues, Vases
- Includes size variants with dimensions and pricing
- Script: `scripts/seed-additions.ts`
- Documentation: `ADDITIONS_MIGRATION_COMPLETE.md`

**Sizes Seeding:**
```bash
npm run db:seed-sizes
```
- Seeds 9 fixed sizes for product 32 (Full Color Plaque)
- Source: `public/xml/au_EN/sizes.xml` (product 201)
- Dimensions in mm, prices in cents
- Script: `scripts/seed-sizes.ts`

**Backgrounds Seeding:**
```bash
npm run db:seed-backgrounds
```
- Seeds 40 background textures from `public/xml/au_EN/backgrounds.xml` (category: `background`)
- Seeds 35 color textures discovered from `public/jpg/backgrounds/colors/s/*.jpg` (category: `color`)
- Full-size textures: `/jpg/backgrounds/forever/l/{1-40}.jpg`, `/jpg/backgrounds/colors/l/{01-35}.jpg`
- Thumbnails: `/jpg/backgrounds/forever/m/`, `/jpg/backgrounds/colors/s/`
- Script: `scripts/seed-backgrounds.ts`
- DB totals: 77 rows (40 active backgrounds + 2 inactive + 35 colors)

### Catalog Mappers

**Material Mapper** (`lib/catalog-mappers.ts`):
```typescript
function mapMaterialFromDB(dbMaterial) {
  return {
    id: dbMaterial.id.toString(),
    name: dbMaterial.name,
    image: dbMaterial.thumbnailUrl,
    category: dbMaterial.category,
  };
}
```

**Shape Mapper**:
```typescript
function mapShapeFromDB(dbShape) {
  return {
    id: dbShape.id.toString(),
    name: dbShape.name,
    image: dbShape.previewUrl,
    category: dbShape.section, // 'traditional' or 'modern'
  };
}
```

### Database Configuration

**Local Development:**
```bash
# .env.local
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/headstonesdesigner
```

**Drizzle Commands:**
```bash
npm run db:generate  # Generate migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio (GUI)
```

### Data Flow

1. **Server-side**: `app/layout.tsx` fetches catalog data from PostgreSQL
2. **Mappers**: `lib/catalog-mappers.ts` transforms DB records to UI format
3. **Store**: `lib/headstone-store.ts` receives mapped catalog data
4. **Components**: Selectors render materials/shapes from store

**Example:**
```typescript
// app/layout.tsx
const materials = await getMaterials();
const mappedMaterials = materials.map(mapMaterialFromDB);

// components/MaterialSelector.tsx
const materials = useHeadstoneStore(state => state.materials);
```

---

## ML Smart Search

### Overview
The ML smart search system provides intelligent filtering and ranking for the `/designs` gallery and the Load Design modal. It combines text search, category filtering, and TF.js model-based ranking.

### Data Sources
- **`public/ml/forevershining/ml.json`** — 3,021 design entries with classification labels
- **`public/ml/headstonesdesigner/ml.json`** — 1,100 design entries
- Each entry contains: `ml_style`, `ml_type`, `ml_motif`, `ml_tags` (comma-separated keywords)
- Categories: 6 types (Headstone, Plaque, Mini Headstone, Urn, Pet Headstone, Pet Plaque), 5 styles (Laser Etched, Traditional Engraved, Bronze, Stainless Steel, Full Color), 40+ motif categories

### TF.js Model
- **Topology**: `public/ml/forevershining/my-model.json`
- **Weights**: `public/ml/forevershining/my-model.weights.bin` (626,672 bytes)
- **Architecture**: Sequential — Dense(3→50, L2 0.01) → LeakyReLU → Dropout(0.3) → Dense(50→50) → LeakyReLU → Dropout(0.3) → Dense(50→3018, softmax)
- **Input**: Normalized indices `[type_idx/types_count, style_idx/styles_count, motif_idx/motifs_count]`
- **Output**: 3,018 design similarity scores
- **Usage**: Lazy-loaded via `@tensorflow/tfjs` when user enables ML ranking

### Key Files
- **`lib/ml-search-service.ts`** — Data loading, caching, text search (tokenized multi-word scoring), category filtering, TF.js model inference
- **`components/DesignSmartSearch.tsx`** — Search bar + Type/Style/Motif filter dropdowns + feature toggles (Has Photo, Has Motifs, Has Additions)
- **`app/designs/DesignsPageClient.tsx`** — Gallery page with integrated smart search, ML tag badges, AI Recommended markers
- **`components/LoadDesignButton.tsx`** — Load Design modal with ML filter dropdowns and tag display

### Search Pipeline
1. **Text search**: Splits query into tokens, scores each design against title, description, and `ml_tags`
2. **Category filters**: Narrows results by `ml_type`, `ml_style`, `ml_motif` dropdowns
3. **Feature toggles**: Boolean filters for designs with photos, motifs, or additions
4. **TF.js ranking** (optional): Runs model inference to rank remaining results by similarity score

---

## Load Design Popup

### Overview
The Load Design modal (`components/LoadDesignButton.tsx`) is a searchable category-first browser for all 3,114+ saved designs. It opens from the canvas top-right corner and allows loading any design into the 3D editor. Styled with the HomeSplash dark luxury theme (April 2026): `rounded-3xl` gold-bordered container, gold gradient glow, eyebrow pill badge, gold-accented search/filters, serif title.

**Product Filtering (2026-04-08):** The popup filters designs by the current product ID — selecting "Traditional Engraved Headstone" only shows headstone designs, not laser-etched or bronze plaque designs. Uses `getProductTypeFromId()` to map product IDs to exact types. Falls back to showing all designs if no product is selected.

### Tree Structure (Category-First — April 2026)
Designs are organized in a **single-level collapsible tree** grouped by content category (not product type):
1. **Category** (top-level): Groups by `category` (e.g., "Pet Memorial", "Mother Memorial", "Biblical Memorial")
2. **Design** (leaf): Individual designs shown as visual grid cards with thumbnail, title, and date

```typescript
// CategoryTree structure (replaced PickerTree in April 2026)
{
  [categorySlug]: {
    categoryLabel: string;          // Display name via toLabel()
    designs: Array<{ id, displayTitle, metadata }>;
  }
}
```

**Category sort order** is controlled by `CATEGORY_ORDER` array — curated priority with Pets first, then family categories (mother, father, wife, husband, son, daughter, baby), then themes (memorial, rest-in-peace, in-loving-memory), then religious. Unlisted categories sort alphabetically at end.

**Note:** The `/designs/` SEO catalog pages remain product-first (separate from the popup). Only the Load Design popup uses category-first grouping.

### Design Categories (DesignCategory type)
Defined in `lib/saved-designs-data.ts` as a union type. Current categories:

| Category Slug | Description |
|--------------|-------------|
| `memorial` | General memorial designs |
| `biblical-memorial` | Designs with scripture/bible verses |
| `mother-memorial` | Dedicated to mothers |
| `father-memorial` | Dedicated to fathers |
| `wife-memorial` | Dedicated to wives |
| `husband-memorial` | Dedicated to husbands |
| `son-memorial` | Dedicated to sons |
| `daughter-memorial` | Dedicated to daughters |
| `brother-memorial` | Dedicated to brothers |
| `sister-memorial` | Dedicated to sisters |
| `baby-memorial` | Baby/infant memorials |
| `child-memorial` | Child memorials |
| `pet-memorial` | **All pet types merged** (dogs, cats, horses, etc.) |
| `dove-memorial` | Designs featuring doves |
| `butterfly-memorial` | Designs featuring butterflies |
| `floral-memorial` | Floral/garden themed |
| `garden-memorial` | Garden themed |
| `religious-memorial` | Religious symbols (crosses, etc.) |
| `islamic-memorial` | Islamic themed |
| `jewish-memorial` | Jewish themed |
| `military-veteran` | Military/veteran themed |
| `rest-in-peace` | RIP themed designs |
| `in-loving-memory` | ILM themed designs |
| `commemorative` | Commemorative plaques |
| `dedication` | Dedication plaques |
| And more... | fishing, music, maori, nurse, doctor, teacher, etc. |

**Note:** `dog-memorial`, `cat-memorial`, and `horse-memorial` were merged into `pet-memorial` (April 2026). The "Legacy Memorial" product was renamed to "Pets" (`productSlug: "pets"`).

### Product: Pets
The "Pets" product (`productSlug: "pets"`, `productId: "135"`) contains **111 designs** (cleaned from 254 in April 2026) with verified animal content (dog, cat, horse motifs or pet-related inscriptions). Designs with family relationship words (wife, mother, father, etc.) are excluded even if they have animal motifs as decoration — those remain in their original product/category.

### Features

#### Visual Grid Cards (April 2026)
Each category expands into a responsive thumbnail grid (`grid-cols-2 sm:grid-cols-3`). Cards use `aspect-[4/3]` containers with `object-contain` on `bg-[#cccccc]` backgrounds for uniform appearance. Date is shown below each title (derived from the 13-digit timestamp ID).

#### Thumbnails (April 2026)
Thumbnails use `_small.png` files (300px wide, transparent, ~19KB avg, generated by `scripts/generate-png-thumbnails.js`). The `#cccccc` background provides contrast for transparent PNGs. Fallback chain on `<img>` `onError`:
1. Try `/screenshots/v2026-3d/{id}_small.png` (3D transparent PNG)
2. Try legacy `_small.jpg` path (ML screenshot)
3. Try full-size legacy preview
4. Hide image element

#### ML Category Filters
Three filter dropdowns at the top (Type, Style, Motif) with dark backgrounds and gold (#DEBD68) active state styling.

#### Popular Drawer
A collapsible "Popular" drawer at the top of the scroll area displays favorited designs. **Auto-expands by default** when favorites exist (via `useEffect`). Uses the **same thumbnail grid layout** as regular categories (2-3 column responsive grid, aspect-4/3 cards, hover zoom, "Open Design" button). Styled with gold star icon and `primary` color accents.

#### Localhost-Only Actions
Three action icons appear per design card **only on localhost** (`window.location.hostname === 'localhost'`), revealed on hover:
1. **⭐ Star** — Toggle favorite status (top-right of card, persisted to `data/favorite-designs.json` via API)
2. **↗ Preview** — Open full-size design image in new tab (top-right of card)
3. **🗑️ Trash** — Hide design from list (bottom-left of card, isolated to prevent accidental clicks, persisted to `data/hidden-designs.json` via API)

#### Hidden Designs
Hidden designs are filtered from both the Load Design popup and the `/designs/` page on localhost. The hidden list is stored in `data/hidden-designs.json` and managed via `app/api/hidden-designs/route.ts` (GET/POST/DELETE).

#### Favorite Designs
Favorite designs are toggled via `app/api/favorite-designs/route.ts` (GET/POST) and stored in `data/favorite-designs.json`. The favorites list is fetched on all environments (not just localhost) so the Popular drawer works in production.

#### Loading Overlay (April 2026)
After clicking "Open Design" on a card, the popup modal closes and a full-screen loading overlay appears (`loading && !isOpen` state). Uses `createPortal(…, document.body)` at `z-[99999]` with `bg-black/80 backdrop-blur-sm`, centered white spinner, and "Loading design…" text. Same visual pattern as the design page's Personalize Design overlay and SEO panel overlays.

### Key Files
| File | Purpose |
|------|---------|
| `components/LoadDesignButton.tsx` | Main popup component with tree, search, filters, icons, 3D screenshot fallback chain |
| `lib/useHiddenDesigns.ts` | Shared hook for hidden + favorite design state |
| `lib/saved-designs-data.ts` | 2.6MB design catalog with `SAVED_DESIGNS`, `DesignCategory`, `DESIGN_CATEGORIES`, `CATEGORY_STATS`, `PRODUCT_STATS` |
| `app/api/hidden-designs/route.ts` | REST API for hidden design list |
| `app/api/favorite-designs/route.ts` | REST API for favorite design list |
| `data/hidden-designs.json` | Persistent hidden design IDs (793 entries as of April 2026) |
| `data/favorite-designs.json` | Persistent favorite design IDs |

---

## P3D Format & Converter

### Overview
The `.p3d` format is a binary file used by the legacy haxe 3D designer (code in `haxe/` directory). Full Monuments (product IDs 100, 101) and occasionally Headstones (IDs 4, 124) have p3d files containing the 3D scene tree with embedded textures and motif PNGs.

### File Locations
| Path | Contents |
|------|----------|
| `public/ml/forevershining/saved-designs/p3d/` | 635 p3d files |
| `public/ml/headstonesdesigner/saved-designs/p3d/` | 234 p3d files |
| `public/ml/*/saved-designs/json/` | Companion JSON (text data, motif SVG refs) |
| `public/designs/v2026-p3d/` | Converted canonical JSON output |
| `public/designs/p3d-assets/` | Extracted PNG motif images |
| `scripts/convert-p3d-design.js` | Converter script (~1030 lines) |

### Binary Format Details
```
Offset  Size  Description
0-3     4B    Magic: FF FF 00 00
4-7     4B    "WPF0"
8-11    4B    Separator: 00 00 FF FF
12-15   4B    "PROJ"
16-25   10B   Metadata (version, flags)
26+     var   zlib-compressed payload
```

After decompression: 3 skip bytes + UTF-8 XML scene tree. Binary section follows XML (embedded PNGs found by scanning for PNG magic `89 50 4E 47`).

### Companion JSON Cross-Reference
The companion JSON (`ml/*/saved-designs/json/{id}.json`) is an array of items with:
- `itemID` — matches p3d `<extra type="json">{"id": N}</extra>`
- `type` — `"Inscription"`, `"Motif"`, or `"Photo"`
- `label` — text content (for inscriptions)
- `font_family`, `font_size` — font info in mm
- `x`, `y` — position in mm from headstone center
- `color` — hex color
- `src` — SVG motif name (e.g., `"butterfly_005"`)
- `width`, `height` — dimensions (used for photos; P3D stores oversized photo dimensions)

### Coordinate Systems (Critical Knowledge)

| Source | Origin | Y Convention | X Convention | Units | Negation Needed |
|--------|--------|-------------|-------------|-------|----------------|
| **Canonical JSON** | center | Y-UP (+Y = top) | X-RIGHT (+X = right) | mm | — (target format) |
| **Forevershining companion JSON** | center | Y-DOWN (-Y = top) | X-RIGHT | mm | Negate Y only |
| **Forevershining P3D regionPosition** | center | Y-DOWN (-Y = top) | X-LEFT (-X = right) | mm | Negate both X and Y |
| **Headstonesdesigner companion JSON** | center | Y-UP (+Y = top) | X-RIGHT | mm | None |
| **Headstonesdesigner legacy stage** | center | Y-DOWN | X-RIGHT | canvas-px | Loader negates Y in px→mm |
| **Bronze-plaque companion JSON** | center | Y-DOWN (-Y = top) | X-RIGHT | mm | Negate Y only |

**Verified:** P3D regionPosition values exactly match companion JSON values when both exist (design 1595787261483, motif 2 at y=104.9 in both sources).

### Auto-Layout Algorithm (Updated 2026-04-02)
The converter handles motifs with lost positions (~80% of headstone motifs at (0,0)):

1. **Positioned items**: Use companion JSON / P3D positions with coordinate negation per mlDir
2. **Text ordering**: Memorial phrases ("IN LOVING MEMORY" etc.) placed ABOVE positioned reference, names/dates BELOW
3. **Deco zone**: Computed from lowest inscription Y position
4. **Zero-group motifs**: Flow layout in rows below text, size-capped to 10% headstone height / 35% width
5. **Universal size cap**: ALL motifs capped to not exceed headstone dimensions
6. **Photo handling**: Companion `type='Photo'` → `vitreous-enamel-image.jpg` placeholder, uses companion dimensions

### Key Coordinate Facts
- Font sizes in companion JSON are in **mm** (not px) for ALL mlDirs
- Positions are in **mm from headstone center**
- Layer values: inscriptions ≥9000, decorative motifs <9000
- Headstone dimensions come from p3d XML `<property id="width/height" value="..."/>`

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

### Issue: Base Inscriptions Not Rendering (Fixed 2026-04-08)
**Symptom:** Inscriptions on the base surface (e.g., "CICERO") are invisible when loading full monument designs.

**Root Cause (4 layers):**
1. `INSCRIPTION_SIZE_SCALE = 0.85` was declared but never applied → fonts 15% too large
2. `baseAPI.unitsPerMeter = 1000` was wrong for unit cube → changed to `1`
3. `useEffect` for `surfaceBounds` perpetually cancelled by sibling inscription re-renders
4. `baseMesh.position` is `(0,0,0)` at React render time (set by `useFrame`, not React state)

**Solution:**
- `useFrame` hook in `HeadstoneInscription.tsx` imperatively tracks base mesh position every frame
- Visibility guard bypasses `surfaceBounds` requirement for base inscriptions
- Separate mm-center coordinate branch for base surface

**Commits:** `3e52214687`, `4a0cad30a5`, `fbaa40ee35`

### Issue: Headstone/Base Alignment Issues on Init
**Symptom:** Headstone back edge and base back edge not aligned on initial load for Traditional Engraved Headstone

**Root Cause:**
- Using variable thickness for depth prop causes misalignment
- Upright headstone centered at Z=0 with back at `-depth/2`
- Base positioned with back at `-FIXED_REFERENCE_DEPTH/2 = -10cm`
- If depth varies (e.g., 15cm for 150mm thickness), backs don't align

**Solution:**
- Use FIXED depth = 20cm (200mm) for ALL non-plaque headstones
- depth prop is ALIGNMENT REFERENCE, not visual thickness
- Visual thickness comes from SVG shape width, not depth prop
- Result: Upright back at -10cm, Slant back at -10cm, Base back at -10cm ✅

**Commit:** `ac9e065d56`

### Issue: Thickness Slider Showing Wrong Range
**Symptom:** Mini Headstone shows 100-300mm range but catalog has 50mm thickness, value shows with red validation border

**Root Cause:**
- Thickness slider hard-coded to `min={100} max={300}`
- Validation also hard-coded to 100-300mm range
- Ignored catalog XML `min_depth` and `max_depth` values

**Solution:**
```typescript
// Extract min/max from catalog (like width/height already do)
const minThickness = firstShape?.table?.minDepth ?? 100;
const maxThickness = firstShape?.table?.maxDepth ?? 300;

// Use variables in slider and validation
<input type="range" min={minThickness} max={maxThickness} ... />
<span>{minThickness}mm</span> <span>{maxThickness}mm</span>
```

**Result:**
- Mini Headstone: 50-50mm (effectively fixed)
- Traditional: 100-300mm (adjustable)
- Any product uses XML-defined range
- No validation errors for valid catalog values

**Commit:** `6473bde412`

### Issue: Base Dimensions Not Loading from Catalog
**Symptom:** Mini Headstone base dimensions incorrect on init, not matching XML configuration

**Root Cause:**
- Base dimensions were hard-coded in store
- `baseWidthMm: Math.round(shape.table.initWidth * 1.4)` - calculated, not loaded
- `baseHeightMm` had default 100mm, never loaded from catalog
- XML `<file type="stand">` element was completely ignored

**Solution:**
```typescript
// Load from catalog XML stand element
set({
  baseWidthMm: shape.stand.initWidth,    // was: Math.round(shape.table.initWidth * 1.4)
  baseHeightMm: shape.stand.initHeight,  // was: not set (default 100)
});

// Update XML for Mini Headstone (catalog-id-22)
<file type="stand"
  min_width="280" max_width="280" init_width="280"  // was 200
  min_height="50" max_height="50" init_height="50"
  min_depth="100" max_depth="100" init_depth="100"
/>
```

**Result:**
- Mini Headstone base: 280mm × 50mm × 100mm (40% wider than headstone)
- All dimensions from catalog XML
- No hard-coded calculations
- Product-specific configurations supported

**Commit:** `1cfc86068f`

### Issue: Headstone Disappearing During Material Changes
**Symptom:** Headstone briefly disappears (flash/blink) when selecting a new material texture

**Root Cause** (Fixed Dec 17, 2025):
- `SvgHeadstone` component uses `useTexture` hook which suspends during loading
- When new texture URL passed as prop, component suspends and React hides it during Suspense boundary
- Original approach passed `requestedTex` directly, causing component to suspend immediately

**Solution (Jan 6, 2026):** Manual preload staging + shared loader flag.
```tsx
// ShapeSwapper.tsx
const [visibleUrl, setVisibleUrl] = useState<string | null>(null);
const [visibleTex, setVisibleTex] = useState<string | null>(null);
const resolvedUrl = visibleUrl ?? requestedUrl;
const resolvedTex = visibleTex ?? requestedTex;
const textureTransitioning = requestedTex !== visibleTex;
const shapeSwapping = requestedUrl !== visibleUrl;

useEffect(() => {
  const shouldLoad = shapeSwapping || textureTransitioning || fontLoading;
  setLoading(shouldLoad);
}, [shapeSwapping, textureTransitioning, fontLoading, setLoading]);

{!shapeSwapping && !isMaterialChange && textureTransitioning && (
  <Suspense fallback={null}>
    <PreloadTexture
      url={requestedTex}
      onReady={() => {
        setVisibleTex(requestedTex);
        invalidate();
      }}
    />
  </Suspense>
)}

{shapeSwapping && (
  <Suspense fallback={null}>
    <PreloadShape
      url={requestedUrl}
      onReady={() => {
        setVisibleUrl(requestedUrl);
        requestAnimationFrame(() => setFitTick((n) => n + 1));
        invalidate();
      }}
    />
  </Suspense>
)}

<SvgHeadstone
  key={resolvedUrl}
  url={resolvedUrl}
  faceTexture={resolvedTex}
  sideTexture={resolvedTex}
/>
```

**Key Points**:
- Assets now start as `null`, so the first paint waits for the preload callbacks before drawing anything (no more “floating sunrays + loader” while the stone is absent).
- Manual `PreloadShape` / `PreloadTexture` gates keep the previous mesh/texture visible until the new resource resolves, matching the “never flash empty canvas” requirement without relying on `useTransition`.
- A single `setLoading()` call powers both the global overlay and the inline canvas spinner (`shapeSwapping || fontLoading || textureTransitioning`), which also hides SunRays/background chrome until the headstone is truly ready.
- Component still remounts only when the SVG URL changes; material swaps hot-swap the texture while keeping the same mesh instance alive, so inscriptions/additions never lose focus.

**Commits**: `88a06c5270`, `3c9d7b47c1`

### Issue: Designer UI Showing on Design Gallery Pages
**Symptom:** Product header (e.g., "Traditional Engraved Headstone 600x600mm $1434.94") visible on `/designs` routes

**Root Causes** (Fixed Dec 14, 2025):
1. **MobileHeader**: Pathname check was `/designs/` (with slash) not `/designs`
   - Fix: Changed to `pathname?.startsWith('/designs')` to match all routes
2. **DesignsTreeNav**: Product header shown whenever catalog loaded in store
   - Fix: Added `!pathname?.startsWith('/designs')` condition
3. **SceneOverlayHost**: Overlay panel persisting when navigating away
   - Fix: Call `hideOverlay()` in useEffect when on pages without canvas

**Commits**: `b5df4cf0dc`, `e9c4387284`, `29eb8a1643`

### Issue: Build Time Suddenly Increased (15+ minutes)
**Symptom:** Build taking 16-19 minutes instead of 3-6 minutes (Nov 3, 2025)

**Diagnosis Steps**:
1. Check for large TypeScript files: `Get-ChildItem -Recurse -Filter "*.ts" | Where { $_.Length -gt 1MB }`
2. Look for auto-generated data files imported at build time
3. Check `git log` for when slowdown started

**Root Cause**: Large SEO template files (29.6 MB) in `lib/`
- `seo-templates-unified.ts` (24 MB, 577k lines, 4,118 designs)
- `seo-templates-ml.ts` (5.5 MB, 100k+ lines)
- TypeScript had to parse/compile massive arrays at every build
- Files were auto-generated but never imported/used

**Solution** (Fixed Dec 14, 2025):
- Moved to `lib/.backup/*.bak` (excluded from build)
- Result: **16-19 min → 53 sec (95% improvement)** ✅
- Alternative: Use JSON in `public/` + fetch() at runtime
- Commit: `bb7d47ee3b`

---

## Unit Testing (Vitest)

> Added 2026-06-01. See Current Status section at the top for full details.

### Commands

```bash
pnpm test               # Run all 82 unit tests once (CI-safe)
pnpm test:watch         # Watch mode — re-runs on file change
pnpm test:coverage      # V8 coverage report
```

### Structure

```
tests/unit/
├── unit-system.test.ts          # 26 tests — mm/imperial conversion + formatting
├── slug.test.ts                 # 9 tests  — URL slug generation
├── xml-parser-price.test.ts     # 18 tests — pricing engine formulas
├── inscription-sanitizer.test.ts # 20 tests — name privacy/sanitization
└── motif-pricing.test.ts        # 9 tests  — motif color tier pricing
```

### Key Facts

- Uses **Vitest 4.1.8** + `@vitest/coverage-v8`
- All tests run in `node` environment — no DOM, no WebGL
- Path alias `#/*` resolved in `vitest.config.ts` matching tsconfig
- `endQuantity === 0` in price tiers = unlimited (legacy sentinel, not literally zero)
- Gold Gilding tier key color: `#c99d44`; Silver Gilding: `#eeeeee`

---

## E2E Testing (Playwright)

> Added 2026-06-01. See Current Status section at the top for full details.

### Commands

```bash
pnpm test:e2e           # Run all 13 E2E tests (headless Chromium)
pnpm test:e2e:ui        # Interactive Playwright UI (visual test runner)
pnpm test:e2e:debug     # Step-by-step debugger
pnpm test:e2e:report    # Open last HTML report
```

### Setup Required

Create `.env.test.local` (gitignored):
```
TEST_USER_EMAIL=your-test-account@example.com
TEST_USER_PASSWORD=your-test-password
```

### Structure

```
playwright.config.ts          # Playwright config — webServer, auth projects
playwright/.auth/             # GITIGNORED — saved session cookie (storageState)
.env.test.local               # GITIGNORED — test credentials
.env.test.local.example       # Template to copy from

tests/e2e/
├── auth.setup.ts             # Auth setup — login once, save storageState
├── designer.spec.ts          # 5 tests — save modal E2E flow
├── projects-api.spec.ts      # 7 tests — /api/projects save/list/delete
└── pages/
    ├── LoginPage.ts          # POM — login form locators
    └── DesignerPage.ts       # POM — designer nav + save modal
```

### Key Facts

- Uses **Playwright 1.59.1** (was already a devDependency)
- Auth: JWT session cookie named `session` — captured via `storageState`
- Login locators: `getByPlaceholder('you@example.com')` (no `htmlFor` on labels)
- `projects-api.spec.ts` uses Playwright's `request` fixture — pure HTTP, no browser
- The dev server is auto-started by `playwright.config.ts` (`pnpm dev`, reused locally)

---

## Saved Designs & Canonical Format (Updated Jan 26, 2026)

### Design Storage Overview
The application supports three design storage formats:

1. **Legacy ML Format**: Pixel-based coordinates from the original 2D designer
2. **Canonical v2026 Format**: Millimeter-based coordinates for 3D designer (converted from legacy)
3. **P3D v2026 Format**: Millimeter-based coordinates converted from the haxe 3D designer's `.p3d` binary files — stored in `public/designs/v2026-p3d/`

### Canonical v2026 Format Structure

```json
{
  "version": "2026.01",
  "spec": "2026.01",
  "units": "mm",
  "product": {
    "id": "124",
    "type": "Headstone",
    "shape": "Curved Gable"
  },
  "components": {
    "headstone": {
      "width_mm": 609.6,
      "height_mm": 609.6,
      "thickness_mm": 80,
      "texture": "/textures/forever/l/G633.webp"
    },
    "base": {
      "width_mm": 700,
      "height_mm": 100,
      "depth_mm": 250,
      "texture": "/textures/forever/l/African-Black.webp"
    }
  },
  "elements": {
    "inscriptions": [
      {
        "id": "insc-1",
        "text": "KLEIN",
        "font": { "family": "Garamond", "size_px": 115.6, "weight": 400 },
        "position": { "x_px": 2.9, "y_px": -262.3 },
        "rotation": { "z_deg": 0 },
        "color": "#000000",
        "align": "center",
        "surface": "headstone/front"
      }
    ],
    "motifs": [
      {
        "id": "motif-11",
        "asset": "1_184_13",
        "position": { "x_px": -7.2, "y_px": -145.0 },
        "height_px": 140,
        "rotation": { "z_deg": 0 },
        "color": "#000000",
        "flip": { "x": true, "y": true },
        "surface": "headstone/front"
      }
    ]
  },
  "assets": {
    "motifs": [
      { "id": "1_184_13", "path": "/shapes/motifs/1_184_13.svg" }
    ]
  },
  "legacy": {
    "raw": [...] // Original ML JSON for reference
  }
}
```

### Coordinate System (Component-Relative)

**All coordinates are relative to the component center (NOT stage center):**

- **Origin**: Center of each component (headstone or base)
- **Headstone**: X ∈ [-width/2, width/2], Y ∈ [-height/2, height/2]
- **Y-axis**: Positive = UP from center, Negative = DOWN
- **Example**: For 609.6mm headstone, Y bounds are ±304.8mm

**Legacy Conversion:**
```javascript
// Legacy used stage center (headstone + base combined)
// Canonical uses component center (headstone separate from base)

// Conversion formula:
yMm = -(canvasY * mmPerPxY);  // Convert pixels to mm, flip Y axis
if (!surfaceIsBase && baseHeightMm > 0) {
  yMm = yMm - (baseHeightMm / 2);  // Adjust for base offset
}
```

### Loading Canonical Designs

**File:** `lib/saved-design-loader-utils.ts`

The `loadCanonicalDesignIntoEditor()` function loads designs from all three formats:

✅ **All Working (as of April 1, 2026):**
- Inscriptions load with correct positions (legacy px, surface mm, and p3d mm-center)
- Motifs load with correct positions (SVG motifs from catalog + embedded PNGs from p3d)
- Sizes and colors correct
- Product, shape, dimensions load correctly (shape falls back to `components.headstone.shape`)
- Automatic base offset handling
- P3D kerb component loading
- `fetchCanonicalDesign()` priority: v2026-p3d → v2026 → legacy fallback

**Position Modes:**
| Mode | Source | Conversion |
|------|--------|-----------|
| `legacy-stage-px` | Legacy 2D designer | CSS px → mm via DPR + viewport ratios |
| `surface-mm` | Already in mm | Pass-through |
| `p3d-mm-center` | Haxe 3D designer | Pass-through (mm from surface center) |

### Conversion Script (Enhanced Jan 26, 2026)

**File:** `scripts/convert-legacy-design.js`

The conversion script applies intelligent transformations:

**1. Base Offset Compensation:**
```javascript
// Headstone elements adjusted for base height
yMm = yMm - (baseHeight / 2);
```

**2. Intelligent Text Sizing:**
- Titles >80mm → Cap at 90mm
- Subtitles 30-80mm → Scale to ~24mm (0.7x)
- Names 20-30mm → Keep at ~20-24mm (0.95x)
- Dates <20mm → Minimum 18mm (1.1x)

**3. Intelligent Motif Sizing:**
- Large figures >120mm → Scale to ~140mm (0.85x)
- Medium 60-120mm → Scale to ~50mm (0.65x)
- Small 30-60mm → Scale to ~35mm (0.8x)

**4. Position Optimization:**
- Horizontal centering: Person info → ±100mm
- Vertical compression: Person blocks moved UP 130mm
- Center figures: Large motifs moved UP 100mm
- Bottom motifs: Moved UP 100mm for visibility

**Usage:**
```bash
# Regenerate single design
node scripts/convert-legacy-design.js 1725769905504

# With specific ML directory
node scripts/convert-legacy-design.js 1725769905504 --mlDir=headstonesdesigner
```

### Asset Management

**SVG Motif Assets:**
- Location: `public/shapes/motifs/`
- Naming: Asset ID + `.svg` (e.g., `1_184_13.svg`)
- **Important**: Local files must match production server content
  - Same filename may contain different artwork
  - Sync from production before converting designs

**Common Issue:**
```
❌ Problem: Motif renders different artwork than expected
✅ Solution: Download correct SVG from production server
  wget https://forevershining.org/shapes/motifs/1_184_13.svg
  -O public/shapes/motifs/1_184_13.svg
```

### Shape Name Mapping

**Critical:** Shape file names use underscores, not dashes!

```typescript
// Canonical: "shape": "Curved Gable"
// File: curved_gable.svg (underscore!)

const shapeSlug = shapeName.toLowerCase().replace(/\s+/g, '_'); // ✅ Correct
// NOT: .replace(/\s+/g, '-') // ❌ Wrong
```

### Legacy Design Scaling System (Jan 27, 2026)

**Critical Discovery:** The legacy 2D designer used a `getRatio()` function to scale inscriptions and motifs proportionally based on the relationship between canvas pixels and physical millimeters. This ensures elements maintain correct visual proportions when headstone dimensions change.

#### Legacy getRatio() Formula

```javascript
// From legacy/Monument.js line 773-828
function getRatio() {
  let px = headstoneCanvasHeightPx + baseCanvasHeightPx;
  let mm = headstoneHeightMm + baseHeightMm;
  let ratio = px / mm;  // pixels per millimeter
  return ratio;
}
```

**Example Calculation:**
- Headstone: 609.6mm displayed in 476px canvas
- Base: 100mm displayed in ~78.1px canvas  
- Total: 709.6mm in 554.1px
- **Ratio: 554.1px / 709.6mm = 0.781 px/mm**

**Usage in Legacy:**
```javascript
// Inscription sizing
this.text.font = this.font_size * ratio + "px " + this.font_family;
// font_size is in mm (e.g., 76mm)
// Display: 76mm × 0.781 = 59.3px

// Motif sizing  
let displayRatio = getRatio() * this.ratio;
this.bitmap.scaleX = this.bitmap.scaleY = displayRatio;
```

#### Canonical Conversion Implementation

**Converter (`scripts/convert-legacy-design.js`):**

1. **Store Original Physical Values:**
   ```javascript
   // Inscriptions: Use font_size (in mm) directly
   sizeMm = item.font_size || 10;  // Don't calculate from pixels!
   
   // Motifs: Use height (in pixels) from legacy, convert to mm
   const canvasHeight = usesPhysicalCoords ? motif.height / designDpr : motif.height;
   heightMm = round(canvasHeight * mmPerPxY);
   ```

2. **Calculate Total Canvas Ratio:**
   ```javascript
   // CRITICAL: Include base in calculation
   const pxPerMmY = initH / headstoneHeightMm;  // 476 / 609.6
   const baseCanvasHeightPx = baseHeightMm * pxPerMmY;  // 100 × 0.781
   const totalCanvasHeightPx = initH + baseCanvasHeightPx;  // 476 + 78.1
   const totalHeightMm = headstoneHeightMm + baseHeightMm;  // 709.6
   const mmPerPxY = totalHeightMm / totalCanvasHeightPx;  // 1.281 mm/px
   ```

3. **Output Format:**
   ```json
   {
     "inscriptions": [{
       "font": {
         "size_mm": 76,      // Original physical size
         "size_px": 59.3     // For legacy fallback
       }
     }],
     "motifs": [{
       "height_mm": 231.8,   // Converted to mm
       "height_px": 181      // Original canvas pixels
     }]
   }
   ```

**Canonical Loader (`lib/saved-design-loader-utils.ts`):**

1. **Calculate Display Ratio:**
   ```typescript
   // Matches legacy getRatio() logic
   const headstoneCanvasRatio = canonicalViewportHeightCssPx / canonicalHeadstoneHeightMm;
   const baseCanvasHeightPx = canonicalBaseHeightMm * headstoneCanvasRatio;
   const totalCanvasHeightPx = canonicalViewportHeightCssPx + baseCanvasHeightPx;
   const DISPLAY_RATIO = totalCanvasHeightPx / totalHeightMm;  // px/mm
   ```

2. **Store Physical MM in State (no ratio scaling):**
   ```typescript
   const baseSize = resolveFontSizeMm(inscription.font);  // Gets size_mm
   const scaledSize = baseSize; // Remains mm; renderer converts via unitsPerMeter
   ```

3. **Same for Motifs:**
   ```typescript
   const canonicalHeight = resolveMotifHeightMm(motif);  // Gets height_mm
   const scaledHeight = canonicalHeight; // mm stored in Zustand/state
   ```

#### Key Principles

1. **Store Physical Dimensions**: Canonical JSON stores `size_mm` and `height_mm` (actual physical measurements)
2. **Render-Time Conversion**: `HeadstoneInscription` and `MotifModel` multiply stored mm by `headstone.unitsPerMeter / 1000` so Drei Text/SVG planes match the mesh scale
3. **Display Ratio = Diagnostics**: We still log `DISPLAY_RATIO` to verify canonical viewport/base data (helps spot cached JSON) but we no longer scale element dimensions with it
4. **Use CSS Pixels**: Viewport dimensions in `scene.viewportPx` are CSS pixels (not physical pixels × DPR)
5. **Universal Conversion**: All scaling derives from canonical geometry + unitsPerMeter, no arbitrary fudge factors

#### Common Pitfalls

❌ **Wrong:** Using headstone height only
```javascript
const ratio = canvasHeight / headstoneHeightMm;  // Missing base!
```

✅ **Correct:** Including total canvas height
```javascript
const ratio = totalCanvasHeight / (headstoneHeightMm + baseHeightMm);
```

❌ **Wrong:** Using physical pixels (with DPR)
```javascript
const px = viewportHeight * dpr;  // 476 × 2.325 = 1106px
```

✅ **Correct:** Using CSS/canvas pixels
```javascript
const px = viewportHeight;  // 476px (canvas size)
```

### Current Status (Jan 27, 2026)

✅ **Working:**
- Complete coordinate system fix (base offset)
- Legacy getRatio() scaling system implemented
- Correct mm-to-pixel conversion for sizing
- Total canvas ratio (headstone + base) used throughout
- Inscriptions preserve original font_size values
- Motifs scale proportionally with headstone dimensions
- No arbitrary scaling factors needed

🔧 **In Progress:**
- Monitor canonical loader after removing display-ratio scaling to ensure other designs stay aligned
- Continue spot-checking Y positioning versus base canvas offsets on newly converted files

📋 **Known Limitations:**
- Asset content mismatch (local vs production SVGs)
- Name sanitization (privacy - intentional)
- Font rendering differences (2D vs 3D - acceptable)

### Latest Findings (Jan 27, 2026 @ 19:42 UTC)
- Hard-refreshing the browser (Ctrl+Shift+R) now reliably pulls fresh canonical JSON; logs.log shows `canonicalViewportHeightCssPx≈476`, `baseCanvasHeightPx≈78`, `totalCanvasHeightPx≈554`, and `displayRatio≈0.781`, matching the reference design math.
- The oversized text/motif issue was caused by double scaling: the loader multiplied `size_mm`/`height_mm` by `DISPLAY_RATIO` and the renderer then scaled again via `unitsPerMeter`. The loader now stores the raw mm values and relies on render-time conversion.
- `HeadstoneInscription.tsx` and `MotifModel.tsx` convert mm to local units via `headstone.unitsPerMeter / 1000`, so physical measurements map directly to the mesh scale with no arbitrary multipliers.

### Files Modified (Jan 27, 2026)

1. `scripts/convert-legacy-design.js` - Total canvas ratio calculation, original size preservation
2. `lib/saved-design-loader-utils.ts` - Display ratio calculation matching legacy getRatio()
3. `STARTER.md` - This documentation update

### Related Documentation

- `CONVERSION_SCRIPT_ENHANCED.md` - Technical algorithm details
- `CANONICAL_POSITIONING_FIX_SUMMARY.md` - Initial coordinate fix
- `CANONICAL_DESIGN_PRODUCTION_FINAL.md` - Manual testing results
- `legacy/Monument.js` - getRatio() source implementation (line 773)
- `legacy/Inscription.js` - Legacy inscription sizing (line 608)
- `legacy/Motif.js` - Legacy motif scaling (line 717-721)

---

### Issue: Blurry Textures (Resolved - 2026-02-14)
**Cause:** Missing mipmap or anisotropic filtering  
**Solution:**
```typescript
texture.generateMipmaps = true;
texture.minFilter = THREE.LinearMipmapLinearFilter;
texture.anisotropy = 16;
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
```
All production materials now load with these sampler settings inside `SvgHeadstone`, `HeadstoneBaseAuto`, and `BronzeBorder`, eliminating the blur on angled granite shots.

### Issue: Stretched Textures on Base/Headstone (Resolved - 2026-02-14)
**Cause:** Single texture stretched across large surface  
**Solution:**
```typescript
// Calculate proper repeat based on dimensions
const textureScale = 0.15; // meters per tile
const repeatX = width / textureScale;
const repeatY = height / textureScale;
texture.repeat.set(repeatX, repeatY);
```
`SvgHeadstone` and `HeadstoneBaseAuto` now derive repeat values from live mm dimensions before converting to world units, so granite veining tiles evenly on every product size.

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

## Authentication System

### Overview
JWT-based authentication using the `jose` library (edge-compatible, v6.2.0). Session stored as an httpOnly cookie named `session`.

### Environment Variable
```
SESSION_SECRET=<random-64-char-string>   # required in .env.local
```

### Session API
| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth/login` | POST | Verify credentials, set JWT cookie |
| `/api/auth/logout` | POST | Clear session cookie |
| `/api/auth/session` | GET | Return `{ session }` or 401 |
| `/api/auth/register` | POST | Create account, set JWT cookie, send welcome email |
| `/api/auth/forgot-password` | POST | Generate reset token, send reset email (anti-enumeration) |
| `/api/auth/reset-password` | POST | Validate token, update password hash, consume token |

### Auth Flow
1. User visits `/my-account` — page fetches `/api/auth/session` on mount
2. **Not logged in** (`session = null`): `AuthGate` component renders login/register tabs inline; sidebar shows `DesignerNav`
3. **Logged in** (`session = { email, role, ... }`): Saved Designs content renders; sidebar shows `AccountNav`
4. **Login**: `AuthGate` POSTs to `/api/auth/login` → on success dispatches `session-changed` event → page + sidebar re-render
5. **Logout**: `AccountNav` POSTs to `/api/auth/logout` → dispatches `session-changed` → page shows gate again, sidebar shows DesignerNav

### `session-changed` Event
Custom DOM event (`window.dispatchEvent(new Event('session-changed'))`) fired on login and logout. Both `app/my-account/page.tsx` and `components/ConditionalNav.tsx` listen for it to update without a page reload.

### Save Design Auth Check
`DesignerNav.tsx` checks `/api/auth/session` before opening the Save Design modal. If not logged in, redirects to `/my-account`.

### Middleware
`middleware.ts` only protects `/api/account/*` and `/api/orders/*` with JWT verification. All page routes and `/my-account/*` are public — pages handle auth inline to show the gate UI rather than a hard redirect.

### Core Auth Module (`lib/auth/session.ts`)
```typescript
createSessionToken(payload)       // Signs JWT
setSessionCookie(res, token)      // Sets httpOnly cookie
clearSessionCookie(res)           // Expires cookie
verifySessionFromRequest(req)     // For middleware/API routes (uses req.cookies)
getServerSession()                // For Server Components (uses next/headers cookies())
```

### Test Credentials
- Email: `admin@forevershining.com`
- Password: `admin123`
- Role: `admin`
- Seed locally: `node --env-file=.env.local scripts/seed-test-user.mjs`
- Seed on Neon (after every `db:sync`): Run a script using direct pg client with `SET search_path TO public` before INSERT. The Neon pooler endpoint requires explicit search_path — without it, `INSERT INTO accounts` fails even though the table exists.

### ⚠️ Neon Pooler Search Path Gotcha
When connecting to Neon via the pooler (`*-pooler.*.neon.tech`), always run:
```sql
SET search_path TO public;
```
before any DML. Otherwise tables appear in `information_schema` but fail on direct access. This does NOT affect the app at runtime because Drizzle/postgres.js handle it automatically.

---

## Email System

### Overview
Complete transactional email system migrated from legacy PHP/PHPMailer to modern Next.js. Uses Nodemailer for SMTP transport, React Email for type-safe JSX templates, and parsed XML translations from existing `countries24.xml` and `languages24.xml`.

### Architecture
```
lib/email/
├── types.ts                          # TypeScript types (EmailData union, configs)
├── index.ts                          # sendEmail() orchestrator
├── transport.ts                      # Nodemailer SMTP factory (per-country, cached)
├── helpers.ts                        # breakdownToQuoteItems(), countryToCode()
├── pdf-email.ts                      # Server-side PDF generation (jsPDF → Buffer)
├── config/
│   ├── countries.ts                  # Parses countries24.xml → Map<string, CountryEmailConfig>
│   └── translations.ts              # Parses languages24.xml → TranslationsByLocale
└── templates/
    ├── components/
    │   ├── EmailLayout.tsx           # Shared layout (dark header, gold title, footer)
    │   ├── DesignPreview.tsx         # Screenshot + design name
    │   ├── QuoteTable.tsx            # Pricing breakdown table
    │   └── ContactInfo.tsx           # Country-specific contact info
    ├── SavedDesignEmail.tsx          # Design saved confirmation + quote PDF
    ├── OrderInvoiceEmail.tsx         # Order/invoice confirmation + invoice PDF
    ├── EnquiryEmail.tsx              # Design enquiry (sent to admin)
    ├── RegistrationEmail.tsx         # Welcome email
    └── PasswordResetEmail.tsx        # Reset link email
```

### Email Types
Five email types as a discriminated union on `type` field in `lib/email/types.ts`:

| Type | Required Fields | PDF | Triggered By |
|------|----------------|-----|-------------|
| `saved-design` | designId, designName, quoteItems, totalCents, currency | ✅ | `POST /api/projects` |
| `order` | orderId, invoiceNumber, designName, quoteItems, subtotalCents, taxCents, totalCents, currency | ✅ | Buy page → `POST /api/email` |
| `enquiry` | designName, message | ❌ | `POST /api/share/email` |
| `registration` | (none beyond base) | ❌ | `POST /api/auth/register` |
| `password-reset` | resetUrl | ❌ | `POST /api/auth/forgot-password` |

### SMTP Configuration
```bash
# Generic fallback (required)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=password

# Per-country overrides (optional — pattern: SMTP_{COUNTRY}_*)
SMTP_AU_HOST=smtp.au.example.com
SMTP_AU_PORT=587
SMTP_AU_USER=au@forevershining.com.au
SMTP_AU_PASS=password
```

### Integration Points
All email triggers are fire-and-forget (`.catch()` logged, don't block the response):
- **Save Design**: `app/api/projects/route.ts` — after `saveProjectRecord()` completes
- **Registration**: `app/api/auth/register/route.ts` — after account + profile transaction
- **Enquiry**: `app/api/share/email/route.ts` — sends to admin email from country config
- **Order**: `app/my-account/designs/[id]/buy/page.tsx` — client-side call to `/api/email`
- **Password Reset**: `app/api/auth/forgot-password/route.ts` — after token generation

### Dependencies
- `nodemailer@8.0.5` — SMTP transport
- `@react-email/components@1.0.12` — JSX email templates (deprecated but functional)
- `@types/nodemailer@8.0.0` — TypeScript types
- `@xmldom/xmldom@0.8.11` — XML parsing (already existed)

---

## File Storage System

### Overview
All binary file uploads (background images, portrait photos, screenshots, PDFs) are stored as physical files on the external wiecznapamiec.pl server. Design state (JSON) stays in PostgreSQL. This keeps the database lean and ensures files persist beyond Vercel's ephemeral filesystem.

### Architecture

```
Client  →  Next.js API route  →  lib/upload/proxy.ts  →  PHP / local FS
```

| Environment | Storage Target | URL Pattern |
|-------------|---------------|-------------|
| Development (`NODE_ENV=development`) | `public/uploads/{subdir}/` | `/uploads/{subdir}/{uuid}.ext` |
| Production (Vercel) | wiecznapamiec.pl via PHP | `https://www.wiecznapamiec.pl/forevershining/uploads/{subdir}/{uuid}.ext` |

### Subdirectories
| Subdir | File Types | Max Size | Used For |
|--------|-----------|----------|----------|
| `backgrounds` | JPEG, PNG, WebP, GIF | 10 MB | Uploaded background images for product 32 / urns |
| `images` | JPEG, PNG, WebP, GIF | 10 MB | Portrait photos (Add Your Image) |
| `screenshots` | JPEG, PNG | 5 MB | Design thumbnails on save |
| `pdfs` | PDF | 20 MB | Quote / invoice PDFs |

### Key Files
| File | Purpose |
|------|---------|
| `lib/upload/proxy.ts` | Shared helper: `proxyUpload(file, subdir)`, `extractFile(request)` |
| `legacy/upload.php` | PHP endpoint on wiecznapamiec.pl — deploy to `public_html/forevershining/upload.php` |
| `legacy/.htaccess` | Apache CORS headers — deploy to `public_html/forevershining/uploads/.htaccess` |
| `app/api/upload-background/route.ts` | 7-line proxy for `subdir=backgrounds` |
| `app/api/upload-image/route.ts` | 7-line proxy for `subdir=images` |

### Vercel Environment Variables
```bash
UPLOAD_REMOTE_URL=https://www.wiecznapamiec.pl/forevershining/upload.php
UPLOAD_REMOTE_SECRET=<strong random secret — must match $secret in upload.php>
```

### crossOrigin Requirement for WebGL
Uploading an image to wiecznapamiec.pl and then loading it as a Three.js texture requires:
1. The server's `.htaccess` to return `Access-Control-Allow-Origin: *` on `uploads/`
2. `loader.crossOrigin = 'anonymous'` on the `THREE.TextureLoader` instance

Both conditions are already in place: `ImageModel.tsx` and `UrnEnamelInlay.tsx` have `crossOrigin` set.

### Why Not data: URLs
Large base64 data URLs (1–5 MB per image) would be embedded in the `designState` jsonb column, bloating PostgreSQL and making `cleanDesignState()` mandatory for every save. With real server URLs, the DB stores a short string reference and the binary lives separately on the file server.

### Design State (PostgreSQL)
`app/api/projects/route.ts` stores the complete design state JSON in the `projects.designState` jsonb column. `cleanDesignState()` strips `metadata.screenshot` (ephemeral Vercel path) and resets `selectedImages[].data` before saving. All other fields (shape, material, inscriptions, motifs, etc.) are preserved.

---

## UI Theming & Day/Night Mode

### Day / Night Theme

See **Current Status (2026-05-28)** above for the full implementation details.

**Quick reference:**
- Variant: `@custom-variant day (&:where([data-theme=day], [data-theme=day] *))` in `styles/globals.css`
- Default: `data-theme="dark"` on `<html>`, persisted in `localStorage`
- Toggle: `components/ThemeToggle.tsx` — fixed circle button top-left, 20px margin
- Context: `components/ThemeProvider.tsx` — `useTheme()` hook
- Admin is **separate scope** (`[data-admin-theme=dark]`) — never apply `day:` there

---

### Primary Color: #DEBD68
The application uses a gold/amber primary color `#DEBD68` for all CTAs, selection highlights, and UI accents. This is defined as a full Tailwind color scale in `tailwind.config.js`:

```javascript
// tailwind.config.js
primary: {
  50: '#FDF8ED',
  100: '#FAF0D5',
  200: '#F5E0AA',
  300: '#EFCF7F',
  400: '#EABD54',
  500: '#DEBD68',  // DEFAULT
  600: '#C9A24B',
  700: '#A68035',
  800: '#836224',
  900: '#614818',
  DEFAULT: '#DEBD68',
}
```

### Usage Patterns
- **Selection/Active state**: `border-primary/50 bg-primary/10 text-primary`
- **Focus rings**: `focus:ring-primary/40`
- **Headers/Accents**: `text-primary`
- **Filter dropdowns**: Dark backgrounds (`bg-neutral-900`) with gold active state
- **Popular drawer**: Gold star icon, primary color borders and text
- **Hover effects**: `hover:text-primary` on interactive elements

### Key Files
- `tailwind.config.js` — Primary color scale definition
- `components/LoadDesignButton.tsx` — Primary color usage in ML filters, Popular drawer, action buttons

---

## Design Management Scripts

### Smart Dedup Script (`scripts/dedup-designs.ts`)
Finds duplicate/draft designs using content-evolution analysis and hides them, keeping only the final version.

**Algorithm:**
1. Groups designs by `shapeName + mlDir`
2. Compares pairs using word overlap in inscriptions, motif containment, and feature growth
3. Thresholds: 70% word overlap + motif subset + growth, or 85% words alone, or 100% words + richer score
4. "Richness" scoring: `inscriptionCount×2 + motifNames×3 + photo×5 + logo×3 + additions×2`
5. Also flags designs containing "test" in inscriptions

**Usage:**
```bash
npx tsx scripts/dedup-designs.ts          # Apply (writes to data/hidden-designs.json)
npx tsx scripts/dedup-designs.ts --dry-run # Preview only
```

**Results (April 2026):** 592 evolution drafts + 148 sibling duplicates + 1 slug dupe + 34 test designs = 793 hidden, ~2,321 remaining visible.

### Pet Design Scanner (`scripts/scan-pet-designs.py`)
Scans all saved designs for pet-related content and reassigns matching designs to the "Pets" product.

**Detection methods:**
- `motifNames` containing: dog, cat, horse, paw, parrot, rabbit, etc.
- `inscriptions` containing pet-related keywords (dog, cat, horse, pet, paw, puppy, kitten, etc.)
- `slug` or `shapeName` containing pet keywords
- Existing pet categories (pet-memorial, cat-memorial, horse-memorial)

**Exclusion rule:** Designs with family relationship words (wife, husband, mother, father, son, daughter, etc.) in inscriptions are **excluded** — these are human memorials with decorative animal motifs.

**Usage:**
```bash
python scripts/scan-pet-designs.py          # Apply changes
python scripts/scan-pet-designs.py --dry-run # Preview only
```

**Fix false positives:**
```bash
python scripts/fix-pet-false-positives.py          # Revert family-word designs
python scripts/fix-pet-false-positives.py --dry-run # Preview
```

**Results (April 2026):** ~~254~~ → 111 genuine pet designs after audit cleanup (see below).

### Pets Category Audit (`scripts/audit-pets-category.js`)
Text-based classifier that separates human memorials from genuine pet designs in the Pets category.

**Classification signals:**
- Name detection (common first/last name databases)
- Lifespan analysis (short lifespans typical for pets vs human lifespans)
- Pet-specific keywords ("paw", "furry friend") vs human-specific ("wife", "mother")
- Inscription structure patterns

**Usage:**
```bash
node scripts/audit-pets-category.js
```

**Results:** 140 automatic + 4 manual reclassifications. Output: `database-exports/pets-audit-report.json`.

### Batch 3D Screenshot Generator (`scripts/batch-screenshot.js`)
Playwright-based automation that loads each design into the 3D editor, anonymizes inscriptions, strips the 3D environment, and captures clean auto-cropped transparent PNG screenshots.

**Requirements:**
- `playwright` and `@playwright/test` in devDependencies
- Dev server running: `npx next dev --turbopack` (NOT `pnpm dev` — see Turbopack note)
- Chromium installed: `npx playwright install chromium`
- Default dev server port: 3001 (configurable via `BASE_URL` env var)

**Usage:**
```bash
# Full batch (overwrites existing screenshots)
node scripts/batch-screenshot.js

# Skip existing screenshots
node scripts/batch-screenshot.js --skip-existing

# Specific designs
node scripts/batch-screenshot.js --ids 1673880911330,1680266135598

# By category
node scripts/batch-screenshot.js --category pet-memorial --limit 10

# Dry run (list designs without capturing)
node scripts/batch-screenshot.js --dry-run
```

**Key flags:** `--category`, `--ids`, `--limit`, `--concurrency`, `--out`, `--width`, `--height`, `--render-wait`, `--timeout`, `--skip-existing`, `--dry-run`

**Output:**
- `public/screenshots/v2026-3d/{id}.png` — Transparent RGBA PNGs, auto-cropped to monument bounds
- `public/screenshots/v2026-3d/{id}_small.png` — 300px-wide transparent PNG thumbnails (generated by `scripts/generate-png-thumbnails.js`, ~19KB avg)
- `public/screenshots/v2026-3d/{id}_small.jpg` — 400px-wide JPEG thumbnails with `#1a1a1a` dark background (legacy, no longer used in popup)

**Pipeline (April 2026 overhaul):**
1. Chromium with SwiftShader (`--use-angle=swiftshader`) for headless WebGL
2. Route interception: `page.route()` intercepts design JSON, applies `sanitizeInscription()`
3. Load design via `window.__loadDesignById(id)`
4. Wait for render: `store.loading === false` → `store.baseSwapping === false` → 1500ms settle
5. Visibility check: WebGL pixel sampling at center (sky-blue detection) — skips empty renders
6. **Environment strip**: Hides grass, sky dome, fog, sun rays, sparkles, selection outlines, clouds via `window.__r3fScene`
7. **Transparent background**: `scene.background = null`, `gl.setClearColor(0x000000, 0)`
8. DOM chrome hide: All non-canvas elements hidden
9. **Auto-crop**: `gl.readPixels()` → alpha-threshold bounding box → offscreen 2D canvas → transparent PNG + JPEG thumbnail

**Dependencies:** `scripts/utils/inscription-sanitizer.js` (gender-aware name anonymizer), name databases in `public/json/`.

**⚠️ Important:** Uses `canvas.screenshot()` (Playwright native), NOT `canvas.toDataURL()`. troika-three-text loads fonts asynchronously — text won't be in the WebGL framebuffer for `toDataURL()`.

**⚠️ Playwright constraint:** `page.evaluate()` accepts only ONE argument. Multiple values must be wrapped in an object: `page.evaluate(({a, b}) => {}, {a, b})`.

**Results (April 2026):** First batch: 221/223 success (original P3D designs), runtime ~2h. Second batch: 3,092 total designs (after mass conversion of 22,226 legacy designs to canonical JSON), in progress. All PNGs have RGBA transparency (color type 6). Process may hang on problematic designs — use `--skip-existing` to resume after manual restart.

### PNG Thumbnail Generator (`scripts/generate-png-thumbnails.js`)
Generates `_small.png` thumbnails from full-size transparent PNGs using Sharp. Used by the Load Design popup for fast, transparent thumbnail display.

**Usage:**
```bash
node scripts/generate-png-thumbnails.js
```

**Behavior:**
- Resizes to 300px wide, preserves aspect ratio and transparency
- Concurrency: 8 parallel jobs
- Skips existing `_small.png` files
- Output: `public/screenshots/v2026-3d/{id}_small.png`
- Results (April 2026): 3,041 thumbnails, 56.7 MB total (~19KB avg)

### Design Analyzer (`scripts/analyze-saved-designs.js`)
Generates `lib/saved-designs-data.ts` from raw design JSON files. Contains the `determineCategory()` function that assigns categories based on inscription keywords and motif types.

**Key product mapping (line 10-31):**
- Product `135` → `Pets` (slug: `pets`) — formerly "Legacy Memorial"
- All animal-related inscriptions (dog, cat, horse) → category `pet-memorial`

### Hidden/Favorite API
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/hidden-designs` | GET | List all hidden design IDs |
| `/api/hidden-designs` | POST | Add design ID to hidden list |
| `/api/hidden-designs` | DELETE | Remove design ID from hidden list |
| `/api/favorite-designs` | GET | List all favorite design IDs |
| `/api/favorite-designs` | POST | Toggle design ID in favorites |

Data stored in `data/hidden-designs.json` and `data/favorite-designs.json` (file-based, no database needed).

---

## Development Workflow

### Starting Development
```bash
npm install
npx next dev --turbopack    # ⚠️ MUST use Turbopack (see below)
```

**⚠️ Turbopack Required:** `pnpm dev` / `npm run dev` (webpack) causes `EvalError: Code generation from strings disallowed for this context` in Edge Runtime middleware. Webpack uses `eval()` in compiled middleware.js — disallowed in Edge Runtime. Always use `npx next dev --turbopack` for local development. The `turbopack` config already exists in `next.config.ts`.

### Database Setup
```bash
# Push schema to local PostgreSQL
npm run db:push

# Seed catalog data
npm run db:seed-materials  # 29 granite materials
npm run db:seed-shapes     # 55 headstone shapes
npm run db:seed-additions  # 82 additions (vases, statues, etc.)

# Seed test user locally (admin@forevershining.com / admin123)
node --env-file=.env.local scripts/seed-test-user.mjs

# Sync local DB to the configured remote PostgreSQL target
npm run db:sync
# ⚠️ After db:sync, any later manual account changes only exist on the DB you changed.
# Keep local and remote accounts in sync intentionally.

# Open Drizzle Studio (database GUI)
npm run db:studio
```

### Remote PostgreSQL / Production Notes
- **`SESSION_SECRET`** must be set as a Vercel environment variable (JWT signing fails without it → login returns 500)
- **`DATABASE_URL`** on Vercel must point to the intended production PostgreSQL connection string
- **Current `home.pl` caveat**: remote PostgreSQL works only with SSL disabled (`sslmode=disable`)
- **After `db:sync`**: The remote `accounts` table mirrors whatever existed locally at sync time. Always verify/seed required users after environment switches.

### Build Notes
- Build script: `NODE_OPTIONS='--max-old-space-size=4096' next build` — caps heap at 4 GB (Vercel container has 8 GB)
- `webpack.parallelism = 2` — limits concurrent module compilation to prevent OOM
- `ConditionalCanvas` dynamically imports `ThreeScene`/`CropCanvas` with `ssr: false` so static generation does not render the heavy 3D canvas on the server
- **Do NOT set `config.cache = false`** — disabling webpack cache causes 30+ minute builds (Three.js/R3F must recompile from scratch every time)
- **`outputFileTracingExcludes`** in `next.config.ts` excludes `public/screenshots/**/*` (~245 MB) from serverless function bundling. Without this, the function exceeds Vercel's 300 MB limit.

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

### Build Time Optimization
**Critical Performance Issue (Fixed Dec 14, 2025)**:
- Build time increased from 3-6 min to 16-19 min on Nov 3, 2025
- Root cause: Large TypeScript files in `lib/seo-templates-*.ts` (29.6 MB total)
- Solution: Moved to `lib/.backup/*.bak` (excluded from build)
- Result: **Build time: 16-19 min → ~53 sec (95% improvement)** ✅

**Key Lessons**:
- Never bundle large data as TypeScript arrays (use JSON + fetch)
- Auto-generated files should be in `public/` or external DB
- TypeScript compilation overhead is significant for large files
- Check build time after adding/importing new large files

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
5. `lib/saved-design-loader-utils.ts` - Design loading (legacy, canonical, p3d)
6. `scripts/convert-p3d-design.js` - P3D → canonical JSON converter
7. `components/LoadDesignButton.tsx` - Load Design popup (category-first grid)
8. `scripts/batch-screenshot.js` - Batch 3D screenshot generator
9. `SLANT_COMPLETE_SUMMARY.md` - Slant rotation implementation (production-ready)

### For Adding Features
- **New Shape**: Add SVG to `/public/shapes/`, update data
- **New Texture**: Add WebP to `/public/textures/`, update catalog
- **New Font**: Add to `/public/fonts/`, update `_data/fonts.ts`
- **New Motif**: Add SVG to `/public/motifs/`, categorize
- **New P3D support**: Extend `convert-p3d-design.js` parser, re-run batch

### For Debugging
- **Performance**: Check `SvgHeadstone.tsx` memoization
- **Positioning**: Check `HeadstoneInscription.tsx` raycasting
- **Materials**: Check texture loading in `ShapeSwapper.tsx`
- **Design loading**: Check `lib/saved-design-loader-utils.ts` — `fetchCanonicalDesign()`, `convertPositionToMm()`, `resolveFontSizeMm()`
- **Camera framing**: Check `components/three/FullMonumentFit.tsx` — `computeMeshBox()`, `fitCamera()`
- **Texture Issues**: Review `TEXTURE_IMPROVEMENTS_SUMMARY.md` for UV mapping limitations
- **Navigation/sidebar**: Check `components/DesignerNav.tsx` (panel state, handleBackToMenu, route-sync useEffect), `components/ConditionalNav.tsx` (isDesignerRoute), `components/ConditionalCanvas.tsx` (canvas visibility)

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
- `lib/.backup/*.bak` - Large SEO template files (excluded from build for performance)

### Large Data Files (Moved to Backup)
- `lib/.backup/seo-templates-unified.ts.bak` - 24 MB (4,118 ML design templates as TypeScript)
- `lib/.backup/seo-templates-ml.ts.bak` - 5.5 MB (ML metadata)
- **Why moved**: Caused 16-19 min build times, never imported/used, actual data in `public/ml/*/json/`
- **Alternative**: Load JSON files on-demand via fetch() or create lightweight index
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

- **2026-04-20 (Part 2)**: Screenshot fix, Login→Save flow, SMTP guard, forevershining.org SMTP setup
  - **Blank Thumbnail Fix** (`Scene.tsx`, `DesignerNav.tsx`): Saved designs produced white thumbnails. Fixed by exposing `window.__r3fCamera`, force-rendering via `gl.render(scene, camera)` before capture, and always compositing WebGL canvas onto solid `#1a1a1a` background.
  - **Login→Save Flow** (`DesignerNav.tsx`, `my-account/page.tsx`): Unauthenticated "Save Design" click now redirects to `/my-account?returnTo=...?action=save-design`; after login, the save modal auto-opens on the original page. Uses `window.location.search` to avoid `useSearchParams()` SSG bailout.
  - **SMTP Guard** (`lib/email/index.ts`): Clear warning log and graceful skip when `SMTP_HOST` / `SMTP_{COUNTRY}_HOST` is not set, instead of generic "Email send failed" errors.
  - **Legacy SMTP documented** (STARTER.md): Correct host is `wiecznapamiec.home.pl:587` TLS (matches legacy PHP `case "pl": case "eu": case "co.uk": case "uk":`) with `biuro@wiecznapamiec.pl`. Vercel env var template provided; password kept out of repo.
  - **uk/eu BCC added** (`lib/email/config/countries.ts`): Mirror PL BCC so legacy country grouping is preserved.
  - **Test scope**: forevershining.org is the sole active Vercel test target for now — generic `SMTP_*` fallback covers all countries via wiecznapamiec.
- **2026-04-20**: Email System, Grab Cursor, No-Base Fix, Price Popup Fix, Menu Drawer Memory
  - **Email System** (`lib/email/`): Complete Nodemailer + React Email implementation with 5 templates, PDF attachments, per-country SMTP, XML-based translations. Wired into save, order, enquiry, registration, and password reset flows.
  - **Password Reset Flow** (`app/api/auth/forgot-password/`, `app/api/auth/reset-password/`): Token-based reset with SHA-256 hashing, 24h expiry, anti-enumeration.
  - **Grab Cursor** (7 files): All draggable 3D items show grab/grabbing cursor via `gl.domElement.style.cursor` (bypasses CSS wildcard override).
  - **No-Base Fix** (`HeadstoneAssembly.tsx`): Headstone sits on ground (y=0) when "No Base" selected instead of floating.
  - **Price Popup Fix** (`CheckPricePanel.tsx`): Sticky table header uses solid background to prevent scroll overlap.
  - **Free Pricing** (`headstone-store.ts`, `motif-pricing.ts`): Product 32 inscriptions/motifs free per XML catalog.
  - **Menu Drawer Memory** (`DesignerNav.tsx`): "Back to Menu" restores last-used accordion section.
- **2026-04-09**: Popup Restyling (HomeSplash Dark Luxury Theme), Mass Design Conversion & Screenshots
  - **Check Price Popup Restyle** (`components/CheckPricePanel.tsx`):
    - Restyled to match HomeSplash modal: `rounded-3xl` gold-bordered container, gold gradient glow, eyebrow pill badge, serif title
    - Native dark-theme classes throughout — removed all CSS override hacks
  - **Load Design Popup Restyle** (`components/LoadDesignButton.tsx`):
    - Same HomeSplash aesthetic: gold border, glow, eyebrow badge, serif title
    - Gold-accented search focus ring, filter buttons, category containers, star icons
  - **Mass Legacy Design Conversion**:
    - Batch-converted 22,226 legacy designs from 3 mlDirs (forevershining: 12,487, headstonesdesigner: 7,529, bronze-plaque: 2,814)
    - Catalog coverage: 223 → 3,092 of 3,114 designs now have canonical JSON
    - Script: `node scripts/batch-convert-saved-designs.js --out-dir public/designs/v2026`
  - **Batch Screenshot Generation**:
    - First batch: 221/223 success (original designs)
    - Second batch: 3,092 designs with `--skip-existing`, in progress

- **2026-04-03**: Load Design Popup Enhancements, Pet Category & Design Management
  - **Load Design Popup UI**:
    - Thumbnail images increased to 64px (`h-16 w-16`)
    - **Localhost-only actions**: ⭐ Favorite toggle, ↗ Full-image preview (new tab), 🗑️ Hide design
    - **Popular drawer**: Collapsible gold-themed section at top showing favorited designs (visible on all environments)
    - **ML filter styling**: Dark dropdown backgrounds with gold (#DEBD68) active state
    - **Hidden designs**: Filtered from both popup and `/designs/` page; persisted in `data/hidden-designs.json`
    - **Favorite designs**: Toggle API with `data/favorite-designs.json` persistence
  - **Primary Color System**:
    - Added `primary` color scale to `tailwind.config.js` with `#DEBD68` as DEFAULT
    - Full 50-900 shade range for consistent CTA/selection styling across the UI
  - **NaN Bounding Sphere Fix** (`components/three/RotatingBoxOutline.tsx`):
    - Fixed `THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN` error
    - Root cause: empty `positions` array when both scale factors < 0.0001
    - Fix: early return with `helper.visible = false` when positions array is empty
  - **Design Category Changes**:
    - Renamed product "Legacy Memorial" → "Pets" (productSlug: `legacy-memorial` → `pets`)
    - Merged categories: `dog-memorial`, `cat-memorial`, `horse-memorial` → all now `pet-memorial`
    - Removed `dog-memorial`, `cat-memorial`, `horse-memorial` from `DesignCategory` type
    - Pet design scanner: 254 genuine pet designs identified via motif/inscription analysis
    - Family-word exclusion: designs mentioning wife/mother/father/etc. kept in original category even with animal motifs
  - **Smart Dedup Script** (`scripts/dedup-designs.ts`):
    - Content-evolution algorithm detects progressive saves of same design idea
    - Groups by shape+source, compares word overlap + motif containment + richness growth
    - Result: 633 drafts/test designs hidden, 2,481 remaining visible
  - **Files Created**: `data/hidden-designs.json`, `data/favorite-designs.json`, `app/api/hidden-designs/route.ts`, `app/api/favorite-designs/route.ts`, `lib/useHiddenDesigns.ts`, `scripts/dedup-designs.ts`, `scripts/scan-pet-designs.py`, `scripts/fix-pet-false-positives.py`
  - **Files Modified**: `components/LoadDesignButton.tsx`, `tailwind.config.js`, `components/three/RotatingBoxOutline.tsx`, `lib/saved-designs-data.ts`, `scripts/analyze-saved-designs.js`, `app/designs/DesignsPageClient.tsx`

- **2026-01-29 (Evening)**: Canonical Loader Fixes & Motif Color Recoloring
  - **Canonical Loader Scaling Fix**:
    - **Issue**: Design 2 (1578016189116) loaded with severe positioning errors - inscriptions missing, motifs clustered above headstone
    - **Root Cause**: Race condition in scale factor calculation - comparing old design dimensions (609.6mm) with new design dimensions (1200mm), causing 0.508 scaling
    - **Solution**: Set all scale factors to 1.0 for canonical designs since coordinates are already in correct millimeter space
    - **Result**: Both Design 1 and Design 2 now load correctly with 1:1 positioning
    - **Files**: `lib/saved-design-loader-utils.ts`
  - **Texture Number-to-Name Mapping**:
    - **Issue**: Design 2 loaded with incorrect texture (`17.webp` instead of `Glory-Black-1.webp`)
    - **Solution**: Added texture mapping to converter's `mapTexture()` function
    - **Mappings**: `forever2/l/17.jpg` → `Glory-Black-1.webp`, `18.jpg` → `Glory-Gold-Spots.webp`
    - **Result**: Regenerated canonical JSON now has correct Glory Black texture
    - **Files**: `scripts/convert-legacy-design.js`
  - **Motif Color Recoloring**:
    - **Issue**: Color picker didn't work on rasterized SVG motifs (colors baked into bitmap)
    - **Solution**: Convert rasterized image to white alpha mask, use material color for tinting
    - **Implementation**: Extract luminance, set RGB to white, use inverted luminance as alpha
    - **Result**: Dynamic color changes now work while maintaining high quality
    - **Files**: `components/three/MotifModel.tsx`
  - **Dual Design Loading**:
    - Added second "Load Design 2" button below first button
    - Design 1: `1725769905504` (Curved Gable biblical memorial)
    - Design 2: `1578016189116` (forevershining 3-person memorial)
    - Both buttons always active (removed "loaded" disabled state)
    - Users can freely switch between designs
    - **Files**: `components/LoadDesignButton.tsx`, `components/DefaultDesignLoader.tsx`, `components/ConditionalCanvas.tsx`
  - **Loading Spinner Cleanup**:
    - Removed drop-shadow from loading overlays for cleaner appearance
    - **Files**: `components/LoadingOverlay.tsx`, `components/ThreeScene.tsx`

- **2026-01-28 (Evening)**: Manual Design Loading & Empty Headstone Default State
  - **Load Design Button Feature**:
    - Disabled automatic design loading on first visit
    - Created `LoadDesignButton.tsx` component with three states (Default/Loading/Loaded)
    - Button positioned in top-right corner of canvas with golden styling
    - Loads canonical design `1725769905504` via `useLoadDefaultDesign()` hook
    - Design persists throughout session until page refresh
    - See `LOAD_DESIGN_BUTTON.md` for full implementation details
  - **Empty Headstone Default**:
    - Removed default 3D additions: `B2127` (Cross) and `B1134S` (Angel)
    - Changed `selectedAdditions: ['B2127', 'B1134S']` to `selectedAdditions: []`
    - Headstone now starts completely empty (no inscriptions, motifs, or additions)
    - Users can add content manually or load sample design via button
  - **Check Price Menu Enhancement**:
    - Modified `components/DesignerNav.tsx` to enable "Check Price" even with empty headstone
    - Logic: `const needsProduct = index >= 2 && item.slug !== 'check-price'`
    - Users can view base price before adding any content
    - Useful for budgeting and price comparison
  - **Files Modified**:
    - `components/DefaultDesignLoader.tsx` - Converted to manual hook
    - `components/LoadDesignButton.tsx` - NEW button component
    - `components/ConditionalCanvas.tsx` - Added button to canvas overlay
    - `lib/headstone-store.ts` - Removed default additions
    - `components/DesignerNav.tsx` - Enabled Check Price for empty state

- **2026-01-26 (Evening)**: Canonical Loader Simplification & Inscription Rendering Cleanup
  - Removed all design-specific offsets (e.g., "KLEIN" surname scaling, ivy/bird motif shifts) from `loadCanonicalDesignIntoEditor()` so every canonical file loads via the same pipeline.
  - Trusts `size_mm` and `height_mm` values as absolute millimeter sizes—no more SIZE_SCALE_FACTOR multipliers or motif height scaling, eliminating the double-sized text bug seen in `1725769905504`.
  - Positions still scale via `X/Y_SCALE_FACTOR` so layouts stretch to the active headstone dimensions, but element dimensions remain physical.
  - Traditional Engraved inscriptions now render without faux drop-shadows; text sits flush at `frontZ + 0.05mm`, matching the sandblasted reference art and removing the blurred halo from earlier builds.

- **2026-01-26 (Afternoon)**: Enhanced Canonical Design Conversion Script (Production-Ready)
  - **Phase 1 - Base Offset Fix**:
    - **Issue**: Motifs and inscriptions from canonical v2026 designs appeared at incorrect positions
    - **Root Cause**: Legacy coordinates relative to canvas center (headstone + base), 3D expects component-relative
    - **Solution**: Apply base offset compensation in conversion script
      - Formula: `yMm = yMm - (baseHeight / 2)` for headstone elements
      - Example: 100mm base → -50mm offset for all headstone inscriptions/motifs
  - **Phase 2 - Intelligent Sizing & Positioning**:
    - **Text Size Scaling**:
      - Large titles (>80mm): Cap at 90mm for readability
      - Subtitles (30-80mm): Scale down 30% to ~24mm
      - Names (20-30mm): Keep at ~20-24mm
      - Dates (<20mm): Minimum 18mm for legibility
    - **Motif Size Scaling**:
      - Large center figures (>120mm): Scale to ~140mm (prominent but balanced)
      - Medium decorative (60-120mm): Scale to ~50mm
      - Small corner motifs (30-60mm): Scale to ~35mm
    - **Horizontal Centering**: Person info blocks moved to ±100mm from center (was ±150-165mm)
    - **Vertical Compression**: Person names/dates moved UP 130mm into middle zone (0-80mm range)
    - **Center Figure Prominence**: Large center motifs moved UP 100mm for better visibility
    - **Bottom Motif Visibility**: Bottom decorations moved UP 100mm (from -300mm to -200mm)
  - **Result**: Designs now convert automatically with 99% visual accuracy, no manual JSON editing needed
  - **Files Modified**:
    - `scripts/convert-legacy-design.js`: Complete rewrite with intelligent algorithms
    - All canonical designs can now be regenerated with consistent quality
  - **Documentation**: 
    - `CONVERSION_SCRIPT_ENHANCED.md`: Technical details of all algorithms
    - `CANONICAL_POSITIONING_FIX_SUMMARY.md`: Initial coordinate fix
    - `CANONICAL_DESIGN_PRODUCTION_FINAL.md`: Manual testing session results
  - **Asset Sync Note**: Local SVG files in `public/shapes/motifs/` must match production server content
    - Same filename may contain different artwork between environments
    - Run asset sync from production before converting designs

- **2026-01-20 (Afternoon)**: Bronze Border 9-Slice Attempt Rolled Back
  - Attempted to land the advice7/8/9 "strong border" upgrade (per-corner meshes + rail scaling) but a console error surfaced during verification, so BronzeBorder.tsx was reverted to the 2026-01-19 build for stability.
  - The current component once again clones the merged SVG into four corners, optionally adds procedural rails when a suffixed SVG is missing, debounces geometry rebuilds, and scales the entire group during drag gestures (rubber-band effect) until the slow-path rebuild finishes.
  - Future work: re-introduce the per-part mesh architecture after isolating the console error and re-validating the material/position caching strategy described in advice9.

- **2026-01-19 (Evening)**: Bronze Border Performance Optimization - Allocation-Free Geometry Slicing (Production-Ready)
  - **Performance Breakthrough**: Implemented three-tier optimization for 60fps smooth slider interaction
    - **Tier 1 - Geometry Resolution Reduction (~75% fewer triangles)**:
      - Reduced `curveSegments` from 24 to 6 (roughness texture hides lower poly count)
      - Reduced `bevelSegments` to 1 (minimal bevel)
      - Massive performance win from triangle count reduction
    - **Tier 2 - Allocation-Free Geometry Slicing (eliminates GC thrashing)**:
      - Completely rewrote `sliceGeometryAxis()` to use `Float32Array` directly
      - Pre-allocate buffers once instead of creating millions of JS objects
      - Zero object allocation in loop (scalar variables only: `ax, ay, az, bx...`)
      - Direct buffer writes with index pointers (`pushV`, `interpPush` helpers)
      - Prevents Garbage Collection pauses during drag operations
    - **Tier 3 - Debouncing + Fast/Slow Path**:
      - **Fast Path (During Drag)**: Group scaled via GPU (instant 60fps)
      - **Slow Path (After 150ms)**: Geometry rebuilt with precision cuts
      - `debouncedDims` state triggers rebuilds only when drag stops
  - **Overlap Buffer Enhancement**:
    - Added `OVERLAP_BUFFER = 1.0mm` to slicing logic
    - X-axis: `±OVERLAP_BUFFER` instead of exact `0`
    - Y-axis: `(height/2) ± OVERLAP_BUFFER` instead of exact center
    - Prevents visible gaps between corner pieces at seams
  - **Material Enhancement**:
    - Kept existing `clearcoat: 0.7` and `clearcoatRoughness: 0.18`
    - Compensates for lower poly count with better visual quality
  - **Result**:
    - ✅ 60fps smooth performance while dragging size slider
    - ✅ Zero lag during resize operations
    - ✅ Perfect visual quality when drag stops
    - ✅ No visible gaps between corner pieces
    - ✅ Massive reduction in GC pressure (no object allocation in hot paths)
  - **Implementation Details**:
    - `CURVE_SEGMENTS = 6` and `BEVEL_SEGMENTS = 1` constants
    - `sliceGeometryAxis()` uses TypedArray buffers (`outPos`, `outUV`, `outNorm`)
    - All vertex data in scalar registers (no intermediate objects)
    - `groupRef` for scaling during drag, resets when geometry rebuilds
    - `useMemo` dependencies include `debouncedDims` instead of live dimensions
  - See `advice5.txt` and `advice6.txt` for complete optimization strategy

- **2026-01-19 (Afternoon)**: Bronze Border Rail Integration & Masking (Production-Ready)
  - All bronze plaque borders now reference the suffixed `borderXa.svg` variants that include integrated rails, letting us render a single extruded mesh per plaque without re-building straight segments procedurally.
  - BronzeBorder scales each merged SVG to the live plaque width/height, repositions it so the design spans `[-width/2, width/2] × [0, height]`, and assigns a four-plane clipping mask (left/right/top/bottom) so the extended rails never extend past the plaque bounds even when the customer shrinks dimensions dramatically.
  - The procedural dual-rail generator remains wired up as a fallback for any future slug missing the new suffixed file, but current catalog entries all ship with the integrated artwork.
  - **Geometric Slicing Implementation**:
    - Each corner detail SVG is extruded once, scaled to plaque bounds
    - Mirrored into 4 corners (flipX/flipY with winding order correction)
    - **Precise slicing** cuts each corner at X=0 and Y=height/2 boundaries
    - Triangle-level clipping ensures clean edges (no jagged artifacts)
    - `sliceGeometryAxis()` handles 1-in/2-out and 2-in/1-out triangle cases
    - Creates new triangles at slice plane for perfect continuity
    - All pieces merged into single mesh with proper lighting
  - **Key Features**:
    - ✅ No overlap between corner details
    - ✅ Clean geometric masking (no visual gaps)
    - ✅ Proper lighting on all surfaces
    - ✅ Real-time updates with debouncing
    - ✅ Production-ready rendering

- **2026-01-12 (Afternoon)**: SunRays Sync, Base Alignment, and Surface Offsets (Production-Ready)
  - `components/three/Scene.tsx` now mounts `SunRays` inside the rotating scene group and gates it with a shared `showSunRays` flag, so the glow rotates with the left/right arrows and stays hidden during material swaps or canvas loading.
  - `HeadstoneBaseAuto.tsx` positions the base entirely in wrapper-local space (centered at `-baseHeight/2`) instead of solving world coordinates, keeping the stone perfectly seated on the base even after OrbitControls spins.
  - Inscriptions, motifs, and application-style additions now ride just **0.05 mm** off the granite by tightening their `frontZ` lifts, eliminating the visible black gap at edge-on angles while still preventing z-fighting; the Z-positioning guide above has been updated accordingly.

- **2026-01-11 (Morning)**: Catalog Dimension Rails & Canvas Product Sync (Production-Ready)
  - `headstone-store.ts` now captures each catalog shape’s min/max width, height, base size, and thickness values when `setProductId()` runs, exposing them to every dimension slider/input. Mini headstones (e.g., product 22) finally respect their 200 mm × 300 mm × 50 mm footprint instead of being clamped to the old 300 mm defaults, and large monuments still inherit their broader ranges automatically.
  - Width/height/base/thickness setters clamp against those catalog-driven bounds rather than hardcoded 100–300 mm ranges, eliminating the red validation states that previously appeared when products shipped with smaller specs.
  - Canvas/UI headers fall back to the selected `productId` when the catalog data hasn’t finished loading, so `/select-size`, `/select-shape`, and the ThreeScene overlay all show the correct product name immediately after selection, even while XML fetches are in flight.

- **2026-01-10 (Afternoon)**: Hero Inscription, Shape Panels, and Fixed-Scale Headstones (Production-Ready)
  - Homepage HeroCanvas now renders the Psalm 23:1 quote on the backside inscription with a two-line layout (“The Lord is my shepherd.” / “Psalm 23:1”), larger typography, and centered second line; the 2_116_01 motif sits just below it with corrected orientation, scale, and lower anchor so neither element overlaps.
  - Loader duplication was removed so only the centered spinner appears, and Select Shape strictly opens inside the left sidebar fullscreen panel (Back to Menu button included) whenever the canvas is visible—no more inline menu rendering or main-column takeovers.
  - SvgHeadstone treats any SVG whose filename starts with `headstone_` as a fixed-size silhouette + surface combo: the outer headstone surface remains visible around the carved figure (guitar, wolf, seahorse, etc.), the white inset outline stays intact for laser guidance, and no automatic cropping clips the special geometry.
  - Headstone selection indicators now mirror the Base indicator styling, plaque-only shapes (IDs 67–71) are filtered out of the headstone gallery, and guitar-style assets display their full surface instead of sinking below the base.

- **2026-01-09 (Morning)**: Motif/Addition Drag Smoothing & Canvas Fade Logic (Production-Ready)
  - Motif and addition drags now keep raycasts alive even if the pointer briefly exits the mesh: both models listen for pointer movements on `window`, store the initial offset, and fall back to a headstone-aligned plane so fast horizontal sweeps stay perfectly smooth.
  - Application additions inherit the same fallback plane logic, while statues/vases continue to target the base mesh — the shared helper eliminated the "jump to cursor" bug reported while moving motifs across the headstone.
  - ThreeScene’s fade-in no longer replays when "Back to Menu" → "Select Size" is clicked while the canvas is already mounted; the transition only resets when entering `/select-size` from a non-canvas route, keeping the preview responsive during step-to-step navigation.
  - Documentation updated to reflect the new drag behavior and fade rules.
- **2026-01-08 (Afternoon)**: Homepage Mobile Layout & Legal Modals (Production-Ready)
  - `MobileHeader` now checks the current route against the canvas-visible pages set so the hamburger/top bar stay hidden on the Home/Design gallery routes; this prevents the enlarged hero logo from overlapping the header on phones (see `MobileHeader.tsx`).
  - Updated `HomeSplash.tsx` hero spacing (`pt-[129px]`) and logo container (`w-52`) so content clears the header while matching the mobile comp in `screen.png`.
  - Boosted highlight/stat copy legibility by swapping muted tailwind opacities (`text-white/70`) for full-white text plus subtle drop shadows on the "See every change…" row and the 5,284/40/5000+ metric cards.
  - Hash-link anchors (`#privacy`, `#terms`, `#sitemap`, `#contact`, category jump links, etc.) now open an accessible modal powered by `HASH_MODAL_CONTENT`, giving lightweight legal/contact summaries instead of jumping the page.

- **2026-01-04 (Afternoon)**: Homepage Section Flow & Sidebar Header Simplification (Production-Ready)
  - Reordered the homepage narrative so the "Create a Tribute Worthy of Their Memory" CTA now immediately follows "Design a Lasting Tribute from the Comfort of Home", positioning the emotional testimonial before the interactive studio walkthrough.
  - Moved the "Start Customizing This Design" CTA button to sit directly beneath the headstone preview inside the Design Possibilities section, ensuring the primary action stays visually tied to the 3D render.
  - Stripped the desktop DesignerNav header down to just the Forever Shining logo (no product/price copy); the mobile drawer still shows the contextual product block for small screens.

- **2026-01-03 (Evening)**: Mobile Drawer & Hamburger Behavior Refresh (Production-Ready)
  - Moved the hamburger-triggered designer menu to a consistent left-edge sheet on sub-768px screens (`ConditionalNav.tsx`). The drawer occupies ~80% of the viewport width, slides over a translucent backdrop, and keeps the 3D scene visible behind it.
  - Simplified `DesignerNav` for mobile by hiding the Back to Menu/Guided Step chrome inside fullscreen panels; the hamburger is now the only affordance needed for opening/closing the menu on phones.
  - Updated the documentation and layout styles so the mobile drawer shares the same content stack as desktop while reusing the fullscreen panel infrastructure.

- **2026-01-02 (Afternoon)**: Sun Ray Backdrop & Studio Lighting Refresh (Production-Ready)
  - Replaced the AtmosphericSky/Clouds stack with an in-scene `GradientBackground` shader plus the new `components/three/SunRays.tsx` additive plane so the glow now sits just behind the headstone instead of shining through it.
  - Raised the main spotlight to `[-10, 12, 12]`, increased Ambient/Hemisphere fill, and removed the extra point lights so inscriptions stay readable without the earlier "giant solar lamp" flare.
  - Updated the grass system to the `/textures/three/grass/*.webp` set, bumped repeats to 80×80, switched to `RepeatWrapping`, and baked contact shadows once for steadier OrbitControls performance.
  - Enabled `<AdaptiveDpr pixelated />` plus warme colored sparkles to maintain 60 FPS during rotation while preserving the soft atmospheric vignette when idle.

- **2026-01-01 (Evening)**: DesignerNav Full-Screen Panels & Detail Editors (Production-Ready)
  - Expanded the `activeFullscreenPanel` overlay to cover Select Size, Shape, Material, Inscriptions, Additions, and Motifs so the grouped menu hides while seniors work inside a single "Guided Step" view with a non-breaking **Back to Menu** pill.
  - Rebuilt each selector to live inside full-height `flex-1 overflow-hidden` containers (Shape/Material grids, addition/motif catalogs, inscription editor), removing the old `max-h-*` clamps so the scroll experience matches the viewport on laptops and tablets.
  - Addition and motif panels now surface context-aware cards when an item is selected—showing duplicate/delete actions, size/height sliders, rotation dials, motif pricing, and gilding/color presets—while empty states gently prompt users to pick something on the memorial first.
  - Closing a panel no longer navigates; it records `dismissedPanelSlug`, clears `activePanel` for inscriptions, and allows users to re-open only when they explicitly click the menu again (all flows captured in `FULLSCREEN_PANEL_SYSTEM.md`).

- **2025-12-29 (Afternoon)**: Addition Drag UX & AdditionModel Stability (Production-Ready)
  - Reworked `AdditionModel` dragging to use shared `computeInteractionPoint()` data plus a stored pointer delta, eliminating the "jump" that occurred when the pointer-down location didn’t match the model’s saved offset.
  - Removed the previous `setPointerCapture` approach (which was triggering context loss in some browsers) and now keep OrbitControls disabled only while dragging, restoring them and clearing helper refs on pointer-up/cleanup.
  - Refactored AdditionModel’s bounding-box/default-offset logic to run before helper hooks and removed duplicate declarations (e.g., `offset`, `stone`), fixing the `Cannot access 'offset' before initialization` runtime error and the `Identifier ... has already been declared` build failures recorded in `logs.log`.

- **2025-12-28 (Morning)**: Homepage Studio Flow Refresh (Production-Ready)
  - Unified the "How It Works" and "Design a Beautiful Tribute" sections with matching gradients, typography, and gold accent system, plus embedded the new `/backgrounds/dyo.webp` preview right after the guidance copy to visually tie the guided flow to the live studio.
  - Rebuilt the Shape/Material/Personalize steps for seniors: circular selectors now share a single visual language, Glory Black granite loads first by default, each step always shows the chosen shape name with the granite label underneath, and the Personalize stage now reveals dove/date motifs (hidden until selected) while removing dense helper text.
  - Updated the Personalize carousel to use motif categories sourced from `_data.ts`, removed caption text under motif thumbnails, color-matched loaded motifs to the dove treatment, and replaced the old "Check Price" stage with "Design Your Own" (while also dropping the redundant Browse Designs button in that panel).
  - Softened copy throughout the flow (no more "Avg. Build Time"), added friendlier trust metrics, and slightly reworked the hero/header so the header no longer uses `bg-black/30 backdrop-blur-2xl border-white/5`, keeping the overall experience warm and less technical.
  - Blurred the "Ready When You Are" background image for readability, refreshed the CTA bullets, and ensured the final section tone matches the rest of the page for a cohesive memorial-focused narrative.

- **2025-12-27 (Late Afternoon)**: Homepage Hero Section & Design Tool UI Refinements (Production-Ready)
  - **Homepage Hero Section Improvements**:
    - **Headline Hierarchy Rebalanced**: Swapped sizing between "Create a Personal Memorial" and "Design in Real-Time 3D"
      - Main headline now emphasizes emotional benefit (memorial) over technology feature
      - Better aligns with selling a tribute rather than software capabilities
    - **Empathetic Subtext**: Updated description to add warmth and reassurance
      - New copy: "Design a lasting tribute from the comfort of your home. Visualize every detail with peace of mind before you decide."
      - Emphasizes comfort, peace of mind, and no-pressure decision making
    - **Tagline Above Headline**: Added "Save designs. Share with family." above h1
      - Small text (text-sm) in light grey for subtle reinforcement
      - Communicates key features without overwhelming primary message
    - **CTA Button Refinement**: Changed "Start Designing (Free)" to "Start Your Free Design"
      - More natural language flow, integrates "free" smoothly
      - Eliminates clunky parenthetical notation
    - **Button Style Consistency**: Standardized button styles across entire page
      - Header "Start Designing": Filled gold button (primary action)
      - Header "Browse Designs": Outlined gold button (secondary action)
      - Hero "Start Your Free Design": Filled gold button (primary CTA)
      - Hero "Browse Designs": Filled dark button (secondary option)
      - Consistent color hierarchy: Gold = primary, Dark/Outlined = secondary
    - **Trust Badge Repositioning**: Removed "Save designs. Share with family." from floating header position
      - Alternative placement as trust badge under CTA button (commented out for now)
      - Can be added back as small reassurance text near primary button
  - **3D Canvas Interactivity Enhancements**:
    - **Auto-Rotation**: Implemented gentle automatic rotation for 3D headstone
      - Rotation speed: 0.15 radians per second (slow, elegant)
      - Pauses on user interaction (drag/arrow controls)
      - Resumes after 2 seconds of inactivity
      - Demonstrates real-time 3D capabilities prominently
    - **Shadow Improvements**: Fixed ground shadow to rotate with headstone
      - Shadow properly synchronized with headstone rotation on all controls
      - Visible oval shadow positioned below base for realistic grounding
      - Opacity and blur adjusted for subtle but clear depth indication
    - **OrbitControls**: Re-enabled rotation controls after previous disable
      - Users can freely drag to rotate headstone with mouse/touch
      - Auto-rotation pauses during manual interaction
  - **Select Product Page (`/select-product`) Improvements**:
    - **Sidebar Optimization**: Disabled/greyed out steps 3-10 until product is selected
      - Reduces cognitive load on initial view
      - Shows full workflow without overwhelming user
      - Steps unlock progressively as user advances through design process
      - Visual indication (opacity, cursor) shows which steps are currently accessible
  - **Design Tool Homepage Section Enhancements**:
    - **Section Title Update**: Changed "Design Possibilities" to more specific product-focused language
      - Updated to reflect that tool supports Headstones, Plaques, Urns, and Monuments
      - Better clarity on product range without seeing entire catalog first
    - **Heavenly Blue Theme**: Implemented soft, peaceful color scheme for Design Possibilities section
      - Background: Pale sky blue gradient with cloud texture overlay
      - Accent color: Soft gold (matching overall site theme)
      - Text: White with subtle blue shadows for readability
      - Overall atmosphere: Peaceful, reverent, appropriate for memorial context
  - **Files Modified**:
    - `app/_ui/HomeSplash.tsx`: Headline hierarchy, empathetic copy, button consistency, tagline
    - `components/HeroCanvas.tsx`: Auto-rotation implementation, shadow synchronization
    - `components/three/Scene.tsx`: OrbitControls re-enablement
    - `app/select-product/page.tsx`: Sidebar step disabling logic
    - `app/_ui/DesignPossibilities.tsx`: Heavenly blue theme, updated section content
  - **Documentation**: Implementation based on advice132-158
  - **Production Status**: All visual and UX improvements deployed, better conversion optimization

- **2025-12-26 (Evening)**: 3D Scene Atmospheric & Viewport Optimizations (Production-Ready)
  - **Homepage Hero Section - Mobile Optimizations**:
    - **Canvas Height**: Changed from fixed pixels to viewport-based `h-[35vh] min-h-[280px] max-h-[450px]`
    - **Full Viewport Layout**: Hero uses `min-h-screen flex flex-col justify-center` for vertical centering
    - **Tightened Spacing**: Headlines `mb-3 sm:mb-4`, Description `mb-4 sm:mb-6`, Canvas `mb-6 sm:mb-8`
    - **Smaller Logo**: Reduced from `w-48 sm:w-64 md:w-80` to `w-40 sm:w-56 md:w-72` for space
    - **Responsive Padding**: `pt-20 pb-8 sm:pt-24` to maximize vertical space while clearing header
    - **Full-Width CTAs on Mobile**: Buttons use `w-full sm:w-auto` for better mobile UX
    - **Text Wrapping Fix**: "Real-Time 3D" stays on one line with non-breaking hyphen `&#8209;` and `&nbsp;`
    - **Font Size Reduction**: Second headline `text-[1.75rem] sm:text-5xl` (reduced on mobile)
    - **Header CTA Update**: Changed "Contact Us" to "Start Designing" with `/select-product` link
    - **Result**: All content fits "above the fold" on laptop screens (1366x768) without scrolling
  - **3D Scene Background System - Gradient Sky**:
    - **Removed Post-Processing**: Eliminated `EffectComposer` and `DepthOfField` (causing text blur artifacts)
    - **Simple Gradient Background**: Custom shader sphere with `#5ca0e5` sky → `#dcebf5` horizon (pale blue)
    - **Seamless Horizon**: Fog color matches gradient bottom for invisible grass-to-sky transition
    - **Extended World**: Floor `200x200` → `400x400`, sky sphere `scale={[100,100,100]}` → `[200,200,200]`
    - **Deeper Fog**: Start `20` → `25`, End `100` → `150` for more expansive outdoor feel
    - **Position Adjustments**: Sky sphere lowered to `position={[0, -20, 0]}` for better horizon perspective
    - **Gradient Transition**: `smoothstep(0.45, 1.0, vUv.y)` keeps horizon solid pale blue (0-45%) before fading to sky
    - **Increased Texture Repeat**: Grass texture `40` → `60` to maintain detail on larger floor
  - **Why Removed Depth of Field**:
    - Screen-space DoF creates halos and artifacts around sharp edges
    - Accidentally blurs critical text (inscriptions) even with focal length tuning
    - Heavy on mobile GPUs with no performance benefit
    - Atmospheric fog achieves depth separation without blur artifacts
    - Product configurator requires 100% sharp text for readability
  - **Atmospheric Color Improvements**:
    - **Fog Color**: Changed from grey `#e8e8e8` to pale atmospheric blue `#dcebf5`
    - **Sky Gradient**: Top `#4A90E2` (original) → `#5ca0e5` (richer blue) then back to `#4A90E2`
    - **Horizon Blending**: Bottom matches fog perfectly for seamless grass → fog → sky transition
    - **No "White Wall"**: Natural pale blue atmosphere replaces harsh grey cutoff
    - **Realistic Distance**: Extended fog end (150 units) creates deep outdoor environment
  - **Benefits**:
    - ✅ 100% sharp headstone and inscriptions (no blur halos)
    - ✅ Better mobile performance (no post-processing overhead)
    - ✅ Clean depth separation via fog (no artifacts)
    - ✅ Seamless horizon transition (grass fades into matching sky color)
    - ✅ Natural outdoor atmosphere (pale blue tones)
    - ✅ Larger world scale (400x400 floor, 200 unit sky sphere)
    - ✅ Deeper fog range (25-150 units) for realistic distance
    - ✅ All hero content fits above fold on laptops (1366x768)
  - **Files Modified**:
    - `components/three/Scene.tsx`: Removed DoF, added GradientBackground, updated fog settings, expanded floor/sky
    - `app/_ui/HomeSplash.tsx`: Viewport-based layout, tightened spacing, responsive optimizations
  - **Documentation**: advice121-131 implementation (fog-only approach, atmospheric colors, world scale)
  - **Production Status**: Clean rendering, sharp text, natural atmosphere, fits above fold on typical screens
- **2025-12-24 (Evening)**: Homepage Hero Section Enhancements (Production-Ready)
  - **Hero Section Visual Improvements**:
    - **Background**: Added blurred tree background with increased blur (12px) and desaturation (85%)
    - **Dark gradient**: Top → middle gradient (black/60 → black/40 → black/30) for better text readability
    - **Reduced top padding**: pt-6/8 → pt-3/4 (50% reduction) to maximize canvas space
    - **SEO & Accessibility**:
      - Added `role="banner"` to hero container for semantic HTML
      - Marked background image as decorative with `role="presentation"` and `aria-hidden="true"`
      - Added descriptive aria-labels to CTA buttons for screen readers
      - Gradient overlays marked with `aria-hidden="true"`
  - **Hero Copy Updates**:
    - **Main heading**: "Design Your Own / Headstones & Memorials" → "Create a Personal Headstone / Design in Real-Time 3D"
    - **Reduced heading size**: text-4xl/5xl/6xl → text-3xl/4xl/5xl (10-17% smaller for more canvas space)
    - **New description**: "Create a beautiful, personalized memorial using our free and simple 3D design tool. See your headstone exactly as it will look - before you commit."
    - **Wider description container**: max-w-xl → max-w-2xl (fits text in 2 lines, not 3)
    - **Paragraph size**: text-lg → text-base (11% smaller)
    - **Bottom margin**: mb-3 → mb-2.5 (tighter spacing)
  - **CTA Button Updates**:
    - **Primary button**: "Start Designing" → "Start Designing (Free)" to emphasize no-cost entry
  - **Trust Block Enhancements**:
    - **Larger stars**: 4×4px → 5×5px (25% bigger)
    - **Tighter star spacing**: gap-1 → gap-0.5
    - **Horizontal layout**: Stars and text on same line for stronger impact
    - **Increased font size**: text-sm → text-base font-medium
    - **Better color**: text-gray-300 → text-white (stronger contrast)
    - **Raised positioning**: Added mt-1 to container
    - **Updated copy**: 
      - "Trusted by 5,000+ families" on same line as stars
      - "No credit card required • Free to try" → "No obligation · No credit card required"
  - **3D Canvas Enhancements**:
    - **Headstone size**: Increased 13-15% (width 2.0→2.5, height 2.2→2.8, thickness 0.3→0.38)
    - **Enhanced lighting**:
      - Ambient: 0.4 → 0.45 intensity
      - Spotlight: 1.2 → 1.4 intensity
      - Point lights: 0.6/0.4 → 0.7/0.5 intensity
      - Rim lights: 0.8 → 1.0 intensity
      - Added back rim light (0.8 intensity, warm color #e8d5b7)
    - **Focused vignette**: 
      - Dark vignette (500px, from-black/60 via-black/30 to-transparent)
      - Warm spotlight (400px, from-amber-900/25)
      - Heavy blur (blur-3xl) for soft edges
    - **Position adjustments**:
      - Y-position: -1.0 → -1.4 (lowered to prevent top clipping)
      - Camera height: 1.5 → 1.3 (adjusted for better framing)
  - **Rotation Controls**:
    - **Smaller buttons**: 12×12 → 10×10 (48px → 40px)
    - **Subtler style**: Semi-transparent white with blur instead of bold golden gradient
    - **Updated styling**: `bg-white/10 backdrop-blur-sm border border-white/20`
    - **Gentle hover**: `hover:bg-white/20 hover:border-white/40`
    - **Label added**: "← Rotate to View →" centered below canvas (text-sm text-gray-400)
    - **Better aria-labels**: "Rotate headstone left/right to view different angles"
  - **Files Modified**:
    - `app/_ui/HomeSplash.tsx`: Hero section copy, trust block, background setup
    - `components/HeroCanvas.tsx`: Headstone size, lighting, positioning
  - **Production Status**: Hero section optimized for conversion with stronger product presence
- **2025-12-23 (Late Afternoon/Evening)**: 3D Scene Environment Enhancements (Production-Ready)
  - **Sky & Atmosphere System**:
    - Implemented vibrant blue sky with custom shader (zenith: `#3b93ff`, horizon: `#dbecf8`)
    - Added procedural volumetric clouds (2 layers with different opacity and drift speeds)
    - Sky remains stationary when rotating headstone/grass (realistic behavior)
    - Fixed blue rectangle issue: changed click-capture plane from vertical to horizontal ground plane
  - **Grass Rendering Improvements**:
    - Optimized grass color to `#355c18` (warmer, richer green to counteract blue sky light)
    - Fixed blue tint issue via multi-step approach:
      - Matched fog color to sky horizon (`#dbecf8`)
      - Added hemisphere light with grass-biased ground color (`#2d4c1e`)
      - Removed all blue tints from fill/rim lights (pure white)
      - Set grass `envMapIntensity={0}` to prevent sky reflections
    - Texture configuration: repeat scale 12, MirroredRepeatWrapping, normal scale (0.5, 0.5)
    - Enabled fog on grass material for natural horizon blending
  - **Lighting System Overhaul**:
    - Ambient light: 0.5 intensity, white
    - Hemisphere light: sky color matches fog, ground color biases green (intensity 0.4)
    - Key spotlight: slightly warm sun (`#fffce6`), intensity 2.5, position [-5, 8, 8]
    - Balanced fill lights: symmetric positions [5,2,5] and [-5,2,5], white, intensity 0.5
    - Rim spotlights: back corners [-5,4,-5] and [5,4,-5], white, intensity 1.2
    - Overhead point light: [0,10,0], white, intensity 0.8 for even grass illumination
  - **Rotation System**:
    - Left/right arrow buttons now rotate both headstone and grass together
    - Sky and clouds remain stationary (realistic - sky doesn't rotate when viewing from different angles)
    - Implemented via wrapping HeadstoneAssembly and GrassFloor in same rotating group
  - **Environment Map**:
    - Using "forest" preset for HDRI reflections on polished granite
    - Attempted to set intensity to 0.4 but `intensity` and `rotation` props not supported in current drei version
    - Scene-level environmentIntensity set via Canvas onCreated callback
  - **Critical Bug Fixes**:
    - Fixed clouds disappearing: removed AtmosphericSky from rotating group
    - Fixed blue rectangle blocking clouds: repositioned click-capture plane to horizontal ground level
    - Fixed grass blue tint at different viewing angles: comprehensive lighting/fog/color solution
  - **Files Modified**:
    - `components/three/Scene.tsx`: Lighting, fog, grass configuration, rotation group
    - `components/three/AtmosphericSky.tsx`: Sky gradient colors, cloud opacity
    - `components/ThreeScene.tsx`: Environment intensity setting in onCreated
  - **Documentation**: advice97-107 analysis and implementation
  - **Production Status**: All visual issues resolved, grass stays green from all angles, clouds visible, smooth rotation
- **2025-12-23 (Afternoon)**: Homepage & Design Tool UI/UX Enhancements (Production-Ready)
  - **Homepage Redesign**:
    - Moved header navigation ("Forever Shining - Design online" with links) from top to footer
    - Reduced hero title "Design Your Own Headstones & Memorials" by 10-15% for better proportion
    - Optimized hero section spacing to bring 3D headstone visualization above fold (top 40% of viewport visible without scrolling)
    - Added radial gradient spotlight behind headstone (warm brown to black) for depth and contrast against dark granite
    - Removed "No credit card required" text initially, then re-added for friction reduction
    - Added gold star rating (★★★★★) next to "Trusted by 5,000+ families" for instant credibility
    - Tightened headline line-height and set description max-width to 600px for better readability
  - **How It Works Section**:
    - Made all step badges uniform gold color (removed confusing "active state" appearance)
    - Removed large ghost background numbers (01, 02, 03, 04) for cleaner visual hierarchy
    - Elevated card contrast with lighter background (#1A1A1A) and subtle gold borders (20-30% opacity)
    - Changed all icons to gold color with filled style for premium appearance
    - Enhanced flow arrows to dashed gold lines for better visual guidance
    - Fixed "Step 2" title wrapping with min-height CSS on all title containers
    - Balanced description text length (all ~3 lines) for visual consistency
    - Upgraded arrow connectors to gold chevron icons
    - Reduced CTA button width by 20-30% for more compact, actionable appearance
  - **Design Features Section**:
    - Increased text contrast (description text from dark grey to #E0E0E0 for accessibility)
    - Strengthened icons with filled style and increased stroke weight
    - Enhanced card separation with subtle borders and hover states (gold border + lift effect)
    - Centered card layout (icon top-center, headline below, description centered)
    - Swapped "Paintbrush" icon for "Layers/Texture" icon on Premium Materials card (better semantic match for stone selection)
    - Increased subheadline font size and margin-bottom for stronger hierarchy
    - Added right arrow (→) to "Try the Designer" button for forward motion indicator
  - **Final CTA Section**:
    - Added radial gradient spotlight (dark charcoal/gold at 5-10% opacity fading to black)
    - Changed button text to "Start Designing Now →" with arrow for urgency
    - Added "Free to use - No signup required to start" text below button for risk reversal
  - **Footer Redesign**:
    - Split into two rows: utility row (logo + links) and legal row (copyright + policies)
    - Row 1: Logo (small) + "Contact Us" on left, "Our Partner Network" links on right
    - Row 2: "© 2025 Forever Shining - Design online" on left, "Privacy Policy | Terms of Service | Contact Us" on right
    - Professional layout matching industry standards for trust and compliance
  - **Select Product Page** (`/select-product`):
    - Introduced distinct card design with dark charcoal background and subtle border
    - Added gold hover border with slight lift shadow for tactile feedback
    - Fixed jagged image heights with enforced fixed height (250px) + `object-fit: cover`
    - Reserved space for "Customize →" link to prevent layout shift on hover
    - Left-aligned text inside cards for better readability and visual hierarchy
    - Left-aligned filter buttons to create strong vertical line with card grid
    - Anchored "Customize →" link to bottom of cards using flexbox `margin-top: auto`
  - **Sidebar Navigation**:
    - Added visual gaps between logical groups (Setup / Design / Finalize) for better scanability
    - Changed active tab icon and text color to Gold (instead of subtle grey background)
    - Improved "breathing room" with 20px margins between groups
  - **Canvas Scene Background**:
    - Implemented "Golden Horizon" radial gradient (warm amber/brown fading to black)
    - Added oval ground shadow underneath headstone base with heavy blur (40-50% opacity, 20px blur)
    - Positioned gradient spotlight at bottom center (ellipse at 50% 90%) for showroom effect
    - Eliminated harsh horizon line with smooth radial fade (no more "floating disc" appearance)
  - **Select Size Page** (`/select-size`):
    - Changed sidebar panel background from cool blue/slate to dark charcoal (#1F1F1F) for warm consistency
    - Upgraded input fields: moved "mm" unit labels inside boxes, lightened backgrounds (#333333), brightened text
    - Hidden number input spinners (up/down arrows) since sliders provide control
    - Modernized radio buttons to button-style segmented control (solid gold selected, dark grey unselected)
    - Standardized "mm" label placement (outside box, right-aligned) across all three sliders
    - Enhanced ground shadow and spotlight gradient for proper object grounding
    - Improved inactive button text contrast (lighter grey #BBBBBB for readability)
  - **3D Canvas Enhancements**:
    - Added radial gradient "infinity floor" (warm bronze/coffee fading to black) to eliminate flat background
    - Positioned ellipse gradient at 50% 80% for low spotlight effect
    - Implemented ground shadow underneath base (flattened black oval with blur) for realism
    - Changed selection box outline to solid blue (from dashed) with current opacity
    - Made Upright/Slant toggle same height as Headstone/Base toggle for visual consistency
    - Temporarily hidden BoxOutline component for cleaner preview
  - **Product Title Overlay** (Canvas pages):
    - Added floating overlay with product name and price at top of canvas
    - Transparent background with proper z-index layering above canvas
    - Wider width to fit product name on single line with reduced vertical padding
    - Horizontal padding preserved for side spacing
  - **Documentation Updates**:
    - Comprehensive documentation of all UI/UX changes in STARTER.md
    - Detailed explanations of design decisions and implementation notes
  - **Files Modified**: Multiple components across app/ and components/ directories
  - **Commits**: Incremental improvements throughout the session
- **2025-12-18 (Evening)**: Catalog XML Integration & UI Polish
  - **Thickness Slider Fix**: Changed from hard-coded 100-300mm to catalog-driven min/max values
    - **Root Cause**: Slider always showed 100-300mm range regardless of product type
    - **Issue Example**: Mini Headstone (catalog-id-22) has thickness configured as 50mm fixed, but UI showed 100-300mm with validation errors
    - **Solution**: Extract from catalog: `minThickness = firstShape?.table?.minDepth ?? 100`
    - **Result**: Mini Headstone now shows 50-50mm range (effectively fixed), Traditional shows 100-300mm
    - Validation now uses catalog values, no more red border errors for valid configurations
    - Commit: `6473bde412`
  - **Mini Headstone Catalog Fix**: Matched XML logic for base dimensions (product ID 22)
    - **Root Cause**: Base dimensions were hard-coded, ignoring XML `<file type="stand">` element
    - Code calculated `baseWidthMm = table.initWidth * 1.4`, never loaded from catalog
    - **Solution**: Load dimensions from XML: `baseWidthMm: shape.stand.initWidth`, `baseHeightMm: shape.stand.initHeight`
    - Updated XML: Stand width 200mm → 280mm (40% wider than headstone)
    - **Result**: Base dimensions now product-specific, no hard-coded assumptions
    - Commit: `1cfc86068f`
  - **Alignment Regression Fix**: Reverted depth prop to fixed 20cm for upright/slant alignment
    - **Regression**: Previous commit (c53f574646) broke Traditional Headstone alignment
    - Changed `depth={isPlaque ? 5 : 20}` to use actual thickness, causing misalignment
    - **Issue**: Upright back at -7.5cm, Base back at -10cm → 2.5cm gap
    - **Solution**: Revert to fixed depth=20cm for alignment reference (not visual thickness)
    - **Result**: All headstone backs align at -10cm with base
    - Commit: `ac9e065d56`
  - **UI Enhancements**:
    - Added 2px gold hover border to Select Shape items (matching Select Product)
    - Fixed hover border using Tailwind `group-hover:` pattern (moved from Image to container div)
    - Removed `overflow-hidden` that was clipping border visibility
    - Improved UX consistency across selection interfaces
    - Commits: `755e0395c8`, `a7ff0cc242`, `510b28edc7`
  - **Select Size UX Improvements**:
    - Moved Upright/Slant radio buttons next to Add Base checkbox (horizontal layout)
    - Removed icons from Upright/Slant buttons for cleaner design
    - Added Base finish radio buttons (No Base / Polished / Rock Pitch) below Headstone/Base tabs
    - Base finish only visible in Base tab, horizontal layout matching Headstone style
    - Changed Base "Thickness" label to "Height" (correct terminology)
    - Added divider line after Base radio buttons matching Headstone tab
    - "No Base" option disables sliders/inputs without switching tabs
    - Commits: Multiple incremental improvements
  - **Debugging**: Added console.log to headstone onClick to diagnose SelectionBox outline issue *(Resolved 2026-02-14)*
    - Issue: Clicking headstone didn't show the select box outline because the transparent deselect plane was intercepting pointer events before the headstone mesh.
    - Resolution: `HeadstoneAssembly` now registers its mesh with `onPointerDownCapture` and stops propagation so `setSelected('headstone')` always fires; the deselect plane ignores clicks when the pointer hits the stone first. Selection outlines now appear immediately on headstone clicks.
    - Commit: `09dbd9c02a`
- **2025-12-17 (Late Evening)**: Navigation Flow Simplification & Route Cleanup
  - **Removed `/with-scene` Routes**: Deleted entire `/app/with-scene/` directory
    - Simplified navigation flow: `/select-product` → `/select-shape` → `/select-size`
    - Canvas now controlled solely by `ConditionalCanvas.tsx` based on pathname
    - Removed duplicate route complexity
  - **Product Selection Flow**: 
    - `/select-product` (no canvas) → select product → `/select-shape` (also no canvas, dedicated grid)
    - `/select-shape` shows the shape gallery in the main content area; `/select-size` and beyond re-enable the canvas
    - When the canvas is visible (size/material/etc.), the sidebar mirrors the Select Shape grid for quick swaps
  - **Thickness Initialization**: Fixed product thickness not being set from XML catalog
    - `setProductId()` now sets both `uprightThickness` and `slantThickness` from `shape.table.initDepth`
    - Each product can have different thickness (e.g., Mini Headstones: 50mm)
    - Before: Always defaulted to 150mm regardless of product
    - After: Respects `init_depth` from `catalog-id-*.xml` files
  - **Canvas Visibility Logic** (ConditionalCanvas.tsx):
    - Hide canvas on: `/`, `/designs`, `/select-product`, `/select-shape`, `/check-price`
    - Show canvas on: `/select-size`, `/inscriptions`, `/select-motifs`, `/select-material`, `/select-additions`
  - **Sidebar Behavior** (DesignerNav.tsx):
    - Shape selector panel renders only when `isCanvasVisible === true` (size/material/etc.), mirroring the main gallery for quick swaps
    - `/select-shape` itself continues to use the standalone gallery without the canvas
    - When canvas is hidden, "Select Shape" simply navigates to the dedicated page
  - **Thumbnail Improvements**:
    - Added hover border (2px) matching selected state for product cards
    - Consistent styling across all selection pages
  - Commits: Navigation cleanup, thickness initialization
- **2025-12-17 (Afternoon)**: Material/Shape Thumbnail Simplification & Texture Loading Fix
  - **UI Simplification**: Removed hover effects, marks, color overlays, and drop shadows from thumbnails
    - Added 2px border to selected materials/shapes using Headstone/Base tab color
    - Fixed inconsistent border radius on all thumbnails
    - Normalized material name heights to prevent layout shifting
    - Added cursor pointer (hand icon) to all interactive elements (thumbnails, sidebar links)
  - **Texture Loading Optimization**: Fixed headstone disappearing during material changes
    - **Root Cause**: SvgHeadstone suspends when `useTexture` loads new texture, causing React to hide component
    - **Solution**: Implemented React 18's `useTransition` for seamless texture swapping
    - Pass `visibleTex` (current texture) to SvgHeadstone while loading `requestedTex` in background
    - `startTransition(() => setVisibleTex(requestedTex))` keeps old texture visible until new one loads
    - Removed manual `PreloadTexture` component (React handles it automatically)
    - Added loading animation for texture transitions using `isPending` state
  - **Component Updates**:
    - Created `MaterialSelector.tsx` and `ShapeSelector.tsx` for sidebar selection
    - Created `MaterialsLoader.tsx` for efficient material data loading
    - Added loading spinner to material thumbnails matching shape selector behavior
    - Fixed BoxOutline visibility after material changes by adding material URL to component key
    - Auto-close inscription panel when shape selector is visible (better UX)
  - **Performance**: Headstone now stays visible throughout material changes with smooth transitions
  - Commits: `88a06c5270`
- **2025-12-14 (Late Evening)**: Build Performance & UI Cleanup
  - **Build Optimization**: Moved large SEO template files (29.6 MB) to `.backup` folder
    - `seo-templates-unified.ts` (24 MB, 577k lines, 4,118 designs)
    - `seo-templates-ml.ts` (5.5 MB, 100k+ lines)
    - Build time reduced from 16-19 minutes to ~53 seconds (95% improvement) ✅
    - Files were auto-generated but never imported/used in application
    - Actual JSON data already exists in `public/ml/*/saved-designs/json/`
    - Commit: `bb7d47ee3b`
  - **UI Fixes**: Removed leftover designer headers from /designs pages
    - Fixed MobileHeader visibility check: `/designs/` → `/designs` (now matches all routes)
    - Fixed DesignsTreeNav product header showing on design gallery pages
    - Added pathname check: `!pathname?.startsWith('/designs')`
    - Cleaned up ConditionalCanvas overlay hiding logic
    - Changed h2 to h1 for proper semantic HTML on /designs landing page
    - Commits: `b5df4cf0dc`, `e9c4387284`, `1100cb66bb`, `69c6d13e82`, `29eb8a1643`
  - **Documentation**: Updated STARTER.md with all recent changes
    - Slant thickness slider documentation
    - Build performance improvements
    - UI cleanup fixes
    - Commit: `817cdd09e7`
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
- **2025-12-21**: Design Gallery SEO & Price Display (Production-Ready)
  - **Price Display Feature**: Automatic price extraction from saved HTML quotes
    - Created `lib/extract-price.ts` utility to parse Total price from HTML table structure
    - Updated `CategoryPageClient.tsx` to fetch and display prices for all designs in category
    - Shows "From $X,XXX.XX" under each design card on category browse pages
    - Falls back gracefully: tries `-desktop.html` first, then `.html`, then shows generic message
    - Regex pattern handles both "Total:" and "Total" labels: `/<td class="total-title">Total:?\s*<\/td><td>\$?([\d,]+\.?\d*)<\/td>/i`
    - Price HTML location: `/ml/{mlDir}/saved-designs/html/{designId}-desktop.html`
  - **Product Page Metadata Enhancement**: Comprehensive SEO optimization for `/designs/[productType]`
    - Refactored from client component to server component pattern for metadata generation
    - Created `ProductPageClient.tsx` for client-side UI logic (loading, filtering, category display)
    - Added product information map with detailed descriptions for all product types:
      - Traditional Engraved Headstone: "Timeless granite memorials with sandblasted inscriptions..."
      - Laser-Etched Black Granite: "Photo-realistic laser engraving on polished black granite..."
      - Bronze Plaque: "Cast bronze memorial plaques...200+ year durability..."
      - Laser-Etched Plaque: "Compact memorial plaques with precision laser etching..."
      - Traditional Plaque: "Classic engraved plaques with sandblasted lettering..."
    - Dynamic metadata generation based on actual design counts and categories
    - Metadata fields: title, description, keywords, OpenGraph, Twitter cards, canonical URLs
    - Language alternates for international SEO (en-GB, en-US, en-AU, x-default)
    - Example: "Traditional Engraved Headstone Designs | Forever Shining" with ~160 char description
    - Keywords include product terms + top 10 categories from actual designs
  - **Three-Level Gallery Hierarchy**:
    - Level 1: `/designs/[productType]` - Product overview with category cards (SEO metadata added)
    - Level 2: `/designs/[productType]/[category]` - Category browse with price display (price feature added)
    - Level 3: `/designs/[productType]/[category]/[slug]` - Individual design viewer (already had full quote)
  - **Architecture Improvements**:
    - Consistent client/server component separation pattern across all gallery levels
    - ISR revalidation: 24 hours (86400 seconds) for static generation with updates
    - Price fetching happens client-side (async) to avoid blocking page render
    - Metadata generated server-side for optimal SEO and initial page load
  - **Documentation**: Created comprehensive guides
    - `PRICE_DISPLAY_FEATURE.md`: Price extraction implementation, testing, performance notes
    - `PRODUCT_PAGE_METADATA.md`: SEO metadata structure, examples, future enhancements
  - **Files Created**:
    - `lib/extract-price.ts`: Reusable price extraction utility
    - `app/designs/[productType]/ProductPageClient.tsx`: Client component for product page UI
    - `app/designs/[productType]/[category]/CategoryPageClient.tsx`: Client component with price display
  - **Files Modified**:
    - `app/designs/[productType]/page.tsx`: Converted to server component with metadata export
    - `app/designs/[productType]/[category]/page.tsx`: Minor updates for consistency
    - `STARTER.md`: Added Design Gallery & SEO section documenting the entire system
  - **Build Performance**: Clean compilation in ~35 seconds, no TypeScript errors
  - **Commit**: `b390325e78` - "feat: Add price display and SEO metadata to design gallery pages"
- **2025-12-22 (Evening)**: SVG-Based Base Rendering (In Progress)
  - **Base Rendering Refactor**: Moved base from separate HTML div to SVG rect element
    - Base now rendered directly inside headstone SVG as `<rect>` element
    - Uses same coordinate system and viewBox as headstone
    - Base texture pattern (`#baseTexture`) created from `texture` field in design JSON
    - Texture mapping matches headstone logic: `forever2/l/17.jpg` → `/textures/forever/l/Glory-Black-1.webp`
    - Position: `baseY = originalHeight` (400) where headstone shape ends
    - Extends viewBox downward: `newVbH = vbH + baseHeightVb`
    - Scaling: `mmToViewBox = originalHeight / headstoneHeightMm` (e.g., 400 / 500 = 0.8)
    - **Challenges**: ViewBox centering creates negative Y offset (e.g., `0 -55 400 510`)
    - Base positioned at original height to avoid white gap below headstone
    - Eliminates HTML/SVG coordinate system conversion complexity
    - Removed 122 lines of old HTML base rendering code
  - **Files Modified**:
    - `app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx`: SVG base implementation
  - **Status**: Base rendering works but requires refinement for consistent positioning across all design types
- **2025-12-22 (Afternoon)**: Design Specs Display & Price Quote Fix (Production-Ready)
  - **Design Specifications Display**: Added dimensions, granite name, and thumbnails to category cards
    - Created `lib/extract-design-specs.ts` utility to extract design specifications from JSON
    - **Dimensions**: Width × Height in mm, rounded up with `Math.ceil()` (e.g., 609.6mm → 610mm)
    - **Granite Name**: Mapped from texture ID using GRANITE_MAP (e.g., "18" → "Glory Gold Spots")
    - **Thumbnail**: 64px height image with year/month directory structure
      - Primary path: `/ml/{mlDir}/saved-designs/screenshots/{year}/{month}/{designId}_small.jpg`
      - Fallback path: `/ml/{mlDir}/saved-designs/screenshots/{designId}_small.jpg`
      - Auto-fallback via `onError` handler if year/month path doesn't exist
    - Display format: `{width}mm × {height}mm • {graniteName}` with thumbnail
    - Updated `CategoryPageClient.tsx` to fetch and display specs for all designs
  - **Price Quote ML Directory Fix**: Fixed missing Price Quote sections on design pages
    - **Root Cause**: Component hardcoded to `/ml/headstonesdesigner/` but designs use multiple directories
    - **Solution**: Pass `mlDir` from design metadata to `DetailedPriceQuote` component
    - Now supports all ML directories: `forevershining`, `headstonesdesigner`, `bronze-plaque`
    - Updated fetch paths to use dynamic `mlDir` instead of hardcoded directory
    - Price quotes now display for designs in any ML directory
  - **Design Description Simplification**: Changed multi-sentence descriptions to single sentences
    - 5 variations for variety while being concise and readable
    - Example: "A classic Curved Gable traditional engraved headstone ideal for biblical memorial inscriptions..."
  - **Headstone Render Spacing**: Added bottom margin to prevent touching next section
    - Mobile: `mb-8` (32px)
    - Desktop: `mb-12` (48px)
    - Prevents headstone render from touching "About This Design" section below
  - **Files Created**:
    - `lib/extract-design-specs.ts`: Design specifications extraction utility
  - **Files Modified**:
    - `app/designs/[productType]/[category]/CategoryPageClient.tsx`: Added specs display with thumbnail
    - `app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx`: Fixed mlDir usage for price quotes
    - `STARTER.md`: Updated with latest documentation
  - **Commit**: `934c876fe2` - "Add design specs display and fix price quote loading"
- **2025-12-22 (Evening)**: SVG-Based Base Rendering Implementation
  - **Architecture Change**: Moved base from HTML `<div>` to SVG `<rect>` element
    - Base now part of headstone SVG, not separate positioned div
    - Shares same coordinate system (viewBox units) as headstone
    - Eliminates complex pixel-to-mm conversion and positioning calculations
  - **Texture Mapping**: Base granite texture from design JSON
    - Extracts texture path from base item: `baseItem.texture` (e.g., `"src/granites/forever2/l/17.jpg"`)
    - Applies same mapping logic as headstone: numbered textures (`17.jpg` → `Glory-Black-1.webp`)
    - Creates SVG `<pattern id="baseTexture">` with texture image
    - Falls back to granite name extraction for named textures
  - **Coordinate System**: Uses original viewBox dimensions for scaling
    - Scale factor: `mmToViewBox = originalHeight / headstoneHeightMm` (e.g., 400 / 500 = 0.8)
    - Base dimensions: `baseWidthVb = baseWidthMm * mmToViewBox`, `baseHeightVb = baseHeightMm * mmToViewBox`
    - Position: `baseX = (vbW - baseWidthVb) / 2` (centered), `baseY = originalHeight` (at shape bottom)
  - **ViewBox Extension**: Extends SVG viewBox to make room for base
    - Reads current/adjusted viewBox (may have negative Y from centering: `0 -55 400 510`)
    - Extends height: `newVbH = vbH + baseHeightVb`
    - Base positioned at `originalHeight` (where headstone shape ends), not at adjusted bottom
    - Prevents base from appearing in white space gap or overlapping headstone
  - **Code Cleanup**: Removed old HTML-based base rendering
    - Deleted 122 lines of positioning/scaling calculations
    - Removed topProfile-based bottom detection
    - Removed pixel-per-mm conversion logic
    - Simplified from dual coordinate systems to single SVG system
  - **Current Status**: Base renders correctly on most designs
    - Works: Designs with standard viewBox centering
    - Issue: Some designs show gap between headstone and base due to viewBox variations
    - Next: Fine-tune base Y position calculation for edge cases
  - **Commits**: Multiple iterative improvements throughout evening session
- **2025-12-19 (Afternoon)**: Plaque Product Type Support - Complete UI & Rendering (Production-Ready)
  - **Plaque Shape Filtering**: Added dynamic shape filtering based on product type
    - Plaques show ONLY plaque shapes (landscape, portrait, oval horizontal, oval portrait, circle)
    - Headstones show ONLY headstone shapes (excludes plaque shapes)
    - Filter logic: checks `catalog?.product.type === 'plaque'` and includes/excludes accordingly
  - **Plaque SVG Path Fix**: Fixed shape loading for oval and circle plaques
    - Oval & Circle shapes load from `/shapes/masks/` directory
    - Rectangle shapes (landscape/portrait) load from `/shapes/headstones/` directory
    - Updated both selection grid thumbnails and actual shape loading paths
  - **Bronze Plaque XML Shapes**: Added missing oval and circle shapes to catalog-id-5.xml
    - Oval (Landscape): 400×275mm (init), range 100-560mm width, 60-400mm height
    - Oval (Portrait): 275×400mm (init), range 100-560mm width, 60-400mm height  
    - Circle: 400×400mm (init), range 100-560mm width/height
    - All shapes: 10mm fixed depth, Bronze material texture
  - **Plaque UI Customization**: Simplified Select Size panel for plaques
    - Hidden: Headstone/Base toggle, Thickness slider, Base finish options
    - Added: "Plaque" label (centered, gold background) instead of toggle
    - Kept: Width and Height sliders only (relevant controls)
  - **Plaque Style Labels**: Changed radio button labels for plaque context
    - "Upright" → "No Border" (plain plaque without decorative border)
    - "Slant" → "Border" (plaque with decorative border)
    - Backend value (`headstoneStyle`) unchanged for compatibility
  - **Inscription Outline Control**: Disabled black outlines for plaques
    - Traditional Engraved: No outline (sandblasted shadow effect)
    - Laser Etched Headstones: Black outline (0.002 * units)
    - All Plaques: No outline (clean bronze appearance)
    - Check: `isTraditionalEngraved || isPlaque ? 0 : 0.002 * units`
  - Files modified: `ShapeSelectionGrid.tsx`, `catalog-id-5.xml`, `DesignerNav.tsx`, `HeadstoneInscription.tsx`
  - Commit: TBD
- **2025-12-19 (Morning)**: Base & Headstone Alignment + Thickness Control Fixes (Production-Ready)
  - **Price Calculation Fix - Base Quantity**: Fixed base pricing to use catalog quantity type
    - Base price model uses `quantity_type="Width"` from XML
    - Changed calculation from `baseWidthMm * baseHeightMm` (area) to `baseWidthMm + baseThickness` (width + depth)
    - Formula: `model="294.00+0.34($q-300)"` where `$q = baseWidthMm + baseThickness`
    - Price now updates when base thickness slider changes
    - Updated in: DesignerNav.tsx, ThreeScene.tsx, MobileHeader.tsx, DesignsTreeNav.tsx
  - **Base Thickness Initialization**: Fixed default values and clamping
    - Changed default from 100mm to 250mm (matches catalog init_depth)
    - Removed hardcoded clamping (100-300mm) from setter
    - UI now respects catalog min/max values (e.g., 130-400mm for catalog-id-4)
    - Validation errors fixed (red border no longer shows on init)
  - **Upright Headstone Thickness Control**: Enabled visual thickness updates
    - Changed `depth` prop from fixed `20cm` to dynamic `uprightThickness / 10`
    - Thickness slider now updates visual depth on canvas in real-time
    - Units: mm in store → cm for SvgHeadstone (divide by 10)
    - ExtrudeGeometry depth directly uses this value for 3D extrusion
  - **Base Thickness Control**: Enabled visual thickness updates  
    - Changed from hardcoded `0.2 * BASE_DEPTH_MULTIPLIER` (300mm) to `baseThickness / 1000`
    - Thickness slider now updates visual depth on canvas in real-time
    - Units: mm in store → meters for RoundedBoxGeometry (divide by 1000)
    - Updated both `baseAPI` calculation and `useFrame` positioning
  - **Back Edge Alignment - Universal**: All back edges always aligned
    - **Strategy**: Use `uprightThickness` as universal alignment reference for all components
    - **Upright back**: `-uprightThickness/2` (varies with slider)
    - **Slant back**: `-uprightThickness/2` (aligned to upright reference, not slant thickness)
    - **Base back**: `-uprightThickness/2` (aligned to upright reference, not base thickness)
    - Formula: `baseZCenter = -(uprightThickness/1000/2) + baseD/2`
    - Alignment preserved when changing: upright thickness, slant thickness, base thickness, or switching styles
  - **Thickness Slider Input Validation**: Fixed hardcoded min/max values
    - Changed from `min={100} max={300}` to `min={minThickness} max={maxThickness}`
    - Now uses catalog-based values (e.g., Mini Headstone: 50-50mm, Traditional: 80-100mm)
    - Eliminates conflicts between slider and number input
  - Files modified: `headstone-store.ts`, `ShapeSwapper.tsx`, `HeadstoneBaseAuto.tsx`, `DesignerNav.tsx`, price display components
  - Commits: Various throughout the day
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
- Check `STARTER.md` for comprehensive documentation
- Check `CHECK_PRICE_REDESIGN.md` for Check Price feature details (if exists)
- Check `TEXTURE_IMPROVEMENTS_SUMMARY.md` for material/texture optimization details
- Review existing documentation in the root directory
- See audit files for detailed texture improvement analysis

---

## Recent Updates (2026)

- **2026-02-04 (Afternoon)**: Statue/Vase Positioning on Base - Attempted Fixes (IN PROGRESS)
  - **Goal**: Position statues centered in the left pad of the base (X ✅, Y ✅, Z ❌)
  - **X Position - FIXED**: Statues now correctly centered in left pad area
    - Converts headstone left edge to base-local coordinates
    - Calculates midpoint: `(baseLeft + headstoneLeftInBase) / 2`
    - Works correctly after coordinate space transformation fix
  - **Y Position - WORKING**: Statues correctly positioned on top surface of base
    - Uses `targetBBox.max.y` from base bounding box
  - **Z Position - BROKEN**: Statues still appear at front edge instead of centered in depth
    - **Attempted Fix 1**: Calculate `targetZ = (baseBBox.min.z + baseBBox.max.z) / 2`, convert to headstone space
    - **Attempted Fix 2**: Use `baseMesh.localToWorld()` → `stone.worldToLocal()` for Z coordinate
    - **Attempted Fix 3**: Get base world position via `baseMesh.getWorldPosition()`, convert to stone parent space
    - **Result**: All attempts still position statue at front edge of base
  - **Rotation Axis - FIXED**: Changed from Z-axis to Y-axis
    - Changed `rotation={[0, 0, rotationZ]}` → `rotation={[0, rotationZ, 0]}`
    - Statues now spin vertically (left/right) instead of tipping (forward/back)
  - **Store Updates**: Added `zPos?: number` to `additionOffsets` type
  - **Files Modified**: 
    - `components/three/AdditionModel.tsx` (lines 230-350, 675-710, 750)
    - `lib/headstone-store.ts` (line 208)
  - **Status**: X and Y positioning working, Z positioning and rotation axis fixed but Z still incorrect

- **2026-02-02 (Evening)**: Check Price Interactive Details (Production-Ready)
  - **Clickable Item Counts**: Made inscription/motif/addition counts clickable
    - Counts with 1+ items: Clickable white underlined text (hover → gold)
    - Counts with 0 items: Plain white text (not clickable)
    - Opens detail modal showing all items in a table
  - **Detail Modals**: Three modal types for different content
    - **Inscriptions**: Text, font, character count (Qty), size (mm), color swatch + name, price
    - **Motifs**: Thumbnail image (48×48px) + name, size (mm), color display, price
      - Entire row links to SVG file (opens in new tab)
      - Image border changes to gold on hover
    - **Additions**: Name + ID, type, price
  - **Modal Styling**: Dark gradient theme matching Check Price page
    - Gold accent headers (#cfac6c)
    - Sticky table headers for scrolling
    - Hover effects on rows
    - Close button in header and footer
  - **Files Modified**: `app/check-price/_ui/CheckPriceGrid.tsx`
  - **Implementation**: Used `useState` for modal state, `useMemo` for item processing

- **2026-01-31 (Afternoon)**: Homepage Visual Refinements & Motif System (Production-Ready)

---

## Database Seeding Reference (March–April 2026)

### Quick Reference

| Command | What it does | Count | Status |
|---------|-------------|-------|--------|
| 
pm run db:seed-materials | Seeds granite materials | 29 | ✅ Complete |
| 
pm run db:seed-shapes | Seeds headstone shapes | 55 | ✅ Complete |
| 
pm run db:seed-additions | Seeds additions (vases, statues) | 82 | ✅ Complete |
| 
pm run db:seed-sizes | Seeds fixed sizes (product 32) | 9 | ✅ Complete |
| 
pm run db:seed-backgrounds | Seeds backgrounds + color textures | 77 | ✅ Complete |

### Materials (29 total)
- **Source**: pp/_internal/_data.ts
- **Path**: /textures/forever/l/*.webp
- **Script**: scripts/seed-materials.ts
- **Docs**: MATERIALS_DATABASE_FIX.md
- **Categories**: All granite, polished finish
- **Examples**: African Black, Blue Pearl, Imperial Red, Noble Black, Paradiso

### Shapes (55 total)
- **Source**: pp/_internal/_data.ts
- **Path**: /shapes/headstones/*.svg
- **Script**: scripts/seed-shapes.ts
- **Docs**: SHAPES_DATABASE_FIX.md
- **Traditional (11)**: Cropped Peak, Curved Gable, Curved Peak, Curved Top, Half Round, Gable, Left Wave, Peak, Right Wave, Serpentine, Square
- **Modern (44)**: Headstone 1-39, Guitar 1-5

### Additions (82 total)
- **Source**: public/xml/en_EN/motifs-biondan.xml
- **Path**: /models/*.glb, /images/*.webp
- **Script**: scripts/seed-additions.ts
- **Docs**: ADDITIONS_MIGRATION_COMPLETE.md
- **Categories**: 
  - Biondan Bronze (24)
  - Crosses (13)
  - Roses (24)
  - Statues (11)
  - Vases (10)
- **Size Variants**: 60 single-size (73%), 22 multi-size (27%)

### Sizes (9 total)
- **Source**: public/xml/au_EN/sizes.xml (product 201)
- **Product**: Full Color Plaque (product 32)
- **Script**: scripts/seed-sizes.ts
- **Fields**: productType, widthMm, heightMm, priceCents, sortOrder
- **API**: GET /api/catalog/sizes/?productType=full-colour-plaque

### Backgrounds (77 total)
- **Source**: public/xml/au_EN/backgrounds.xml + filesystem discovery
- **Script**: scripts/seed-backgrounds.ts
- **Categories**:
  - Background (40 active, 2 inactive): /jpg/backgrounds/forever/l/{1-40}.jpg
  - Color (35): /jpg/backgrounds/colors/l/{01-35}.jpg (zero-padded filenames)
- **Thumbnails**: /jpg/backgrounds/forever/m/ (backgrounds), /jpg/backgrounds/colors/s/ (colors)
- **API**: GET /api/catalog/backgrounds/ (returns category field)

### Database Commands

```bash
# Development
npm run db:push              # Push schema to database
npm run db:studio            # Open Drizzle Studio (GUI)

# Seeding (re-run as needed)
npm run db:seed-materials    # Replace all materials
npm run db:seed-shapes       # Replace all shapes  
npm run db:seed-additions    # Replace all additions
npm run db:seed-sizes        # Replace all sizes
npm run db:seed-backgrounds  # Replace all backgrounds + colors

# Production deployment
npm run db:migrate           # Run migrations on production
npm run db:sync              # Sync local DB to remote (home.pl)
```

### Environment Setup

```bash
# .env.local
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/headstonesdesigner
```

**Note**: All seeding scripts use dotenv to read .env.local automatically.

---

## Current Status (2026-06-28) — Select Product UI Refinements

### Select Product Page

- **Route**: `/select-product`
- **Primary file**: `app/select-product/_ui/ProductSelectionGrid.tsx`
- **Current layout**:
  - Desktop/wide viewport uses a 5-column product grid (`xl:grid-cols-5`).
  - Product cards keep compact spacing so the primary CTA is visible in the first viewport at ~1574×907.
  - Product thumbnails use `object-contain` to show the full source image instead of cropping important memorial details.
  - Thumbnail frame is square (`aspect-square`) with an even image inset (`p-2`) so empty space appears balanced around full-image thumbnails.
  - Product cards show title, short 2-line description, starting price, max-size price, and a visible `Select product` CTA.
  - Selected product state shows a stronger CTA style and selected badge.
- **Design tradeoff**:
  - `object-contain` preserves full product visibility but can reveal empty space when image aspect ratios differ.
  - The current square thumbnail frame with inset was chosen to make that spacing intentional and consistent rather than left/right-only.

### Designer Sidebar Progress

- **Primary file**: `components/DesignerNav.tsx`
- Workflow groups now show clearer progress labels:
  - `Current`
  - `Complete`
  - `Upcoming`
- The active workflow roman numeral badge keeps white text instead of switching to black.
- Sidebar width was intentionally left unchanged.

### Verification

Commands run successfully after the UI changes:

```bash
pnpm exec tsc --noEmit
pnpm lint
```

Screenshots captured during refinement:

- `C:\tmp\select-product-compact.png`
- `C:\tmp\select-product-contain.png`
- `C:\tmp\select-product-5col.png`
- `C:\tmp\select-product-square-thumbs.png`

---



---

*End of STARTER.md - Last updated: 2026-06-28*
