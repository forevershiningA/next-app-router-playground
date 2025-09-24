// lib/scene-overlay-store.ts
'use client';

import { create } from 'zustand';
import type { ReactNode } from 'react';

type Section = 'size' | 'shape' | 'material' | (string & {});

const sectionTitle: Record<string, string> = {
  size: 'Select Size',
  shape: 'Select Shape',
  material: 'Select Material',
};

type Pos = { x: number; y: number };

type OverlayState = {
  open: boolean;
  title: string;
  section?: Section;
  content: ReactNode | null;

  pos: Pos;
  collapsed: boolean;

  show: (args: {
    section?: Section;
    title?: string;
    content: ReactNode;
  }) => void;
  hide: () => void;
  setPos: (pos: Pos) => void;
  toggleCollapsed: () => void;
};

export const useSceneOverlayStore = create<OverlayState>((set) => ({
  open: false,
  title: '',
  section: undefined,
  content: null,
  pos: { x: 24, y: 24 },
  collapsed: false,

  show: ({ section, title, content }) =>
    set({
      open: true,
      section,
      title:
        title ?? (section ? (sectionTitle[section] ?? 'Overlay') : 'Overlay'),
      content,
    }),
  hide: () => set({ open: false, content: null }),
  setPos: (pos) => set({ pos }),
  toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
}));
