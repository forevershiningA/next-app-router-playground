# Motif Selector Visual Enhancements

**Date:** 2026-01-30  
**Status:** ✅ Complete

---

## Overview

Enhanced motif selector UI to match border selector styling with thicker borders, bronze coloring for products with `color="1"`, and removed unnecessary info card.

---

## Changes Made

### 1. Thicker Borders

Changed all motif card borders from `border` (1px) to `border-2` (2px) to match border selector.

**Files Modified:**
- `components/MotifSelectorPanel.tsx`
  - Line 104: Category cards - `border` → `border-2`
  - Line 186: Individual motif cards - `border` → `border-2`
- `app/select-motifs/_ui/MotifSelectionGrid.tsx`
  - Line 126: Category grid cards - `border-2` (already present)
  - Line 250: Individual motif cards - `border-2` (already present)

```typescript
// Before
className="... border border-white/10 ..."

// After
className="... border-2 border-white/10 ..."
```

---

### 2. Bronze Color for Products with `color="1"`

When product XML has `color="1"`, motif images are now displayed in bronze color (`#CD7F32`) using CSS mask, exactly like border selector.

**Implementation:**

Added logic to check `catalog?.product?.color === '1'` and conditionally render:
- **Bronze colored div with mask** when `color="1"`
- **Standard inverted image** when `color="0"` or undefined

```typescript
const BRONZE_HEX = '#CD7F32';
const allowsColor = catalog?.product?.color === '1';

{allowsColor ? (
  <div
    style={{
      backgroundColor: BRONZE_HEX,
      WebkitMaskImage: `url(${motif.img})`,
      maskImage: `url(${motif.img})`,
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
      WebkitMaskSize: 'contain',
      maskSize: 'contain',
      WebkitMaskPosition: 'center',
      maskPosition: 'center',
    }}
  />
) : (
  <img
    src={motif.img}
    className="filter brightness-0 invert"
  />
)}
```

**Files Modified:**
- `components/MotifSelectorPanel.tsx`
  - Added `BRONZE_HEX` constant
  - Added `allowsColor` check from catalog
  - Applied to category images (lines 106-125)
  - Applied to individual motif images (lines 195-214)
- `app/select-motifs/_ui/MotifSelectionGrid.tsx`
  - Added `BRONZE_HEX` constant
  - Added `allowsColor` check from catalog
  - Applied to category images (lines 133-151)
  - Applied to individual motif images (lines 268-286)

---

### 3. Removed Unnecessary Info Card

Removed the informational card that displayed:
> "Select a motif on the memorial to adjust its properties, or browse the motif library below to add a new engraving."

This card provided no actionable value and took up space.

**File Modified:** `components/DesignerNav.tsx`
- Lines 639-645: Removed entire info card div
- Changed ternary to return `null` when no active motif

```typescript
// Before
) : (
  <div className="...">
    {showMotifCatalog ? '...' : '...'}
  </div>
)}

// After
) : null}
```

---

## Visual Improvements

### Border Thickness
- **Before**: 1px border (subtle, less visible)
- **After**: 2px border (matches border selector, more prominent)

### Bronze Coloring
- **Before**: All products showed white/inverted images
- **After**: Products with `color="1"` show bronze (#CD7F32) images

### Info Card
- **Before**: Static card taking space with redundant text
- **After**: Clean layout, more space for motif catalog

---

## Product Behavior

### Traditional Headstones (`color="1"`)
- ✅ Motif images shown in bronze color
- ✅ Matches border selector aesthetic
- ✅ Professional, cohesive design

### Bronze Plaques (`color="0"`)
- ✅ Motif images shown in white (inverted)
- ✅ No color controls visible
- ✅ Maintains distinct appearance

---

## CSS Mask Technique

The bronze coloring uses CSS masks, same as border selector:

```css
backgroundColor: #CD7F32           /* Bronze color */
WebkitMaskImage: url(...)          /* SVG as mask */
maskImage: url(...)                /* Standard property */
WebkitMaskSize: contain            /* Fit inside */
maskSize: contain                  /* Standard property */
WebkitMaskPosition: center         /* Center the mask */
maskPosition: center               /* Standard property */
```

**Advantages:**
- No image processing needed
- Pure CSS solution
- Works with any SVG
- Consistent with border selector
- Good browser support

---

## Files Modified

1. **`components/MotifSelectorPanel.tsx`**
   - Added `BRONZE_HEX` constant
   - Added `allowsColor` from catalog
   - Changed `border` → `border-2`
   - Added conditional bronze rendering for categories
   - Added conditional bronze rendering for individual motifs

2. **`app/select-motifs/_ui/MotifSelectionGrid.tsx`**
   - Added `BRONZE_HEX` constant
   - Added `allowsColor` from catalog
   - Added conditional bronze rendering for categories
   - Added conditional bronze rendering for individual motifs

3. **`components/DesignerNav.tsx`**
   - Removed info card (lines 639-645)

---

## Testing Checklist

### Visual Tests
- [x] Borders are visibly thicker (2px)
- [x] Bronze color shows for traditional headstones
- [x] White/inverted shows for bronze plaques
- [x] No info card displayed
- [x] Layout clean and spacious
- [x] Hover effects still work properly

### Product Tests
- [x] Traditional Headstone (catalog-id-124.xml, `color="1"`)
  - Motifs display in bronze
- [x] Bronze Plaque (catalog-id-5.xml, `color="0"`)
  - Motifs display in white/inverted
  - No color controls shown

### Responsive Tests
- [x] Desktop: Thicker borders visible
- [x] Tablet: Bronze color renders correctly
- [x] Mobile: Layout adapts properly

---

## Browser Compatibility

CSS Mask properties:
- ✅ Chrome/Edge: Full support with `-webkit-` prefix
- ✅ Firefox: Full support (standard property)
- ✅ Safari: Full support with `-webkit-` prefix
- ✅ Mobile: Full support on iOS/Android

Both prefixed and standard properties included for maximum compatibility.

---

## Performance Impact

- ✅ No performance impact
- ✅ CSS-only solution (no JavaScript)
- ✅ No additional image requests
- ✅ Browser-native rendering
- ✅ No layout shifts

---

## Consistency Achieved

| Feature | Border Selector | Motif Selector | Status |
|---------|----------------|----------------|--------|
| Border thickness | `border-2` | `border-2` | ✅ Consistent |
| Bronze color | `#CD7F32` | `#CD7F32` | ✅ Consistent |
| CSS Mask | ✅ | ✅ | ✅ Consistent |
| Cursor pointer | ✅ | ✅ | ✅ Consistent |
| Hover animation | ✅ | ✅ | ✅ Consistent |
| Grid padding | `p-1` | `p-1` | ✅ Consistent |

---

## Build Status

✅ **Build successful** - No errors  
✅ **Production-ready** - All changes tested  
✅ **TypeScript clean** - No type errors

---

## Related Documentation

- `BRONZE_PLAQUE_COLOR_CONTROL.md` - Color control system
- `MOTIF_SELECTOR_UI_IMPROVEMENTS.md` - Previous UI enhancements
- `components/BorderSelector.tsx` - Reference implementation

---

## Future Enhancements

1. **Animated transitions**: Add smooth color transition when switching products
2. **Preview on hover**: Show enlarged motif preview on category hover
3. **Category badges**: Add count badges showing number of motifs per category
4. **Filter system**: Allow filtering motifs by keywords/tags
