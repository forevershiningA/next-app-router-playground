# Saved Design Serialization Format (v2026.01)

This note documents the proposed canonical file format for storing Forever Shining "Design Your Own" layouts in both JSON and XML. The format is designed to be:

- **Lossless** with respect to everything that the legacy `dyo` files described (headstone, base, motifs, inscriptions, photos, additions, prices, etc.).
- **Ready for real-time rendering** inside the web 2D preview and the 3D Designer without re-running any DPI/mobile scaling code.
- **Convertible** from the existing datasets located under `public/ml/**/saved-designs/{json,xml}/`.
- **React-friendly** so that we can hydrate the XML as JSX if we decide to expose the React-style component tree mentioned in the brief.<br>

Layout coordinates stay in the original canvas pixel space (origin at the screenshot centre, **X** to the right, **Y** downward). That origin coincides with the headstone midpoint in the legacy editor, so `x_px = 0`, `y_px = 0` is always the centre of the upright stone. The 3D Designer derives millimetre values at runtime using the canonical `scene.viewportPx` metadata together with the physical dimensions in `components`, so the JSON itself no longer leaks customer-specific physical measurements.

---

## 1. File layout

```json5
{
  "version": "2026.01",
  "units": "mm",
  "source": {
    "id": "1725769905504",
    "slug": "curved-gable-may-heavens-eternal-happiness-be-thine",
    "mlDir": "headstonesdesigner",
    "legacyFile": "/ml/headstonesdesigner/saved-designs/json/1725769905504.json"
  },
  "product": {
    "id": "124",
    "name": "Traditional Engraved Headstone",
    "shape": "Curved Gable",
    "type": "headstone",
    "material": {
      "name": "G633",
      "texture": "/textures/forever/l/G633.webp"
    }
  },
  "scene": {
    "canvas": { "width_mm": 609.6, "height_mm": 609.6 },
    "viewportPx": { "width": 1102, "height": 689, "dpr": 1.0 },
    "surface": { "origin": [0, 0, 0], "normal": [0, 0, 1] }
  },
  "components": {
    "headstone": {
      "width_mm": 609.6,
      "height_mm": 609.6,
      "thickness_mm": 100,
      "surface": "front"
    },
    "base": {
      "width_mm": 700,
      "height_mm": 100,
      "depth_mm": 250,
      "material": {
        "name": "African Black",
        "texture": "/textures/forever/l/African-Black.webp"
      }
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
      },
      {
        "id": "insc-2",
        "text": "May Heaven's eternal happiness be thine.",
        "font": { "family": "Garamond", "size_px": 42.1 },
        "position": { "x_px": 34.1, "y_px": -65.8 },
        "rotation": { "z_deg": 0 },
        "color": "#000000",
        "align": "center"
      },
      {
        "id": "insc-3",
        "text": "TERESA ISABELLA",
        "font": { "family": "Garamond", "size_px": 40.5 },
        "position": { "x_px": 210.7, "y_px": 170.9 },
        "rotation": { "z_deg": 0 },
        "color": "#000000",
        "align": "center"
      }
      /* remaining lines omitted for brevity */
    ],
    "motifs": [
      {
        "id": "motif-1",
        "asset": "1_155_13",
        "position": { "x_px": -329.4, "y_px": 439.8 },
        "height_px": 51,
        "rotation": { "z_deg": 0 },
        "color": "#000000",
        "flip": { "x": false, "y": false }
      },
      {
        "id": "motif-2",
        "asset": "1_154_15",
        "position": { "x_px": -86.2, "y_px": -382.7 },
        "height_px": 91,
        "rotation": { "z_deg": 73 },
        "color": "#000000"
      }
    ],
    "photos": [],
    "logos": [],
    "additions": []
  },
  "assets": {
    "motifs": [
      { "id": "1_155_13", "path": "/shapes/motifs/1_155_13.svg", "category": "floral" },
      { "id": "1_154_15", "path": "/shapes/motifs/1_154_15.svg", "category": "floral" }
    ]
  }
}
```

### XML / React-friendly form

```xml
<Design version="2026.01" units="mm" id="1725769905504">
  <Scene width="609.6" height="609.6" viewport="1102x689@1" />
  <Headstone productId="124" shape="Curved Gable" texture="/textures/forever/l/G633.webp" />
  <Base width="700" height="100" depth="250" texture="/textures/forever/l/African-Black.webp" />
  <Inscriptions>
    <Inscription id="insc-1" text="PINTO" fontFamily="Garamond" size="63.93" x="1.60" y="232.05" color="#000000" />
    <Inscription id="insc-2" text="May Heaven&#39;s eternal happiness be thine." fontFamily="Garamond" size="21.87" x="5.32" y="144.01" />
    <Inscription id="insc-3" text="TERESA ISABELLA" fontFamily="Garamond" size="21.03" x="127.79" y="-43.17" />
    <!-- etc. -->
  </Inscriptions>
  <Motifs>
    <Motif id="motif-1" asset="1_155_13" x="-181.50" y="-267.18" height="51" color="#000000" />
    <Motif id="motif-2" asset="1_154_15" x="-47.67" y="338.63" height="91" rotation="73" />
  </Motifs>
</Design>
```

The XML tags can be 1:1 mapped to JSX components (`<Headstone />`, `<Inscription />`, ...), satisfying the React-style idea while still being serialisable.

---

## 2. Coordinate & sizing rules

| Concept | Legacy behaviour | New canonical rule |
| --- | --- | --- |
| Units | viewport pixels mixed with DPI | viewport pixels (stage centre) preserved one-to-one |
| Origin | canvas centre, +Y down | canvas centre, +Y down (the loader converts to mm/+Y up at runtime) |
| Scaling | required `init_width`, `init_height`, `device`, `dpr`, browser viewport | derived on load using `scene.viewportPx` × component mm sizes |
| Font size | stored as px (`font`), mm sometimes mismatched in `font_size` | store `font.size_px`; convert to mm only when rendering |
| Motif height | px height tied to viewport | store `height_px` (and flip info); mm computed per surface at runtime |
| Materials | legacy `src/granites/...` paths | mapped to `/textures/...` assets |

Because the canonical file keeps the stage pixels, the 3D Designer now does the millimetre conversion dynamically (using the current catalogue dimensions) when it hydrates the design. This guarantees that any future catalogue change automatically flows through without rewriting the stored layouts.

---

## 3. Legacy→canonical conversion pipeline

The conversion logic mirrors what `loadSavedDesignIntoEditor` already does:

1. **Read base item** (Headstone/Plaque) to capture `width`, `height`, `texture`, `device`, `dpr`, `init_width`, `init_height`, and `navigator` viewport.
2. **Normalise DPR** (force 1.0 for desktop, snap to 1/1.5/2/3/4 for mobile).
3. **Compute pixels-per-mm** using the viewport (e.g. the design used `1102×689` px @ DPR 1 over a 609.6 mm tablet -> 1.8077 px/mm horizontally, 1.1302 px/mm vertically).
4. **Convert each element**:
   - `x_mm = x_px / px_per_mm_x`
   - `y_mm_up = -(y_px / px_per_mm_y)` (negate to adopt Y-up)
   - `size_mm = font_px / px_per_mm_x`
   - propagate rotation, flip, quantity, colours, etc.
5. **Map textures** using the helper in `lib/saved-design-loader-utils.ts` to resolve `/textures/forever/...` or `/textures/phoenix/...`.
6. **Persist** sorted arrays (`inscriptions` sorted by `y_mm_up` descending so "top" lines appear first).
7. **Embed provenance** (original file path, timestamp, hashed label) so that we can always diff canonical vs legacy.

### Example conversion (slug `curved-gable-may-heavens-eternal-happiness-be-thine`)

| Element | x (mm) | y (mm, up) | size (mm) | Notes |
| --- | --- | --- | --- | --- |
| PINTO | 1.60 | **+232.05** | 63.93 | Family name near the crown |
| May Heaven's eternal happiness be thine. | 5.32 | +144.01 | 21.87 | Verse centred below family name |
| TERESA ISABELLA | 127.79 | −43.17 | 21.03 | Right-hand given name |
| JOHN TIMOTHY | −156.88 | −49.26 | 18.51 | Left-hand given name |
| MAY 13, 1927 | −164.73 | −80.04 | 15.14 | Date left column |
| 1_155_13 motif | −181.50 | −267.18 | 51.00 | Lower left floral spray |
| 1_154_15 motif | −47.67 | +338.63 | 91.00 | Upper-left curved spray |

(Values derived via the Python audit script included earlier; the y-sign is flipped relative to the raw JSON.)

---

## 4. What the Designer needs to load

The 3D Designer (and the public HTML preview) only need to:

1. Read `scene.canvas` to size the working plane (it already matches the true millimetres).
2. Load the headstone/base meshes, apply `components.{headstone,base}` dimensions and textures.
3. For each inscription: place text geometry at `position`, use `font.size_mm` for extrusion height, and align according to `align`.
4. For motifs/photos/logos: fetch the SVG/bitmap referenced in `assets`, scale so that the longest side equals `height_mm`, and place at `position`.
5. Ignore `scene.viewportPx` entirely unless we need to debug the original screenshot or regenerate marketing thumbnails.

---

## 5. Next actions

1. **Implement serializer** that emits the JSON structure above (probably in `scripts/` so we can batch process all `ml/*/saved-designs/json/*.json`).
2. **Add optional XML writer** (same data, different view) for the React-style output.
3. **Update loaders** so `DesignPageClient` + the 3D designer read the canonical file first and fall back to legacy only if the new file is missing.
4. **Backfill**: run the serializer on high-traffic designs first (starting with `curved-gable-may-heavens-eternal-happiness-be-thine`), store them under `public/canonical-designs/v2026/`.
5. **Telemetry**: log which version of the schema was used when loading a design so that we can sunset the pixel-based paths when adoption hits ~100%.

This format keeps the React-style readability (`<Headstone>`, `<Inscription>` etc.) while guaranteeing millimetre-accurate positions for both desktop previews and the 3D tooling. Once the serializer is in place we can convert the rest of the dataset and delete the brittle DPI math from the runtime loaders.
