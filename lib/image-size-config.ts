export type ImageSizeOption = {
  width: number;
  height: number;
  label: string;
};

const RAW_IMAGE_SIZE_CONFIGS: Record<string, Array<[number, number]>> = {
  '7': [
    [40, 60],
    [50, 70],
    [60, 80],
    [70, 90],
    [80, 100],
    [90, 120],
    [110, 150],
    [130, 180],
    [180, 240],
    [240, 300],
  ],
  '200': [
    [30, 40],
    [40, 60],
    [50, 70],
    [60, 80],
    [70, 90],
    [80, 100],
    [90, 120],
    [100, 130],
    [110, 150],
    [130, 180],
    [180, 240],
  ],
  '201': [
    [50, 70],
    [60, 80],
    [70, 90],
    [80, 100],
    [90, 120],
    [110, 150],
    [130, 180],
  ],
  '202': [
    [55, 75],
    [60, 80],
    [70, 90],
    [80, 100],
    [90, 120],
    [110, 150],
  ],
  '2300': [
    [50, 70],
    [60, 80],
    [70, 90],
    [80, 100],
    [90, 120],
    [110, 150],
    [130, 180],
    [180, 240],
  ],
  '2400': [
    [55, 75],
    [60, 80],
    [70, 90],
    [80, 100],
    [90, 120],
    [110, 150],
  ],
};

const buildLabel = (width: number, height: number) => `${width} mm × ${height} mm`;

const IMAGE_SIZE_CONFIGS: Record<string, ImageSizeOption[]> = Object.fromEntries(
  Object.entries(RAW_IMAGE_SIZE_CONFIGS).map(([typeId, sizes]) => [
    typeId,
    sizes.map(([width, height]) => ({ width, height, label: buildLabel(width, height) })),
  ]),
);

const FLEXIBLE_IMAGE_TYPE_IDS = new Set(['21', '135', '136', '137']);

type FlexibleImageBounds = {
  minHeight: number;
  maxHeight: number;
  initHeight: number;
};

const FLEXIBLE_IMAGE_BOUNDS: Record<string, FlexibleImageBounds> = {
  '21': { minHeight: 30, maxHeight: 1200, initHeight: 50 },
  '135': { minHeight: 30, maxHeight: 1200, initHeight: 50 },
  '136': { minHeight: 30, maxHeight: 300, initHeight: 50 },
  '137': { minHeight: 30, maxHeight: 1200, initHeight: 50 },
};

export function getImageSizeOptions(typeId: number | string): ImageSizeOption[] {
  return IMAGE_SIZE_CONFIGS[String(typeId)] ?? [];
}

export function getImageSizeOption(typeId: number | string, variant?: number): ImageSizeOption | null {
  const options = getImageSizeOptions(typeId);
  if (!options.length) return null;
  if (!variant || variant < 1) {
    return options[0];
  }
  const clampedIndex = Math.min(variant, options.length) - 1;
  return options[clampedIndex] ?? null;
}

export function isFlexibleImageType(typeId: number | string): boolean {
  return FLEXIBLE_IMAGE_TYPE_IDS.has(String(typeId));
}

export function getFlexibleImageBounds(typeId: number | string): FlexibleImageBounds | null {
  return FLEXIBLE_IMAGE_BOUNDS[String(typeId)] ?? null;
}

export { IMAGE_SIZE_CONFIGS };
