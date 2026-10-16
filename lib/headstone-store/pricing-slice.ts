import type { StateCreator } from 'zustand';
import { calculateAdditionsPrice } from '#/lib/addition-pricing';
import {
  calculateCheckPriceInscriptionTotal,
  calculateCheckPriceMotifPrice,
} from '#/lib/check-price-calculations';
import { calculateImagePrice, fetchImagePricing } from '#/lib/image-pricing';
import { getImageSizeOption } from '#/lib/image-size-config';
import type { HeadstoneState } from '#/lib/headstone-store.types';

export type PricingSlice = Pick<
  HeadstoneState,
  | 'inscriptionCost'
  | 'calculateInscriptionCost'
  | 'motifCost'
  | 'calculateMotifCost'
  | 'emblemCost'
  | 'calculateEmblemCost'
  | 'imageCost'
  | 'calculateImageCost'
  | 'additionCost'
  | 'calculateAdditionCost'
>;

export const createPricingSlice: StateCreator<
  HeadstoneState,
  [],
  [],
  PricingSlice
> = (set, get) => ({
  inscriptionCost: 0,
  calculateInscriptionCost: () => {
    const {
      inscriptions,
      inscriptionPriceModel,
      showInscriptionColor,
      productId,
    } = get();
    set({
      inscriptionCost: calculateCheckPriceInscriptionTotal({
        inscriptions,
        inscriptionPriceModel,
        showInscriptionColor,
        productId,
      }),
    });
  },

  motifCost: 0,
  calculateMotifCost: () => {
    const { selectedMotifs, motifOffsets, motifPriceModel, catalog, productId } =
      get();
    const isLaser = catalog?.product.laser === '1';
    const totalCost = selectedMotifs.reduce((total, motif) => {
      const heightMm = motifOffsets[motif.id]?.heightMm ?? 100;
      return (
        total +
        calculateCheckPriceMotifPrice({
          productId,
          isLaser,
          motifPriceModel,
          heightMm,
          color: motif.color,
        })
      );
    }, 0);

    set({ motifCost: totalCost });
  },

  emblemCost: 0,
  calculateEmblemCost: () => {
    const EMBLEM_UNIT_PRICE = 109;
    set({ emblemCost: get().selectedEmblems.length * EMBLEM_UNIT_PRICE });
  },

  imageCost: 0,
  calculateImageCost: async () => {
    const { selectedImages } = get();
    if (!selectedImages.length) {
      set({ imageCost: 0 });
      return;
    }

    try {
      const pricingMap = await fetchImagePricing();
      const totalCost = selectedImages.reduce((total, image) => {
        const product = pricingMap[String(image.typeId)];
        if (!product) return total;
        const sizeOption = getImageSizeOption(image.typeId, image.sizeVariant);
        const width = sizeOption?.width ?? Math.round(image.widthMm || 0);
        const height = sizeOption?.height ?? Math.round(image.heightMm || 0);
        return (
          total +
          calculateImagePrice(product, width, height, image.colorMode)
        );
      }, 0);
      set({ imageCost: totalCost });
    } catch {
      set({ imageCost: 0 });
    }
  },

  additionCost: 0,
  calculateAdditionCost: () => {
    const { selectedAdditions, additionOffsets } = get();
    set({ additionCost: calculateAdditionsPrice(selectedAdditions, additionOffsets) });
  },
});
