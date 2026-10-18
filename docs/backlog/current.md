# Current product backlog

This is the active backlog. Historical status notes remain in `STARTER.md`,
but unfinished items there are not automatically current requirements.

Last reviewed: 2026-10-17

## Now — Vercel build recovery

- [x] Exclude `public/gallery/**/*` from serverless output tracing while retaining static photo URLs. `build2.txt` rejected `api/orders/[id]/export-svg` at 256.71 MB against the reported 250 MB limit; its local trace included 698 gallery files (~141 MiB).
- [x] Enable `experimental.webpackBuildWorker` and `experimental.webpackMemoryOptimizations` after `build3.txt` reported OOM during TypeScript checking on the 8-GB build machine. The custom Webpack hook otherwise disables the default worker. Keep type checks and filesystem caching enabled; do not restore the old hard cap of 2 on module parallelism by default.
- [ ] Run the next Vercel build and verify both fixes: no OOM during type checking and export-SVG packaging below 250 MB, followed by successful deployment. `build3.txt` never reached packaging, so the gallery exclusion is not yet remotely confirmed. Local uncached TypeScript validation passed (~1.1 GB compiler memory); both memory flags are present in the final MDX/Sentry-wrapped production config. No full build/deployment was run after enabling them.
- [ ] After deployment, smoke-test `/memorials/gallery`, a category deep link, desktop/mobile Gallery menu links, and Select Shape previews/photo links. Check that static photos load and the export-SVG endpoint still works for an authorized admin order.

## Completed locally — memorial photo gallery and shape discovery

- [x] Add `/memorials/gallery` and keep the homepage gallery section. Import all 349 Australian gallery photos into 698 local WebP files across nine categories, retaining source provenance in `app/_internal/home-gallery.json` and a refresh script at `scripts/import-memorial-gallery.mjs`.
- [x] Point desktop/mobile Gallery menus to the dedicated page, including shared category-page navigation in `components/MemorialPublicHeader.tsx`; add canonical/Open Graph metadata and sitemap coverage.
- [x] Support category filtering, load-more batches, full-size viewing, arrow keys, Escape, scroll locking and focus restoration. Validate category deep links on the server and fall back to all photos for unknown categories.
- [x] Add 64/80-px product thumbnails to Select Shape headers with four-photo hover/focus previews. The product and preview photos link to the mapped category (`monuments` maps to `full-monuments`); filtering is by category, not exact product/material. Preserve gallery examples 001–004 used by previews when refreshing imported assets.
- [x] Validate five product-category mappings, four preview links per category, mobile tap, desktop/mobile navigation and keyboard behavior with targeted Chromium checks; ESLint, formatting and type checks passed. Initial gallery screenshots: `docs/audits/2026-10-17-gallery/`. Production verification remains in the build-recovery checklist above.

The memorial photo gallery is separate from `/designs/*`; this work does not change the preview approval status or completion of the staged design-discovery plan below.

## Now — UI foundation

- [x] Introduce semantic designer day/night colour tokens.
- [x] Add shared selected/idle designer tab and option controls.
- [x] Cover the mobile Select Size panel with day/night contrast checks.
- [x] Add an unauthenticated designer UI smoke job to CI.
- [x] Pin Node 22 and pnpm 9.6.0 across local metadata and CI.
- [x] Migrate recurring compact designer controls to shared primitives.
- [x] Add visual coverage for Inscriptions, Images, Check Price, and Checkout.
- [x] Add automated accessibility checks for the guided designer flow.

## Next — conversion path

- [x] Calculate uploaded-image pricing from trusted server rules.
- [x] Continue checkout inline when an account already exists.
- [x] Replace generic navigation labels with contextual step names.
- [x] Preserve an automatic local draft and warn before losing changes.
- [x] Clarify estimated versus confirmed pricing throughout checkout.

## Now — architecture and performance

- [x] Split `DesignerNav.tsx` by panel and domain responsibility. The parent now composes navigation hooks and views; route state, panel synchronization, save/purchase workflow, product capabilities, canvas visibility, quick navigation, menu actions, grouped menu rendering, base selectors, workflow modals, and fullscreen/mobile navigation are separated into focused hooks and components. Product-dependent visibility and labels plus guided-navigation and expandable-menu rules live in navigation configuration. The menu retains its natural composition responsibilities, including placing the inline Select Size panel within its section.
- [x] Split the Zustand store into product, content, scene, UI, and pricing domains. Pricing, general UI, catalog-option, monument-configuration, product-appearance, project metadata, async product-selection, image-editing, inscription, motif, emblem, scene, addition, and reset slices are extracted. Color and catalog normalization, product configuration and dimension derivation, material-option loading, and editing-object visibility fallback are shared helpers. Product selection remains the async orchestration boundary; root composition stays in the root store.
- [x] Centralize Check Price calculations for the quote panel, saved-design estimates, server-confirmed checkout quotes, and email/PDF breakdown formatting.
- [x] Keep estimate/confirmed authority visible throughout presentation flows. Shared quote display, saved-design pages, PDFs, and saved-design emails explicitly label estimates; order invoice emails and confirmed quote formatting identify server-confirmed order pricing. The Check Price page summary, navigation headers, 3D product-price label, and motif/inscription editor previews use shared Check Price calculations; the additions selector is selection-only and shows no price.
- [x] Move generated saved-design records out of the TypeScript source into JSON; keep TypeScript types and query helpers in the module.
- [x] Separate static homepage sections from interactive client islands. The page is a server composition; product catalog, process overview, FAQ, support CTA, and footer are server components, while the hero menu, review carousel, and tutorial chapter controls are isolated client components.

## Planned — design discovery and personalization

The staged implementation plan is in [designs-improvement-plan.md](designs-improvement-plan.md), dated 2026-10-16. It covers `/designs`, product collections, category galleries, individual design pages, preview assets, SEO, and loading the chosen template into the 3D Designer. Stages 1–2 are complete for inventory, data contracts and publication decisions. Source repairs and visual/content approvals remain scheduled for stages 3, 5 and 6. Personalization is held for 148 records, including 64 published gallery designs; URLs remain available. See [stage 2 report](../audits/2026-10-16-designs/stage-2.md). Stage 3 is in progress; stages 4–8 remain pending. The [baseline report](../audits/2026-10-16-designs/README.md) covers all 3114 records, the new GSC export through 14 October, eight live page observations and three editor-entry checks. The 36-project pilot remains provisional. The full candidate review found 20 compositions requiring repair, four requiring closer review, ten needing detail/legibility review and two blocked dimension mismatches; editor parity remains unresolved.

- [x] Stage 1: Inventory the catalog and establish current visual and search baselines. Conversion-funnel, Google Images, and indexing-report data gaps are documented explicitly.
- [x] Stage 2: Full-route identity, source/presentation contract, publication policy and explicit per-record review decisions. Holds are enforced by detail CTAs and the shared loader; all 36 pilot sources remain available. [Progress](../audits/2026-10-16-designs/stage-2.md).
- [ ] Stage 3 (in progress): Preview standard and candidate pipeline implemented. All 36 pilot records processed: 34 projects rendered (204 variants), two blocked by dimension mismatches. Fixed base readiness for five projects. Overview review: 20 composition repairs, four composition reviews, eight detail reviews, two legibility reviews. One byte-budget overrun, one edge error and one project with fetch errors remain. No publication approval. [Report](../audits/2026-10-16-designs/stage-3-full-pilot.md).
- [ ] Stage 4: Improve gallery layouts, cards, navigation, filtering, and crawlable pagination.
- [ ] Stage 5: Build a unified design detail page and reliable, draft-safe personalization flow.
- [ ] Stage 6: Complete useful content, internal linking, metadata, indexing rules, and truthful structured data.
- [ ] Stage 7: Validate performance, accessibility, SEO, and design-to-editor behavior.
- [ ] Stage 8: Deploy the pilot, monitor outcomes, and roll out approved assets and content across the published catalog.

## Operational follow-ups

- [x] Implement and deploy Content Security Policy in Report-Only mode first. Production headers now include the policy and Reporting API endpoint; review violation reports in production logs before narrowing or enforcing the policy.
- [x] Report browser WebGL availability and context loss/restoration to bounded runtime logs through `/api/client-webgl-report`; telemetry contains only an allowlisted event name and no page URL or customer data.
- [ ] Complete legal review of Terms & Conditions. Pre-review questions and official Australian-law references are in [terms-review-prep.md](../legal/terms-review-prep.md); legal counsel review and approval remain outstanding.
- [ ] Consolidate customer-facing email domains after mailbox verification. [The inventory](../operations/email-domain-inventory.md) now includes a public DNS spot-check; ownership, SMTP authorization, DKIM setup, and inbox receipt still need confirmation from the business/mail administrators.
- [x] Select Sentry and configure application error capture, tracing, checkout/WebGL reporting, and high-priority issue notifications. The local end-to-end event was confirmed and the temporary verification issue was resolved. `next.config.ts` uses a full Git SHA release name and records Vercel production deploy metadata. Release `c7cc87a72bdf6338db9bad7ee285871b996cb539` has a production deploy and ten associated commits; Vercel logs confirm Node.js, Edge, and Client source map uploads. Production-event symbolication and event privacy still need verification. Enable IP-address storage prevention in Sentry and keep the source-map auth token in Vercel.
