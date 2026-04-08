# State Management

## Overview

DYO uses **Zustand 5** as the single source of truth for all design state. The main store (`lib/headstone-store.ts`, ~2000+ LOC) is consumed by both React UI components and Three.js scene components.

A secondary store (`lib/scene-overlay-store.ts`) manages floating panel UI state.

## Main Store: `useHeadstoneStore`

### State Slices

#### Product & Catalog

| State | Type | Purpose |
|-------|------|---------|
| `catalog` | `CatalogData` | Parsed XML product catalog |
| `productId` | `string` | Current product type ID |
| `materials` | `Material[]` | Available material options |
| `shapes` | `Shape[]` | Available headstone shapes |
| `borders` | `BorderOption[]` | Available border options |
| `motifsCatalog` | `MotifCatalogItem[]` | Available motif library |

#### Dimensions (all in mm)

| State | Type | Purpose |
|-------|------|---------|
| `widthMm` | `number` | Headstone width |
| `heightMm` | `number` | Headstone height |
| `minWidthMm` / `maxWidthMm` | `number` | Width constraints (300–1200) |
| `minHeightMm` / `maxHeightMm` | `number` | Height constraints (300–1200) |
| `baseWidthMm` / `baseHeightMm` | `number` | Base pedestal dimensions |
| `baseThickness` / `uprightThickness` / `slantThickness` | `number` | Thickness values |
| `ledgerWidthMm` / `ledgerDepthMm` / `ledgerHeightMm` | `number` | Ledger slab (full monument) |
| `kerbWidthMm` / `kerbHeightMm` / `kerbDepthMm` | `number` | Kerbset border (full monument) |

#### Materials & Textures

| State | Type | Purpose |
|-------|------|---------|
| `materialUrl` | `string` | Generic material URL |
| `headstoneMaterialUrl` | `string` | Headstone face texture path |
| `baseMaterialUrl` | `string` | Base pedestal texture path |
| `ledgerMaterialUrl` | `string` | Ledger slab texture path |
| `kerbsetMaterialUrl` | `string` | Kerbset border texture path |
| `baseSwapping` | `boolean` | Whether base material can differ from headstone |

#### Inscriptions

| State | Type | Purpose |
|-------|------|---------|
| `inscriptions` | `Line[]` | Array of text lines |
| `selectedInscriptionId` | `string \| null` | Currently selected text line |
| `activeInscriptionText` | `string` | Text being edited |
| `fontLoading` | `boolean` | Font loading state |

Each `Line` has: `id`, `text`, `height` (mm), `font`, `color`, `xPos`, `yPos`, `rotationDeg`, `surface`.

#### Motifs

| State | Type | Purpose |
|-------|------|---------|
| `selectedMotifs` | `Motif[]` | Array of placed motifs |
| `selectedMotifId` | `string \| null` | Currently selected motif |
| `motifOffsets` | `Record<id, MotifOffset>` | Position/scale/rotation per motif |
| `motifRefs` | `Record<id, Ref>` | Three.js mesh refs |
| `motifPriceModel` | `PricingModel` | Pricing formula data |

Each `MotifOffset` has: `xPos`, `yPos`, `scale`, `rotationZ`, `heightMm`.

#### Additions

| State | Type | Purpose |
|-------|------|---------|
| `selectedAdditions` | `Addition[]` | Array of placed 3D objects |
| `selectedAdditionId` | `string \| null` | Currently selected addition |
| `additionOffsets` | `Record<id, AdditionOffset>` | Position per addition |
| `additionRefs` | `Record<id, Ref>` | Three.js mesh refs |

#### Emblems

| State | Type | Purpose |
|-------|------|---------|
| `selectedEmblems` | `Emblem[]` | Array of placed emblems |
| `selectedEmblemId` | `string \| null` | Currently selected emblem |
| `emblemOffsets` | `Record<id, EmblemOffset>` | Position/scale per emblem |

#### Images

| State | Type | Purpose |
|-------|------|---------|
| `selectedImages` | `Image[]` | Array of placed photos |
| `selectedImageId` | `string \| null` | Currently selected image |
| `cropCanvasData` | `CropData` | Active crop operation state |

#### Pricing

| State | Type | Purpose |
|-------|------|---------|
| `inscriptionCost` | `number` | Calculated inscription total |
| `motifCost` | `number` | Calculated motif total |
| `emblemCost` | `number` | Calculated emblem total |
| `imageCost` | `number` | Calculated image total |
| `additionCost` | `number` | Calculated addition total |

#### UI State

| State | Type | Purpose |
|-------|------|---------|
| `activePanel` | `string` | Currently active sidebar section |
| `selected` | `'headstone' \| 'base' \| 'ledger' \| 'kerbset' \| null` | Selected monument part |
| `editingObject` | `object \| null` | Object being edited |
| `showBase` | `boolean` | Base visibility |
| `showLedger` | `boolean` | Ledger visibility (full monument) |
| `showKerbset` | `boolean` | Kerbset visibility (full monument) |
| `is2DMode` | `boolean` | 2D vs 3D view toggle |
| `loading` | `boolean` | Global loading indicator |

#### Design Metadata

| State | Type | Purpose |
|-------|------|---------|
| `currentProjectId` | `string \| null` | Saved project ID |
| `currentProjectTitle` | `string` | Project display name |
| `shapeUrl` | `string` | Current shape SVG path |
| `borderName` | `string` | Current border selection |
| `headstoneStyle` | `string` | Engraving style (laser/traditional) |

### Key Actions

#### Product Setup
- `setProductId(id)` — Loads catalog XML, configures visibility & dimension constraints

#### Inscription CRUD
- `addInscriptionLine(patch)` — Add new text line
- `updateInscription(id, patch)` — Update text, font, size, color, position
- `duplicateInscription(id)` — Clone a text line
- `deleteInscription(id)` — Remove a text line
- `setSelectedInscriptionId(id)` — Select for editing

#### Motif CRUD
- `addMotif(svgPath)` — Place new motif on surface
- `removeMotif(id)` — Remove motif
- `setMotifColor(id, color)` — Change motif color
- `setMotifOffset(id, offset)` — Update position/scale
- `duplicateMotif(id)` — Clone a motif

#### Addition CRUD
- `addAddition(id)` — Place new 3D object
- `removeAddition(id)` — Remove object
- `setAdditionOffset(id, offset)` — Update position
- `duplicateAddition(id)` — Clone an addition

#### Emblem CRUD
- `addEmblem(emblemId, imageUrl)` — Place new emblem
- `removeEmblem(id)` — Remove emblem
- `duplicateEmblem(id)` — Clone emblem
- `setEmblemOffset(id, offset)` — Update position/scale

#### Image CRUD
- `addImage(image)` — Place photo
- `removeImage(id)` — Remove photo
- `updateImagePosition(id, ...)` / `updateImageSize(id, ...)` / `updateImageRotation(id, ...)` — Edit
- `duplicateImage(id)` — Clone image

#### Pricing
- `calculateInscriptionCost()` — Aggregate inscription pricing
- `calculateMotifCost()` — Aggregate motif pricing
- `calculateImageCost()` — Aggregate image pricing
- `calculateAdditionCost()` — Aggregate addition pricing
- `calculateEmblemCost()` — Aggregate emblem pricing

#### Design Control
- `resetDesign()` — Clear all content back to defaults
- `setEditingObject(obj)` — Set active editing target
- `toggleViewMode()` — Switch 2D/3D
- `setProjectMeta({ projectId, title })` — Track saved project

---

## Pricing Engine

### Architecture

Pricing data comes from XML files in `/public/xml/`:

```
/xml/au_EN/motifs-engraved.xml    → Motif pricing (engraved)
/xml/au_EN/motifs-laser.xml       → Motif pricing (laser)
/xml/au_EN/motifs-bronze.xml      → Motif pricing (bronze)
/xml/en_EN/images.xml             → Image pricing
Product catalog XMLs              → Base product + inscription pricing
```

### Price Formula

XML defines formulas like `"136.90+0($q-1)"`:

```
base + rate × (quantity - threshold)
```

Where `quantity` varies by item type:
- **Inscriptions**: Number of characters
- **Motifs**: Height in mm
- **Images**: Width + Height (or Width × Height, depending on model)
- **Additions**: Fixed price per size variant

### Pricing Files

| File | Purpose |
|------|---------|
| `lib/motif-pricing.ts` | Parse motif XML; calculate by height, color, product type |
| `lib/image-pricing.ts` | Parse image XML; calculate by dimensions and color mode (BW/Color/Sepia) |
| `lib/xml-parser.ts` | Generic XML catalog parser; `calculatePrice(priceModel, quantity)` |
| `lib/check-price-utils.ts` | Material display names; shape name generation |

### Special Pricing Rules

- **Laser products**: Motifs are free (included in base price)
- **Gold/Silver gilding**: Premium pricing tier
- **Bronze applications**: Separate price model from engraved/laser

---

## Secondary Store: `sceneOverlayStore`

Manages floating overlay panel state:

| State | Type | Purpose |
|-------|------|---------|
| `open` | `boolean` | Panel visibility |
| `title` | `string` | Panel header text |
| `content` | `ReactNode` | Panel body content |
| `pos` | `{ x, y }` | Panel position (draggable) |
| `collapsed` | `boolean` | Collapsed/expanded state |

---

## Data Flow Diagram

```
User Interaction (click, drag, form input)
         │
         ▼
  Zustand Store Action (e.g., addMotif, updateInscription)
         │
         ▼
  Store State Update (immutable, via Immer-style)
         │
    ┌────┼────────────────────┐
    ▼    ▼                    ▼
  React UI    Three.js Scene    Pricing Engine
  (re-render  (re-render mesh,  (recalculate
   panels)     textures, text)   costs)
```
