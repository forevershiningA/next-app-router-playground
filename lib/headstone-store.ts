'use client';

import { create } from 'zustand';
import React from 'react';
import { Box3, Vector3 } from 'three';
import type { Group } from 'three';
import {
  DEFAULT_SHAPE_URL,
  FULL_MONUMENT_WIDTH_DIFF,
  FULL_MONUMENT_HEIGHT_DIFF,
  FULL_MONUMENT_DEPTH_DIFF,
} from '#/lib/headstone-constants';
import type { AdditionData } from '#/lib/xml-parser';
import {
  parseCatalogXML,
  calculatePrice,
  fetchAndParseInscriptionDetails,
} from '#/lib/xml-parser';
import { data } from '#/app/_internal/_data';
import {
  fetchAndParseMotifPricing,
  calculateMotifPrice,
} from '#/lib/motif-pricing';
import {
  DEFAULT_TEX,
  MAX_HEADSTONE_DIM,
  MAX_INSCRIPTION_SIZE_MM,
  MIN_HEADSTONE_DIM,
  MIN_INSCRIPTION_SIZE_MM,
  MIN_MOTIF_HEIGHT_MM,
  TEX_BASE,
  clampBaseHeight,
  clampHeadstoneDim,
  clampInscriptionRotation,
  clampInscriptionSize,
  clampThickness,
  normalizeTextureUrl,
  type AdditionKind,
  type HeadstoneState,
  type Line,
  type LinePatch,
} from '#/lib/headstone-store.types';
import { normalizeAdditionBaseId } from '#/lib/addition-utils';

export type {
  AdditionKind,
  BorderOption,
  Line,
  Material,
  MotifCatalogItem,
  PanelName,
  Part,
  ShapeOption,
} from '#/lib/headstone-store.types';

const isDesktopViewport = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 1024;
};
type AdditionOffset = HeadstoneState['additionOffsets'][string];
type MotifOffset = HeadstoneState['motifOffsets'][string];

const MIN_SURFACE_DIMENSION_MM = 1;

const resolveSurfaceDimensions = (
  state: Pick<
    HeadstoneState,
    'widthMm' | 'heightMm' | 'baseWidthMm' | 'baseHeightMm' | 'ledgerWidthMm' | 'ledgerDepthMm'
  >,
  surface: 'headstone' | 'base' | 'ledger',
) => {
  if (surface === 'base') {
    const widthMm = state.baseWidthMm || state.widthMm || MIN_SURFACE_DIMENSION_MM;
    const heightMm = state.baseHeightMm || state.heightMm || MIN_SURFACE_DIMENSION_MM;
    return { widthMm, heightMm };
  }
  if (surface === 'ledger') {
    const widthMm = state.ledgerWidthMm || MIN_SURFACE_DIMENSION_MM;
    const heightMm = state.ledgerDepthMm || MIN_SURFACE_DIMENSION_MM;
    return { widthMm, heightMm };
  }
  return {
    widthMm: state.widthMm || MIN_SURFACE_DIMENSION_MM,
    heightMm: state.heightMm || MIN_SURFACE_DIMENSION_MM,
  };
};

const withLineSurfaceDimensions = (
  line: Line,
  surface: 'headstone' | 'base' | 'ledger',
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
      line.target === 'base'
        ? 'base'
        : line.target === 'ledger'
          ? 'ledger'
          : 'headstone',
      state,
      !line.baseWidthMm || !line.baseHeightMm,
    ),
  );

type OffsetWithDimensions = { baseWidthMm?: number; baseHeightMm?: number };

const withOffsetSurfaceDimensions = <T extends OffsetWithDimensions>(
  offset: T,
  surface: 'headstone' | 'base' | 'ledger',
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

const clampEditingObject = (
  editingObject: HeadstoneState['editingObject'],
  visibility: { showBase: boolean; showLedger: boolean; showKerbset: boolean },
): HeadstoneState['editingObject'] => {
  if (editingObject === 'ledger' && !visibility.showLedger) {
    return visibility.showBase ? 'base' : 'headstone';
  }
  if (editingObject === 'kerbset' && !visibility.showKerbset) {
    if (visibility.showLedger) return 'ledger';
    if (visibility.showBase) return 'base';
    return 'headstone';
  }
  if (editingObject === 'base' && !visibility.showBase) {
    return visibility.showLedger ? 'ledger' : 'headstone';
  }
  return editingObject;
};

const genId = () => `l-${crypto.randomUUID()}`;
const genMotifId = () => `motif-${crypto.randomUUID()}`;

export const useHeadstoneStore = create<HeadstoneState>()((set, get) => ({
  catalog: null,
  setCatalog(catalog) {
    set({ catalog });
  },

  materials: [],
  setMaterials(materials) {
    set({ materials });
  },

  shapes: [],
  setShapes(shapes) {
    set({ shapes });
  },

  borders: [],
  setBorders(borders) {
    set({ borders });
  },

  motifsCatalog: [],
  setMotifsCatalog(motifsCatalog) {
    set({ motifsCatalog });
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
      // Use editingObject as primary (persists through panel navigation) with selected as fallback.
      // Only honor a surface when it is actually visible to avoid targeting hidden ledger/base meshes.
      const editTarget = s.editingObject;
      const wantsBase = editTarget === 'base' || s.selected === 'base';
      const wantsLedger = editTarget === 'ledger' || s.selected === 'ledger';
      const baseAvailable = s.showBase;
      const ledgerAvailable = s.showLedger;
      const prefersBaseSurface = additionType === 'statue' || additionType === 'vase';

      const fallbackSurface: 'headstone' | 'base' | 'ledger' =
        prefersBaseSurface && baseAvailable
          ? 'base'
          : prefersBaseSurface && !baseAvailable && ledgerAvailable
            ? 'ledger'
            : 'headstone';

      let targetSurface: 'headstone' | 'base' | 'ledger' = fallbackSurface;

      if (wantsLedger && ledgerAvailable) {
        targetSurface = 'ledger';
      } else if (wantsBase && baseAvailable) {
        targetSurface = 'base';
      } else if (wantsLedger && !ledgerAvailable && baseAvailable) {
        targetSurface = 'base';
      }
      const defaultOffset = withOffsetSurfaceDimensions<AdditionOffset>(
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
    const { selectedAdditions, additionOffsets } = get();
    // Check if any selected addition is a statue or vase
    return selectedAdditions.some((instanceId) => {
      if ((additionOffsets[instanceId]?.targetSurface ?? 'headstone') !== 'base') {
        return false;
      }
      const baseId = normalizeAdditionBaseId(instanceId);
      const addition = data.additions.find((a) => a.id === baseId);
      return addition?.type === 'statue' || addition?.type === 'vase';
    });
  },
  baseMeshRef: null,
  setBaseMeshRef(mesh) {
    set({ baseMeshRef: mesh });
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
    const target: 'base' | 'headstone' | 'ledger' =
      selected === 'base' ? 'base' : selected === 'ledger' ? 'ledger' : 'headstone';
    
    set((s) => {
      const newMotifs = [...s.selectedMotifs, { id, svgPath, color: defaultColor }];
      const defaultOffset = withOffsetSurfaceDimensions<MotifOffset>(
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
    const state = get();
    const defaultTarget: 'headstone' | 'base' | 'ledger' =
      state.selected === 'base'
        ? 'base'
        : state.selected === 'ledger'
          ? 'ledger'
          : 'headstone';
    const resolvedTarget = image.target ?? defaultTarget;
    // For ledger surface, xPos/yPos are fractional (±0.5 range on unit-cube mesh).
    // Reset to 0 so the image starts at the ledger centre rather than ~90 m off-slab.
    const ledgerPos = resolvedTarget === 'ledger'
      ? { xPos: 0, yPos: 0 }
      : {};
    set((s) => ({
      selectedImages: [
        ...s.selectedImages,
        {
          ...image,
          ...ledgerPos,
          target: resolvedTarget,
        },
      ],
      cropCanvasData: null,
    }));
  },
  removeImage: (id) => {
    set((s) => ({
      selectedImages: s.selectedImages.filter((img) => img.id !== id),
      selectedImageId: s.selectedImageId === id ? null : s.selectedImageId,
    }));
  },
  duplicateImage: (id) => {
    set((s) => {
      const original = s.selectedImages.find((img) => img.id === id);
      if (!original) return s;

      const targetSurface = original.target ?? 'headstone';
      const ledgerShiftX = Math.max(Math.min(((s.ledgerWidthMm ?? 1000) / 1000) * 0.1, 0.15), 0.02);
      const ledgerShiftZ = Math.max(Math.min(((s.ledgerDepthMm ?? 2000) / 1000) * 0.1, 0.15), 0.02);
      const deltaX = targetSurface === 'ledger' ? ledgerShiftX : 20;
      const deltaY = targetSurface === 'ledger' ? ledgerShiftZ : 20;
      const newImage = {
        ...original,
        id: `img-${Date.now()}`,
        xPos: (original.xPos ?? 0) + deltaX,
        yPos: (original.yPos ?? 0) + deltaY,
      };

      return {
        selectedImages: [...s.selectedImages, newImage],
        selectedImageId: newImage.id,
      };
    });
  },
  updateImagePosition: (id, xPos, yPos) => {
    set((s) => ({
      selectedImages: s.selectedImages.map((img) =>
        img.id === id ? { ...img, xPos, yPos, coordinateSpace: undefined } : img
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
  updateImageSizeVariant: (id, sizeVariant) => {
    set((s) => ({
      selectedImages: s.selectedImages.map((img) =>
        img.id === id ? { ...img, sizeVariant } : img
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
      const showBase = isHeadstoneLike || productType === 'monument' || productType === 'full-monument';
      const isFullMonument = productType === 'full-monument';
      const showInscriptionColor = catalog.product.laser !== '1' && catalog.product.color !== '0';
      set((s) => {
        const visibility = {
          showBase,
          showLedger: isFullMonument,
          showKerbset: isFullMonument,
        };
        const nextEditingObject = clampEditingObject(s.editingObject, visibility);
        const patch: Partial<HeadstoneState> = {
          ...visibility,
          showInscriptionColor,
        };
        if (nextEditingObject !== s.editingObject) {
          patch.editingObject = nextEditingObject;
        }
        return patch;
      });
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

        if (isFullMonument) {
          set({
            ledgerWidthMm: shape.lid?.initWidth || 950,
            ledgerHeightMm: shape.lid?.initHeight || 60,
            ledgerDepthMm: shape.lid?.initDepth || 2030,
            kerbWidthMm: shape.kerb?.initWidth || 1200,
            kerbHeightMm: shape.kerb?.initHeight || 300,
            kerbDepthMm: shape.kerb?.initDepth || 2150,
          });
        }

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
          set({
            baseMaterialUrl: baseTexturePath,
            ledgerMaterialUrl: baseTexturePath,
            kerbsetMaterialUrl: baseTexturePath,
          });
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
            } as Partial<HeadstoneState>;
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

  currentProjectId: null,
  currentProjectTitle: null,
  setProjectMeta: (meta: { projectId?: string | null; title?: string | null }) => {
    set({
      currentProjectId: meta.projectId ?? null,
      currentProjectTitle: meta.title ?? null,
    });
  },

  showBase: true,
  setShowBase: (showBase) =>
    set((s) => {
      const nextEditingObject = clampEditingObject(s.editingObject, {
        showBase,
        showLedger: s.showLedger,
        showKerbset: s.showKerbset,
      });
      if (nextEditingObject === s.editingObject) {
        return { showBase };
      }
      return { showBase, editingObject: nextEditingObject };
    }),

  showLedger: false,
  setShowLedger: (v) =>
    set((s) => {
      const nextEditingObject = clampEditingObject(s.editingObject, {
        showBase: s.showBase,
        showLedger: v,
        showKerbset: s.showKerbset,
      });
      if (nextEditingObject === s.editingObject) {
        return { showLedger: v };
      }
      return { showLedger: v, editingObject: nextEditingObject };
    }),

  showKerbset: false,
  setShowKerbset: (v) =>
    set((s) => {
      const nextEditingObject = clampEditingObject(s.editingObject, {
        showBase: s.showBase,
        showLedger: s.showLedger,
        showKerbset: v,
      });
      if (nextEditingObject === s.editingObject) {
        return { showKerbset: v };
      }
      return { showKerbset: v, editingObject: nextEditingObject };
    }),

  ledgerWidthMm: 950,
  setLedgerWidthMm: (v) => {
    // ledger changes → base and kerbset = ledger + 200
    const state = get();
    const minAllowed = Math.max(state.minBaseWidthMm, state.widthMm);
    const maxAllowed = Math.max(minAllowed, state.maxBaseWidthMm);
    const clampedLedger = Math.max(minAllowed, Math.min(maxAllowed, Math.round(v)));
    const clampedBaseKerb = Math.min(maxAllowed, clampedLedger + FULL_MONUMENT_WIDTH_DIFF);
    set({ ledgerWidthMm: clampedLedger, baseWidthMm: clampedBaseKerb, kerbWidthMm: clampedBaseKerb });
  },

  ledgerHeightMm: 60,
  setLedgerHeightMm: (v) => set({ ledgerHeightMm: v }),

  ledgerDepthMm: 2030,
  setLedgerDepthMm: (v) => {
    const clampedDepth = Math.max(0, Math.round(v));
    set({
      ledgerDepthMm: clampedDepth,
      kerbDepthMm: clampedDepth + FULL_MONUMENT_DEPTH_DIFF,
    });
  },

  kerbWidthMm: 1200,
  setKerbWidthMm: (v) => {
    // kerbset changes → base = kerbset, ledger = kerbset − 200
    const state = get();
    const minAllowed = Math.max(state.minBaseWidthMm, state.widthMm);
    const maxAllowed = Math.max(minAllowed, state.maxBaseWidthMm);
    const clamped = Math.max(minAllowed, Math.min(maxAllowed, Math.round(v)));
    set({ kerbWidthMm: clamped, baseWidthMm: clamped, ledgerWidthMm: Math.max(minAllowed, clamped - FULL_MONUMENT_WIDTH_DIFF) });
  },

  kerbHeightMm: 300,
  setKerbHeightMm: (v) => {
    // kerbset changes → base = kerbset + 100 (clamped to base constraints)
    const state = get();
    const desiredBase = Math.round(v) + FULL_MONUMENT_HEIGHT_DIFF;
    const clampedBase = Math.max(state.minBaseHeightMm, Math.min(state.maxBaseHeightMm, desiredBase));
    const kerbHeight = Math.max(50, clampedBase - FULL_MONUMENT_HEIGHT_DIFF);
    set({ kerbHeightMm: kerbHeight, baseHeightMm: clampedBase });
  },

  kerbDepthMm: 2150,
  setKerbDepthMm: (v) => {
    const clampedDepth = Math.max(0, Math.round(v));
    set({
      kerbDepthMm: clampedDepth,
      ledgerDepthMm: Math.max(0, clampedDepth - FULL_MONUMENT_DEPTH_DIFF),
    });
  },

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

  ledgerMaterialUrl: `${TEX_BASE}${DEFAULT_TEX}`,
  setLedgerMaterialUrl(url) {
    const normalized = normalizeTextureUrl(url) ?? `${TEX_BASE}${DEFAULT_TEX}`;
    set({ ledgerMaterialUrl: normalized });
  },

  kerbsetMaterialUrl: `${TEX_BASE}${DEFAULT_TEX}`,
  setKerbsetMaterialUrl(url) {
    const normalized = normalizeTextureUrl(url) ?? `${TEX_BASE}${DEFAULT_TEX}`;
    set({ kerbsetMaterialUrl: normalized });
  },

  baseSwapping: false,
  setBaseSwapping: (swapping) => set({ baseSwapping: swapping }),

  widthMm: 900,
  setWidthMm(v) {
    const { minWidthMm, maxWidthMm } = get();
    const clamped = Math.max(minWidthMm, Math.min(maxWidthMm, Math.round(v)));
    set({ widthMm: clamped });
    
    // Ensure base/kerbset/ledger are at least as wide as headstone (full monument rule)
    const state = get();
    if (state.baseWidthMm < clamped) {
      // headstone grew past base: base = headstone + 200, kerb = headstone + 200, ledger = headstone
      const newBaseKerb = clamped + FULL_MONUMENT_WIDTH_DIFF;
      set({ baseWidthMm: newBaseKerb, kerbWidthMm: newBaseKerb, ledgerWidthMm: clamped });
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
    // base changes → kerbset = base, ledger = base − 200
    const state = get();
    const minAllowed = Math.max(state.minBaseWidthMm, state.widthMm);
    const maxAllowed = Math.max(minAllowed, state.maxBaseWidthMm);
    const clampedWidth = Math.max(minAllowed, Math.min(maxAllowed, Math.round(v)));
    set({ baseWidthMm: clampedWidth, kerbWidthMm: clampedWidth, ledgerWidthMm: Math.max(minAllowed, clampedWidth - FULL_MONUMENT_WIDTH_DIFF) });
  },
  
  baseHeightMm: 100, // Base height is 100mm
  setBaseHeightMm(v) {
    const { minBaseHeightMm, maxBaseHeightMm } = get();
    const clamped = Math.max(minBaseHeightMm, Math.min(maxBaseHeightMm, Math.round(v)));
    // base changes → kerbset = base − 100
    const kerbHeight = Math.max(50, clamped - FULL_MONUMENT_HEIGHT_DIFF);
    set({ baseHeightMm: clamped, kerbHeightMm: kerbHeight });
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
        selectedImageId: null, // Also clear image selection when headstone is selected
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
  selectedImageId: null,
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
    const target: 'headstone' | 'base' | 'ledger' =
      state.selected === 'base'
        ? 'base'
        : state.selected === 'ledger'
          ? 'ledger'
          : 'headstone';

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

    let offset: number;

    if (src.target === 'ledger') {
      // For ledger: yPos is fractional (-0.5 to +0.5). Convert text height to fractional
      // using the stored ledger depth so the duplicate appears one line-height away.
      // +offset moves toward the foot (visually "below" when viewing ledger from above).
      const ledgerDepthMm = src.baseHeightMm || get().ledgerDepthMm || 400;
      offset = (src.sizeMm + 5) / ledgerDepthMm;
    } else {
      // Headstone / base: yPos is stored in the surface's local units, so convert any
      // measured world-space height back into that local space before applying it.
      const fallbackGapMm = Math.max(2, Math.round(src.sizeMm * 0.08));
      const fallbackGapLocal =
        src.target === 'base' ? fallbackGapMm : Math.max(1, Math.round(fallbackGapMm / 10));
      offset = src.target === 'base' ? src.sizeMm + fallbackGapMm : src.sizeMm / 10 + 5;

      const rendered = src.ref.current;
      if (rendered) {
        rendered.updateWorldMatrix(true, true);
        const bounds = new Box3().setFromObject(rendered);
        const renderedWorldHeight = bounds.max.y - bounds.min.y;
        const renderedWorldScale = new Vector3();
        rendered.getWorldScale(renderedWorldScale);
        const localScaleY = Math.abs(renderedWorldScale.y) > 1e-6 ? Math.abs(renderedWorldScale.y) : 1;
        const renderedLocalHeight = renderedWorldHeight / localScaleY;

        if (Number.isFinite(renderedLocalHeight) && renderedLocalHeight > 0) {
          offset = renderedLocalHeight + fallbackGapLocal;
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
          yPos: src.target === 'ledger' ? src.yPos + offset : src.yPos - offset,
        },
      ],
      selectedInscriptionId: newId,
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
      targetSurface?: 'headstone' | 'base' | 'ledger';
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
      const nextOffset = withOffsetSurfaceDimensions<AdditionOffset>(
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

    const baseId = normalizeAdditionBaseId(id);
    const instanceId = `${baseId}_${Date.now()}`;

    const surface = currentOffset.targetSurface ?? 'headstone';
    const isBase = surface === 'base';
    const isLedger = surface === 'ledger';
    const footprintWidth = currentOffset.footprintWidth;
    const widthDelta = footprintWidth && footprintWidth > 0 ? footprintWidth : isBase ? 120 : 30;
    const margin = isBase ? Math.max(widthDelta * 0.25, 20) : 0;
    const ledgerShiftX = Math.max(Math.min(((get().ledgerWidthMm ?? 1000) / 1000) * 0.1, 0.2), 0.02);
    const ledgerShiftZ = Math.max(Math.min(((get().ledgerDepthMm ?? 2000) / 1000) * 0.1, 0.2), 0.02);
    const deltaX = isLedger ? ledgerShiftX : isBase ? widthDelta + margin : 30;
    const deltaY = isLedger ? ledgerShiftZ : isBase ? 0 : 30;

    set((s) => {
      const duplicatedOffset = withOffsetSurfaceDimensions<AdditionOffset>(
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
        selectedImageId: null, // Deselect any image
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
    } else {
      // If deselecting and this is the active panel, close it
      const state = get();
      if (state.activePanel === 'motif') {
        set({ activePanel: null });
      }
    }
  },

  setSelectedImageId: (id) => {
    set({ selectedImageId: id });
    if (id) {
      // Close other panels when selecting an image
      // Note: We don't set activePanel='image' because images use fullscreen panel 'select-images'
      set({
        selectedInscriptionId: null,
        selectedAdditionId: null,
        selectedMotifId: null,
        selected: null,
      });
    }
  },
  setMotifRef: (id, ref) =>
    set((s) => ({ motifRefs: { ...s.motifRefs, [id]: ref } })),
  setMotifOffset: (
    id: string,
    offset: Partial<MotifOffset>,
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
      const nextOffset = withOffsetSurfaceDimensions<MotifOffset>(
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
        const ledgerShiftX = Math.max(Math.min(((s.ledgerWidthMm ?? 1000) / 1000) * 0.1, 0.15), 0.02);
        const ledgerShiftZ = Math.max(Math.min(((s.ledgerDepthMm ?? 2000) / 1000) * 0.1, 0.15), 0.02);
        const deltaX = surface === 'ledger' ? ledgerShiftX : 30;
        const deltaY = surface === 'ledger' ? ledgerShiftZ : 30;
        const duplicatedOffset = withOffsetSurfaceDimensions<MotifOffset>(
          {
            ...currentOffset,
            xPos: (currentOffset.xPos ?? 0) + deltaX,
            yPos: (currentOffset.yPos ?? 0) + deltaY,
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
      selectedImages: [],
      selectedInscriptionId: null,
      selectedAdditionId: null,
      selectedMotifId: null,
      selectedImageId: null,
      cropCanvasData: null,
      activePanel: null,
      editingObject: 'headstone',
      showBase: true,
      showLedger: false,
      showKerbset: false,
      showInscriptionColor: true,
      currentProjectId: null,
      currentProjectTitle: null,
      // Reset to default dimensions
      widthMm: 900,
      heightMm: 900,
    });
  },
}));
