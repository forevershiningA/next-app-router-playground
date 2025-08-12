// lib/headstone-store.ts
"use client";
import { create } from "zustand";

type State = { heightCm: number; setHeightCm: (v: number) => void };
export const useHeadstoneStore = create<State>((set) => ({
  heightCm: 110,                       // sane default
  setHeightCm: (v) => set({ heightCm: Math.max(1, Number(v) || 110) }),
}));
