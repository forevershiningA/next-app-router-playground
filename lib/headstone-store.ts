// lib/headstone-store.ts
"use client";
import { create } from "zustand";

const MIN = 300;
const MAX = 1200;
const clamp = (v: number) => Math.min(MAX, Math.max(MIN, Math.round(v)));

type Part = "headstone" | "base" | null;

type HeadstoneState = {
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
};

export const useHeadstoneStore = create<HeadstoneState>()((set) => ({
  shapeUrl: null,
  setShapeUrl: (shapeUrl) => set({ shapeUrl }),

  materialUrl: null,
  setMaterialUrl: (materialUrl) => set({ materialUrl }),

  widthMm: 900,
  setWidthMm: (v) => set({ widthMm: clamp(v) }),

  heightMm: 900,
  setHeightMm: (v) => set({ heightMm: clamp(v) }),

  selected: null,
  setSelected: (p) => set({ selected: p }),
}));
