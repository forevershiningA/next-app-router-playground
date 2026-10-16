'use client';

import { create } from 'zustand';
import { createCatalogOptionsSlice } from '#/lib/headstone-store/catalog-options-slice';
import { createProductConfigurationSlice } from '#/lib/headstone-store/product-configuration-slice';
import { createProductAppearanceSlice } from '#/lib/headstone-store/product-appearance-slice';
import { createProjectSlice } from '#/lib/headstone-store/project-slice';
import { normalizeCatalogData } from '#/lib/headstone-store/catalog-normalization';
import { createProductSelectionSlice } from '#/lib/headstone-store/product-selection-slice';
import { createImageSlice } from '#/lib/headstone-store/image-slice';
import { createInscriptionSlice } from '#/lib/headstone-store/inscription-slice';
import { createMotifSlice } from '#/lib/headstone-store/motif-slice';
import { createEmblemSlice } from '#/lib/headstone-store/emblem-slice';
import { createAdditionSlice } from '#/lib/headstone-store/addition-slice';
import { createSceneSlice } from '#/lib/headstone-store/scene-slice';
import { createResetSlice } from '#/lib/headstone-store/reset-slice';
import { createPricingSlice } from '#/lib/headstone-store/pricing-slice';
import { createUISlice } from '#/lib/headstone-store/ui-slice';
import type { HeadstoneState } from '#/lib/headstone-store.types';

export type {
  AdditionKind,
  BorderOption,
  Line,
  Material,
  MotifCatalogItem,
  PanelName,
  Part,
  ShapeOption,
  FixingType,
} from '#/lib/headstone-store.types';

export const useHeadstoneStore = create<HeadstoneState>()((set, get, api) => ({
  catalog: null,
  setCatalog: (catalog) => set({ catalog: normalizeCatalogData(catalog) }),

  ...createProductAppearanceSlice(set, get, api),

  ...createProjectSlice(set, get, api),
  ...createCatalogOptionsSlice(set, get, api),
  ...createProductConfigurationSlice(set, get, api),
  ...createProductSelectionSlice(set, get, api),
  ...createImageSlice(set, get, api),
  ...createInscriptionSlice(set, get, api),
  ...createMotifSlice(set, get, api),
  ...createEmblemSlice(set, get, api),
  ...createAdditionSlice(set, get, api),
  ...createSceneSlice(set, get, api),
  ...createResetSlice(set, get, api),
  ...createPricingSlice(set, get, api),
  ...createUISlice(set, get, api),
}));

// Expose for Playwright batch screenshot automation (dev only)
if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
  const automationWindow = window as Window & {
    __headstoneStore?: typeof useHeadstoneStore;
  };
  automationWindow.__headstoneStore = useHeadstoneStore;
}
