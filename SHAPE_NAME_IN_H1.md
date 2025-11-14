# Shape Name in H1 Implementation

## Overview
Added dynamic shape name extraction and display in the H1 heading for design pages.

## Changes Made

### 1. DesignPageClient.tsx
Added shape extraction logic that:
- Extracts shape information from the design data
- Maps numbered shapes (e.g., "Headstone 27") to user-friendly names (e.g., "Heart")
- Displays the shape name in the H1 if available

**Shape Mapping:**
```typescript
const shapeMap: Record<string, string> = {
  'headstone_27': 'Heart',
  'pet_heart': 'Heart',
  'serpentine': 'Serpentine',
  'gable': 'Gable',
  'peak': 'Peak',
  'curved_peak': 'Curved Peak',
  'square': 'Square',
  'landscape': 'Landscape',
  'portrait': 'Portrait',
};
```

**Updated H1:**
```jsx
<h1 className="text-4xl font-serif font-light text-slate-900 tracking-tight mb-2">
  {categoryTitle} – {simplifiedProductName}{shapeName ? ` (${shapeName})` : ''}
</h1>
```

**Example Output:**
- `Mother Memorial – Laser-Etched Black Granite (Heart)`
- `Father Memorial – Bronze (Gable)`
- `Pet Memorial – Laser-Etched Black Granite (Serpentine)`

### 2. page.tsx (Metadata)
Updated the `generateMetadata` function to:
- Extract shape name from design JSON
- Include shape name in Open Graph title
- Include shape name in Twitter card title

**Updated Metadata:**
```typescript
// Get shape name if available
const shapeName = await getDesignShape(designId, design.mlDir);

// Build H1 equivalent (used in OpenGraph)
// Format: "Mother Memorial – Laser-Etched Black Granite (Heart)"
const h1Title = `${categoryTitle} – ${simplifiedProduct}${shapeName ? ` (${shapeName})` : ''}`;
```

## How It Works

### Shape Extraction Logic
1. **Find the headstone/plaque item** in the design data
2. **Extract the shape field** (e.g., "Headstone 27", "pet_heart", etc.)
3. **Process the shape name:**
   - If it's a numbered shape (e.g., "Headstone 27"), use the mapping to get friendly name
   - If it's a named shape (e.g., "pet_heart"), format it as "Pet Heart"
   - Remove prefixes like "headstone_" or "plaque_"
4. **Display in H1** within parentheses if available

### Example Transformations
| Design Shape Field | Extracted Name | H1 Display |
|-------------------|----------------|------------|
| "Headstone 27" | "Heart" | Mother Memorial – Laser-Etched Black Granite (Heart) |
| "pet_heart" | "Heart" | Pet Memorial – Laser-Etched Black Granite (Heart) |
| "serpentine" | "Serpentine" | Memorial – Bronze (Serpentine) |
| "curved_peak" | "Curved Peak" | Father Memorial – Traditional Engraved (Curved Peak) |

## Benefits

### SEO Benefits
1. **More Specific Titles** - Shape information helps differentiate designs
2. **Better User Intent Matching** - Users searching for "heart headstone" will see it in the title
3. **Unique Metadata** - Even designs of the same category/product have unique shapes

### User Experience Benefits
1. **Clear Information** - Users immediately know the shape
2. **Better Navigation** - Shapes help identify specific designs
3. **Consistency** - Format matches the requested structure

## Testing
Visit the test URL to see the shape name in action:
```
http://localhost:3000/designs/laser-etched-headstone/mother-memorial/1761796985723_a-life-lived-with-passion-a-love-that-never-faded-your-legac
```

Expected H1:
```
Mother Memorial – Laser-Etched Black Granite (Heart)
```

## Future Enhancements
1. **Expand Shape Mapping** - Add more numbered shapes to the mapping
2. **Shape Name Database** - Create a comprehensive shape name database
3. **Shape Images** - Display shape icon/preview in the header
4. **Shape Filter** - Add shape-based filtering to design listings
5. **URL Structure** - Consider adding shape to URL path (e.g., `/designs/laser-etched-headstone/heart/mother-memorial/...`)
