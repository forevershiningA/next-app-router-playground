'use client';

import { useEffect } from 'react';
import { useHeadstoneStore, type Material } from '#/lib/headstone-store';

export default function MaterialsLoader({ materials }: { materials: Material[] }) {
  const setMaterials = useHeadstoneStore((s) => s.setMaterials);

  useEffect(() => {
    if (materials && materials.length > 0) {
      setMaterials(materials);
    }
  }, [materials, setMaterials]);

  return null;
}
