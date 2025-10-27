'use client';

import React from 'react';
import SceneOverlayController from '#/components/SceneOverlayController';
import { useHeadstoneStore } from '#/lib/headstone-store';

export default function Layout({ children }: { children: React.ReactNode }) {
  const activePanel = useHeadstoneStore((s) => s.activePanel);
  const setSelectedAdditionId = useHeadstoneStore((s) => s.setSelectedAdditionId);
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);
  const selectedAdditionId = useHeadstoneStore((s) => s.selectedAdditionId);
  
  // Close addition panel when this panel mounts
  React.useEffect(() => {
    if (activePanel === 'addition') {
      setSelectedAdditionId(null);
      setActivePanel(null);
    }
  }, []); // Run once on mount

  // Hide the selection list when an addition is selected for editing
  const shouldHideList = selectedAdditionId && activePanel === 'addition';

  // Hide this panel when addition (edit mode), motif, or inscription panels are active
  const isOpen = activePanel !== 'addition' && activePanel !== 'motif' && activePanel !== 'inscription';

  return (
    <SceneOverlayController section="additions" title="Select Additions" isOpen={isOpen}>
      {!shouldHideList && children}
    </SceneOverlayController>
  );
}
