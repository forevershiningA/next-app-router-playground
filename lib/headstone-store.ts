// lib/headstone-store.ts
"use client";

import { create } from "zustand";
import { DEFAULT_SHAPE_URL } from "#/lib/headstone-constants";

const TEX_BASE = "/textures/forever/l/";
const DEFAULT_TEX = "Imperial-Red.jpg";

const MIN = 300;
const MAX = 1200;
const clamp = (v: number) => Math.min(MAX, Math.max(MIN, Math.round(v)));

export type Part = "headstone" | "base" | null;

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

  activeInscriptionText: string;
  setActiveInscriptionText: (t: string) => void;

  openInscriptions: () => void;

};

export const useHeadstoneStore = create<HeadstoneState>()((set) => ({
  productUrl: null,
  setProductUrl(productUrl) {
    set({ productUrl });
  },

  // Default SVG: /shapes/headstones/serpentine.svg
  shapeUrl: DEFAULT_SHAPE_URL,
  setShapeUrl(shapeUrl) {
    set({ shapeUrl });
  },

  // Default texture: /textures/forever/l/Imperial-Red.jpg
  materialUrl: `${TEX_BASE}${DEFAULT_TEX}`,
  setMaterialUrl(materialUrl) {
    set({ materialUrl });
  },

  widthMm: 900,
  setWidthMm(v) {
    set({ widthMm: clamp(v) });
  },

  heightMm: 900,
  setHeightMm(v) {
    set({ heightMm: clamp(v) });
  },

  selected: null,
  setSelected(p) {
    set({ selected: p });
  },

  activeInscriptionText: "In Loving Memory",
  setActiveInscriptionText: (activeInscriptionText) => set({ activeInscriptionText }),

  openInscriptions: () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("fs:open-overlay", { detail: { section: "inscriptions" } })
      );
    }
  },

}));
