import type { PricingBreakdown } from '#/lib/project-schemas';
import { data } from '#/app/_internal/_data';

export type PDFQuoteItem = {
  label: string;
  quantity: number;
  amount: number;
};

export type PDFQuote = {
  currency: string;
  items: PDFQuoteItem[];
  additions: Array<{
    id: string;
    productId: string;
    name: string;
    type: string;
    variant: number;
    thumbnail?: string;
    amount: number;
  }>;
  motifs: Array<{
    id: string;
    productId: string;
    name: string;
    heightMm: number;
    colorName: string;
    thumbnail?: string;
    amount: number;
  }>;
  inscriptions: Array<{
    id: string;
    text: string;
    font: string;
    sizeMm: number;
    colorName: string;
    amount: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  note?: string;
};

type MinimalProject = {
  totalPriceCents?: number | null;
  currency?: string | null;
  pricingBreakdown?: PricingBreakdown | null;
  designState?: {
    showBase?: boolean;
    selectedAdditions?: string[];
    additionOffsets?: Record<string, { sizeVariant?: number }>;
    selectedMotifs?: Array<{ id: string; svgPath?: string; color?: string }>;
    motifOffsets?: Record<string, { heightMm?: number }>;
    selectedImages?: Array<{ id: string }>;
    inscriptions?: Array<{ id?: string; text?: string; font?: string; sizeMm?: number; color?: string }>;
  } | null;
};

const numberOrUndefined = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;

const round2 = (value: number) => Math.round(value * 100) / 100;
const toAssetPath = (path?: string) =>
  path ? (path.startsWith('/') || path.startsWith('data:') ? path : `/${path}`) : undefined;

export function buildPdfQuoteFromProject(project: MinimalProject): PDFQuote {
  const breakdown = project.pricingBreakdown ?? {};
  const legacyBreakdown = breakdown as PricingBreakdown & { imagePriceTotal?: number };
  const totalFromProject = numberOrUndefined(project.totalPriceCents)
    ? round2((project.totalPriceCents as number) / 100)
    : undefined;

  const additionsCount = project.designState?.selectedAdditions?.length ?? 0;
  const motifsCount = project.designState?.selectedMotifs?.length ?? 0;
  const imageCount = project.designState?.selectedImages?.length ?? 0;
  const inscriptionCount =
    project.designState?.inscriptions?.filter((line) => line.text?.trim()).length ?? 0;

  const additionsPrice = numberOrUndefined(breakdown.additionsPrice) ?? additionsCount * 75;
  let motifsPrice = numberOrUndefined(breakdown.motifsPrice) ?? 0;
  const inscriptionPrice = numberOrUndefined(breakdown.inscriptionPrice) ?? inscriptionCount * 50;
  const imagePrice =
    numberOrUndefined(breakdown.imagePrice) ??
    numberOrUndefined(legacyBreakdown.imagePriceTotal) ??
    0;
  const basePrice = numberOrUndefined(breakdown.basePrice) ?? 0;

  const explicitHeadstonePrice = numberOrUndefined(breakdown.headstonePrice);
  const explicitSubtotal = numberOrUndefined(breakdown.subtotal);
  const explicitTax = numberOrUndefined(breakdown.tax);
  const explicitTotal = numberOrUndefined(breakdown.total);
  const fallbackSubtotalFromTotal =
    totalFromProject !== undefined ? round2(totalFromProject / 1.1) : undefined;

  // If motifs are present but motif amount is missing, recover amount from known subtotal.
  if (
    motifsCount > 0 &&
    numberOrUndefined(breakdown.motifsPrice) === undefined &&
    fallbackSubtotalFromTotal !== undefined
  ) {
    const knownWithoutMotifs =
      (numberOrUndefined(breakdown.headstonePrice) ?? 0) +
      basePrice +
      additionsPrice +
      inscriptionPrice +
      imagePrice;
    const recoveredMotifPrice = round2(Math.max(0, fallbackSubtotalFromTotal - knownWithoutMotifs));
    motifsPrice = recoveredMotifPrice;
  }

  const derivedSubtotal =
    explicitSubtotal ??
    fallbackSubtotalFromTotal ??
    round2(basePrice + additionsPrice + motifsPrice + inscriptionPrice + imagePrice);

  const headstonePrice =
    explicitHeadstonePrice ??
    round2(
      Math.max(
        0,
        derivedSubtotal - (basePrice + additionsPrice + motifsPrice + inscriptionPrice + imagePrice),
      ),
    );

  const subtotal = round2(
    explicitSubtotal ??
      headstonePrice + basePrice + additionsPrice + motifsPrice + inscriptionPrice + imagePrice,
  );
  const derivedTaxFromTotal =
    explicitTotal !== undefined ? round2(explicitTotal - subtotal) : undefined;
  const fallbackTax = round2(subtotal * 0.1);
  const tax = round2(
    explicitTax !== undefined && !(explicitTax === 0 && explicitTotal === explicitSubtotal)
      ? explicitTax
      : derivedTaxFromTotal !== undefined && derivedTaxFromTotal > 0
        ? derivedTaxFromTotal
        : fallbackTax,
  );
  const total = round2(explicitTotal ?? totalFromProject ?? subtotal + tax);

  const items: PDFQuoteItem[] = [
    { label: 'Headstone', quantity: 1, amount: headstonePrice },
    ...(project.designState?.showBase ? [{ label: 'Base', quantity: 1, amount: basePrice }] : []),
    ...(additionsCount > 0 ? [{ label: 'Additions', quantity: additionsCount, amount: additionsPrice }] : []),
    ...(motifsCount > 0 ? [{ label: 'Motifs', quantity: motifsCount, amount: motifsPrice }] : []),
    ...(inscriptionCount > 0
      ? [{ label: 'Inscriptions', quantity: inscriptionCount, amount: inscriptionPrice }]
      : []),
    ...(imageCount > 0 ? [{ label: 'Images', quantity: imageCount, amount: imagePrice }] : []),
  ];

  const additions = (project.designState?.selectedAdditions ?? []).map((addId) => {
    const parts = addId.split('_');
    const baseId =
      parts.length > 1 && !Number.isNaN(Number(parts[parts.length - 1]))
        ? parts.slice(0, -1).join('_')
        : addId;
    const addition = data.additions.find((entry) => entry.id === baseId);
    const dirName = addition?.file?.split('/')?.[0] || '';
    const thumbnail =
      dirName && addition?.image ? `/additions/${dirName}/${addition.image}` : undefined;
    const variant = project.designState?.additionOffsets?.[addId]?.sizeVariant ?? 1;
    return {
      id: addId,
      productId: baseId,
      name: addition?.name || baseId || 'Addition',
      type: addition?.type || 'application',
      variant,
      thumbnail,
      amount: 75,
    };
  });

  const motifs = (project.designState?.selectedMotifs ?? []).map((motif) => {
    const cleanName =
      motif.svgPath?.split('/').pop()?.replace('.svg', '').replace(/[_-]/g, ' ') ||
      motif.id;
    const colorName =
      motif.color
        ? data.colors.find((entry) => entry.hex === motif.color)?.name || motif.color
        : 'Black';
    const heightMm = project.designState?.motifOffsets?.[motif.id]?.heightMm ?? 100;
    return {
      id: motif.id,
      productId: motif.id,
      name: cleanName,
      heightMm,
      colorName,
      thumbnail: toAssetPath(motif.svgPath),
      amount: motifsCount > 0 ? round2(motifsPrice / motifsCount) : 0,
    };
  });

  const inscriptions = (project.designState?.inscriptions ?? [])
    .filter((line) => line.text?.trim())
    .map((line, index, all) => {
      const colorName = line.color
        ? data.colors.find((entry) => entry.hex === line.color)?.name || line.color
        : 'Black';
      const amount = all.length > 0 ? round2(inscriptionPrice / all.length) : 0;
      return {
        id: line.id || `inscription-${index}`,
        text: line.text?.trim() || '',
        font: line.font || 'Times New Roman',
        sizeMm: line.sizeMm ?? 0,
        colorName,
        amount,
      };
    });

  return {
    currency: (project.currency || 'AUD').toUpperCase(),
    items,
    additions,
    motifs,
    inscriptions,
    subtotal,
    tax,
    total,
    note: 'Estimate only. Final pricing may vary based on approvals and production details.',
  };
}
