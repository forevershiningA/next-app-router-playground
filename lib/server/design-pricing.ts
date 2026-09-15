import 'server-only';

import { data } from '#/app/_internal/_data';
import {
  fetchAndParseMotifPricing,
  calculateMotifPrice,
} from '#/lib/motif-pricing';
import type { DesignerSnapshot, PricingBreakdown } from '#/lib/project-schemas';
import {
  calculateCatalogPrice,
  calculatePrice,
  computeQuantity,
  type CatalogData,
} from '#/lib/xml-parser';
import { ensureServerDomParser } from './dom-parser-polyfill';
import { getCatalogData } from './xml-data';

export type AuthoritativeQuote = {
  totalCents: number;
  currency: string;
  breakdown: PricingBreakdown;
};

const money = (value: number) => Math.round(value * 100) / 100;
const currencyCode = (value?: string) => {
  const upper = value?.toUpperCase() ?? '';
  if (upper.includes('AUD') || upper.includes('AUSTRALIAN')) return 'AUD';
  if (upper.includes('USD')) return 'USD';
  if (upper.includes('NZD')) return 'NZD';
  return 'AUD';
};

async function loadCatalog(productId: string): Promise<CatalogData> {
  await ensureServerDomParser();
  const xml = await getCatalogData(productId);
  if (!xml) throw new Error('Catalog pricing is unavailable');
  const { parseCatalogXML } = await import('#/lib/xml-parser');
  return parseCatalogXML(xml, productId);
}

function number(value: number, field: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Invalid ${field}`);
  }
  return value;
}

export async function calculateAuthoritativeQuote(
  snapshot: DesignerSnapshot,
): Promise<AuthoritativeQuote> {
  if (!snapshot.productId)
    throw new Error('A product is required before checkout');
  if ((snapshot.selectedImages ?? []).length > 0) {
    throw new Error('Image pricing must be reviewed before checkout');
  }

  const catalog = await loadCatalog(snapshot.productId);
  const product = catalog.product;
  const width = number(snapshot.widthMm, 'width');
  const height = number(snapshot.heightMm, 'height');
  const depth = number(snapshot.uprightThickness, 'thickness');
  const matchingShape = product.shapes.find((shape) =>
    shape.url ? snapshot.shapeUrl?.endsWith(shape.url) : false,
  );
  const headstonePrice = calculateCatalogPrice(
    product.id,
    product.priceModel,
    { width, height, depth },
    matchingShape?.code,
  );

  const basePrice =
    snapshot.showBase && product.basePriceModel
      ? calculatePrice(
          product.basePriceModel,
          computeQuantity(product.basePriceModel, {
            width: number(snapshot.baseWidthMm, 'base width'),
            height: number(snapshot.baseHeightMm, 'base height'),
            depth: number(snapshot.baseThickness, 'base thickness'),
          }),
        )
      : 0;

  const additionsPrice = (snapshot.selectedAdditions ?? []).reduce(
    (total, additionId) => {
      const addition = data.additions.find(
        (item) => item.id === additionId.split('_')[0],
      );
      const sizes = addition?.sizes ?? [];
      if (sizes.length === 0) return total;
      const requested = Math.round(
        snapshot.additionOffsets[additionId]?.sizeVariant ?? 1,
      );
      const variant = Math.min(sizes.length, Math.max(1, requested));
      return total + (sizes[variant - 1]?.retailPrice ?? 0);
    },
    0,
  );

  const motifAddition = product.additions.find(
    (addition) => addition.type === 'motif',
  );
  const motifType =
    product.id === '5'
      ? 'bronze'
      : motifAddition?.formula?.toLowerCase() === 'enamel'
        ? 'enamel'
        : product.laser === '1'
          ? 'laser'
          : 'engraved';
  const motifPricing = await fetchAndParseMotifPricing(motifType);
  if ((snapshot.selectedMotifs ?? []).length > 0 && !motifPricing) {
    throw new Error('Motif pricing is unavailable');
  }
  const motifsPrice =
    snapshot.productId === '32' || product.laser === '1'
      ? 0
      : (snapshot.selectedMotifs ?? []).reduce(
          (total, motif) =>
            total +
            calculateMotifPrice(
              number(
                snapshot.motifOffsets[motif.id]?.heightMm ?? 100,
                'motif height',
              ),
              motif.color,
              motifPricing!.priceModel,
            ),
          0,
        );

  const inscriptionProduct = product.additions.find(
    (addition) => addition.type === 'inscription',
  );
  if (
    (snapshot.inscriptions ?? []).some((line) => line.text.trim()) &&
    !inscriptionProduct?.priceModel
  ) {
    throw new Error('Inscription pricing is unavailable');
  }
  const inscriptionPrice =
    snapshot.productId === '32'
      ? 0
      : (snapshot.inscriptions ?? [])
          .filter((line) => line.text.trim())
          .reduce((total, line) => {
            const colorName = data.colors.find(
              (color) => color.hex === line.color,
            )?.name;
            const note =
              colorName &&
              !['Gold Gilding', 'Silver Gilding'].includes(colorName)
                ? 'Paint Fill'
                : colorName;
            return (
              total +
              calculatePrice(
                inscriptionProduct!.priceModel!,
                number(line.sizeMm, 'inscription size'),
                note,
              )
            );
          }, 0);

  const emblemsPrice = (snapshot.selectedEmblems?.length ?? 0) * 109;
  const subtotal = money(
    headstonePrice +
      basePrice +
      additionsPrice +
      motifsPrice +
      inscriptionPrice +
      emblemsPrice,
  );
  const tax = money(subtotal * 0.1);
  const total = money(subtotal + tax);
  const currency = currencyCode(product.priceModel.currency);

  return {
    totalCents: Math.round(total * 100),
    currency,
    breakdown: {
      headstonePrice,
      basePrice,
      additionsPrice,
      motifsPrice,
      inscriptionPrice,
      emblemsPrice,
      subtotal,
      tax,
      total,
    },
  };
}
