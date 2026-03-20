export type MaskShape =
  | 'oval'
  | 'horizontal-oval'
  | 'square'
  | 'rectangle'
  | 'heart'
  | 'teardrop'
  | 'triangle';

const MASK_URL_MAP: Record<MaskShape, string> = {
  oval: '/shapes/masks/oval_vertical.svg',
  'horizontal-oval': '/shapes/masks/oval_horizontal.svg',
  square: '/shapes/masks/rectangle_vertical.svg',
  rectangle: '/shapes/masks/rectangle_horizontal.svg',
  heart: '/shapes/masks/heart.svg',
  teardrop: '/shapes/masks/teardrop.svg',
  triangle: '/shapes/masks/triangle.svg',
};

const MASK_ASPECT_FALLBACK: Record<MaskShape, number> = {
  oval: 0.8,
  'horizontal-oval': 1.25,
  square: 0.8,
  rectangle: 1.25,
  heart: 640 / 600,
  teardrop: 0.71,
  triangle: 1.16,
};

export const MASK_OPTIONS: Array<{
  id: MaskShape;
  label: string;
  svg: string;
}> = [
  { id: 'oval', label: 'Oval', svg: MASK_URL_MAP.oval },
  { id: 'horizontal-oval', label: 'H. Oval', svg: MASK_URL_MAP['horizontal-oval'] },
  { id: 'square', label: 'Square', svg: MASK_URL_MAP.square },
  { id: 'rectangle', label: 'Rect', svg: MASK_URL_MAP.rectangle },
  { id: 'heart', label: 'Heart', svg: MASK_URL_MAP.heart },
  { id: 'teardrop', label: 'Tear', svg: MASK_URL_MAP.teardrop },
  { id: 'triangle', label: 'Triangle', svg: MASK_URL_MAP.triangle },
];

export const getMaskUrl = (mask: MaskShape) => MASK_URL_MAP[mask];

export const getMaskAspectRatio = (mask: MaskShape): number =>
  MASK_ASPECT_FALLBACK[mask] ?? 0.8;
