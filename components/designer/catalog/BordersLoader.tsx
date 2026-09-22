'use client';

import { useEffect } from 'react';
import { useHeadstoneStore, type BorderOption } from '#/lib/headstone-store';

type BordersLoaderProps = {
  borders: BorderOption[];
};

// Stores the full DB border set as a fallback but doesn't overwrite
// product-specific borders set by setProductId
export default function BordersLoader({ borders }: BordersLoaderProps) {
  const setBorders = useHeadstoneStore((s) => s.setBorders);
  const productId = useHeadstoneStore((s) => s.productId);

  useEffect(() => {
    // Only set DB borders if no product is selected yet (no product-specific set)
    if (borders && borders.length > 0 && !productId) {
      setBorders(borders);
    }
  }, [borders, setBorders, productId]);

  return null;
}
