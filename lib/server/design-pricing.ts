import 'server-only';

import { calculateCheckPriceQuote } from '#/lib/check-price-calculations';
import { fetchAndParseInscriptionDetails } from '#/lib/xml-parser';
import { catalog as catalogDb } from '#/lib/catalog-db';
import { fetchAndParseMotifPricing } from '#/lib/server/motif-pricing';
import { calculateAuthoritativeImagePrice } from '#/lib/authoritative-image-pricing';
import { fetchImagePricing } from '#/lib/image-pricing';
import type { DesignerSnapshot } from '#/lib/project-schemas';
import type { DesignQuote } from '#/lib/pricing-contract';
import type { CatalogData } from '#/lib/xml-parser';
import { ensureServerDomParser } from './dom-parser-polyfill';
import { getCatalogData } from './xml-data';

export type AuthoritativeQuote = DesignQuote<'confirmed'>;

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

  const catalog = await loadCatalog(snapshot.productId);
  const product = catalog.product;
  const width = number(snapshot.widthMm, 'width');
  const height = number(snapshot.heightMm, 'height');
  const depth = number(snapshot.uprightThickness, 'thickness');
  if (snapshot.showBase && product.basePriceModel) {
    number(snapshot.baseWidthMm, 'base width');
    number(snapshot.baseHeightMm, 'base height');
    number(snapshot.baseThickness, 'base thickness');
  }

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
  for (const motif of snapshot.selectedMotifs ?? []) {
    number(snapshot.motifOffsets[motif.id]?.heightMm ?? 100, 'motif height');
  }

  const inscriptionProduct = product.additions.find(
    (addition) => addition.type === 'inscription',
  );
  const inscriptionDetails = inscriptionProduct
    ? await fetchAndParseInscriptionDetails(inscriptionProduct.id)
    : undefined;
  for (const line of snapshot.inscriptions ?? []) {
    if (line.text.trim()) number(line.sizeMm, 'inscription size');
  }

  const imagePricing = await fetchImagePricing();
  const imagePrice = calculateAuthoritativeImagePrice(
    snapshot.selectedImages ?? [],
    imagePricing,
  );
  const fixedSizeRows =
    product.id === '32'
      ? await catalogDb.sizes.findMany({
          where: { productCode: 'full-colour-plaque', isActive: true },
        })
      : [];
  const checkPriceQuote = calculateCheckPriceQuote({
    productId: product.id,
    catalog,
    shapeUrl: snapshot.shapeUrl,
    widthMm: width,
    heightMm: height,
    uprightThickness: depth,
    headstoneMaterialUrl: snapshot.headstoneMaterialUrl,
    fixedSizes: fixedSizeRows.map((size) => ({
      id: size.sortOrder,
      width: size.widthMm,
      height: size.heightMm,
      price: size.priceCents / 100,
    })),
    showBase: snapshot.showBase,
    baseWidthMm: snapshot.baseWidthMm,
    baseHeightMm: snapshot.baseHeightMm,
    baseThickness: snapshot.baseThickness,
    borderName: snapshot.borderName,
    showInscriptionColor: product.laser !== '1' && product.color !== '0',
    inscriptionPriceModel: inscriptionDetails?.priceModel ?? null,
    inscriptions: snapshot.inscriptions ?? [],
    motifPriceModel: motifPricing,
    selectedMotifs: snapshot.selectedMotifs ?? [],
    motifOffsets: snapshot.motifOffsets,
    selectedAdditions: snapshot.selectedAdditions ?? [],
    additionOffsets: snapshot.additionOffsets,
    selectedEmblemsCount: snapshot.selectedEmblems?.length ?? 0,
    selectedImages: snapshot.selectedImages ?? [],
    imagePricing,
    imagePriceOverride: imagePrice,
  });
  const subtotal = money(checkPriceQuote.subtotal);
  const tax = money(subtotal * 0.1);
  const total = money(subtotal + tax);
  const currency = currencyCode(product.priceModel.currency);

  return {
    totalCents: Math.round(total * 100),
    currency,
    authority: 'confirmed',
    breakdown: {
      ...checkPriceQuote.breakdown,
      subtotal,
      tax,
      total,
    },
  };
}
