import type { Metadata } from 'next';
import { data } from '#/app/_internal/_data';
import type { DesignerStepSlug } from '#/lib/designer-route-state';

const PRODUCT_SLUG_OVERRIDES: Record<string, string> = {
  '1': 'stainless-steel-light-transmitting-headstone',
  '4': 'laser-etched-black-granite-headstone',
  '5': 'bronze-plaque',
  '8': 'laser-etched-pet-mini-headstone',
  '9': 'laser-etched-pet-plaque',
  '22': 'laser-etched-black-granite-headstone',
  '23': 'stainless-steel-light-reflective-headstone',
  '30': 'laser-etched-black-granite-plaque',
  '32': 'full-colour-plaque',
  '34': 'traditional-engraved-plaque',
  '52': 'yag-lasered-stainless-steel-plaque',
  '100': 'laser-etched-black-granite-full-monument',
  '101': 'traditional-engraved-full-monument',
  '124': 'traditional-engraved-headstone',
  '135': 'laser-etched-pet-rock',
  '2350': 'stainless-steel-vitreous-enamel-inlaid-urn',
};

const PRODUCT_META_DESCRIPTIONS: Record<string, string> = {
  '5': 'Choose a Bronze Plaque shape and continue designing a custom cast bronze memorial plaque with borders, inscriptions, motifs and fixing options.',
};

const DESIGNER_STEP_META: Partial<
  Record<
    DesignerStepSlug,
    {
      title: string;
      description: string;
      keywords: string[];
    }
  >
> = {
  'select-shape': {
    title: 'Shape Designer',
    description: 'Choose the shape and profile for your custom memorial design.',
    keywords: ['memorial shape', 'headstone shape', 'plaque shape'],
  },
  'select-border': {
    title: 'Border Designer',
    description: 'Choose a border style for your custom memorial plaque design.',
    keywords: ['memorial border', 'bronze plaque border', 'plaque frame'],
  },
  'select-material': {
    title: 'Material Designer',
    description: 'Choose the stone, metal, colour or background finish for your memorial.',
    keywords: ['memorial material', 'granite colours', 'memorial finish'],
  },
  'select-size': {
    title: 'Size Designer',
    description: 'Choose dimensions and size options for your custom memorial.',
    keywords: ['memorial size', 'headstone dimensions', 'plaque dimensions'],
  },
  inscriptions: {
    title: 'Inscription Designer',
    description: 'Write and arrange inscription text for your custom memorial.',
    keywords: ['memorial inscription', 'headstone text', 'plaque wording'],
  },
  'select-images': {
    title: 'Image Designer',
    description: 'Add and position a portrait or image on your custom memorial.',
    keywords: ['memorial photo', 'ceramic portrait', 'headstone image'],
  },
  'select-additions': {
    title: 'Additions Designer',
    description: 'Add vases, statues and accessories to your custom memorial.',
    keywords: ['memorial additions', 'headstone accessories', 'cemetery vase'],
  },
  'select-emblems': {
    title: 'Emblem Designer',
    description: 'Choose cast emblems and symbols for your custom bronze memorial plaque.',
    keywords: ['bronze plaque emblem', 'memorial emblem', 'cast emblem'],
  },
  'select-motifs': {
    title: 'Motif Designer',
    description: 'Choose religious, floral and decorative motifs for your memorial.',
    keywords: ['memorial motif', 'headstone symbol', 'plaque motif'],
  },
  'check-price': {
    title: 'Price Review',
    description: 'Review the configured memorial design and estimated price.',
    keywords: ['memorial price', 'headstone quote', 'plaque price'],
  },
  'design-menu': {
    title: 'Design Menu',
    description: 'Review and continue editing each section of your memorial design.',
    keywords: ['memorial designer', 'custom memorial design', 'online headstone designer'],
  },
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getDesignerProductSlug(productId: string) {
  const product = data.products.find((item) => item.id === productId);
  if (!product) return undefined;
  return PRODUCT_SLUG_OVERRIDES[product.id] ?? slugify(product.name);
}

export function getDesignerProductById(productId: string | null | undefined) {
  if (!productId) return undefined;
  return data.products.find((product) => product.id === productId);
}

export function getDesignerProductBySlug(productSlug: string | null | undefined) {
  if (!productSlug) return undefined;
  return data.products.find(
    (product) => getDesignerProductSlug(product.id) === productSlug,
  );
}

export function getDesignerProductStepHref(
  stepSlug: DesignerStepSlug,
  productId: string | null | undefined,
) {
  if (stepSlug === 'select-product') {
    return '/select-product';
  }

  const slug = getDesignerProductSlug(productId ?? '');
  return slug ? `/${slug}/${stepSlug}` : `/${stepSlug}`;
}

export function buildDesignerStepMetadata(
  productId: string,
  stepSlug: DesignerStepSlug,
): Metadata {
  const product = getDesignerProductById(productId);
  const step = DESIGNER_STEP_META[stepSlug] ?? DESIGNER_STEP_META['design-menu'];

  if (!product || !step) {
    return {
      title: { absolute: 'Memorial Designer | Forever Shining' },
      description:
        'Design a custom memorial online with Forever Shining.',
    };
  }

  const title = `${product.name} ${step.title} | Forever Shining`;
  const description =
    stepSlug === 'select-shape'
      ? PRODUCT_META_DESCRIPTIONS[product.id] ?? `${step.description} Tailored for ${product.name}.`
      : `${step.description} Tailored for ${product.name}.`;
  const slug = getDesignerProductSlug(product.id);
  const productKeywords = [
    product.name,
    `${product.name} designer`,
    `custom ${product.name}`,
  ];

  return {
    title: { absolute: title },
    description,
    keywords: [...productKeywords, ...step.keywords],
    alternates: slug
      ? {
          canonical: `/${slug}/${stepSlug}`,
        }
      : undefined,
    openGraph: {
      title,
      description,
      images: [`/api/og?title=${encodeURIComponent(product.name)}`],
    },
  };
}

export function buildSelectShapeMetadata(productId: string): Metadata {
  return buildDesignerStepMetadata(productId, 'select-shape');
}
