# Motif Overlay Panel - Quick Start

## What Was Created

✅ **MotifOverlayPanel Component** - Full-featured overlay panel for browsing and selecting motifs
✅ **Motif Data Structure** - 49 categories defined in `_data.ts` with translation support
✅ **Motif Loading System** - TypeScript utilities and React hooks for loading motif files
✅ **Select Motifs Route** - `/with-scene/select-motifs` page with integrated panel
✅ **Documentation** - Complete guides for usage and migration

## Files Created/Modified

### New Files
1. `components/MotifOverlayPanel.tsx` - Main overlay component
2. `components/OpenMotifsButton.tsx` - Trigger button
3. `lib/motifs.ts` - Core motif utilities
4. `lib/use-motifs.ts` - React hooks
5. `lib/motifs-example.tsx` - Example component
6. `app/with-scene/select-motifs/layout.tsx` - Route layout
7. `app/with-scene/select-motifs/page.tsx` - Route page
8. `MOTIFS_MIGRATION.md` - Migration guide
9. `MOTIF_OVERLAY_PANEL.md` - Panel documentation
10. `MOTIFS_OVERLAY_QUICK_START.md` - This file

### Modified Files
1. `app/_internal/_data.ts` - Added Motif type and motifs array
2. `lib/headstone-store.ts` - Added 'motifs' to PanelName type

## How to Use

### 1. Open the Panel (4 ways)

**A. Use the Left Sidebar Navigation:**
```
Left Sidebar → Personalization → Select Motifs
```
This is the primary way users will access the panel.

**B. Navigate to the route:**
```
/select-motifs
```

**C. Use the store:**
```typescript
import { useHeadstoneStore } from '#/lib/headstone-store';

const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);
setActivePanel('motifs');
```

**D. Use the button component:**
```typescript
import { OpenMotifsButton } from '#/components/OpenMotifsButton';

<OpenMotifsButton />
```

### 2. Browse Categories
- Search categories using the search bar
- Click any category to view its motifs
- Categories show badges (Traditional, SS, 1 Color, 2 Color)

### 3. Select Motifs
- Click a category to see its motifs
- Initial load shows 50 motifs
- Click "Load More" to see additional motifs
- Click any motif to select it (currently logs to console)

## Panel Features

✅ **Two Views**
- Categories view (49 categories)
- Motifs view (paginated grid)

✅ **Search**
- Real-time category filtering
- Matches name and path

✅ **Pagination**
- Load 50 motifs at a time
- Shows progress counter
- Load more button

✅ **Draggable**
- Drag by header to reposition
- Position persists in localStorage

✅ **Collapsible**
- Click `−` button to collapse
- Double-click header to toggle

✅ **Responsive**
- Mobile-friendly layout
- Adaptive grid columns

## Data Structure

### Motif Categories (49 total)
Defined in `app/_internal/_data.ts`:

```typescript
const motifs: Motif[] = [
  { 
    id: 0, 
    class: "motif", 
    name: "AQUATIC",                    // Translation key
    src: "Animals/Aquatic",             // Path in public/motifs/
    img: "/motifs/whale_002.png",       // Preview image
    traditional: true,                  // Available for traditional
    ss: true,                           // Available for stainless steel
    col2: false,                        // 2-colour motif
    col1: false                         // 1-colour motif
  },
  // ... 48 more categories
];
```

### Motif Files
Located in `public/motifs/[category]/files.txt`:

```
whale_002,dolphin_001,fish_003,turtle_001,...
```

Each file list contains comma-separated filenames (without .png extension).

## Next Steps / TODO

### Integration with 3D Scene
Currently, selecting a motif only logs to console. You need to:

1. **Add Motif to Scene**
   ```typescript
   const handleMotifSelect = (fileName: string) => {
     const filePath = getMotifFilePath(selectedCategoryIndex, fileName);
     // TODO: Add to your 3D scene
     // addMotifToHeadstone(filePath);
   };
   ```

2. **Position & Scale Controls**
   Similar to AdditionOverlayPanel, add:
   - X/Y position sliders
   - Scale slider
   - Rotation slider

3. **Motif Store State**
   Add to headstone store:
   ```typescript
   selectedMotifs: string[]
   motifOffsets: Record<string, MotifOffset>
   addMotif: (fileName: string) => void
   removeMotif: (fileName: string) => void
   ```

## File Locations

### Components
```
components/
├── MotifOverlayPanel.tsx       # Main panel
├── OpenMotifsButton.tsx        # Trigger button
└── SceneOverlayController.tsx  # Base (existing)
```

### Data & Logic
```
lib/
├── motifs.ts                   # Core utilities
├── use-motifs.ts              # React hooks
└── headstone-store.ts         # Store (updated)

app/_internal/
└── _data.ts                   # Data structure (updated)
```

### Routes
```
app/with-scene/select-motifs/
├── layout.tsx                  # Panel wrapper
└── page.tsx                    # Page content
```

### Documentation
```
MOTIFS_MIGRATION.md            # Migration from old system
MOTIF_OVERLAY_PANEL.md         # Complete panel docs
MOTIFS_OVERLAY_QUICK_START.md  # This file
```

## API Reference

### useMotifCategory Hook
```typescript
const {
  files,        // string[] - File names
  totalCount,   // number - Total files
  hasMore,      // boolean - More available?
  isLoading,    // boolean - Loading state
  error,        // Error | null
  loadMore,     // () => Promise<void>
  reload        // () => Promise<void>
} = useMotifCategory({
  categoryIndex: 0,
  formula: 'Laser',
  initialLimit: 50,
  loadMoreIncrement: 50
});
```

### getMotifFilePath Function
```typescript
import { getMotifFilePath } from '#/lib/motifs';

const path = getMotifFilePath(0, 'whale_002');
// Returns: '/motifs/Animals/Aquatic/whale_002.png'
```

### Store Actions
```typescript
import { useHeadstoneStore } from '#/lib/headstone-store';

const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);
setActivePanel('motifs');  // Open
setActivePanel(null);      // Close
```

## Testing

### 1. Test Panel Opens
```bash
# Navigate to:
http://localhost:3000/with-scene/select-motifs
```

### 2. Test Category Load
- Should see 49 categories
- Search should filter categories
- Click category should show motifs

### 3. Test Motif Load
- Should see up to 50 motifs
- Images should lazy load
- "Load More" should fetch next 50

### 4. Test Interactions
- Panel should be draggable
- Panel should collapse/expand
- Back button should work

## Common Issues

### Panel Not Visible
- Check that you're on `/with-scene/select-motifs`
- Or verify `activePanel === 'motifs'`

### No Categories Showing
- Check `data.motifs` in `_data.ts`
- Verify import is correct

### Images Not Loading
- Check files exist in `public/motifs/[category]/`
- Verify `files.txt` contains correct names
- Check browser network tab

### TypeScript Errors
- Run `npm run build` to check
- Verify all imports are correct
- Check `PanelName` type includes 'motifs'

## Quick Commands

```bash
# Start dev server
npm run dev

# Build and check types
npm run build

# View in browser
open http://localhost:3000/with-scene/select-motifs
```

## Support & Documentation

📖 **Full Documentation**: `MOTIF_OVERLAY_PANEL.md`
🔄 **Migration Guide**: `MOTIFS_MIGRATION.md`
💡 **Examples**: `lib/motifs-example.tsx`

---

**Status**: ✅ Ready to use - Integration with 3D scene pending
**Last Updated**: 2025-01-21
