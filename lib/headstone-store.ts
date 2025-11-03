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
  | 'addition'
  | 'motifs'
  | 'motif'
  | 'checkprice'
  | 'seo'
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

  selectedMotifs: Array<{ id: string; svgPath: string; color: string }>;
  addMotif: (svgPath: string) => void;
  removeMotif: (id: string) => void;
  setMotifColor: (id: string, color: string) => void;

  productId: string | null;
  setProductId: (id: string) => void;

  showBase: boolean;
  setShowBase: (showBase: boolean) => void;

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
    { xPos: number; yPos: number; scale: number; rotationZ: number }
  >;

  selectedMotifId: string | null;
  motifRefs: Record<string, React.RefObject<Group | null>>;
  motifOffsets: Record<
    string,
    { xPos: number; yPos: number; scale: number; rotationZ: number; heightMm: number }
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
};

let nextId = 0;
const genId = () => `l-${nextId++}`;

export const useHeadstoneStore = create<HeadstoneState>()((set, get) => ({
  catalog: null,
  setCatalog(catalog) {
    set({ catalog });
  },

  // Sample template: Beautiful headstone with angel and cross (all with colorMap textures)
  selectedAdditions: [
    'B2127',  // Cross (bottom right) - has colorMap
    'B1134S', // Angel application (centered top) - has colorMap
  ],
  addAddition: (id) => {
    // Create a unique instance ID with timestamp
    const instanceId = `${id}_${Date.now()}`;
    set((s) => ({ 
      selectedAdditions: [...s.selectedAdditions, instanceId],
      selectedAdditionId: instanceId, // Auto-select the newly added addition
      activePanel: 'addition', // Open the edit panel
    }));
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
  selectedMotifs: [
    { 
      id: 'motif_dove_1', 
      svgPath: '/shapes/motifs/dove_002.svg', 
      color: '#c99d44' 
    },
  ],
  addMotif: (svgPath) => {
    const id = `motif_${Date.now()}`;
    const { catalog } = get();
    const isLaser = catalog?.product.laser === '1';
    const defaultColor = isLaser ? '#ffffff' : '#c99d44'; // White for laser, gold for others
    set((s) => {
      const newMotifs = [...s.selectedMotifs, { id, svgPath, color: defaultColor }];
      return {
        selectedMotifs: newMotifs,
        selectedMotifId: id, // Auto-select the newly added motif
        activePanel: 'motif', // Open the edit panel instead of closing
      };
    });
    // Calculate cost after adding
    setTimeout(() => get().calculateMotifCost(), 0);
  },
  removeMotif: (id) => {
    set((s) => ({
      selectedMotifs: s.selectedMotifs.filter((m) => m.id !== id),
    }));
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

  productId: null,
  setProductId: async (id) => {
    console.log(`[Store] setProductId called with id: ${id}`);
    console.trace('[Store] setProductId call stack');
    try {
      console.log(`[Store] Fetching /xml/catalog-id-${id}.xml`);
      const response = await fetch(`/xml/catalog-id-${id}.xml`);
      const xmlText = await response.text();
      const catalog = await parseCatalogXML(xmlText, id);
      console.log(`[Store] Setting catalog for product: ${catalog.product.name} (ID: ${id})`);
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
        console.log(`[Store] Setting dimensions from catalog: ${shape.table.initWidth} x ${shape.table.initHeight}`);
        set({
          widthMm: shape.table.initWidth,
          heightMm: shape.table.initHeight,
        });
        console.log(`[Store] Dimensions set to: ${shape.table.initWidth} x ${shape.table.initHeight}`);
        if (shape.table.color) {
          // Fix texture path - ensure it starts with /
          const texturePath = shape.table.color.startsWith('/') 
            ? shape.table.color 
            : `/${shape.table.color}`;
          console.log(`[Store] Setting headstoneMaterialUrl from catalog: ${texturePath}`);
          set({ headstoneMaterialUrl: texturePath });
        }
        if (shape.stand.color) {
          // Fix texture path - ensure it starts with /
          const baseTexturePath = shape.stand.color.startsWith('/') 
            ? shape.stand.color 
            : `/${shape.stand.color}`;
          set({ baseMaterialUrl: baseTexturePath });
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

  showInscriptionColor: true,
  inscriptionPriceModel: null,

  shapeUrl: DEFAULT_SHAPE_URL,
  setShapeUrl(shapeUrl) {
    set({ shapeUrl });
  },

  borderName: null,
  setBorderName(name) {
    set({ borderName: name });
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
    console.log(`[Store] setWidthMm called with ${v}, clamped to ${clampHeadstoneDim(v)}`);
    set({ widthMm: clampHeadstoneDim(v) });
  },

  heightMm: 900,
  setHeightMm(v) {
    console.log(`[Store] setHeightMm called with ${v}, clamped to ${clampHeadstoneDim(v)}`);
    set({ heightMm: clampHeadstoneDim(v) });
  },

  selected: null,
  setSelected(p) {
    set({ selected: p });
  },

  // Sample template: Beautiful memorial inscriptions with much larger spacing
  inscriptions: [
    {
      id: genId(),
      text: 'In Loving Memory',
      font: 'Chopin Script',
      sizeMm: 55,
      color: '#c99d44',
      xPos: 0,
      yPos: 50,  // Moved higher for more space
      rotationDeg: 0,
      ref: React.createRef<Group>(),
    },
    {
      id: genId(),
      text: 'Sarah Elizabeth Thompson',
      font: 'Chopin Script',
      sizeMm: 75,
      color: '#c99d44',
      xPos: 0,
      yPos: 20,  // Larger gap (30mm from above)
      rotationDeg: 0,
      ref: React.createRef<Group>(),
    },
    {
      id: genId(),
      text: '1945 - 2023',
      font: 'Franklin Gothic',  // Different font for dates
      sizeMm: 50,
      color: '#ffffff',  // White for contrast
      xPos: 0,
      yPos: -12,  // Larger gap (32mm from above)
      rotationDeg: 0,
      ref: React.createRef<Group>(),
    },
    {
      id: genId(),
      text: 'Forever in Our Hearts',
      font: 'Chopin Script',
      sizeMm: 45,
      color: '#c99d44',
      xPos: 0,
      yPos: -38,  // Larger gap (26mm from above)
      rotationDeg: 0,
      ref: React.createRef<Group>(),
    },
    {
      id: genId(),
      text: 'Beloved Mother & Grandmother',
      font: 'Chopin Script',
      sizeMm: 38,
      color: '#c99d44',
      xPos: 0,
      yPos: -60,  // Larger gap (22mm from above)
      rotationDeg: 0,
      ref: React.createRef<Group>(),
    },
  ],
  selectedInscriptionId: null,
  activeInscriptionText: 'In Loving Memory',
  inscriptionMinHeight: 5,
  inscriptionMaxHeight: 1200,
  fontLoading: false,
  inscriptionCost: 0,

  motifPriceModel: null,
  motifCost: 0,

  selectedAdditionId: null,
  additionRefs: {},
  // Sample template: Pre-positioned additions for beautiful composition
  additionOffsets: {
    'B2127': { xPos: 0, yPos: -330, scale: 0.6, rotationZ: 0 },        // Cross at center above first inscription
    'B1134S': { xPos: 150, yPos: -130, scale: 0.7, rotationZ: 0 },     // Angel at right side
  },

  selectedMotifId: null,
  motifRefs: {},
  // Sample template: Pre-positioned motif
  motifOffsets: {
    'motif_dove_1': { xPos: -170, yPos: -200, scale: 1.2, rotationZ: 0, heightMm: 40 },   // Dove - top left
  },

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

  setSelectedAdditionId: (id) => {
    set({ selectedAdditionId: id });
    if (id) {
      // Close other panels when opening addition panel
      set({ 
        activePanel: 'addition',
        selectedInscriptionId: null, // Deselect any inscription
        selectedMotifId: null, // Deselect any motif
      });
    }
  },
  setAdditionRef: (id, ref) =>
    set((s) => ({ additionRefs: { ...s.additionRefs, [id]: ref } })),
  setAdditionOffset: (
    id: string,
    offset: { xPos: number; yPos: number; scale: number; rotationZ: number },
  ) => {
    set((s) => ({ additionOffsets: { ...s.additionOffsets, [id]: offset } }));
  },
  duplicateAddition: (id: string) => {
    const { selectedAdditions, additionOffsets } = get();
    
    // Check if the addition exists in selected additions
    if (!selectedAdditions.includes(id)) return;
    
    // Generate a unique instance ID for the duplicate
    const instanceId = `${id}_${Date.now()}`;
    
    // Add the duplicate with unique instance ID
    set((s) => ({ 
      selectedAdditions: [...s.selectedAdditions, instanceId] 
    }));
    
    // Get the current offset for the original
    const currentOffset = additionOffsets[id];
    
    if (currentOffset) {
      // Create a new offset slightly offset from the original
      // Offset by 30 units to the right and 30 units down
      const newOffset = {
        ...currentOffset,
        xPos: currentOffset.xPos + 30,
        yPos: currentOffset.yPos + 30,
      };
      
      // Set the offset for the duplicate with its instance ID
      set((s) => ({ 
        additionOffsets: { ...s.additionOffsets, [instanceId]: newOffset },
        selectedAdditionId: instanceId, // Select the new duplicate
      }));
    }
  },

  setSelectedMotifId: (id) => {
    set({ selectedMotifId: id });
    if (id) {
      // Close other panels when opening motif panel
      set({ 
        activePanel: 'motif',
        selectedInscriptionId: null, // Deselect any inscription
        selectedAdditionId: null, // Deselect any addition
      });
    }
  },
  setMotifRef: (id, ref) =>
    set((s) => ({ motifRefs: { ...s.motifRefs, [id]: ref } })),
  setMotifOffset: (
    id: string,
    offset: { xPos: number; yPos: number; scale: number; rotationZ: number; heightMm: number },
  ) => {
    set((s) => ({ motifOffsets: { ...s.motifOffsets, [id]: offset } }));
    // Recalculate cost when height changes
    setTimeout(() => get().calculateMotifCost(), 0);
  },
  duplicateMotif: (id: string) => {
    const { selectedMotifs, motifOffsets } = get();
    
    // Find the motif with this ID
    const motif = selectedMotifs.find((m) => m.id === id);
    if (!motif) return;
    
    // Generate a unique instance ID for the duplicate
    const newId = `motif_${Date.now()}`;
    
    // Add the duplicate
    set((s) => ({ 
      selectedMotifs: [...s.selectedMotifs, { id: newId, svgPath: motif.svgPath, color: motif.color }] 
    }));
    
    // Get the current offset for the original
    const currentOffset = motifOffsets[id];
    
    if (currentOffset) {
      // Create a new offset slightly offset from the original
      const newOffset = {
        ...currentOffset,
        xPos: currentOffset.xPos + 30,
        yPos: currentOffset.yPos + 30,
      };
      
      // Set the offset for the duplicate
      set((s) => ({ 
        motifOffsets: { ...s.motifOffsets, [newId]: newOffset },
        selectedMotifId: newId, // Select the new duplicate
      }));
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
    get().navTo?.('/inscriptions');
  },

  openSizePanel: () => {
    // Close addition panel when opening size panel
    set({ selectedAdditionId: null });
    get().setActivePanel('size');
    get().navTo?.('/select-size');
  },

  openAdditionsPanel: () => {
    // Close addition panel when opening additions panel
    set({ selectedAdditionId: null });
    get().setActivePanel('additions');
    get().navTo?.('/select-additions');
  },

  closeInscriptions: () => {
    set({ selectedInscriptionId: null });
    get().setActivePanel(null);
  },
}));
