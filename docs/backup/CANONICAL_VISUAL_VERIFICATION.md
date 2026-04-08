# Visual Verification Guide - Canonical Design 1725769905504

**Reference:** See `screen.png` for before/after comparison

## Expected Visual Alignment

### Top Section (Y > 150mm)
✅ **"KLEIN" surname** (Y: 182mm)
- Should be in upper third of headstone
- Centered horizontally
- Large serif font (~102mm size)

✅ **Epitaph** "May Heaven's eternal happiness be thine." (Y: 125mm)
- Below KLEIN, centered
- Smaller font (~32mm)

✅ **Top-left bird** motif-13 (asset: 1_129_03, Y: 254mm)
- Near left edge of curved gable top
- Small bird silhouette (~40mm height)
- Black color

✅ **Top-right bird** motif-14 (asset: 1_129_03, Y: 261mm)
- Near right edge of curved gable top
- Mirrored/flipped from left bird
- Same size and color

✅ **Top-center flower** motif-10 (asset: 1_154_15, Y: 288mm)
- Rotated 73° 
- Larger than birds (~80mm height)
- Near peak of curved gable
- Slightly left of center (X: -47mm)

### Middle Section (Y: -100mm to 150mm)
✅ **Center statue/figure** motif-11 (asset: 1_184_13, Y: -91mm)
- Large central religious figure (~160mm height)
- Vertically centered on headstone
- Slightly left of center (X: -3mm)
- Black silhouette of robed figure

### Lower Section (Y < -100mm)
✅ **Left person info block**
- MIGUEL THOMPSON (Y: -99mm)
- MAY 13, 1927 (Y: -130mm)
- FEB 2, 2024 (Y: -156mm)
- Left-aligned cluster (X: ~-160mm)

✅ **Right person info block**
- BYRON WEBB (Y: -93mm)
- TERESA ISABELLA (Y: -108mm)
- ISABEL WADE (Y: -134mm)
- OCT 2, 1933 (Y: -135mm)
- SEPT 18, 2022 (Y: -161mm)
- Right-aligned cluster (X: ~120-145mm)

✅ **Bottom-left angel** motif-9 (asset: 1_155_13, Y: -317mm)
- Near bottom-left corner
- Small motif (~45mm height)
- Black color

✅ **Bottom-right cross** motif-16 (asset: 1_016_05, Y: -296mm)
- Near bottom-right corner
- Small decorative cross (~47mm height)
- Black color

## Key Verification Points

### 1. Top Edge Alignment
The curved gable top is at Y ≈ 304mm. Elements should NOT exceed this:
- ❌ **Before fix**: Birds at 304-311mm (touching/exceeding edge)
- ✅ **After fix**: Birds at 254-261mm (proper spacing from edge)

### 2. Vertical Spacing
Elements should have natural spacing, not clustered:
- Top birds ~50mm below edge
- Flowers between birds and surname
- Surname in upper third
- Center figure in middle
- Person info blocks in lower third
- Bottom motifs near bottom edge

### 3. Symmetry
- Birds should be symmetrically placed near top corners
- Center figure should be near X=0 (centered)
- Bottom motifs should be in corners

### 4. No Bounds Violations
Console should NOT show:
```
[loadCanonicalDesignIntoEditor] motifs exceed headstone bounds
```

If you see this, coordinates are still incorrect and design falls back to legacy loader.

## Quick Visual Test

1. Start dev server: `npm run dev`
2. Navigate to `/select-size`
3. Wait for design to auto-load
4. Check console for successful load message
5. Visually compare with left side of screen.png:
   - Top: Birds + flower near curved edge
   - Middle: Large center figure
   - Bottom: Person info blocks + corner motifs

## Coordinate System Reference

**Headstone**: 609.6mm × 609.6mm
- **Y range**: -304.8mm (bottom) to +304.8mm (top)
- **X range**: -304.8mm (left) to +304.8mm (right)
- **Origin**: Center of headstone face

**Before fix**: Legacy coords were relative to stage center (headstone+base combined)
**After fix**: Canonical coords are relative to headstone center only

**Offset applied**: All headstone elements shifted -50mm (half the 100mm base height)
