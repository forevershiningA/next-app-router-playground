# Saved Designs Rendering - Status Update
**Date:** January 17, 2025  
**Status:** Working - Major Issues Resolved ✅

## What Was Fixed Today

### 1. **Title Generation in Navigation**
- Fixed duplicate shape names in titles (e.g., "Cropped Peak - Cropped Peak...")
- Now generates: `{shapeName} - {categoryTitle}` properly
- Removed shape name from slug when building display title

### 2. **URL Structure Cleanup**
- Removed designID from URLs completely
- No more 301 redirects needed
- Clean URLs only: `/designs/{productType}/{category}/{slug}`

### 3. **Coordinate System & Scaling** ⭐ MAJOR FIX
**The Problem:** 
- Designs were saved in different DPR environments (iPhone DPR 3, Desktop DPR 2.3, etc.)
- Inscriptions and motifs were positioned incorrectly
- Font sizes were wrong
- SVG shapes were squashed or stretched

**The Solution:**
Implemented proper coordinate transformation based on old DYO logic:

```typescript
// Calculate scaling ratios from authoring frame to display
const baseDpr = Number(designData.dpr) || 1;
const curDpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

const viewW_css = canvasWidth;
const viewH_css = canvasHeight;

const physW = viewW_css * curDpr;
const physH = viewH_css * curDpr;

const dprScale = curDpr / baseDpr;

let ratio_width = (viewW_css / initW) * dprScale;
let ratio_height = (viewH_css / initH) * dprScale;

// Apply uniform scaling (contain mode)
const uniformScale = Math.min(ratio_width, ratio_height);
```

### 4. **SVG Shape Rendering**
- Fixed viewBox to use original SVG dimensions (not authoring frame)
- Container now properly sized to maintain SVG aspect ratio
- Texture mapping works correctly
- No more squashing or stretching

### 5. **Inscription Positioning & Sizing**
- Coordinates are in authoring frame space (canvas coordinates)
- Properly transformed to display space using `uniformScale`
- Font sizes extracted from `<font>` tag (e.g., "115.56px Garamond")
- Only replace name/surname inscriptions, preserve poetic phrases
- Fixed rotation transform order

### 6. **Motif Rendering**
- Use `<ratio>` field from XML for proper scaling
- Size calculation: `motifRatio * canvasH * uniformScale`
- Rotation applied correctly
- FlipX/FlipY support added
- Proper positioning relative to headstone

## Key Files Modified

1. **DesignPageClient.tsx** - Main rendering logic
   - `scalingFactors` useMemo - calculates all scaling ratios
   - SVG processing and rendering
   - Inscription and motif positioning

2. **saved-designs-data.ts** - Data structure
   - Title field contains category title
   - URL slugs cleaned up

3. **DesignsTreeNav.tsx** - Navigation
   - Title generation with shape name prefix

## Known Working Designs

✅ http://localhost:3000/designs/traditional-headstone/biblical-memorial/curved-gable-john-headstone
✅ http://localhost:3000/designs/traditional-headstone/mother-memorial/curved-gable-dove-flower

## Remaining Issues / TODO

1. **Auto-cropped Screenshots**
   - Some designs have screenshots that were auto-cropped
   - This affects positioning calculations
   - Example: curved-gable-gods-garden
   - May need to detect and handle cropped screenshots

2. **High DPR Devices (DPR 3+)**
   - iPhone designs with DPR 3 might still have slight sizing issues
   - Example: curved-top-for-god-so-loved-the-world
   - Needs testing on actual devices

3. **Edge Cases**
   - Designs with unusual aspect ratios
   - Designs with missing metadata fields
   - Need comprehensive testing across all 1000+ designs

## Technical Notes for Tomorrow

### Coordinate System Summary
```
Authoring Frame (init_width × init_height)
    ↓ uniformScale
Display Canvas (canvasWidth × canvasHeight)
    
SVG Native Size (e.g., 400×400)
    ↓ scaled to fit authoring frame
Display SVG

Inscriptions/Motifs: Positioned in authoring frame coordinates
    → Multiply by uniformScale to get display position
```

### DPR Handling
- `designDpr` (baseDpr): DPR when design was created/saved
- `currentDpr`: User's current device DPR  
- `dprScale = currentDpr / baseDpr`: Normalization factor
- Used to scale from saved resolution to current resolution

### Formula Reference
```typescript
// Position
displayX = savedX * uniformScale
displayY = savedY * uniformScale

// Font size (already in canvas pixels)
displayFontSize = savedFontSize * uniformScale

// Motif size
displayMotifSize = motifRatio * canvasH * uniformScale
```

## Next Steps

1. **Test all saved designs systematically**
   - Create automated visual regression tests
   - Compare with original screenshots
   - Document any remaining issues

2. **Handle auto-cropped screenshots**
   - Detect if screenshot is cropped
   - Adjust coordinate calculations accordingly

3. **Performance optimization**
   - Lazy load images
   - Optimize SVG rendering
   - Cache processed designs

4. **Documentation**
   - Add inline comments to complex calculations
   - Create developer guide for coordinate system
   - Document data structure requirements

## Git Commit
```
Fix saved design rendering: coordinate system, SVG scaling, motif sizing, and inscription replacement logic
```

---
**Status:** Ready for comprehensive testing across all designs 🚀
