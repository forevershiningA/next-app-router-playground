# Link Text Update - Meaningful Descriptions

## Issue
All design links were showing generic titles like "Mother Memorial" repeated 20x, making it hard to distinguish between different designs.

## Solution
Updated all design displays to use the meaningful slug text (e.g., "Your Life Was a Blessing Your Memory a Treasure") instead of the generic category-based title.

## Changes Made

### 1. Helper Function Created
Added `formatSlugForDisplay()` function to convert kebab-case slugs to Title Case:

```typescript
/**
 * Format slug for display - convert kebab-case to Title Case
 * e.g., "your-life-was-a-blessing-your-memory-a-treasure" 
 *    → "Your Life Was a Blessing Your Memory a Treasure"
 */
function formatSlugForDisplay(slug: string): string {
  if (!slug) return 'Memorial Design';
  
  return slug
    .split('-')
    .map((word, index) => {
      // Don't capitalize very short words (articles, prepositions) unless first word
      if (word.length <= 2 && index > 0) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}
```

### 2. Files Updated

#### components/DesignsTreeNav.tsx
- ✅ Added `formatSlugForDisplay()` helper
- ✅ Updated design title on line 61: `title: formatSlugForDisplay(design.slug)`
- **Impact:** Side navigation now shows meaningful descriptions

#### app/designs/[productType]/[category]/page.tsx
- ✅ Added `formatSlugForDisplay()` helper
- ✅ Updated image alt text: `alt={formatSlugForDisplay(design.slug)}`
- ✅ Updated card title: `{formatSlugForDisplay(design.slug)}`
- **Impact:** Category listing pages now show meaningful titles

#### app/designs/[productType]/[category]/[slug]/page.tsx
- ✅ Added `formatSlugForDisplay()` helper
- ✅ Updated metadata generation: `const title = formatSlugForDisplay(design.slug)`
- **Impact:** Browser tab titles and SEO metadata now use meaningful descriptions

## Examples

### Before
```
Navigation:
- Mother Memorial
- Mother Memorial
- Mother Memorial
- Mother Memorial

Category Page:
"Mother Memorial" (repeated for all designs in category)

Browser Title:
"Mother Memorial | Traditional Engraved Headstone | DYO"
```

### After
```
Navigation:
- Your Life Was a Blessing Your Memory a Treasure
- Forever in Our Hearts
- Gone But Not Forgotten
- Always in Our Thoughts

Category Page:
"Your Life Was a Blessing Your Memory a Treasure"
"Forever in Our Hearts"
"Gone But Not Forgotten"

Browser Title:
"Your Life Was a Blessing Your Memory a Treasure | Traditional Engraved Headstone | DYO"
```

## Benefits

### User Experience
✅ **Clear Differentiation** - Each design now has a unique, meaningful title
✅ **Better Navigation** - Users can identify designs by their emotional phrases
✅ **Improved Readability** - Titles are formatted in proper Title Case
✅ **Professional Appearance** - Consistent formatting across all pages

### SEO Benefits
✅ **Better CTR** - More compelling titles in search results
✅ **Keyword Rich** - Titles contain meaningful memorial phrases
✅ **Unique Metadata** - Each page has distinct title and description
✅ **Improved Indexing** - Search engines can better understand content

## Implementation Details

### Smart Capitalization
The function intelligently capitalizes words:
- **Capitalizes:** All words except short articles/prepositions
- **Always capitalizes:** First word regardless of length
- **Examples:**
  - "your-life-was-a-blessing" → "Your Life Was a Blessing"
  - "in-our-hearts-forever" → "In Our Hearts Forever"
  - "a-life-well-lived" → "A Life Well Lived"

### Fallback Handling
If a design has no slug or an empty slug:
- Returns "Memorial Design" as fallback
- Ensures no broken displays

## Testing Checklist

### Navigation
- [x] Check side navigation shows unique titles
- [x] Verify titles are properly capitalized
- [x] Confirm clicking works correctly

### Category Pages
- [x] Card titles show meaningful descriptions
- [x] Image alt text uses formatted slugs
- [x] Grid layout displays correctly

### Individual Design Pages
- [x] Browser tab title uses meaningful phrase
- [x] Meta description includes slug text
- [x] OpenGraph titles are formatted

## Files Modified
1. ✅ `components/DesignsTreeNav.tsx`
2. ✅ `app/designs/[productType]/[category]/page.tsx`
3. ✅ `app/designs/[productType]/[category]/[slug]/page.tsx`

## Status
✅ Complete - All design links now show meaningful, unique descriptions
