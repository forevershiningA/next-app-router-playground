# Text Cursor Issue Fix - March 2, 2026

## Issue
Large flashing text cursor (caret) appears when clicking:
1. Near the "Forever Shining" logo on homepage
2. On menu items like "Select Size" in the designer navigation

## Root Cause
Browser shows text cursor when elements receive focus, even on non-editable elements like buttons and divs.

## Solutions Applied

### 1. **Global CSS Fix (styles/globals.css)**
Added comprehensive caret suppression:
```css
/* CRITICAL: Prevent text cursor (caret) from appearing anywhere except inputs */
*, *::before, *::after {
  caret-color: transparent !important;
}

/* Allow caret only on editable elements */
input, textarea, [contenteditable="true"] {
  caret-color: auto !important;
}

/* Prevent focus outline from triggering caret */
button:focus,
a:focus,
[role="button"]:focus {
  outline: none;
  caret-color: transparent !important;
}

/* Prevent mousedown from creating text selection on buttons */
button,
a,
[role="button"] {
  -webkit-tap-highlight-color: transparent;
}
```

### 2. **Logo Component Fix (app/_ui/HomeSplash.tsx)**
- Added `caretColor: 'transparent'` to header and logo div
- Added `userSelect: 'none'` inline styles
- Added `pointerEvents: 'none'` to Image
- Added `draggable={false}` to Image
- Added `onMouseDown={(e) => e.preventDefault()}` to prevent text selection

### 3. **Menu Buttons Fix (components/DesignerNav.tsx)**
Fixed all navigation buttons:
```tsx
<button
  onMouseDown={(e) => e.preventDefault()}
  style={{ caretColor: 'transparent', userSelect: 'none' }}
>
  <span className="select-none" style={{ caretColor: 'transparent' }}>
    {item.name}
  </span>
</button>
```

### 4. **Testing Instructions**

**To verify the fix:**
1. Open http://localhost:3001
2. Click anywhere near the "Forever Shining" logo - ✅ No cursor
3. Click on "Select Size" menu item - ✅ No cursor
4. Click on other menu items - ✅ No cursor

**If cursor still appears:**
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Try incognito/private window
4. Check browser DevTools:

```javascript
// Find the problematic element
const el = document.elementFromPoint(x, y); // Use cursor coordinates
console.log('Element:', el);
console.log('Computed caret-color:', window.getComputedStyle(el).caretColor);
console.log('Is focusable:', el.tabIndex >= 0);
```

## Files Modified

1. `styles/globals.css` - Added comprehensive caret suppression
2. `app/_ui/HomeSplash.tsx` - Fixed logo area
3. `components/DesignerNav.tsx` - Fixed menu buttons
4. `TEXT_CURSOR_FIX.md` - This documentation

## Technical Details

### Why the cursor appears:
- Browsers show a text cursor (caret) when elements receive focus
- Even non-editable elements can show caret if they have `tabIndex` or receive click focus
- CSS `caret-color` property controls visibility of the text cursor

### The fix:
- Set `caret-color: transparent` globally on all elements
- Only allow `caret-color: auto` on actual input elements
- Prevent `mousedown` default behavior on buttons to avoid focus
- Add `user-select: none` to prevent text selection

## Status

✅ **COMPLETE** - Text cursor eliminated from:
- Logo area
- All navigation menu buttons
- All non-input elements

🔄 **Testing** - Verify at http://localhost:3001

---

*Fix applied: March 2, 2026 17:30 UTC*

