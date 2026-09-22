'use client';

import { useEffect } from 'react';
import { useHeadstoneStore, type MotifCatalogItem } from '#/lib/headstone-store';

type MotifsLoaderProps = {
  motifs: MotifCatalogItem[];
};

export default function MotifsLoader({ motifs }: MotifsLoaderProps) {
  const setMotifsCatalog = useHeadstoneStore((s) => s.setMotifsCatalog);

  useEffect(() => {
    if (motifs && motifs.length > 0) {
      setMotifsCatalog(motifs);
    }
  }, [motifs, setMotifsCatalog]);

  return null;
}
