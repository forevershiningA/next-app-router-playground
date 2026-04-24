Status (2026-04-21) — Production Email Delivery Fix + .vercelignore Trim + Inline Screenshot CID

Production email delivery was fixed and the repository trimmed with a .vercelignore to reduce serverless bundle size. Inline screenshot CIDs were enabled to streamline image referencing in emails.

---

Status (2026-04-22) — Multiple Line Inscriptions

Support for multi-line inscriptions was implemented, allowing text to wrap and render correctly on monuments. This improves inscription layout flexibility and user input handling.

---

Status (2026-04-20, Part 2) — Screenshot Fix, Login→Save Flow, SMTP Guard

A screenshot generation bug was resolved and the login→save design flow was hardened to avoid data loss. An SMTP guard was added to protect email sending from misconfiguration.

---

Status (2026-04-20) — Email System, Grab Cursor, No-Base Fix, Price Popup Fix, Menu Drawer Memory

The email system received reliability upgrades while UI polish included a grab-cursor for drag interactions and a fix for designs without a base. The price popup and menu drawer now remember state to improve UX continuity.

---

Status (2026-04-15) — Nav Redesign, Accordion Menu, Gilding Filter, Product 32 Image, Image Update Feature

Navigation was redesigned with an accordion menu for better organization and a new gilding filter added to material selectors. Product 32 image handling and an image update feature were implemented for clearer previews.

---

Status (2026-04-14) — Product 32 Data Migration to DB/XML, Background/Color Toggle, Upload Image, No Background

Product 32 configuration was migrated from hardcoded data into the database/XML catalog to centralize product data. UI features added include background/color toggles and improved image upload handling (including no-background support).

---

Status (2026-04-13) — 3D Screenshots Replace 2D Previews, Design Page CTA, Loading Overlay, Build Optimization

3D-rendered screenshots replaced legacy 2D previews for more accurate product imagery; a CTA was added to design pages and a loading overlay improves perceived responsiveness. Build optimizations reduced bundle size and build time.

---

Status (2026-04-12) — Menu Navigation Fixes, /design-menu Route, Additions Panel Fixes

Menu navigation bugs were fixed and a dedicated /design-menu route added for quicker access to design options. The additions panel (statues, vases) received stability and UI fixes.

---

Status (2026-04-11) — Volume-Based Pricing, PNG Thumbnails, Load Design & Nav Fixes

Volume-based pricing logic was introduced, and PNG thumbnails were standardized for gallery displays. Additional fixes addressed design loading and navigation edge cases.

---

Status (2026-04-11) — Batch Screenshot Generation Complete & Thumbnail Fix

Batch 3D screenshot generation completed successfully and a related thumbnail bug was resolved to ensure accurate previews. The pipeline now produces transparent, auto-cropped PNGs and JPEG thumbnails.

---

Status (2026-04-10) — Batch Screenshot Generation Progress & Script Hardening

Progress made on the batch screenshot generator with robustness improvements to the scripting (retries, chunking, and error handling). These hardenings reduced failures during large runs.

---

Status (2026-04-09) — Popup Restyling, Mass Design Conversion & Screenshot Generation

Popups were restyled for consistency and accessibility while a mass conversion of legacy designs was performed to canonical format. This conversion enabled large-scale screenshot generation for the updated gallery.

---

Status (2026-04-08) — Base Inscription/Motif Rendering, Border Sizing, Anonymization Fix, Load Design Filtering, VitePress Docs

Rendering for base inscriptions and motifs was improved and border sizing logic corrected for accurate visual layout. Anonymization for private designs, load-design filtering, and VitePress documentation updates were added.

---

Status (2026-04-06) — 3D Screenshot Thumbnails, Design Dedup Siblings, Transparent PNGs, Image Placeholder Fix

Thumbnail generation for 3D screenshots was finalized and a deduplication pass for sibling designs was introduced. Transparent PNG outputs and a fix for the image placeholder asset improved gallery quality.

---

Status (2026-04-04) — Load Design Category-First Redesign, Pets Cleanup, Batch 3D Screenshot Generator

The load-design UI was redesigned to prioritize categories, pet-related designs were cleaned up, and the batch 3D screenshot generator was added to automate preview production. These changes improved discoverability and asset hygiene.

---

Status (2026-04-03) — P3D Motif/Inscription Positioning, Bronze Plaque Fixes, Load Design Popup & Pet Categories

Positioning logic for P3D-imported motifs and inscriptions was corrected, bronze plaque rendering received fixes, and the load-design popup plus pet category filters were refined. Overall import fidelity and UX improved.

---

Status (2026-04-01) — P3D Converter, Inset Borders, Camera Fixes

A P3D-to-canonical converter was implemented to support legacy Haxe/P3D projects; inset border rendering and camera positioning bugs were fixed. This stabilizes imports and scene framing for converted designs.

---

Status (2026-03-31) — Bronze Plaque Emblems & Fixes

Bronze plaque emblems were implemented along with related rendering and data fixes specific to plaque workflows. The update addressed emblem placement and texture handling.

---

Status (2026-03-30) — Pricing & ML Smart Search

Pricing computation improvements and an ML-backed smart search were added to help customers find relevant designs or materials faster. These changes improved accuracy and search relevance.

---

Status (2026-03-30) — Pricing & ML Smart Search

(Repeated entry) Continued work on pricing logic and machine-learning search features, refining models and integration points for better results.

---

Status (2026-03-30) — Legacy Design Loading

Legacy design loading and migration paths were strengthened to ensure older saved designs render correctly in the new system. This includes compatibility fixes and conversion fallbacks.

---

Status (2026-03-31) — Bronze Plaque Emblems & Fixes

Bronze plaques gained emblem support with 236 emblem PNGs, size/rotation/flip controls, and improved plaque-specific rendering and camera framing.

---

Status (2026-03-30) — Pricing & ML Smart Search

Pricing algorithms were unified against XML catalogs and DPR-aware position math was fixed; ML-backed smart search was added to help users find relevant designs.

---

Status (2026-03-16) — Full Monument Camera & UX Refinements

Full-monument camera behaviors and selection UX were improved to preserve orbit, focus headstones upright, and refine statue/vase grounding; various monument-part material and zoom fixes landed.

---

Status (2026-03-17) — Full Monument Zoom + Inscription Polishing

Camera focus and monument-part selection were hardened; inscription duplication, ledger statue sizing, and selection outlines were refined for more reliable editing.

---

Status (2026-03-13) — Additions & Ledger Improvements

Addition size-variant UI was restored, ledger statue sizing and fallback metadata were fixed, and React 19 ledger hydration issues were addressed for stable mounts.

---

Status (2026-03-12) — Canonical Loader Rollback & Bronze Border Normalization

A temporary rollback stabilized the canonical loader while Bronze border scaling and selection outline rotation issues were tuned for consistent rendering.

---

Status (2026-03-11) — Addition Duplication & Statue Grounding

Addition duplication metadata and statue/vase grounding fixes ensured clones retain placement and statues rest correctly on base pads across saves and duplicates.

---

Status (2026-03-10) — Addition Placement Units & Base Anchors

Addition placement math was corrected to use millimetre units and base-aligned anchors, fixing long-standing snap and offset issues for statues and vases.

---

Status (2026-02-21) — 3D Ceramic/Enamel Image Feature

Ceramic and enamel photo rendering was implemented with extruded SVG masks, glossy ceramic materials, and correct z-ordering so masked photos render cleanly on headstones.

---

Status (2026-02-20) — Add Your Image: Crop & Placement

Interactive image upload and crop pipeline landed, with mask shapes, aspect-handling, and preliminary 3D placement; crop handlers and drag behavior still being stabilized.

---

Status (2026-02-18) — Initial Add-Your-Image Implementation

Image types and upload UI were introduced (Granite, Ceramic, Vitreous, Premium, YAG), plus crop canvas and mask gallery to prepare images for 3D placement.

---

Status (2026-02-13) — Canonical Loader Auto-Centering & Selection OBB Fixes

Loader auto-centering heuristics and rotated selection OBB calculations were improved to avoid motif floating and to preserve layout fidelity for legacy sources.

---

Status (2026-02-12) — Bronze Border Normalization & Loader Stability

Bronze border scaling lerps and a canonical loader rollback stabilized visual regression while preserving consistent border appearance across plaque sizes.

---

Status (2026-02-11) — Addition Duplication Reliability

Additions now persist per-instance metadata (file, footprint, zPos) so duplicated models keep correct files and placement; a canonical loader safety net fixed a ReferenceError regression.

---

Status (2026-02-10) — Addition Placement Units & Anchors

Addition placement converted to true millimetre units with base-aligned anchors, preventing statues/vases from snapping incorrectly and ensuring consistent duplication behavior.

---

Status (2026-02-08) — Cinematic Selection Outlines & Depth Masking

Selection outlines and depth masking were enhanced with reveal animations and bottom-lift props so selection frames render cleanly above geometry.

---

Status (2026-02-07) — Convert Design Panel & Product Conversion Pipeline

A Convert Design panel replaced the legacy 3D preview link and product conversion pipeline improved size and position remapping when switching products to avoid piled-up elements.

---

Status (2026-01-27) — Coordinate System & mm-to-px Fixes

A decisive fix to canonical coordinate math corrected mm↔px conversions (handling DPR and canvas ratios) so motifs and inscriptions align with legacy references without double-scaling.

---

Status (2026-01-28) — Default Store State & Catalog-Driven Dimensions

Default state was simplified (no preloaded additions/motifs) and product dimension rails now come directly from catalog XML so sliders clamp to live min/max values for each shape.

