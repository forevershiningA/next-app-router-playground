'use client';

import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export function useSelectSizePanelOpener() {
  const router = useRouter();
  const pathname = usePathname();

  return useCallback(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('openFullscreenPanel', {
          detail: { panel: 'select-size' },
        }),
      );
    }

    if (pathname !== '/select-size') {
      router.push('/select-size');
    }
  }, [pathname, router]);
}
