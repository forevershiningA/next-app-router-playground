"use client";

import { create } from "zustand";
import { DEFAULT_SHAPE_URL } from "#/lib/headstone-constants";

const TEX_BASE = "/textures/forever/l/";
const DEFAULT_TEX = "Imperial-Red.jpg";

/* clamps */
const MIN_HEADSTONE_DIM = 300;
const MAX_HEADSTONE_DIM = 1200;
const clampHeadstoneDim = (v: number) => Math.min(MAX_HEADSTONE_DIM, Math.max(MIN_HEADSTONE_DIM, Math.round(v)));

const MIN_INSCRIPTION_SIZE_MM = 5;
const MAX_INSCRIPTION_SIZE_MM = 120;
const clampInscriptionSize = (v: number) => Math.min(MAX_INSCRIPTION_SIZE_MM, Math.max(MIN_INSCRIPTION_SIZE_MM, Math.round(v)));

const MIN_INSCRIPTION_ROTATION_DEG = -45;
const MAX_INSCRIPTION_ROTATION_DEG = 45;
const clampInscriptionRotation = (v: number) => Math.max(MIN_INSCRIPTION_ROTATION_DEG, Math.min(MAX_INSCRIPTION_ROTATION_DEG, Math.round(v)));

/* types */
export type Line = { id: string; text: string; font: string; sizeMm: number; rotationDeg: number; };
export type Part = "headstone" | "base" | null;
export type PanelName = "shape" | "size" | "material" | "inscription" | null;
type NavFn = (href: string, opts?: { replace?: boolean }) => void;

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

  setInscriptions: (lines: Line[]) => void;
  addInscriptionLine: (line?: Partial<Line>) => string;
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

  openInscriptions: (id?: string) => void;
  closeInscriptions: () => void;
};

let nextId = 0;
const genId = () => `l-${nextId++}`;

export const useHeadstoneStore = create<HeadstoneState>()((set, get) => ({
  productUrl: null,
  setProductUrl(productUrl) { set({ productUrl }); },

  shapeUrl: DEFAULT_SHAPE_URL,
  setShapeUrl(shapeUrl) { set({ shapeUrl }); },

  materialUrl: `${TEX_BASE}${DEFAULT_TEX}`,
  setMaterialUrl(materialUrl) { set({ materialUrl }); },

  widthMm: 900,
  setWidthMm(v) { set({ widthMm: clampHeadstoneDim(v) }); },

  heightMm: 900,
  setHeightMm(v) { set({ heightMm: clampHeadstoneDim(v) }); },

  selected: null,
  setSelected(p) { set({ selected: p }); },

  inscriptions: [
    { id: genId(), text: "In Loving Memory", font: "Garamond", sizeMm: 19, rotationDeg: 0 },
  ],
  selectedInscriptionId: null,
  activeInscriptionText: "In Loving Memory",

  setInscriptions: (inscriptions) => set({ inscriptions }),

  addInscriptionLine: (patch) => {
    const id = genId();
    const newLine: Line = { id, text: "New line", font: "Garamond", sizeMm: 19, rotationDeg: 0, ...patch };
    set((s) => ({ inscriptions: [...s.inscriptions, newLine] }));
    return id;
  },

  updateInscription: (id, patch) => {
    if (patch.sizeMm !== undefined) patch.sizeMm = clampInscriptionSize(patch.sizeMm);
    if (patch.rotationDeg !== undefined) patch.rotationDeg = clampInscriptionRotation(patch.rotationDeg);
    set((s) => ({ inscriptions: s.inscriptions.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
  },

  duplicateInscription: (id) => {
    const src = get().inscriptions.find((l) => l.id === id);
    if (!src) return "";
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

  setSelectedInscriptionId: (id) => set({ selectedInscriptionId: id }),
  setActiveInscriptionText: (activeInscriptionText) => set({ activeInscriptionText }),

  /* router injection */
  navTo: undefined,
  setNavTo: (fn) => set({ navTo: fn }),

  /* panel control + conditional routing */
  activePanel: null,
  setActivePanel: (p) => {
    const prev = get().activePanel;
    if (prev !== p) set({ activePanel: p });
    if (typeof window === "undefined") return;

    const open = (section: string) =>
      window.dispatchEvent(new CustomEvent("fs:open-overlay", { detail: { section } }));
    const close = (section?: string) =>
      window.dispatchEvent(new CustomEvent("fs:close-overlay", { detail: section ? { section } : {} }));

    if (!p) {
      close();
      close("inscriptions"); // explicit legacy close
      return;
    }

    // map panel -> route that hosts the overlay component
    const routeOf: Record<Exclude<PanelName, null>, string> = {
      shape: "/shape",
      size: "/size",
      material: "/materials",
      inscription: "/inscriptions",
    };

    const overlaySection = p === "inscription" ? "inscriptions" : p; // your panel expects plural
    const targetRoute = routeOf[p] ?? "/";
    const here = window.location?.pathname ?? "";
    const needRoute = here !== targetRoute;

    if (needRoute) {
      const nav = get().navTo;
      if (nav) {
        nav(targetRoute);
        // let the new route mount, then open overlay
        requestAnimationFrame(() => open(overlaySection));
      } else {
        window.dispatchEvent(new CustomEvent("fs:navigate", { detail: { href: targetRoute } }));
        if (here !== targetRoute) window.location.assign(targetRoute); // hard fallback
      }
    } else {
      open(overlaySection);
    }
  },

  openInscriptions: (id) => {
    if (id) {
      const line = get().inscriptions.find((l) => l.id === id);
      if (line) set({ selectedInscriptionId: id, activeInscriptionText: line.text });
    }
    get().setActivePanel("inscription");
  },

  closeInscriptions: () => {
    set({ selectedInscriptionId: null });
    get().setActivePanel(null);
  },
}));
