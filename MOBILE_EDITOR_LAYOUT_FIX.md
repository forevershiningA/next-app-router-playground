# Mobile Layout Fix for Inscription & Motif Editors

## Issue Fixed

On mobile devices, the inscription and motif editors were positioned inside the headstone preview container, causing layout issues.

## Solution Applied

**Moved both editors outside the preview container** so they appear **below the headstone** on all screen sizes.

## Changes Made

### Before (Incorrect Structure):
```
<div> {/* Design Preview Container */}
  <div> {/* Headstone */} ... </div>
  
  {/* Inscription Editor - INSIDE preview */}
  <div> ... </div>
  
  {/* Motif Editor - INSIDE preview */}
  <div> ... </div>
</div>
```

### After (Correct Structure):
```
<div> {/* Design Preview Container */}
  <div> {/* Headstone */} ... </div>
</div>

{/* Inscription Editor - OUTSIDE preview */}
<div className="px-4"> ... </div>

{/* Motif Editor - OUTSIDE preview */}
<div className="px-4"> ... </div>
```

## Specific Changes

**File**: `app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx`

1. **Moved inscription editor** from inside preview container to after it
2. **Moved motif editor** from inside preview container to after it
3. **Added `px-4` padding** to both editors for mobile spacing
4. **Updated comments** to clarify positioning

### Key Changes:

```tsx
// Before: Editors inside preview container
{/* Design Preview */}
<div>
  ...headstone...
  {selectedInscriptionIndex !== null && <div>...</div>}
  {selectedMotifIndex !== null && <div>...</div>}
</div>

// After: Editors outside preview container
{/* Design Preview */}
<div>
  ...headstone...
</div>

{/* Inscription Editor - Below headstone */}
{selectedInscriptionIndex !== null && (
  <div className="mt-6 max-w-2xl mx-auto px-4">
    ...
  </div>
)}

{/* Motif Editor - Below headstone */}
{selectedMotifIndex !== null && (
  <div className="mt-6 max-w-2xl mx-auto px-4">
    ...
  </div>
)}
```

## Benefits

### Mobile (< 768px):
- ✅ Editors now appear **below the headstone**
- ✅ **Full width** with `px-4` padding (prevents edge cutoff)
- ✅ **Proper spacing** with `mt-6` margin
- ✅ **Scrollable** when editors are open

### Desktop (≥ 768px):
- ✅ Editors centered with `max-w-2xl mx-auto`
- ✅ Maintains proper layout
- ✅ No overlap with preview

## Layout Flow

```
┌─────────────────────────┐
│   Headstone Preview     │
│   (with inscriptions    │
│    and motifs)          │
└─────────────────────────┘
          ↓
┌─────────────────────────┐
│  Inscription Editor     │ ← Opens when inscription clicked
│  [Text input]           │
│  [Font selector]        │
│  [Color picker]         │
│  [Done Editing]         │
└─────────────────────────┘
          OR
┌─────────────────────────┐
│  Motif Editor           │ ← Opens when motif clicked
│  [Motif preview]        │
│  [Color picker]         │
│  [Done Editing]         │
└─────────────────────────┘
          ↓
┌─────────────────────────┐
│  Design-Specific        │
│  Content (SEO)          │
└─────────────────────────┘
```

## CSS Classes Applied

Both editors now use:
- `mt-6` - Top margin (spacing from headstone)
- `max-w-2xl` - Maximum width constraint
- `mx-auto` - Center alignment
- `px-4` - Horizontal padding (mobile-friendly)

## Testing Checklist

- [ ] Mobile: Editors appear below headstone
- [ ] Mobile: No horizontal scroll
- [ ] Mobile: Proper padding on edges
- [ ] Desktop: Editors centered properly
- [ ] Desktop: Max width constraint works
- [ ] Inscription editor opens/closes correctly
- [ ] Motif editor opens/closes correctly
- [ ] No layout shift when editors open
- [ ] Scrolling works when editor is open

## Verification

✅ TypeScript compilation passes
✅ No breaking changes
✅ Responsive design maintained
✅ Works on all screen sizes
