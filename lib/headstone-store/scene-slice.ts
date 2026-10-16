import type { StateCreator } from 'zustand';
import type { HeadstoneState } from '#/lib/headstone-store.types';

type SceneSlice = Pick<
  HeadstoneState,
  | 'baseMeshRef'
  | 'setBaseMeshRef'
  | 'is2DMode'
  | 'toggleViewMode'
  | 'screenshotMode'
  | 'setScreenshotMode'
  | 'hideScenery'
  | 'setHideScenery'
  | 'solidBgColor'
  | 'setSolidBgColor'
  | 'sceneryVariant'
  | 'setSceneryVariant'
>;

export const createSceneSlice: StateCreator<
  HeadstoneState,
  [],
  [],
  SceneSlice
> = (set) => ({
  baseMeshRef: null,
  setBaseMeshRef: (mesh) => set({ baseMeshRef: mesh }),

  is2DMode: false,
  toggleViewMode: () => set((state) => ({ is2DMode: !state.is2DMode })),

  screenshotMode: false,
  setScreenshotMode: (screenshotMode) => set({ screenshotMode }),

  hideScenery: true,
  setHideScenery: (hideScenery) => set({ hideScenery }),
  solidBgColor: '#787878',
  setSolidBgColor: (solidBgColor) => set({ solidBgColor }),
  sceneryVariant: 'day',
  setSceneryVariant: (sceneryVariant) => set({ sceneryVariant }),
});
