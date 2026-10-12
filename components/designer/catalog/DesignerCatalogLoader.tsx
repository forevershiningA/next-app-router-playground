'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  useHeadstoneStore,
  type BorderOption,
  type Material,
  type ShapeOption,
} from '#/lib/headstone-store';
import { isDesignerRoutePath } from '#/lib/designer-route-state';

type DesignerCatalogOptions = {
  materials: Material[];
  shapes: ShapeOption[];
  borders: BorderOption[];
};

let optionsPromise: Promise<DesignerCatalogOptions> | null = null;

function loadDesignerCatalog() {
  optionsPromise ??= fetch('/api/catalog/designer-options').then(
    async (response) => {
      if (!response.ok) {
        throw new Error(`Designer catalog request failed: ${response.status}`);
      }
      return (await response.json()) as DesignerCatalogOptions;
    },
  );
  return optionsPromise;
}

export default function DesignerCatalogLoader() {
  const pathname = usePathname();
  const setMaterials = useHeadstoneStore((state) => state.setMaterials);
  const setShapes = useHeadstoneStore((state) => state.setShapes);
  const setBorders = useHeadstoneStore((state) => state.setBorders);
  const productId = useHeadstoneStore((state) => state.productId);

  useEffect(() => {
    if (pathname === '/' || !isDesignerRoutePath(pathname)) return;

    let cancelled = false;
    void loadDesignerCatalog()
      .then((options) => {
        if (cancelled) return;
        setMaterials(options.materials);
        setShapes(options.shapes);
        if (!productId) setBorders(options.borders);
      })
      .catch((error: unknown) => {
        optionsPromise = null;
        console.error('Unable to load designer catalog options', error);
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, productId, setBorders, setMaterials, setShapes]);

  return null;
}
