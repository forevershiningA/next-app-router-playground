# Canonical Design - Major Layout Revision (2026-01-26 Afternoon)

**Design:** 1725769905504  
**Issue:** Text too large, positioned too low, bottom motifs not visible

## Key Changes Made

### 1. Text Size Reduction
All text significantly reduced to match original proportions:

| Element | Old Size | New Size | Reduction |
|---------|----------|----------|-----------|
| KLEIN (surname) | 102mm | **70mm** | -31% |
| Epitaph | 35mm | **20mm** | -43% |
| Person names | 30-34mm | **18mm** | -40-47% |
| Dates | 24mm | **14mm** | -42% |

### 2. Vertical Position Adjustments

**Top Section (moved UP):**
- KLEIN: 220mm → **235mm** (+15mm)
- Epitaph: 145mm → **195mm** (+50mm)
- Top birds: 254-261mm → **270mm** (uniform height)
- Top flowers: 288mm → **280mm** (slightly lower)

**Middle Section (moved UP significantly):**
- Center figure (Mary): 25mm → **80mm** (+55mm)

**Person Info Blocks (compressed & moved UP):**
- Names: -73 to -85mm → **-30mm** (~45-55mm UP)
- First dates: -118 to -141mm → **-52 to -70mm** (~48-71mm UP)
- Second dates: -143 to -167mm → **-70 to -88mm** (~55-79mm UP)

**Bottom Motifs (moved UP for visibility):**
- Angel (left): -317mm → **-200mm** (+117mm)
- Crosses (right): -290 to -296mm → **-200mm** (+90-96mm)

### 3. Motif Size Reduction

| Motif | Old Height | New Height | Reduction |
|-------|-----------|-----------|-----------|
| Center figure | 160mm | **110mm** | -31% |
| Top flowers | 80-81mm | **50mm** | -38% |
| Top birds | 39-40mm | **30mm** | -25% |
| Bottom angel/crosses | 45-47mm | **35mm** | -22-26% |

## Visual Layout Now Matches Original

### Top Section
✅ Birds and flowers at very top of curved gable  
✅ KLEIN directly below top motifs (not above)  
✅ Epitaph close to KLEIN (tight spacing)

### Middle Section
✅ Center figure at proper height (between epitaph and names)  
✅ More compact, doesn't dominate the design

### Bottom Section
✅ Person info blocks compressed and moved up  
✅ Bottom motifs (angel, crosses) now VISIBLE  
✅ Better use of entire headstone surface

## Comparison

**Before Revision:**
- Text too large (dominated design)
- Too much white space
- Bottom motifs off screen/not visible
- KLEIN incorrectly above top motifs

**After Revision:**
- Balanced text sizes
- Compact layout matching original
- All elements visible and properly spaced
- Correct hierarchy: motifs → KLEIN → epitaph

## Testing

1. Clear browser cache (\Ctrl+Shift+R\)
2. Navigate to \/select-size\
3. Design loads automatically
4. Should now closely match left panel of screen.png

## Files Modified

- \public/canonical-designs/v2026/1725769905504.json\
  - 9 inscription sizes reduced (30-43% smaller)
  - 10 inscription positions adjusted (30-117mm UP)
  - 6 motif sizes reduced (22-38% smaller)
  - 6 motif positions adjusted (up to 117mm UP)

Total: 31 individual adjustments
