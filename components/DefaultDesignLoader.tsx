'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { loadCanonicalDesignIntoEditor, DEFAULT_CANONICAL_DESIGN_VERSION, type CanonicalDesignData } from '#/lib/saved-design-loader-utils';
import { useHeadstoneStore } from '#/lib/headstone-store';

const DEFAULT_DESIGN_ID = '1725769905504';

// Routes where we should attempt to load the default design
const DESIGNER_ROUTES = [
  '/select-size',
  '/select-material', 
  '/inscriptions',
  '/select-additions',
  '/select-motifs',
];

/**
 * Component that loads the default canonical design on first designer visit
 * Only loads once per session when user first accesses a designer page
 */
export default function DefaultDesignLoader() {
  const loadedRef = useRef(false);
  const pathname = usePathname();
  const productId = useHeadstoneStore((state) => state.productId);
  const inscriptions = useHeadstoneStore((state) => state.inscriptions);

  useEffect(() => {
    // Check if we're on a designer page
    const isDesignerPage = DESIGNER_ROUTES.some(route => pathname?.startsWith(route));
    
    // Only load if:
    // 1. Not already loaded this session
    // 2. We're on a designer page
    // 3. No inscriptions exist yet (empty state)
    if (loadedRef.current || !isDesignerPage || inscriptions.length > 0) {
      console.log('[DefaultDesignLoader] Skipping load:', {
        alreadyLoaded: loadedRef.current,
        isDesignerPage,
        hasInscriptions: inscriptions.length > 0
      });
      return;
    }

    loadedRef.current = true;

    const canonicalDesignUrl = `/canonical-designs/${DEFAULT_CANONICAL_DESIGN_VERSION}/${DEFAULT_DESIGN_ID}.json`;

    (async () => {
      try {
        console.log('[DefaultDesignLoader] Loading canonical design:', DEFAULT_DESIGN_ID);
        
        const response = await fetch(canonicalDesignUrl, { cache: 'no-cache' }); // Force fresh fetch
        if (!response.ok) {
          console.warn('[DefaultDesignLoader] Failed to fetch canonical design:', response.status);
          loadedRef.current = false; // Reset so it can retry
          return;
        }

        const canonicalData: CanonicalDesignData = await response.json();
        
        await loadCanonicalDesignIntoEditor(canonicalData, { clearExisting: true });
        
        console.log('[DefaultDesignLoader] Successfully loaded canonical design');
      } catch (error) {
        console.error('[DefaultDesignLoader] Error loading canonical design:', error);
        loadedRef.current = false; // Reset so it can retry
      }
    })();
  }, [pathname, productId, inscriptions]);

  // This component doesn't render anything
  return null;
}
