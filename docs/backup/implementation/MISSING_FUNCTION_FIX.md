# Missing Function Fix - getAllSavedDesigns

## Issue
The application was throwing an error:
```
Attempted import error: 'getAllSavedDesigns' is not exported from '#/lib/saved-designs-data'
```

## Root Cause
When we regenerated `lib/saved-designs-data.ts` using the updated scripts, the `getAllSavedDesigns()` helper function was not included in the export list, but it was being used by `components/DesignsTreeNav.tsx`.

## Solution
Added the missing `getAllSavedDesigns()` function to `lib/saved-designs-data.ts`:

```typescript
/**
 * Get all saved designs as an array
 */
export function getAllSavedDesigns(): SavedDesignMetadata[] {
  return Object.values(SAVED_DESIGNS);
}
```

## Files Modified
- ✅ `lib/saved-designs-data.ts` - Added `getAllSavedDesigns()` export

## Verification
The function is now properly exported and can be imported by:
- `components/DesignsTreeNav.tsx`
- Any other component that needs to access all saved designs

## Status
✅ Fixed - The application should now load without errors
