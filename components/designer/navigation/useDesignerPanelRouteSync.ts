import { useEffect, useRef } from 'react';
import type { Part } from '#/lib/headstone-store.types';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { fullscreenPanelSlugs } from '#/components/designer/navigation/designer-navigation-config';

type SetPanelSource = (source: 'menu' | 'canvas' | null) => void;

interface UseDesignerPanelRouteSyncOptions {
  pathname: string;
  designerStepSlug: string | null;
  isCanvasVisible: boolean;
  isPlaque: boolean;
  activeFullscreenPanel: string | null;
  dismissedPanelSlug: string | null;
  panelSource: 'menu' | 'canvas' | null;
  setActiveFullscreenPanel: (panel: string | null) => void;
  setDismissedPanelSlug: (slug: string | null) => void;
  setPanelSource: SetPanelSource;
}

export function useDesignerPanelRouteSync({
  pathname,
  designerStepSlug,
  isCanvasVisible,
  isPlaque,
  activeFullscreenPanel,
  dismissedPanelSlug,
  panelSource,
  setActiveFullscreenPanel,
  setDismissedPanelSlug,
  setPanelSource,
}: UseDesignerPanelRouteSyncOptions) {
  const activePanelFromStore = useHeadstoneStore((state) => state.activePanel);
  const setActivePanel = useHeadstoneStore((state) => state.setActivePanel);
  const selectedInscriptionId = useHeadstoneStore(
    (state) => state.selectedInscriptionId,
  );
  const setSelectedInscriptionId = useHeadstoneStore(
    (state) => state.setSelectedInscriptionId,
  );
  const selectedImageId = useHeadstoneStore((state) => state.selectedImageId);
  const selectedMotifId = useHeadstoneStore((state) => state.selectedMotifId);
  const selectedAdditionId = useHeadstoneStore(
    (state) => state.selectedAdditionId,
  );
  const selected = useHeadstoneStore((state) => state.selected);
  const editingObject = useHeadstoneStore((state) => state.editingObject);
  const setEditingObject = useHeadstoneStore((state) => state.setEditingObject);
  const setSelected = useHeadstoneStore((state) => state.setSelected);
  const didApplyInitialInscriptionTargetRef = useRef(false);
  const previousPathnameRef = useRef(pathname);

  useEffect(() => {
    const pathnameChanged = previousPathnameRef.current !== pathname;
    previousPathnameRef.current = pathname;
    if (!isCanvasVisible) {
      if (activeFullscreenPanel) {
        if (
          activeFullscreenPanel === 'inscriptions' ||
          activeFullscreenPanel === 'select-additions' ||
          activeFullscreenPanel === 'select-motifs' ||
          activeFullscreenPanel === 'select-images'
        ) {
          setActivePanel(null);
        }
        setActiveFullscreenPanel(null);
        setPanelSource(null);
      }
      return;
    }

    if (panelSource === 'canvas' && activeFullscreenPanel) return;

    if (
      activeFullscreenPanel === 'select-shape' &&
      designerStepSlug !== 'select-shape' &&
      !pathnameChanged
    ) {
      // Keep the shape overlay on its current route, but let a new route
      // replace it when the user selects another section.
      return;
    }

    const currentSlug = designerStepSlug ?? '';
    if (fullscreenPanelSlugs.has(currentSlug)) {
      if (
        activeFullscreenPanel !== currentSlug &&
        dismissedPanelSlug !== currentSlug
      ) {
        if (currentSlug === 'inscriptions') setActivePanel('inscription');
        setDismissedPanelSlug(null);
        setPanelSource('menu');
        setActiveFullscreenPanel(currentSlug);
      }
    } else {
      if (
        activeFullscreenPanel &&
        activeFullscreenPanel !== 'corners' &&
        activeFullscreenPanel !== 'holes'
      ) {
        if (
          activeFullscreenPanel === 'inscriptions' ||
          activeFullscreenPanel === 'select-additions' ||
          activeFullscreenPanel === 'select-motifs' ||
          activeFullscreenPanel === 'select-images'
        ) {
          setActivePanel(null);
        }
        setActiveFullscreenPanel(null);
        setPanelSource(null);
      }
      if (dismissedPanelSlug) setDismissedPanelSlug(null);
    }
  }, [
    pathname,
    designerStepSlug,
    isCanvasVisible,
    activeFullscreenPanel,
    dismissedPanelSlug,
    panelSource,
    setActivePanel,
    setActiveFullscreenPanel,
    setDismissedPanelSlug,
    setPanelSource,
  ]);

  useEffect(() => {
    if (
      designerStepSlug === 'select-border' &&
      isPlaque &&
      dismissedPanelSlug !== 'select-border' &&
      activeFullscreenPanel !== 'select-border'
    ) {
      setDismissedPanelSlug(null);
      setPanelSource('menu');
      setActiveFullscreenPanel('select-border');
    }
  }, [
    designerStepSlug,
    isPlaque,
    activeFullscreenPanel,
    dismissedPanelSlug,
    setDismissedPanelSlug,
    setPanelSource,
    setActiveFullscreenPanel,
  ]);

  useEffect(() => {
    if (designerStepSlug !== 'inscriptions') {
      didApplyInitialInscriptionTargetRef.current = false;
      return;
    }
    if (didApplyInitialInscriptionTargetRef.current) return;
    didApplyInitialInscriptionTargetRef.current = true;
    if (selectedInscriptionId) return;

    setEditingObject('headstone');
    setSelected('headstone');
  }, [designerStepSlug, selectedInscriptionId, setEditingObject, setSelected]);

  useEffect(() => {
    if (designerStepSlug === 'select-images' && selectedInscriptionId) {
      setSelectedInscriptionId(null);
    }
  }, [designerStepSlug, selectedInscriptionId, setSelectedInscriptionId]);

  useEffect(() => {
    const partValue: Part =
      editingObject === 'base'
        ? 'base'
        : editingObject === 'ledger'
          ? 'ledger'
          : editingObject === 'kerbset'
            ? 'kerbset'
            : 'headstone';
    if (
      selectedImageId ||
      selectedMotifId ||
      selectedAdditionId ||
      selectedInscriptionId
    ) {
      return;
    }
    if (designerStepSlug === 'select-size' && selected !== partValue) {
      setSelected(partValue);
    }
  }, [
    designerStepSlug,
    editingObject,
    selected,
    setSelected,
    selectedImageId,
    selectedMotifId,
    selectedAdditionId,
    selectedInscriptionId,
  ]);

  useEffect(() => {
    if (
      designerStepSlug === 'select-images' &&
      selectedImageId &&
      activePanelFromStore === 'image' &&
      activeFullscreenPanel !== 'select-images'
    ) {
      setActiveFullscreenPanel('select-images');
    }
  }, [
    designerStepSlug,
    selectedImageId,
    activePanelFromStore,
    activeFullscreenPanel,
    setActiveFullscreenPanel,
  ]);
}
