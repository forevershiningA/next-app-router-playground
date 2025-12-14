# SEO Templates Backup

## Why these files are here

These large TypeScript files were causing the build time to increase from 3-6 minutes to 16-19 minutes.

### Files Moved (Dec 14, 2025)
- `seo-templates-unified.ts` (24 MB, 577k lines, 4,118 designs)
- `seo-templates-ml.ts` (5.5 MB, ~100k lines)

### Why they were removed from the build
1. **Not imported anywhere** - These files were generated but never used in the application
2. **Massive TypeScript compilation overhead** - TypeScript had to parse and type-check 30MB of data
3. **Bundle size impact** - Would have been included in the production JavaScript bundle
4. **Actual data already exists** - The real JSON files are in `public/ml/*/saved-designs/json/`

### Original Purpose
These files were auto-generated metadata from ML training data sources:
- `public/ml/headstonesdesigner/saved-designs/json/`
- `public/ml/forevershining/saved-designs/json/`
- `public/ml/bronze-plaque/saved-designs/json/`

### How to use the data instead
If you need to query the design metadata, fetch the JSON files directly from the public directory:

```typescript
// Example: Load designs from public directory
const response = await fetch('/ml/headstonesdesigner/saved-designs/json/design-123.json');
const design = await response.json();
```

Or create a lightweight index file with just IDs and metadata, then load full designs on-demand.

### Build Time Impact
- **Before**: 16-19 minutes
- **After**: ~53 seconds (3-6 minutes including all steps)
- **Improvement**: 95% faster ✅

### Can I restore them?
Yes! Just rename the `.bak` files back to `.ts` extensions if needed. However, consider:
1. Creating a proper API route to serve design data
2. Using a database (SQLite, PostgreSQL) for querying
3. Building a search index file instead of loading all data at build time
