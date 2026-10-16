import { data } from '#/app/_internal/_data';
import { getAdditionPricing } from '#/lib/addition-pricing';
import { calculateImagePrice, type ImagePricingMap } from '#/lib/image-pricing';
import { getImageSizeOption } from '#/lib/image-size-config';
import {
  calculateMotifPrice,
  type MotifProductData,
} from '#/lib/motif-pricing';
import type { FixedSize } from '#/lib/headstone-store.types';
import type { SavedImage, SavedInscription } from '#/lib/project-schemas';
import type { PricingBreakdown } from '#/lib/project-schemas';
import {
  calculatePrice,
  calculatePricePowerLaw,
  computeQuantity,
  type CatalogData,
  type PriceModel,
} from '#/lib/xml-parser';

export type CheckPriceProductInput = {
  productId: string | null;
  catalog: CatalogData | null;
  shapeUrl: string | null;
  widthMm: number;
  heightMm: number;
  uprightThickness: number;
  headstoneMaterialUrl: string | null;
  fixedSizes: FixedSize[];
  showBase: boolean;
  baseWidthMm: number;
  baseHeightMm: number;
  baseThickness: number;
};

export type CheckPriceCalculationsInput = CheckPriceProductInput & {
  borderName: string | null;
  showInscriptionColor: boolean;
  inscriptionPriceModel: PriceModel | null;
  inscriptions: SavedInscription[];
  motifPriceModel: MotifProductData | null;
  selectedMotifs: Array<{ id: string; color: string }>;
  motifOffsets: Record<string, { heightMm?: number }>;
  selectedAdditions: string[];
  additionOffsets: Record<string, { sizeVariant?: number }>;
  selectedEmblemsCount: number;
  selectedImages: SavedImage[];
  imagePricing: ImagePricingMap | null;
  imagePriceOverride?: number;
};

export type CheckPriceCalculations = {
  breakdown: PricingBreakdown;
  subtotal: number;
};

export type CheckPriceProductPrices = {
  headstonePrice: number;
  basePrice: number;
  ledgerPrice: number;
  kerbsetPrice: number;
};

export function calculateCheckPriceProductPrices(
  input: CheckPriceProductInput,
): CheckPriceProductPrices {
  const {
    productId,
    catalog,
    shapeUrl,
    widthMm,
    heightMm,
    uprightThickness,
    headstoneMaterialUrl,
    fixedSizes,
    showBase,
    baseWidthMm,
    baseHeightMm,
    baseThickness,
  } = input;
  const product = catalog?.product;
  const isUrn = product?.type === 'urn' || productId === '2350';
  const urnShapeCode = isUrn
    ? shapeUrl?.split('/').pop()?.replace('.svg', '')
    : undefined;

  let headstonePrice = 0;
  if (productId === '52' && product) {
    headstonePrice = calculatePricePowerLaw(
      product.priceModel,
      widthMm * heightMm,
      headstoneMaterialUrl?.includes('polished') ? 'polished' : 'brushed',
    );
  } else if (productId === '32' && fixedSizes.length > 0) {
    const isLandscape = widthMm > heightMm;
    const matchWidth = isLandscape ? heightMm : widthMm;
    const matchHeight = isLandscape ? widthMm : heightMm;
    headstonePrice =
      fixedSizes.find(
        (size) => size.width === matchWidth && size.height === matchHeight,
      )?.price ?? 0;
  } else if (product) {
    const quantity = isUrn
      ? 1
      : computeQuantity(product.priceModel, {
          width: widthMm,
          height: heightMm,
          depth: uprightThickness,
        });
    headstonePrice = calculatePrice(product.priceModel, quantity, urnShapeCode);
  }

  const basePrice =
    showBase && product?.basePriceModel
      ? calculatePrice(
          product.basePriceModel,
          computeQuantity(product.basePriceModel, {
            width: baseWidthMm,
            height: baseHeightMm,
            depth: baseThickness,
          }),
        )
      : 0;

  const selectedShape =
    product?.shapes.find((shape) => shape.url === shapeUrl) ??
    product?.shapes[0];
  const ledgerPrice =
    product?.type === 'full-monument' && product.ledgerPriceModel
      ? calculatePrice(
          product.ledgerPriceModel,
          selectedShape?.lid?.initWidth || widthMm,
        )
      : 0;
  const kerbsetPrice =
    product?.type === 'full-monument' && product.kerbsetPriceModel
      ? calculatePrice(
          product.kerbsetPriceModel,
          selectedShape?.kerb?.initWidth || widthMm,
        )
      : 0;

  return { headstonePrice, basePrice, ledgerPrice, kerbsetPrice };
}

export function calculateCheckPriceMotifPrice(input: {
  productId: string | null;
  isLaser: boolean;
  motifPriceModel: MotifProductData | null;
  heightMm: number;
  color: string;
}): number {
  const { productId, isLaser, motifPriceModel, heightMm, color } = input;
  if (productId === '32' || isLaser || !motifPriceModel) return 0;

  return calculateMotifPrice(
    heightMm,
    color,
    motifPriceModel.priceModel,
    isLaser,
  );
}

export function calculateCheckPriceInscriptionPrice(input: {
  productId: string | null;
  showInscriptionColor: boolean;
  inscriptionPriceModel: PriceModel | null;
  inscription: SavedInscription;
}): number {
  const {
    productId,
    showInscriptionColor,
    inscriptionPriceModel,
    inscription,
  } = input;
  if (
    !inscription.text?.trim() ||
    productId === '32' ||
    !showInscriptionColor ||
    !inscriptionPriceModel
  ) {
    return 0;
  }

  const colorName = data.colors.find(
    (color) => color.hex === inscription.color,
  )?.name;
  const note =
    colorName && !['Gold Gilding', 'Silver Gilding'].includes(colorName)
      ? 'Paint Fill'
      : colorName;
  const tier = inscriptionPriceModel.prices.find(
    (price) =>
      inscription.sizeMm >= price.startQuantity &&
      inscription.sizeMm <= price.endQuantity &&
      price.note === note,
  );

  return tier
    ? calculatePrice(
        { ...inscriptionPriceModel, prices: [tier] },
        inscription.sizeMm,
      )
    : 0;
}

export function calculateCheckPriceInscriptionTotal(input: {
  productId: string | null;
  showInscriptionColor: boolean;
  inscriptionPriceModel: PriceModel | null;
  inscriptions: SavedInscription[];
}): number {
  return input.inscriptions.reduce(
    (total, inscription) =>
      total + calculateCheckPriceInscriptionPrice({ ...input, inscription }),
    0,
  );
}

export function calculateCheckPriceBorderPrice(
  productId: string | null,
  borderName: string | null,
): number {
  return productId === '32' && borderName?.toLowerCase().includes('stainless')
    ? 299
    : 0;
}

export function calculateCheckPriceQuote(
  input: CheckPriceCalculationsInput,
): CheckPriceCalculations {
  const {
    productId,
    catalog,
    borderName,
    showInscriptionColor,
    inscriptionPriceModel,
    inscriptions,
    motifPriceModel,
    selectedMotifs,
    motifOffsets,
    selectedAdditions,
    additionOffsets,
    selectedEmblemsCount,
    selectedImages,
    imagePricing,
    imagePriceOverride,
  } = input;

  const product = catalog?.product;
  const { headstonePrice, basePrice, ledgerPrice, kerbsetPrice } =
    calculateCheckPriceProductPrices(input);

  const additionsPrice = selectedAdditions.reduce(
    (total, id) =>
      total + getAdditionPricing(id, additionOffsets[id]?.sizeVariant).price,
    0,
  );

  const motifsPrice = selectedMotifs.reduce(
    (total, motif) =>
      total +
      calculateCheckPriceMotifPrice({
        productId,
        isLaser: product?.laser === '1',
        motifPriceModel,
        heightMm: motifOffsets[motif.id]?.heightMm ?? 100,
        color: motif.color,
      }),
    0,
  );

  const inscriptionPrice = calculateCheckPriceInscriptionTotal({
    productId,
    showInscriptionColor,
    inscriptionPriceModel,
    inscriptions,
  });

  const emblemsPrice = selectedEmblemsCount * 109;
  const imagePrice =
    imagePriceOverride ??
    selectedImages.reduce((total, image) => {
      const pricing = imagePricing?.[String(image.typeId)];
      if (!pricing) return total;
      const size = getImageSizeOption(image.typeId, image.sizeVariant);
      const width = size?.width ?? Math.round(image.widthMm || 0);
      const height = size?.height ?? Math.round(image.heightMm || 0);
      return (
        total + calculateImagePrice(pricing, width, height, image.colorMode)
      );
    }, 0);
  const borderPrice = calculateCheckPriceBorderPrice(productId, borderName);

  const subtotal =
    headstonePrice +
    basePrice +
    ledgerPrice +
    kerbsetPrice +
    additionsPrice +
    motifsPrice +
    emblemsPrice +
    inscriptionPrice +
    imagePrice +
    borderPrice;

  return {
    subtotal,
    breakdown: {
      headstonePrice,
      basePrice,
      ledgerPrice,
      kerbsetPrice,
      additionsPrice,
      motifsPrice,
      emblemsPrice,
      inscriptionPrice,
      imagePrice,
      borderPrice,
      subtotal,
    },
  };
}
