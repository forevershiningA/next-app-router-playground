# Motif Sizing Fix - January 29, 2025

## Summary
Fixed motif sizing inconsistencies between old (MM-based) and new (ratio-based) design formats, and resolved canvas dimension issues with cropped screenshots.

## Problem Discovery

### Issue 1: Headstone Shape Not Centered Horizontally in SVG
- **Design**: `curved-gable-may-heavens-eternal-happiness-be-thine`
- **Problem**: Headstone shape wasn't horizontally centered in the SVG viewBox
- **Root Cause**: Using cropped screenshot dimensions (1066×1077) instead of original canvas dimensions (707×476)
- **Solution**: Needed viewBox Y offset of -30 to center properly

### Issue 2: Motif Sizing Formula Incorrect
- **Initial Problem**: Motifs were sized incorrectly - either too large or too small
- **Discovery**: Two different design formats exist:
  1. **Old Format (MM-based)**: Motifs have `<height type="number">360</height>` in millimeters
  2. **New Format (Ratio-based)**: Motifs have `<ratio type="number">0.098</ratio>` with DPR

### Issue 3: Gods Garden Design Completely Broken
- **URL**: `curved-gable-gods-garden`
- **Problem**: Motifs overlapping, text mispositioned, cross and flowers in wrong places
- **Root Cause**: Old design format (no DPR, MM-based sizing) being processed with new logic

## Technical Findings

### 1. Design Format Detection
Two distinct formats discovered:

#### Old Format (MM-based):
```xml
<item>
  <type>Motif</type>
  <height type="number">360</height>  <!-- Physical height in millimeters -->
  <ratio type="number">0.265</ratio>
  <dpr type="number">1</dpr>  <!-- Or undefined -->
</item>
```

#### New Format (Ratio-based with DPR):
```xml
<item>
  <type>Motif</type>
  <ratio type="number">0.098</ratio>
  <dpr type="number">2.3249998092651367</dpr>
  <init_height type="number">476.002685546875</init_height>
</item>
```

### 2. Old DYO Rendering Logic (from legacy code)
```javascript
// Old DYO used this approach:
this.ratio = this.init_height / this.bmp.height;
this.bitmap.scaleX = this.bitmap.scaleY = this.ratio;
```

Where:
- `init_height` = 100mm (product type default)
- `bmp.height` = motif SVG viewBox height
- Saved ratio already includes user scaling

### 3. Motif Sizing Solutions

#### For MM-based motifs (Old Format):
```typescript
// Get headstone physical dimensions
const headstoneHeightMM = headstoneData?.height || 1200;  // e.g., 609.6mm
const canvasInitHeight = headstoneData?.init_height || 476;  // e.g., 476px

// Calculate px/mm ratio
const pxPerMM = canvasInitHeight / headstoneHeightMM;  // 476 / 609.6 = 0.781

// Convert motif mm to authoring pixels
const heightAuthor = motifHeightMM * pxPerMM;  // 181mm × 0.781 = 141.33px

// Scale to display
const heightPx = heightAuthor * uniformScale;
```

**Example**: 
- Motif: 181mm height
- Headstone: 609.6mm height  
- Ratio: 181/609.6 = 29.7% of headstone
- In pixels: 181 × (476/609.6) = 141.33px authoring size

#### For Ratio-based motifs (New Format):
```typescript
// Check if design has valid DPR
const hasValidDPR = savedDpr && savedDpr > 1.1;

// Apply ratio with DPR if available
const heightAuthor = vh * ratio * (hasValidDPR ? savedDpr : 1);

// Scale to display
const heightPx = heightAuthor * uniformScale;
```

**Example**:
- ViewBox height: 696px
- Ratio: 0.098
- DPR: 2.32
- Authoring size: 696 × 0.098 × 2.32 = 158.3px

### 4. Canvas Dimension Issue

**Problem**: Cropped screenshot dimensions break MM-based designs

**Original Flow**:
1. Design created with canvas 707×476px
2. Screenshot taken and cropped to 1066×1077px (removes white space)
3. Display uses cropped dimensions 1066×1077px
4. MM measurements are relative to ORIGINAL canvas 707×476px
5. **Mismatch**: Motifs sized for 707px canvas displayed on 1066px canvas

**Solution**:
```typescript
// Detect MM-based designs
const hasMMMotifs = designData?.some((item: any) => {
  if (item.type !== 'Motif') return false;
  const motifHeight = item.height ? Number(item.height) : null;
  return motifHeight && motifHeight > 10;
}) || false;

// Use original dimensions for MM-based designs
if (!hasMMMotifs && cropBounds && cropBounds.shouldCrop) {
  initW = cropBounds.croppedWidth;   // Use cropped: 1066×1077
  initH = cropBounds.croppedHeight;
} else if (hasMMMotifs) {
  // Keep original dimensions: 707×476
  logger.log('📐 MM-based design detected - using original canvas dimensions');
}
```

## Implementation Details

### Files Modified
- `DesignPageClient.tsx`
  - Added MM-based motif detection in `scalingFactors` useMemo
  - Conditional canvas dimension logic (original vs cropped)
  - Updated motif sizing calculation with MM and ratio branches

### Screenshot Processing Scripts Created
1. **`scripts/crop-screenshots.js`**
   - Uses Sharp library for auto-cropping
   - Trims white background from saved design screenshots
   - Outputs: `{designId}_cropped.jpg`

2. **`scripts/generate-screenshot-metadata.js`**
   - Generates JSON metadata for cropped screenshots
   - Outputs: `{designId}_cropped.json`
   - Contains:
     ```json
     {
       "original": { "width": 1200, "height": 1400 },
       "cropped": { "width": 1066, "height": 1077 }
     }
     ```

### Key Code Changes

**Motif Sizing Logic** (line ~3158):
```typescript
if (motifHeightMM && motifHeightMM > 10) {
  // Old design with mm dimensions
  const pxPerMM = canvasInitHeight / headstoneHeightMM;
  heightAuthor = motifHeightMM * pxPerMM;
  widthAuthor = heightAuthor * (vw / vh);
} else {
  // New design with ratio
  const hasValidDPR = savedDpr && savedDpr > 1.1;
  widthAuthor = vw * ratio * (hasValidDPR ? savedDpr : 1);
  heightAuthor = vh * ratio * (hasValidDPR ? savedDpr : 1);
}

const widthPx = widthAuthor * uniformScale;
const heightPx = heightAuthor * uniformScale;
```

## Results

### Fixed Designs
✅ **curved-gable-gods-garden** (MM-based)
- Motifs now correctly sized at 30% of headstone height
- No more overlapping or misalignment
- Uses original canvas dimensions (not cropped)

✅ **curved-gable-may-heavens-eternal-happiness-be-thine** (MM-based with DPR)
- Motifs sized using MM measurements
- Headstone shape and motifs proportional
- All elements correctly positioned

### Design Format Compatibility

| Format | Detection | Canvas Dims | Motif Sizing |
|--------|-----------|-------------|--------------|
| **Old (MM-based)** | `height` field > 10mm | Original (707×476) | `mm × px/mm` |
| **New (Ratio + DPR)** | `ratio` field, DPR > 1.1 | Cropped (1066×1077) | `viewBox × ratio × DPR` |
| **Legacy (Ratio only)** | `ratio` field, DPR = 1 | Cropped (1066×1077) | `viewBox × ratio` |

## Testing Recommendations

1. **Test MM-based designs**:
   - Verify motifs are proportional to headstone
   - Check physical measurements (e.g., 181mm = 30% of 609.6mm)
   
2. **Test ratio-based designs**:
   - Ensure motifs haven't changed size
   - Verify DPR multiplication is applied correctly

3. **Test mixed scenarios**:
   - Designs with both old and new motifs (if any exist)
   - Designs with no motifs

## Known Issues

1. **Empty href warnings**: Unrelated React warnings about empty href attributes in page.tsx
2. **DevTools errors**: React DevTools version semver error (cosmetic only)

## Future Improvements

1. **Migrate old designs**: Convert MM-based motifs to ratio-based for consistency
2. **Unified screenshot approach**: Always use cropped dimensions, adjust MM calculations
3. **Better detection**: Use version field or explicit format marker instead of heuristics

## Lessons Learned

1. **Legacy compatibility is critical**: Can't assume all designs use the same format
2. **Physical measurements matter**: MM-based sizing is more accurate than ratio-based
3. **Canvas dimensions affect everything**: Cropped vs original impacts all coordinate systems
4. **DPR tracking started later**: Older designs don't have DPR, must handle gracefully
5. **Screenshot metadata is valuable**: Storing cropped dimensions enables better layout

## References

- Original canvas dimensions: `init_width` × `init_height` from design JSON
- Cropped dimensions: From `{designId}_cropped.json` metadata
- Old DYO logic: `review99.txt` and legacy code analysis
- Physical measurements: Headstone `height` in mm, motif `height` in mm
