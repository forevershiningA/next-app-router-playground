# Full-Screen Panel Overlay System

**Date:** 2026-01-01  
**Component:** `components/DesignerNav.tsx`

---

## Implementation

Added a full-screen panel overlay system that hides the menu and shows a dedicated panel when certain sections are clicked.

### Behavior

**Before:**
- Clicking "Select Size" expanded controls inline
- Menu items remained visible
- Scrolling required to see full content

**After:**
- Clicking "Select Size" (or Inscriptions/Additions/Motifs) hides the entire menu
- Full sidebar shows only that panel's content
- "Back to Menu" button returns to main menu
- Cleaner, more focused editing experience

---

## UI Structure

### Full-Screen Panel Layout

```
┌─────────────────────────────────┐
│ ← Back to Menu                  │ <- Header
│ Select Size                     │
├─────────────────────────────────┤
│                                 │
│  [Panel Content]                │ <- Full height
│  - Headstone/Base toggle        │
│  - Width/Height sliders         │
│  - Thickness controls           │
│  - etc...                       │
│                                 │
│                                 │
└─────────────────────────────────┘
```

### Menu State
```
When activeFullscreenPanel = null:
  → Show grouped menu navigation
  → Show all menu items

When activeFullscreenPanel = 'select-size':
  → Hide entire menu
  → Show full-screen panel overlay
  → Panel fills entire sidebar
```

---

## Code Changes

### 1. State Management

```typescript
// New state for tracking active panel
const [activeFullscreenPanel, setActiveFullscreenPanel] = useState<string | null>(null);

// Helper functions
const openFullscreenPanel = (slug: string) => {
  setActiveFullscreenPanel(slug);
};

const closeFullscreenPanel = () => {
  setActiveFullscreenPanel(null);
};
```

### 2. Click Handler Update

```typescript
const handleMenuClick = (slug: string, e: React.MouseEvent) => {
  // Sections that open in full-screen mode
  const fullscreenPanels = ['select-size', 'inscriptions', 'select-additions', 'select-motifs'];
  
  if (fullscreenPanels.includes(slug)) {
    e.preventDefault();
    openFullscreenPanel(slug);
  }
  // ... other handlers
};
```

### 3. Panel Rendering

```typescript
{/* Full-Screen Panel Overlay */}
{activeFullscreenPanel && (
  <div className="absolute inset-0 bg-gradient-to-br from-[#3d2817] via-[#2a1f14] to-[#1a1410] z-50">
    {/* Panel Header with Back Button */}
    <div className="p-4 border-b">
      <button onClick={closeFullscreenPanel}>
        ← Back to Menu
      </button>
      <h2>{menuItems.find(item => item.slug === activeFullscreenPanel)?.name}</h2>
    </div>
    
    {/* Panel Content */}
    <div className="flex-1 overflow-y-auto p-4">
      {activeFullscreenPanel === 'select-size' && renderSelectSizePanel()}
      {/* ... other panels */}
    </div>
  </div>
)}

{/* Menu (hidden when panel is active) */}
{!activeFullscreenPanel && (
  <div className="p-4">
    {/* Menu content */}
  </div>
)}
```

### 4. Content Extraction

Created `renderSelectSizePanel()` helper function to:
- Extract size controls from inline rendering
- Reuse same content in full-screen panel
- Keep DRY principle
- Centralize size control logic

---

## Sections with Full-Screen Panels

✅ **Select Size** - Size sliders, thickness controls  
✅ **Inscriptions** - Inscription edit panel  
✅ **Select Additions** - Addition selector  
✅ **Select Motifs** - Motif selection (TODO: complete implementation)

**Regular Navigation (no full-screen):**
- Select Product → Links to `/select-product`
- Select Shape → Links to `/select-shape`
- Select Material → Links to `/select-material`
- Check Price → Links to `/check-price`

---

## Benefits

1. **Focus** - User sees only what they're editing
2. **Clarity** - No distractions from other menu items
3. **Space** - Full sidebar height for content
4. **Simplicity** - Clear path: edit → save → back
5. **Mobile-Friendly** - Better for small screens

---

## User Flow Example

```
1. User clicks "Select Size"
   ↓
2. Menu disappears
   ↓
3. Full-screen "Select Size" panel appears
   ↓
4. User adjusts width/height/thickness
   ↓
5. User clicks "← Back to Menu"
   ↓
6. Returns to grouped menu navigation
```

---

## Technical Details

### CSS Classes

**Panel Overlay:**
- `absolute inset-0` - Fill entire sidebar
- `z-50` - Above menu content
- `flex flex-col` - Vertical layout

**Back Button:**
- Arrow icon (← chevron-left SVG)
- Hover effect for visibility
- Consistent with design system

**Panel Content:**
- `flex-1` - Expand to fill space
- `overflow-y-auto` - Scroll if needed
- `p-4` - Consistent padding

### Z-Index Layers

```
z-50  → Full-screen panel overlay
z-10  → Sticky context header
z-0   → Menu items
```

---

## Future Enhancements

1. **Slide Animation** - Smooth transitions between menu and panel
2. **Keyboard Shortcuts** - ESC to close panel
3. **Breadcrumbs** - Show "Menu > Select Size" path
4. **Auto-Save** - Save changes when closing panel
5. **Panel History** - Back/forward navigation between panels

---

## Testing

- [ ] Click "Select Size" → Panel opens, menu hides
- [ ] Click "Back to Menu" → Menu shows, panel closes
- [ ] Panel scrolls if content exceeds height
- [ ] Size controls work in panel
- [ ] Inscriptions panel works
- [ ] Additions panel works
- [ ] Motifs panel works (when implemented)
- [ ] Regular menu items still navigate correctly

---

## Status

✅ **Implemented for 4 sections**  
✅ **TypeScript compiles without errors**  
⏳ **Awaiting browser testing**  
📝 **Motif panel content needs full implementation**
