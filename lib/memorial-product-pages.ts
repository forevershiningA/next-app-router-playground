import fs from 'fs';
import path from 'path';
import { DOMParser } from '@xmldom/xmldom';
import { data, type Product } from '#/app/_internal/_data';

export type MemorialTypeSlug =
  | 'headstones'
  | 'plaques'
  | 'full-monuments'
  | 'urns'
  | 'pet-memorials';

type PageConfig = {
  slug: MemorialTypeSlug;
  title: string;
  navLabel: string;
  intro: string;
  categoryIds: string[];
  productIds?: string[];
  tutorialTags: string[];
  gallery: MemorialGalleryImage[];
};

export type MemorialGalleryImage = {
  src: string;
  alt: string;
};

export type ProductShapeSummary = {
  name: string;
  code: string;
  widthRange?: string;
  heightRange?: string;
};

export type ProductPageItem = Product & {
  displayName: string;
  description: string;
  sizeText: string;
  shapes: ProductShapeSummary[];
};

export type MemorialTypePageData = PageConfig & {
  products: ProductPageItem[];
  tutorialNotes: string[];
};

const PRODUCT_DESCRIPTION_TAGS: Record<string, string> = {
  '1': 'one_colour_glass_backed_motif_description',
  '4': 'laser_etched_black_granite_headstone_description',
  '5': 'bronze_plaque_description',
  '22': 'laser_etched_black_granite_mini_headstone_description',
  '23': 'one_colour_glass_backed_motif_description',
  '30': 'laser_etched_black_granite_plaque_description',
  '32': 'full_colour_plaque_description',
  '34': 'traditional_engraved_plaque_description',
  '52': 'yag_lasered_stainless_steel_plaque_description',
  '100': 'laser_etched_black_granite_full_monument_description',
  '101': 'traditional_engraved_full_monument_description',
  '124': 'traditional_engraved_headstone_description',
  '2350': 'stainless_steel_vitreous_urn_description',
};

const PRODUCT_SIZE_TAGS: Record<string, string> = {
  '4': 'headstone_sizes',
  '5': 'bronze_plaque_sizes',
  '22': 'select_installation_description',
  '30': 'plaques_sizes',
  '32': 'full_colour_plaque_size',
  '34': 'traditional_plaques_sizes',
  '52': 'yag_lasered_stainless_steel_plaque_sizes',
  '100': 'headstone_sizes',
  '101': 'headstone_sizes_traditional',
  '124': 'headstone_sizes_traditional',
  '2350': 'background_vitreous_description',
};

export const memorialTypePages: Record<MemorialTypeSlug, PageConfig> = {
  headstones: {
    slug: 'headstones',
    title: 'Headstones',
    navLabel: 'Headstones',
    intro:
      'Design Headstones online using the same product, shape, material, size, inscription, image and motif steps available in the Designer.',
    categoryIds: ['headstones'],
    tutorialTags: [
      'headstone_sizes',
      'headstone_sizes_traditional',
      'instructions_backgrounds_traditional',
      'photo_info_laser',
      'motifs_info_laser',
    ],
    gallery: [
      {
        src: 'https://www.forevershining.com.au/wp-content/uploads/2024/08/square-headstone-705x705.png',
        alt: 'Square headstone gallery example',
      },
      {
        src: 'https://www.forevershining.com.au/wp-content/uploads/2024/08/plant-headstone-705x705.png',
        alt: 'Plant shaped headstone gallery example',
      },
      {
        src: 'https://www.forevershining.com.au/wp-content/uploads/2024/08/double-headstone-705x705.png',
        alt: 'Double headstone gallery example',
      },
    ],
  },
  plaques: {
    slug: 'plaques',
    title: 'Plaques',
    navLabel: 'Plaques',
    intro:
      'Compare Bronze Plaques, Memorial Plaques, Full Colour Plaques, Traditional Engraved Plaques and stainless steel plaque options.',
    categoryIds: ['plaques'],
    tutorialTags: [
      'bronze_plaque_description',
      'bronze_plaque_sizes',
      'plaques_sizes',
      'instructions_sizes',
      'bronze_borders',
      'motifs_info_bronze',
    ],
    gallery: [
      {
        src: 'https://www.forevershining.com.au/wp-content/uploads/2021/07/Abela-plaque-705x705.jpg',
        alt: 'Bronze plaque gallery example',
      },
      {
        src: 'https://www.forevershining.com.au/wp-content/uploads/2021/07/Afshar-plaque-705x705.jpg',
        alt: 'Memorial plaque gallery example',
      },
      {
        src: 'https://www.forevershining.com.au/wp-content/uploads/2021/07/ANZAC-plaque-1-705x705.jpg',
        alt: 'ANZAC plaque gallery example',
      },
    ],
  },
  'full-monuments': {
    slug: 'full-monuments',
    title: 'Full Monuments',
    navLabel: 'Full Monuments',
    intro:
      'Plan complete Full Monuments with upright tablet, base, ledger, kerb and matching stone components.',
    categoryIds: ['monuments'],
    tutorialTags: [
      'full_monument',
      'laser_etched_black_granite_full_monument_description',
      'traditional_engraved_full_monument_description',
      'headstone_sizes_traditional',
      'motifs_info_trad',
    ],
    gallery: [
      {
        src: 'https://www.forevershining.com.au/wp-content/uploads/2024/08/realistic-book-fullmonument-705x705.png',
        alt: 'Book style full monument gallery example',
      },
      {
        src: 'https://www.forevershining.com.au/wp-content/uploads/2024/08/serp-fullmonument-with-ledger-705x705.png',
        alt: 'Serpentine full monument with ledger gallery example',
      },
      {
        src: 'https://www.forevershining.com.au/wp-content/uploads/2021/07/Aird-full-monument-705x705.jpg',
        alt: 'Full monument gallery example',
      },
    ],
  },
  urns: {
    slug: 'urns',
    title: 'Urns',
    navLabel: 'Urns',
    intro:
      'Create personalised memorial Urns with vitreous enamel backgrounds, inscriptions, motifs and photo-based artwork.',
    categoryIds: ['urns'],
    tutorialTags: [
      'background_vitreous_description',
      'ceramic_photo_description',
      'motifs_info_bronze',
      'design_your_own_info',
    ],
    gallery: [
      {
        src: 'https://www.forevershining.com.au/wp-content/uploads/2021/08/Butterfly-urn-705x705.jpg',
        alt: 'Butterfly urn gallery example',
      },
      {
        src: 'https://www.forevershining.com.au/wp-content/uploads/2021/08/Campbell-urn-705x705.jpg',
        alt: 'Personalised urn gallery example',
      },
      {
        src: 'https://www.forevershining.com.au/wp-content/uploads/2021/08/Dalton-urn-705x705.jpg',
        alt: 'Memorial urn gallery example',
      },
    ],
  },
  'pet-memorials': {
    slug: 'pet-memorials',
    title: 'Pet Memorials',
    navLabel: 'Pet Memorials',
    intro:
      'Pet Memorials can be created from selected Plaque and Headstone products, using pet motifs, photo options and laser-etched layouts.',
    categoryIds: [],
    productIds: ['22', '30', '32', '5'],
    tutorialTags: [
      'laser_etched_black_granite_pet_mini_headstone_description',
      'laser_etched_black_granite_pet_plaque_description',
      'laser_etched_black_granite_pet_plaque_shapes',
      'motifs_info_pet',
    ],
    gallery: [
      {
        src: 'https://www.forevershining.com.au/wp-content/uploads/2021/07/Ace-pet-mini-headstone-705x705.jpg',
        alt: 'Pet headstone gallery example',
      },
      {
        src: 'https://www.forevershining.com.au/wp-content/uploads/2021/07/Bean-pet-plaque-705x705.jpg',
        alt: 'Pet plaque gallery example',
      },
      {
        src: 'https://www.forevershining.com.au/wp-content/uploads/2021/07/Bell-pet-rock-705x705.jpg',
        alt: 'Pet rock memorial gallery example',
      },
    ],
  },
};

function readPublicXml(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), 'public', 'xml', relativePath), 'utf8');
}

function parseXml(xml: string) {
  return new DOMParser().parseFromString(xml, 'text/xml');
}

function getText(doc: Document, tag: string) {
  return doc.getElementsByTagName(tag)[0]?.textContent ?? '';
}

function plainText(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|li|ul)>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function shortText(value: string, max = 280) {
  const text = plainText(value);
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}...`;
}

function publicProductName(name: string) {
  return name.replace(/\bMini Headstone\b/g, 'Headstone');
}

function formatRange(min?: string, max?: string) {
  if (!min || !max) return undefined;
  return min === max ? `${min}mm` : `${min}-${max}mm`;
}

function getCatalogShapes(productId: string): ProductShapeSummary[] {
  const file = path.join(process.cwd(), 'public', 'xml', `catalog-id-${productId}.xml`);
  if (!fs.existsSync(file)) return [];

  const doc = parseXml(fs.readFileSync(file, 'utf8'));
  const shapes = Array.from(doc.getElementsByTagName('shape'));
  const seen = new Set<string>();

  const summaries: ProductShapeSummary[] = [];

  shapes.forEach((shape) => {
      const table = Array.from(shape.getElementsByTagName('file')).find(
        (fileNode) => fileNode.getAttribute('type') === 'table',
      );
      const name = shape.getAttribute('name') || shape.getAttribute('code') || 'Shape';
      const code = shape.getAttribute('code') || name;
      const key = `${name}-${code}`;
      if (seen.has(key)) return;
      seen.add(key);

      summaries.push({
        name,
        code,
        widthRange: formatRange(table?.getAttribute('min_width') ?? undefined, table?.getAttribute('max_width') ?? undefined),
        heightRange: formatRange(table?.getAttribute('min_height') ?? undefined, table?.getAttribute('max_height') ?? undefined),
      });
    });

  return summaries.slice(0, 8);
}

function productsForConfig(config: PageConfig) {
  if (config.productIds) {
    return config.productIds
      .map((id) => data.products.find((product) => product.id === id))
      .filter((product): product is Product => Boolean(product));
  }

  return data.products.filter((product) => config.categoryIds.includes(product.category));
}

export function getMemorialTypePageData(slug: MemorialTypeSlug): MemorialTypePageData {
  const config = memorialTypePages[slug];
  const languageDoc = parseXml(readPublicXml('au_EN/languages24.xml'));
  const products = productsForConfig(config).map((product) => {
    const descriptionTag = PRODUCT_DESCRIPTION_TAGS[product.id];
    const sizeTag = PRODUCT_SIZE_TAGS[product.id];
    const xmlDescription = descriptionTag ? getText(languageDoc, descriptionTag) : '';
    const xmlSize = sizeTag ? getText(languageDoc, sizeTag) : '';

    return {
      ...product,
      displayName: publicProductName(product.name),
      description: shortText(xmlDescription || `${product.name} can be configured in the Designer with shapes, materials, inscriptions, motifs and images.`),
      sizeText: shortText(xmlSize, 180),
      shapes: getCatalogShapes(product.id),
    };
  });

  const tutorialNotes = config.tutorialTags
    .map((tag) => shortText(getText(languageDoc, tag), 320))
    .filter(Boolean)
    .slice(0, 5);

  return {
    ...config,
    products,
    tutorialNotes,
  };
}

export function isMemorialTypeSlug(slug: string): slug is MemorialTypeSlug {
  return Object.prototype.hasOwnProperty.call(memorialTypePages, slug);
}
