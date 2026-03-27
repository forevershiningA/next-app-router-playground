# Legacy `createJS` 2D Design System

This document describes the old `createJS/`-based designer, with a focus on **how designs are saved and loaded**.

## Scope

- Runtime entry and global wiring (`Dyo.js`)
- Save flow (`Engine.js` -> `Design.js`)
- Load flow (URL `?edit...`, account list actions, XML/asset reconstruction)
- Persistence formats and backend endpoints

---

## 1) High-level architecture

### Core runtime files

- `createJS/Dyo.js`
  - Initializes global `window.dyo`
  - Builds backend paths (for save/load/list/delete/etc.)
  - Parses URL flags like `?product-id...`, `?shape-id...`, `?edit...`
  - Bootstraps `new Engine()` (and optionally `new Engine3d()`)

- `createJS/Engine.js`
  - UI event wiring (menu buttons, account/login gates, save button)
  - Triggers `dyo.design.saveDesign()` and account flows

- `createJS/Design.js`
  - Main persistence logic:
    - list/count saved designs
    - save payload construction and POST
    - delete saved designs
    - load XML and rebuild scene/items
    - create screenshot/image previews used during save/email/quotes

- `createJS/modules/Account.js`
  - Saved design list interactions (`edit`, `buy`, `email`, `more`)
  - Opens popups and routes to `dyo.design.loadDesign()`

### Global state used by persistence

- `dyo.uniqueid` -> timestamp ID used as the save `design_stampid`
- `dyo.monument.design_stampid` -> currently selected saved design ID
- `sessionStorage.customer_email/customer_password/customer_id` -> auth/customer context for save/list/delete APIs
- `dyo.mode` -> `2d` or `3d` (affects save payload and load behavior)

---

## 2) Persistence endpoints and paths

Defined in `Dyo.js` (`paths()`):

- Save: `dyo.path.save_design` -> `.../includes-dyo5/save.php`
- Delete: `dyo.path.delete_design` -> `.../includes-dyo5/delete.php`
- List/count: `get_designs.php`, `get_designs_count.php`
- Design metadata/detail: `get_design_data.php`
- Screenshot/image generation: `create_screenshots5.php`, `create_image.php`
- Generic file read gateway: `rf.php?directory=` (`dyo.path.read_file`)

Saved artifact roots:

- `dyo.path.saved_designs = "saved-designs/"`
- XML: `saved-designs/xml/<design_stampid>.xml`
- Screenshot: `saved-designs/screenshots/<yyyy>/<mm>/<design_stampid>.jpg`
- 3D project file: `saved-designs/p3d/<design_stampid>.p3d`

---

## 3) Save flow (2D-focused)

## Trigger path

1. User clicks menu item `#dyo_save_design` (`Engine.js`).
2. If logged in (`sessionStorage` email/password exists) -> call `dyo.design.saveDesign()`.
3. Otherwise login popup is shown and can resume save as last action.

## `Design.saveDesign()`

- Opens naming dialog (`#design-name`)
- Accept action is bound to `Design.Save()`

## `Design.Save()`

- Validates non-empty name
- Sets `dyo.design.action = "Save"`
- Calls `Design.CreateImage(Design.SaveData)`

## `Design.CreateImage(action)` for 2D

- Renders monument container to canvas
- Crops image (`cropImageFromCanvas` path)
- Converts to JPEG blob
- Uploads to `create_screenshot` endpoint with:
  - `uniqueid`
  - `filename = "front"`
  - `upload` blob
- Calls callback (`SaveData`) after upload completes

## `Design.SaveData()`

Builds full save payload:

- serializes monument root: `dyo.monument.serialize()`
- serializes each item (`Inscription`, `Motif`, `Photo`, `Emblem`, etc.)
- generates XML via `json2xml(json)`
- includes JSON snapshot as `design_data_json`
- attaches pricing HTML and metadata
- posts `FormData` to `dyo.path.save_design`

Important payload fields:

- `design_stampid` (from `dyo.uniqueid`)
- `design_name`, `design_date`
- `design_data` (XML), `design_data_json` (JSON)
- `design_xmlurl` (`saved-designs/xml/<id>.xml`)
- `design_preview` (`saved-designs/screenshots/<date>/<id>.jpg`)
- `design_productid`, `design_price`, `mode`, `country`
- customer fields from `sessionStorage`

On success:

- clears cached list
- reopens account + refreshes saved designs
- marks design saved
- rotates `dyo.uniqueid = Date.now()` for next design

---

## 4) Load flow (2D-focused)

There are two main entry routes into loading.

## A) URL-driven edit load

- `Dyo.js` parses `?edit<stampid>` and stores in `dyo.monument_design_stampid`.
- `Shape.js` picks this up after product setup:
  - moves it to `dyo.monument.design_stampid`
  - seeds `dyo.design.cache.DesignList` with that ID
  - calls `dyo.design.cacheDesigns(true)` -> `loadDesign()`

## B) Account list action load

- In `modules/Account.js`, clicking `design_edit_<id>`:
  - sets `dyo.monument.design_stampid`
  - calls `dyo.design.loadDesign()`

## `Design.loadDesign()`

- In non-account mode: sets edit state, hides canvas, calls `Design.Load(stampid)`
- In account mode: redirects to `index.php?edit<id>` or `index3d.php?edit<id>` based on saved design mode

## `Design.Load(url)`

1. Fetches XML using read-file gateway:
   - `rf.php?directory=../saved-designs/xml/<id>.xml`
2. Parses XML -> internal `design_data[]` array of item records.
3. If saved product differs from current product, redirects with:
   - `?product-id<savedProductId>&edit<id>`
4. Sets `dyo.design.design_data`, updates promo code, rebuilds product shell via `dyo.monument.Product()`.

## Reconstruction (`Design.getElements()`)

After product shell exists, item data is replayed:

- `Base` -> base visibility/settings/texture and flower-pot settings
- `Inscription` -> `new Inscription(...)`
- `Motif` -> SVG load then `new Motif(...)`
- `Photo` -> image load (with timestamp-derived fallback upload path) then `new Photo(...)`
- `Emblem` -> PNG load then `new Emblem(...)`
- `Border` -> product border reconstruction

Asynchronous item/image loads are tracked with `loadQueue`; `loadCompleted()` finalizes once all pending items resolve.

---

## 5) 2D/3D interoperability during load/save

- Saved data contains mode metadata (`design_data[0].mode`, DPR-related fields).
- During load, if saved mode differs from current runtime mode, code redirects to matching entry page:
  - `index.php?edit...` for 2D
  - `index3d.php?edit...` for 3D
- For 3D saves, `SaveData()` also appends `design_data_p3d` via `Engine3D.Controller.saveProject(...)`.
- For 3D loads, `Engine3d.loadProject()` fetches `saved-designs/p3d/<design_stampid>.p3d`.

---

## 6) Design list/account data access

`Design.js` list methods:

- `getDesignsCount()` -> `get_designs_count.php`
- `getDesigns()` -> `get_designs.php`
- `deleteDesign()` -> `delete.php`

Account UI (`modules/Account.js`) uses these lists to wire actions (`edit`, `buy`, `email`, `more`) and to fetch:

- JSON summary (`design/html5/json/<design_stampid>`)
- HTML quote/invoice snippets (`saved-designs/html/<design_stampid>.html`)

---

## 7) Legacy behavior notes

- The system uses timestamp IDs as design primary keys (`design_stampid`).
- Login state and customer context are session-storage based.
- XML is the canonical load artifact for 2D replay; JSON is also persisted for compatibility/debugging.
- File-path handling includes production/test switching and timestamp-based month/year folder derivation for image assets.

---

## 8) Exact legacy transform equations (`Design.getElements()`)

This section captures the concrete numeric mapping used when loaded XML items are converted into replay objects.

Source area: `createJS/Design.js` in `getElements()` around ratio calculation and item mapping.

### 8.1 Inputs used by transform

- Saved design values:
  - `init_width = Number(this.design_data[0].init_width)`
  - `init_height = Number(this.design_data[0].init_height)`
  - optional `dpr = this.design_data[0].dpr` (saved as `_dpr`)
- Runtime values:
  - `dyo.w`, `dyo.h`, `dyo.dpr`

### 8.2 Ratio computation

`ratio` is computed from runtime orientation and DPR conditions:

- Landscape branch (`dyo.w > dyo.h`) and portrait branch use different conditionals.
- If current DPR equals saved DPR, `ratio` is forced to `1`.

Then:

- `ratio_width = (dyo.w / init_width) * ratio`
- `ratio_height = (dyo.h / init_height) * ratio`

### 8.2.1 `Design.getElements()` reference code block (ratio + mapping)

```js
// Simplified from Design.getElements()
let init_width = Number(this.design_data[0].init_width);
let init_height = Number(this.design_data[0].init_height);
let _dpr = this.design_data[0].dpr != undefined ? Number(this.design_data[0].dpr) : 1;
let ratio = 1;

if (dyo.w > dyo.h) {
  if (dyo.dpr > _dpr) {
    ratio = dyo.dpr / _dpr;
  } else {
    if (_dpr > 2.5) {
      ratio = ((init_height / _dpr) / (dyo.h / dyo.dpr)) + (dyo.dpr / _dpr);
    } else {
      if (_dpr > 1.5) {
        ratio = ((init_height / _dpr) / (dyo.h / dyo.dpr));
      } else {
        ratio = dyo.dpr / _dpr;
      }
    }
  }
} else {
  if (dyo.dpr > _dpr) {
    ratio = dyo.dpr / 2;
  } else {
    ratio = dyo.dpr / _dpr;
  }
}

if (Number(dyo.dpr) == Number(_dpr)) ratio = 1;

const ratio_width = (dyo.w / init_width) * ratio;
const ratio_height = (dyo.h / init_height) * ratio;

// Item mapping examples
const inscriptionX = Math.round(ratio_height * Number(d.x));
const inscriptionY = Math.round(ratio_height * Number(d.y));
const motifHeight = Math.round(ratio_height * Number(d.height));
const motifX = Math.round(ratio_height * Number(d.x));
const motifY = Math.round(ratio_height * Number(d.y));
```

### 8.2.2 Runtime debug values captured at load

When debugging parity, capture and compare these runtime values **at `getElements()` load time**:

- `dyo.w`
- `dyo.h`
- `dyo.dpr`
- `init_width` (`this.design_data[0].init_width`)
- `init_height` (`this.design_data[0].init_height`)
- saved `_dpr` (`this.design_data[0].dpr` or fallback `1`)
- computed:
  - `ratio`
  - `ratio_width`
  - `ratio_height`

Suggested debug log shape:

```js
console.log('[LEGACY LOAD DEBUG]', {
  dyo_w: dyo.w,
  dyo_h: dyo.h,
  dyo_dpr: dyo.dpr,
  init_width,
  init_height,
  saved_dpr: _dpr,
  ratio,
  ratio_width,
  ratio_height,
});
```

### 8.2.3 Exact `Design.js` snippets (verbatim) requested for 1:1 mirroring

Below are direct snippets from `createJS/Design.js` `getElements()` for parity work.

#### Ratio + DPR branch (`ratio`, `ratio_width`, `ratio_height`)

```js
let dpr = 1;
let _dpr = 1;
let _mode = "2d";
let allow = true;

dyo.data.init_width = this.design_data[0].width;
dyo.data.init_height = this.design_data[0].height;

let init_width = Number(this.design_data[0].init_width);
let init_height = Number(this.design_data[0].init_height);
var ratio_width = 1, ratio_height = 1, ratio = 1;

if (this.design_data[0].mode != undefined) {
    _mode = this.design_data[0].mode;
}

if (this.design_data[0].dpr != undefined) {
    _dpr = Number(this.design_data[0].dpr);
    dyo._dpr = _dpr;
}

if (dyo.w > dyo.h) {

    console.log("@landscape");

    if (dyo.dpr > dyo._dpr) {
        console.log("@1");
        ratio = dyo.dpr / dyo._dpr;

    } else {
        console.log("@2");
        
        if (dyo._dpr > 2.5) {
            ratio = ((init_height / dyo._dpr) / (dyo.h / dyo.dpr)) + (dyo.dpr / dyo._dpr);
        
        } else {
        
            if (dyo._dpr > 1.5) {
                ratio = dyo._dpr / 2;
                ratio = ((init_height / dyo._dpr) / (dyo.h / dyo.dpr));
                console.log("@b");

            } else {
                ratio = dyo.dpr / dyo._dpr;
                console.log("@b2");
                
            }   
        
        }
    
    }


} else {

    if (dyo.dpr > dyo._dpr) {
        ratio = dyo.dpr / 2;
    } else {
        ratio = dyo.dpr / dyo._dpr;
    }

    console.log("@portrait");

}

if (Number(dyo.dpr) == Number(_dpr)) { ratio = 1 }

ratio_width = (dyo.w / init_width) * (ratio);
ratio_height = (dyo.h / init_height) * (ratio);
```

#### Mapping block (`Inscription`, `Motif`, `Photo`, `Emblem`)

```js
case "Inscription":

    if (this.strip(d.label).length > 0) {

        let regex = `&apos;`;
        let label = d.label;

        if (label.indexOf(regex) > -1) {
            label = label.replaceAll(new RegExp(regex, "gi"), "'");
        }
        
        let font = d.font.split("px");
        font = Number(font[0]) + "px" + font[1];

        data.push({
            "nr": nr,
            "part": d.part,
            "type": d.type,
            "name": d.name,
            "label": label,
            "font": font,
            "font_family": d.font_family,
            "font_size": Number(d.font_size),
            "color": d.color,
            "colorName": d.colorName,
            "color_texture": d.color_texture,
            "side": d.side,
            "flipx": Number(d.flipx),
            "flipy": Number(d.flipy),
            "x": Math.round(ratio_height * Number(d.x)),
            "y": Math.round(ratio_height * Number(d.y)),
            "rotation": Number(d.rotation),
            "itemID": Number(d.itemID),
            "draggable": true
        });

    }

    break;

case "Motif":

    data.push({
        "nr": nr,
        "productid": Number(d.productid),
        "part": d.part,
        "type": d.type,
        "name": d.name,
        "src": d.src,
        "color": d.color,
        "colorName": d.colorName,
        "colorName2": d.colorName2,
        "color_texture": d.color_texture,
        "color_texture2": d.color_texture2,
        "item": d.item,
        "side": d.side,
        "height": Math.round(ratio_height * Number(d.height)),
        "ratio": Number(d.ratio),
        "flipx": d.flipx,
        "flipy": d.flipy,
        "x": Math.round(ratio_height * Number(d.x)),
        "y": Math.round(ratio_height * Number(d.y)),
        "rotation": Number(d.rotation),
        "itemID": Number(d.itemID),
        "draggable": true
    });

    break;

case "Photo":

    let photoObject = {
        "nr": nr,
        "id": Number(d.id),
        "uid": Number(d.uid),
        "part": d.part,
        "type": d.type,
        "name": d.name,
        "src": d.src,
        "shape_url": d.shape_url,
        "path": d.path,
        "item": d.item,
        "mask": Number(d.mask),
        "side": d.side,
        "width": Number(d.width),
        "height": Number(d.height),
        "size": d.size,
        "color": Number(d.color),
        "ratio": Number(d.ratio),
        "flipx": Number(d.flipx),
        "flipy": Number(d.flipy),
        "x": Math.round(ratio_height * Number(d.x)),
        "y": Math.round(ratio_height * Number(d.y)),
        "rotation": Number(d.rotation),
        "itemID": Number(d.itemID),
        "draggable": true
    }

    data.push(photoObject);
    break;

case "Emblem":

    data.push({
        "nr": nr,
        "id": Number(d.id),
        "part": d.part,
        "type": d.type,
        "name": d.name,
        "src": d.src,
        "item": d.item,
        "side": d.side,
        "width": Number(d.width),
        "height": Number(d.height),
        "size": d.size,
        "color": d.color,
        "ratio": d.ratio,
        "flipx": Number(d.flipx),
        "flipy": Number(d.flipy),
        "x": (ratio_height * Number(d.x)),
        "y": Math.round(ratio_height * Number(d.y)),
        "rotation": Number(d.rotation),
        "itemID": Number(d.itemID),
        "draggable": true
    });

    break;
```

#### Motif asset load + `bmp.height` handoff context

```js
case "Motif":

    var img = new Image();
    let item = data[nr].src;

    let i;

    i = "data/svg/motifs/" + item.toLowerCase() + ".svg";

    img.src = i;

    var currentData = data[nr];

    img.onload = () => {

        if (img) {
            var img_width = img.width;
            var img_height = img.height;

            currentData.bmp = img;

            let motif = new Motif(currentData);

            if (currentData.part) {
                dyo.monument.getPartByType(currentData.part).add(motif);
            } else {
                dyo.target.add(motif);
            }
        }
    }
```

### 8.3 Position mapping (critical detail)

For most replayed item types, **both X and Y are scaled using `ratio_height`** (not `ratio_width` for X):

- Inscriptions:
  - `x = Math.round(ratio_height * Number(d.x))`
  - `y = Math.round(ratio_height * Number(d.y))`
- Motifs:
  - same X/Y mapping as above
- Photos:
  - same X/Y mapping as above
- Emblems:
  - `x = (ratio_height * Number(d.x))` (not rounded in this branch)
  - `y = Math.round(ratio_height * Number(d.y))`

This is why parity with legacy output depends on reproducing the same asymmetry and rounding behavior.

### 8.4 Size mapping

- Motif replay height:
  - `height = Math.round(ratio_height * Number(d.height))`
- Inscriptions:
  - legacy replay keeps `font` and `font_size` from saved record; there is no additional explicit `font_size` scaling in this mapping block.
- Photos/Emblems:
  - width/height fields are copied from saved data, while positional placement is scaled using rules above.

### 8.5 Headstone/base dimensions during load

- Headstone dimensions are read directly from saved design metadata:
  - `this.design_data[0].width`
  - `this.design_data[0].height`
  - `this.design_data[0]._length`
- Base dimensions are read from base item (`type === "Base"`) with fallback to defaults if missing/invalid.

So shape/component dimensions are primarily loaded from saved mm values, while item placement is remapped via the `ratio_*` stage transform.

### 8.6 SVG motif width/height calculation (exact legacy behavior)

Legacy motif sizing is a 2-step process:

1. **Load-time preprocessing in `Design.getElements()`**
   - saved motif height is first remapped:
   - `mappedHeight = Math.round(ratio_height * Number(d.height))`
   - saved `ratio` is carried through as-is
   - loaded SVG bitmap is attached as `bmp`

2. **Motif object sizing in `dyo/Motif.js`**
   - Constructor stores:
     - `this.ratio = data.ratio`
     - `this.bmp = data.bmp` (loaded SVG image)
   - In `render()`:
     - if ratio is missing: `this.ratio = this.init_height / this.bmp.height`
     - bitmap local scale is set to `this.ratio`:
       - `this.bitmap.scaleX = this.bitmap.scaleY = this.ratio`
   - Effective motif logical dimensions are:
     - `motifWidth = this.bounds.width * this.ratio`
     - `motifHeight = this.bounds.height * this.ratio`
     - exposed by:
       - `get_width() = Math.round(this.bounds.width * this.ratio)`
       - `get_height() = Math.round(this.bounds.height * this.ratio)`

Important nuance:

- During replay, the transformed `d.height` is **not** directly applied in `render()`; visual size is primarily driven by SVG intrinsic bounds (`bmp.width/height`) and `ratio`.
- The height field is persisted (`serialize(): self.height = this.getHeight()`), and slider/resize operations later enforce:
  - `this.ratio = size / this.bmp.height`
  - screen scale uses monument ratio:
    - `screenScale = dyo.monument.getRatio() * this.ratio`
    - `this.bitmap.scaleX = this.bitmap.scaleY = screenScale`

---

## 9) Containers, positioning, and alignment (`Canvas.js`, `Engine.js`, `Inscription.js`, `Motif.js`)

### 9.1 DOM container stack (`Engine.js` + `Canvas.js`)

`Engine.addContainers()` creates the UI root `.dyo` plus dedicated panel containers:

- `menu-container`, `container-products`, `shapes-container`, `materials-container`, `inscription-container`, `motifs-container`, `account-container`, etc.

`Canvas` then creates display-layer containers:

- `container.canvasParent` (holds `<canvas id="canvas">`)
- `top-container`, `bottom-container`, `crop-container`, `#openfl`
- `common-container` nested in `bottom-container`

So the legacy app has two parallel layer systems:

- DOM panels (navigation/forms/dialogs)
- CreateJS stage content (headstone/items)

### 9.2 Stage origin and center anchoring (`Canvas.getStage`, `Canvas.setSize`)

CreateJS stage container is centered in viewport:

- `stage_container.x = (dyo.dpr * dyo.w) / 2`
- `stage_container.y = (dyo.dpr * use_h) / 2` where `use_h = window.innerHeight - dyo.th`

On resize, same center anchoring is reapplied and the main monument container is re-centered:

- `dyo.monument.container.x = dyo.w / 2`

Canvas pixel buffer and CSS size are also synchronized:

- `canvas.width = dyo.w * dyo.dpr`
- `canvas.height = dyo.h * dyo.dpr`
- style width/height in CSS pixels

### 9.3 Inscription container and text alignment (`Inscription.js`)

Each inscription renders into stage container:

- `this.stage = this.parent.containers["Inscriptions_" + this.side]`
- `this.container = new createjs.Container()`
- `this.stage.addChild(this.container)`

Text anchor is explicit center-center:

- `this.text.textAlign = "center"`
- `this.text.textBaseline = "middle"`

Container transform carries saved placement:

- `this.container.x = this.x`
- `this.container.y = this.y`
- `this.container.scaleX = this.flipx`
- `this.container.scaleY = this.flipy`
- rotation is applied via `this.container.rotation = this.rotation`

Bounds are measured from `measureText`/`actualBoundingBox*` and cached with center registration:

- `cached_container.regX = bounds.width / 2`
- `cached_container.regY = bounds.height / 2`

This is why inscription positioning behaves like center-anchored labels rather than top-left text blocks.

### 9.4 Motif container alignment (`Motif.js`)

Each motif renders into:

- `this.stage = this.parent.containers["Design_" + this.side]`
- `this.container = new createjs.Container()`
- `this.stage.addChild(this.container)`

Bitmap registration is centered at intrinsic SVG image center:

- `bitmap.regX = bmp.width / 2`
- `bitmap.regY = bmp.height / 2`

Container placement/flip:

- `container.x = this.x`
- `container.y = this.y`
- `container.scaleX = this.flipx`
- `container.scaleY = this.flipy`

Scale path:

- local motif ratio controls logical motif size (`this.ratio`)
- rendered screen scale in interactive sizing path uses:
  - `screenScale = dyo.monument.getRatio() * this.ratio`

So motif alignment is center-anchored around `(x,y)`, with size expansion from center.

### 9.5 Monument-to-item coordinate relationship

Items are placed inside part-specific CreateJS containers (`Headstone`/`Base` side containers), while the monument root itself is centered by canvas layout.

Implication for migration:

- preserve center-origin semantics for inscriptions/motifs
- preserve container-level flips/rotation on item groups
- avoid remapping as top-left anchors, or all loaded content will drift

### 9.6 Engine hash routing and panel alignment context

`Engine.events()` binds menu buttons to hash routes (`#add-your-inscription`, `#add-your-motif`, `#design-menu`, etc.).
This drives which DOM panel container is visible while CreateJS item containers remain on stage.

In 3D mode, `#openfl` visibility/opacity toggling is used to shift user focus between stage and account/popup flows.

---

## 10) Additional legacy-load insights from `Monument.js`, `Headstone.js`, and `Shape.js`

These files add critical context for parity work beyond `Design.getElements()` mapping.

### 10.1 There is a second-stage post-load position transform (`Monument.updateMonument`)

After items are reconstructed, `Monument.updateMonument()` can re-apply scaling to item containers:

- baseline scale from viewport vs initial design viewport:
  - landscape: `scale = dyo.h / dyo.design_init_height`
  - portrait: `scale = dyo.w / dyo.h`
  - exact-size fallback: `scale = 1` when init and current match
- then:
  - `item.container.x = item.data.x * scale`
  - `item.container.y = item.data.y * _scale`
- `_scale` is additionally influenced by `dyo.engine.resizing` mode (`width` vs `height`) and `dyo.data.init_width/init_height` tracking.

Implication:

- A design can look correct right after XML replay, then drift after resize/update cycles if this second-stage transform is not mirrored.

### 10.2 Container anchoring is center-origin and DPR-scaled by default (`Shape`)

`Shape` initializes part origin at:

- `this._x = (dyo.dpr * dyo.w) / 2`
- `this._y = (dyo.dpr * dyo.h) / 2`

and creates dedicated front-side item layers:

- `Design_Front`
- `Photos_Front`
- `Motifs_Front`
- `Inscriptions_Front`

Implication:

- Loaded item coordinates are interpreted inside center-anchored part containers, not top-left rooted DOM-like coordinates.

### 10.3 `Headstone.calcShape()` applies base-aware Y offset and repositions all part containers

During shape calculation/update:

- usable viewport is derived from DPR-scaled dimensions with `_ratio = .975`
- when base is enabled:
  - `headstone.y = ((dyo.dpr * dyo.h) / 2) - (baseHeightPx / 2)`
  - `base.y = ((dyo.dpr * dyo.h) / 2) + (headstonePxHeight / 2)`
- without base:
  - `headstone.y = ((dyo.dpr * dyo.h) / 2)`
- all part containers are then moved to `this.x/this.y`.

Implication:

- Legacy parity is sensitive to base-presence and part-level container offsets, not just inscription/motif/photo item math.

### 10.4 Serialized metadata fields used by load ratio/path logic (`Headstone.serialize`)

Headstone serialization stores the runtime context used later during load and replay:

- `init_width = dyo.w`
- `init_height = dyo.h`
- `dpr = dyo.dpr`
- `orientation = landscape|portrait`
- plus timestamp-derived background upload path (`../upload/<yyyy>/<mm>/...`) from `design_stampid` or `uniqueid`.

Implication:

- Missing or mismatched init viewport / DPR / orientation metadata can push designs into different ratio branches and produce parity mismatches.
