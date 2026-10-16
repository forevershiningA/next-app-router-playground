import type { HeadstoneState } from '#/lib/headstone-store.types';
import {
  MAX_HEADSTONE_DIM,
  MIN_HEADSTONE_DIM,
} from '#/lib/headstone-store.types';
import type { ShapeData } from '#/lib/xml-parser';

type CurrentDimensions = Pick<
  HeadstoneState,
  | 'widthMm'
  | 'heightMm'
  | 'baseWidthMm'
  | 'baseHeightMm'
  | 'baseThickness'
  | 'uprightThickness'
>;

export function deriveProductDimensions(
  shape: ShapeData,
  current: CurrentDimensions,
  options: {
    forceSquarePlaque: boolean;
    hasBase: boolean;
    previousHeadstoneHeight: number;
    previousBaseHeight: number;
  },
) {
  const widthMin = shape.table.minWidth || MIN_HEADSTONE_DIM;
  const widthMax = shape.table.maxWidth || MAX_HEADSTONE_DIM;
  const heightMin = shape.table.minHeight || MIN_HEADSTONE_DIM;
  const heightMax = shape.table.maxHeight || MAX_HEADSTONE_DIM;
  const baseWidthMin = shape.stand?.minWidth || widthMin;
  const baseWidthMax =
    shape.stand?.maxWidth || Math.max(baseWidthMin, MAX_HEADSTONE_DIM * 1.5);
  const baseHeightMin = shape.stand?.minHeight || 50;
  const baseHeightMax = shape.stand?.maxHeight || 200;
  const thicknessMin = Math.min(
    shape.table.minDepth || 40,
    shape.stand?.minDepth || 40,
  );
  const thicknessMax = Math.max(
    shape.table.maxDepth || 300,
    shape.stand?.maxDepth || 300,
  );

  const clampedWidth = Math.max(
    widthMin,
    Math.min(
      Math.max(widthMin, widthMax),
      shape.table.initWidth || current.widthMm,
    ),
  );
  const clampedHeight = Math.max(
    heightMin,
    Math.min(
      Math.max(heightMin, heightMax),
      shape.table.initHeight || current.heightMm,
    ),
  );
  let targetWidth = clampedWidth;
  let targetHeight = clampedHeight;
  if (options.forceSquarePlaque) {
    targetWidth = Math.max(
      widthMin,
      Math.min(Math.max(widthMin, widthMax), 300),
    );
    targetHeight = Math.max(
      heightMin,
      Math.min(Math.max(heightMin, heightMax), 200),
    );
  }

  const clampedStandWidth = Math.max(
    targetWidth,
    Math.min(
      Math.max(baseWidthMin, baseWidthMax),
      shape.stand?.initWidth || current.baseWidthMm,
    ),
  );
  const clampedStandHeight = Math.max(
    baseHeightMin,
    Math.min(
      Math.max(baseHeightMin, baseHeightMax),
      shape.stand?.initHeight || current.baseHeightMm,
    ),
  );
  const clampedStandDepth = Math.max(
    thicknessMin,
    Math.min(
      Math.max(thicknessMin, thicknessMax),
      shape.stand?.initDepth || current.baseThickness,
    ),
  );
  const clampedTabletThickness = Math.max(
    thicknessMin,
    Math.min(
      Math.max(thicknessMin, thicknessMax),
      shape.table.initDepth || current.uprightThickness,
    ),
  );
  const effectiveStandHeight = options.hasBase ? clampedStandHeight : 0;
  const headstoneScaleFactor = Math.min(
    1,
    targetHeight / options.previousHeadstoneHeight,
  );
  const baseScaleFactor = options.hasBase
    ? Math.min(1, effectiveStandHeight / options.previousBaseHeight)
    : headstoneScaleFactor;

  return {
    patch: {
      minWidthMm: widthMin,
      maxWidthMm: Math.max(widthMin, widthMax),
      minHeightMm: heightMin,
      maxHeightMm: Math.max(heightMin, heightMax),
      minBaseWidthMm: Math.max(widthMin, baseWidthMin),
      maxBaseWidthMm: Math.max(baseWidthMin, baseWidthMax),
      minBaseHeightMm: baseHeightMin,
      maxBaseHeightMm: Math.max(baseHeightMin, baseHeightMax),
      minThicknessMm: Math.max(10, thicknessMin),
      maxThicknessMm: Math.max(thicknessMin, thicknessMax),
      widthMm: targetWidth,
      heightMm: targetHeight,
      baseWidthMm: clampedStandWidth,
      baseHeightMm: effectiveStandHeight,
      baseThickness: clampedStandDepth,
      uprightThickness: clampedTabletThickness,
      slantThickness: clampedTabletThickness,
    } satisfies Partial<HeadstoneState>,
    targetWidth,
    targetHeight,
    effectiveStandHeight,
    headstoneScaleFactor,
    baseScaleFactor,
  };
}
