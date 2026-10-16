import type { StateCreator } from 'zustand';
import type { HeadstoneState } from '#/lib/headstone-store.types';
import { normalizeThreeColorValue } from '#/lib/headstone-store/color-utils';
import { getNextDesignLayer } from '#/lib/headstone-store/layer-utils';
import { withOffsetSurfaceDimensions } from '#/lib/headstone-store/surface-dimensions';

const isDesktopViewport = () =>
  typeof window !== 'undefined' && window.innerWidth >= 1024;
const genMotifId = () => `motif-${crypto.randomUUID()}`;
type MotifOffset = HeadstoneState['motifOffsets'][string];
type MotifSlice = Pick<
  HeadstoneState,
  | 'selectedMotifs'
  | 'motifPriceModel'
  | 'motifInitHeight'
  | 'selectedMotifId'
  | 'motifRefs'
  | 'motifOffsets'
  | 'addMotif'
  | 'removeMotif'
  | 'setMotifColor'
  | 'setSelectedMotifId'
  | 'setMotifRef'
  | 'setMotifOffset'
  | 'duplicateMotif'
>;

export const createMotifSlice: StateCreator<
  HeadstoneState,
  [],
  [],
  MotifSlice
> = (set, get) => ({
  selectedMotifs: [],
  motifPriceModel: null,
  motifInitHeight: 100,
  selectedMotifId: null,
  motifRefs: {},
  motifOffsets: {},
  // Sample template: Add dove motif
  addMotif: (svgPath) => {
    const id = genMotifId();
    const state = get();
    const { catalog, selected } = state;
    const isLaser = catalog?.product.laser === '1';
    // Use defaultColor from catalog, fallback to white for laser or gold for others
    const defaultColor = normalizeThreeColorValue(
      catalog?.product.defaultColor || (isLaser ? '#ffffff' : '#c99d44'),
    );
    const defaultHeightMm =
      state.motifInitHeight ?? state.motifPriceModel?.initHeight ?? 100;

    // Set target based on currently selected object (headstone or base)
    const target: 'base' | 'headstone' | 'ledger' =
      selected === 'base'
        ? 'base'
        : selected === 'ledger'
          ? 'ledger'
          : 'headstone';

    set((s) => {
      const newMotifs = [
        ...s.selectedMotifs,
        { id, svgPath, color: defaultColor },
      ];
      const defaultOffset = withOffsetSurfaceDimensions<MotifOffset>(
        {
          xPos: 0,
          yPos: 0,
          scale: 1,
          rotationZ: 0,
          heightMm: defaultHeightMm,
          target,
          coordinateSpace: 'offset',
          flipX: false,
          flipY: false,
          layer: getNextDesignLayer(s),
        },
        target,
        s,
        true,
      );
      const newOffsets = { ...s.motifOffsets, [id]: defaultOffset };
      return {
        selectedMotifs: newMotifs,
        motifOffsets: newOffsets,
        selectedMotifId: id, // Auto-select the newly added motif
        selectedInscriptionId: null,
        selectedAdditionId: null,
        selectedImageId: null,
        selectedEmblemId: null,
        selected: null,
        activePanel: 'motif', // Open the edit panel instead of closing
      };
    });
    // Calculate cost after adding
    setTimeout(() => state.calculateMotifCost(), 0);
  },
  removeMotif: (id) => {
    set((s) => {
      const updatedOffsets = { ...s.motifOffsets };
      delete updatedOffsets[id];
      const isActiveMotif = s.selectedMotifId === id;
      return {
        selectedMotifs: s.selectedMotifs.filter((m) => m.id !== id),
        motifOffsets: updatedOffsets,
        selectedMotifId: isActiveMotif ? null : s.selectedMotifId,
        activePanel: isActiveMotif ? null : s.activePanel,
      };
    });
    // Calculate cost after removing
    setTimeout(() => get().calculateMotifCost(), 0);
  },
  setMotifColor: (id, color) => {
    set((s) => ({
      selectedMotifs: s.selectedMotifs.map((m) =>
        m.id === id ? { ...m, color } : m,
      ),
    }));
    // Recalculate cost when color changes
    setTimeout(() => get().calculateMotifCost(), 0);
  },

  setSelectedMotifId: (id) => {
    set({ selectedMotifId: id });
    if (id) {
      // Close other panels when opening motif panel
      set({
        activePanel: 'motif',
        selectedInscriptionId: null, // Deselect any inscription
        selectedAdditionId: null, // Deselect any addition
        selectedImageId: null, // Deselect any image
        selectedEmblemId: null, // Deselect any emblem
        selected: null, // Deselect headstone/base
      });
      // Navigate to select-motifs page only on mobile to keep canvas visible on desktop
      const { navTo } = get();
      if (navTo && !isDesktopViewport()) {
        const currentPath =
          typeof window !== 'undefined' ? window.location.pathname : '';
        if (currentPath !== '/select-motifs') {
          navTo('/select-motifs');
        }
      }
    } else {
      // If deselecting and this is the active panel, close it
      const state = get();
      if (state.activePanel === 'motif') {
        set({ activePanel: null });
      }
    }
  },

  setMotifRef: (id, ref) =>
    set((s) => ({ motifRefs: { ...s.motifRefs, [id]: ref } })),
  setMotifOffset: (id: string, offset: Partial<MotifOffset>) => {
    set((s) => {
      const previous = s.motifOffsets[id];
      const surface = offset.target ?? previous?.target ?? 'headstone';
      const shouldRefreshDims =
        offset.target !== undefined ||
        offset.xPos !== undefined ||
        offset.yPos !== undefined ||
        !previous?.baseWidthMm ||
        !previous?.baseHeightMm;
      const nextOffset = withOffsetSurfaceDimensions<MotifOffset>(
        { ...previous, ...offset, target: surface },
        surface,
        s,
        shouldRefreshDims,
      );
      return { motifOffsets: { ...s.motifOffsets, [id]: nextOffset } };
    });
    // Recalculate cost when height changes
    setTimeout(() => get().calculateMotifCost(), 0);
  },
  duplicateMotif: (id: string) => {
    const { selectedMotifs, motifOffsets } = get();

    // Find the motif with this ID
    const motif = selectedMotifs.find((m) => m.id === id);
    if (!motif) return;

    // Generate a unique instance ID for the duplicate
    const newId = genMotifId();

    // Add the duplicate
    set((s) => ({
      selectedMotifs: [
        ...s.selectedMotifs,
        { id: newId, svgPath: motif.svgPath, color: motif.color },
      ],
    }));

    // Get the current offset for the original
    const currentOffset = motifOffsets[id];

    if (currentOffset) {
      set((s) => {
        const surface = currentOffset.target ?? 'headstone';
        const ledgerShiftX = Math.max(
          Math.min(((s.ledgerWidthMm ?? 1000) / 1000) * 0.1, 0.15),
          0.02,
        );
        const ledgerShiftZ = Math.max(
          Math.min(((s.ledgerDepthMm ?? 2000) / 1000) * 0.1, 0.15),
          0.02,
        );
        const deltaX = surface === 'ledger' ? ledgerShiftX : 30;
        const deltaY = surface === 'ledger' ? ledgerShiftZ : 30;
        const duplicatedOffset = withOffsetSurfaceDimensions<MotifOffset>(
          {
            ...currentOffset,
            xPos: (currentOffset.xPos ?? 0) + deltaX,
            yPos: (currentOffset.yPos ?? 0) + deltaY,
            layer: getNextDesignLayer(s),
          },
          surface,
          s,
        );
        return {
          motifOffsets: { ...s.motifOffsets, [newId]: duplicatedOffset },
          selectedMotifId: newId,
          selectedInscriptionId: null,
          selectedAdditionId: null,
          selectedImageId: null,
          selectedEmblemId: null,
          selected: null,
          activePanel: 'motif',
        };
      });
    }
  },
});
