# Critical Deployment Fix Required

**Date:** 2025-12-19  
**Issue:** Design gallery pages not working on production  
**Affected URLs:** 
- https://forevershining.org/designs/traditional-headstone
- https://forevershining.org/designs/traditional-headstone/biblical-memorial/curved-gable-may-heavens-eternal-happiness-be-thine

---

## Problem Summary

### 1. **Images Not Visible** ✅ FIXED (needs deployment)
All design preview images were not showing on the design gallery pages.

**Root Cause:**  
`next.config.ts` excluded `public/ml/**/*` from deployment via `outputFileTracingExcludes`

**Fix Applied:** Commit `aeba4fadb3`
- Removed `public/ml/**/*` from exclusions
- Added cache headers for `/ml/` paths

### 2. **JSON/XML Files Not Loading** ✅ FIXED (needs deployment)
Design detail pages couldn't load saved design data (JSON) and catalog data (XML).

**Root Cause:**  
Same as above - `public/ml/**/*` exclusion prevented JSON/XML files from being deployed

**Fix Applied:** Same commit `aeba4fadb3`
- Removing the exclusion makes ALL files in `/ml/` accessible
- This includes:
  - `/ml/*/saved-designs/json/*.json` (design data)
  - `/ml/*/saved-designs/xml/*.xml` (catalog data)
  - `/ml/*/saved-designs/screenshots/**/*.jpg` (preview images)

---

## Files Now Accessible on Production

After deployment, these paths will be publicly accessible:

```
/ml/headstonesdesigner/saved-designs/
  ├── json/*.json          ← Design data
  ├── xml/*.xml            ← Catalog data  
  └── screenshots/**/*.jpg ← Preview images

/ml/forevershining/saved-designs/
  ├── json/*.json
  ├── xml/*.xml
  └── screenshots/**/*.jpg

/ml/bronze-plaque/saved-designs/
  ├── json/*.json
  ├── xml/*.xml
  └── screenshots/**/*.jpg
```

---

## What Was Fixed

### Commit: `aeba4fadb3` - "fix: Enable design preview images on production"

**Changes to `next.config.ts`:**

**Before:**
```typescript
outputFileTracingExcludes: {
  '*': [
    'public/ml/**/*',        // ← Blocked ALL ml files
    'public/shapes/**/*',
    'public/additions/**/*',
  ],
},
```

**After:**
```typescript
outputFileTracingExcludes: {
  '*': [
    // 'public/ml/**/*',     // ← REMOVED!
    'public/shapes/**/*',
    'public/additions/**/*',
  ],
},
```

**Added Cache Headers:**
```typescript
{
  source: '/ml/:path*',
  headers: [
    {
      key: 'Cache-Control',
      value: 'public, max-age=604800, stale-while-revalidate=2592000',
    },
  ],
},
```

---

## Action Required

### ⚠️ REDEPLOY TO PRODUCTION

To fix the live site, you need to:

1. **Push the latest commits:**
   ```bash
   git push origin main
   ```

2. **Trigger production deployment:**
   - If using Vercel: Deployment will auto-trigger on push
   - If using other hosting: Manually deploy the latest `main` branch

3. **Verify the fix:**
   - Visit: https://forevershining.org/designs/traditional-headstone
   - Check that preview images are visible
   - Click on a design (e.g., "Curved Gable - May Heavens Eternal Happiness Be Thine")
   - Verify the design loads with all inscriptions and motifs

---

## Expected Results After Deployment

✅ **Design Gallery Pages**
- Preview images visible
- All designs show thumbnails
- Grid layout displays correctly

✅ **Design Detail Pages**
- Design data loads from JSON
- Catalog data loads from XML
- Inscriptions render (including quotes/apostrophes)
- Motifs display
- Photos/additions visible

✅ **Performance**
- Images cached for 1 week
- Stale-while-revalidate for 30 days
- Faster page loads on repeat visits

---

## Bundle Size Impact

**Before:** ML directory excluded, smaller bundle
**After:** ML directory included, larger bundle (~few MB increase)

**Note:** The trade-off is acceptable because:
1. The design gallery feature is critical
2. Cache headers mitigate performance impact
3. Files are static and don't change frequently

---

## Verification Checklist

After deployment, verify:

- [ ] Gallery images visible at `/designs/traditional-headstone`
- [ ] Individual design page loads at `/designs/traditional-headstone/biblical-memorial/curved-gable-may-heavens-eternal-happiness-be-thine`
- [ ] JSON fetch succeeds (check browser DevTools Network tab)
- [ ] XML fetch succeeds (if applicable)
- [ ] Inscriptions render correctly (including apostrophes)
- [ ] Motifs display
- [ ] Photos display (if design has photos)

---

## Related Commits

1. `aeba4fadb3` - Enable design preview images on production
2. `61b709ac4d` - Load shape dimensions when changing plaque shapes
3. `bdfe010967` - Complete plaque support + thickness controls + pricing fixes

All three commits should be deployed together for full functionality.

---

**Status:** ✅ Fixed in code, ⏳ Awaiting production deployment
