'use client';

import {
  loadCanonicalDesignIntoEditor,
  getCanonicalDesignUrl,
  fetchCanonicalDesign,
  type CanonicalDesignData,
} from '#/lib/saved-design-loader-utils';
const isDevEnvironment = process.env.NODE_ENV !== 'production';
const DEFAULT_DESIGN_ID = '1725769905504';

/**
 * Component that loads the default canonical design on first designer visit
 * DISABLED - Design loading now triggered manually via "Load Design" button
 */
export default function DefaultDesignLoader() {
  // Automatic loading disabled - headstone starts empty
  // Design can be loaded via the "Load Design" button in the canvas overlay
  return null;
}

export async function loadDesignById(designId: string) {
  try {
    if (isDevEnvironment) {
      console.log(`[loadDesignById] Loading canonical design: ${designId}`);
    }

    const canonicalData = await fetchCanonicalDesign(designId);
    if (!canonicalData) {
      if (isDevEnvironment) {
        console.warn(`[loadDesignById] No canonical design found for ${designId}`);
      }
      return { success: false, message: 'Failed to fetch design' };
    }

    await loadCanonicalDesignIntoEditor(canonicalData, { clearExisting: true });

    if (isDevEnvironment) {
      console.log(`[loadDesignById] Successfully loaded canonical design ${designId}`);
    }
    return { success: true, message: 'Design loaded successfully' };
  } catch (error) {
    console.error(`[loadDesignById] Error loading canonical design ${designId}:`, error);
    return { success: false, message: 'Error loading design' };
  }
}

// Expose for Playwright batch screenshot automation (dev only)
if (isDevEnvironment && typeof window !== 'undefined') {
  (window as any).__loadDesignById = loadDesignById;
}

/**
 * Hook to load a specific canonical design programmatically
 * Used by the "Load Design" buttons
 * Always allows reloading - clears existing design each time
 */
export function useLoadDesign(designId: string) {
  const loadDesign = async () => loadDesignById(designId);

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
