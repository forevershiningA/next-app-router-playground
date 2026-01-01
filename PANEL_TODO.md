# Panel Navigation Fix - TODO

**Date:** 2026-01-01  
**Status:** Partially Complete

---

## Changes Made ✅

### 1. Back to Menu - No URL Change
- ✅ Click "Back to Menu" → Hides panel, shows menu
- ✅ URL stays the same (e.g., remains on `/select-size`)
- ✅ No navigation triggered

### 2. Menu Click - Opens Panel Without Navigation
- ✅ Click "Select Size" from menu → Opens full-screen panel
- ✅ URL stays the same
- ✅ Menu hides, panel shows

### 3. Auto-Open Disabled
- ✅ Panel no longer auto-opens based on route
- ✅ Manual control only (click menu item to open)

---

## Still TODO ❌

### Complete Select Size Panel Content

**Current State:**
`renderSelectSizePanel()` only shows:
- Headstone/Base toggle
- Placeholder text: "Width: Xmm, Height: Xmm"

**Needed:**
Copy all size controls from inline implementation (lines ~571-1000):
- Width slider with +/- buttons
- Height slider with +/- buttons  
- Thickness slider with +/- buttons
- Style toggle (Upright/Slant or No Border/Border for plaques)
- Base finish dropdown (if applicable)
- All validation logic
- All styling

**Source Location:**
File: `components/DesignerNav.tsx`
Lines: ~571-1000 (search for `fs-size-panel`)

**Action Required:**
1. Find the complete `<div className="fs-size-panel ...">` content
2. Extract all controls between opening and closing div
3. Paste into `renderSelectSizePanel()` function
4. Replace the placeholder content
5. Ensure all variables are in scope

---

## How It Should Work (Final State)

### User Flow:
1. User on any page with menu visible
2. User clicks "Select Size" menu item
3. Panel opens, menu hides, URL stays same
4. User sees FULL Select Size controls:
   - Headstone/Base toggle
   - Width slider
   - Height slider
   - Thickness slider
   - Style options
5. User clicks "← Back to Menu"
6. Panel hides, menu shows, URL stays same

### Same for Other Panels:
- Inscriptions
- Select Additions
- Select Motifs

---

## Testing Checklist

Once complete content is added:

- [ ] Click "Select Size" → Full panel shows (all sliders visible)
- [ ] Adjust width slider → Value updates correctly
- [ ] Adjust height slider → Value updates correctly
- [ ] Adjust thickness slider → Value updates correctly
- [ ] Toggle Headstone/Base → Switches editing context
- [ ] Click "Back to Menu" → Panel hides, menu shows
- [ ] URL never changes during panel open/close
- [ ] All other panels work similarly

---

## Code Reference

### renderSelectSizePanel() Location
File: `components/DesignerNav.tsx`
Line: ~341

### Source Content Location
File: `components/DesignerNav.tsx`
Lines: ~571-1000
Search for: `{isSelectSizePage && !selectedMotifId && !selectedAdditionId && (`

### What to Copy
Everything inside the `<div className="fs-size-panel ...">` 
- Including: Plaque toggle, Style toggle, Width/Height/Thickness sliders
- Excluding: The outer conditional check (already handled)

---

## Current Behavior

✅ Panel opens/closes without URL changes
✅ Back button works correctly
❌ Panel only shows Headstone/Base toggle (incomplete)
❌ No width/height/thickness controls visible

---

## Status

🟡 **Partially Complete**  
Ready for final step: Copy full size controls into renderSelectSizePanel()
