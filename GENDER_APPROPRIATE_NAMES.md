# Gender-Appropriate Name Replacement

## Enhancement
Updated the name sanitization system to use gender-appropriate names based on the memorial category.

## Implementation

### Category Gender Detection
Added `getGenderFromCategory()` function that determines if a category is:
- **Female:** mother, daughter, wife, sister, grandmother, nanna, grandma, aunt, woman, lady, girl
- **Male:** father, son, husband, brother, grandfather, papa, grandpa, uncle, man, gentleman, boy, dad
- **Neutral:** All other categories

### Name Database Updates
Updated name database structure to store:
```typescript
{
  firstNames: Set<string>,      // Combined set for detection
  surnames: Set<string>,         // All surnames
  femaleNames: string[],         // Female names from firstnames_f.json
  maleNames: string[],           // Male names from firstnames_m.json
  firstNamesArray: string[],     // Combined array for neutral
  surnamesArray: string[]        // All surnames array
}
```

### Smart Name Selection
The `getRandomName()` function now:
1. Detects category gender
2. Selects appropriate name list:
   - **Female categories** → Use `firstnames_f.json`
   - **Male categories** → Use `firstnames_m.json`
   - **Neutral categories** → Use combined list

## Examples

### Mother Memorial (Female Category)
**Before:** Random name from combined list
**After:** Random female name from `firstnames_f.json`

Example replacements:
- "MARY PATRICIA" → "Emily Johnson"
- "SUSAN THOMPSON" → "Sarah Williams"
- "DELORES O'GUIN" → "Jennifer Davis"

### Father Memorial (Male Category)
**Before:** Random name from combined list
**After:** Random male name from `firstnames_m.json`

Example replacements:
- "JOHN SMITH" → "Michael Anderson"
- "ROBERT JONES" → "David Martinez"
- "WILLIAM BROWN" → "James Wilson"

### General Memorial (Neutral Category)
**Before:** Random name from combined list
**After:** Random name from combined list (unchanged)

## Category Gender Mapping

### Female Categories
- mother-memorial
- daughter-memorial
- wife-memorial
- sister-memorial
- grandmother-memorial (any variant with nanna, grandma)
- aunt-memorial
- woman/lady/girl memorial

### Male Categories
- father-memorial
- son-memorial
- husband-memorial
- brother-memorial
- grandfather-memorial (any variant with papa, grandpa)
- uncle-memorial
- man/gentleman/boy memorial
- dad-memorial

### Neutral Categories
- memorial
- in-loving-memory
- rest-in-peace
- biblical-memorial
- pet-memorial
- etc.

## Benefits

### More Appropriate Replacements
✅ Female names for mother/daughter/wife memorials
✅ Male names for father/son/husband memorials
✅ Contextually appropriate for viewers

### Privacy Protection Maintained
✅ Still replaces real names with random ones
✅ Consistent replacement based on seed
✅ No personal information exposed

### Better User Experience
✅ More realistic and respectful
✅ Gender-appropriate context
✅ Professional presentation

## Technical Details

### File Updated
`app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx`

### Changes Made
1. Added `getGenderFromCategory()` function
2. Updated nameDatabase type to include femaleNames and maleNames
3. Modified `getRandomName()` to use gender-appropriate list
4. Preserved seed-based consistency for same design

### Data Sources
- `/json/firstnames_f.json` - Female first names
- `/json/firstnames_m.json` - Male first names
- `/json/surnames.json` - Surnames (gender-neutral)

## Example Output

### Mother Memorial Design
```
Original: "In loving memory of MARY PATRICIA JOHNSON"
Replaced: "In loving memory of Emily Thompson"
         ↑ Female name from firstnames_f.json
```

### Father Memorial Design
```
Original: "In loving memory of JOHN MICHAEL SMITH"
Replaced: "In loving memory of David Anderson"
         ↑ Male name from firstnames_m.json
```

### Pet Memorial Design (Neutral)
```
Original: "In loving memory of CHARLIE COOPER"
Replaced: "In loving memory of Alex Martinez"
         ↑ Random name from combined list
```

## Status
✅ Complete - Names are now gender-appropriate based on category
