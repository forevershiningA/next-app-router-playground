import type { StateCreator } from 'zustand';
import { clampEditingObject } from '#/lib/headstone-store/editing-object';
import {
  FULL_MONUMENT_DEPTH_DIFF,
  FULL_MONUMENT_HEIGHT_DIFF,
  FULL_MONUMENT_WIDTH_DIFF,
} from '#/lib/headstone-constants';
import {
  MAX_HEADSTONE_DIM,
  MIN_HEADSTONE_DIM,
  type HeadstoneState,
} from '#/lib/headstone-store.types';

const FULL_MONUMENT_LEDGER_HEIGHT_MIN_MM = 30;
const FULL_MONUMENT_LEDGER_HEIGHT_MAX_MM = 150;
const FULL_MONUMENT_LEDGER_DEPTH_MIN_MM = 400;
const FULL_MONUMENT_LEDGER_DEPTH_MAX_MM = 2900;
const FULL_MONUMENT_KERB_DEPTH_MIN_MM = 500;
const FULL_MONUMENT_KERB_DEPTH_MAX_MM = 3000;

const clampRoundedFinite = (
  value: number,
  min: number,
  max: number,
  fallback = min,
) => {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, Math.round(value)));
};

export type ProductConfigurationSlice = Pick<
  HeadstoneState,
  | 'minWidthMm'
  | 'maxWidthMm'
  | 'minHeightMm'
  | 'maxHeightMm'
  | 'minBaseWidthMm'
  | 'maxBaseWidthMm'
  | 'minBaseHeightMm'
  | 'maxBaseHeightMm'
  | 'minThicknessMm'
  | 'maxThicknessMm'
  | 'showBase'
  | 'setShowBase'
  | 'showLedger'
  | 'setShowLedger'
  | 'showKerbset'
  | 'setShowKerbset'
  | 'ledgerWidthMm'
  | 'setLedgerWidthMm'
  | 'ledgerHeightMm'
  | 'setLedgerHeightMm'
  | 'ledgerDepthMm'
  | 'setLedgerDepthMm'
  | 'kerbWidthMm'
  | 'setKerbWidthMm'
  | 'kerbHeightMm'
  | 'setKerbHeightMm'
  | 'kerbDepthMm'
  | 'setKerbDepthMm'
  | 'editingObject'
  | 'setEditingObject'
  | 'widthMm'
  | 'setWidthMm'
  | 'heightMm'
  | 'setHeightMm'
  | 'baseWidthMm'
  | 'setBaseWidthMm'
  | 'baseHeightMm'
  | 'setBaseHeightMm'
  | 'baseThickness'
  | 'setBaseThickness'
  | 'uprightThickness'
  | 'setUprightThickness'
  | 'slantThickness'
  | 'setSlantThickness'
>;

export const createProductConfigurationSlice: StateCreator<
  HeadstoneState,
  [],
  [],
  ProductConfigurationSlice
> = (set, get) => ({
  minWidthMm: MIN_HEADSTONE_DIM,
  maxWidthMm: MAX_HEADSTONE_DIM,
  minHeightMm: MIN_HEADSTONE_DIM,
  maxHeightMm: MAX_HEADSTONE_DIM,
  minBaseWidthMm: MIN_HEADSTONE_DIM,
  maxBaseWidthMm: MAX_HEADSTONE_DIM,
  minBaseHeightMm: 50,
  maxBaseHeightMm: 200,
  minThicknessMm: 40,
  maxThicknessMm: 300,

  showBase: true,
  setShowBase: (showBase) =>
    set((state) => {
      const editingObject = clampEditingObject(state.editingObject, {
        showBase,
        showLedger: state.showLedger,
        showKerbset: state.showKerbset,
      });
      return editingObject === state.editingObject
        ? { showBase }
        : { showBase, editingObject };
    }),

  showLedger: false,
  setShowLedger: (showLedger) =>
    set((state) => {
      const editingObject = clampEditingObject(state.editingObject, {
        showBase: state.showBase,
        showLedger,
        showKerbset: state.showKerbset,
      });
      return editingObject === state.editingObject
        ? { showLedger }
        : { showLedger, editingObject };
    }),

  showKerbset: false,
  setShowKerbset: (showKerbset) =>
    set((state) => {
      const editingObject = clampEditingObject(state.editingObject, {
        showBase: state.showBase,
        showLedger: state.showLedger,
        showKerbset,
      });
      return editingObject === state.editingObject
        ? { showKerbset }
        : { showKerbset, editingObject };
    }),

  ledgerWidthMm: 950,
  setLedgerWidthMm: (value) => {
    const state = get();
    const minAllowed = Math.max(state.minBaseWidthMm, state.widthMm);
    const maxAllowed = Math.max(minAllowed, state.maxBaseWidthMm);
    const ledgerWidthMm = clampRoundedFinite(value, minAllowed, maxAllowed);
    const baseAndKerbWidth = Math.min(
      maxAllowed,
      ledgerWidthMm + FULL_MONUMENT_WIDTH_DIFF,
    );
    set({
      ledgerWidthMm,
      baseWidthMm: baseAndKerbWidth,
      kerbWidthMm: baseAndKerbWidth,
    });
  },

  ledgerHeightMm: 60,
  setLedgerHeightMm: (value) =>
    set({
      ledgerHeightMm: clampRoundedFinite(
        value,
        FULL_MONUMENT_LEDGER_HEIGHT_MIN_MM,
        FULL_MONUMENT_LEDGER_HEIGHT_MAX_MM,
      ),
    }),

  ledgerDepthMm: 2030,
  setLedgerDepthMm: (value) => {
    const ledgerDepthMm = clampRoundedFinite(
      value,
      FULL_MONUMENT_LEDGER_DEPTH_MIN_MM,
      FULL_MONUMENT_LEDGER_DEPTH_MAX_MM,
    );
    set({
      ledgerDepthMm,
      kerbDepthMm: ledgerDepthMm + FULL_MONUMENT_DEPTH_DIFF,
    });
  },

  kerbWidthMm: 1200,
  setKerbWidthMm: (value) => {
    const state = get();
    const minAllowed = Math.max(state.minBaseWidthMm, state.widthMm);
    const maxAllowed = Math.max(minAllowed, state.maxBaseWidthMm);
    const kerbWidthMm = clampRoundedFinite(value, minAllowed, maxAllowed);
    set({
      kerbWidthMm,
      baseWidthMm: kerbWidthMm,
      ledgerWidthMm: Math.max(
        minAllowed,
        kerbWidthMm - FULL_MONUMENT_WIDTH_DIFF,
      ),
    });
  },

  kerbHeightMm: 300,
  setKerbHeightMm: (value) => {
    const state = get();
    const safeKerbHeight = clampRoundedFinite(
      value,
      50,
      Number.MAX_SAFE_INTEGER,
    );
    const desiredBase = safeKerbHeight + FULL_MONUMENT_HEIGHT_DIFF;
    const baseHeightMm = Math.max(
      state.minBaseHeightMm,
      Math.min(state.maxBaseHeightMm, desiredBase),
    );
    set({
      kerbHeightMm: Math.max(50, baseHeightMm - FULL_MONUMENT_HEIGHT_DIFF),
      baseHeightMm,
    });
  },

  kerbDepthMm: 2150,
  setKerbDepthMm: (value) => {
    const kerbDepthMm = clampRoundedFinite(
      value,
      FULL_MONUMENT_KERB_DEPTH_MIN_MM,
      FULL_MONUMENT_KERB_DEPTH_MAX_MM,
    );
    set({
      kerbDepthMm,
      ledgerDepthMm: Math.max(0, kerbDepthMm - FULL_MONUMENT_DEPTH_DIFF),
    });
  },

  editingObject: 'headstone',
  setEditingObject: (editingObject) => set({ editingObject }),

  widthMm: 900,
  setWidthMm: (value) => {
    const { minWidthMm, maxWidthMm } = get();
    const widthMm = clampRoundedFinite(value, minWidthMm, maxWidthMm);
    set({ widthMm });

    const state = get();
    if (state.baseWidthMm < widthMm) {
      const baseAndKerbWidth = widthMm + FULL_MONUMENT_WIDTH_DIFF;
      set({
        baseWidthMm: baseAndKerbWidth,
        kerbWidthMm: baseAndKerbWidth,
        ledgerWidthMm: widthMm,
      });
    }
  },

  heightMm: 900,
  setHeightMm: (value) => {
    const { minHeightMm, maxHeightMm } = get();
    set({ heightMm: clampRoundedFinite(value, minHeightMm, maxHeightMm) });
  },

  baseWidthMm: 1260,
  setBaseWidthMm: (value) => {
    const state = get();
    const minAllowed = Math.max(state.minBaseWidthMm, state.widthMm);
    const maxAllowed = Math.max(minAllowed, state.maxBaseWidthMm);
    const baseWidthMm = clampRoundedFinite(value, minAllowed, maxAllowed);
    set({
      baseWidthMm,
      kerbWidthMm: baseWidthMm,
      ledgerWidthMm: Math.max(
        minAllowed,
        baseWidthMm - FULL_MONUMENT_WIDTH_DIFF,
      ),
    });
  },

  baseHeightMm: 100,
  setBaseHeightMm: (value) => {
    const { minBaseHeightMm, maxBaseHeightMm } = get();
    const baseHeightMm = clampRoundedFinite(
      value,
      minBaseHeightMm,
      maxBaseHeightMm,
    );
    set({
      baseHeightMm,
      kerbHeightMm: Math.max(50, baseHeightMm - FULL_MONUMENT_HEIGHT_DIFF),
    });
  },

  baseThickness: 250,
  setBaseThickness: (value) => {
    const { minThicknessMm, maxThicknessMm } = get();
    set({
      baseThickness: clampRoundedFinite(value, minThicknessMm, maxThicknessMm),
    });
  },

  uprightThickness: 150,
  setUprightThickness: (value) => {
    const { minThicknessMm, maxThicknessMm } = get();
    set({
      uprightThickness: clampRoundedFinite(
        value,
        minThicknessMm,
        maxThicknessMm,
      ),
    });
  },

  slantThickness: 150,
  setSlantThickness: (value) => {
    const { minThicknessMm, maxThicknessMm } = get();
    set({
      slantThickness: clampRoundedFinite(value, minThicknessMm, maxThicknessMm),
    });
  },
});
