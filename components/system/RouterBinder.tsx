'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { defaultErrorHandler } from '#/lib/error-handler';

/**
 * Wires Next.js router into the store so it can do SPA navigations.
 * Mount once near the top of the app (e.g., in app/layout.tsx).
 */
export default function RouterBinder() {
  const router = useRouter();
  const setNavTo = useHeadstoneStore((s) => s.setNavTo);
  const setProductId = useHeadstoneStore((s) => s.setProductId);
  const setInscriptions = useHeadstoneStore((s) => s.setInscriptions);
  const setInscriptionHeightLimits = useHeadstoneStore(
    (s) => s.setInscriptionHeightLimits,
  );
  
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setNavTo((href, opts) =>
      opts?.replace ? router.replace(href) : router.push(href),
    );
  }, [router, setNavTo]);

  useEffect(() => {
    setProductId('124');
  }, [setProductId]);

  useEffect(() => {
    // Load inscriptions XML for init size
    const loadInscriptionData = async () => {
      try {
        const response = await fetch('/xml/au_EN/inscriptions.xml');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const xmlText = await response.text();
        
        // Basic validation
        if (xmlText.includes('<!ENTITY')) {
          throw new Error('Invalid XML: External entities detected');
        }
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        // Check for parser errors
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
          throw new Error('XML parsing failed: ' + parserError.textContent);
        }
        
        const productEl = xmlDoc.querySelector('product[id="16"]'); // Free inscription
        if (productEl) {
          const initHeight = parseInt(
            productEl.getAttribute('init_height') || '30',
            10,
          );
          const minHeight = parseInt(
            productEl.getAttribute('min_height') || '5',
            10,
          );
          const maxHeight = parseInt(
            productEl.getAttribute('max_height') || '1200',
            10,
          );
          
          setInscriptionHeightLimits(minHeight, maxHeight);
          setInscriptions((inscriptions) =>
            inscriptions.map((line) => ({
              ...line,
              sizeMm: initHeight,
              font: 'Chopin Script',
            })),
          );
          
          setLoadError(null);
        } else {
          console.warn('Product element not found in inscriptions XML, using defaults');
          // Set sensible defaults
          setInscriptionHeightLimits(5, 1200);
        }
      } catch (err) {
        const error = err as Error;
        defaultErrorHandler(error, 'RouterBinder:loadInscriptionData');
        setLoadError(error.message);
        
        // Set sensible defaults even on error
        setInscriptionHeightLimits(5, 1200);
        setInscriptions((inscriptions) =>
          inscriptions.map((line) => ({
            ...line,
            sizeMm: 30,
            font: 'Chopin Script',
          })),
        );
      }
    };
    
    loadInscriptionData();
  }, [setInscriptions, setInscriptionHeightLimits]);

  // Optional: handle generic navigation events from elsewhere
  useEffect(() => {
    const onNavigate = (e: any) => {
      const href = e?.detail?.href;
      if (href) router.push(href);
    };
    window.addEventListener('fs:navigate', onNavigate as EventListener);
    return () =>
      window.removeEventListener('fs:navigate', onNavigate as EventListener);
  }, [router]);
  
  // Show error toast if needed
  if (loadError) {
    console.error('RouterBinder initialization error:', loadError);
    // In production, you might want to show a toast notification here
  }

  return null;
}
