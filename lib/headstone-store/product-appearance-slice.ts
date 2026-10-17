import type { StateCreator } from 'zustand';
import { DEFAULT_SHAPE_URL } from '#/lib/headstone-constants';
import { normalizeThreeColorValue } from '#/lib/headstone-store/color-utils';
import {
  DEFAULT_TEX,
  TEX_BASE,
  normalizeTextureUrl,
  type FixingType,
  type HeadstoneState,
} from '#/lib/headstone-store.types';

type ProductAppearanceSlice = Pick<
  HeadstoneState,
  | 'shapeUrl'
  | 'setShapeUrl'
  | 'borderName'
  | 'setBorderName'
  | 'fixingType'
  | 'setFixingType'
  | 'ssCorners'
  | 'setSsCorners'
  | 'ssHoles'
  | 'setSsHoles'
  | 'showInsetContour'
  | 'setShowInsetContour'
  | 'insetContourColor'
  | 'setInsetContourColor'
  | 'materialUrl'
  | 'setMaterialUrl'
  | 'headstoneMaterialUrl'
  | 'setHeadstoneMaterialUrl'
  | 'baseMaterialUrl'
  | 'setBaseMaterialUrl'
  | 'ledgerMaterialUrl'
  | 'setLedgerMaterialUrl'
  | 'kerbsetMaterialUrl'
  | 'setKerbsetMaterialUrl'
  | 'baseSwapping'
  | 'setBaseSwapping'
  | 'baseFinish'
  | 'setBaseFinish'
  | 'baseOption'
  | 'setBaseOption'
  | 'baseLidFinish'
  | 'setBaseLidFinish'
  | 'headstoneStyle'
  | 'setHeadstoneStyle'
>;

export const createProductAppearanceSlice: StateCreator<
  HeadstoneState,
  [],
  [],
  ProductAppearanceSlice
> = (set, get) => ({
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
      const matchingShape = catalog.product.shapes.find((shape) => {
        const catalogFileName =
          shape.name.toLowerCase().replace(/\s+/g, '_') + '.svg';
        const shapeFileNameNoExt = shapeFileName
          ? shapeFileName.replace('.svg', '')
          : '';
        return (
          shapeFileName === catalogFileName ||
          (shape.url &&
            shapeFileNameNoExt &&
            shape.url.includes(shapeFileNameNoExt)) ||
          (shapeFileName === 'oval_horizontal.svg' &&
            shape.code === 'Oval Landscape') ||
          (shapeFileName === 'oval_vertical.svg' &&
            shape.code === 'Oval Portrait') ||
          (shapeFileName === 'circle.svg' && shape.code === 'Circle') ||
          (shapeFileName === 'landscape.svg' && shape.code === 'Landscape') ||
          (shapeFileName === 'portrait.svg' && shape.code === 'Portrait') ||
          (shapeFileName === 'square.svg' && shape.code === 'Square')
        );
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

  fixingType: 'flat-back' as FixingType,
  setFixingType(fixingType) {
    set({ fixingType });
  },

  ssCorners: 'straight',
  setSsCorners(v) {
    set({ ssCorners: v });
  },

  ssHoles: 'none',
  setSsHoles(v) {
    set({ ssHoles: v });
  },

  showInsetContour: false,
  setShowInsetContour(show) {
    set({ showInsetContour: show });
  },
  insetContourColor: '#eeeeee',
  setInsetContourColor(color) {
    set({ insetContourColor: normalizeThreeColorValue(color) });
  },

  materialUrl: `${TEX_BASE}${DEFAULT_TEX}`,
  setMaterialUrl(materialUrl) {
    const normalized =
      normalizeTextureUrl(materialUrl) ?? `${TEX_BASE}${DEFAULT_TEX}`;
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
    set((state) => ({
      baseMaterialUrl: normalized,
      // An unchanged texture starts no load; a hidden base has no loader.
      baseSwapping:
        state.showBase &&
        (state.baseSwapping || state.baseMaterialUrl !== normalized),
    }));
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

  baseFinish: 'default',
  setBaseFinish(finish) {
    set({ baseFinish: finish });
  },

  baseOption: 'none',
  setBaseOption(option) {
    set({ baseOption: option });
  },

  baseLidFinish: 'black',
  setBaseLidFinish(finish) {
    set({ baseLidFinish: finish });
  },

  headstoneStyle: 'upright',
  setHeadstoneStyle(style) {
    set({ headstoneStyle: style });
  },
});
