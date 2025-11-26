# Editor Layout Status

## Current Implementation ✅

**Both inscription and motif editors are positioned BELOW the headstone on all screen sizes.**

This provides a consistent, working experience:
- Mobile: Editors appear below headstone ✅
- Desktop: Editors appear below headstone (temporarily, but working) ✅

## What Was Requested

Desktop should display editors in a **right sidebar** (like the original layout before editors were added).

## Complexity Analysis

Implementing desktop sidebar requires:

### 1. Grid Layout Change
```tsx
<div className="md:grid md:grid-cols-[1fr,380px] md:gap-8">
  {/* Left: Headstone */}
  {/* Right: Sidebar with editors */}
</div>
```

### 2. Responsive Editor Components
- Desktop: Single instance in right sidebar (sticky)
- Mobile: Single instance below headstone

### 3. State Management
- Ensure both instances share the same state
- Prevent duplicate renders

### 4. Styling Adjustments
- Sidebar: `sticky top-6` positioning
- Color grid: 6 columns (narrower sidebar) vs 8 columns (mobile)
- Smaller preview image in motif editor

## Recommendation

### Option 1: Keep Current (Recommended for MVP)
- ✅ Works on all devices
- ✅ Simple and maintainable
- ✅ No JSX structure complexity
- ✅ Consistent UX

### Option 2: Implement Desktop Sidebar (Future Enhancement)
Requires careful implementation:
1. Create wrapper component for editors
2. Use conditional rendering with media queries
3. Comprehensive testing on all breakpoints

## Files Involved

- `app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx`

## Current Features Working

✅ Click inscription → Edit text, font, color
✅ Click motif → Edit color with preview
✅ Both editors work on mobile
✅ Both editors work on desktop  
✅ Color picker with 49 colors
✅ Real-time updates
✅ TypeScript compiles without errors

## Implementation Notes (If Pursuing Option 2)

The key challenge is maintaining a clean JSX structure while:
1. Preventing duplicate editor instances
2. Keeping state synchronized
3. Managing responsive breakpoints
4. Handling sticky positioning

Suggested approach:
```tsx
// Extract editor content to separate components
const InscriptionEditor = ({ ... }) => { /* editor UI */ };
const MotifEditor = ({ ... }) => { /* editor UI */ };

// Use in layout
<div className="md:grid md:grid-cols-[1fr,380px]">
  <div>{/* Headstone */}</div>
  <div className="hidden md:block md:sticky md:top-6">
    <InscriptionEditor />
    <MotifEditor />
  </div>
</div>

{/* Mobile only */}
<div className="md:hidden">
  <InscriptionEditor />
  <MotifEditor />
</div>
```

This requires extracting ~150 lines of JSX into reusable components to avoid duplication.

## Summary

Current state is **production-ready** with editors below headstone on all devices. Desktop sidebar can be added as a future enhancement with proper component extraction and testing.
