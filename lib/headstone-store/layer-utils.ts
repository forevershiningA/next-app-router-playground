import type { HeadstoneState } from '#/lib/headstone-store.types';

export const getNextDesignLayer = (state: HeadstoneState) => {
  const inscriptionLayers = state.inscriptions.map((line) => line.layer ?? 0);
  const imageLayers = state.selectedImages.map((image) => image.layer ?? 0);
  const motifLayers = Object.values(state.motifOffsets).map(
    (offset) => offset.layer ?? 0,
  );
  const emblemLayers = Object.values(state.emblemOffsets).map(
    (offset) => offset.layer ?? 0,
  );
  return (
    Math.max(
      0,
      ...inscriptionLayers,
      ...imageLayers,
      ...motifLayers,
      ...emblemLayers,
    ) + 1
  );
};
