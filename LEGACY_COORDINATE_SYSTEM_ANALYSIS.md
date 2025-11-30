# Legacy Coordinate System Analysis

## How Designs Were Created (from src_legacy.zip)

### Canvas Setup
```javascript
// From Shape.js lines 13-14
this._x = (dyo.dpr * dyo.w) / 2;  // Canvas center X in physical pixels
this._y = (dyo.dpr * dyo.h) / 2;  // Canvas center Y in physical pixels

// From Canvas.js lines 488-491
canvas.width = dyo.w * dyo.dpr;   // Physical canvas width
canvas.height = dyo.h * dyo.dpr;  // Physical canvas height
canvas.style.width = dyo.w + "px";   // Logical display width
canvas.style.height = dyo.h + "px";  // Logical display height
```

**Key Insight:** The canvas was rendered at `width * DPR` but displayed at `width` px.

### Coordinates Storage
All elements (inscriptions, motifs) had their positions stored relative to **canvas center (0, 0)** in **PHYSICAL pixels** (logical position * DPR).

### Design Loading (Design.js lines 2097-2162)
```javascript
dyo.data.init_width = this.design_data[0].width;     // Physical mm
dyo.data.init_height = this.design_data[0].height;   // Physical mm

let init_width = Number(this.design_data[0].init_width);   // Canvas px
let init_height = Number(this.design_data[0].init_height); // Canvas px

// Calculate ratio based on DPR mismatch
ratio_width = (dyo.w / init_width) * (ratio);
ratio_height = (dyo.h / init_height) * (ratio);
```

**Critical Discovery:** When loading a design, coordinates were scaled by:
1. DPR ratio between authoring device and viewing device
2. Canvas size ratio if dimensions changed

### The Truth About Saved Coordinates

**Design 1578016189116 Example:**
- Saved on device with DPR = ? (unknown, stored in JSON as `null`)
- `init_width`: 1126 px (canvas width)
- `init_height`: 561 px (canvas height)  
- `width`: 1200 mm (physical stone)
- `height`: 1200 mm (physical stone)
- Inscription x: -10, y: 221

**The coordinates (-10, 221) are:**
- ✅ Relative to canvas center (563, 280.5)
- ✅ In PHYSICAL pixels if DPR was used
- ✅ Should position at (563-10, 280.5+221) = (553, 501.5) in canvas

**Design 1725769905504 Example:**
- `init_width`: 707 px
- `init_height`: 476 px
- `width`: 609.6 px (headstone in PIXELS, not mm)
- `height`: 609.6 px

## The Problem with Current SVG Generator

Our current approach doesn't handle:
1. **DPR scaling** - coordinates might be at 2x or 3x physical pixels
2. **Headstone vs Canvas mismatch** - physical stone might extend beyond visible canvas
3. **Mixed units** - some designs use px for headstone, others use mm

## Correct SVG Generation Logic

```typescript
// 1. ViewBox = Canvas dimensions (what was visible during authoring)
viewBox = `0 0 ${init_width} ${init_height}`

// 2. Determine if we need DPR adjustment
const dpr = headstone.dpr || 1;
const coordinateDivisor = dpr; // Divide coords by DPR to get logical position

// 3. Determine headstone scale
const headstoneW_mm = headstone.width;
const headstoneH_mm = headstone.height;
const isMillimeters = headstoneH_mm > init_height * 1.5;

if (isMillimeters) {
  // Headstone is larger than canvas - fit it in
  scale = Math.min(init_width / shapeWidth, init_height / shapeHeight);
  offsetX = (init_width - shapeWidth * scale) / 2;
  offsetY = (init_height - shapeHeight * scale) / 2;
} else {
  // Headstone dimensions are in pixels - scale to headstone size
  scale = Math.min(headstoneW_px / shapeWidth, headstoneH_px / shapeHeight);
  offsetX = (init_width - headstoneW_px) / 2;
  offsetY = (init_height - headstoneH_px) / 2;
}

// 4. Position elements
centerX = init_width / 2;
centerY = init_height / 2;

// Coordinates from JSON are in physical pixels, divide by DPR
textX = centerX + (inscription.x / dpr);
textY = centerY + (inscription.y / dpr);
```

## Why This Is The Correct Approach

1. **ViewBox matches authoring canvas** - what the user saw when creating
2. **Coordinates divided by DPR** - convert physical pixels to logical  
3. **Shape scaled appropriately** - handles both mm and px headstone dimensions
4. **Everything in same coordinate space** - canvas coordinates (0 to init_width/height)

This matches exactly how the legacy system worked!
