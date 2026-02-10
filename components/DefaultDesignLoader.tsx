'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { loadCanonicalDesignIntoEditor, DEFAULT_CANONICAL_DESIGN_VERSION, type CanonicalDesignData } from '#/lib/saved-design-loader-utils';
import { useHeadstoneStore } from '#/lib/headstone-store';

const DEFAULT_DESIGN_ID = '1725769905504';
const isDevEnvironment = process.env.NODE_ENV !== 'production';

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
 * Hook to load a specific canonical design programmatically
 * Used by the "Load Design" buttons
 * Always allows reloading - clears existing design each time
 */
export function useLoadDesign(designId: string) {
  const loadDesign = async () => {
    const canonicalDesignUrl = `/canonical-designs/${DEFAULT_CANONICAL_DESIGN_VERSION}/${designId}.json`;

    try {
      console.log(`[useLoadDesign] Loading canonical design: ${designId}`);
      
      const response = await fetch(canonicalDesignUrl, { cache: 'no-cache' });
      if (!response.ok) {
        if (isDevEnvironment) {
          console.warn(`[useLoadDesign] Failed to fetch canonical design ${designId}:`, response.status);
        }
        return { success: false, message: 'Failed to fetch design' };
      }

      const canonicalData: CanonicalDesignData = await response.json();
      
      await loadCanonicalDesignIntoEditor(canonicalData, { clearExisting: true });
      
      if (isDevEnvironment) {
        console.log(`[useLoadDesign] Successfully loaded canonical design ${designId}`);
      }
      return { success: true, message: 'Design loaded successfully' };
    } catch (error) {
      console.error(`[useLoadDesign] Error loading canonical design ${designId}:`, error);
      return { success: false, message: 'Error loading design' };
    }
  };

  return { loadDesign, isLoaded: false };
}

/**
 * Hook to load the default canonical design programmatically
 * Used by the "Load Design" button
 * @deprecated Use useLoadDesign(designId) instead
 */
export function useLoadDefaultDesign() {
  return useLoadDesign(DEFAULT_DESIGN_ID);
}
