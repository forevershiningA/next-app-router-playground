'use client';

import React, { useEffect } from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';

export default function Layout({ children }: { children: React.ReactNode }) {
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);
  
  // Open motifs panel when this route mounts
  useEffect(() => {
    setActivePanel('motifs');
    
    // Cleanup: close panel when navigating away
    return () => {
      setActivePanel(null);
    };
  }, [setActivePanel]);
  
  return (
    <div className="relative w-full">
      {children}
    </div>
  );
}
