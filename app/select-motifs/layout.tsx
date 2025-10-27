'use client';

import React, { useEffect } from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';
import MotifOverlayPanel from '#/components/MotifOverlayPanel';

export default function Layout({ children }: { children: React.ReactNode }) {
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);
  const selectedMotifId = useHeadstoneStore((s) => s.selectedMotifId);
  const activePanel = useHeadstoneStore((s) => s.activePanel);
  
  // Open motifs panel when this route mounts
  useEffect(() => {
    setActivePanel('motifs');
    
    // Cleanup: close panel when navigating away
    return () => {
      setActivePanel(null);
    };
  }, [setActivePanel]);
  
  // Hide the selection overlay when a motif is selected for editing
  const shouldShowSelection = !selectedMotifId || activePanel !== 'motif';
  
  return (
    <div className="relative w-full">
      {shouldShowSelection && <MotifOverlayPanel />}
      {children}
    </div>
  );
}
