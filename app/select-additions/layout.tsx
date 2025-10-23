'use client';

import React from 'react';
import SceneOverlayController from '#/components/SceneOverlayController';
import { useHeadstoneStore } from '#/lib/headstone-store';

export default function Layout({ children }: { children: React.ReactNode }) {
  const activePanel = useHeadstoneStore((s) => s.activePanel);
  const setSelectedAdditionId = useHeadstoneStore((s) => s.setSelectedAdditionId);
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);
  
  // Close addition panel when this panel mounts
  React.useEffect(() => {
    if (activePanel === 'addition') {
      setSelectedAdditionId(null);
      setActivePanel(null);
    }
  }, []); // Run once on mount
  
  return (
    <div className="relative w-full">
      <SceneOverlayController section="additions" title="Select Additions">
        {children}
      </SceneOverlayController>
    </div>
  );
}
