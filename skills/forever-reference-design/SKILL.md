---
name: forever-reference-design
description: Design or revise a memorial in Forever MCP from a user's description or reference image, compare the rendered preview against the request, and save locally when requested.
---

# Forever reference design

Use the Forever MCP tools and the actual reference image; a prior design is only a starting point. Do not invent lettering, dates, materials, shapes or decorative details to fill gaps in the reference. Report uncertain text and unavailable features. Preserve the user's exact text when supplied. If text is unreadable, omit the uncertain portion or ask rather than guessing.

Complete the user's requested sequence while tools are available: after configuring the product, proceed through every requested inscription and decoration in that same turn without stopping after intermediate elements. 

RECOMMENDED: Use the high-level layout tool `compose_memorial_layout` whenever composing a memorial. It automatically applies professional typographic scaling (names 44-50 mm, headers 30-36 mm, dates 20-24 mm), supports splitting names across two lines (firstName + lastName), prevents collisions, and positions inscriptions and motifs harmoniously on the stone using presets:
- `single_centered`: For a single deceased individual, centered vertically with crown motif, header ("Ś. P."), split name, vital dates, and bottom valediction.
- `companion_both`: For two persons with balanced two-column division of the headstone plaque (left column: `leftPerson`, right column: `rightPerson`). By default, the cross/motif (`centerMotif`) is placed proudly in the crown arch under the apex (`yPos: -180 mm`), with shared `headerText` ("Ś. P.") beneath it, creating perfect horizontal alignment between both columns without any awkward vertical "staircase" shift. Both persons' names are automatically split into two lines (firstName + lastName), ensuring wide margins from outer edges and avoiding crowding.
- `companion_shared_surname`: For a double headstone with a large shared family surname (e.g. "KOWALSCY", 48-52 mm) centered across the middle, with two symmetrical columns below for first names and dates.
- `companion_left`: For a double headstone with only the left column currently populated (reserving the right side for the future).
- Multi-surface Monuments (Headstone + Base + Ledger + 3D Additions):
  * Full Monument product: Use `select_product(productId: '101')` for `Traditional Engraved Full Monument` (includes upright headstone, base, 2-meter ledger slab, and kerbset framing).
  * Base inscriptions: Use `add_inscription` with `target: 'base'`, `coordinateSpace: 'mm-center'`, e.g. "RODZINA KOWALSKICH" (`sizeMm: 38..44`, `yPos: 0`).
  * Ledger (horizontal slab) inscriptions: Use `add_inscription` with `target: 'ledger'`, e.g. "PAMIĘĆ O WAS NIGDY NIE ZGAŚNIE" (`sizeMm: 32..38`, `yPos: 0`, `font: 'Great Vibes'`).
  * 3D Additions (vases/statues, e.g. `K2213` Vase Base Mounted): Added via `add_addition(catalogId: 'K2213')` and updated with `update_addition(id, patch: { xPos: -380 })`. Millimeter positions (e.g. `-380` / `+380` mm) are automatically normalized to surface coordinates.
Alternatively, use batch tools (`add_inscriptions`) or pass complete positioning/styling (`font`, `sizeMm`, `color`, `xPos`, `yPos`, `textAlign`) directly into `add_inscription` and `add_motif` to avoid unnecessary multi-step round-trips. Do not end a turn merely because a single inscription or motif was added; continue until the entire layout is in place, then call `get_preview`, inspect/correct the preview, and perform any authorized local save. Stop only when the user explicitly requires intermediate review, an essential tool or image is unavailable, the design cannot be matched reliably, or a genuine tool error prevents safe progress. Report the exact blocker and completed steps; never claim a preview, edit or save that did not occur.

In a new independent session, assess the current session's actual state and revision. A previous draft's normalized coordinates do not themselves block a new design; use the new session's coordinates and inspect its preview. If an edit fails, report the actual tool name, arguments and error instead of inferring a failure from another session. If the active session reverted to `original` or a missing session, do not modify `original`: if a prior working draft exists, use `list_local_designs` to identify the latest saved draft and reopen it via `open_local_design`, then continue in the newly created session. If asked to relay a fresh preview as a file, use the image returned by that preview; never label an earlier export as the fresh image.

Match requested stone brightness in the rendered preview, not just the catalog name: Blue Pearl can appear dark blue-grey, whereas White Carrara can provide a light surface if available. Check text and motifs for contrast against the chosen surface; adjust them and review a fresh preview before saving when necessary. Treat these materials as examples, not defaults.

`set_material` requires the exact `id` from the current session's `get_product_configuration`, not the material's name. If a material lookup returns `NOT_FOUND`, reread that configuration, find the desired material and retry once using its listed ID and current revision; report a blocker only if the material is unavailable or the corrected call fails. For a photo, infer dimensions and brightness from what is visible rather than assuming a tall black stone.

1. Inspect the image and form a compact checklist: product and proportions, outline, material and color, text content and alignment, decoration, and base or mounting. Distinguish what is visible from assumptions. If the image is unavailable, request it before attempting visual matching.
2. Read `get_design` and discover applicable products, shape, size, materials, inscription and motif capabilities before changing the current design. Search other relevant motif categories if the obvious one lacks a match; category names may be misleading. Choose a closest available option and disclose material approximations.
3. Apply changes with the current revision; for the local pilot only, `expectedRevision: "latest"` is available. Inspect each item's coordinate space before positioning. On a headstone, motif `offset` coordinates use positive Y downward, while `absolute` and `mm-center` use positive Y upward; units depend on the surface. New base inscriptions use `mm-center`: `(0, 0)` is the front-face center, in millimetres. Older base lines may use legacy coordinates; inspect the preview and replace a legacy line if needed. Elements are not automatically clamped to the stone.
4. Scale and Lettering Standards on Large Headstones (width >= 700 mm, e.g. Curved Gable 900x900 mm):
   - Header / Primary Surname: 45–60 mm (typically 50 mm).
   - Secondary Quotes / Verses: 18–24 mm.
   - Individual Column Names: 26–32 mm (recommended 28 mm).
   - Dates & Sub-details: 20–24 mm (recommended 22 mm).
   - Minimum font size: On stones >= 700 mm, avoid text sizes under 20 mm; text below 20 mm renders as tiny ~10 px artifacts in preview screenshots, making dates hard to read or causing false reports of missing text.
   - Column Margins on Curved Silhouettes: Curved Gable, Peak, Oval stones have sloping shoulders that drop down on the left and right. Keep text columns centered within `xPos: ±130..150 mm` (not `±200+ mm`) to prevent text clipping into curved margins.
   - Line Spacing & Semantic Grouping (Crucial):
     * NEVER space all inscriptions with a rigid, uniform grid interval (e.g. uniform 60 mm steps). Memorial typography relies on logical semantic grouping:
       1. Header & Primary Name: Closely paired (spacing ~35–45 mm). E.g. "IN LOVING MEMORY OF" sits close to the name it introduces.
       2. Age & Life Dates: Closely paired vital records (spacing ~28–35 mm). E.g. "Aged 19 Years" directly above or below birth/death dates.
       3. Family Verses & Epitaph Lines: Form a cohesive, tightly knit stanza (~28–35 mm between lines) rather than widely scattered individual lines.
       4. Logical Breathing Room: Leave a distinct separation (~50–65 mm) between different semantic groups (between Name and Dates, between Dates and Family block, and before the final bottom Motto/Valediction).
   - Vertical Headstone Space & Traditional Stonemason Composition Canon (Crucial):
     * Stone center is (0, 0). Usable Y on a headstone runs from bottom ~-(heightMm/2 - 60) to top ~+(heightMm/2 - 60).
     * Classical Memorial Order & Hierarchy:
       1. Top Arch / Crown: Sacred symbol (cross, rose, flower) in crown apex OR introductory header (e.g. "Ś. P." or "IN LOVING MEMORY"). NEVER put concluding mottos like "Spoczywaj w pokoju" at the top!
       2. Center of Gravitas (Primary Names): On slender/upright stones, split first and last names across two separate lines (e.g. "STANISŁAWA" on top, "KOWALSKA" below). This allows large, legible font sizes (48–56 mm) without spreading awkwardly to the edges.
       3. Vital Records (Dates): Grouped closely below the surname with classic markers (e.g. `* 12.04.1936   † 18.09.2023` or `ur. 12.04.1936  zm. 18.09.2023`), size ~24–26 mm.
       4. Relationship / Subtext (Optional): E.g. "Żyła 87 lat" or "Kochana Mama", size ~22 mm.
       5. Concluding Valediction / Motto: "Spoczywaj w pokoju", "Pamiętamy" or "Rest in Peace" belongs at the very bottom as the final closing line (~150–180 mm below stone center), keeping a graceful breathing margin above the base.
     * NEVER leave the upper arch/crown of Gable, Curved Gable, Peak or Serpentine stones empty! The top dome (Y: +0.32*H to +0.42*H) is the focal crown of the monument:
       - Place the primary top motif (cross, rose, flower, angel) proudly inside this upper arch (offset yPos: -180 to -220 mm, height: 70-100 mm).
       - Place "Ś. P." or dedication header under the motif (yPos: +190..+210 mm) or high in the arch if no motif (yPos: +230..+260 mm).
       - If `inscriptionLayout.warnings` returns `EMPTY_TOP_CROWN`, immediately raise the motif or header higher into the crown.
     * Full Vertical Balance (Curved Gable / Gable / Peak / Arched stones, height ~900 mm):
       - Top crown motif (rose, cross, leaf): offset yPos: -180 to -200 mm (height: 70-100 mm). Safely fills the dome without sticking out into air.
       - Header ("Ś. P."): Y ~ +190..+210 mm (or +230..+260 mm if no motif). Size 30–36 mm.
       - First Name ("STANISŁAWA"): Y ~ +120..+130 mm (size 48 mm).
       - Last Name ("KOWALSKA"): Y ~ +50..+60 mm (size 54 mm).
       - Vital Dates (`* 12.04.1936   † 18.09.2023`): Y ~ -10..-15 mm (size 24–26 mm).
       - Relationship/Age (Optional, e.g. "Żyła 87 lat"): Y ~ -70..-75 mm (size 22 mm).
       - Concluding bottom valediction ("Spoczywaj w pokoju"): Y ~ -160..-180 mm (size 24–26 mm).
     * Headstone Coordinate System & Column Placement:
       - Headstone coordinates use the normalized SVG geometry space (~400 units wide, usable range X: -180 to +180 from center).
       - NEVER use raw millimeter offsets like xPos: ±300 or ±400 — that places text far outside the stone in empty air!
       - For 2-column memorials, the column centers are ALWAYS at xPos: ±90..±120:
         * Left column center: xPos: -100 to -110.
         * Right column center: xPos: +100 to +110.
       - Person-specific motifs: match the column center (xPos: -100) and place comfortably above the name (offset yPos: -140 to -160 mm, which maps to +140..+160 mm on the stone, safely 50-70 mm above a name at yPos: 80..90 mm).
       - NEVER place wide central text (xPos: 0) in the middle Y range where it collides with column text! Shared headers belong at the very top (yPos: +200..+230); shared dedications/mottos belong at the very bottom (yPos: -120..-150).
     * Keep decorative motifs inset from curved/notched corners (e.g. Serpentine, Peak) so no wings, crosses or leaves hang over the stone's sloping edge.
     * Multi-Surface Full Monuments (Product `101`) & Headstones with Base (Product `124`):
       - Upright Headstone (`target: 'headstone'`): Primary family inscriptions, epitaphs, and religious motifs.
       - Granite Base (`target: 'base'`): Wide family inscription (e.g. `RODZINA KOWALSKICH`, Garamond 38–40 mm, `xPos: 0, yPos: 0`). 3D granite vases (catalogId: `K2213`) mount symmetrically on the base using millimeter offsets (e.g. `xPos: -380` and `+380`).
       - Horizontal Ledger Slab (`target: 'ledger'`): Extended dedications (e.g. `PAMIĘĆ O WAS NIGDY NIE ZGAŚNIE`, Great Vibes 36 mm, `xPos: 0, yPos: 0`).
     * Cast Bronze Plaques (Product `5`):
       - Shapes: Rectangle Landscape (`shapeId: '67'`), Rectangle Portrait (`shapeId: '68'`), Oval Landscape (`shapeId: '69'`), Circle (`shapeId: '71'`). Standard size e.g. 380×280 mm or 450×300 mm.
       - Borders: `borderName` ('Border 1' to 'Border 10', e.g. 'Border 4' Solid), `fixingType`: 'lugs-with-studs', 'flat-back', or 'screws'.
       - Emblems & Motifs: Bronze cast motifs (crosses, floral) and emblems (`list_emblems`, `add_emblem`, `update_emblem`) mount with natural bronze finish. Motifs use offset coordinate space (negative Y is UP toward top edge). Raised bronze lettering (#D4AF37) with clean spacing.
       - MANDATORY Stonemason Bronze Plaque Typographic & Composition Canon:
         1. Primary Name Focal Dominance: The recipient's name MUST be the indisputable hero of the plaque (24–28 mm on 380–450 mm plaques; ~170%–200% size of subtitles, minimum 22 mm). NEVER downsize the name to match secondary lines.
         2. Strict Segregation of Titles & Roles: NEVER concatenate names with titles, positions, achievements, or foundation details into a single line (e.g. NEVER "JOHN MILLER FOUNDER OF MILITARY GARDEN FUNDED"). Isolate titles and roles (e.g. "Founder of the Military Garden") into their own line directly under the name (12–14 mm).
         3. Typographic Case & Style Contrast (Avoid Monotonous Wall of Caps):
            - Name & Introductory Header: Dignified UPPERCASE (ALL CAPS).
            - Roles, Honors & Epitaphs: Title Case (e.g. "Founder of the Military Garden", "Distinguished Scholar and Mentor") or Italic to provide visual warmth and break up monotonous capital letters.
            - Solitary Years: Format single dates with classic em-dashes (e.g. "— 2026 —").
            - Concluding Valedictions: Formatted in quotes or Title Case (e.g. "„Forever in our Hearts”").
         4. Maximum Line Width & Margin Safety: No line should exceed 70% of plaque width. Long sentences must be wrapped into balanced lines.
         5. Semantic Vertical Spacing (Cluster Spacing, Not Uniform Interval): Group the name and its role together; leave breathing space before secondary honours and dates.
   - Coordinate System: On a headstone, inscription Y increases UPWARD (larger Y is higher on the stone). Headstone motif offset Y increases DOWNWARD (larger Y is lower on the stone).

## Default Design Archetypes (Zero-Guessing Defaults for Simple Prompts)

When the user gives a concise prompt without explicit technical parameters (e.g. "Zaprojektuj nagrobek dla Jana Kowalskiego", "Zaprojektuj tablicę z brązu dla ...", or "Zaprojektuj Full Monument dla ..."), ALWAYS automatically select and apply the corresponding standard archetype below:

### Archetype 1: Cast Bronze Commemorative Plaque (Product `5`)
- **Keywords:** "tablica z brązu", "bronze plaque", "tablica pamiątkowa".
- **Setup:**
  * Session: `create_local_session(productId: '5')`.
  * Shape: Rectangle Landscape (`shapeId: '67'`), dimensions `widthMm: 380, heightMm: 280` (or `450x300 mm` when requested).
  * Assembly: `borderName: 'Border 4'` (Solid), `fixingType: 'lugs-with-studs'`.
  * Cross / Motif: `/shapes/motifs/cross_001.svg` in upper area (`heightMm: 36–45`, `xPos: 0`, offset `yPos: -Math.round(H * 0.32)`).
  * **STRICT ZERO-INVENTION RULE FOR INSCRIPTIONS:**
    - NEVER invent dates (e.g. "1938 — 2019"), academic titles (e.g. "Distinguished Scholar and Mentor"), or closing valedictions (e.g. "Forever in our Hearts") if the user prompt did NOT provide them!
    - Only render lines explicitly provided or requested.
    - If the user prompt is minimal (e.g. *"Design Bronze Plaque for fallen WWII soldiers"*), compose ONLY the introductory header ("IN MEMORY OF") and the requested subject ("FALLEN WWII SOLDIERS") — preserving all words, numbers, and acronyms (like WWII).
  * **Dynamic Layout Canon based on actual line count $N$:**
    - 2-Line Layout (minimal prompt, e.g. Header + Subject):
      * Header: "IN MEMORY OF" / "PAMIĘCI" (size 16–18 mm, `yPos: +36 mm` [+0.12 * H]).
      * Subject: "FALLEN WWII SOLDIERS" (size 28–30 mm, `yPos: -18 mm` [-0.06 * H] — prominent hero!).
    - 3-Line Layout (Header + Subject + Dates OR Subtitle):
      * Header: size 15–16 mm, `yPos: +54 mm` (+0.18 * H).
      * Subject / Name: size 26–28 mm, `yPos: +12 mm` (+0.04 * H).
      * Dates / Subtitle: size 14–16 mm, `yPos: -48 mm` (-0.16 * H).
    - 4-Line Layout:
      * Header (`yPos: +60 mm` [+0.20 * H]), Subject (`yPos: +21 mm` [+0.07 * H]), Subtitle/Dates (`yPos: -24 mm` [-0.08 * H]), Epitaph (`yPos: -66 mm` [-0.22 * H]).
    - 5-Line Layout (when user provided Header, Name, Subtitle, Dates, and Epitaph):
      * Header (`yPos: +63 mm`), Name (`yPos: +27 mm`), Subtitle (`yPos: -6 mm`), Dates (`yPos: -42 mm`), Epitaph (`yPos: -75 mm`).
    - 6-Line Layout (when role/title is also explicitly supplied):
      * Header (`yPos: +66 mm`), Name (`yPos: +33 mm`), Role (`yPos: +6 mm`), Subtitle (`yPos: -24 mm`), Dates (`yPos: -51 mm`), Epitaph (`yPos: -75 mm`).

### Archetype 2: Upright Traditional Headstone with Base (Product `124`)
- **Keywords:** "nagrobek", "headstone", "nagrobek dla jednej/dwóch osób".
- **Setup:**
  * Session: `create_local_session(productId: '124')`.
  * Shape & Material: Curved Gable (`shapeId: 'curved_gable'`), 850×900 mm. Material: African Black (`materialId: '1'`) on headstone and base.
  * Composition via `compose_memorial_layout`:
    - Single person: `preset: 'single_centered'`, `splitName: true` (First Name 46 mm at +80, Last Name 52 mm at 0, dates 22 mm at -75, motto at -190), golden text `#D4AF37`, cross in crown (`heightMm: 70`, `position: 'crown'`).
    - Two persons (Companion): `preset: 'companion_both'`, 2 columns (`xPos: ±110 mm`), cross in crown (`cross_001.svg`, 70 mm), "Ś. P." header, bottom motto cursive `Great Vibes`.
  * Base: Inscription "RODZINA [NAZWISKO]" (Garamond 38 mm, `yPos: 0`) and 2 vases `K2213` (`xPos: ±380 mm`).

### Archetype 3: Full Monument Family Tomb (Product `101`)
- **Keywords:** "full monument", "grobowiec", "nagrobek pełny", "duży nagrobek z płytą".
- **Setup:**
  * Session: `create_local_session(productId: '101')`.
  * Headstone, Base, Ledger & Kerbset: African Black on all surfaces (`materialId: '1'`).
  * Stela: Serpentine 900×700 mm with `compose_memorial_layout` (`companion_both` or `single_centered`).
  * Base: "RODZINA [NAZWISKO]" (Garamond 40 mm) + 2 vases `K2213` at `xPos: ±380 mm`.
  * Ledger: Extended dedication e.g. "PAMIĘĆ O WAS NIGDY NIE ZGAŚNIE" (`Great Vibes` 36 mm, `target: 'ledger'`).

### Autonomous Workflow Protocol for Simple Prompts:
1. Parse requested person(s), names, dates, or family surname from user prompt.
2. Select matching archetype, invoke `create_local_session`, configure shape, material, layout, and multi-surface elements.
3. Retrieve `get_preview`. If any warnings appear in `motifLayout` or `inscriptionLayout`, immediately adjust coordinates in the same turn.
4. Execute `save_local_design` with `visuallyReviewed: true`.
5. Return saved draft ID and clickable markdown links to the JSON and JPG files.
5. Call `get_preview` after edits. Read `motifLayout` and `inscriptionLayout.warnings` when provided. Correct indicated problems and obtain a new preview.
   - Active Visual Correction (Crucial): If `inscriptionLayout.warnings` contains any `TEXT_COLLISION`, `MOTIF_COLLISION` or margin warnings, or if an inspected preview reveals overlapping text, motifs sitting on text or hanging in empty air, illegible or tiny dates, or name clipping, DO NOT merely report the problem and stop the turn! Immediately perform corrective edits in that same turn (separate colliding Y positions, shift xPos/yPos, adjust sizes), obtain a fresh `get_preview`, verify the improved image, and only then proceed.
   - Actually inspect the returned image: full decoration inside the intended surface with a margin, legible text, no overlap or obstruction, and correct material, shape and proportions. Confirm each date is visibly paired with its name.
   - If the image cannot be interpreted, retry once. Do not claim visual verification or mark it reviewed without seeing it.
6. Honor the user's save instruction. If the user asks to review first, do not save until that review is complete. When a local save is requested and the actual preview satisfies the request, use `save_local_design` with the preview's exact `previewId`, `visuallyReviewed: true` and matching revision; never assert visual review without seeing the image. A change or expired preview requires a new image. Report saved file paths and distinguish an approximation from a faithful reproduction. If a preview ID or MCP tool is missing, report the blocker; do not substitute an unreviewed save.

Reference-photo analysis does not require uploading the photo to the site's image storage. Do not trigger cloud save, email, photo upload, or publishing unless requested.

## Independent sessions, draft discovery and reopening

Use `list_local_designs` to discover saved local drafts and their UUIDs, titles, and timestamps. When continuing or evaluating past work, open the latest relevant draft using `open_local_design(id: "<uuid>")`. For example, draft `c18576c3-5111-40af-9d88-37f3bee17cd9` contains the corrected, fully visible and legible layout for PRICE (KLEIN) with names at 24 mm, dates at 22 mm, quote at 22 mm, and all columns safely inset at `xPos: ±120 mm` and `yPos >= 10 mm`.

For a requested local round-trip test, save only after the required visual review, then use the saved ID with `open_local_design` to open a separate session. Compare the restored actual image and `list_inscriptions` with the reviewed design, including all surfaces, positions, text, size and legibility. `restoredExactly` compares serialized state, not visual correctness; report `restoredNormalized`, `legacyLayoutCompared` and other warnings as returned. Return to `original` and compare its revision if the user requested preservation.

For an `original` preservation check, explicitly select `original` before each baseline and final `get_design`, and record the selected session ID with each revision. A revision read while a temporary session was selected cannot establish the original baseline; report the comparison as inconclusive rather than assuming which session changed.

Session IDs belong to the current MCP connection and can disappear after reconnecting. If a temporary session is missing, say so; create or reopen another only when the user's instructions permit it. Never substitute the `original` tab for a missing isolated session. Keep the requested review and save sequence intact even if work spans turns; report exactly which steps were actually completed.
