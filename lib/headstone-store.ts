'use client';

import { create } from 'zustand';
import React from 'react';
import type { Group } from 'three';
import { DEFAULT_SHAPE_URL } from '#/lib/headstone-constants';
import type { CatalogData, AdditionData, PriceModel } from '#/lib/xml-parser';
import {
  parseCatalogXML,
  calculatePrice,
  fetchAndParseInscriptionDetails,
} from '#/lib/xml-parser';
import { data } from '#/app/_internal/_data';
import {
  fetchAndParseMotifPricing,
  calculateMotifPrice,
  type MotifProductData,
} from '#/lib/motif-pricing';

const TEX_BASE = '/textures/forever/l/';
const DEFAULT_TEX = 'Imperial-Red.webp';

const normalizeTextureUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return url;
  return `/${url.replace(/^\/+/g, '')}`;
};

const isDesktopViewport = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 1024;
};

/* clamps */
const MIN_HEADSTONE_DIM = 300;
const MAX_HEADSTONE_DIM = 1200;
const clampHeadstoneDim = (v: number) =>
  Math.min(MAX_HEADSTONE_DIM, Math.max(MIN_HEADSTONE_DIM, Math.round(v)));

const clampBaseHeight = (v: number) => Math.max(50, Math.min(200, Math.round(v)));
const clampThickness = (v: number) => Math.max(40, Math.min(300, Math.round(v)));

const MIN_INSCRIPTION_SIZE_MM = 5;
const MAX_INSCRIPTION_SIZE_MM = 1200;
const clampInscriptionSize = (v: number) =>
  Math.min(
    MAX_INSCRIPTION_SIZE_MM,
    Math.max(MIN_INSCRIPTION_SIZE_MM, Math.round(v)),
  );

const MIN_INSCRIPTION_ROTATION_DEG = -45;
const MAX_INSCRIPTION_ROTATION_DEG = 45;
const clampInscriptionRotation = (v: number) =>
  Math.max(
    MIN_INSCRIPTION_ROTATION_DEG,
    Math.min(MAX_INSCRIPTION_ROTATION_DEG, Math.round(v)),
  );
const MIN_MOTIF_HEIGHT_MM = 10;

/* types */
export type Line = {
  id: string;
  text: string;
  sizeMm: number;
  font: string;
  color: string;
  xPos: number;
  yPos: number;
  rotationDeg: number;
  target?: 'headstone' | 'base'; // Which object the inscription is on
  baseWidthMm?: number;
  baseHeightMm?: number;
  ref: React.RefObject<Group | null>; // ✅ allow null
};
export type Part = 'headstone' | 'base' | null;
export type AdditionKind = 'statue' | 'vase' | 'application';
export type Material = {
  id: string;
  name: string;
  image: string;
  category: string;
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
  | 'checkprice'
  | 'designs'
  | null;
type NavFn = (href: string, opts?: { replace?: boolean }) => void;

type LinePatch = Partial<
  Pick<
    Line,
    'text' | 'font' | 'sizeMm' | 'rotationDeg' | 'xPos' | 'yPos' | 'color'
  >
>;

type HeadstoneState = {
  catalog: CatalogData | null;
  setCatalog: (catalog: CatalogData) => void;

  materials: Material[];
  setMaterials: (materials: Material[]) => void;

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
  }) => void;
  removeImage: (id: string) => void;
  updateImagePosition: (id: string, xPos: number, yPos: number) => void;
  updateImageSize: (id: string, widthMm: number, heightMm: number) => void;
  updateImageRotation: (id: string, rotationZ: number) => void;

  productId: string | null;
  setProductId: (id: string) => void;

  showBase: boolean;
  setShowBase: (showBase: boolean) => void;

  editingObject: 'headstone' | 'base';
  setEditingObject: (obj: 'headstone' | 'base') => void;

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
  
  baseThickness: number; // Base depth/thickness in mm (100-300mm)
  setBaseThickness: (thickness: number) => void;
  
  baseFinish: 'default' | 'rock-pitch';
  setBaseFinish: (finish: 'default' | 'rock-pitch') => void;

  headstoneStyle: 'upright' | 'slant';
  setHeadstoneStyle: (style: 'upright' | 'slant') => void;

  uprightThickness: number; // Absolute thickness in mm (100-300mm)
  setUprightThickness: (thickness: number) => void;

  slantThickness: number; // Absolute thickness in mm (100-300mm)
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
      targetSurface?: 'headstone' | 'base';
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
  motifRefs: Record<string, React.RefObject<Group | null>>;
  motifOffsets: Record<
    string,
    {
      xPos: number;
      yPos: number;
      scale: number;
      rotationZ: number;
      heightMm: number;
      target?: 'headstone' | 'base';
      coordinateSpace?: 'absolute' | 'offset';
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
      targetSurface?: 'headstone' | 'base';
      additionType?: AdditionKind;
      assetFile?: string;
      sourceId?: string;
      additionName?: string;
      zPosFinalized?: boolean;
      footprintWidth?: number;
    },
  ) => void;
  duplicateAddition: (id: string) => void;

  setSelectedMotifId: (id: string | null) => void;
  setMotifRef: (id: string, ref: React.RefObject<Group | null>) => void;
  setMotifOffset: (
    id: string,
    offset: { xPos: number; yPos: number; scale: number; rotationZ: number; heightMm: number },
  ) => void;
  duplicateMotif: (id: string) => void;

  /* router injection */
  navTo?: NavFn;
  setNavTo: (fn: NavFn) => void;

  /* overlay / panel control */
  activePanel: PanelName;
  setActivePanel: (p: PanelName) => void;

  /* view mode */
  is2DMode: boolean;
  toggleViewMode: () => void;

  /* loading */
  loading: boolean;
  setLoading: (loading: boolean) => void;

  isMaterialChange: boolean;
  setIsMaterialChange: (isMaterialChange: boolean) => void;

  openInscriptions: (id: string | null) => void;
  openSizePanel: () => void;
  openAdditionsPanel: () => void;
  closeInscriptions: () => void;

  resetDesign: () => void;
};

const MIN_SURFACE_DIMENSION_MM = 1;

const resolveSurfaceDimensions = (
  state: Pick<HeadstoneState, 'widthMm' | 'heightMm' | 'baseWidthMm' | 'baseHeightMm'>,
  surface: 'headstone' | 'base',
) => {
  if (surface === 'base') {
    const widthMm = state.baseWidthMm || state.widthMm || MIN_SURFACE_DIMENSION_MM;
    const heightMm = state.baseHeightMm || state.heightMm || MIN_SURFACE_DIMENSION_MM;
    return { widthMm, heightMm };
  }
  return {
    widthMm: state.widthMm || MIN_SURFACE_DIMENSION_MM,
    heightMm: state.heightMm || MIN_SURFACE_DIMENSION_MM,
  };
};

const withLineSurfaceDimensions = (
  line: Line,
  surface: 'headstone' | 'base',
  state: HeadstoneState,
  force = false,
): Line => {
  const dims = resolveSurfaceDimensions(state, surface);
  const needsWidth = force || !line.baseWidthMm;
  const needsHeight = force || !line.baseHeightMm;
  return {
    ...line,
    target: surface,
    baseWidthMm: needsWidth ? dims.widthMm : line.baseWidthMm,
    baseHeightMm: needsHeight ? dims.heightMm : line.baseHeightMm,
  };
};

const normalizeLineDimensions = (lines: Line[], state: HeadstoneState) =>
  lines.map((line) =>
    withLineSurfaceDimensions(
      line,
      line.target === 'base' ? 'base' : 'headstone',
      state,
      !line.baseWidthMm || !line.baseHeightMm,
    ),
  );

type OffsetWithDimensions = { baseWidthMm?: number; baseHeightMm?: number };

const withOffsetSurfaceDimensions = <T extends OffsetWithDimensions>(
  offset: T,
  surface: 'headstone' | 'base',
  state: HeadstoneState,
  force = false,
): T & { baseWidthMm: number; baseHeightMm: number } => {
  const dims = resolveSurfaceDimensions(state, surface);
  const baseWidthMm = force || !offset.baseWidthMm ? dims.widthMm : offset.baseWidthMm;
  const baseHeightMm = force || !offset.baseHeightMm ? dims.heightMm : offset.baseHeightMm;
  return {
    ...offset,
    baseWidthMm,
    baseHeightMm,
  } as T & { baseWidthMm: number; baseHeightMm: number };
};

let nextId = 0;
const genId = () => `l-${nextId++}`;
let nextMotifId = 0;
const genMotifId = () => `motif-${nextMotifId++}`;

export const useHeadstoneStore = create<HeadstoneState>()((set, get) => ({
  catalog: null,
  setCatalog(catalog) {
    set({ catalog });
  },

  materials: [],
  setMaterials(materials) {
    set({ materials });
  },

  minWidthMm: MIN_HEADSTONE_DIM,
  maxWidthMm: MAX_HEADSTONE_DIM,
  minHeightMm: MIN_HEADSTONE_DIM,
  maxHeightMm: MAX_HEADSTONE_DIM,
  minBaseWidthMm: MIN_HEADSTONE_DIM,
  maxBaseWidthMm: MAX_HEADSTONE_DIM,
  minBaseHeightMm: 50,
  maxBaseHeightMm: 200,
  minThicknessMm: 40,
  maxThicknessMm: 300,

  // Start with empty additions - user can add via "Select Additions" panel
  selectedAdditions: [],
  addAddition: (id) => {
    const additionData = data.additions.find((a) => a.id === id);
    const additionType: AdditionKind = (additionData?.type as AdditionKind) ?? 'application';
    // Create a unique instance ID with timestamp
    const instanceId = `${id}_${Date.now()}`;
    set((s) => {
      const targetSurface: 'headstone' | 'base' = s.selected === 'base' ? 'base' : 'headstone';
      const defaultOffset = withOffsetSurfaceDimensions(
        {
          scale: 1,
          rotationZ: 0,
          sizeVariant: 1,
          targetSurface,
          zPos: undefined,
          additionType,
          assetFile: additionData?.file,
          sourceId: id,
          additionName: additionData?.name,
          zPosFinalized: false,
        },
        targetSurface,
        s,
        true,
      );
      return {
        selectedAdditions: [...s.selectedAdditions, instanceId],
        selectedAdditionId: instanceId,
        activePanel: 'addition',
        additionOffsets: {
          ...s.additionOffsets,
          [instanceId]: defaultOffset,
        },
      };
    });
  },
  removeAddition: (id) => {
    set((s) => {
      const newAdditions = s.selectedAdditions.filter((aid) => aid !== id);
      const newRefs = { ...s.additionRefs };
      delete newRefs[id];
      const newOffsets = { ...s.additionOffsets };
      delete newOffsets[id];
      
      return {
        selectedAdditions: newAdditions,
        additionRefs: newRefs,
        additionOffsets: newOffsets,
        selectedAdditionId: s.selectedAdditionId === id ? null : s.selectedAdditionId,
      };
    });
  },
  hasStatue: () => {
    const { selectedAdditions } = get();
    // Check if any selected addition is a statue or vase
    return selectedAdditions.some((instanceId) => {
      // Extract base ID from instance ID (remove timestamp suffix)
      const parts = instanceId.split('_');
      const baseId = parts.length > 1 && !isNaN(Number(parts[parts.length - 1])) 
        ? parts.slice(0, -1).join('_')
        : instanceId;
      
      const addition = data.additions.find((a) => a.id === baseId);
      return addition?.type === 'statue' || addition?.type === 'vase';
    });
  },

  // Sample template: Add dove motif
  // selectedMotifs: [
  //   { 
  //     id: 'motif_dove_1', 
  //     svgPath: '/shapes/motifs/dove_002.svg', 
  //     color: '#c99d44' 
  //   },
  // ],
  selectedMotifs: [],
  addMotif: (svgPath) => {
    const id = genMotifId();
    const state = get();
    const { catalog, selected } = state;
    const isLaser = catalog?.product.laser === '1';
    // Use defaultColor from catalog, fallback to white for laser or gold for others
    const defaultColor = catalog?.product.defaultColor || (isLaser ? '#ffffff' : '#c99d44');
    
    // Set target based on currently selected object (headstone or base)
    const target: 'base' | 'headstone' = selected === 'base' ? 'base' : 'headstone';
    
    set((s) => {
      const newMotifs = [...s.selectedMotifs, { id, svgPath, color: defaultColor }];
      const defaultOffset = withOffsetSurfaceDimensions(
        {
          xPos: 0,
          yPos: 0,
          scale: 1,
          rotationZ: 0,
          heightMm: 100,
          target,
          coordinateSpace: 'offset',
          flipX: false,
          flipY: false,
        },
        target,
        s,
        true,
      );
      const newOffsets = {
        ...s.motifOffsets,
        [id]: defaultOffset,
      };
      return {
        selectedMotifs: newMotifs,
        motifOffsets: newOffsets,
        selectedMotifId: id, // Auto-select the newly added motif
        activePanel: 'motif', // Open the edit panel instead of closing
      };
    });
    // Calculate cost after adding
    setTimeout(() => state.calculateMotifCost(), 0);
  },
  removeMotif: (id) => {
    set((s) => {
      const updatedOffsets = { ...s.motifOffsets };
      delete updatedOffsets[id];
      const isActiveMotif = s.selectedMotifId === id;
      return {
        selectedMotifs: s.selectedMotifs.filter((m) => m.id !== id),
        motifOffsets: updatedOffsets,
        selectedMotifId: isActiveMotif ? null : s.selectedMotifId,
        activePanel: isActiveMotif ? null : s.activePanel,
      };
    });
    // Calculate cost after removing
    setTimeout(() => get().calculateMotifCost(), 0);
  },
  setMotifColor: (id, color) => {
    set((s) => ({
      selectedMotifs: s.selectedMotifs.map((m) =>
        m.id === id ? { ...m, color } : m
      ),
    }));
    // Recalculate cost when color changes
    setTimeout(() => get().calculateMotifCost(), 0);
  },

  // Image management
  selectedImages: [],
  cropCanvasData: null, // Stores the crop canvas state when user is cropping
  setCropCanvasData: (data) => set({ cropCanvasData: data }),
  addImage: (image) => {
    set((s) => ({
      selectedImages: [...s.selectedImages, image],
      cropCanvasData: null, // Clear crop canvas after adding
    }));
  },
  removeImage: (id) => {
    set((s) => ({
      selectedImages: s.selectedImages.filter((img) => img.id !== id),
    }));
  },
  updateImagePosition: (id, xPos, yPos) => {
    set((s) => ({
      selectedImages: s.selectedImages.map((img) =>
        img.id === id ? { ...img, xPos, yPos } : img
      ),
    }));
  },
  updateImageSize: (id, widthMm, heightMm) => {
    set((s) => ({
      selectedImages: s.selectedImages.map((img) =>
        img.id === id ? { ...img, widthMm, heightMm } : img
      ),
    }));
  },
  updateImageRotation: (id, rotationZ) => {
    set((s) => ({
      selectedImages: s.selectedImages.map((img) =>
        img.id === id ? { ...img, rotationZ } : img
      ),
    }));
  },

  productId: null,
  setProductId: async (id) => {

    const prevSnapshot = get();
    const prevHeadstoneHeight = Math.max(prevSnapshot.heightMm || 0, 1);
    const prevBaseHeight = Math.max(
      prevSnapshot.baseHeightMm || prevSnapshot.heightMm || 0,
      1,
    );
    const prevWidthMm = prevSnapshot.widthMm ?? 0;
    const prevHeightMm = prevSnapshot.heightMm ?? 0;
    const prevSquare610 =
      Math.abs(prevWidthMm - prevHeightMm) <= 5 &&
      Math.abs(prevWidthMm - 610) <= 20 &&
      Math.abs(prevHeightMm - 610) <= 20;

    // Immediately capture the user's selection so downstream effects know a
    // product has been chosen even while the catalog XML is loading.
    // CRITICAL: Clear the old catalog to prevent showing stale data
    set({ productId: id, catalog: null });

    try {

      const response = await fetch(`/xml/catalog-id-${id}.xml`);
      const xmlText = await response.text();
      const catalog = await parseCatalogXML(xmlText, id);

      if (get().productId !== id) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[Store] Ignoring stale catalog response for product', id);
        }
        return;
      }

      set({ catalog, productId: id });
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Store] Catalog set for product', id, ':', {
          catalogName: catalog.product.name,
          catalogId: catalog.product.id,
          catalogType: catalog.product.type
        });
      }

      const productType = catalog.product.type;
      const isPlaque = productType === 'plaque';
      const isHeadstoneLike =
        productType === 'headstone' || productType === 'mini-headstone';
      const showBase = isHeadstoneLike || productType === 'monument';
      const showInscriptionColor = catalog.product.laser !== '1' && catalog.product.color !== '0';
      set({ showBase, showInscriptionColor });
      const hasBase = showBase;
      const prevProductType = prevSnapshot.catalog?.product?.type;
      const prevProductWasPlaque =
        prevProductType === 'plaque' || prevProductType === 'bronze_plaque';
      const shouldForceSquarePlaque =
        isPlaque && (prevSquare610 || !prevProductWasPlaque);

      const supportsBorder = isPlaque && catalog.product.border === '1';
      const currentBorderName = get().borderName;
      if (supportsBorder) {
        if (!currentBorderName || currentBorderName.toLowerCase().includes('no border')) {
          const defaultBorder = data.borders.find((border) => border.id !== '0');
          if (defaultBorder) {
            set({ borderName: defaultBorder.name });
          }
        }
      } else if (currentBorderName) {
        set({ borderName: null });
      }

      const isBronzePlaqueProduct = catalog.product.id === '5';
      const materialOptions = isBronzePlaqueProduct
        ? data.bronzes.map(({ id, name, image, category }) => ({
            id,
            name,
            image,
            category,
          }))
        : data.materials.map((material) => ({ ...material }));
      set({ materials: materialOptions });
      if (isPlaque) {
        set({ shapeUrl: '/shapes/headstones/square.svg' });
      }
      if (!showInscriptionColor) {
        set((s) => ({
          inscriptions: s.inscriptions.map((line) => ({
            ...line,
            color: '#ffffff',
          })),
        }));
      }

      const inscriptionAddition = catalog.product.additions.find(
        (add) => add.id === '125' && add.type === 'inscription',
      );
      if (inscriptionAddition) {
        const minHeight =
          inscriptionAddition.minHeight ?? MIN_INSCRIPTION_SIZE_MM;
        const maxHeight =
          inscriptionAddition.maxHeight ?? MAX_INSCRIPTION_SIZE_MM;
        const initHeight =
          inscriptionAddition.initHeight ?? MIN_INSCRIPTION_SIZE_MM;
        set({
          inscriptionMinHeight: minHeight,
          inscriptionMaxHeight: maxHeight,
        });
        set((s) => ({
          inscriptions: s.inscriptions.map((line) => ({
            ...line,
            sizeMm: initHeight,
          })),
        }));
      }
      if (inscriptionAddition) {
        const inscriptionDetails = await fetchAndParseInscriptionDetails(
          inscriptionAddition.id,
        );
        if (inscriptionDetails) {
          set({ inscriptionPriceModel: inscriptionDetails.priceModel });
        }
      }

      if (catalog.product.shapes.length > 0) {
        const shape = catalog.product.shapes[0];
        const currentState = get();

        const widthMin = shape.table.minWidth || MIN_HEADSTONE_DIM;
        const widthMax = shape.table.maxWidth || MAX_HEADSTONE_DIM;
        const heightMin = shape.table.minHeight || MIN_HEADSTONE_DIM;
        const heightMax = shape.table.maxHeight || MAX_HEADSTONE_DIM;
        const baseWidthMin = shape.stand.minWidth || widthMin;
        const baseWidthMax = shape.stand.maxWidth || Math.max(baseWidthMin, MAX_HEADSTONE_DIM * 1.5);
        const baseHeightMin = shape.stand.minHeight || 50;
        const baseHeightMax = shape.stand.maxHeight || 200;
        const thicknessMin = Math.min(shape.table.minDepth || 40, shape.stand.minDepth || 40);
        const thicknessMax = Math.max(shape.table.maxDepth || 300, shape.stand.maxDepth || 300);

        set({
          minWidthMm: widthMin,
          maxWidthMm: Math.max(widthMin, widthMax),
          minHeightMm: heightMin,
          maxHeightMm: Math.max(heightMin, heightMax),
          minBaseWidthMm: Math.max(widthMin, baseWidthMin),
          maxBaseWidthMm: Math.max(baseWidthMin, baseWidthMax),
          minBaseHeightMm: baseHeightMin,
          maxBaseHeightMm: Math.max(baseHeightMin, baseHeightMax),
          minThicknessMm: Math.max(10, thicknessMin),
          maxThicknessMm: Math.max(thicknessMin, thicknessMax),
        });

        const clampedWidth = Math.max(widthMin, Math.min(Math.max(widthMin, widthMax), shape.table.initWidth || currentState.widthMm));
        const clampedHeight = Math.max(heightMin, Math.min(Math.max(heightMin, heightMax), shape.table.initHeight || currentState.heightMm));
        let targetWidth = clampedWidth;
        let targetHeight = clampedHeight;
        if (shouldForceSquarePlaque) {
          const desiredSquare = 300;
          const maxAllowedWidth = Math.max(widthMin, widthMax);
          const maxAllowedHeight = Math.max(heightMin, heightMax);
          targetWidth = Math.max(widthMin, Math.min(maxAllowedWidth, desiredSquare));
          targetHeight = Math.max(heightMin, Math.min(maxAllowedHeight, desiredSquare));
        }
        const clampedStandWidth = Math.max(targetWidth, Math.min(Math.max(baseWidthMin, baseWidthMax), shape.stand.initWidth || currentState.baseWidthMm));
        const clampedStandHeight = Math.max(baseHeightMin, Math.min(Math.max(baseHeightMin, baseHeightMax), shape.stand.initHeight || currentState.baseHeightMm));
        const clampedStandDepth = Math.max(thicknessMin, Math.min(Math.max(thicknessMin, thicknessMax), shape.stand.initDepth || currentState.baseThickness));
        const clampedTabletThickness = Math.max(thicknessMin, Math.min(Math.max(thicknessMin, thicknessMax), shape.table.initDepth || currentState.uprightThickness));
        const effectiveStandHeight = hasBase ? clampedStandHeight : 0;

        const headstoneScaleFactor = Math.min(
          1,
          targetHeight / prevHeadstoneHeight,
        );
        const baseScaleFactor = hasBase
          ? Math.min(
              1,
              effectiveStandHeight / prevBaseHeight,
            )
          : headstoneScaleFactor;

        set({
          widthMm: targetWidth,
          heightMm: targetHeight,
          baseWidthMm: clampedStandWidth,
          baseHeightMm: effectiveStandHeight,
          baseThickness: clampedStandDepth,
          uprightThickness: clampedTabletThickness,
          slantThickness: clampedTabletThickness,
        });

        if (shape.table.color) {
          // Fix texture path - ensure it starts with /
          const texturePath = shape.table.color.startsWith('/') 
            ? shape.table.color 
            : `/${shape.table.color}`;

          set({ headstoneMaterialUrl: texturePath });
        }
        if (shape.stand.color) {
          // Fix texture path - ensure it starts with /
          const baseTexturePath = shape.stand.color.startsWith('/') 
            ? shape.stand.color 
            : `/${shape.stand.color}`;
          set({ baseMaterialUrl: baseTexturePath });
        }

        const productDefaultColor =
          catalog.product.defaultColor ||
          (catalog.product.laser === '1' ? '#ffffff' : '#c99d44');
        const headstoneHeightLimit = Math.max(10, targetHeight);
        const baseHeightLimit = hasBase
          ? Math.max(10, effectiveStandHeight > 0 ? effectiveStandHeight : targetHeight)
          : headstoneHeightLimit;

        const existingState = get();
        if (
          existingState.inscriptions.length > 0 ||
          existingState.selectedMotifs.length > 0 ||
          Object.keys(existingState.motifOffsets).length > 0
        ) {
          set((s) => {
            const motifEntries = Object.entries(s.motifOffsets);
            const minFontSize = Math.max(
              MIN_INSCRIPTION_SIZE_MM,
              s.inscriptionMinHeight || MIN_INSCRIPTION_SIZE_MM,
            );
            const maxFontSize = Math.max(
              minFontSize,
              s.inscriptionMaxHeight || MAX_INSCRIPTION_SIZE_MM,
            );
            const clampYWithin = (value: number, limit: number) => {
              const half = Math.max(limit / 2, 0);
              if (!half) return value;
              return Math.max(-half, Math.min(half, value));
            };
            const updatedMotifOffsets =
              motifEntries.length > 0
                ? (Object.fromEntries(
                    motifEntries.map(([key, offset]) => {
                      const originalTarget = offset.target ?? 'headstone';
                      const normalizedTarget = !hasBase && originalTarget === 'base'
                        ? 'headstone'
                        : originalTarget;
                      const limit = normalizedTarget === 'base' ? baseHeightLimit : headstoneHeightLimit;
                      const baseScale = normalizedTarget === 'base' ? baseScaleFactor : headstoneScaleFactor;
                      const originalHeight = offset.heightMm ?? limit;
                      const minHeightRatio = originalHeight > 0
                        ? Math.min(1, MIN_MOTIF_HEIGHT_MM / originalHeight)
                        : 1;
                      const effectiveScale = Math.min(1, Math.max(baseScale, minHeightRatio));
                      const scaledHeight = Math.round(originalHeight * effectiveScale);
                      const boundedHeight = Math.max(
                        MIN_MOTIF_HEIGHT_MM,
                        Math.min(limit, scaledHeight),
                      );
                      return [
                        key,
                        {
                          ...offset,
                          target: normalizedTarget,
                          heightMm: boundedHeight,
                          yPos: offset.yPos ?? 0,
                        },
                      ];
                    }),
                  ) as typeof s.motifOffsets)
                : s.motifOffsets;

            const scaledLines = s.inscriptions.map((line) => {
              const originalTarget = line.target === 'base' ? 'base' : 'headstone';
              const normalizedTarget = !hasBase && originalTarget === 'base' ? 'headstone' : originalTarget;
              const limit = normalizedTarget === 'base' ? baseHeightLimit : headstoneHeightLimit;
              const baseScale = normalizedTarget === 'base' ? baseScaleFactor : headstoneScaleFactor;
              const minScaleRatio = line.sizeMm > 0
                ? Math.min(1, minFontSize / line.sizeMm)
                : 1;
              const effectiveScale = Math.min(1, Math.max(baseScale, minScaleRatio));
              const scaledSize = Math.round(line.sizeMm * effectiveScale);
              const boundedSize = Math.max(
                minFontSize,
                Math.min(maxFontSize, scaledSize),
              );
              return {
                ...line,
                target: normalizedTarget,
                color: productDefaultColor,
                sizeMm: boundedSize,
                yPos: line.yPos,
              };
            });

            const entries = Object.entries(updatedMotifOffsets);
            const scaledOffsets = entries.length > 0
              ? (Object.fromEntries(
                  entries.map(([key, offset]) => {
                    const normalizedTarget = !hasBase && offset.target === 'base'
                      ? 'headstone'
                      : offset.target ?? 'headstone';
                    const limit = normalizedTarget === 'base' ? baseHeightLimit : headstoneHeightLimit;
                    return [
                      key,
                      {
                        ...offset,
                        target: normalizedTarget,
                        yPos: offset.yPos ?? 0,
                      },
                    ];
                  }),
                ) as typeof s.motifOffsets)
              : updatedMotifOffsets;

            return {
              inscriptions: scaledLines,
              selectedMotifs: s.selectedMotifs.map((motif) => ({
                ...motif,
                color: productDefaultColor,
              })),
              motifOffsets: scaledOffsets,
            };
          });
          setTimeout(() => get().calculateMotifCost(), 0);
        }
      }

      // Load motif pricing based on product type
      const isBronze = catalog.product.type === 'bronze_plaque';
      const isLaser = catalog.product.laser === '1';
      const motifType = isBronze ? 'bronze' : isLaser ? 'laser' : 'engraved';
      
      const motifPricing = await fetchAndParseMotifPricing(motifType);
      if (motifPricing) {
        set({ motifPriceModel: motifPricing });
      }
    } catch (error) {
      console.error('Failed to load or parse catalog XML:', error);
    }
  },

  showBase: true,
  setShowBase: (showBase) => set({ showBase }),

  editingObject: 'headstone',
  setEditingObject: (obj) => set({ editingObject: obj }),

  showInscriptionColor: true,
  inscriptionPriceModel: null,

  shapeUrl: DEFAULT_SHAPE_URL,
  setShapeUrl(shapeUrl) {
    set({ shapeUrl });
    
    // When shape changes, update dimensions from catalog if available
    const state = get();
    const catalog = state.catalog;
    
    if (catalog && catalog.product.shapes.length > 0) {
      // Try to find matching shape by comparing URL
      // Extract shape filename from URL (e.g., "oval_horizontal.svg" from "/shapes/masks/oval_horizontal.svg")
      const shapeFileName = shapeUrl.split('/').pop();
      
      // Find shape in catalog that matches
      // Check both the shape URL and code to find the right shape
      const matchingShape = catalog.product.shapes.find(shape => {
        const catalogFileName = shape.name.toLowerCase().replace(/\s+/g, '_') + '.svg';
        const shapeFileNameNoExt = shapeFileName ? shapeFileName.replace('.svg', '') : '';
        return shapeFileName === catalogFileName || 
               (shape.url && shapeFileNameNoExt && shape.url.includes(shapeFileNameNoExt)) ||
               (shapeFileName === 'oval_horizontal.svg' && shape.code === 'Oval Landscape') ||
               (shapeFileName === 'oval_vertical.svg' && shape.code === 'Oval Portrait') ||
               (shapeFileName === 'circle.svg' && shape.code === 'Circle') ||
               (shapeFileName === 'landscape.svg' && shape.code === 'Landscape') ||
               (shapeFileName === 'portrait.svg' && shape.code === 'Portrait') ||
               (shapeFileName === 'square.svg' && shape.code === 'Square');
      });
      
      if (matchingShape) {
        console.log('Shape changed, loading dimensions:', {
          shape: matchingShape.code,
          width: matchingShape.table.initWidth,
          height: matchingShape.table.initHeight,
        });
        
        set({
          widthMm: matchingShape.table.initWidth,
          heightMm: matchingShape.table.initHeight,
        });
      }
    }
  },

  borderName: null,
  setBorderName(name) {
    set({ borderName: name });
  },

  materialUrl: `${TEX_BASE}${DEFAULT_TEX}`,
  setMaterialUrl(materialUrl) {
    const normalized = normalizeTextureUrl(materialUrl) ?? `${TEX_BASE}${DEFAULT_TEX}`;
    set({ materialUrl: normalized });
  },

  headstoneMaterialUrl: `${TEX_BASE}${DEFAULT_TEX}`,
  setHeadstoneMaterialUrl(url) {
    const normalized = normalizeTextureUrl(url) ?? `${TEX_BASE}${DEFAULT_TEX}`;
    set({ headstoneMaterialUrl: normalized });
  },

  baseMaterialUrl: `${TEX_BASE}${DEFAULT_TEX}`,
  setBaseMaterialUrl(url) {
    const normalized = normalizeTextureUrl(url) ?? `${TEX_BASE}${DEFAULT_TEX}`;
    set({ baseMaterialUrl: normalized, baseSwapping: true });
  },

  baseSwapping: false,
  setBaseSwapping: (swapping) => set({ baseSwapping: swapping }),

  widthMm: 900,
  setWidthMm(v) {
    const { minWidthMm, maxWidthMm } = get();
    const clamped = Math.max(minWidthMm, Math.min(maxWidthMm, Math.round(v)));
    set({ widthMm: clamped });
    
    // Ensure base width is at least as wide as headstone
    const state = get();
    if (state.baseWidthMm < clamped) {
      set({ baseWidthMm: clamped });
    }
  },

  heightMm: 900,
  setHeightMm(v) {
    const { minHeightMm, maxHeightMm } = get();
    const clamped = Math.max(minHeightMm, Math.min(maxHeightMm, Math.round(v)));
    set({ heightMm: clamped });
  },
  
  baseWidthMm: 1260, // Default: 900 * 1.4
  setBaseWidthMm(v) {
    const state = get();
    const minAllowed = Math.max(state.minBaseWidthMm, state.widthMm);
    const maxAllowed = Math.max(minAllowed, state.maxBaseWidthMm);
    const clampedWidth = Math.max(minAllowed, Math.min(maxAllowed, Math.round(v)));
    set({ baseWidthMm: clampedWidth });
  },
  
  baseHeightMm: 100, // Base height is 100mm
  setBaseHeightMm(v) {
    const { minBaseHeightMm, maxBaseHeightMm } = get();
    const clamped = Math.max(minBaseHeightMm, Math.min(maxBaseHeightMm, Math.round(v)));
    set({ baseHeightMm: clamped });
  },
  
  baseThickness: 250, // Default base thickness 250mm (will be overwritten by catalog)
  setBaseThickness(thickness) {
    const { minThicknessMm, maxThicknessMm } = get();
    const clamped = Math.max(minThicknessMm, Math.min(maxThicknessMm, Math.round(thickness)));
    set({ baseThickness: clamped });
  },
  
  baseFinish: 'default',
  setBaseFinish(finish) {
    set({ baseFinish: finish });
  },

  headstoneStyle: 'upright',
  setHeadstoneStyle(style) {
    set({ headstoneStyle: style });
  },

  uprightThickness: 150, // Default 150mm thickness
  setUprightThickness(thickness) {
    const { minThicknessMm, maxThicknessMm } = get();
    const clamped = Math.max(minThicknessMm, Math.min(maxThicknessMm, Math.round(thickness)));
    set({ uprightThickness: clamped });
  },

  slantThickness: 150, // Default 150mm thickness
  setSlantThickness(thickness) {
    const { minThicknessMm, maxThicknessMm } = get();
    const clamped = Math.max(minThicknessMm, Math.min(maxThicknessMm, Math.round(thickness)));
    set({ slantThickness: clamped });
  },

  selected: null,
  setSelected(p) {
    if (p) {
      set({
        selected: p,
        selectedAdditionId: null,
        selectedInscriptionId: null,
        selectedMotifId: null,
      });
    } else {
      set({ selected: p });
    }
  },

  // Sample template: Beautiful memorial inscriptions with much larger spacing
  // inscriptions: [
  //   {
  //     id: genId(),
  //     text: 'In Loving Memory',
  //     font: 'Chopin Script',
  //     sizeMm: 55,
  //     color: '#c99d44',
  //     xPos: 0,
  //     yPos: 50,  // Moved higher for more space
  //     rotationDeg: 0,
  //     ref: React.createRef<Group>(),
  //   },
  //   {
  //     id: genId(),
  //     text: 'Sarah Elizabeth Thompson',
  //     font: 'Chopin Script',
  //     sizeMm: 75,
  //     color: '#c99d44',
  //     xPos: 0,
  //     yPos: 20,  // Larger gap (30mm from above)
  //     rotationDeg: 0,
  //     ref: React.createRef<Group>(),
  //   },
  //   {
  //     id: genId(),
  //     text: '1945 - 2023',
  //     font: 'Franklin Gothic',  // Different font for dates
  //     sizeMm: 50,
  //     color: '#ffffff',  // White for contrast
  //     xPos: 0,
  //     yPos: -12,  // Larger gap (32mm from above)
  //     rotationDeg: 0,
  //     ref: React.createRef<Group>(),
  //   },
  //   {
  //     id: genId(),
  //     text: 'Forever in Our Hearts',
  //     font: 'Chopin Script',
  //     sizeMm: 45,
  //     color: '#c99d44',
  //     xPos: 0,
  //     yPos: -38,  // Larger gap (26mm from above)
  //     rotationDeg: 0,
  //     ref: React.createRef<Group>(),
  //   },
  //   {
  //     id: genId(),
  //     text: 'Beloved Mother & Grandmother',
  //     font: 'Chopin Script',
  //     sizeMm: 38,
  //     color: '#c99d44',
  //     xPos: 0,
  //     yPos: -60,  // Larger gap (22mm from above)
  //     rotationDeg: 0,
  //     ref: React.createRef<Group>(),
  //   },
  // ],
  inscriptions: [],
  selectedInscriptionId: null,
  activeInscriptionText: '',
  inscriptionMinHeight: 5,
  inscriptionMaxHeight: 1200,
  fontLoading: false,
  inscriptionCost: 0,

  motifPriceModel: null,
  motifCost: 0,

  selectedAdditionId: null,
  additionRefs: {},
  // Sample template: Pre-positioned additions for beautiful composition
  // additionOffsets: {
  //   'B2127': { xPos: 0, yPos: -130, scale: 0.6, rotationZ: 0 },        // Cross at top
  //   'B1134S': { xPos: 150, yPos: -90, scale: 0.7, rotationZ: 0 },     // Angel at right side
  // },
  additionOffsets: {},

  selectedMotifId: null,
  motifRefs: {},
  // Sample template: Pre-positioned motif
  // motifOffsets: {
  //   'motif_dove_1': { xPos: -170, yPos: 0, scale: 1.2, rotationZ: 0, heightMm: 40 },   // Dove - centered vertically
  // },
  motifOffsets: {},

  setInscriptions: (inscriptions) => {
    if (typeof inscriptions === 'function') {
      set((s) => ({
        inscriptions: normalizeLineDimensions(inscriptions(s.inscriptions), s),
      }));
    } else {
      set((s) => ({ inscriptions: normalizeLineDimensions(inscriptions, s) }));
    }
    get().calculateInscriptionCost();
  },

  addInscriptionLine: (patch: LinePatch = {}) => {
    const id = genId();
    const state = get();

    const text = patch.text ?? 'New line';
    const font = patch.font ?? 'Garamond';
    const sizeMm = clampInscriptionSize(
      patch.sizeMm ?? state.inscriptionMinHeight,
    );
    const rotationDeg = clampInscriptionRotation(patch.rotationDeg ?? 0);
    const xPos = patch.xPos ?? 0;
    const yPos = patch.yPos ?? 0;
    
    // Determine color: use catalog defaultColor if available, otherwise use hardcoded defaults
    let color: string;
    if (state.showInscriptionColor === false) {
      color = '#ffffff';
    } else {
      color = patch.color ?? state.catalog?.product.defaultColor ?? '#c99d44';
    }
    
    // Set target based on currently selected object (headstone or base)
    const target = state.selected === 'base' ? 'base' : 'headstone';

    const newLine: Line = {
      id,
      text,
      font,
      sizeMm,
      rotationDeg,
      xPos,
      yPos,
      color,
      target,
      ref: React.createRef<Group>(),
    };
    const normalizedLine = withLineSurfaceDimensions(newLine, target, state, true);

    set((s) => ({
      inscriptions: [...s.inscriptions, normalizedLine],
      selectedInscriptionId: id,
    }));
    state.calculateInscriptionCost();
    return id;
  },

  updateInscription: (id, patch) => {
    set((s) => ({
      inscriptions: s.inscriptions.map((l) => {
        if (l.id !== id) return l;
        const nextTarget = patch.target ?? l.target ?? 'headstone';
        const updatedLine: Line = {
          ...l,
          ...patch,
          sizeMm:
            patch.sizeMm !== undefined
              ? clampInscriptionSize(patch.sizeMm)
              : l.sizeMm,
          rotationDeg:
            patch.rotationDeg !== undefined
              ? clampInscriptionRotation(patch.rotationDeg)
              : l.rotationDeg,
        };
        const needsDimensions =
          patch.target !== undefined ||
          patch.xPos !== undefined ||
          patch.yPos !== undefined ||
          !updatedLine.baseWidthMm ||
          !updatedLine.baseHeightMm;
        return withLineSurfaceDimensions(updatedLine, nextTarget, s, needsDimensions);
      }),
    }));
    get().calculateInscriptionCost();
  },

  duplicateInscription: (id) => {
    const src = get().inscriptions.find((l) => l.id === id);
    if (!src) return '';
    const newId = genId();

    // Measure the actual text height using canvas
    let offset = src.sizeMm / 10 + 5; // fallback
    if (typeof window !== 'undefined') {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.font = `${src.sizeMm}px "${src.font}"`;
        const metrics = ctx.measureText(src.text);
        if (
          metrics.fontBoundingBoxAscent !== undefined &&
          metrics.fontBoundingBoxDescent !== undefined
        ) {
          const heightPx =
            metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
          offset = heightPx + 5; // actual height in mm + gap
        }
      }
    }

    set((s) => ({
      inscriptions: [
        ...s.inscriptions,
        {
          ...src,
          id: newId,
          ref: React.createRef<Group>(),
          yPos: src.yPos - offset, // Position below current position accounting for actual text height
        },
      ],
      selectedInscriptionId: newId, // Select the newly duplicated inscription
    }));
    get().calculateInscriptionCost();
    return newId;
  },

  deleteInscription: (id) => {
    set((s) => {
      const rest = s.inscriptions.filter((l) => l.id !== id);
      const next = rest[0]?.id ?? null;
      return { inscriptions: rest, selectedInscriptionId: next };
    });
    get().calculateInscriptionCost();
  },

  setSelectedInscriptionId: (id) => {
    if (id === get().selectedInscriptionId) return;

    if (!id) {
      set({ selectedInscriptionId: null, activeInscriptionText: '' });
      return;
    }

    const line = get().inscriptions.find((l) => l.id === id);
    if (line) {
      set({ 
        selectedInscriptionId: id, 
        activeInscriptionText: line.text,
        selectedMotifId: null, // Deselect any motif
        selectedAdditionId: null, // Deselect any addition
        selected: null, // Deselect headstone/base
        activePanel: 'inscription', // Set active panel to inscription
      });
    } else {
      set({ 
        selectedInscriptionId: id, 
        activeInscriptionText: '',
        selectedMotifId: null, // Deselect any motif
        selectedAdditionId: null, // Deselect any addition
        selected: null, // Deselect headstone/base
        activePanel: 'inscription', // Set active panel to inscription
      });
    }
    get().calculateInscriptionCost();
  },

  setActiveInscriptionText: (activeInscriptionText) =>
    set({ activeInscriptionText }),

  setInscriptionHeightLimits: (min, max) =>
    set({ inscriptionMinHeight: min, inscriptionMaxHeight: max }),

  setFontLoading: (fontLoading) => set({ fontLoading }),

  setSelectedAdditionId: (id) => {
    set({ selectedAdditionId: id });
    if (id) {
      // Close other panels when opening addition panel
      set({ 
        activePanel: 'addition',
        selectedInscriptionId: null, // Deselect any inscription
        selectedMotifId: null, // Deselect any motif
        selected: null, // Deselect headstone/base
      });
      // Navigate to select-additions page only when we're in mobile/compact layout
      const { navTo } = get();
      if (navTo && !isDesktopViewport()) {
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
        if (currentPath !== '/select-additions') {
          navTo('/select-additions');
        }
      }
    }
  },
  setAdditionRef: (id, ref) =>
    set((s) => ({ additionRefs: { ...s.additionRefs, [id]: ref } })),
  setAdditionOffset: (
    id: string,
    offset: {
      xPos?: number;
      yPos?: number;
      zPos?: number;
      scale?: number;
      rotationZ?: number;
      sizeVariant?: number;
      targetSurface?: 'headstone' | 'base';
      additionType?: AdditionKind;
      assetFile?: string;
      sourceId?: string;
      additionName?: string;
      zPosFinalized?: boolean;
      footprintWidth?: number;
      baseWidthMm?: number;
      baseHeightMm?: number;
    },
  ) => {
    set((s) => {
      const previous = s.additionOffsets[id] ?? {};
      const surface = offset.targetSurface ?? previous.targetSurface ?? 'headstone';
      const shouldRefreshDims =
        offset.targetSurface !== undefined ||
        offset.xPos !== undefined ||
        offset.yPos !== undefined ||
        !previous.baseWidthMm ||
        !previous.baseHeightMm;
      const nextOffset = withOffsetSurfaceDimensions(
        {
          ...previous,
          ...offset,
          targetSurface: surface,
        },
        surface,
        s,
        shouldRefreshDims,
      );
      return {
        additionOffsets: {
          ...s.additionOffsets,
          [id]: nextOffset,
        },
      };
    });
  },
  duplicateAddition: (id: string) => {
    const { additionOffsets } = get();
    const currentOffset = additionOffsets[id];
    if (!currentOffset) return;

    const parts = id.split('_');
    const hasTimestampSuffix = parts.length > 1 && !Number.isNaN(Number(parts[parts.length - 1]));
    const baseId = hasTimestampSuffix ? parts.slice(0, -1).join('_') : id;
    const instanceId = `${baseId}_${Date.now()}`;

    const isBase = currentOffset.targetSurface === 'base';
    const footprintWidth = currentOffset.footprintWidth;
    const widthDelta = footprintWidth && footprintWidth > 0 ? footprintWidth : isBase ? 120 : 30;
    const margin = isBase ? Math.max(widthDelta * 0.25, 20) : 0;
    const deltaX = isBase ? widthDelta + margin : 30;
    const deltaY = isBase ? 0 : 30;

    set((s) => {
      const surface = currentOffset.targetSurface ?? 'headstone';
      const duplicatedOffset = withOffsetSurfaceDimensions(
        {
          ...currentOffset,
          xPos: (currentOffset.xPos ?? 0) + deltaX,
          yPos: (currentOffset.yPos ?? 0) + deltaY,
        },
        surface,
        s,
      );
      return {
        selectedAdditions: [...s.selectedAdditions, instanceId],
        additionOffsets: {
          ...s.additionOffsets,
          [instanceId]: duplicatedOffset,
        },
        selectedAdditionId: instanceId,
      };
    });
  },

  setSelectedMotifId: (id) => {
    set({ selectedMotifId: id });
    if (id) {
      // Close other panels when opening motif panel
      set({ 
        activePanel: 'motif',
        selectedInscriptionId: null, // Deselect any inscription
        selectedAdditionId: null, // Deselect any addition
        selected: null, // Deselect headstone/base
      });
      // Navigate to select-motifs page only on mobile to keep canvas visible on desktop
      const { navTo } = get();
      if (navTo && !isDesktopViewport()) {
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
        if (currentPath !== '/select-motifs') {
          navTo('/select-motifs');
        }
      }
    }
  },
  setMotifRef: (id, ref) =>
    set((s) => ({ motifRefs: { ...s.motifRefs, [id]: ref } })),
  setMotifOffset: (
    id: string,
    offset: {
      xPos: number;
      yPos: number;
      scale: number;
      rotationZ: number;
      heightMm: number;
      target?: 'headstone' | 'base';
      coordinateSpace?: 'absolute' | 'offset';
      baseWidthMm?: number;
      baseHeightMm?: number;
      flipX?: boolean;
      flipY?: boolean;
    },
  ) => {
    set((s) => {
      const previous = s.motifOffsets[id];
      const surface = offset.target ?? previous?.target ?? 'headstone';
      const shouldRefreshDims =
        offset.target !== undefined ||
        offset.xPos !== undefined ||
        offset.yPos !== undefined ||
        !previous?.baseWidthMm ||
        !previous?.baseHeightMm;
      const nextOffset = withOffsetSurfaceDimensions(
        {
          ...previous,
          ...offset,
          target: surface,
        },
        surface,
        s,
        shouldRefreshDims,
      );
      return { motifOffsets: { ...s.motifOffsets, [id]: nextOffset } };
    });
    // Recalculate cost when height changes
    setTimeout(() => get().calculateMotifCost(), 0);
  },
  duplicateMotif: (id: string) => {
    const { selectedMotifs, motifOffsets } = get();
    
    // Find the motif with this ID
    const motif = selectedMotifs.find((m) => m.id === id);
    if (!motif) return;
    
    // Generate a unique instance ID for the duplicate
    const newId = genMotifId();
    
    // Add the duplicate
    set((s) => ({ 
      selectedMotifs: [...s.selectedMotifs, { id: newId, svgPath: motif.svgPath, color: motif.color }] 
    }));
    
    // Get the current offset for the original
    const currentOffset = motifOffsets[id];
    
    if (currentOffset) {
      set((s) => {
        const surface = currentOffset.target ?? 'headstone';
        const duplicatedOffset = withOffsetSurfaceDimensions(
          {
            ...currentOffset,
            xPos: currentOffset.xPos + 30,
            yPos: currentOffset.yPos + 30,
          },
          surface,
          s,
        );
        return {
          motifOffsets: { ...s.motifOffsets, [newId]: duplicatedOffset },
          selectedMotifId: newId,
        };
      });
    }
  },

  calculateInscriptionCost: () => {
    const { inscriptions, inscriptionPriceModel, showInscriptionColor } = get();
    if (!inscriptionPriceModel || !showInscriptionColor) {
      set({ inscriptionCost: 0 });
      return;
    }

    let totalCost = 0;
    inscriptions.forEach((line) => {
      const quantity = line.sizeMm; // quantity_type="Height"
      const colorName = data.colors.find((c) => c.hex === line.color)?.name;

      // Map the colorName from data.colors to the 'note' values used in inscriptions.xml
      // Assuming all non-gilding colors map to 'Paint Fill' for pricing purposes.
      let mappedColorNote = colorName;
      if (
        colorName &&
        !['Gold Gilding', 'Silver Gilding'].includes(colorName)
      ) {
        mappedColorNote = 'Paint Fill';
      }

      const applicablePrice = inscriptionPriceModel.prices.find(
        (p) =>
          quantity >= p.startQuantity &&
          quantity <= p.endQuantity &&
          p.note === mappedColorNote,
      );

      if (applicablePrice) {
        totalCost += calculatePrice(
          { ...inscriptionPriceModel, prices: [applicablePrice] },
          quantity,
        );
      }
    });
    set({ inscriptionCost: totalCost });
  },

  calculateMotifCost: () => {
    const { selectedMotifs, motifOffsets, motifPriceModel, catalog } = get();
    if (!motifPriceModel) {
      set({ motifCost: 0 });
      return;
    }

    const isLaser = catalog?.product.laser === '1';
    let totalCost = 0;
    selectedMotifs.forEach((motif) => {
      const offset = motifOffsets[motif.id];
      const heightMm = offset?.heightMm ?? 100;
      const color = motif.color;

      const motifPrice = calculateMotifPrice(
        heightMm,
        color,
        motifPriceModel.priceModel,
        isLaser
      );

      totalCost += motifPrice;
    });

    set({ motifCost: totalCost });
  },

  /* router injection */
  navTo: undefined,
  setNavTo: (fn) => set({ navTo: fn }),

  /* panel control + conditional routing */
  activePanel: null,
  setActivePanel: (p) => {
    set({ activePanel: p });
  },

  /* view mode */
  is2DMode: false,
  toggleViewMode: () => {
    set((s) => ({ is2DMode: !s.is2DMode }));
  },

  /* loading */
  loading: true,
  setLoading: (loading) => set({ loading }),

  isMaterialChange: false,
  setIsMaterialChange: (isMaterialChange) => set({ isMaterialChange }),

  openInscriptions: (id) => {
    // Close addition panel when opening inscriptions
    set({ selectedAdditionId: null });
    if (id) {
      get().setSelectedInscriptionId(id);
    }
    get().setActivePanel('inscription');
    
    // Don't navigate if we're on a /designs/ page
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/designs/')) {
      get().navTo?.('/inscriptions');
    }
  },

  openSizePanel: () => {
    // Close addition panel when opening size panel
    set({ selectedAdditionId: null });
    get().setActivePanel('size');
    
    // Don't navigate if we're on a /designs/ page
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/designs/')) {
      get().navTo?.('/select-size');
    }
  },

  openAdditionsPanel: () => {
    // Close addition panel when opening additions panel
    set({ selectedAdditionId: null });
    get().setActivePanel('additions');
    
    // Don't navigate if we're on a /designs/ page
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/designs/')) {
      get().navTo?.('/select-additions');
    }
  },

  closeInscriptions: () => {
    set({ selectedInscriptionId: null });
    get().setActivePanel(null);
  },

  resetDesign: () => {
    set({
      inscriptions: [],
      selectedAdditions: [],
      selectedMotifs: [],
      selectedInscriptionId: null,
      selectedAdditionId: null,
      selectedMotifId: null,
      activePanel: null,
      // Reset to default dimensions
      widthMm: 900,
      heightMm: 900,
    });
  },
}));
