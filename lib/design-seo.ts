import fs from 'fs';
import path from 'path';
import {
  DESIGN_CATEGORIES,
  getAllSavedDesigns,
  type DesignCategory,
  type SavedDesignMetadata,
} from '#/lib/saved-designs-data';

export const INDEXABLE_PRODUCT_SLUGS = new Set([
  'laser-etched-headstone',
  'traditional-headstone',
  'bronze-plaque',
  'traditional-plaque',
  'laser-colour-plaque',
  'stainless-steel-plaque',
  'mini-headstone',
  'full-colour-plaque',
  'traditional-monument',
  'laser-monument',
  'pets',
]);

export const MIN_INDEXABLE_CATEGORY_DESIGNS = 5;

type ProductSeoInfo = {
  name: string;
  shortName: string;
  kind: 'headstone' | 'plaque' | 'monument' | 'memorial';
  finish: string;
  description: string;
};

type CategorySeoCopy = {
  description: string;
  intro: string;
  points: string[];
};

const categorySeoCopy: Record<string, CategorySeoCopy> = {
  'butterfly-memorial': {
    description:
      'Butterfly headstone and plaque designs for granite memorials, photo etching and engraved remembrance layouts.',
    intro:
      'Compare butterfly headstone designs across black granite, engraved stone and plaque formats. These layouts are suited to families looking for butterfly engraving, symbolic transformation motifs, photo panels and soft floral detail.',
    points: [
      'Butterfly motifs can be placed beside portraits, above inscriptions or as paired corner details.',
      'Laser-etched black granite works well for detailed butterfly artwork and fine wing texture.',
      'Traditional engraved designs keep the butterfly detail simpler for cemetery-ready readability.',
    ],
  },
  'floral-memorial': {
    description:
      'Flower headstone engraving designs with roses, sprays and botanical details for granite memorials and plaques.',
    intro:
      'Browse flower headstone engraving designs with roses, sprays, borders and botanical motifs. These templates help compare how floral artwork balances with names, dates, verses and photo areas before personalisation.',
    points: [
      'Rose and flower sprays are useful for corners, side panels and gentle inscription framing.',
      'Laser etching supports detailed petals and shaded floral artwork on polished black granite.',
      'Engraved floral layouts keep the wording prominent while adding a traditional decorative accent.',
    ],
  },
  'dove-memorial': {
    description:
      'Dove headstone engraving and memorial plaque designs with peaceful bird motifs, scripture and remembrance wording.',
    intro:
      'Explore dove memorial designs for headstones and plaques, including peaceful bird motifs, scripture-led layouts and gentle remembrance wording. Dove artwork can suit religious, biblical and non-denominational tributes.',
    points: [
      'Dove motifs pair well with crosses, clouds, open sky artwork and short memorial verses.',
      'Bird engraving can be kept minimal for traditional stone or more detailed for laser-etched granite.',
      'These layouts leave clear space for readable names, dates and family wording.',
    ],
  },
  'pet-memorial': {
    description:
      'Pet memorial headstone and plaque designs for dogs, cats and companion animals, including horse memorial layouts.',
    intro:
      'Choose pet memorial designs for dogs, cats, horses and companion animals. The templates include black granite pet headstones, pet plaques and layouts with photos, paw prints, landscape artwork and animal motifs.',
    points: [
      'Photo-led layouts are useful when the pet portrait is the main remembrance detail.',
      'Horse memorial designs can use landscape, pasture or silhouette artwork alongside the inscription.',
      'Compact pet plaques and mini headstones keep the wording readable in smaller cemetery or garden spaces.',
    ],
  },
};

const productSeoInfo: Record<string, ProductSeoInfo> = {
  'laser-etched-headstone': {
    name: 'Laser-Etched Black Granite Headstone',
    shortName: 'Laser-Etched Headstone',
    kind: 'headstone',
    finish: 'laser-etched black granite',
    description:
      'Photo-realistic laser engraving on polished black granite for portraits, landscapes, verses and detailed memorial artwork.',
  },
  'traditional-headstone': {
    name: 'Traditional Engraved Headstone',
    shortName: 'Traditional Headstone',
    kind: 'headstone',
    finish: 'traditional engraved granite',
    description:
      'Timeless granite memorials with sandblasted inscriptions, hand-painted lettering and classic cemetery proportions.',
  },
  'bronze-plaque': {
    name: 'Bronze Memorial Plaque',
    shortName: 'Bronze Plaque',
    kind: 'plaque',
    finish: 'cast bronze',
    description:
      'Cast bronze memorial plaques with durable lettering, decorative borders and long-lasting cemetery-grade finishes.',
  },
  'traditional-plaque': {
    name: 'Traditional Engraved Plaque',
    shortName: 'Traditional Plaque',
    kind: 'plaque',
    finish: 'traditional engraved stone',
    description:
      'Classic engraved plaques for cremation niches, memorial walls, gardens and compact cemetery markers.',
  },
  'laser-colour-plaque': {
    name: 'Laser Colour Memorial Plaque',
    shortName: 'Laser Colour Plaque',
    kind: 'plaque',
    finish: 'colour laser-etched',
    description:
      'Colour memorial plaques for photo-led tributes, custom artwork and compact personalised memorial layouts.',
  },
  'stainless-steel-plaque': {
    name: 'Stainless Steel Memorial Plaque',
    shortName: 'Stainless Steel Plaque',
    kind: 'plaque',
    finish: 'stainless steel',
    description:
      'Modern stainless steel memorial plaques with clean lettering, reflective finishes and durable outdoor presentation.',
  },
  'mini-headstone': {
    name: 'Mini Headstone',
    shortName: 'Mini Headstone',
    kind: 'headstone',
    finish: 'compact black granite',
    description:
      'Small-format headstone designs for garden memorials, cremation memorials and compact remembrance spaces.',
  },
  'full-colour-plaque': {
    name: 'Full Colour Memorial Plaque',
    shortName: 'Full Colour Plaque',
    kind: 'plaque',
    finish: 'full colour',
    description:
      'Full colour memorial plaque designs for image-rich, highly personalised tribute plaques.',
  },
  'traditional-monument': {
    name: 'Traditional Monument',
    shortName: 'Traditional Monument',
    kind: 'monument',
    finish: 'traditional engraved granite',
    description:
      'Full monument layouts with traditional engraving, bases, ledgers and larger cemetery memorial proportions.',
  },
  'laser-monument': {
    name: 'Laser-Etched Monument',
    shortName: 'Laser Monument',
    kind: 'monument',
    finish: 'laser-etched granite',
    description:
      'Full monument designs with laser-etched granite panels, detailed imagery and personalised inscription layouts.',
  },
  pets: {
    name: 'Pet Memorial',
    shortName: 'Pet Memorial',
    kind: 'memorial',
    finish: 'pet memorial',
    description:
      'Pet memorial designs for dogs, cats and companion animals with photos, motifs and personal wording.',
  },
};

export function getProductSeoInfo(productSlug: string): ProductSeoInfo {
  return productSeoInfo[productSlug] ?? {
    name: formatSlug(productSlug),
    shortName: formatSlug(productSlug),
    kind: 'memorial',
    finish: 'custom memorial',
    description: 'Custom memorial designs with personalised inscriptions, motifs and live preview.',
  };
}

export function formatSlug(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getCategoryTitle(category: string): string {
  return DESIGN_CATEGORIES[category as DesignCategory]?.name ?? formatSlug(category);
}

export function getCategoryDescription(category: string): string {
  return (
    categorySeoCopy[category]?.description ??
    DESIGN_CATEGORIES[category as DesignCategory]?.description ??
    `Memorial designs for ${getCategoryTitle(category).toLowerCase()} tributes.`
  );
}

export function getCategorySeoCopy(category: string): CategorySeoCopy | undefined {
  return categorySeoCopy[category];
}

export function getScreenshotIds(): Set<string> {
  const dir = path.join(process.cwd(), 'public', 'screenshots', 'v2026-3d');
  if (!fs.existsSync(dir)) return new Set();

  return new Set(
    fs
      .readdirSync(dir)
      .filter((file) => file.endsWith('.png') && !file.includes('_small'))
      .map((file) => file.replace('.png', '')),
  );
}

export function getSeoReadyDesigns(): SavedDesignMetadata[] {
  const screenshotIds = getScreenshotIds();
  return getAllSavedDesigns().filter(
    (design) =>
      INDEXABLE_PRODUCT_SLUGS.has(design.productSlug) &&
      (screenshotIds.size === 0 || screenshotIds.has(design.id)),
  );
}

export function groupDesignsByProduct(designs: SavedDesignMetadata[]) {
  const groups = new Map<string, SavedDesignMetadata[]>();
  for (const design of designs) {
    const group = groups.get(design.productSlug) ?? [];
    group.push(design);
    groups.set(design.productSlug, group);
  }

  return Array.from(groups.entries()).sort((a, b) => b[1].length - a[1].length);
}

export function groupDesignsByCategory(designs: SavedDesignMetadata[]) {
  const groups = new Map<string, SavedDesignMetadata[]>();
  for (const design of designs) {
    const group = groups.get(design.category) ?? [];
    group.push(design);
    groups.set(design.category, group);
  }

  return Array.from(groups.entries()).sort((a, b) => b[1].length - a[1].length);
}

export function isIndexableCategoryDesignSet(designs: SavedDesignMetadata[]) {
  return designs.length >= MIN_INDEXABLE_CATEGORY_DESIGNS;
}
