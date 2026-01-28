'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { defaultErrorHandler } from '#/lib/error-handler';
import { data } from '#/app/_internal/_data';

const DESIGNER_ROUTES = [
  '/select-size',
  '/select-material',
  '/inscriptions',
  '/select-additions',
  '/select-motifs',
];

/**
 * Wires Next.js router into the store so it can do SPA navigations.
 * Mount once near the top of the app (e.g., in app/layout.tsx).
 */
export default function RouterBinder() {
  const router = useRouter();
  const pathname = usePathname();
  const setNavTo = useHeadstoneStore((s) => s.setNavTo);
  const setProductId = useHeadstoneStore((s) => s.setProductId);
  const currentProductId = useHeadstoneStore((s) => s.productId);
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

  // Set product ID based on URL - only when no product has been selected yet
  useEffect(() => {
    if (currentProductId) {
      return;
    }

    // Get pathname from window if usePathname hasn't loaded yet
    const currentPath = pathname || (typeof window !== 'undefined' ? window.location.pathname : null);
    
    if (!currentPath) {
      return;
    }
    
    // Skip setting product if we're on a design page - it will be set by the design loader
    if (currentPath.startsWith('/designs/')) {
      return;
    }

    if (DESIGNER_ROUTES.some((route) => currentPath.startsWith(route))) {
      return;
    }
    
    // Check if URL contains a product category or product slug
    let productId = '124'; // Default headstone
    
    // Try to match /select-product/[section]/[category] first
    let match = currentPath.match(/\/select-product\/[^/]+\/([^/]+)/);
    
    // If not found, try /select-product/[slug]
    if (!match) {
      match = currentPath.match(/\/select-product\/([^/]+)/);
    }
    
    if (match) {
      const slug = match[1];
      
      // First try to find by category slug
      const category = data.categories.find(c => c.slug === slug);
      if (category) {
        const product = data.products.find(p => p.category === category.id);
        if (product) {
          productId = product.id;
        }
      } else {
        // Try to find by product name converted to slug
        const product = data.products.find(p => {
          const productSlug = p.name.toLowerCase().replace(/\s+/g, '-');
          return productSlug === slug;
        });
        
        if (product) {
          productId = product.id;
        }
      }
    }
    
    setProductId(productId);
  }, [pathname, currentProductId, setProductId]);

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
              // Don't override font - preserve the font from initial setup
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
            // Don't override font - preserve the font from initial setup
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

  // Check for panel to open from sessionStorage (set by design page edit buttons)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const openPanel = sessionStorage.getItem('openPanel');
    if (openPanel) {
      sessionStorage.removeItem('openPanel');
      
      // Small delay to ensure design is loaded
      setTimeout(() => {
        const setActivePanel = useHeadstoneStore.getState().setActivePanel;
        setActivePanel(openPanel as any);
      }, 500);
    }
  }, [pathname]);

  // Show error toast if needed
  if (loadError) {
    console.error('RouterBinder initialization error:', loadError);
    // In production, you might want to show a toast notification here
  }

  return null;
}
