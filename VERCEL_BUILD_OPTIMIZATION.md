# Vercel Build Performance Optimization

## Current Issue
Build times: 21-31+ minutes (should be 3-10 minutes)

## Root Causes
1. **Three.js compilation** - Large 3D library being compiled from scratch
2. **69 static pages** being generated during build
3. **MDX processing** - CodeHike syntax highlighting is slow
4. **No build cache reuse** between commits

## Immediate Actions

### 1. Enable Turbopack (Already configured but verify)
```typescript
// next.config.ts
turbopack: { root: process.cwd() }
```

### 2. Reduce Static Generation
Currently generating 69 pages. Consider:
- Move some routes to dynamic rendering
- Use on-demand ISR instead of build-time generation

### 3. Optimize Dependencies

**Heavy packages:**
- `@react-three/drei` - 3D helpers
- `@react-three/fiber` - Three.js React renderer  
- `@react-three/postprocessing` - Effects
- `codehike` - MDX code highlighting
- `sharp` - Image processing

**Optimization:**
```bash
# Install sharp natively (faster than bundled)
pnpm add sharp --platform=linux --arch=x64
```

### 4. Vercel Build Settings
In Vercel dashboard → Settings → Build & Development:
- ✅ Enable caching
- ✅ Use Node.js 20.x (faster than 24.x for builds)
- ✅ Increase build timeout if needed

### 5. Reduce TypeScript Checking
Already set but verify:
```typescript
typescript: { ignoreBuildErrors: true }
eslint: { ignoreDuringBuilds: true }
```

### 6. Exclude More from Serverless Bundle
```typescript
outputFileTracingExcludes: {
  '*': [
    'node_modules/@swc/**/*',
    'node_modules/three/**/*',       // Add Three.js source
    'node_modules/esbuild/**/*',
    '.next/cache/**/*',
  ]
}
```

## Monitoring

### Check Build Speed
```bash
# Local build with timing
NEXT_TELEMETRY_DISABLED=1 time pnpm build
```

### Analyze Bundle
```bash
# Install bundle analyzer
pnpm add -D @next/bundle-analyzer

# Use it
ANALYZE=true pnpm build
```

## Expected Results
With optimizations:
- Target: 5-8 minutes total build time
- Acceptable: 10-12 minutes  
- Current: 21-31 minutes ❌

## Current Build Breakdown (from logs)
- Cloning: 3 min ✅ (can't optimize)
- Dependencies: 3 sec ✅ (already cached)
- **Building: 6.5-28 min** ⚠️ (needs optimization)
- Collecting traces: 4 sec ✅
- Static files: 18 sec ✅

## Quick Wins

1. **Cancel non-critical builds** (like documentation-only commits)
2. **Batch commits** before pushing to reduce builds
3. **Use Vercel CLI locally** to test builds before pushing:
   ```bash
   vercel build
   ```

4. **Skip builds for docs**: Add to commit message:
   ```
   [skip ci] docs: update readme
   ```

## Long-term Solutions

1. **Move 3D rendering to client-only**: Don't SSR Three.js components
2. **Code splitting**: Lazy load heavy components
3. **Reduce page generation**: Use more dynamic routes
4. **Upgrade to Next.js Edge Runtime** for faster cold starts

## Files to Check
- `next.config.ts` - Build optimization
- `.vercelignore` - Exclude unnecessary files  
- `app/**/page.tsx` - Check generateStaticParams usage
- `package.json` - Review heavy dependencies
