# Grass PBR Textures Setup

## Download Free Grass Textures

### Option 1: AmbientCG (Recommended)
1. Go to: https://ambientcg.com/view?id=Ground037
2. Download the **1K-JPG** version (smaller file size, good quality)
3. Extract the ZIP file
4. Rename and copy the following files to this folder:
   - `Ground037_1K_Color.jpg` → `grass_color.jpg`
   - `Ground037_1K_NormalGL.jpg` → `grass_normal.jpg`
   - `Ground037_1K_Roughness.jpg` → `grass_roughness.jpg`
   - `Ground037_1K_AmbientOcclusion.jpg` → `grass_ao.jpg`

### Option 2: PolyHaven
1. Go to: https://polyhaven.com/a/aerial_grass_rock
2. Click "Download" and select **1K JPG**
3. Extract and rename:
   - `aerial_grass_rock_diff_1k.jpg` → `grass_color.jpg`
   - `aerial_grass_rock_nor_gl_1k.jpg` → `grass_normal.jpg`
   - `aerial_grass_rock_rough_1k.jpg` → `grass_roughness.jpg`
   - `aerial_grass_rock_ao_1k.jpg` → `grass_ao.jpg`

## Required Files
After downloading, you should have these 4 files in this folder:
- ✅ grass_color.jpg
- ✅ grass_normal.jpg
- ✅ grass_roughness.jpg
- ✅ grass_ao.jpg

## Alternative: Use Simple Placeholder
If you don't want to download textures right now, you can temporarily use a solid color by commenting out the `useTexture` code in `Scene.tsx`.
