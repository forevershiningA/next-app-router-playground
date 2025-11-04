// app/designs/page.tsx
'use client';

import { useEffect } from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';

export default function DesignsPage() {
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);
  
  useEffect(() => {
    // Open the designs panel when this page loads
    setActivePanel('designs');
    
    // Clean up: close panel when component unmounts
    return () => {
      setActivePanel(null);
    };
  }, [setActivePanel]);

  return null;
}
