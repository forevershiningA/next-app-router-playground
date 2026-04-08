# Example: How to Use the Programmatic SEO System

## Testing Right Now

1. **Start your dev server**:
   ```bash
   pnpm dev
   ```

2. **Visit these URLs in your browser**:

   **Product page**:
   ```
   http://localhost:3000/select-product/bronze-plaque
   ```
   
   **Specific template page**:
   ```
   http://localhost:3000/select-product/bronze-plaque/dedication/the-science-hall/knowledge-is-the-seed-of-progress
   ```

3. **Check the metadata**:
   - Right-click → View Page Source
   - Look for `<title>`, `<meta name="description">`, `<script type="application/ld+json">`
   - Should see proper SEO tags

4. **Test navigation**:
   - Click template cards
   - Follow breadcrumbs
   - Click "Customize This Template" button

## Adding More Templates - Step by Step

### Example: Add "Hospital Wing" Template

1. **Open** `lib/seo-templates.ts`

2. **Find** `bronzePlaqueDedications` array

3. **Add** your template:
   ```typescript
   {
     id: 'bd-011',
     venue: 'Anderson Children\'s Hospital',
     venueSlug: 'anderson-childrens-hospital',
     inscription: 'Where hope and healing meet',
     inscriptionSlug: 'where-hope-and-healing-meet',
     category: 'civic',
     metadata: {
       title: 'Bronze Plaque for Anderson Children\'s Hospital - Where Hope and Healing Meet',
       description: 'Design a custom bronze dedication plaque for Anderson Children\'s Hospital. Professional engraving, lasting tribute to pediatric care.',
       keywords: ['hospital plaque', 'children hospital dedication', 'bronze hospital plaque', 'pediatric care memorial'],
     },
   },
   ```

4. **Save the file**

5. **Visit the new URL**:
   ```
   http://localhost:3000/select-product/bronze-plaque/dedication/anderson-childrens-hospital/where-hope-and-healing-meet
   ```

6. **Done!** The page is automatically generated with:
   - Proper title and metadata
   - Correct heading structure
   - Template preview
   - CTA buttons
   - Related templates

## Connecting to Your Design Tool

### Current Flow (What Needs to Be Built)

When user clicks "Customize This Template", you want:

1. **User is on**:
   ```
   /select-product/bronze-plaque/dedication/the-science-hall/knowledge-is-the-seed-of-progress
   ```

2. **User clicks**: "Customize This Template" button

3. **Navigate to**:
   ```
   /inscriptions?template=bd-001
   ```
   Or directly call the store loader

4. **In your inscriptions page**, detect the template param and load it:

### Option A: URL Parameter (Recommended)

**In your template page** (`[inscription]/page.tsx`), update the CTA link:

```typescript
<Link
  href={`/inscriptions?template=${template.id}&product=${productSlug}`}
  className="rounded-lg bg-blue-600 px-8 py-3..."
>
  Customize This Template
</Link>
```

**In your inscriptions page** (`app/inscriptions/page.tsx`), add:

```typescript
'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadDedicationTemplate } from '#/lib/template-loader';
import { getDedicationTemplate } from '#/lib/seo-templates';

export default function InscriptionsPage() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');

  useEffect(() => {
    if (templateId && templateId.startsWith('bd-')) {
      // Get template data
      const template = bronzePlaqueDedications.find(t => t.id === templateId);
      if (template) {
        loadDedicationTemplate(template.venueSlug, template.inscriptionSlug);
      }
    }
  }, [templateId]);

  return (
    // Your existing inscriptions UI
  );
}
```

### Option B: Direct Store Update

**Create a client component** in the template page:

```typescript
// app/select-product/[productSlug]/[templateType]/[venue]/[inscription]/TemplateLoader.tsx
'use client';

import { useEffect } from 'react';
import { loadDedicationTemplate } from '#/lib/template-loader';

export default function TemplateLoader({ 
  venue, 
  inscription 
}: { 
  venue: string; 
  inscription: string;
}) {
  useEffect(() => {
    // Auto-load when component mounts
    loadDedicationTemplate(venue, inscription);
  }, [venue, inscription]);

  return null; // This is just a loader, no UI
}
```

**In your page**, import and use it:

```typescript
import TemplateLoader from './TemplateLoader';

export default async function TemplatePage({ params }: Props) {
  // ... existing code ...

  return (
    <Boundary>
      <TemplateLoader venue={venue} inscription={inscription} />
      {/* Rest of your JSX */}
    </Boundary>
  );
}
```

Now when the page loads, the design is automatically pre-populated!

## Real-World Example: Complete Flow

### User Journey with Code

1. **User searches Google**: "bronze plaque for university library"

2. **Finds your page**:
   ```
   /select-product/bronze-plaque/dedication/university-library/gateway-to-wisdom-and-discovery
   ```

3. **Page renders** with this data:
   ```typescript
   // From lib/seo-templates.ts
   {
     id: 'bd-004',
     venue: 'University Library',
     venueSlug: 'university-library',
     inscription: 'Gateway to wisdom and discovery',
     inscriptionSlug: 'gateway-to-wisdom-and-discovery',
     metadata: {
       title: 'University Library Bronze Plaque - Gateway to Wisdom and Discovery',
       description: 'Custom bronze dedication plaque for university libraries...',
       keywords: ['university library plaque', 'library dedication', ...]
     }
   }
   ```

4. **User sees**:
   - H1: "Bronze Plaque Dedication for University Library"
   - Description: "Gateway to wisdom and discovery"
   - Template preview card
   - "Customize This Template" button

5. **User clicks** "Customize This Template"

6. **Navigates to**: `/inscriptions?template=bd-004`

7. **inscriptions page** detects `template=bd-004` and calls:
   ```typescript
   loadDedicationTemplate('university-library', 'gateway-to-wisdom-and-discovery')
   ```

8. **This updates your Zustand store**:
   ```typescript
   {
     inscriptionLines: [
       {
         text: "University Library",
         font: "Times New Roman",
         color: "#8B7355",
         size: 80,
         position: { x: 0, y: 0.15, z: 0.01 },
       },
       {
         text: "Gateway to wisdom and discovery",
         font: "Times New Roman",
         color: "#8B7355",
         size: 60,
         position: { x: 0, y: 0.05, z: 0.01 },
       }
     ],
     size: { width: 600, height: 400 }
   }
   ```

9. **User sees** their 3D preview with text already loaded!

10. **User makes** minor adjustments (font, size, position)

11. **User gets** quote and orders

## Expanding to 1,000 Templates

### Strategy: Generate from Common Patterns

Instead of manually writing 1,000 templates, generate them programmatically:

```typescript
// lib/seo-templates.ts - Add this section

// Common venues for dedication plaques
const educationVenues = [
  'Science Building', 'Library', 'Student Center', 'Athletic Center',
  'Music Hall', 'Art Gallery', 'Lecture Hall', 'Research Center'
];

const educationInscriptions = [
  'Knowledge is the seed of progress',
  'Dedicated to learning and discovery',
  'Where minds grow and dreams take flight',
  'Education lights the path to the future',
  'In pursuit of excellence',
];

// Generate all combinations
const generatedEducationTemplates = [];
let id = 100;

for (const venue of educationVenues) {
  for (const inscription of educationInscriptions) {
    generatedEducationTemplates.push({
      id: `bd-${id++}`,
      venue: venue,
      venueSlug: slugify(venue),
      inscription: inscription,
      inscriptionSlug: slugify(inscription),
      category: 'education',
      metadata: {
        title: `Bronze Plaque for ${venue} - ${inscription}`,
        description: `Design a custom bronze dedication plaque for ${venue} with the inscription "${inscription}". Professional engraving, lasting quality.`,
        keywords: [
          `${venue.toLowerCase()} plaque`,
          'bronze dedication',
          inscription.toLowerCase(),
          'education plaque',
        ],
      },
    });
  }
}

// Now you have 8 × 5 = 40 templates from this alone!
export const allDedicationTemplates = [
  ...bronzePlaqueDedications,
  ...generatedEducationTemplates,
];
```

Repeat for:
- Civic venues (town halls, parks, etc.)
- Religious venues (churches, chapels, etc.)
- Military venues (memorials, bases, etc.)
- Corporate venues (headquarters, factories, etc.)

Result: **1,000+ templates** with minimal manual work!

## Material + Shape Combinations

### Create These Routes Next

**File**: `app/select-material/[materialSlug]/[shapeSlug]/page.tsx`

**URL**: `/select-material/imperial-red/serpentine`

**What it does**:
1. Shows "Imperial Red Serpentine Headstone" page
2. Pre-selects Imperial Red material + Serpentine shape in store
3. Shows example designs with this combination
4. CTA: "Design with this combination" → jumps to size selection

**Code**:
```typescript
'use cache';

import { Metadata } from 'next';
import { materialSEOData, shapeSEOData } from '#/lib/seo-templates';

export async function generateMetadata({ params }): Promise<Metadata> {
  const { materialSlug, shapeSlug } = await params;
  const material = materialSEOData[materialSlug];
  const shape = shapeSEOData[shapeSlug];

  return {
    title: `${material.name} ${shape.name} Headstone - Custom Memorial Design | DYO`,
    description: `Design a ${material.name} ${shape.name} headstone. ${material.properties[0]}. Available in all sizes.`,
    keywords: [
      `${material.name.toLowerCase()} ${shape.name.toLowerCase()} headstone`,
      `${material.name.toLowerCase()} headstone`,
      `${shape.name.toLowerCase()} headstone`,
    ],
  };
}

export default async function MaterialShapePage({ params }) {
  const { materialSlug, shapeSlug } = await params;
  const material = materialSEOData[materialSlug];
  const shape = shapeSEOData[shapeSlug];

  return (
    <div>
      <h1>{material.name} {shape.name} Headstone</h1>
      {/* Material properties */}
      {/* Shape features */}
      {/* Example designs */}
      <Link href={`/select-size?material=${materialSlug}&shape=${shapeSlug}`}>
        Design This Combination
      </Link>
    </div>
  );
}
```

## Sitemap Generation

### Create This File

**File**: `app/sitemap.ts`

```typescript
import { MetadataRoute } from 'next';
import { 
  allDedicationTemplates, // after you expand
  productSEOData, 
  materialSEOData, 
  shapeSEOData 
} from '#/lib/seo-templates';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://yourdomain.com';

  // Product pages
  const products = Object.keys(productSEOData).map(slug => ({
    url: `${baseUrl}/select-product/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  // Template pages
  const templates = allDedicationTemplates.map(t => ({
    url: `${baseUrl}/select-product/bronze-plaque/dedication/${t.venueSlug}/${t.inscriptionSlug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Material pages
  const materials = Object.keys(materialSEOData).map(slug => ({
    url: `${baseUrl}/select-material/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...products,
    ...templates,
    ...materials,
  ];
}
```

Now visit: `http://localhost:3000/sitemap.xml`

## Quick Wins - Do This First

1. **Test existing routes** (5 minutes)
2. **Add 10 more dedication templates** (30 minutes)
3. **Connect template to store** (1 hour)
4. **Test full flow**: Template → Design → Preview (1 hour)
5. **Generate sitemap** (30 minutes)
6. **Deploy and submit to Google Search Console** (1 hour)

Total time to launch: **4 hours**

Then watch the rankings come in over the next 3-6 months!

## Questions to Consider

1. **Which templates are most valuable?**
   - Focus on high-search-volume venues/inscriptions first
   - Check Google Keyword Planner for "bronze plaque for [venue]"

2. **How many to pre-render?**
   - Top 100 at build time
   - Rest on-demand with ISR
   - Use analytics to refine after launch

3. **How to track success?**
   - Google Search Console for impressions/clicks
   - Google Analytics for traffic source
   - Your own conversion tracking: Template → Order

4. **When to expand?**
   - After seeing traction on initial templates
   - Focus on categories that convert
   - Double down on what works

This is your complete playbook to transform DYO into an SEO-driven customer acquisition machine!
