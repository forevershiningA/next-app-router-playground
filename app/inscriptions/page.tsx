'use client';

import { useEffect } from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';

export default function InscriptionsPage() {
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);

  useEffect(() => {
    // Open the inscriptions panel
    console.log('[InscriptionsPage] Setting activePanel to inscription');
    setActivePanel('inscription');
    
    // Don't navigate away - stay on /inscriptions so panel remains open
  }, [setActivePanel]);

  return null;
}
