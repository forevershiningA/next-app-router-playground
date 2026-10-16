import type { StateCreator } from 'zustand';
import type { HeadstoneState } from '#/lib/headstone-store.types';

export type CatalogOptionsSlice = Pick<
  HeadstoneState,
  | 'materials'
  | 'setMaterials'
  | 'shapes'
  | 'setShapes'
  | 'borders'
  | 'setBorders'
  | 'fixedSizes'
  | 'setFixedSizes'
  | 'motifsCatalog'
  | 'setMotifsCatalog'
>;

export const createCatalogOptionsSlice: StateCreator<
  HeadstoneState,
  [],
  [],
  CatalogOptionsSlice
> = (set) => ({
  materials: [],
  setMaterials: (materials) => set({ materials }),

  shapes: [],
  setShapes: (shapes) => set({ shapes }),

  borders: [],
  setBorders: (borders) => set({ borders }),

  fixedSizes: [],
  setFixedSizes: (fixedSizes) => set({ fixedSizes }),

  motifsCatalog: [],
  setMotifsCatalog: (motifsCatalog) => set({ motifsCatalog }),
});
