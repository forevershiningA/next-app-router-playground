import type { AdditionKind } from './headstone-store';

export type SavedAdditionOffset = {
  xPos?: number;
  yPos?: number;
  zPos?: number;
  scale?: number;
  rotationZ?: number;
  sizeVariant?: number;
  targetSurface?: 'headstone' | 'base' | 'ledger';
  additionType?: AdditionKind;
  assetFile?: string;
  sourceId?: string;
  additionName?: string;
  zPosFinalized?: boolean;
  footprintWidth?: number;
  baseWidthMm?: number;
  baseHeightMm?: number;
};

export type SavedMotifOffset = {
  xPos: number;
  yPos: number;
  scale: number;
  rotationZ: number;
  heightMm: number;
  target?: 'headstone' | 'base' | 'ledger';
  coordinateSpace?: 'absolute' | 'offset' | 'mm-center';
  flipX?: boolean;
  flipY?: boolean;
  baseWidthMm?: number;
  baseHeightMm?: number;
};

export type SavedEmblemOffset = {
  xPos: number;
  yPos: number;
  sizeVariant: number;
  rotationZ: number;
  flipX: boolean;
  flipY: boolean;
  widthMm: number;
  heightMm: number;
  target: 'headstone' | 'base' | 'ledger';
  coordinateSpace?: 'offset' | 'mm-center' | 'absolute';
  baseWidthMm?: number;
  baseHeightMm?: number;
};

export type SavedImage = {
  id: string;
  typeId: number;
  typeName: string;
  imageUrl: string;
  widthMm: number;
  heightMm: number;
  xPos: number;
  yPos: number;
  rotationZ: number;
  sizeVariant?: number;
  croppedAspectRatio?: number;
  maskShape?: string;
  colorMode?: 'full' | 'bw' | 'sepia';
  target?: 'headstone' | 'base' | 'ledger';
};

export type SavedInscription = {
  id: string;
  text: string;
  sizeMm: number;
  font: string;
  color: string;
  xPos: number;
  yPos: number;
  rotationDeg: number;
  target?: 'headstone' | 'base' | 'ledger';
  baseWidthMm?: number;
  baseHeightMm?: number;
};

export type DesignerSnapshot = {
  version: number;
  productId: string | null;
  shapeUrl: string | null;
  borderName: string | null;
  showInsetContour?: boolean;
  materialUrl: string | null;
  headstoneMaterialUrl: string | null;
  baseMaterialUrl: string | null;
  ledgerMaterialUrl: string | null;
  kerbsetMaterialUrl: string | null;
  widthMm: number;
  heightMm: number;
  baseWidthMm: number;
  baseHeightMm: number;
  baseThickness: number;
  baseFinish: 'default' | 'rock-pitch';
  headstoneStyle: 'upright' | 'slant';
  uprightThickness: number;
  slantThickness: number;
  showBase: boolean;
  showLedger: boolean;
  showKerbset: boolean;
  ledgerWidthMm: number;
  ledgerHeightMm: number;
  ledgerDepthMm: number;
  kerbWidthMm: number;
  kerbHeightMm: number;
  kerbDepthMm: number;
  selectedAdditions: string[];
  additionOffsets: Record<string, SavedAdditionOffset>;
  selectedMotifs: Array<{ id: string; svgPath: string; color: string }>;
  motifOffsets: Record<string, SavedMotifOffset>;
  selectedEmblems?: Array<{ id: string; emblemId: string; imageUrl: string }>;
  emblemOffsets?: Record<string, SavedEmblemOffset>;
  selectedImages: SavedImage[];
  inscriptions: SavedInscription[];
  metadata?: {
    currentProjectId?: string | null;
    currentProjectTitle?: string | null;
    screenshot?: string | null;
  };
};

export type PricingBreakdown = {
  headstonePrice?: number;
  basePrice?: number;
  ledgerPrice?: number;
  kerbsetPrice?: number;
  additionsPrice?: number;
  motifsPrice?: number;
  emblemsPrice?: number;
  inscriptionPrice?: number;
  imagePrice?: number;
  subtotal?: number;
  tax?: number;
  total?: number;
};

export type ProjectSummary = {
  id: string;
  title: string;
  status: string;
  totalPriceCents: number | null;
  currency: string;
  screenshotPath: string | null;
  thumbnailPath: string | null;
  updatedAt: string;
  createdAt: string;
};

export type ProjectRecordWithState = ProjectSummary & {
  materialId?: number | null;
  shapeId?: number | null;
  borderId?: number | null;
  designState: DesignerSnapshot;
  pricingBreakdown: PricingBreakdown | null;
};
