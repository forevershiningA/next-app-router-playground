import { useCallback, useEffect, useRef, useState } from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';

type PanelSource = 'menu' | 'canvas' | null;
interface UseDesignerNavPanelStateOptions {
  designerStepSlug: string | null;
}

export function useDesignerNavPanelState({
  designerStepSlug,
}: UseDesignerNavPanelStateOptions) {
  const setActivePanel = useHeadstoneStore((state) => state.setActivePanel);
  const selectedAdditionId = useHeadstoneStore(
    (state) => state.selectedAdditionId,
  );
  const selectedMotifId = useHeadstoneStore((state) => state.selectedMotifId);
  const setSelectedAdditionId = useHeadstoneStore(
    (state) => state.setSelectedAdditionId,
  );
  const setSelectedMotifId = useHeadstoneStore(
    (state) => state.setSelectedMotifId,
  );
  const [activeFullscreenPanel, setActiveFullscreenPanel] = useState<
    string | null
  >(null);
  const [dismissedPanelSlug, setDismissedPanelSlug] = useState<string | null>(
    null,
  );
  const [panelSource, setPanelSource] = useState<PanelSource>(null);
  const [forceAdditionCatalog, setForceAdditionCatalog] = useState(false);
  const [forceMotifCatalog, setForceMotifCatalog] = useState(false);
  const activeFullscreenPanelRef = useRef<string | null>(null);
  activeFullscreenPanelRef.current = activeFullscreenPanel;

  useEffect(() => {
    const handleOpenPanel = (event: Event) => {
      const customEvent = event as CustomEvent<{ panel: string }>;
      const panelSlug = customEvent.detail.panel;
      setActiveFullscreenPanel(panelSlug);
      setDismissedPanelSlug(null);
      setPanelSource((previous) => {
        if (
          panelSlug === 'select-additions' &&
          previous === 'menu' &&
          activeFullscreenPanelRef.current === 'select-additions'
        ) {
          return previous;
        }
        return 'canvas';
      });
    };
    window.addEventListener('openFullscreenPanel', handleOpenPanel);
    return () =>
      window.removeEventListener('openFullscreenPanel', handleOpenPanel);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !designerStepSlug) return;

    const pendingPanel = sessionStorage.getItem(
      'designer:pending-fullscreen-panel',
    );
    if (pendingPanel !== designerStepSlug) return;

    sessionStorage.removeItem('designer:pending-fullscreen-panel');
    setActiveFullscreenPanel(pendingPanel);
    setDismissedPanelSlug(null);
    setPanelSource('canvas');
  }, [designerStepSlug]);

  const openFullscreenPanel = useCallback(
    (slug: string) => {
      setDismissedPanelSlug(null);
      setPanelSource('menu');
      if (slug === 'inscriptions') setActivePanel('inscription');
      setActiveFullscreenPanel(slug);
    },
    [setActivePanel],
  );

  const closeFullscreenPanel = useCallback(() => {
    if (
      activeFullscreenPanel === 'inscriptions' ||
      activeFullscreenPanel === 'select-additions' ||
      activeFullscreenPanel === 'select-motifs' ||
      activeFullscreenPanel === 'select-images'
    ) {
      setActivePanel(null);
    }
    const slugToDismiss = designerStepSlug || activeFullscreenPanel;
    if (slugToDismiss) setDismissedPanelSlug(slugToDismiss);
    setActiveFullscreenPanel(null);
    setPanelSource(null);
  }, [activeFullscreenPanel, designerStepSlug, setActivePanel]);

  const handleBackToAdditionList = useCallback(() => {
    setForceAdditionCatalog(true);
    setSelectedAdditionId(null);
    setActivePanel('addition');
  }, [setActivePanel, setSelectedAdditionId]);

  const handleBackToMotifList = useCallback(() => {
    setForceMotifCatalog(true);
    setSelectedMotifId(null);
    setActivePanel('motif');
  }, [setActivePanel, setSelectedMotifId]);

  const closePanelHandlerRef = useRef(closeFullscreenPanel);
  closePanelHandlerRef.current = closeFullscreenPanel;

  useEffect(() => {
    const handleClosePanel = () => closePanelHandlerRef.current();
    window.addEventListener('closeFullscreenPanel', handleClosePanel);
    return () =>
      window.removeEventListener('closeFullscreenPanel', handleClosePanel);
  }, []);

  useEffect(() => {
    if (activeFullscreenPanel !== 'select-additions') {
      setForceAdditionCatalog(false);
    }
    if (activeFullscreenPanel !== 'select-motifs') {
      setForceMotifCatalog(false);
    }
  }, [activeFullscreenPanel]);

  useEffect(() => {
    if (selectedAdditionId) setForceAdditionCatalog(false);
  }, [selectedAdditionId]);

  useEffect(() => {
    if (selectedMotifId) setForceMotifCatalog(false);
  }, [selectedMotifId]);

  return {
    activeFullscreenPanel,
    setActiveFullscreenPanel,
    dismissedPanelSlug,
    setDismissedPanelSlug,
    panelSource,
    setPanelSource,
    forceAdditionCatalog,
    forceMotifCatalog,
    openFullscreenPanel,
    closeFullscreenPanel,
    handleBackToAdditionList,
    handleBackToMotifList,
  };
}
