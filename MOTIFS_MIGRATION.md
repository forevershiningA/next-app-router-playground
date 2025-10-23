# Motifs System Migration Guide

## Overview

The motifs system has been updated to use modern TypeScript and React patterns instead of the legacy JavaScript approach.

## Key Changes

### 1. Data Structure
- **Location**: `app/_internal/_data.ts`
- **Type**: `Motif` type with proper TypeScript definitions
- **Translation Keys**: Names use uppercase keys (e.g., `AQUATIC`, `BIRDS`) that match `Lang` constants from `Const.js`
- **Access**: `import { data } from '@/app/_internal/_data'` → `data.motifs`

### 2. File Loading System

#### Old Way (JavaScript)
```javascript
getCategory(index) {
  let url = dyo.xml_path + "data/motifs/" + this.categories[index].src + "/" + files;
  fetch(url).then(response => {
    response.text().then(text => {
      let data = text.split(',');
      dyo.engine.motifs.category_data = data;
      dyo.engine.motifs.motifs_list.render();
    });
  });
}
```

#### New Way (TypeScript)
```typescript
// Server-side or client-side function
import { getMotifCategory } from '@/lib/motifs';

const result = await getMotifCategory(categoryIndex, 'Laser', 50);
// result.files - array of file names
// result.totalCount - total number of files
// result.hasMore - boolean indicating if more files exist
```

#### New Way (React Hook)
```typescript
import { useMotifCategory } from '@/lib/use-motifs';

function MotifList({ categoryIndex }) {
  const { files, hasMore, isLoading, loadMore } = useMotifCategory({
    categoryIndex,
    formula: 'Laser',
    initialLimit: 50
  });

  return (
    <div>
      {files.map(fileName => (
        <MotifItem key={fileName} fileName={fileName} />
      ))}
      {hasMore && <button onClick={loadMore}>Load More</button>}
    </div>
  );
}
```

## File Structure

### Motif Files Location
- **Old**: `data/motifs/[category]/files.txt`
- **New**: `public/motifs/[category]/files.txt`

### File Types Available
Each category folder contains multiple file lists:
- `files.txt` - Default file list (used for all formulas)
- `bronze-files.txt` - Bronze-specific motifs
- `laser-files.txt` - Laser-specific motifs
- `engraved-files.txt` - Engraved-specific motifs
- `enamel-files.txt` - Enamel-specific motifs

Currently, all formulas use `files.txt` by default. To enable formula-specific files, uncomment the switch statement in `lib/motifs.ts`.

## Available Functions

### Core Functions (`lib/motifs.ts`)

#### `getMotifCategory(categoryIndex, formula?, limit?)`
Load motif files for a category with optional pagination.
```typescript
const result = await getMotifCategory(0, 'Laser', 50);
// Returns: { files: string[], totalCount: number, hasMore: boolean }
```

#### `loadMoreMotifFiles(categoryIndex, formula?, currentCount, loadMore)`
Load additional files beyond what's already loaded.
```typescript
const result = await loadMoreMotifFiles(0, 'Laser', 50, 50);
```

#### `getAllMotifFiles(categoryIndex, formula?)`
Get all files without pagination.
```typescript
const files = await getAllMotifFiles(0, 'Laser');
```

#### `getMotifFilePath(categoryIndex, fileName, extension?)`
Get the full path for a motif image file.
```typescript
const path = getMotifFilePath(0, 'whale_002', 'png');
// Returns: '/motifs/Animals/Aquatic/whale_002.png'
```

#### `getMotifCategoryByName(name)`
Find category index by name.
```typescript
const index = getMotifCategoryByName('AQUATIC'); // Returns: 0
```

### React Hooks (`lib/use-motifs.ts`)

#### `useMotifCategory(options)`
Complete hook with pagination, loading states, and error handling.
```typescript
const {
  files,           // Current loaded files
  totalCount,      // Total files in category
  hasMore,         // More files available?
  isLoading,       // Loading state
  error,           // Error object if any
  loadMore,        // Function to load more
  reload           // Function to reload from start
} = useMotifCategory({
  categoryIndex: 0,
  formula: 'Laser',
  initialLimit: 50,
  loadMoreIncrement: 50
});
```

#### `useMotifCategoryAll(categoryIndex, formula?)`
Simpler hook that loads all files at once.
```typescript
const { files, isLoading, error } = useMotifCategoryAll(0, 'Laser');
```

## Migration Examples

### Example 1: Loading Category Files

**Before:**
```javascript
dyo.engine.motifs.getCategory(selectedIndex);
```

**After (Server Component):**
```typescript
import { getMotifCategory } from '@/lib/motifs';

const result = await getMotifCategory(selectedIndex, 'Laser');
```

**After (Client Component):**
```typescript
import { useMotifCategory } from '@/lib/use-motifs';

const { files } = useMotifCategory({
  categoryIndex: selectedIndex,
  formula: 'Laser'
});
```

### Example 2: Load More Button

**Before:**
```javascript
buttonLoadMore.addEventListener('click', () => {
  let moreData = dyo.engine.motifs.category_data.slice(50, 100);
  dyo.engine.motifs.motifs_list.data.push(...moreData);
  dyo.engine.motifs.motifs_list.render();
});
```

**After:**
```typescript
const { files, hasMore, loadMore } = useMotifCategory({...});

<button 
  onClick={loadMore} 
  disabled={!hasMore}
>
  Load More
</button>
```

### Example 3: Rendering Motif Grid

**Before:**
```javascript
for (let file of files) {
  let img = document.createElement('img');
  img.src = dyo.xml_path + 'data/motifs/' + category.src + '/' + file + '.png';
  container.appendChild(img);
}
```

**After:**
```tsx
import { getMotifFilePath } from '@/lib/motifs';

{files.map(fileName => (
  <img 
    key={fileName}
    src={getMotifFilePath(categoryIndex, fileName)}
    alt={fileName}
  />
))}
```

## Motif Categories

All 49 motif categories are defined in `app/_internal/_data.ts`:

| ID | Name | Src Path | Traditional | SS |
|----|------|----------|-------------|-----|
| 0 | AQUATIC | Animals/Aquatic | ✓ | ✓ |
| 1 | BIRDS | Animals/Birds | ✓ | ✓ |
| 2 | BUTTERFLIES | Animals/Butterflies | ✓ | ✓ |
| ... | ... | ... | ... | ... |
| 47 | 2 Colour Motifs | 2ColRaisedMotif | ✗ | ✗ |
| 48 | 1 Colour Motifs | 1ColRaisedMotif | ✗ | ✗ |

See `app/_internal/_data.ts` for the complete list with all properties.

## Translation Integration

The motif names are stored as translation keys that work with the existing `Translate()` function from `Const.js`:

```typescript
import { Translate, Lang } from '@/Const';

const motif = data.motifs[0];
const translatedName = Translate(motif.name); // "Aquatic"
```

Translation strings are defined in `public/xml/au_EN/languages24.xml` (and other locale files).

## TypeScript Types

```typescript
type Motif = {
  id: number;           // Unique ID
  class: string;        // CSS class (always "motif")
  name: string;         // Translation key (e.g., "AQUATIC")
  src: string;          // Relative path to category folder
  img: string;          // Preview image path
  traditional: boolean; // Available for traditional products
  ss: boolean;          // Available for stainless steel
  col2: boolean;        // 2-colour motif
  col1: boolean;        // 1-colour motif
};

type ProductFormula = 'Bronze' | 'Laser' | 'Engraved' | 'Enamel';
```

## Testing

To verify the motifs system is working:

1. Check that files exist: `public/motifs/Animals/Aquatic/files.txt`
2. Import and use the hook in a component
3. Verify images load from: `/motifs/[category]/[filename].png`

## Example Component

See `lib/motifs-example.tsx` for a complete working example component that demonstrates:
- Category selection dropdown
- Motif grid display
- Load more functionality
- Loading and error states
- Responsive design with Tailwind CSS
