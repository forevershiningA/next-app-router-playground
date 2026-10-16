import type { HeadstoneState } from './headstone-store.types';
import { calculateCheckPriceQuote } from './check-price-calculations';
import type { DesignQuote } from './pricing-contract';

export type EstimatedDesignPricingInput = Pick<
  HeadstoneState,
  | 'productId'
  | 'shapeUrl'
  | 'headstoneMaterialUrl'
  | 'catalog'
  | 'fixedSizes'
  | 'widthMm'
  | 'heightMm'
  | 'uprightThickness'
  | 'showBase'
  | 'baseWidthMm'
  | 'baseHeightMm'
  | 'baseThickness'
  | 'borderName'
  | 'showInscriptionColor'
  | 'inscriptionPriceModel'
  | 'selectedAdditions'
  | 'additionOffsets'
  | 'selectedMotifs'
  | 'motifOffsets'
  | 'motifPriceModel'
  | 'selectedEmblems'
  | 'inscriptions'
  | 'selectedImages'
  | 'imageCost'
>;

export type EstimatedDesignPricing = DesignQuote<'estimate'>;

export function calculateEstimatedDesignPricing(
  state: EstimatedDesignPricingInput,
): EstimatedDesignPricing {
  const checkPrice = calculateCheckPriceQuote({
    productId: state.productId,
    catalog: state.catalog,
    shapeUrl: state.shapeUrl,
    widthMm: state.widthMm,
    heightMm: state.heightMm,
    uprightThickness: state.uprightThickness,
    headstoneMaterialUrl: state.headstoneMaterialUrl,
    fixedSizes: state.fixedSizes,
    showBase: state.showBase,
    baseWidthMm: state.baseWidthMm,
    baseHeightMm: state.baseHeightMm,
    baseThickness: state.baseThickness,
    borderName: state.borderName,
    showInscriptionColor: state.showInscriptionColor,
    inscriptionPriceModel: state.inscriptionPriceModel,
    inscriptions: state.inscriptions,
    motifPriceModel: state.motifPriceModel,
    selectedMotifs: state.selectedMotifs,
    motifOffsets: state.motifOffsets,
    selectedAdditions: state.selectedAdditions,
    additionOffsets: state.additionOffsets,
    selectedEmblemsCount: state.selectedEmblems.length,
    selectedImages: state.selectedImages,
    imagePricing: null,
    imagePriceOverride: state.imageCost,
  });
  const subtotal = checkPrice.subtotal;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return {
    totalCents: Math.round(total * 100),
    currency: 'AUD',
    authority: 'estimate',
    breakdown: { ...checkPrice.breakdown, tax, total },
  };
}
