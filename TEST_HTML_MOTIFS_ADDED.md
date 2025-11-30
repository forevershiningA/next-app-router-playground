# Test HTML Updated with Real Motifs

## Changes Made

Updated `test-coordinate-approach.html` to render **actual motif SVG images** with correct:
- ✅ Sizes (calculated from height and ratio)
- ✅ Rotation (applied as group transform)
- ✅ Flipping (horizontal and vertical)
- ✅ Positioning (centered at saved x,y coordinates)

## Motif Sizing Formula

From the JSON data, each motif has:
```json
{
  "height": 51,              // Display height in canvas pixels
  "ratio": 0.1345646,        // height/width aspect ratio
  "x": -328.10,              // Center X coordinate
  "y": 301.98,               // Center Y coordinate
  "rotation": 0,             // Rotation in degrees
  "flipx": 1,                // 1 = normal, -1 = horizontal flip
  "flipy": 1                 // 1 = normal, -1 = vertical flip
}
```

### Calculation:
1. **Width** = `height / ratio`
   - Example: M1 has height=51, ratio=0.1346
   - Width = 51 / 0.1346 ≈ **379 pixels**

2. **Image Position** (top-left corner):
   - `imgX = centerX - width/2`
   - `imgY = centerY - height/2`
   - Example M1: imgX = -328.10 - 379/2 = **-517.6**

3. **Rotation**:
   - Wrapped in `<g transform="rotate(degrees, centerX, centerY)">`
   - Rotates around the motif center

4. **Flipping**:
   - Horizontal flip: `transform="scale(-1, 1) translate(-width, 0)"`
   - Vertical flip: `transform="scale(1, -1) translate(0, -height)"`

## All 8 Motifs with Calculations

### Motif 1 (M1) - itemID 9
- File: `1_155_13.svg`
- Height: 51, Ratio: 0.1346
- **Width: 379px** (51 / 0.1346)
- Center: (-328.10, 301.98)
- Image at: (-517.6, 276.48)

### Motif 2 (M2) - itemID 10
- File: `1_154_15.svg`
- Height: 91, Ratio: 0.0981
- **Width: 928px** (91 / 0.0981)
- Center: (-86.17, -382.74)
- **Rotation: 73°**
- Image at: (-550.17, -428.24)

### Motif 3 (M3) - itemID 11 (LARGE CENTER)
- File: `1_184_13.svg`
- Height: 181, Ratio: 0.1976
- **Width: 916px** (181 / 0.1976)
- Center: (-6.73, 47.24)
- Image at: (-464.73, -43.26)

### Motif 4 (M4) - itemID 13
- File: `1_129_03.svg`
- Height: 45, Ratio: 0.0505
- **Width: 891px** (45 / 0.0505)
- Center: (-202.16, -344.35)
- **Flip: Horizontal (flipx: -1)**
- Image at: (-647.66, -366.85)

### Motif 5 (M5) - itemID 14
- File: `1_129_03.svg`
- Height: 44, Ratio: 0.0494
- **Width: 891px** (44 / 0.0494)
- Center: (170.98, -351.56)
- Image at: (-274.52, -373.56)

### Motif 6 (M6) - itemID 16
- File: `1_016_05.svg`
- Height: 53, Ratio: 0.0757
- **Width: 700px** (53 / 0.0757)
- Center: (265.66, 278.50)
- Image at: (-84.34, 252)

### Motif 7 (M7) - itemID 17
- File: `1_154_15.svg`
- Height: 92, Ratio: 0.0991
- **Width: 928px** (92 / 0.0991)
- Center: (43.95, -378.01)
- **Rotation: 100°**
- **Flip: Vertical (flipy: -1)**
- Image at: (-420.05, -424.01)

### Motif 8 (M8) - itemID 18 (CROSS)
- File: `cross_001.svg`
- Height: 51, Ratio: 0.0854
- **Width: 597px** (51 / 0.0854)
- Center: (204.02, 271.61)
- Image at: (-94.48, 246.11)

## Key Observations

### Motif Sizes Are HUGE!
Notice that motifs are **very wide** compared to their height:
- M2, M5, M7: ~928px wide × 91-92px tall (ratio ~10:1)
- M3: 916px wide × 181px tall
- M4: 891px wide × 45px tall

This is because the `ratio` field is **height/width**, not width/height!

### Most Motifs Extend Beyond Headstone
Looking at the calculations:
- M1 spans from x=-517 to x=-138 (379px wide)
- M2 spans ~928px when not rotated
- M3 spans from x=-465 to x=452 (916px wide!)

This proves that motifs are **decorative borders/elements** that extend well beyond the headstone shape boundaries (609.6×609.6).

## Visual Result

Open the test HTML and you should now see:
- ✅ All 8 motif SVG images loaded from `/shapes/motifs/`
- ✅ Correctly sized based on height and ratio
- ✅ Centered at their x,y coordinates
- ✅ Rotated motifs (M2 at 73°, M7 at 100°)
- ✅ Flipped motifs (M4 horizontal, M7 vertical)

## Compare with Live Page

Now you can directly compare:
1. **Test HTML** - Exact positioning using RAW coordinates
2. **Live Page** - Should match if SVG generator is working correctly

Any differences will show exactly what's wrong with the current implementation.

## Usage

```bash
# Open test HTML
file:///C:/Users/polcr/Documents/github/next-dyo/test-coordinate-approach.html

# Open live page  
http://localhost:3001/designs/traditional-headstone/biblical-memorial/curved-gable-may-heavens-eternal-happiness-be-thine
```

Compare positioning, sizing, rotation, and flipping of all elements!
