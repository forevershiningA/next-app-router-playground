// lib/headstone-store.ts
"use client";
import { create } from "zustand";

const MIN = 300;
const MAX = 1200;
const clamp = (v: number) => Math.min(MAX, Math.max(MIN, Math.round(v)));

type HeadstoneState = {
  heightMm: number;
  setHeightMm: (v: number) => void;
};

export const useHeadstoneStore = create<HeadstoneState>()((set) => ({
  heightMm: 900, // always defined number
  setHeightMm: (v) => {
    //console.log("heightMm value before clamp:", v);
    set({ heightMm: clamp(v) });
  },
}));