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
    DESIGN_CATEGORIES[category as DesignCategory]?.description ??
    `Memorial designs for ${getCategoryTitle(category).toLowerCase()} tributes.`
  );
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
