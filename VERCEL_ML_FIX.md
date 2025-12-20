# Vercel ML Directory Fix

## Issue
On the live site (forevershining.org), saved designs were not loading and images were not displaying, while they worked correctly on localhost.

### Specific Errors:
1. **Design not found**: Error loading saved design: `Design "1746409927912" not found`
2. **Images not loading**: Preview images on category pages not displaying

## Root Cause
The `.vercelignore` file contained `ml/` on line 11, which prevented Vercel from deploying the entire `public/ml/` directory during builds.

### Why it worked locally:
- Files exist in `public/ml/` on local machine
- Next.js dev server serves them normally

### Why it failed on production:
- Vercel ignores files/directories listed in `.vercelignore`
- The `ml/` directory contains:
  - Design JSON files: `/ml/{mlDir}/saved-designs/json/{designId}.json`
  - Preview images: `/ml/{mlDir}/saved-designs/screenshots/...`

## Solution
Commented out `ml/` from `.vercelignore`:

```diff
# Legacy/unused
-ml/
+# ml/ - COMMENTED OUT: ml/ directory contains required saved-designs JSON and images
legacy/
docs/
```

## Files Changed
- `.vercelignore` - Removed `ml/` from ignore list

## What the ml/ directory contains:
- `/ml/forevershining/saved-designs/` - Forever Shining designs
- `/ml/headstonesdesigner/saved-designs/` - Headstones Designer designs  
- `/ml/bronze-plaque/saved-designs/` - Bronze Plaque designs

Each contains:
- `json/` - Design data files (loaded by `useSavedDesign` hook)
- `screenshots/` - Preview images (used in category pages and design cards)

## Verification
After redeploying to Vercel, check:
1. Design pages load: https://forevershining.org/designs/traditional-headstone/mother-memorial/curved-gable-cross
2. Images display on category pages: https://forevershining.org/designs/traditional-headstone/mother-memorial
3. Design data loads without "not found" errors

## Related Configuration
- `next.config.ts` already has proper headers for `/ml/:path*` (1 week cache)
- `outputFileTracingExcludes` already excludes `public/ml/**/*` only from serverless function bundles (files still publicly accessible)
