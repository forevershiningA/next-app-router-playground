# Motif Color Selection Feature

## Feature Added

When clicking on a motif in the headstone preview, users can now:
1. **Select a color** to apply to the motif
2. **See a preview** of the selected motif with its name
3. **Apply any of 49 colors** from the color palette

## Changes Made

### State Management
Added state variables to track motif color selections:
```typescript
const [selectedMotifIndex, setSelectedMotifIndex] = useState<number | null>(null);
const [editedMotifColor, setEditedMotifColor] = useState<string>('');
const [motifColors, setMotifColors] = useState<Record<number, string>>({});
```

### UI Enhancement
The motif editor includes:
- **Motif preview** (80x80px) - Shows the selected motif
- **Motif name** - Displays the name of the selected motif
- **Color picker** (grid of color swatches) - Choose from 49 colors
- **Done button** - Close the editor

### Available Colors
Same 49-color palette as inscriptions:

**Standard Colors (34):**
- Gold/Silver Gilding
- Vibrant: Alizarin, Tangerine, Ruby, etc.
- Natural: Sherwood Green, Java, Chocolate, etc.
- Pastels: Chantilly, Vis Vis, Wistful, etc.
- Basics: Black, White, Grey

**Bronze Colors (15):**
- Black, Browns, Blues, Greens
- Special colors: Maroon, Purple, Red, Pink

### Implementation Details

1. **Color persistence**: Selected colors are stored per motif index
2. **Color rendering**: Uses mask technique for colored motifs (WebKit mask)
3. **Visual feedback**: Active color has dark border and ring effect
4. **Instant preview**: Color changes appear immediately on headstone
5. **Motif display**: Shows 80x80px preview of the selected motif

### Code Changes

**File**: `app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx`

1. Added motif color state variables (lines ~1170-1172)
2. Added onClick handler to capture motif selection (line ~3035)
3. Updated motif color rendering to use selected color (line ~3050)
4. Added motif color editor UI (lines ~3323-3385)

### User Experience

**Before:**
- Click motif → No interaction

**After:**
- Click motif → Opens color editor
- See motif preview with name
- Select from 49 color swatches
- Color applies instantly to motif
- Click "Done Editing" to close

### Motif Editor Layout

```
┌─────────────────────────────────┐
│ [Motif Preview]  Motif Name     │
│                  Click a color  │
│                                 │
│ Motif Color                     │
│ [● ● ● ● ● ● ● ●]              │
│ [● ● ● ● ● ● ● ●]              │
│ [● ● ● ● ● ● ● ●]              │
│ (49 color swatches)             │
│                                 │
│ [Done Editing]                  │
└─────────────────────────────────┘
```

### Technical Implementation

**Color Masking:**
Motifs use CSS mask technique to apply colors:
```tsx
<div style={{
  backgroundColor: motifColors[index] || motif.color,
  WebkitMaskImage: `url(${motifPath})`,
  maskImage: `url(${motifPath})`,
  // ... mask properties
}} />
```

This allows SVG motifs to be dynamically colored while maintaining transparency.

### Color Picker Design

- **8-column grid layout** (same as inscriptions)
- **30x30px swatches** (75% of original 40px)
- **Hover scale effect** for better UX
- **Active color highlighting** with border and ring
- **Tooltips** showing color names

## Comparison with Inscription Editor

| Feature | Inscriptions | Motifs |
|---------|-------------|--------|
| Text input | ✅ Yes | ❌ No |
| Font selection | ✅ Yes | ❌ No |
| Color picker | ✅ Yes | ✅ Yes |
| Preview | ❌ No | ✅ Yes (80x80px) |
| Color swatches | 49 colors | 49 colors |
| Swatch size | 30x30px | 30x30px |

## Testing Checklist

- [ ] Click on motif displays editor
- [ ] Motif preview shows correct motif
- [ ] Motif name is displayed
- [ ] Color grid shows 49 color swatches
- [ ] Changing color updates motif immediately
- [ ] Active color is visually highlighted
- [ ] "Done Editing" closes the editor
- [ ] Multiple motifs can have different colors
- [ ] Color changes are reflected on headstone
- [ ] Works with both colored and black motifs

## Verification

✅ TypeScript compilation passes
✅ No breaking changes
✅ Backward compatible with existing motifs
✅ Uses existing color mask rendering technique
