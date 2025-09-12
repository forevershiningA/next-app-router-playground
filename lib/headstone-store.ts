'use client';

import { create } from 'zustand';
import React from 'react';
import type { Group } from 'three'; 
import { DEFAULT_SHAPE_URL } from '#/lib/headstone-constants';

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
    Math.max(MIN_INSCRIPTION_SIZE_MM, Math.round(v))
  );

const MIN_INSCRIPTION_ROTATION_DEG = -45;
const MAX_INSCRIPTION_ROTATION_DEG = 45;
const clampInscriptionRotation = (v: number) =>
  Math.max(
    MIN_INSCRIPTION_ROTATION_DEG,
    Math.min(MAX_INSCRIPTION_ROTATION_DEG, Math.round(v))
  );

/* types */
export type Line = {
  id: string;
  text: string;
  sizeMm: number;
  font: string;
  xPos: number;
  yPos: number;
  rotationDeg: number;
  ref: React.RefObject<Group | null>;  // ✅ allow null
};
export type Part = 'headstone' | 'base' | null;
export type PanelName = 'shape' | 'size' | 'material' | 'inscription' | null;
type NavFn = (href: string, opts?: { replace?: boolean }) => void;

type LinePatch = Partial<
  Pick<Line, 'text' | 'font' | 'sizeMm' | 'rotationDeg' | 'xPos' | 'yPos'>
>;

type HeadstoneState = {
  productUrl: string | null;
  setProductUrl: (url: string) => void;

  shapeUrl: string | null;
  setShapeUrl: (url: string) => void;

  materialUrl: string | null;
  setMaterialUrl: (url: string) => void;

  widthMm: number;
  setWidthMm: (v: number) => void;

  heightMm: number;
  setHeightMm: (v: number) => void;

  selected: Part;
  setSelected: (p: Part) => void;

  inscriptions: Line[];
  selectedInscriptionId: string | null;
  activeInscriptionText: string;

  setInscriptions: (inscriptions: Line[] | ((inscriptions: Line[]) => Line[])) => void;

  addInscriptionLine: (patch?: LinePatch) => string;
  updateInscription: (id: string, patch: Partial<Line>) => void;
  duplicateInscription: (id: string) => string;
  deleteInscription: (id: string) => void;

  setSelectedInscriptionId: (id: string | null) => void;
  setActiveInscriptionText: (t: string) => void;

  /* router injection */
  navTo?: NavFn;
  setNavTo: (fn: NavFn) => void;

  /* overlay / panel control */
  activePanel: PanelName;
  setActivePanel: (p: PanelName) => void;

  openInscriptions: (id: string | null) => void;
  openSizePanel: () => void;
  closeInscriptions: () => void;
};

let nextId = 0;
const genId = () => `l-${nextId++}`;

export const useHeadstoneStore = create<HeadstoneState>()((set, get) => ({
  productUrl: null,
  setProductUrl(productUrl) {
    set({ productUrl });
  },

  shapeUrl: DEFAULT_SHAPE_URL,
  setShapeUrl(shapeUrl) {
    set({ shapeUrl });
  },

  materialUrl: `${TEX_BASE}${DEFAULT_TEX}`,
  setMaterialUrl(materialUrl) {
    set({ materialUrl });
  },

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
      font: 'Garamond',
      sizeMm: 80,
      xPos: 0,
      yPos: 0,
      rotationDeg: 0,
      ref: React.createRef<Group>(), // ✅
    },
    {
      id: genId(),
      text: 'of General Admiral Aladeen',
      font: 'Garamond',
      sizeMm: 120,
      xPos: 0,
      yPos: 20,
      rotationDeg: 0,
      ref: React.createRef<Group>(), // ✅
    },
  ],
  selectedInscriptionId: null,
  activeInscriptionText: 'In Loving Memory',

  setInscriptions: (inscriptions) => {
    if (typeof inscriptions === "function") {
      set({ inscriptions: inscriptions(get().inscriptions) });
    } else {
      set({ inscriptions });
    }
  },

  addInscriptionLine: (patch: LinePatch = {}) => {
    const id = genId();

    const text = patch.text ?? 'New line';
    const font = patch.font ?? 'Garamond';
    const sizeMm = clampInscriptionSize(patch.sizeMm ?? 30);
    const rotationDeg = clampInscriptionRotation(patch.rotationDeg ?? 0);
    const xPos = patch.xPos ?? 0;
    const yPos = patch.yPos ?? 0;

    const newLine: Line = {
      id,
      text,
      font,
      sizeMm,
      rotationDeg,
      xPos,
      yPos,
      ref: React.createRef(),
    };

    set((s) => ({
      inscriptions: [...s.inscriptions, newLine],
      selectedInscriptionId: id,
    }));

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
          : l
      ),
    }));
  },

  duplicateInscription: (id) => {
    const src = get().inscriptions.find((l) => l.id === id);
    if (!src) return '';
    const newId = genId();
    set((s) => ({ inscriptions: [...s.inscriptions, { ...src, id: newId }] }));
    return newId;
  },

  deleteInscription: (id) => {
    set((s) => {
      const rest = s.inscriptions.filter((l) => l.id !== id);
      const next = rest[0]?.id ?? null;
      return { inscriptions: rest, selectedInscriptionId: next };
    });
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
  },

  setActiveInscriptionText: (activeInscriptionText) => set({ activeInscriptionText }),

  /* router injection */
  navTo: undefined,
  setNavTo: (fn) => set({ navTo: fn }),

  /* panel control + conditional routing */
  activePanel: null,
  setActivePanel: (p) => {
    set({ activePanel: p });
  },

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

  closeInscriptions: () => {
    set({ selectedInscriptionId: null });
    get().setActivePanel(null);
  },
}));