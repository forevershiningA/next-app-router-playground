import type { HeadstoneState, Line } from '#/lib/headstone-store.types';

const MIN_SURFACE_DIMENSION_MM = 1;

export const resolveSurfaceDimensions = (
  state: Pick<
    HeadstoneState,
    | 'widthMm'
    | 'heightMm'
    | 'baseWidthMm'
    | 'baseHeightMm'
    | 'ledgerWidthMm'
    | 'ledgerDepthMm'
  >,
  surface: 'headstone' | 'base' | 'ledger',
) => {
  if (surface === 'base') {
    return {
      widthMm: state.baseWidthMm || state.widthMm || MIN_SURFACE_DIMENSION_MM,
      heightMm:
        state.baseHeightMm || state.heightMm || MIN_SURFACE_DIMENSION_MM,
    };
  }
  if (surface === 'ledger') {
    return {
      widthMm: state.ledgerWidthMm || MIN_SURFACE_DIMENSION_MM,
      heightMm: state.ledgerDepthMm || MIN_SURFACE_DIMENSION_MM,
    };
  }
  return {
    widthMm: state.widthMm || MIN_SURFACE_DIMENSION_MM,
    heightMm: state.heightMm || MIN_SURFACE_DIMENSION_MM,
  };
};

export const withLineSurfaceDimensions = (
  line: Line,
  surface: 'headstone' | 'base' | 'ledger',
  state: HeadstoneState,
  force = false,
): Line => {
  const dimensions = resolveSurfaceDimensions(state, surface);
  return {
    ...line,
    target: surface,
    baseWidthMm:
      force || !line.baseWidthMm ? dimensions.widthMm : line.baseWidthMm,
    baseHeightMm:
      force || !line.baseHeightMm ? dimensions.heightMm : line.baseHeightMm,
  };
};

export const normalizeLineDimensions = (lines: Line[], state: HeadstoneState) =>
  lines.map((line) =>
    withLineSurfaceDimensions(
      line,
      line.target === 'base'
        ? 'base'
        : line.target === 'ledger'
          ? 'ledger'
          : 'headstone',
      state,
      !line.baseWidthMm || !line.baseHeightMm,
    ),
  );

type OffsetWithDimensions = { baseWidthMm?: number; baseHeightMm?: number };

export const withOffsetSurfaceDimensions = <T extends OffsetWithDimensions>(
  offset: T,
  surface: 'headstone' | 'base' | 'ledger',
  state: HeadstoneState,
  force = false,
): T & { baseWidthMm: number; baseHeightMm: number } => {
  const dimensions = resolveSurfaceDimensions(state, surface);
  return {
    ...offset,
    baseWidthMm:
      force || !offset.baseWidthMm ? dimensions.widthMm : offset.baseWidthMm,
    baseHeightMm:
      force || !offset.baseHeightMm ? dimensions.heightMm : offset.baseHeightMm,
  } as T & { baseWidthMm: number; baseHeightMm: number };
};
