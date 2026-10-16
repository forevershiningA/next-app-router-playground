import type { StateCreator } from 'zustand';
import { data } from '#/app/_internal/_data';
import { normalizeAdditionBaseId } from '#/lib/addition-utils';
import type { AdditionKind, HeadstoneState } from '#/lib/headstone-store.types';
import { withOffsetSurfaceDimensions } from '#/lib/headstone-store/surface-dimensions';

type AdditionOffset = HeadstoneState['additionOffsets'][string];
type AdditionSlice = Pick<
  HeadstoneState,
  | 'selectedAdditions'
  | 'addAddition'
  | 'removeAddition'
  | 'hasStatue'
  | 'selectedAdditionId'
  | 'setSelectedAdditionId'
  | 'additionRefs'
  | 'setAdditionRef'
  | 'additionOffsets'
  | 'setAdditionOffset'
  | 'duplicateAddition'
>;

const isDesktopViewport = () =>
  typeof window !== 'undefined' && window.innerWidth >= 1024;

export const createAdditionSlice: StateCreator<
  HeadstoneState,
  [],
  [],
  AdditionSlice
> = (set, get) => ({
  // Start with empty additions - user can add via "Select Additions" panel
  selectedAdditions: [],
  addAddition: (id) => {
    const additionData = data.additions.find((a) => a.id === id);
    const additionType: AdditionKind =
      (additionData?.type as AdditionKind) ?? 'application';
    // Create a unique instance ID with timestamp
    const instanceId = `${id}_${Date.now()}`;
    set((s) => {
      // Use editingObject as primary (persists through panel navigation) with selected as fallback.
      // Only honor a surface when it is actually visible to avoid targeting hidden ledger/base meshes.
      const editTarget = s.editingObject;
      const wantsBase = editTarget === 'base' || s.selected === 'base';
      const wantsLedger = editTarget === 'ledger' || s.selected === 'ledger';
      const baseAvailable = s.showBase;
      const ledgerAvailable = s.showLedger;
      const prefersBaseSurface =
        additionType === 'statue' || additionType === 'vase';

      const fallbackSurface: 'headstone' | 'base' | 'ledger' =
        prefersBaseSurface && baseAvailable
          ? 'base'
          : prefersBaseSurface && !baseAvailable && ledgerAvailable
            ? 'ledger'
            : 'headstone';

      let targetSurface: 'headstone' | 'base' | 'ledger' = fallbackSurface;

      if (wantsLedger && ledgerAvailable) {
        targetSurface = 'ledger';
      } else if (wantsBase && baseAvailable) {
        targetSurface = 'base';
      } else if (wantsLedger && !ledgerAvailable && baseAvailable) {
        targetSurface = 'base';
      }
      const defaultOffset = withOffsetSurfaceDimensions<AdditionOffset>(
        {
          scale: 1,
          rotationZ: 0,
          sizeVariant: 1,
          targetSurface,
          zPos: undefined,
          additionType,
          assetFile: additionData?.file,
          sourceId: id,
          additionName: additionData?.name,
          zPosFinalized: false,
        },
        targetSurface,
        s,
        true,
      );
      return {
        selectedAdditions: [...s.selectedAdditions, instanceId],
        selectedAdditionId: instanceId,
        selectedInscriptionId: null,
        selectedMotifId: null,
        selectedImageId: null,
        selectedEmblemId: null,
        selected: null,
        activePanel: 'addition',
        additionOffsets: { ...s.additionOffsets, [instanceId]: defaultOffset },
      };
    });
    setTimeout(() => get().calculateAdditionCost(), 0);
  },
  removeAddition: (id) => {
    set((s) => {
      const newAdditions = s.selectedAdditions.filter((aid) => aid !== id);
      const newRefs = { ...s.additionRefs };
      delete newRefs[id];
      const newOffsets = { ...s.additionOffsets };
      delete newOffsets[id];

      return {
        selectedAdditions: newAdditions,
        additionRefs: newRefs,
        additionOffsets: newOffsets,
        selectedAdditionId:
          s.selectedAdditionId === id ? null : s.selectedAdditionId,
      };
    });
    setTimeout(() => get().calculateAdditionCost(), 0);
  },
  hasStatue: () => {
    const { selectedAdditions, additionOffsets } = get();
    // Check if any selected addition is a statue or vase
    return selectedAdditions.some((instanceId) => {
      if (
        (additionOffsets[instanceId]?.targetSurface ?? 'headstone') !== 'base'
      ) {
        return false;
      }
      const baseId = normalizeAdditionBaseId(instanceId);
      const addition = data.additions.find((a) => a.id === baseId);
      return addition?.type === 'statue' || addition?.type === 'vase';
    });
  },
  selectedAdditionId: null,
  additionRefs: {},
  additionOffsets: {},
  setSelectedAdditionId: (id) => {
    set({ selectedAdditionId: id });
    if (id) {
      // Close other panels when opening addition panel
      set({
        activePanel: 'addition',
        selectedInscriptionId: null, // Deselect any inscription
        selectedMotifId: null, // Deselect any motif
        selectedImageId: null, // Deselect any image
        selectedEmblemId: null, // Deselect any emblem
        selected: null, // Deselect headstone/base
      });
      // Navigate to select-additions page only when we're in mobile/compact layout
      const { navTo } = get();
      if (navTo && !isDesktopViewport()) {
        const currentPath =
          typeof window !== 'undefined' ? window.location.pathname : '';
        if (currentPath !== '/select-additions') {
          navTo('/select-additions');
        }
      }
    }
  },
  setAdditionRef: (id, ref) =>
    set((s) => ({ additionRefs: { ...s.additionRefs, [id]: ref } })),
  setAdditionOffset: (
    id: string,
    offset: {
      xPos?: number;
      yPos?: number;
      zPos?: number;
      scale?: number;
      rotationZ?: number;
      sizeVariant?: number;
      targetSurface?: 'headstone' | 'base' | 'ledger';
      additionType?: AdditionKind;
      assetFile?: string;
      sourceId?: string;
      additionName?: string;
      zPosFinalized?: boolean;
      footprintWidth?: number;
      baseWidthMm?: number;
      baseHeightMm?: number;
    },
  ) => {
    set((s) => {
      const previous = s.additionOffsets[id] ?? {};
      const surface =
        offset.targetSurface ?? previous.targetSurface ?? 'headstone';
      const shouldRefreshDims =
        offset.targetSurface !== undefined ||
        offset.xPos !== undefined ||
        offset.yPos !== undefined ||
        !previous.baseWidthMm ||
        !previous.baseHeightMm;
      const nextOffset = withOffsetSurfaceDimensions<AdditionOffset>(
        { ...previous, ...offset, targetSurface: surface },
        surface,
        s,
        shouldRefreshDims,
      );
      return { additionOffsets: { ...s.additionOffsets, [id]: nextOffset } };
    });
    setTimeout(() => get().calculateAdditionCost(), 0);
  },
  duplicateAddition: (id: string) => {
    const { additionOffsets } = get();
    const currentOffset = additionOffsets[id];
    if (!currentOffset) return;

    const baseId = normalizeAdditionBaseId(id);
    const instanceId = `${baseId}_${Date.now()}`;

    const surface = currentOffset.targetSurface ?? 'headstone';
    const isBase = surface === 'base';
    const isLedger = surface === 'ledger';
    const footprintWidth = currentOffset.footprintWidth;
    // footprintWidth is measured in world metres. Base addition offsets live
    // in the base mesh's local unit-cube space, so convert the desired
    // physical separation before applying it.
    const widthDelta =
      footprintWidth && footprintWidth > 0
        ? footprintWidth
        : isBase
          ? 0.12
          : 30;
    const margin = isBase ? Math.max(widthDelta * 0.25, 0.02) : 0;
    const ledgerShiftX = Math.max(
      Math.min(((get().ledgerWidthMm ?? 1000) / 1000) * 0.1, 0.2),
      0.02,
    );
    const ledgerShiftZ = Math.max(
      Math.min(((get().ledgerDepthMm ?? 2000) / 1000) * 0.1, 0.2),
      0.02,
    );
    const expandedBaseWidth = (get().baseWidthMm / 1000) * 1.3;
    const baseLocalShift =
      (widthDelta + margin) / Math.max(expandedBaseWidth, 1e-6);
    const deltaX = isLedger
      ? ledgerShiftX
      : isBase
        ? (currentOffset.xPos ?? 0) >= 0
          ? -baseLocalShift
          : baseLocalShift
        : 30;
    const deltaY = isLedger ? ledgerShiftZ : isBase ? 0 : 30;

    set((s) => {
      const duplicatedOffset = withOffsetSurfaceDimensions<AdditionOffset>(
        {
          ...currentOffset,
          xPos: (currentOffset.xPos ?? 0) + deltaX,
          yPos: (currentOffset.yPos ?? 0) + deltaY,
        },
        surface,
        s,
      );
      return {
        selectedAdditions: [...s.selectedAdditions, instanceId],
        additionOffsets: {
          ...s.additionOffsets,
          [instanceId]: duplicatedOffset,
        },
        selectedAdditionId: instanceId,
      };
    });
    setTimeout(() => get().calculateAdditionCost(), 0);
  },
});
