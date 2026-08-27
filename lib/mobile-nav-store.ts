// lib/mobile-nav-store.ts
'use client';

import { create } from 'zustand';

// Shared open/close state for the mobile designer left drawer. Lives in a store
// (rather than local component state) so sibling components — e.g. MobileHeader —
// can react to it, hiding the top info bar while the drawer is open on mobile.
type MobileNavState = {
  isOpen: boolean;
  setOpen: (value: boolean) => void;
  pendingPanel: string | null;
  setPendingPanel: (panel: string | null) => void;
  toggle: () => void;
  isSizeAdjustmentCompact: boolean;
  setSizeAdjustmentCompact: (value: boolean) => void;
  isBottomSheetCollapsed: boolean;
  setBottomSheetCollapsed: (value: boolean) => void;
};

export const useMobileNavStore = create<MobileNavState>((set) => ({
  isOpen: false,
  setOpen: (value) => set({ isOpen: value }),
  pendingPanel: null,
  setPendingPanel: (panel) => set({ pendingPanel: panel }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  isSizeAdjustmentCompact: false,
  setSizeAdjustmentCompact: (value) => set({ isSizeAdjustmentCompact: value }),
  isBottomSheetCollapsed: false,
  setBottomSheetCollapsed: (value) => set({ isBottomSheetCollapsed: value }),
}));
