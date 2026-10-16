import type { StateCreator } from 'zustand';
import type { HeadstoneState } from '#/lib/headstone-store.types';

type ResetSlice = Pick<HeadstoneState, 'resetDesign'>;

export const createResetSlice: StateCreator<
  HeadstoneState,
  [],
  [],
  ResetSlice
> = (set) => ({
  resetDesign: () => {
    // Clear editable design data but preserve product-specific defaults when available.
    set((s) => {
      const catalog = s.catalog;
      const productType = catalog?.product?.type;
      const defaultVisibility = {
        showBase:
          productType === 'headstone' ||
          productType === 'mini-headstone' ||
          productType === 'monument' ||
          productType === 'full-monument' ||
          productType === 'urn',
        showLedger: productType === 'full-monument',
        showKerbset: productType === 'full-monument',
      };
      return {
        inscriptions: [],
        selectedAdditions: [],
        selectedMotifs: [],
        selectedEmblems: [],
        selectedImages: [],
        selectedInscriptionId: null,
        selectedAdditionId: null,
        selectedMotifId: null,
        selectedEmblemId: null,
        selectedImageId: null,
        cropCanvasData: null,
        activePanel: null,
        editingObject: 'headstone',
        baseOption: 'none',
        baseLidFinish: 'black',
        showInscriptionColor: true,
        currentProjectId: null,
        currentProjectTitle: null,
        // Preserve product-specific dimensions and base visibility when possible.
        ...defaultVisibility,
      };
    });
  },
});
