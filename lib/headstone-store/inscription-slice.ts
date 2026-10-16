import React from 'react';
import type { StateCreator } from 'zustand';
import { Box3, Vector3 } from 'three';
import type { Group } from 'three';
import type {
  HeadstoneState,
  Line,
  LinePatch,
} from '#/lib/headstone-store.types';
import { normalizeThreeColorValue } from '#/lib/headstone-store/color-utils';
import {
  clampInscriptionRotation,
  clampInscriptionSize,
} from '#/lib/headstone-store.types';
import { getDefaultInscriptionFont } from '#/lib/stencil-fonts';
import { getNextDesignLayer } from '#/lib/headstone-store/layer-utils';
import {
  normalizeLineDimensions,
  withLineSurfaceDimensions,
} from '#/lib/headstone-store/surface-dimensions';

type InscriptionSlice = Pick<
  HeadstoneState,
  | 'inscriptions'
  | 'showInscriptionColor'
  | 'inscriptionPriceModel'
  | 'selectedInscriptionId'
  | 'activeInscriptionText'
  | 'inscriptionMinHeight'
  | 'inscriptionMaxHeight'
  | 'inscriptionInitHeight'
  | 'fontLoading'
  | 'setInscriptions'
  | 'addInscriptionLine'
  | 'updateInscription'
  | 'duplicateInscription'
  | 'deleteInscription'
  | 'setSelectedInscriptionId'
  | 'setActiveInscriptionText'
  | 'setInscriptionHeightLimits'
  | 'setFontLoading'
>;

const genId = () => `l-${crypto.randomUUID()}`;

export const createInscriptionSlice: StateCreator<
  HeadstoneState,
  [],
  [],
  InscriptionSlice
> = (set, get) => ({
  inscriptions: [],
  showInscriptionColor: true,
  inscriptionPriceModel: null,
  selectedInscriptionId: null,
  activeInscriptionText: '',
  inscriptionMinHeight: 5,
  inscriptionMaxHeight: 1200,
  inscriptionInitHeight: 30,
  fontLoading: false,
  setInscriptions: (inscriptions) => {
    if (typeof inscriptions === 'function') {
      set((s) => ({
        inscriptions: normalizeLineDimensions(inscriptions(s.inscriptions), s),
      }));
    } else {
      set((s) => ({ inscriptions: normalizeLineDimensions(inscriptions, s) }));
    }
    get().calculateInscriptionCost();
  },

  addInscriptionLine: (patch: LinePatch = {}) => {
    const id = genId();
    const state = get();

    const text = patch.text ?? 'New line';
    const font =
      patch.font ?? getDefaultInscriptionFont(state.productId, state.catalog);
    const sizeMm = clampInscriptionSize(
      patch.sizeMm ?? state.inscriptionInitHeight ?? state.inscriptionMinHeight,
    );
    const rotationDeg = clampInscriptionRotation(patch.rotationDeg ?? 0);
    const xPos = patch.xPos ?? 0;
    const yPos = patch.yPos ?? 0;

    // Determine color: use catalog defaultColor if available, otherwise use hardcoded defaults
    let color: string;
    if (state.showInscriptionColor === false) {
      color = normalizeThreeColorValue(
        state.catalog?.product.defaultColor ?? '#ffffff',
      );
    } else {
      color = normalizeThreeColorValue(
        patch.color ?? state.catalog?.product.defaultColor ?? '#c99d44',
      );
    }

    // Set target based on currently selected object (headstone or base)
    const target: 'headstone' | 'base' | 'ledger' =
      state.selected === 'base'
        ? 'base'
        : state.selected === 'ledger'
          ? 'ledger'
          : 'headstone';

    const newLine: Line = {
      id,
      text,
      font,
      sizeMm,
      rotationDeg,
      xPos,
      yPos,
      color,
      target,
      textAlign: patch.textAlign ?? 'center',
      layer: getNextDesignLayer(state),
      ref: React.createRef<Group>(),
    };
    const normalizedLine = withLineSurfaceDimensions(
      newLine,
      target,
      state,
      true,
    );

    set((s) => ({
      inscriptions: [...s.inscriptions, normalizedLine],
      selectedInscriptionId: id,
      activeInscriptionText: normalizedLine.text,
      selected: null,
      selectedAdditionId: null,
      selectedMotifId: null,
      selectedImageId: null,
      selectedEmblemId: null,
      activePanel: 'inscription',
    }));
    state.calculateInscriptionCost();
    return id;
  },

  updateInscription: (id, patch) => {
    set((s) => ({
      inscriptions: s.inscriptions.map((l) => {
        if (l.id !== id) return l;
        const nextTarget = patch.target ?? l.target ?? 'headstone';
        const updatedLine: Line = {
          ...l,
          ...patch,
          sizeMm:
            patch.sizeMm !== undefined
              ? clampInscriptionSize(patch.sizeMm)
              : l.sizeMm,
          rotationDeg:
            patch.rotationDeg !== undefined
              ? clampInscriptionRotation(patch.rotationDeg)
              : l.rotationDeg,
        };
        const needsDimensions =
          patch.target !== undefined ||
          patch.xPos !== undefined ||
          patch.yPos !== undefined ||
          !updatedLine.baseWidthMm ||
          !updatedLine.baseHeightMm;
        return withLineSurfaceDimensions(
          updatedLine,
          nextTarget,
          s,
          needsDimensions,
        );
      }),
    }));
    get().calculateInscriptionCost();
  },

  duplicateInscription: (id) => {
    const src = get().inscriptions.find((l) => l.id === id);
    if (!src) return '';
    const newId = genId();

    let offset: number;

    if (src.target === 'ledger') {
      // For ledger: yPos is fractional (-0.5 to +0.5). Convert text height to fractional
      // using the stored ledger depth so the duplicate appears one line-height away.
      // +offset moves toward the foot (visually "below" when viewing ledger from above).
      const ledgerDepthMm = src.baseHeightMm || get().ledgerDepthMm || 400;
      offset = (src.sizeMm + 5) / ledgerDepthMm;
    } else {
      // Headstone / base: yPos is stored in the surface's local units, so convert any
      // measured world-space height back into that local space before applying it.
      const fallbackGapMm = Math.max(2, Math.round(src.sizeMm * 0.08));
      const fallbackGapLocal =
        src.target === 'base'
          ? fallbackGapMm
          : Math.max(1, Math.round(fallbackGapMm / 10));
      offset =
        src.target === 'base'
          ? src.sizeMm + fallbackGapMm
          : src.sizeMm / 10 + 5;

      const rendered = src.ref.current;
      if (rendered) {
        rendered.updateWorldMatrix(true, true);
        const bounds = new Box3().setFromObject(rendered);
        const renderedWorldHeight = bounds.max.y - bounds.min.y;
        const renderedWorldScale = new Vector3();
        rendered.getWorldScale(renderedWorldScale);
        const localScaleY =
          Math.abs(renderedWorldScale.y) > 1e-6
            ? Math.abs(renderedWorldScale.y)
            : 1;
        const renderedLocalHeight = renderedWorldHeight / localScaleY;

        if (Number.isFinite(renderedLocalHeight) && renderedLocalHeight > 0) {
          offset = renderedLocalHeight + fallbackGapLocal;
        }
      }
    }

    set((s) => ({
      inscriptions: [
        ...s.inscriptions,
        {
          ...src,
          id: newId,
          ref: React.createRef<Group>(),
          yPos: src.target === 'ledger' ? src.yPos + offset : src.yPos - offset,
          layer: getNextDesignLayer(s),
        },
      ],
      selectedInscriptionId: newId,
      activeInscriptionText: src.text,
      selected: null,
      selectedAdditionId: null,
      selectedMotifId: null,
      selectedImageId: null,
      selectedEmblemId: null,
      activePanel: 'inscription',
    }));
    get().calculateInscriptionCost();
    return newId;
  },

  deleteInscription: (id) => {
    set((s) => {
      const rest = s.inscriptions.filter((l) => l.id !== id);
      const next = rest[0]?.id ?? null;
      return { inscriptions: rest, selectedInscriptionId: next };
    });
    get().calculateInscriptionCost();
  },

  setSelectedInscriptionId: (id) => {
    if (id === get().selectedInscriptionId) return;

    if (!id) {
      set({ selectedInscriptionId: null, activeInscriptionText: '' });
      return;
    }

    const line = get().inscriptions.find((l) => l.id === id);
    if (line) {
      set({
        selectedInscriptionId: id,
        activeInscriptionText: line.text,
        selectedMotifId: null, // Deselect any motif
        selectedAdditionId: null, // Deselect any addition
        selectedImageId: null, // Deselect any image
        selectedEmblemId: null, // Deselect any emblem
        selected: null, // Deselect headstone/base
        activePanel: 'inscription', // Set active panel to inscription
      });
    } else {
      set({
        selectedInscriptionId: id,
        activeInscriptionText: '',
        selectedMotifId: null, // Deselect any motif
        selectedAdditionId: null, // Deselect any addition
        selectedImageId: null, // Deselect any image
        selectedEmblemId: null, // Deselect any emblem
        selected: null, // Deselect headstone/base
        activePanel: 'inscription', // Set active panel to inscription
      });
    }
    get().calculateInscriptionCost();
  },

  setActiveInscriptionText: (activeInscriptionText) =>
    set({ activeInscriptionText }),

  setInscriptionHeightLimits: (min, max) =>
    set({ inscriptionMinHeight: min, inscriptionMaxHeight: max }),

  setFontLoading: (fontLoading) => set({ fontLoading }),
});
