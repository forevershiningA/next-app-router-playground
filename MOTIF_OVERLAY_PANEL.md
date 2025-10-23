# Motif Overlay Panel Documentation

## Overview

The Motif Overlay Panel is a draggable, collapsible overlay that allows users to browse and select motifs from 49 different categories. It follows the same design pattern as other overlay panels in the application (like AdditionOverlayPanel).

## Components Created

### 1. `MotifOverlayPanel.tsx`
**Location**: `components/MotifOverlayPanel.tsx`

Main overlay panel component that displays:
- **Categories View**: Grid of all 49 motif categories with search
- **Motifs View**: Grid of individual motif files with pagination

**Features**:
- ✅ Search categories by name or path
- ✅ Category badges (Traditional, SS, 1 Color, 2 Color)
- ✅ Lazy loading of motif images
- ✅ Load more pagination (50 items at a time)
- ✅ Loading and error states
- ✅ Back navigation from motifs to categories
- ✅ Responsive grid layout

### 2. `OpenMotifsButton.tsx`
**Location**: `components/OpenMotifsButton.tsx`

Simple trigger button to open the motifs panel from anywhere in the app.

### 3. Route Files
**Location**: `app/with-scene/select-motifs/`

- `layout.tsx` - Layout that includes the MotifOverlayPanel
- `page.tsx` - Main page for the select motifs route

## Usage

### Opening the Panel

#### Method 1: Using the Route
Navigate to `/with-scene/select-motifs`

#### Method 2: Using the Store
```typescript
import { useHeadstoneStore } from '#/lib/headstone-store';

function MyComponent() {
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);
  
  return (
    <button onClick={() => setActivePanel('motifs')}>
      Open Motifs
    </button>
  );
}
```

#### Method 3: Using the Button Component
```typescript
import { OpenMotifsButton } from '#/components/OpenMotifsButton';

function MyComponent() {
  return <OpenMotifsButton />;
}
```

### Closing the Panel
Click the close button or press the collapse/expand button on the panel header.

## Panel States

### Categories View
When first opened, the panel shows all 49 motif categories:

```
┌─────────────────────────────────┐
│ Select Motif Category      [−]  │
├─────────────────────────────────┤
│ [Search categories...]          │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🖼️ Aquatic                  │ │
│ │ Animals/Aquatic             │ │
│ │           [Traditional] [SS]│ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🖼️ Birds                    │ │
│ │ Animals/Birds               │ │
│ │           [Traditional] [SS]│ │
│ └─────────────────────────────┘ │
│                                 │
│ ... (49 categories total)       │
└─────────────────────────────────┘
```

### Motifs View
After selecting a category, shows individual motif files:

```
┌─────────────────────────────────┐
│ Motifs: Aquatic            [−]  │
├─────────────────────────────────┤
│ [← Back to Categories]          │
│                                 │
│ Showing 50 of 117 motifs        │
│                                 │
│ ┌──┐┌──┐┌──┐┌──┐              │
│ │🐋││🐟││🐬││🦈│              │
│ └──┘└──┘└──┘└──┘              │
│ ┌──┐┌──┐┌──┐┌──┐              │
│ │🐢││🦞││🐠││⛵│              │
│ └──┘└──┘└──┘└──┘              │
│                                 │
│ [Load More (67 remaining)]      │
└─────────────────────────────────┘
```

## Panel Features

### Draggable
- Drag the panel by clicking and holding the header
- Position is persisted in localStorage
- Automatically clamped to viewport boundaries

### Collapsible
- Click the `−` button to collapse/expand
- Double-click the header to toggle
- State persists across sessions

### Search (Categories View)
- Real-time search filtering
- Matches against category name and path
- Shows count of filtered results

### Pagination (Motifs View)
- Initial load: 50 motifs
- Click "Load More" to fetch additional 50
- Shows progress: "Showing X of Y motifs"
- Efficient loading with lazy images

### Category Badges
Visual indicators for motif properties:
- 🔵 **Traditional** - Available for traditional engraving
- ⚪ **SS** - Available for stainless steel
- 🟣 **1 Color** - Single color raised motif
- 🟣 **2 Color** - Two color raised motif

## Integration Points

### Store Integration
Uses `useHeadstoneStore` for panel state management:

```typescript
const activePanel = useHeadstoneStore((s) => s.activePanel);
const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);
```

The `activePanel` state accepts:
- `'motifs'` - Shows the motif panel
- `null` - Closes all panels

### Motif Loading
Uses the custom `useMotifCategory` hook:

```typescript
const {
  files,           // Array of file names
  totalCount,      // Total files in category
  hasMore,         // More files available?
  isLoading,       // Loading state
  error,           // Error object
  loadMore,        // Load more function
} = useMotifCategory({
  categoryIndex: selectedCategoryIndex,
  formula: 'Laser',
  initialLimit: 50,
  loadMoreIncrement: 50,
});
```

### Image Paths
Uses `getMotifFilePath` to generate correct image URLs:

```typescript
import { getMotifFilePath } from '#/lib/motifs';

const imagePath = getMotifFilePath(categoryIndex, 'whale_002');
// Returns: '/motifs/Animals/Aquatic/whale_002.png'
```

## Styling

### Color Scheme
Matches the existing dark overlay theme:
- Background: `bg-[rgba(0,0,0,0.79)]`
- Text: White with varying opacity
- Accent: Violet (`violet-600`, `violet-700`)
- Hover states: `bg-white/20`

### Responsive Design
- Desktop: 4 columns for motif grid
- Mobile: Adjusted layout with smaller grids
- Max height: `60vh` with scroll

### CSS Classes
```css
/* Category Card */
.group flex items-center space-x-3 rounded-lg bg-white/10 p-3

/* Motif Grid Item */
.group relative aspect-square overflow-hidden rounded-lg border border-white/10

/* Load More Button */
.w-full rounded-lg bg-violet-600 px-4 py-2
```

## Event Handling

### Category Selection
```typescript
const handleCategorySelect = (index: number) => {
  setSelectedCategoryIndex(index);
  setViewMode('motifs');
};
```

### Motif Selection
```typescript
const handleMotifSelect = (fileName: string) => {
  const filePath = getMotifFilePath(selectedCategoryIndex, fileName);
  console.log('Selected:', filePath);
  // TODO: Add motif to 3D scene
};
```

### Panel Close
```typescript
const handleClose = () => {
  setActivePanel(null);
  setViewMode('categories');
  setSelectedCategoryIndex(null);
};
```

## Data Flow

```
User Opens Panel
    ↓
Categories View Loads
    ↓
User Searches/Selects Category
    ↓
useMotifCategory Hook Fetches Files
    ↓
Motifs Grid Displays (50 items)
    ↓
User Clicks "Load More"
    ↓
Additional 50 Items Loaded
    ↓
User Selects Motif
    ↓
handleMotifSelect Called
    ↓
Motif Added to Scene (TODO)
```

## File Structure

```
components/
├── MotifOverlayPanel.tsx       # Main panel component
├── OpenMotifsButton.tsx        # Trigger button
└── SceneOverlayController.tsx  # Base overlay component

app/with-scene/select-motifs/
├── layout.tsx                  # Route layout with panel
└── page.tsx                    # Route page

lib/
├── motifs.ts                   # Core motif utilities
├── use-motifs.ts              # React hooks
└── headstone-store.ts         # Zustand store (updated)

public/motifs/
└── [category]/
    ├── files.txt              # File list
    ├── [filename].png         # Motif images
    └── ...
```

## TODO / Future Enhancements

1. **3D Scene Integration**
   - Add selected motif to the headstone in 3D view
   - Position and scale controls
   - Rotation capabilities

2. **Motif Preview**
   - Larger preview on hover/click
   - Show motif dimensions
   - Color/finish options

3. **Favorites System**
   - Save favorite motifs
   - Quick access to frequently used motifs

4. **Filter Options**
   - Filter by Traditional/SS/Color options
   - Sort by name, date, popularity

5. **Multi-select**
   - Select multiple motifs at once
   - Batch operations

## Performance Considerations

### Image Optimization
- Uses `loading="lazy"` for all images
- Images load only when visible in viewport
- Pagination limits initial load to 50 items

### State Management
- Minimal re-renders with Zustand
- Memoized filtered categories
- Efficient search filtering

### Bundle Size
- Component code-split at route level
- Images loaded on demand
- No unnecessary dependencies

## Accessibility

- ✅ Keyboard navigation support
- ✅ ARIA labels on interactive elements
- ✅ Focus management
- ✅ Screen reader friendly
- ✅ Color contrast compliance

## Browser Compatibility

Tested and working on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Examples

### Example 1: Basic Usage
```typescript
import { useHeadstoneStore } from '#/lib/headstone-store';

function DesignMenu() {
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);

  return (
    <nav>
      <button onClick={() => setActivePanel('shape')}>Shape</button>
      <button onClick={() => setActivePanel('material')}>Material</button>
      <button onClick={() => setActivePanel('motifs')}>Motifs</button>
      <button onClick={() => setActivePanel('additions')}>Additions</button>
    </nav>
  );
}
```

### Example 2: With Navigation
```typescript
'use client';

import { useRouter } from 'next/navigation';

function MotifsLink() {
  const router = useRouter();

  return (
    <button onClick={() => router.push('/with-scene/select-motifs')}>
      Browse Motifs
    </button>
  );
}
```

### Example 3: Programmatic Selection
```typescript
'use client';

import { useEffect } from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';

function AutoOpenMotifs() {
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);

  useEffect(() => {
    // Auto-open motifs panel on mount
    setActivePanel('motifs');
  }, [setActivePanel]);

  return <div>Panel will open automatically</div>;
}
```

## Troubleshooting

### Panel Not Opening
- Check that `activePanel === 'motifs'` in store
- Verify MotifOverlayPanel is rendered in the layout
- Check browser console for errors

### Images Not Loading
- Verify files exist in `public/motifs/[category]/`
- Check `files.txt` contains correct filenames
- Ensure image extensions match (.png)

### Search Not Working
- Clear search input
- Check category names in `_data.ts`
- Verify data.motifs is loaded

### Load More Not Working
- Check network tab for 404 errors
- Verify `files.txt` is accessible
- Check `hasMore` state value

## Support

For issues or questions:
1. Check this documentation
2. Review `MOTIFS_MIGRATION.md`
3. Check component source code
4. Review browser console for errors
