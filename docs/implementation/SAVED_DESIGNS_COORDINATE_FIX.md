# Saved Designs Coordinate System Fix

## Problem
Saved designs from the old DYO tool were loading with inscriptions positioned incorrectly - offset by approximately +600px in both X and Y directions.

## Root Cause
The old system used a different coordinate system:
- **Center-based origin**: (0,0) was at the center of the canvas
- **Container registration**: Used CreateJS container with `regX/regY = width/2, height/2`
- **Pixel-based coordinates**: Positions stored as screen pixels from center
- **DPR-scaled canvas**: Different devicePixelRatio affected rendering

## Solution

### 1. Coordinate Conversion Formula
The key insight is that the saved design contains the pixel-to-mm ratio in the font data:

```javascript
// From saved design:
"font": "27.216768292682925px Arial"  // Canvas pixels
"font_size": 7  // Actual size in mm on product

// Calculate pixels per mm on old canvas:
pixelsPerMm = fontPx / fontSizeMm
// Example: 27.22 / 7 = 3.89 px/mm

// Convert saved position from pixels to mm:
xMm = xPixels / pixelsPerMm
yMm = yPixels / pixelsPerMm

// Convert from center-origin to top-left-origin:
xPos = (productWidth / 2) + xMm
yPos = (productHeight / 2) + yMm
```

### 2. Code Changes

#### `/lib/saved-design-loader-utils.ts`
- Extract pixel size from font string using regex: `/(\d+\.?\d*)px/`
- Calculate `pixelsPerMm = fontPx / fontSizeMm`
- Convert positions using this ratio
- Handle fallback when font pixel info is unavailable

#### `/components/system/RouterBinder.tsx`
- Added check to skip product setup on design pages
- Prevents automatic redirect to `/plaque` or `/headstone`
- Design loader sets the product instead

```javascript
// Skip setting product if we're on a design page
if (currentPath.startsWith('/designs/')) {
  console.log('[RouterBinder] On design page, skipping product ID setup');
  return;
}
```

#### `/app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx`
- Auto-load design on mount using `useEffect` with `useRef` flag
- Show editor by default (`showEditor = true`)
- Include `SceneOverlayHost` for left sidebar
- Display design info below canvas instead of separate page

### 3. URL Structure
Designs now use the pattern:
```
/designs/[productType]/[category]/[slug]
```

Examples:
- `/designs/plaque/commemorative/1607600942580_loved-and-remembered-forever`
- `/designs/headstone/memorial/1234567890_in-loving-memory`

The design ID is extracted from the slug prefix before the first underscore.

## Testing
1. Navigate to a saved design URL
2. Design should auto-load without button click
3. Inscriptions should be positioned correctly relative to product
4. Left sidebar should be visible
5. No redirect to `/plaque` or `/headstone`

## Example Data
From design `1607600942580` (Bronze Plaque 164×80mm):

```json
{
  "width": 164,          // Product width in mm
  "height": 80,          // Product height in mm
  "init_width": 1116,    // Browser window width
  "init_height": 654,    // Browser window height
  "inscriptions": [
    {
      "label": "1972-2020",
      "font": "27.216768292682925px Arial",  // 27.22 pixels
      "font_size": 7,                         // 7 mm
      "x": 7.18,                             // 7.18 pixels from center
      "y": -13.88                            // -13.88 pixels from center
    }
  ]
}
```

Conversion:
- Ratio: 27.22 ÷ 7 = 3.89 px/mm
- X position: 7.18 ÷ 3.89 = 1.85mm from center → 164/2 + 1.85 = 83.85mm from left
- Y position: -13.88 ÷ 3.89 = -3.57mm from center → 80/2 + (-3.57) = 36.43mm from top

## Future Improvements
- Implement motif loading (currently only inscriptions)
- Add photo/image loading support
- Anonymize sensitive data (names, dates)
- Detect and prevent duplicate designs
- Better error handling for malformed data
