# Vercel Deployment Fix - Design Pages Not Loading

**Date:** 2026-01-01  
**Issue:** Design pages not loading on production (forevershining.org)  
**Affected URLs:** https://forevershining.org/designs/traditional-headstone/biblical-memorial/*

---

## Problem Summary

Design pages work perfectly on localhost but fail on production:
- ✅ **Localhost**: All SVG, HTML, JSON, XML files load correctly
- ❌ **Production**: 404 errors for all `/ml/` directory files

### Root Cause

The `.vercelignore` file was blocking the **entire** `public/ml/` directory (7.6 GB):

```
# Previous .vercelignore (BROKEN)
public/ml/forevershining/
public/ml/headstonesdesigner/
public/ml/bronze-plaque/
```

This prevented Vercel from deploying:
- Design data: `/ml/*/saved-designs/json/*.json` (122 MB)
- Price quotes: `/ml/*/saved-designs/html/*.html` (153 MB)
- Legacy data: `/ml/*/saved-designs/xml/*.xml` (175 MB)
- Screenshot thumbnails: `/ml/*/saved-designs/screenshots/**/*_small.jpg` (308 MB)

---

## Solution: Two-Step Approach

We need to control files at **two different levels**:

### 1. **Vercel Deployment** (.vercelignore)
Controls which files are uploaded to Vercel's CDN.

### 2. **Serverless Function Bundling** (next.config.ts)
Controls which files are bundled into serverless functions.

### The Fix

#### .vercelignore (Deploy only essential files)
```gitignore
# Exclude full-size screenshots (keep only _small.jpg thumbnails)
public/ml/**/screenshots/**/*.jpg
!public/ml/**/screenshots/**/*_small.jpg
```

**Result:** Only thumbnails are deployed (~760 MB total)

#### next.config.ts (Exclude from function bundles)
```typescript
outputFileTracingExcludes: {
  '*': [
    'public/ml/**/*',     // Don't bundle ANY ml files in functions
    'public/shapes/**/*',
    'public/additions/**/*',
  ],
}
```

**Result:** Functions stay under 300 MB limit (ml files served as static assets)

### File Size Breakdown
| File Type | Count | Size | Deploy? |
|-----------|-------|------|---------|
| **JSON** (design data) | 64,634 | 122 MB | ✅ YES |
| **HTML** (price quotes) | 41,664 | 153 MB | ✅ YES |
| **XML** (legacy data) | 22,996 | 175 MB | ✅ YES |
| **_small.jpg** (thumbnails) | 31,705 | 308 MB | ✅ YES |
| **Full-size JPG** | 63,414 | 7,315 MB | ❌ NO |
| **Total Deployed** | - | **~760 MB** | - |
| **Total Excluded** | - | **~7 GB** | - |

### Updated .vercelignore

```gitignore
# Exclude full-size screenshots (keep only _small.jpg thumbnails)
public/ml/**/screenshots/**/*.jpg
!public/ml/**/screenshots/**/*_small.jpg
```

**How it works:**
1. First pattern: Ignore ALL .jpg files in screenshots directories
2. Second pattern: Exception - keep files ending in `_small.jpg`
3. Result: Only thumbnail files are deployed

### Updated next.config.ts

```typescript
outputFileTracingExcludes: {
  '*': [
    'public/ml/**/*',     // Don't bundle in serverless functions
    'public/shapes/**/*',
    'public/additions/**/*',
  ],
}
```

**How it works:**
- Excludes ALL `/ml/` files from serverless function bundles
- Files are still publicly accessible (deployed via .vercelignore rules)
- Keeps function size under 300 MB limit

---

## Verification

The application code already uses thumbnail files correctly:

### lib/extract-design-specs.ts
```typescript
function generateThumbnailPath(designId: string, mlDir: string): string {
  const year = designId.substring(0, 4);
  const month = designId.substring(4, 6);
  
  // Primary path with year/month subdirectories
  return `/ml/${mlDir}/saved-designs/screenshots/${year}/${month}/${designId}_small.jpg`;
}
```

### CategoryPageClient.tsx
```typescript
<img 
  src={designSpecs[design.id].graniteThumb} 
  onError={(e) => {
    // Fallback to path without year/month subdirs
    const fallbackPath = `/ml/${design.mlDir}/saved-designs/screenshots/${design.id}_small.jpg`;
    if (img.src !== fallbackPath) {
      img.src = fallbackPath;
    }
  }}
/>
```

✅ Code uses `_small.jpg` files - **no code changes needed**

---

## Deployment Steps

1. **Commit the .vercelignore change:**
   ```bash
   git add .vercelignore
   git commit -m "fix: Deploy only essential ML files (exclude full-size screenshots)"
   ```

2. **Push to trigger deployment:**
   ```bash
   git push origin main
   ```

3. **Verify on production:**
   - Check design page: https://forevershining.org/designs/traditional-headstone/biblical-memorial/curved-gable-may-heavens-eternal-happiness-be-thine
   - Open DevTools Network tab
   - Verify files load:
     - ✅ `/ml/forevershining/saved-designs/json/{designId}.json`
     - ✅ `/ml/forevershining/saved-designs/html/{designId}-desktop.html`
     - ✅ `/ml/forevershining/saved-designs/screenshots/{year}/{month}/{designId}_small.jpg`

---

## Expected Results After Deployment

### Design Gallery Pages
✅ Category pages load with thumbnail previews  
✅ Granite texture thumbnails visible  
✅ Price quotes display ("From $X,XXX.XX")  

### Individual Design Pages
✅ SVG headstone renders with correct shape  
✅ Inscriptions display with proper positioning  
✅ Motifs render correctly  
✅ Base renders (if design includes base)  
✅ Price quote modal shows full HTML breakdown  

### Performance
✅ Deployment size reduced from 7.6 GB to ~760 MB  
✅ Build completes faster (less to upload)  
✅ Vercel deployment succeeds (within size limits)  
✅ No degradation in visual quality (thumbnails are sufficient)  

---

## Why This Works

1. **Two-level control:**
   - `.vercelignore` controls CDN uploads (excludes full-size JPGs)
   - `outputFileTracingExcludes` prevents function bundling (keeps functions under 300 MB)

2. **Static assets remain accessible:**
   - Files deployed via `.vercelignore` are served from Vercel's CDN
   - No need to bundle them in serverless functions
   
3. **Thumbnails are 64px height** - perfect for category grid cards

4. **Fallback system** - tries year/month path first, then falls back to root

5. **No full-size screenshots needed** - design viewer uses SVG rendering (not raster images)

6. **Vercel .gitignore syntax** - supports `!` negation patterns

---

## Related Issues

- **DEPLOYMENT_FIX_REQUIRED.md** - Previous attempt (removed entire ml/ exclusion - too large)
- **VERCEL_ML_FIX.md** - Previous attempt (commented out ml/ - still too large)

Both previous attempts would have deployed the full 7.6 GB directory, causing deployment failures.

---

## Status

✅ **Fixed in code** - `.vercelignore` updated  
⏳ **Awaiting deployment** - push to trigger Vercel build  
📊 **Expected deployment size**: ~760 MB (down from 7.6 GB)
