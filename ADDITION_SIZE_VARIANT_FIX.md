# Addition Size Variant Fix

## Issue
The addition size slider was hardcoded to show "Size 1 - Size 4" for all additions, even when an addition only has one fixed size. For example, B2074S (Applicazione Angelo) has only 1 size (70×120mm) defined in the XML, but the UI showed a slider with 4 size options.

## Root Cause
The `DesignerNav.tsx` component had hardcoded size slider limits:
```tsx
min={1}
max={4}  // ← Always 4, regardless of actual sizes
```

## Solution

### 1. Updated Addition Type Definition
**File:** `app/_internal/_data.ts`

Added `sizes` array to the `Addition` type to store size variant information:
```typescript
export type Addition = {
  id: string;
  name: string;
  image: string;
  type: 'application' | 'vase' | 'statue';
  category: string;
  file?: string;
  sizes?: Array<{
    variant: number;
    code: string;
    width: number;
    height: number;
    depth: number;
    weight: number;
    availability: boolean;
    wholesalePrice: number;
    retailPrice: number;
    notes?: string;
  }>;
};
```

### 2. Updated Addition Data
**File:** `app/_internal/_data.ts`

Added size variant data to additions:

**B2074S (1 size only):**
```typescript
{
  id: 'B2074S',
  file: "207/Art207.glb",
  name: 'Applicazione Angelo',
  image: '_207.webp',
  type: 'application',
  category: '1',
  sizes: [
    { variant: 1, code: 'B2074/S', width: 70, height: 120, depth: 20, ... }
  ]
}
```

**B2225 (2 sizes):**
```typescript
{
  id: 'B2225',
  file: "2225/Art2225.glb",
  name: 'Let Romano Spazzolato',
  image: '_2225.webp',
  type: 'application',
  category: '1',
  sizes: [
    { variant: 1, code: 'B2225', width: 100, height: 100, depth: 20, ... },
    { variant: 2, code: 'B2226', width: 140, height: 140, depth: 20, ... }
  ]
}
```

### 3. Updated Size Slider UI
**File:** `components/DesignerNav.tsx`

Replaced hardcoded slider with dynamic version:

#### For Single-Size Additions
Shows a readonly display with actual dimensions:
```
Size: 70×120mm
```
(If `sizes` data is missing, the field shows empty)

#### For Multi-Size Additions
Shows slider with actual dimensions as labels:
```tsx
const maxSize = activeAddition?.sizes?.length ?? 1;

<input
  type="range"
  min={1}
  max={maxSize}  // ← Dynamic based on actual sizes
  ...
/>
```

Slider labels now show actual dimensions:
```
100×100mm  ←→  140×140mm
```

For example:
- **B2225** with 2 sizes shows: `100×100mm` ←→ `140×140mm`
- **B2074S** with 1 size shows: `70×120mm` (no slider)

## XML Structure Reference

Additions in `public/xml/en_EN/motifs-biondan.xml` follow this pattern:

### Single Size (B2074S)
```xml
<product id="B2074S" ...>
  <product_type id="1" ...>
    <type id="1" ... />  ← Only 1 type
  </product_type>
  <price_model ...>
    <price id="1" ... />  ← Only 1 price
  </price_model>
</product>
```

### Multiple Sizes (B2225)
```xml
<product id="B2225" ...>
  <product_type id="1" ...>
    <type id="1" code="B2225" min_width="100" ... />  ← Size 1
    <type id="2" code="B2226" min_width="140" ... />  ← Size 2
  </product_type>
  <price_model ...>
    <price id="1" code="B2225" ... />
    <price id="2" code="B2226" ... />
  </price_model>
</product>
```

**Rule:** Number of `<type>` elements = Number of `<price>` elements = Number of size variants

## Testing

1. **Single-size addition (B2074S):**
   - Should show "70×120mm" text (no "(Fixed)" label)
   - No slider displayed

2. **Multi-size addition (B2225):**
   - Should show slider with labels "100×100mm" and "140×140mm"
   - Can toggle between two sizes
   - +/- buttons respect max of 2
   - Number input shows current size variant (1 or 2)

## Future Work

The remaining additions in `_data.ts` (B1134S, B4599, B2600, etc.) should be updated with their `sizes` data from the XML. Currently only B2074S, B2074D, and B2225 have been updated as examples.

Alternatively, integrate with the PostgreSQL `additions` table (which already has all size data per `ADDITIONS_MIGRATION_COMPLETE.md`) instead of using static `_data.ts`.

## Related Documentation
- `STARTER.md` - Section: "Additions Migration to PostgreSQL"
- `ADDITIONS_MIGRATION_COMPLETE.md` - Complete migration details
- `data/additions-parsed.json` - All 82 additions with full size data
