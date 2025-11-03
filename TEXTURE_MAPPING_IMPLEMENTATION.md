# Texture Mapping Implementation for Saved Designs

## Overview

Added intelligent texture mapping to properly load materials/textures when loading saved designs into the DYO editor.

## Implementation

### 1. Bronze Textures (Product ID 5)

**Bronze Plaque Textures:**
```typescript
const BRONZE_TEXTURES = [
  { name: "Black", color: "#000000", img: "/textures/phoenix/s/01.jpg" },
  { name: "Brown", color: "#48280f", img: "/textures/phoenix/s/02.jpg" },
  { name: "Casino Blue", color: "#0c1137", img: "/textures/phoenix/s/03.jpg" },
  { name: "Dark Brown", color: "#24160b", img: "/textures/phoenix/s/04.jpg" },
  { name: "Dark Green", color: "#1a391a", img: "/textures/phoenix/s/05.jpg" },
  { name: "Grey", color: "#6d696a", img: "/textures/phoenix/s/06.jpg" },
  { name: "Holly Green", color: "#07723a", img: "/textures/phoenix/s/07.jpg" },
  { name: "Ice Blue", color: "#afcadb", img: "/textures/phoenix/s/08.jpg" },
  { name: "Maroon", color: "#4c0f1e", img: "/textures/phoenix/s/09.jpg" },
  { name: "Navy Blue", color: "#2c2c76", img: "/textures/phoenix/s/10.jpg" },
  { name: "Purple", color: "#513a68", img: "/textures/phoenix/s/11.jpg" },
  { name: "Red", color: "#c72028", img: "/textures/phoenix/s/12.jpg" },
  { name: "Sundance Pink", color: "#c99cb0", img: "/textures/phoenix/s/13.jpg" },
  { name: "Turquoise", color: "#295363", img: "/textures/phoenix/s/14.jpg" },
  { name: "White", color: "#ffffff", img: "/textures/phoenix/s/15.jpg" }
];
```

**Path:** `/textures/phoenix/s/` (was `data/jpg/bronzes/phoenix/s/`)

### 2. Headstone Materials

**Common Materials:**
- **Blue Pearl** → `/textures/forever/l/Blue-Pearl-TILE-900-X-900.jpg`
- **Glory Black** (IDs 18, 19) → `/textures/forever/l/Glory-Black-2-TILE-900-X-900.jpg`
- **Glory Gold Spots** → `/textures/forever/l/Glory-Black-1-TILE-900-X-900.jpg`
- **African Black** → `/textures/forever/l/African-Black-TILE-900-X-900.jpg`
- **G654** → `/textures/forever/l/G654-TILE-900-X-900.jpg`

### 3. Mapping Logic

**Function: `mapTexture(texturePath: string, productId: string)`**

```typescript
function mapTexture(texturePath: string, productId: string): string {
  // 1. Bronze plaques (productId === '5')
  if (productId === '5') {
    // Extract number from path: /02.jpg → index 1 → Brown bronze
    const bronzeMatch = texturePath.match(/\/(\d+)\.jpg$/);
    if (bronzeMatch) {
      const index = parseInt(bronzeMatch[1]) - 1;
      return BRONZE_TEXTURES[index].img;
    }
    return BRONZE_TEXTURES[0].img; // Default: Black
  }
  
  // 2. Glory Black (material IDs 18 or 19)
  if (texturePath.includes('18') || texturePath.includes('19') || 
      texturePath.includes('Glory-Black')) {
    return '/textures/forever/l/Glory-Black-2-TILE-900-X-900.jpg';
  }
  
  // 3. Blue Pearl
  if (texturePath.toLowerCase().includes('blue-pearl')) {
    return '/textures/forever/l/Blue-Pearl-TILE-900-X-900.jpg';
  }
  
  // 4. Other materials by name matching
  // Checks MATERIAL_TEXTURES dictionary
  
  // 5. Fallback: return original path if valid
  return texturePath;
}
```

## Usage

When loading a saved design:

```typescript
if (baseProduct.texture) {
  const mappedTexture = mapTexture(baseProduct.texture, String(baseProduct.productid));
  console.log(`   Original texture: ${baseProduct.texture}`);
  console.log(`   Mapped texture: ${mappedTexture}`);
  store.setHeadstoneMaterialUrl(mappedTexture);
}
```

## Examples

### Bronze Plaque Example
**Input:** `data/jpg/bronzes/phoenix/s/03.jpg`
**Product ID:** `5` (Bronze Plaque)
**Output:** `/textures/phoenix/s/03.jpg` (Casino Blue)

### Headstone Example 1
**Input:** `/textures/forever/l/Blue-Pearl-TILE-900-X-900.jpg`
**Product ID:** `124` (Traditional Headstone)
**Output:** `/textures/forever/l/Blue-Pearl-TILE-900-X-900.jpg` ✓

### Headstone Example 2
**Input:** Path containing "18" or "Glory-Black"
**Product ID:** `4` (Laser-etched Headstone)
**Output:** `/textures/forever/l/Glory-Black-2-TILE-900-X-900.jpg`

## Material ID Reference

From `_data.ts`:
- ID 7: Blue Pearl
- ID 18: Glory Gold Spots
- ID 19: Glory Black (most common for laser etched)
- ID 1: African Black
- ID 16: G654

## Files Modified

1. ✅ `lib/saved-design-loader-utils.ts`
   - Added `BRONZE_TEXTURES` array
   - Added `MATERIAL_TEXTURES` mapping
   - Added `mapTexture()` function
   - Updated texture setting to use mapping

## Benefits

1. **Bronze Plaques** - Correctly maps old bronze texture paths to new location
2. **Glory Black** - Automatically uses Glory Black for laser-etched headstones (IDs 18/19)
3. **Blue Pearl** - Properly maps Blue Pearl material regardless of path format
4. **Fallback** - Handles unknown textures gracefully
5. **Logging** - Console logs show original and mapped textures for debugging

## Testing

To test, load a saved design with:
- Bronze plaque (should map to correct bronze color)
- Headstone with Blue Pearl (should load Blue Pearl texture)
- Headstone with material ID 18 or 19 (should load Glory Black)

Console will show:
```
   Original texture: data/jpg/bronzes/phoenix/s/03.jpg
   Mapped texture: /textures/phoenix/s/03.jpg
```

or

```
   Original texture: /textures/forever/l/Blue-Pearl-TILE-900-X-900.jpg
   Mapped texture: /textures/forever/l/Blue-Pearl-TILE-900-X-900.jpg
```
