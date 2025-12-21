# Price Display Feature

**Date:** December 21, 2025  
**Status:** ✅ Implemented

## Overview

Added automatic price extraction and display on design category pages. The feature extracts the total price from saved design HTML quote files and displays it under each design card.

## Changes Made

### 1. Created Price Extraction Utility (`lib/extract-price.ts`)

**Purpose:** Extract total price from HTML quote files

**Key Features:**
- Tries desktop HTML first (`{designId}-desktop.html`), falls back to mobile (`{designId}.html`)
- Supports both "Total:" and "Total" labels
- Uses regex patterns to find price in table structure:
  - Primary: `<td class="total-title">Total</td><td>$3791.75</td>`
  - Fallback: `<td>Total:</td><td>$1234.56</td>`
- Returns formatted price with `$` symbol (e.g., `$3,791.75`)
- Returns `null` if HTML not found or price cannot be extracted

**Function Signature:**
```typescript
export async function extractTotalPrice(
  designId: string, 
  mlDir: string = 'forevershining'
): Promise<string | null>
```

### 2. Updated Category Page Client (`app/designs/[productType]/[category]/CategoryPageClient.tsx`)

**Changes:**
- Added import: `import { extractTotalPrice } from '#/lib/extract-price'`
- Added state: `const [designPrices, setDesignPrices] = useState<Record<string, string>>({});`
- Added effect to fetch prices for all designs in category:
  ```typescript
  useEffect(() => {
    async function fetchPrices() {
      const prices: Record<string, string> = {};
      
      for (const design of designs) {
        const price = await extractTotalPrice(design.id, design.mlDir);
        if (price) {
          prices[design.id] = price;
        }
      }
      
      setDesignPrices(prices);
    }
    
    if (designs.length > 0) {
      fetchPrices();
    }
  }, [designs]);
  ```

**UI Update:**
- Replaced static pricing note with dynamic price display
- If price available: Shows "From $X,XXX.XX" in large serif font
- If price not available: Falls back to original message

```typescript
{designPrices[design.id] ? (
  <p className="text-lg font-serif text-slate-900">
    <span className="font-light text-sm text-slate-500">From </span>
    {designPrices[design.id]}
  </p>
) : (
  <p className="text-xs text-slate-500 font-light">
    <span className="font-medium">Pricing:</span> View detailed pricing...
  </p>
)}
```

## File Structure

```
next-dyo/
├── lib/
│   └── extract-price.ts           # NEW - Price extraction utility
├── app/
│   └── designs/
│       └── [productType]/
│           └── [category]/
│               └── CategoryPageClient.tsx  # MODIFIED - Added price display
└── public/
    └── ml/
        └── forevershining/
            └── saved-designs/
                └── html/
                    ├── {designId}.html             # Mobile HTML
                    └── {designId}-desktop.html     # Desktop HTML
```

## Testing

### Test URLs:
- Category page: http://localhost:3001/designs/traditional-headstone/biblical-memorial
- Example design: http://localhost:3001/designs/traditional-headstone/biblical-memorial/curved-gable-may-heavens-eternal-happiness-be-thine

### Test Cases:
1. ✅ Price extraction works with desktop HTML
2. ✅ Falls back to mobile HTML if desktop not found
3. ✅ Regex matches both "Total:" and "Total" labels
4. ✅ Handles prices with commas (e.g., $3,791.75)
5. ✅ Returns null gracefully if HTML not found

### Verified Behavior:
- Design cards show "From $X,XXX.XX" when HTML available
- Falls back to generic message when HTML not found
- No console errors or compilation warnings
- Price loads asynchronously without blocking page render

## Performance Considerations

**Current Implementation:**
- Fetches prices sequentially for all designs in category
- Each fetch requires reading and parsing HTML file
- Prices load after page loads (async)

**Potential Optimizations (Future):**
1. **Batch Processing**: Fetch multiple HTML files in parallel
2. **Caching**: Store extracted prices in static JSON during build
3. **Server-Side**: Move extraction to server component (SSR/ISR)
4. **Pre-processing**: Extract prices during design import/save

## Known Limitations

1. **Client-Side Fetching**: Prices load after initial page render
2. **Sequential Processing**: Fetches HTML files one at a time
3. **No Caching**: Re-fetches HTML on every page load
4. **Missing Prices**: Shows fallback message if HTML not found

## Future Enhancements

1. **Pre-computed Prices**: Add `price` field to `SavedDesignMetadata`
2. **Server Components**: Use Next.js 15 server components for SSR
3. **Price Cache**: Store prices in static JSON for instant loading
4. **Loading States**: Add skeleton loaders while prices fetch
5. **Error Handling**: Show specific error messages for failed fetches

## Related Files

- Design page with full quote: `app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx` (lines 3555-3929)
- Category page: `app/designs/[productType]/[category]/CategoryPageClient.tsx`
- Product page: `app/designs/[productType]/page.tsx`
- Product page client: `app/designs/[productType]/ProductPageClient.tsx`
- Design metadata: `lib/saved-designs-data.ts`
- HTML quote files: `public/ml/*/saved-designs/html/`

## Additional Updates (December 21, 2025)

### Product Page Metadata Enhancement

**File:** `app/designs/[productType]/page.tsx`

**Changes:**
- Refactored from client component to server component with metadata
- Added comprehensive metadata generation with:
  - **Title**: `{Product Name} Designs | Forever Shining`
  - **Description**: Dynamic description with design count, category count, and product details
  - **Keywords**: Product-specific keywords + top 10 categories
  - **OpenGraph**: Full social media tags
  - **Canonical URLs**: SEO-friendly URLs with language alternates
  
- Created `ProductPageClient.tsx` for client-side functionality
- Added product metadata map with detailed descriptions:
  - Traditional Engraved Headstone
  - Laser-Etched Black Granite Headstone
  - Bronze Memorial Plaque
  - Laser-Etched Black Granite Plaque
  - Traditional Engraved Plaque

**Example Metadata:**
```
Title: Traditional Engraved Headstone Designs | Forever Shining
Description: Browse 847 traditional engraved designs across 42 categories. 
Timeless granite memorials with sandblasted inscriptions and hand-painted 
lettering. Available in Black Granite, Blue Pearl, and 25+ premium stones. 
Fully customizable with inscriptions, verses, motifs, and photos. Free 
design proofs and fast delivery.
Keywords: traditional engraved headstone, traditional engraved headstone, 
traditional engraved memorial, traditional engraved designs, headstone 
designs, memorial designs, custom headstone, personalized memorial, 
granite headstone, memorial stone, cemetery marker, grave marker, 
headstone inscriptions, memorial quotes, headstone motifs, biblical 
memorial, mother memorial, father memorial, ...
```

**Test URL:**
- http://localhost:3001/designs/traditional-headstone

---

**Implementation Complete** ✅  
Server running on http://localhost:3001 (port 3000 in use)  
Ready for testing and review.
