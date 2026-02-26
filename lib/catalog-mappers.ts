import type {
  Material as MaterialOption,
  ShapeOption,
  BorderOption,
  MotifCatalogItem,
} from '#/lib/headstone-store';

const MATERIAL_TEXTURE_FALLBACKS: Record<string, string> = {
  'polished-black-granite': 'Noble-Black.webp',
  'luka-grey-granite': 'G633.webp',
  'bronze-classic': '01.webp',
};

const SHAPE_IMAGE_FALLBACKS: Record<string, string> = {
  'oval-landscape': 'oval_horizontal.svg',
  'heart-classic': 'pet_heart.svg',
  'rectangle-landscape': 'landscape.svg',
};

const BORDER_IMAGE_FALLBACKS: Record<string, string> = {
  'border-001': 'border1.svg',
  'border-002': 'border2.svg',
};

const MOTIF_SVG_FALLBACKS: Record<string, string> = {
  'MOTIF-ROSE-01': '/shapes/motifs/flower_rose_03.svg',
  'MOTIF-CROSS-02': '/shapes/motifs/cross_001.svg',
};

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

const filenameFromPath = (value?: string | null) => {
  if (!value) return null;
  const segments = value.split('/');
  return segments[segments.length - 1] || value;
};

export const mapMaterialRecord = (material: any): MaterialOption => {
  const attrs = toRecord(material.attributes);
  const fallbackImage = MATERIAL_TEXTURE_FALLBACKS[material.slug];
  return {
    id: material.slug,
    name: material.name,
    category: material.category,
    image: (attrs.image as string | undefined) ?? fallbackImage ?? filenameFromPath(material.thumbnailUrl),
    textureUrl: (attrs.textureUrl as string | undefined) ?? null,
    thumbnailUrl: (attrs.thumbnailUrl as string | undefined) ?? material.thumbnailUrl ?? null,
  };
};

export const mapShapeRecord = (shape: any): ShapeOption => {
  const attrs = toRecord(shape.attributes);
  return {
    id: shape.slug,
    name: shape.name,
    category: shape.section,
    image: (attrs.image as string | undefined) ?? SHAPE_IMAGE_FALLBACKS[shape.slug] ?? filenameFromPath(shape.previewUrl),
    previewUrl: shape.previewUrl ?? (attrs.previewUrl as string | undefined) ?? null,
    maskKey: shape.maskKey,
  };
};

export const mapBorderRecord = (border: any): BorderOption => {
  const attrs = toRecord(border.attributes);
  return {
    id: border.slug,
    name: border.name,
    category: border.category,
    image: (attrs.image as string | undefined) ?? BORDER_IMAGE_FALLBACKS[border.slug] ?? filenameFromPath(border.svgUrl),
    svgUrl: border.svgUrl ?? (attrs.svgUrl as string | undefined) ?? null,
  };
};

export const mapMotifRecord = (motif: any): MotifCatalogItem => {
  const attrs = toRecord(motif.attributes);
  const fallbackSvg = MOTIF_SVG_FALLBACKS[motif.sku];
  const svgUrl = motif.svgUrl ?? (attrs.svgUrl as string | undefined) ?? fallbackSvg ?? null;
  return {
    id: motif.sku,
    name: motif.name,
    category: motif.category,
    svgUrl,
    previewUrl: motif.previewUrl ?? (attrs.previewUrl as string | undefined) ?? svgUrl,
    priceCents: motif.priceCents ?? null,
  };
};
