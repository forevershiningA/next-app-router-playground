# Font Family and Color Selection for Inscriptions

## Features Added

When clicking on an inscription in the headstone preview, users can now:
1. Edit the inscription text (existing)
2. **Select a font family** (NEW)
3. **Select a text color** (NEW)

## Changes Made

### State Management
Added state variables to track font and color selections:
```typescript
const [editedInscriptionFont, setEditedInscriptionFont] = useState<string>('');
const [editedInscriptionColor, setEditedInscriptionColor] = useState<string>('');
const [inscriptionFonts, setInscriptionFonts] = useState<Record<number, string>>({});
const [inscriptionColors, setInscriptionColors] = useState<Record<number, string>>({});
```

### UI Enhancement
The inscription editor now includes:
- **Text input** (textarea) - for editing inscription text
- **Font selector** (dropdown) - for choosing font family
- **Color picker** (grid of color swatches) - for choosing text color
- **Done button** - to close the editor

### Available Fonts
The dropdown includes all fonts from `data.fonts`:
1. Adorable
2. Arial
3. Chopin Script
4. Dobkin
5. Franklin Gothic
6. French Script
7. Garamond
8. Great Vibes
9. Lucida Calligraphy
10. Xirwena

### Available Colors
Color palette includes **49 colors** from `data.colors` and `data.bronzes`:

**Standard Colors (34):**
- Gold/Silver Gilding
- Vibrant colors: Alizarin, Tangerine, Ruby, etc.
- Natural tones: Sherwood Green, Java, Chocolate, etc.
- Pastels: Chantilly, Vis Vis, Wistful, etc.
- Basics: Black, White, Grey

**Bronze Colors (15):**
- Black, Brown, Dark Brown
- Blues: Casino Blue, Navy Blue, Ice Blue, Turquoise
- Greens: Dark Green, Holly Green
- Others: Maroon, Purple, Red, Sundance Pink, Grey, White

### Implementation Details

1. **Font persistence**: Selected fonts are stored per inscription index
2. **Color persistence**: Selected colors are stored per inscription index
3. **Font rendering**: Uses the selected font or falls back to original font
4. **Color rendering**: Uses the selected color or falls back to original color
5. **Visual feedback**: Active color has a dark border and ring effect
6. **Hover effects**: Color swatches scale up on hover
7. **Reset on close**: Font and color selections are cleared when "Done Editing" is clicked

### Code Changes

**File**: `app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx`

1. Added color state variables (lines ~1163-1168)
2. Updated onClick handler to capture current color (line ~2902)
3. Updated color rendering to use selected color (line ~2912)
4. Enhanced UI with color picker grid (lines ~3265-3285)

### User Experience

**Before:**
- Click inscription → Edit text only

**After:**
- Click inscription → Edit text AND select font AND select color
- See all changes reflected immediately on the headstone
- Visual color picker with 49 color options
- Font selection persists until "Done Editing"
- Color selection persists until "Done Editing"

## Color Picker Design

- **8-column grid layout** for easy browsing
- **40x40px color swatches** with hover scale effect
- **Active color indication** with dark border and ring
- **Tooltip on hover** showing color name
- **Combines standard and bronze colors** for maximum choice

## Testing Checklist

- [ ] Click on inscription displays editor
- [ ] Text editing still works
- [ ] Font dropdown shows all 10 fonts
- [ ] Color grid shows 49 color swatches
- [ ] Changing font updates inscription immediately
- [ ] Changing color updates inscription immediately
- [ ] Active color is visually highlighted
- [ ] "Done Editing" clears the editor
- [ ] Multiple inscriptions can have different fonts and colors
- [ ] Font and color changes are visually reflected on headstone

## Verification

✅ TypeScript compilation passes
✅ No breaking changes
✅ Backward compatible with existing inscriptions

