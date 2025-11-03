# Test URLs for Programmatic SEO

## How to Test

The design pages are now live and using REAL data from the 4,118 designs we parsed.

Visit these actual URLs (replace localhost:3000 with your domain):

### Top Serpentine Religious Headstones (223 designs)

Based on the data, here are real URLs you can test:

```
http://localhost:3000/designs/laser-etched-headstone/serpentine-religious/[design-name]
```

### Top Bronze Plaque Flowers (176 designs)

```
http://localhost:3000/designs/bronze-plaque/flowers/[design-name]
```

### Top Bronze Plaque Religious (164 designs)

```
http://localhost:3000/designs/bronze-plaque/religious/[design-name]
```

## Find a Real URL

To get actual slugs, you need to check the generated data. Run this in Node:

```javascript
const { mlTemplates } = require('./lib/seo-templates-unified');

// Get first 10 serpentine religious headstones
const serpentineReligious = mlTemplates
  .filter(t => t.productType === 'laser-etched-headstone' && t.category === 'serpentine-religious')
  .slice(0, 10);

serpentineReligious.forEach(d => {
  console.log(`http://localhost:3000/designs/${d.productType}/${d.category}/${d.slug}`);
});
```

Or create a simple index page:

## Create an Index Page

File: `app/designs/page.tsx`

```typescript
import { mlTemplates, mlStats } from '#/lib/seo-templates-unified';
import Link from 'next/link';

export default function DesignsIndex() {
  // Get first 20 designs
  const featuredDesigns = mlTemplates.slice(0, 20);
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Browse {mlStats.totalDesigns} Real Customer Designs</h1>
      
      <div className="grid gap-4">
        {featuredDesigns.map(design => (
          <Link 
            key={design.id}
            href={`/designs/${design.productType}/${design.category}/${design.slug}`}
            className="border p-4 hover:bg-gray-800"
          >
            <h3 className="font-semibold">{design.primaryName}</h3>
            <p className="text-sm text-gray-400">{design.shape} {design.motif} - ${design.price}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

This will give you clickable links to real designs!

## Quick Test Command

Run this to see the first URL:

```bash
node -e "const t = require('./lib/seo-templates-unified').mlTemplates[0]; console.log('http://localhost:3000/designs/' + t.productType + '/' + t.category + '/' + t.slug);"
```

This will output a real, working URL you can test immediately!
