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

const TEX_BASE = '/textures/forever/l/';
const DEFAULT_TEX = 'Imperial-Red.jpg';

/* clamps */
const MIN_HEADSTONE_DIM = 300;
const MAX_HEADSTONE_DIM = 1200;
const clampHeadstoneDim = (v: number) =>
  Math.min(MAX_HEADSTONE_DIM, Math.max(MIN_HEADSTONE_DIM, Math.round(v)));

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
  ref: React.RefObject<Group | null>; // ✅ allow null
};
export type Part = 'headstone' | 'base' | null;
export type PanelName =
  | 'shape'
  | 'size'
  | 'material'
  | 'inscription'
  | 'additions'
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

  selectedAdditions: string[];
  addAddition: (id: string) => void;
  removeAddition: (id: string) => void;
  hasStatue: () => boolean;

  productId: string | null;
  setProductId: (id: string) => void;

  showBase: boolean;
  setShowBase: (showBase: boolean) => void;

  showInscriptionColor: boolean;
  inscriptionPriceModel: PriceModel | null;

  shapeUrl: string | null;
  setShapeUrl: (url: string) => void;

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

  selectedAdditionId: string | null;
  additionRefs: Record<string, React.RefObject<Group | null>>;
  additionOffsets: Record<
    string,
    { xPos: number; yPos: number; scale: number; rotationZ: number }
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
    offset: { xPos: number; yPos: number; scale: number; rotationZ: number },
  ) => void;

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
};

let nextId = 0;
const genId = () => `l-${nextId++}`;

export const useHeadstoneStore = create<HeadstoneState>()((set, get) => ({
  catalog: null,
  setCatalog(catalog) {
    set({ catalog });
  },

  selectedAdditions: ['B1134S'],
  addAddition: (id) => {
    set((s) => ({ selectedAdditions: [...s.selectedAdditions, id] }));
  },
  removeAddition: (id) => {
    set((s) => ({
      selectedAdditions: s.selectedAdditions.filter((aid) => aid !== id),
    }));
  },
  hasStatue: () => {
    const { selectedAdditions } = get();
    // Check if any selected addition is a statue
    return selectedAdditions.some((id) => {
      const addition = data.additions.find((a) => a.id === id);
      return addition?.type === 'statue';
    });
  },

  productId: null,
  setProductId: async (id) => {
    try {
      const response = await fetch(`/xml/catalog-id-${id}.xml`);
      const xmlText = await response.text();
      const catalog = await parseCatalogXML(xmlText, id);
      set({ catalog, productId: id });

      const isPlaque = catalog.product.type === 'plaque';
      const showBase = catalog.product.type === 'headstone';
      const showInscriptionColor = catalog.product.laser !== '1';
      set({ showBase, showInscriptionColor });
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
        set({
          widthMm: shape.table.initWidth,
          heightMm: shape.table.initHeight,
        });
        if (shape.table.color) {
          set({ headstoneMaterialUrl: shape.table.color });
        }
        if (shape.stand.color) {
          set({ baseMaterialUrl: shape.stand.color });
        }
      }
    } catch (error) {
      console.error('Failed to load or parse catalog XML:', error);
    }
  },

  showBase: true,
  setShowBase: (showBase) => set({ showBase }),

  showInscriptionColor: true,
  inscriptionPriceModel: null,

  shapeUrl: DEFAULT_SHAPE_URL,
  setShapeUrl(shapeUrl) {
    set({ shapeUrl });
  },

  materialUrl: `${TEX_BASE}${DEFAULT_TEX}`,
  setMaterialUrl(materialUrl) {
    set({ materialUrl });
  },

  headstoneMaterialUrl: `${TEX_BASE}${DEFAULT_TEX}`,
  setHeadstoneMaterialUrl(url) {
    set({ headstoneMaterialUrl: url });
  },

  baseMaterialUrl: `${TEX_BASE}${DEFAULT_TEX}`,
  setBaseMaterialUrl(url) {
    set({ baseMaterialUrl: url, baseSwapping: true });
  },

  baseSwapping: false,
  setBaseSwapping: (swapping) => set({ baseSwapping: swapping }),

  widthMm: 900,
  setWidthMm(v) {
    set({ widthMm: clampHeadstoneDim(v) });
  },

  heightMm: 900,
  setHeightMm(v) {
    set({ heightMm: clampHeadstoneDim(v) });
  },

  selected: null,
  setSelected(p) {
    set({ selected: p });
  },

  inscriptions: [
    {
      id: genId(),
      text: 'In Loving Memory',
      font: 'Chopin Script',
      sizeMm: 80,
      color: '#c99d44',
      xPos: 0,
      yPos: 0,
      rotationDeg: 0,
      ref: React.createRef<Group>(), // ✅
    },
    {
      id: genId(),
      text: 'of General Admiral Aladeen',
      font: 'Chopin Script',
      sizeMm: 120,
      color: '#c99d44',
      xPos: 0,
      yPos: 20,
      rotationDeg: 0,
      ref: React.createRef<Group>(), // ✅
    },
  ],
  selectedInscriptionId: null,
  activeInscriptionText: 'In Loving Memory',
  inscriptionMinHeight: 5,
  inscriptionMaxHeight: 1200,
  fontLoading: false,
  inscriptionCost: 0,

  selectedAdditionId: null,
  additionRefs: {},
  additionOffsets: {},

  setInscriptions: (inscriptions) => {
    if (typeof inscriptions === 'function') {
      set({ inscriptions: inscriptions(get().inscriptions) });
    } else {
      set({ inscriptions });
    }
    get().calculateInscriptionCost();
  },

  addInscriptionLine: (patch: LinePatch = {}) => {
    const id = genId();

    const text = patch.text ?? 'New line';
    const font = patch.font ?? 'Garamond';
    const sizeMm = clampInscriptionSize(
      patch.sizeMm ?? get().inscriptionMinHeight,
    );
    const rotationDeg = clampInscriptionRotation(patch.rotationDeg ?? 0);
    const xPos = patch.xPos ?? 0;
    const yPos = patch.yPos ?? 0;
    const color =
      get().showInscriptionColor === false
        ? '#ffffff'
        : (patch.color ?? '#c99d44');

    const newLine: Line = {
      id,
      text,
      font,
      sizeMm,
      rotationDeg,
      xPos,
      yPos,
      color,
      ref: React.createRef<Group>(),
    };

    set((s) => ({
      inscriptions: [...s.inscriptions, newLine],
      selectedInscriptionId: id,
    }));
    get().calculateInscriptionCost();
    return id;
  },

  updateInscription: (id, patch) => {
    set((s) => ({
      inscriptions: s.inscriptions.map((l) =>
        l.id === id
          ? {
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
            }
          : l,
      ),
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
          yPos: src.yPos + offset, // Position below current position accounting for actual text height
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
      set({ selectedInscriptionId: id, activeInscriptionText: line.text });
    } else {
      set({ selectedInscriptionId: id, activeInscriptionText: '' });
    }
    get().calculateInscriptionCost();
  },

  setActiveInscriptionText: (activeInscriptionText) =>
    set({ activeInscriptionText }),

  setInscriptionHeightLimits: (min, max) =>
    set({ inscriptionMinHeight: min, inscriptionMaxHeight: max }),

  setFontLoading: (fontLoading) => set({ fontLoading }),

  setSelectedAdditionId: (id) => set({ selectedAdditionId: id }),
  setAdditionRef: (id, ref) =>
    set((s) => ({ additionRefs: { ...s.additionRefs, [id]: ref } })),
  setAdditionOffset: (
    id: string,
    offset: { xPos: number; yPos: number; scale: number; rotationZ: number },
  ) => {
    //console.log("setAdditionOffset:", offset);
    //offset = { xPos: 100, yPos: -200 }
    set((s) => ({ additionOffsets: { ...s.additionOffsets, [id]: offset } }));
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
    if (id) {
      get().setSelectedInscriptionId(id);
    }
    get().setActivePanel('inscription');
    get().navTo?.('/inscriptions');
  },

  openSizePanel: () => {
    get().setActivePanel('size');
    get().navTo?.('/select-size');
  },

  openAdditionsPanel: () => {
    get().setActivePanel('additions');
    get().navTo?.('/select-additions');
  },

  closeInscriptions: () => {
    set({ selectedInscriptionId: null });
    get().setActivePanel(null);
  },
}));
