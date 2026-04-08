# Zustand Store API Reference

Complete function-level documentation for `useHeadstoneStore` (`lib/headstone-store.ts`).

## Type Definitions (`headstone-store.types.ts`)

| Type | Description |
|------|-------------|
| `Line` | Inscription text with `id`, `text`, `sizeMm`, `font`, `color`, `xPos`, `yPos`, `rotationDeg`, `surface`, `baseWidthMm`, `baseHeightMm` |
| `Part` | `'headstone' \| 'base' \| 'ledger' \| 'kerbset' \| null` |
| `Material` | Texture/material with `id`, `name`, `image`, `category`, `textureUrl`, `thumbnailUrl` |
| `ShapeOption` | Shape variant with `id`, `name`, `category`, `previewUrl`, `maskKey` |
| `BorderOption` | Border style with `svgUrl` for plaques |
| `MotifCatalogItem` | Motif SVG with pricing info |
| `AdditionKind` | `'statue' \| 'vase' \| 'application'` |
| `PanelName` | `'shape' \| 'size' \| 'material' \| 'inscription' \| 'additions' \| 'addition' \| 'motifs' \| 'motif' \| 'image' \| 'emblems' \| 'emblem' \| 'checkprice' \| 'designs' \| null` |
| `LinePatch` | Partial update: `text`, `font`, `sizeMm`, `rotationDeg`, `xPos`, `yPos`, `color` |

---

## Product Setup & Initialization

### `setCatalog(catalog: CatalogData): void`
Sets the complete product catalog XML data (shapes, materials, pricing) for the selected product.

### `setProductId(id: string): Promise<void>`
**Async.** Fetches and parses the product catalog XML for the given product ID. Recalculates all dimension constraints, material lists, shape limits, base/ledger visibility based on product type. Rescales existing inscriptions and motifs to fit new constraints. Loads inscription and motif pricing models.

**Side effects:** Clears old catalog → updates `materials`, `shapes`, dimensions, thickness, visibility flags → rescales inscriptions/motifOffsets → updates material URLs → sets color defaults → loads pricing.

### `setMaterials(materials: Material[]): void`
Sets available material/texture options for the current product.

### `setShapes(shapes: ShapeOption[]): void`
Sets available shape options (oval, circle, portrait, landscape, etc.).

### `setBorders(borders: BorderOption[]): void`
Sets available border styles (for plaques only).

### `setMotifsCatalog(motifs: MotifCatalogItem[]): void`
Sets the catalog of available motifs with pricing.

### `setProjectMeta(meta: { projectId?: string | null; title?: string | null }): void`
Sets/updates current project metadata (ID and title) for save/load tracking.

---

## Headstone Dimensions

### `setWidthMm(v: number): void`
Sets headstone width, clamped to `[minWidthMm, maxWidthMm]`. Enforces full-monument cascade: if base becomes narrower than headstone, base + kerbset width is increased to `headstone + 200mm`, ledger set to headstone width. Triggers inscription cost recalc.

### `setHeightMm(v: number): void`
Sets headstone height, clamped to `[minHeightMm, maxHeightMm]`.

### `setUprightThickness(thickness: number): void`
Sets upright headstone thickness (depth), clamped to `[minThicknessMm, maxThicknessMm]`.

### `setSlantThickness(thickness: number): void`
Sets slant headstone thickness, clamped to `[minThicknessMm, maxThicknessMm]`.

### `setHeadstoneStyle(style: 'upright' | 'slant'): void`
Switches between upright and slant headstone styles.

---

## Base Dimensions

### `setBaseWidthMm(v: number): void`
Sets base width, clamped so base ≥ headstone width. **Cascade:** `kerbWidthMm = baseWidthMm`, `ledgerWidthMm = baseWidthMm - 200`.

### `setBaseHeightMm(v: number): void`
Sets base height, clamped to valid range. **Cascade:** `kerbHeightMm = baseHeightMm - 100`.

### `setBaseThickness(thickness: number): void`
Sets base depth, clamped to `[minThicknessMm, maxThicknessMm]`.

### `setBaseFinish(finish: 'default' | 'rock-pitch'): void`
Sets base finish/texture variant.

### `setShowBase(showBase: boolean): void`
Toggles base visibility. Auto-adjusts `editingObject` if currently editing hidden base.

---

## Ledger & Kerbset Dimensions (Full Monument)

### `setLedgerWidthMm(v: number): void`
Sets ledger width. **Cascade:** `baseWidthMm = ledger + 200`, `kerbWidthMm = ledger + 200`.

### `setLedgerHeightMm(v: number): void`
Sets ledger thickness.

### `setLedgerDepthMm(v: number): void`
Sets ledger depth (front-to-back). **Cascade:** `kerbDepthMm = ledger + 120`.

### `setShowLedger(v: boolean): void`
Toggles ledger visibility. Auto-adjusts `editingObject`.

### `setKerbWidthMm(v: number): void`
Sets kerbset width. **Cascade:** `baseWidthMm = kerbWidthMm`, `ledgerWidthMm = kerb - 200`.

### `setKerbHeightMm(v: number): void`
Sets kerbset height. **Cascade:** `baseHeightMm = kerb + 100`.

### `setKerbDepthMm(v: number): void`
Sets kerbset depth. **Cascade:** `ledgerDepthMm = kerb - 120`.

### `setShowKerbset(v: boolean): void`
Toggles kerbset visibility. Auto-adjusts `editingObject`.

---

## Materials & Textures

### `setMaterialUrl(url: string): void`
Sets the base/default material texture URL; normalizes and validates URL format.

### `setHeadstoneMaterialUrl(url: string): void`
Sets headstone-specific texture URL.

### `setBaseMaterialUrl(url: string): void`
Sets base-specific texture URL. Sets `baseSwapping = true` flag to trigger animation.

### `setLedgerMaterialUrl(url: string): void`
Sets ledger-specific texture URL.

### `setKerbsetMaterialUrl(url: string): void`
Sets kerbset-specific texture URL.

### `setBaseSwapping(swapping: boolean): void`
Enables/disables material swap animation flag.

---

## Shapes & Borders

### `setShapeUrl(url: string): void`
Sets the headstone shape SVG URL. Auto-updates dimensions from catalog if matching shape is found. Attempts to match shape by filename or catalog code.

### `setBorderName(name: string | null): void`
Sets border style name for plaques. `null` = no border.

### `setShowInsetContour(show: boolean): void`
Toggles inset contour line on headstone.

---

## Inscriptions

### `setInscriptions(inscriptions: Line[] | ((prev: Line[]) => Line[])): void`
Replaces all inscriptions. Accepts array or updater function. Normalizes line surface dimensions. Recalculates cost.

### `addInscriptionLine(patch?: LinePatch): string`
Creates a new inscription line. Returns the generated line ID. Default text: "New line", font: "Garamond". Color uses catalog `defaultColor`. Target surface uses current `selected` object. Auto-selects new line and recalculates cost.

### `updateInscription(id: string, patch: Partial<Line>): void`
Updates an existing inscription with partial data. Clamps `sizeMm` to `[inscriptionMinHeight, inscriptionMaxHeight]` and `rotationDeg` to `[-45°, 45°]`. Recalculates cost.

### `duplicateInscription(id: string): string`
Clones an inscription and offsets it vertically to avoid overlap. Returns new ID. Uses rendered bounds from Three.js mesh for precise offset calculation.

### `deleteInscription(id: string): void`
Removes an inscription and auto-selects the first remaining line.

### `setSelectedInscriptionId(id: string | null): void`
Selects an inscription for editing. Deselects motifs, additions, headstone/base. Sets `activePanel` to `'inscription'`.

### `setActiveInscriptionText(text: string): void`
Updates the text being edited in the input (not committed until blur/save).

### `setInscriptionHeightLimits(min: number, max: number): void`
Sets the valid size range for inscriptions (from product catalog).

### `setFontLoading(loading: boolean): void`
Indicates whether fonts are currently loading.

### `calculateInscriptionCost(): void`
Calculates total inscription cost based on font size as quantity and color-to-pricing mapping (Gold Gilding / Silver Gilding / Paint Fill). Sets `inscriptionCost`.

---

## Motifs

### `addMotif(svgPath: string): void`
Adds a decorative SVG motif. Generates unique ID. Color defaults to catalog `defaultColor` or white (laser) / gold (engraved). Creates default offset at center. Auto-selects and opens motif panel.

### `removeMotif(id: string): void`
Removes a motif. Clears offset data. Clears selection if active.

### `setMotifColor(id: string, color: string): void`
Updates motif color (hex). Triggers cost recalc.

### `setMotifRef(id: string, ref: RefObject<Group | null>): void`
Stores Three.js Group ref for the rendered motif mesh.

### `setMotifOffset(id: string, offset: Partial<MotifOffset>): void`
Updates motif position/scale/rotation. Partial merge with existing offset. Auto-refreshes surface dimensions if target changes.

### `duplicateMotif(id: string): void`
Clones a motif with offset (30px on headstone, 15% on ledger). Auto-selects clone.

### `calculateMotifCost(): void`
Calculates total motif cost based on height and color via `calculateMotifPrice()`. Uses `motifPriceModel`. Free for laser products.

---

## Additions (Statues, Vases, Applications)

### `addAddition(id: string): void`
Adds a 3D addition. Creates instance ID with timestamp. Target surface: statue/vase prefer `base` if available, falls back to `ledger` or `headstone`. Auto-selects and opens addition panel.

### `removeAddition(id: string): void`
Removes an addition instance. Clears refs and offsets.

### `hasStatue(): boolean`
Returns whether any statue or vase is on the base surface.

### `setBaseMeshRef(mesh: Mesh | null): void`
Stores Three.js Mesh ref for the base (for coordinate calculations).

### `setSelectedAdditionId(id: string | null): void`
Selects an addition for editing. Deselects other objects. On mobile, navigates to `/select-additions`.

### `setAdditionRef(id: string, ref: RefObject<Group | null>): void`
Stores Three.js Group ref for the rendered addition mesh.

### `setAdditionOffset(id: string, offset: Partial<AdditionOffset>): void`
Updates position/scale/rotation and optional metadata (sizeVariant, targetSurface, additionType, assetFile, etc.). Auto-refreshes surface dimensions.

### `duplicateAddition(id: string): void`
Clones an addition with offset position based on surface and footprint width.

### `calculateAdditionCost(): void`
Calculates total cost by summing `retailPrice` from size variants.

---

## Emblems (Bronze Plaques)

### `addEmblem(emblemId: string, imageUrl: string): void`
Adds a bronze plaque emblem. Default size from `EMBLEM_SIZES` config. Auto-selects and opens emblem panel.

### `removeEmblem(id: string): void`
Removes an emblem. Clears offset data and selection.

### `setSelectedEmblemId(id: string | null): void`
Selects an emblem for editing.

### `setEmblemRef(id: string, ref: RefObject<Group | null>): void`
Stores Three.js Group ref for the rendered emblem.

### `duplicateEmblem(id: string): void`
Clones an emblem with 20mm offset.

### `setEmblemOffset(id: string, offset: Partial<EmblemOffset>): void`
Updates emblem position/size/rotation/flip. Auto-refreshes dimensions.

### `calculateEmblemCost(): void`
Flat rate: $1.09 (109 cents) per emblem. Sets `emblemCost = count × 109`.

---

## Images (Photos)

### `addImage(image: ImageData): void`
Adds a photograph to the design. For ledger surface: resets position to center. Clears `cropCanvasData` after adding.

### `removeImage(id: string): void`
Removes an image. Clears selection if active.

### `duplicateImage(id: string): void`
Clones with offset (~10% on ledger, 20px on headstone/base). Auto-selects clone.

### `updateImagePosition(id: string, xPos: number, yPos: number): void`
Updates image X/Y position. Clears `coordinateSpace`.

### `updateImageSize(id: string, widthMm: number, heightMm: number): void`
Updates image dimensions in mm. Triggers cost recalc.

### `updateImageSizeVariant(id: string, sizeVariant: number): void`
Updates size variant index (maps to predefined sizes). Triggers cost recalc.

### `updateImageRotation(id: string, rotationZ: number): void`
Updates rotation angle in degrees.

### `setSelectedImageId(id: string | null): void`
Selects an image. Deselects all other objects.

### `setCropCanvasData(data: CropCanvasData | null): void`
Stores active crop/mask/color/rotation state for the image crop UI.

### `calculateImageCost(): Promise<void>`
**Async.** Fetches pricing map, then calculates total cost for all images by type and dimensions. Sets `imageCost`.

---

## UI & View State

### `setSelected(part: Part): void`
Selects which monument part the user is interacting with. Deselects all other editing contexts.

### `setActivePanel(p: PanelName): void`
Sets the currently active UI panel.

### `setEditingObject(obj: 'headstone' | 'base' | 'ledger' | 'kerbset'): void`
Sets which surface the user is focused on (persists across panel changes).

### `setNavTo(fn: NavFn): void`
Stores the navigation function for client-side routing (injected by app init).

### `openInscriptions(id: string | null): void`
Opens the inscription edit panel and navigates to `/inscriptions`.

### `openSizePanel(): void`
Opens the size panel and navigates to `/select-size`.

### `openAdditionsPanel(): void`
Opens the additions panel and navigates to `/select-additions`.

### `closeInscriptions(): void`
Closes inscriptions panel and clears inscription selection.

### `toggleViewMode(): void`
Toggles between 3D and 2D view modes.

### `setLoading(loading: boolean): void`
Sets global loading indicator flag.

### `setIsMaterialChange(isMaterialChange: boolean): void`
Indicates a material change animation is in progress.

---

## Design Control

### `resetDesign(): void`
Clears the entire design to a blank slate. Resets: inscriptions, additions, motifs, emblems, images, crops, selections, panels, visibility, dimensions to defaults (900×900mm). Does NOT reset: product ID, catalog, material choices.
