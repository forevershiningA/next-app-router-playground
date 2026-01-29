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
 * DISABLED - Design loading now triggered manually via "Load Design" button
 */
export default function DefaultDesignLoader() {
  // Automatic loading disabled - headstone starts empty
  // Design can be loaded via the "Load Design" button in the canvas overlay
  return null;
}

/**
 * Hook to load the default canonical design programmatically
 * Used by the "Load Design" button
 */
export function useLoadDefaultDesign() {
  const loadedRef = useRef(false);

  const loadDesign = async () => {
    if (loadedRef.current) {
      console.log('[useLoadDefaultDesign] Design already loaded this session');
      return { success: false, message: 'Design already loaded' };
    }

    const canonicalDesignUrl = `/canonical-designs/${DEFAULT_CANONICAL_DESIGN_VERSION}/${DEFAULT_DESIGN_ID}.json`;

    try {
      console.log('[useLoadDefaultDesign] Loading canonical design:', DEFAULT_DESIGN_ID);
      
      const response = await fetch(canonicalDesignUrl, { cache: 'no-cache' });
      if (!response.ok) {
        console.warn('[useLoadDefaultDesign] Failed to fetch canonical design:', response.status);
        return { success: false, message: 'Failed to fetch design' };
      }

      const canonicalData: CanonicalDesignData = await response.json();
      
      await loadCanonicalDesignIntoEditor(canonicalData, { clearExisting: true });
      
      loadedRef.current = true;
      console.log('[useLoadDefaultDesign] Successfully loaded canonical design');
      return { success: true, message: 'Design loaded successfully' };
    } catch (error) {
      console.error('[useLoadDefaultDesign] Error loading canonical design:', error);
      return { success: false, message: 'Error loading design' };
    }
  };

  return { loadDesign, isLoaded: loadedRef.current };
}
