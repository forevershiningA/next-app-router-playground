# Texture Format Fix: JPG to WEBP

## Problem
The application was trying to load `.jpg` texture files, but all actual texture files are in `.webp` format, causing errors:
```
Error: Could not load /textures/forever/l/Blue-Pearl.jpg: undefined
```

## Root Causes Found

### 1. **ShapeSwapper.tsx** (CRITICAL)
- **Line 24**: Had `DEFAULT_TEX = 'Imperial-Red.jpg'`
- **Line 494**: Was converting ALL extensions to `.jpg`: `file.replace(/\.(png|webp|jpeg)$/i, '.jpg')`

### 2. **HeadstoneBaseAuto.tsx** (CRITICAL)
- **Line 87**: Was converting ALL extensions to `.jpg`: `file.replace(/\.(png|webp|jpeg)$/i, '.jpg')`

### 3. **headstone-store.ts**
- **Line 21**: Had `DEFAULT_TEX = 'Imperial-Red.jpg'`
- Setters were not converting incoming `.jpg` references

### 4. **Other Data Sources**
- SEO templates have `.jpg` references
- Legacy saved designs have `.jpg` references
- Material selector UI references

## Fixes Applied

### Store Level (`lib/headstone-store.ts`)
```typescript
const DEFAULT_TEX = 'Imperial-Red.webp'; // Changed from .jpg

setMaterialUrl(materialUrl) {
  const convertedUrl = materialUrl.replace(/\.jpg$/i, '.webp');
  set({ materialUrl: convertedUrl });
}

setHeadstoneMaterialUrl(url) {
  const convertedUrl = url.replace(/\.jpg$/i, '.webp');
  set({ headstoneMaterialUrl: convertedUrl });
}

setBaseMaterialUrl(url) {
  const convertedUrl = url.replace(/\.jpg$/i, '.webp');
  set({ baseMaterialUrl: convertedUrl, baseSwapping: true });
}
```

### 3D Rendering Components
**`components/three/headstone/ShapeSwapper.tsx`:**
```typescript
const DEFAULT_TEX = 'Imperial-Red.webp'; // Changed from .jpg

const requestedTex = React.useMemo(() => {
  // ... path checks ...
  const file = headstoneMaterialUrl?.split('/').pop() ?? DEFAULT_TEX;
  const webp = file.replace(/\.jpg$/i, '.webp'); // Changed from forcing .jpg
  return TEX_BASE + webp;
}, [headstoneMaterialUrl]);
```

**`components/three/headstone/HeadstoneBaseAuto.tsx`:**
```typescript
const requestedBaseTex = React.useMemo(() => {
  const file = baseMaterialUrl?.split('/').pop() ?? DEFAULT_TEX;
  const webp = file.replace(/\.jpg$/i, '.webp'); // Changed from forcing .jpg
  return TEX_BASE + webp;
}, [baseMaterialUrl]);
```

### Data Loading (`lib/ml-to-canvas-loader.ts`)
```typescript
export function mapTextureToFile(mlTexture: string): string {
  // ...
  let filename = parts[parts.length - 1];
  filename = filename.replace(/\.jpg$/i, '.webp'); // Convert .jpg to .webp
  // ...
}
```

### Template Loading (`lib/template-loader.ts`)
```typescript
const materialMap: Record<string, string> = {
  'imperial-red': 'Imperial-Red.webp',  // Changed from .jpg
  'blue-pearl': 'Blue-Pearl.webp',
  'emerald-pearl': 'Emerald-Pearl.webp',
  // ... all changed to .webp
};
```

### UI Components
**`ui/product-card.tsx`:**
```typescript
const textureImage = type === 'material' 
  ? product.image.replace(/\.jpg$/i, '.webp') 
  : product.image;
const selectedUrl = assetBase + textureImage;
```

**`app/select-material/material-title.tsx`:**
```typescript
const textureImage = slugMatch.image.replace(/\.jpg$/i, '.webp');
const desired = `/textures/forever/l/${textureImage}`;
```

### Material Data (`app/_internal/_data.ts`)
```typescript
// Materials use .jpg for shop preview images (correct - those files exist)
// But when applied to 3D, they're converted to .webp via product-card
const materials: Material[] = [
  { id: '7', name: 'Blue Pearl', image: 'Blue-Pearl.jpg', category: '2' },
  // ...
];
```

## File Structure
- **Shop preview images**: `/public/shop/*.jpg` (for UI gallery)
- **3D texture files**: `/public/textures/forever/l/*.webp` (for 3D rendering)

## How It Works Now
1. Material selector UI displays `.jpg` preview images from `/shop/`
2. When a material is clicked, the filename is converted from `.jpg` to `.webp`
3. The store setters ensure any `.jpg` reference is converted to `.webp`
4. The 3D rendering components use `.webp` textures from `/textures/forever/l/`
5. All legacy designs and SEO templates with `.jpg` references are automatically converted

## Testing
After applying these fixes:
1. Clear Next.js build cache: `rm -rf .next`
2. Restart dev server
3. Hard refresh browser (Ctrl+Shift+R)
4. Select any material - it should load correctly
5. Load any legacy design - textures should convert automatically

## Files Modified
1. `lib/headstone-store.ts`
2. `lib/headstone-constants.ts`
3. `components/three/headstone/ShapeSwapper.tsx`
4. `components/three/headstone/HeadstoneBaseAuto.tsx`
5. `lib/ml-to-canvas-loader.ts`
6. `lib/template-loader.ts`
7. `ui/product-card.tsx`
8. `app/select-material/material-title.tsx`
9. `app/_internal/_data.ts`
