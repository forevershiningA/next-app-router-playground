import type { StateCreator } from 'zustand';
import type { HeadstoneState } from '#/lib/headstone-store.types';
import { getNextDesignLayer } from '#/lib/headstone-store/layer-utils';

type ImageSlice = Pick<
  HeadstoneState,
  | 'selectedImages'
  | 'selectedImageId'
  | 'setSelectedImageId'
  | 'cropCanvasData'
  | 'setCropCanvasData'
  | 'addImage'
  | 'removeImage'
  | 'duplicateImage'
  | 'updateImageData'
  | 'updateImagePosition'
  | 'updateImageTarget'
  | 'updateImageSize'
  | 'updateImageSizeVariant'
  | 'updateImageRotation'
>;

export const createImageSlice: StateCreator<
  HeadstoneState,
  [],
  [],
  ImageSlice
> = (set, get) => ({
  selectedImages: [],
  selectedImageId: null,
  setSelectedImageId: (id) => {
    set({ selectedImageId: id });
    if (id) {
      // Images use the fullscreen select-images panel, so selecting one does not open an edit panel.
      set({
        selectedAdditionId: null,
        selectedMotifId: null,
        selectedInscriptionId: null,
        selectedEmblemId: null,
        selected: null,
      });
    }
  },
  cropCanvasData: null, // Stores the crop canvas state when user is cropping
  setCropCanvasData: (data) => set({ cropCanvasData: data }),
  addImage: (image) => {
    const state = get();
    const defaultTarget: 'headstone' | 'base' | 'ledger' =
      state.selected === 'base'
        ? 'base'
        : state.selected === 'ledger'
          ? 'ledger'
          : 'headstone';
    const resolvedTarget = image.target ?? defaultTarget;
    // For ledger surface, xPos/yPos are fractional (±0.5 range on unit-cube mesh).
    // Reset to 0 so the image starts at the ledger centre rather than ~90 m off-slab.
    const ledgerPos = resolvedTarget === 'ledger' ? { xPos: 0, yPos: 0 } : {};
    set((s) => ({
      selectedImages: [
        ...s.selectedImages,
        {
          ...image,
          ...ledgerPos,
          target: resolvedTarget,
          layer: getNextDesignLayer(s),
        },
      ],
      cropCanvasData: null,
      selectedImageId: image.id, // Auto-select the newly added image
      selectedInscriptionId: null,
      selectedAdditionId: null,
      selectedMotifId: null,
      selectedEmblemId: null,
      selected: null,
      activePanel: 'image', // Open the edit panel
    }));
    setTimeout(() => get().calculateImageCost(), 0);
  },
  removeImage: (id) => {
    set((s) => ({
      selectedImages: s.selectedImages.filter((img) => img.id !== id),
      selectedImageId: s.selectedImageId === id ? null : s.selectedImageId,
    }));
    setTimeout(() => get().calculateImageCost(), 0);
  },
  duplicateImage: (id) => {
    set((s) => {
      const original = s.selectedImages.find((img) => img.id === id);
      if (!original) return s;

      const targetSurface = original.target ?? 'headstone';
      const ledgerShiftX = Math.max(
        Math.min(((s.ledgerWidthMm ?? 1000) / 1000) * 0.1, 0.15),
        0.02,
      );
      const ledgerShiftZ = Math.max(
        Math.min(((s.ledgerDepthMm ?? 2000) / 1000) * 0.1, 0.15),
        0.02,
      );
      const deltaX = targetSurface === 'ledger' ? ledgerShiftX : 20;
      const deltaY = targetSurface === 'ledger' ? ledgerShiftZ : 20;
      const newImage = {
        ...original,
        id: `img-${Date.now()}`,
        xPos: (original.xPos ?? 0) + deltaX,
        yPos: (original.yPos ?? 0) + deltaY,
        layer: getNextDesignLayer(s),
      };

      return {
        selectedImages: [...s.selectedImages, newImage],
        selectedImageId: newImage.id,
        selectedInscriptionId: null,
        selectedAdditionId: null,
        selectedMotifId: null,
        selectedEmblemId: null,
        selected: null,
      };
    });
    setTimeout(() => get().calculateImageCost(), 0);
  },
  updateImageData: (id, imageUrl, croppedAspectRatio, colorMode) => {
    set((s) => ({
      selectedImages: s.selectedImages.map((img) =>
        img.id === id
          ? { ...img, imageUrl, croppedAspectRatio, colorMode }
          : img,
      ),
      cropCanvasData: null,
    }));
  },
  updateImagePosition: (id, xPos, yPos) => {
    set((s) => ({
      selectedImages: s.selectedImages.map((img) =>
        img.id === id
          ? { ...img, xPos, yPos, coordinateSpace: undefined }
          : img,
      ),
    }));
  },
  updateImageTarget: (id, target, xPos, yPos, coordinateSpace) => {
    set((s) => ({
      selectedImages: s.selectedImages.map((img) =>
        img.id === id
          ? {
              ...img,
              target,
              xPos,
              yPos,
              coordinateSpace: coordinateSpace ?? undefined,
            }
          : img,
      ),
    }));
    setTimeout(() => get().calculateImageCost(), 0);
  },
  updateImageSize: (id, widthMm, heightMm) => {
    set((s) => ({
      selectedImages: s.selectedImages.map((img) =>
        img.id === id ? { ...img, widthMm, heightMm } : img,
      ),
    }));
    setTimeout(() => get().calculateImageCost(), 0);
  },
  updateImageSizeVariant: (id, sizeVariant) => {
    set((s) => ({
      selectedImages: s.selectedImages.map((img) =>
        img.id === id ? { ...img, sizeVariant } : img,
      ),
    }));
    setTimeout(() => get().calculateImageCost(), 0);
  },
  updateImageRotation: (id, rotationZ) => {
    set((s) => ({
      selectedImages: s.selectedImages.map((img) =>
        img.id === id ? { ...img, rotationZ } : img,
      ),
    }));
  },
});
