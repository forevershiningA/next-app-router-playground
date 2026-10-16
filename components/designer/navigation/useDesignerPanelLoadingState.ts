'use client';

import { useLayoutEffect, useState } from 'react';

export function useDesignerPanelLoadingState(
  pathname: string | null,
  activeFullscreenPanel: string | null,
) {
  const [isLoadingPanel, setIsLoadingPanel] = useState(false);

  useLayoutEffect(() => {
    setIsLoadingPanel(true);
    const timer = setTimeout(() => setIsLoadingPanel(false), 300);
    return () => clearTimeout(timer);
  }, [pathname, activeFullscreenPanel]);

  return { isLoadingPanel, setIsLoadingPanel };
}
