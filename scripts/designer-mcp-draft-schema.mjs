import { z } from 'zod';

const finite = z.number().finite();
const boundedText = z.string().max(10000);
const surface = z.enum(['headstone', 'base', 'ledger']);
const offsets = z.record(z.string().max(200), z.record(z.string(), z.unknown()));
const inscription = z.object({ id: boundedText, text: boundedText, sizeMm: finite.positive(), font: boundedText, color: boundedText, xPos: finite, yPos: finite, rotationDeg: finite, target: surface.optional() }).passthrough();
const motif = z.object({ id: boundedText, svgPath: boundedText, color: boundedText }).passthrough();
const emblem = z.object({ id: boundedText, emblemId: boundedText, imageUrl: boundedText }).passthrough();
const image = z.object({ id: boundedText, typeId: finite, typeName: boundedText, imageUrl: boundedText, widthMm: finite.positive(), heightMm: finite.positive(), xPos: finite, yPos: finite, rotationZ: finite }).passthrough();
const asset = boundedText.nullable();
export const localSnapshotSchema = z.object({
  version: z.literal(1), productId: boundedText.nullable(), shapeUrl: asset, borderName: asset,
  materialUrl: asset, headstoneMaterialUrl: asset, baseMaterialUrl: asset, ledgerMaterialUrl: asset, kerbsetMaterialUrl: asset,
  widthMm: finite.positive(), heightMm: finite.positive(), baseWidthMm: finite.positive(), baseHeightMm: finite.positive(),
  baseThickness: finite, baseFinish: z.enum(['default','rock-pitch']), headstoneStyle: z.enum(['upright','slant']), uprightThickness: finite, slantThickness: finite,
  showBase: z.boolean(), showLedger: z.boolean(), showKerbset: z.boolean(), ledgerWidthMm: finite, ledgerHeightMm: finite, ledgerDepthMm: finite, kerbWidthMm: finite, kerbHeightMm: finite, kerbDepthMm: finite,
  selectedAdditions: z.array(boundedText).max(200), additionOffsets: offsets,
  selectedMotifs: z.array(motif).max(200), motifOffsets: offsets,
  selectedEmblems: z.array(emblem).max(200).optional(), emblemOffsets: offsets.optional(),
  selectedImages: z.array(image).max(200), inscriptions: z.array(inscription).max(200),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).passthrough();
export const localDraftSchema = z.object({version:z.literal(1),id:z.string().uuid(),revision:z.string().regex(/^[a-f0-9]{64}$/),snapshot:localSnapshotSchema}).passthrough();
