'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';

export function useDesignerPanelLoadingState(
  pathname: string | null,
  activeFullscreenPanel: string | null,
) {
  const [isLoadingPanel, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setIsLoadingPanel = useCallback((loading: boolean) => {
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = null;
    setLoading(loading);
    if (loading) {
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        setLoading(false);
      }, 300);
    }
  }, []);

  useLayoutEffect(() => {
    setIsLoadingPanel(true);
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, [pathname, activeFullscreenPanel, setIsLoadingPanel]);

  return { isLoadingPanel, setIsLoadingPanel };
}
