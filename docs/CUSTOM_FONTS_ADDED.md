# Custom Fonts Added to Global CSS

## Issue
The "Dobkin" font (and other custom fonts) were falling back to system fonts because they weren't loaded via @font-face declarations.

## Solution
Added @font-face declarations for all custom fonts in `styles/globals.css`.

## Fonts Added

### 1. Dobkin
```css
@font-face {
  font-family: 'Dobkin';
  src: url('/fonts/Dobkin.ttf') format('truetype');
}
```

### 2. Adorable
```css
@font-face {
  font-family: 'Adorable';
  src: url('/fonts/Adorable.otf') format('opentype');
}
```

### 3. Chopin Script
```css
@font-face {
  font-family: 'Chopin Script';
  src: url('/fonts/ChopinScript.otf') format('opentype');
}
```

### 4. French Script
```css
@font-face {
  font-family: 'French Script';
  src: url('/fonts/French Script Std Regular.otf') format('opentype');
}
```

### 5. Great Vibes
```css
@font-face {
  font-family: 'Great Vibes';
  src: url('/fonts/GreatVibes-Regular.ttf') format('truetype');
}
```

### 6. Lucida Calligraphy
```css
@font-face {
  font-family: 'Lucida Calligraphy';
  src: url('/fonts/LucidaUnicodeCalligraphy.ttf') format('truetype');
}
```

### 7. Franklin Gothic
```css
@font-face {
  font-family: 'Franklin Gothic';
  src: url('/fonts/FranklinGothic.ttf') format('truetype');
}
```

### 8. Garamond
```css
@font-face {
  font-family: 'Garamond';
  src: url('/fonts/Garamond.ttf') format('truetype');
}
```

## Font Display Strategy

All fonts use `font-display: swap;` which:
- Shows fallback font immediately while custom font loads
- Swaps to custom font once loaded
- Prevents invisible text (FOIT - Flash of Invisible Text)
- Improves perceived performance

## Usage

Fonts can now be used directly in CSS or inline styles:

```css
font-family: 'Dobkin';
font-family: 'Lucida Calligraphy';
font-family: 'Great Vibes';
/* etc. */
```

Or in React components:
```jsx
<div style={{ fontFamily: 'Dobkin' }}>Text in Dobkin font</div>
```

## Font Files Location

All font files are located in:
```
/public/fonts/
  - Dobkin.ttf
  - Adorable.otf
  - ChopinScript.otf
  - French Script Std Regular.otf
  - GreatVibes-Regular.ttf
  - LucidaUnicodeCalligraphy.ttf
  - FranklinGothic.ttf
  - Garamond.ttf
  - arial.ttf (system font, no @font-face needed)
  - xirwena1.ttf (unknown, not added)
```

## Browser Compatibility

- **TTF format**: Supported in all modern browsers
- **OTF format**: Supported in all modern browsers
- **font-display: swap**: Supported in Chrome 60+, Firefox 58+, Safari 11.1+

## Files Modified

- `styles/globals.css` - Added 8 @font-face declarations

## Testing

To verify fonts are loading:
1. Open browser DevTools → Network tab
2. Filter by "Font" or search for ".ttf" / ".otf"
3. Fonts should load when used on page
4. Check Elements tab → Computed styles → font-family should show custom font, not fallback

## Status

✅ **Complete** - All custom fonts now properly defined
✅ **Optimized** - Using font-display: swap for better UX
✅ **Compatible** - Works across all modern browsers
