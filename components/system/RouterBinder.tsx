'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { parseCatalogXML } from '#/lib/xml-parser';

/**
 * Wires Next.js router into the store so it can do SPA navigations.
 * Mount once near the top of the app (e.g., in app/layout.tsx).
 */
export default function RouterBinder() {
  const router = useRouter();
  const setNavTo = useHeadstoneStore((s) => s.setNavTo);
  const setCatalog = useHeadstoneStore((s) => s.setCatalog);
  const setWidthMm = useHeadstoneStore((s) => s.setWidthMm);
  const setHeightMm = useHeadstoneStore((s) => s.setHeightMm);
  const setInscriptions = useHeadstoneStore((s) => s.setInscriptions);
  const setInscriptionHeightLimits = useHeadstoneStore(
    (s) => s.setInscriptionHeightLimits,
  );

  useEffect(() => {
    setNavTo((href, opts) =>
      opts?.replace ? router.replace(href) : router.push(href),
    );
  }, [router, setNavTo]);

  useEffect(() => {
    // Load catalog XML and set init sizes
    fetch('/xml/catalog-id-124.xml')
      .then((res) => res.text())
      .then((xmlText) => {
        const catalog = parseCatalogXML(xmlText);
        setCatalog(catalog);
        const firstShape = catalog.product.shapes[0];
        if (firstShape) {
          // Set headstone init size from table
          setWidthMm(firstShape.table.initWidth);
          setHeightMm(firstShape.table.initHeight);
        }
      })
      .catch((err) => console.error('Failed to load catalog XML:', err));

    // Load inscriptions XML for init size
    fetch('/xml/au_EN/inscriptions.xml')
      .then((res) => res.text())
      .then((xmlText) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const productEl = xmlDoc.querySelector('product[id="16"]'); // Free inscription
        if (productEl) {
          const initHeight = parseInt(
            productEl.getAttribute('init_height') || '30',
          );
          const minHeight = parseInt(
            productEl.getAttribute('min_height') || '5',
          );
          const maxHeight = parseInt(
            productEl.getAttribute('max_height') || '1200',
          );
          setInscriptionHeightLimits(minHeight, maxHeight);
          setInscriptions((inscriptions) =>
            inscriptions.map((line) => ({
              ...line,
              sizeMm: initHeight,
              font: 'Chopin Script',
            })),
          );
        }
      })
      .catch((err) => console.error('Failed to load inscriptions XML:', err));
  }, [setWidthMm, setHeightMm, setInscriptions]);

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

  return null;
}
