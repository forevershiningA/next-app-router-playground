import type { StateCreator } from 'zustand';
import type { HeadstoneState } from '#/lib/headstone-store.types';

export type UISlice = Pick<
  HeadstoneState,
  | 'navTo'
  | 'setNavTo'
  | 'selected'
  | 'setSelected'
  | 'activePanel'
  | 'setActivePanel'
  | 'loading'
  | 'setLoading'
  | 'isMaterialChange'
  | 'setIsMaterialChange'
  | 'openInscriptions'
  | 'openSizePanel'
  | 'openAdditionsPanel'
  | 'closeInscriptions'
>;

const isStainlessSteelHeadstone = (
  state: Pick<HeadstoneState, 'productId' | 'catalog'>,
) =>
  ['1', '23'].includes(state.productId ?? '') ||
  (state.catalog?.product?.type === 'headstone' &&
    state.catalog.product.name.toLowerCase().includes('stainless steel'));

const isDesignerRoute = () =>
  typeof window !== 'undefined' &&
  !window.location.pathname.startsWith('/designs/');

export const createUISlice: StateCreator<HeadstoneState, [], [], UISlice> = (
  set,
  get,
) => ({
  navTo: undefined,
  setNavTo: (fn) => set({ navTo: fn }),

  selected: null,
  setSelected: (selected) => {
    if (selected) {
      set({
        selected,
        selectedAdditionId: null,
        selectedInscriptionId: null,
        selectedMotifId: null,
        selectedImageId: null,
      });
    } else {
      set({ selected });
    }
  },

  activePanel: null,
  setActivePanel: (activePanel) => set({ activePanel }),

  loading: true,
  setLoading: (loading) => set({ loading }),

  isMaterialChange: false,
  setIsMaterialChange: (isMaterialChange) => set({ isMaterialChange }),

  openInscriptions: (id) => {
    set({ selectedAdditionId: null });
    if (id) get().setSelectedInscriptionId(id);
    get().setActivePanel('inscription');
    if (isDesignerRoute()) get().navTo?.('/inscriptions');
  },

  openSizePanel: () => {
    set({ selectedAdditionId: null });
    get().setActivePanel('size');
    if (isDesignerRoute()) get().navTo?.('/select-size');
  },

  openAdditionsPanel: () => {
    if (isStainlessSteelHeadstone(get())) {
      get().navTo?.('/select-size');
      return;
    }
    set({ selectedAdditionId: null });
    get().setActivePanel('additions');
    if (isDesignerRoute()) get().navTo?.('/select-additions');
  },

  closeInscriptions: () => {
    set({ selectedInscriptionId: null });
    get().setActivePanel(null);
  },
});
