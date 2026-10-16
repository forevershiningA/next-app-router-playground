import type { StateCreator } from 'zustand';
import {
  DEFAULT_EMBLEM_SIZE_VARIANT,
  EMBLEM_SIZES,
} from '#/app/_internal/_emblems-loader';
import type { HeadstoneState } from '#/lib/headstone-store.types';
import { getNextDesignLayer } from '#/lib/headstone-store/layer-utils';
import { withOffsetSurfaceDimensions } from '#/lib/headstone-store/surface-dimensions';

type EmblemOffset = HeadstoneState['emblemOffsets'][string];
type EmblemSlice = Pick<
  HeadstoneState,
  | 'selectedEmblems'
  | 'selectedEmblemId'
  | 'emblemRefs'
  | 'emblemOffsets'
  | 'setSelectedEmblemId'
  | 'setEmblemRef'
  | 'addEmblem'
  | 'removeEmblem'
  | 'duplicateEmblem'
  | 'setEmblemOffset'
>;

const genEmblemId = () => `emblem-${crypto.randomUUID()}`;

export const createEmblemSlice: StateCreator<
  HeadstoneState,
  [],
  [],
  EmblemSlice
> = (set, get) => ({
  selectedEmblems: [],
  selectedEmblemId: null,
  setSelectedEmblemId: (id) => {
    set({ selectedEmblemId: id });
    if (id) {
      set({
        selectedInscriptionId: null,
        selectedAdditionId: null,
        selectedMotifId: null,
        selectedImageId: null,
        selected: null,
        activePanel: 'emblem' as const,
      });
    }
  },
  emblemRefs: {},
  setEmblemRef: (id, ref) =>
    set((s) => ({ emblemRefs: { ...s.emblemRefs, [id]: ref } })),
  emblemOffsets: {},
  addEmblem: (emblemId, imageUrl) => {
    const id = genEmblemId();
    const state = get();
    const { selected } = state;
    const target: 'headstone' | 'base' | 'ledger' =
      selected === 'base'
        ? 'base'
        : selected === 'ledger'
          ? 'ledger'
          : 'headstone';
    const sizeEntry =
      EMBLEM_SIZES.find((s) => s.variant === DEFAULT_EMBLEM_SIZE_VARIANT) ??
      EMBLEM_SIZES[2];
    set((s) => {
      const defaultOffset = withOffsetSurfaceDimensions<EmblemOffset>(
        {
          xPos: 0,
          yPos: 0,
          sizeVariant: DEFAULT_EMBLEM_SIZE_VARIANT,
          rotationZ: 0,
          flipX: false,
          flipY: false,
          widthMm: sizeEntry.widthMm,
          heightMm: sizeEntry.heightMm,
          target,
          coordinateSpace: 'offset',
          layer: getNextDesignLayer(s),
        },
        target,
        s,
        true,
      );
      return {
        selectedEmblems: [...s.selectedEmblems, { id, emblemId, imageUrl }],
        emblemOffsets: { ...s.emblemOffsets, [id]: defaultOffset },
        selectedEmblemId: id,
        selectedInscriptionId: null,
        selectedAdditionId: null,
        selectedMotifId: null,
        selectedImageId: null,
        selected: null,
        activePanel: 'emblem' as const,
      };
    });
    setTimeout(() => get().calculateEmblemCost(), 0);
  },
  removeEmblem: (id) => {
    set((s) => {
      const updated = { ...s.emblemOffsets };
      delete updated[id];
      const isActive = s.selectedEmblemId === id;
      return {
        selectedEmblems: s.selectedEmblems.filter((e) => e.id !== id),
        emblemOffsets: updated,
        selectedEmblemId: isActive ? null : s.selectedEmblemId,
        activePanel: isActive ? null : s.activePanel,
      };
    });
    setTimeout(() => get().calculateEmblemCost(), 0);
  },
  duplicateEmblem: (id) => {
    const state = get();
    const emblem = state.selectedEmblems.find((e) => e.id === id);
    const currentOffset = state.emblemOffsets[id];
    if (!emblem || !currentOffset) return;
    const newId = genEmblemId();
    const deltaX = 20;
    const deltaY = 20;
    const surface = currentOffset.target ?? 'headstone';
    set((s) => {
      const duplicatedOffset = withOffsetSurfaceDimensions<EmblemOffset>(
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
        selectedEmblems: [
          ...s.selectedEmblems,
          { id: newId, emblemId: emblem.emblemId, imageUrl: emblem.imageUrl },
        ],
        emblemOffsets: { ...s.emblemOffsets, [newId]: duplicatedOffset },
        selectedEmblemId: newId,
        selectedInscriptionId: null,
        selectedAdditionId: null,
        selectedMotifId: null,
        selectedImageId: null,
        selected: null,
        activePanel: 'emblem' as const,
      };
    });
    setTimeout(() => get().calculateEmblemCost(), 0);
  },
  setEmblemOffset: (id, offset) => {
    set((s) => {
      const previous = s.emblemOffsets[id];
      if (!previous) return {};
      const surface = offset.target ?? previous.target ?? 'headstone';
      const shouldRefreshDims =
        offset.target !== undefined && offset.target !== previous.target;
      const nextOffset = withOffsetSurfaceDimensions<EmblemOffset>(
        { ...previous, ...offset, target: surface },
        surface,
        s,
        shouldRefreshDims,
      );
      return { emblemOffsets: { ...s.emblemOffsets, [id]: nextOffset } };
    });
  },
});
