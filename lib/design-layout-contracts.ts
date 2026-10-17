import type { CanonicalDesignData } from './saved-design-loader-utils';

// Reviewed companion payload. Keep this scoped to the pilot until other legacy
// versions have their own evidence; a directory name alone does not define units.
const MILLIMETRE_COMPANION_IDS = new Set(['1755892723342']);

export function usesMillimetreCompanionLayout(
  design: CanonicalDesignData,
): boolean {
  const primary = design.legacy?.raw?.find(
    (item) => item.type === 'Headstone' || item.type === 'Plaque',
  );
  return (
    MILLIMETRE_COMPANION_IDS.has(design.source?.id ?? '') &&
    design.source?.mlDir === 'bronze-plaque' &&
    String(primary?.version) === '1.45' &&
    design.scene?.coordinateSystem?.positionMode === 'legacy-stage-px'
  );
}
