'use client';

import type React from 'react';
import type { Group, Mesh } from 'three';
import type { MaskMetrics } from '#/lib/mask-metrics';
import type { MotifProductData } from '#/lib/motif-pricing';
import type { CatalogData, PriceModel } from '#/lib/xml-parser';

export const TEX_BASE = '/textures/forever/l/';
export const DEFAULT_TEX = 'Imperial-Red.webp';

export const normalizeTextureUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return url;
  return `/${url.replace(/^\/+/g, '')}`;
};

export const MIN_HEADSTONE_DIM = 300;
export const MAX_HEADSTONE_DIM = 1200;
export const clampHeadstoneDim = (v: number) =>
  Math.min(MAX_HEADSTONE_DIM, Math.max(MIN_HEADSTONE_DIM, Math.round(v)));

export const clampBaseHeight = (v: number) =>
  Math.max(50, Math.min(200, Math.round(v)));
export const clampThickness = (v: number) =>
  Math.max(40, Math.min(300, Math.round(v)));

export const MIN_INSCRIPTION_SIZE_MM = 5;
export const MAX_INSCRIPTION_SIZE_MM = 1200;
export const clampInscriptionSize = (v: number) =>
  Math.min(
    MAX_INSCRIPTION_SIZE_MM,
    Math.max(MIN_INSCRIPTION_SIZE_MM, Math.round(v)),
  );

export const MIN_INSCRIPTION_ROTATION_DEG = -45;
export const MAX_INSCRIPTION_ROTATION_DEG = 45;
export const clampInscriptionRotation = (v: number) =>
  Math.max(
    MIN_INSCRIPTION_ROTATION_DEG,
    Math.min(MAX_INSCRIPTION_ROTATION_DEG, Math.round(v)),
  );
export const MIN_MOTIF_HEIGHT_MM = 10;

export type Line = {
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
  /** When 'mm-center', xPos/yPos are mm offsets from headstone center (Y-up). */
  coordinateSpace?: 'mm-center';
  ref: React.RefObject<Group | null>;
};
export type Part = 'headstone' | 'base' | 'ledger' | 'kerbset' | null;
export type AdditionKind = 'statue' | 'vase' | 'application';
export type Material = {
  id: string;
  name: string;
  image?: string | null;
  category: string;
  textureUrl?: string | null;
  thumbnailUrl?: string | null;
};

export type ShapeOption = {
  id: string;
  name: string;
  image?: string | null;
  category: string;
  previewUrl?: string | null;
  maskKey?: string | null;
};

export type BorderOption = {
  id: string;
  name: string;
  image?: string | null;
  category: string;
  svgUrl?: string | null;
};

export type MotifCatalogItem = {
  id: string;
  name: string;
  category: string;
  categoryName?: string;
  svgUrl?: string | null;
  previewUrl?: string | null;
  priceCents?: number | null;
};

export type PanelName =
  | 'shape'
  | 'size'
  | 'material'
  | 'inscription'
  | 'additions'
  | 'addition'
  | 'motifs'
  | 'motif'
  | 'image'
  | 'checkprice'
  | 'designs'
  | null;
type NavFn = (href: string, opts?: { replace?: boolean }) => void;

export type LinePatch = Partial<
  Pick<
    Line,
    'text' | 'font' | 'sizeMm' | 'rotationDeg' | 'xPos' | 'yPos' | 'color'
  >
>;

export type HeadstoneState = {
  catalog: CatalogData | null;
  setCatalog: (catalog: CatalogData) => void;

  materials: Material[];
  setMaterials: (materials: Material[]) => void;

  shapes: ShapeOption[];
  setShapes: (shapes: ShapeOption[]) => void;

  borders: BorderOption[];
  setBorders: (borders: BorderOption[]) => void;

  motifsCatalog: MotifCatalogItem[];
  setMotifsCatalog: (motifs: MotifCatalogItem[]) => void;

  minWidthMm: number;
  maxWidthMm: number;
  minHeightMm: number;
  maxHeightMm: number;
  minBaseWidthMm: number;
  maxBaseWidthMm: number;
  minBaseHeightMm: number;
  maxBaseHeightMm: number;
  minThicknessMm: number;
  maxThicknessMm: number;

  selectedAdditions: string[];
  addAddition: (id: string) => void;
  removeAddition: (id: string) => void;
  hasStatue: () => boolean;
  baseMeshRef: Mesh | null;
  setBaseMeshRef: (mesh: Mesh | null) => void;

  selectedMotifs: Array<{ id: string; svgPath: string; color: string }>;
  addMotif: (svgPath: string) => void;
  removeMotif: (id: string) => void;
  setMotifColor: (id: string, color: string) => void;

  selectedImages: Array<{
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
    coordinateSpace?: 'mm-center';
  }>;
  addImage: (image: {
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
    maskShape?: string;
    croppedAspectRatio?: number;
    colorMode?: 'full' | 'bw' | 'sepia';
    target?: 'headstone' | 'base' | 'ledger';
    coordinateSpace?: 'mm-center';
  }) => void;
  removeImage: (id: string) => void;
  duplicateImage: (id: string) => void;
  updateImagePosition: (id: string, xPos: number, yPos: number) => void;
  updateImageSize: (id: string, widthMm: number, heightMm: number) => void;
  updateImageSizeVariant: (id: string, sizeVariant: number) => void;
  updateImageRotation: (id: string, rotationZ: number) => void;

  productId: string | null;
  setProductId: (id: string) => void;

  currentProjectId: string | null;
  currentProjectTitle: string | null;
  setProjectMeta: (meta: { projectId?: string | null; title?: string | null }) => void;

  showBase: boolean;
  setShowBase: (showBase: boolean) => void;

  showLedger: boolean;
  setShowLedger: (v: boolean) => void;

  showKerbset: boolean;
  setShowKerbset: (v: boolean) => void;

  ledgerWidthMm: number;
  setLedgerWidthMm: (v: number) => void;

  ledgerHeightMm: number;
  setLedgerHeightMm: (v: number) => void;

  ledgerDepthMm: number;
  setLedgerDepthMm: (v: number) => void;

  kerbWidthMm: number;
  setKerbWidthMm: (v: number) => void;

  kerbHeightMm: number;
  setKerbHeightMm: (v: number) => void;

  kerbDepthMm: number;
  setKerbDepthMm: (v: number) => void;

  editingObject: 'headstone' | 'base' | 'ledger' | 'kerbset';
  setEditingObject: (obj: 'headstone' | 'base' | 'ledger' | 'kerbset') => void;

  showInscriptionColor: boolean;
  inscriptionPriceModel: PriceModel | null;

  shapeUrl: string | null;
  setShapeUrl: (url: string) => void;

  borderName: string | null;
  setBorderName: (name: string | null) => void;

  materialUrl: string | null;
  setMaterialUrl: (url: string) => void;

  headstoneMaterialUrl: string | null;
  setHeadstoneMaterialUrl: (url: string) => void;

  baseMaterialUrl: string | null;
  setBaseMaterialUrl: (url: string) => void;

  ledgerMaterialUrl: string | null;
  setLedgerMaterialUrl: (url: string) => void;

  kerbsetMaterialUrl: string | null;
  setKerbsetMaterialUrl: (url: string) => void;

  baseSwapping: boolean;
  setBaseSwapping: (swapping: boolean) => void;

  widthMm: number;
  setWidthMm: (v: number) => void;

  heightMm: number;
  setHeightMm: (v: number) => void;

  baseWidthMm: number;
  setBaseWidthMm: (v: number) => void;

  baseHeightMm: number;
  setBaseHeightMm: (v: number) => void;

  baseThickness: number;
  setBaseThickness: (thickness: number) => void;

  baseFinish: 'default' | 'rock-pitch';
  setBaseFinish: (finish: 'default' | 'rock-pitch') => void;

  headstoneStyle: 'upright' | 'slant';
  setHeadstoneStyle: (style: 'upright' | 'slant') => void;

  uprightThickness: number;
  setUprightThickness: (thickness: number) => void;

  slantThickness: number;
  setSlantThickness: (thickness: number) => void;

  selected: Part;
  setSelected: (p: Part) => void;

  inscriptions: Line[];
  selectedInscriptionId: string | null;
  activeInscriptionText: string;
  inscriptionMinHeight: number;
  inscriptionMaxHeight: number;
  fontLoading: boolean;
  inscriptionCost: number;
  calculateInscriptionCost: () => void;

  motifPriceModel: MotifProductData | null;
  motifCost: number;
  calculateMotifCost: () => void;

  selectedAdditionId: string | null;
  additionRefs: Record<string, React.RefObject<Group | null>>;
  additionOffsets: Record<
    string,
    {
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
    }
  >;

  selectedMotifId: string | null;
  setSelectedMotifId: (id: string | null) => void;

  selectedImageId: string | null;
  setSelectedImageId: (id: string | null) => void;

  motifRefs: Record<string, React.RefObject<Group | null>>;
  motifOffsets: Record<
    string,
    {
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
    }
  >;

  setInscriptions: (
    inscriptions: Line[] | ((inscriptions: Line[]) => Line[]),
  ) => void;

  addInscriptionLine: (patch?: LinePatch) => string;
  updateInscription: (id: string, patch: Partial<Line>) => void;
  duplicateInscription: (id: string) => string;
  deleteInscription: (id: string) => void;

  setSelectedInscriptionId: (id: string | null) => void;
  setActiveInscriptionText: (t: string) => void;
  setInscriptionHeightLimits: (min: number, max: number) => void;
  setFontLoading: (loading: boolean) => void;

  setSelectedAdditionId: (id: string | null) => void;
  setAdditionRef: (id: string, ref: React.RefObject<Group | null>) => void;
  setAdditionOffset: (
    id: string,
    offset: {
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
    },
  ) => void;
  duplicateAddition: (id: string) => void;

  setMotifRef: (id: string, ref: React.RefObject<Group | null>) => void;
  setMotifOffset: (id: string, offset: Partial<HeadstoneState['motifOffsets'][string]>) => void;
  duplicateMotif: (id: string) => void;

  navTo?: NavFn;
  setNavTo: (fn: NavFn) => void;

  activePanel: PanelName;
  setActivePanel: (p: PanelName) => void;

  is2DMode: boolean;
  toggleViewMode: () => void;

  loading: boolean;
  setLoading: (loading: boolean) => void;

  isMaterialChange: boolean;
  setIsMaterialChange: (isMaterialChange: boolean) => void;

  openInscriptions: (id: string | null) => void;
  openSizePanel: () => void;
  openAdditionsPanel: () => void;
  closeInscriptions: () => void;

  cropCanvasData: {
    uploadedImage: string;
    selectedMask: string;
    cropColorMode: string;
    cropScale: number;
    cropRotation: number;
    flipX: boolean;
    flipY: boolean;
    cropArea: { x: number; y: number; width: number; height: number };
    hasFixedSizes: boolean;
    allowFreeformHandles?: boolean;
    maskMetrics?: MaskMetrics | null;
    updateCropArea: (area: {
      x: number;
      y: number;
      width: number;
      height: number;
    }) => void;
  } | null;
  setCropCanvasData: (data: HeadstoneState['cropCanvasData']) => void;

  resetDesign: () => void;
};
