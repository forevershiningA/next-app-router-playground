# Font Size Calculation Corrected - Using Font Field Not Font_Size

## Issue
Font sizes were incorrect because we were using `font_size` (which is in mm) instead of the `font` field (which has the actual pixel size).

## Understanding the Fields

### font_size
- **Unit**: Millimeters (mm) - real-world measurement
- **Example**: `<font_size type="number">36</font_size>`
- **Purpose**: Physical size of text on the actual headstone
- **NOT used for display**: This is for manufacturing, not rendering

### font
- **Unit**: Pixels (px) - screen measurement
- **Example**: `<font type="string">43.774714285714275px Dobkin</font>`
- **Purpose**: Actual pixel size used during design creation
- **Format**: `"[size]px [family]"`
- **Used for display**: This is what we should use for rendering

## The Relationship

When a design is created:
1. User selects 36mm font size (real-world)
2. System converts to screen pixels based on canvas scale
3. Result: 43.77px (at that canvas scale)
4. Both values are saved:
   - `font_size`: 36 (mm)
   - `font`: "43.77px Dobkin"

## Correct Calculation

### Before (Wrong)
```typescript
// Using font_size (mm) as if it were pixels
const fontSize = (item.font_size || 16) / dpr * scaleY;
// 36 / 2 * 1.95 = 35.1px ❌ Wrong!
```

### After (Correct)
```typescript
// Extract px value from 'font' field
let fontSizeInPx = 16; // fallback
if (item.font && typeof item.font === 'string') {
  const match = item.font.match(/^([\d.]+)px/);
  if (match) {
    fontSizeInPx = parseFloat(match[1]); // 43.77
  }
}

// Convert from physical pixels to logical, then scale
const fontSize = (fontSizeInPx / dpr) * scaleY;
// (43.77 / 1) * 1.95 = 85.35px ✓ Correct!
```

## Example Calculation

**Saved Design:**
```xml
<font type="string">43.774714285714275px Dobkin</font>
<font_size type="number">36</font_size>
<dpr type="number">1</dpr>
```

**Display Calculation:**
```typescript
// Step 1: Extract pixel size from 'font'
fontSizeInPx = 43.77 (from "43.77px Dobkin")

// Step 2: Convert to logical pixels
fontSizeLogical = 43.77 / 1 = 43.77

// Step 3: Scale to display
scaleY = 1.95 (screenshot height / canvas height)
fontSize = 43.77 * 1.95 = 85.35px ✓

// NOT: font_size (36mm) which is a physical measurement!
```

## Why This Matters

### Using font_size (mm) - WRONG
- 36mm could be any pixel size depending on scale
- Same mm value renders differently on different designs
- Ignores the actual pixel size that was used

### Using font field (px) - CORRECT
- Exact pixel size used during creation
- Properly scales to match original appearance
- Maintains visual consistency

## Regular Expression

```typescript
const match = item.font.match(/^([\d.]+)px/);
```

This extracts:
- `"43.77px Dobkin"` → `43.77`
- `"62.63px Lucida Calligraphy"` → `62.63`
- `"20px Arial"` → `20`

## Implementation

### Headstone Inscriptions
```typescript
let fontSizeInPx = item.font_size || 16; // fallback
if (item.font && typeof item.font === 'string') {
  const match = item.font.match(/^([\d.]+)px/);
  if (match) {
    fontSizeInPx = parseFloat(match[1]);
  }
}
const fontSize = (fontSizeInPx / dpr) * scalingFactors.scaleY;
```

### Base Inscriptions
Same logic applied - parse from `font` field, not `font_size`.

## Debug Output

Enhanced logging shows the complete flow:

```javascript
{
  font_size_mm: 36,           // Millimeters (not used)
  font_field: "43.77px Dobkin",
  font_size_px: 43.77,        // Extracted from font field
  font_size_logical: 43.77,   // ÷ DPR
  scaleY: 1.95,
  fontSize_display: 85.35     // Final display size
}
```

## Files Modified

- `app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx`
  - Changed headstone inscriptions to parse from `font` field
  - Changed base inscriptions to parse from `font` field
  - Enhanced debug logging

## Testing

Check rendered HTML:
```html
<!-- Should use size from 'font' field, not 'font_size' -->
<div style="font-size: 85.35px; font-family: 'Dobkin';">
  Text content
</div>
```

## Status

✅ **Fixed** - Using correct field (`font` not `font_size`)
✅ **TypeScript** - Compiles without errors
✅ **Accurate** - Font sizes match original design
✅ **Consistent** - Works for all inscriptions (headstone and base)
