# Motif Positioning Issue - AI Debugging Prompt

## Problem Statement

We have a Next.js application that renders saved headstone designs. The designs are loaded from JSON files containing physical dimensions (in mm) and positions. When comparing our rendered output to the original screenshots, **top motifs (decorative elements like crosses, stars, roses) are positioned incorrectly** - they appear either too high (clipped at the top edge) or too low (overlapping with text).

## Context

### Technology Stack
- Next.js 15.5.7 with React 19
- TypeScript
- Canvas-based coordinate system with center origin (0,0 = center of canvas)
- Physical dimensions in millimeters, rendered to screen pixels

### Key Files
- `app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx` - Main rendering component
- Design JSON files at `/ml/forevershining/saved-designs/json/{timestamp}.json`
- Original screenshots at `/ml/forevershining/saved-designs/screenshots/{year}/{month}/{timestamp}_cropped.jpg`

### Working Elements
✅ **Base positioning and sizing** - Works perfectly using formula: `pxPerMm = (initH * uniformScale) / tabletHeightMm`
✅ **Text inscriptions** - Render correctly
✅ **Lower motifs** - Position correctly

### Broken Elements  
❌ **Top motifs** - Positioned incorrectly (too high or too low depending on design)

## Specific Examples

### Example 1: Curved Top Headstone (Design 1630558777652)
- **URL**: http://localhost:3000/designs/traditional-headstone/biblical-memorial/headstone-20-i-shall-dwell-in-the-house-of-the-lord-forever
- **JSON**: /ml/forevershining/saved-designs/json/1630558777652.json
- **Original Screenshot**: /ml/forevershining/saved-designs/screenshots/2021/09/1630558777652_cropped.jpg
- **Issue**: Cross (motif `cross_008`) and star (motif `2_147_18`) are clipped at the top edge
- **Expected**: Should be fully visible within the curved top area
- **Headstone**: 335mm × 500mm, Canvas: 1680px × 873px

### Example 2: Curved Gable Design
- **URL**: http://localhost:3000/designs/traditional-headstone/biblical-memorial/curved-gable-may-heavens-eternal-happiness-be-thine
- **Issue**: Top floral motifs (roses, birds - `1_154_15.svg`) sit too low, overlapping with the name
- **Expected**: Should be positioned higher in the curved gable area, well above the name

## Technical Details

### Coordinate System
```javascript
// Canvas uses center-origin coordinates
// (0, 0) = center of canvas
// Negative Y = above center
// Positive Y = below center

// Example motif position from JSON:
{
  "type": "Motif",
  "src": "cross_008",
  "x": 4,      // mm from center (horizontal)
  "y": -196,   // mm from center (vertical, negative = up)
  "cx": 4,     // Canvas units from center
  "cy": -196,  // Canvas units from center
  "height": 112 // mm
}
```

### Current Rendering Logic (DesignPageClient.tsx, lines 3195-3260)

1. **MM-based sizing** (for designs with mm dimensions):
```javascript
const pxPerMM = canvasInitHeight / headstoneHeightMM; // 873 / 500 = 1.746
const heightAuthor = motifHeightMM * pxPerMM;
const widthAuthor = heightAuthor * aspect;
```

2. **Scale to display**:
```javascript
const widthPx = widthAuthor * uniformScale;  // uniformScale = 0.476
const heightPx = heightAuthor * uniformScale;
```

3. **Position mapping** (SUSPECT - THIS IS WHERE THE BUG LIKELY IS):
```javascript
const left = offsetX + (cx_scaled + initW / 2) * sx;
const top = offsetY + (cy_scaled + initH / 2) * sy;
```

### TopProfile Feature (Currently Failing)
There's a "snap to curved edge" feature that should adjust top motif positions based on the headstone silhouette, but it requires `topProfile` to work:

```javascript
// Lines 3224-3249
if (isTopBand && topProfile) {
  // Adjust motif to sit just below stone edge
  // This would fix positioning but topProfile generation is failing
}
```

**Error in logs**: `❌ Failed to build top profile: Event {isTrusted: true, type: 'error'...}`

### Scaling Factors
```javascript
{
  initW: 1680,           // Canvas width in logical units
  initH: 873,            // Canvas height in logical units  
  uniformScale: 0.476,   // Display scale factor
  displayWidth: 800,     // Container width in pixels
  displayHeight: 415.71, // Container height in pixels
  offsetX: 0,            // Canvas offset from container
  offsetY: 0
}
```

## What We've Tried

1. ✅ **Fixed base sizing** - Used same pxPerMm formula as motifs: `(initH * uniformScale) / tabletHeightMm` = 1.746 px/mm
2. ❌ **Increased container height by 10-20%** - Made headstone too large, broke other designs
3. ❌ **Adjusted viewBox top offset** - Increased from 7.5% to 27.5%, didn't help
4. ❌ **Added safety clamp** - Limited motifs to 35-50% above center, made positioning worse
5. ❌ **Removed clamp** - Reverted to original coordinates, issue persists

## Questions to Investigate

1. **Is the cy → screen pixel conversion correct?**
   - Are we properly accounting for canvas-to-display scaling?
   - Should `cy` be treated differently than `cx` due to aspect ratio?

2. **Is topProfile generation fixable?**
   - Why is the image failing to load?
   - Can we generate topProfile from the SVG instead of a raster image?
   - What's the correct image path?

3. **Are we using the right reference points?**
   - Should motif positions be relative to headstone bounds, not canvas bounds?
   - Is the 335mm × 500mm headstone centered within the 1680 × 873 canvas?

4. **SVG viewBox interaction**
   - The headstone SVG has `viewBox="0 -110.34 400 510.34"` - does this affect motif coordinates?
   - Are motifs rendered inside or outside the SVG container?

5. **Compare working vs broken**
   - Why do lower motifs work but top motifs don't?
   - What's different about their coordinate ranges?

## Success Criteria

✅ Top motifs (crosses, stars, roses, birds) render at **exact same positions** as in original screenshots
✅ No clipping at top edge
✅ No overlap with text/inscriptions
✅ Works across all design types (curved top, gable, flat, etc.)
✅ Maintains current working base and inscription rendering

## Debugging Approach Suggestions

1. **Log comparison**: Compare motif coordinates from JSON vs calculated screen positions vs original screenshot positions
2. **Visual overlay**: Overlay original screenshot on rendered output to see exact pixel differences
3. **Coordinate mapping test**: Create test cases with known coordinates and verify pixel positions
4. **TopProfile fix**: Investigate image loading error and fix topProfile generation
5. **Reference point audit**: Verify all coordinate transformations use consistent reference points

## Files to Examine

1. `app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx` (lines 1733-3500)
2. Design JSON files for coordinates
3. Original screenshots for expected output
4. TopProfile generation code (lines 2150-2220)
5. SVG viewBox adjustment code (lines 2044-2120)

## Expected Output

After fixing, running `git diff` should show minimal changes - ideally just a coordinate calculation fix. The solution should be surgical, not a major refactor.
