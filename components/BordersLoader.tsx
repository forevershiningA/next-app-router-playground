'use client';

import { useEffect } from 'react';
import { useHeadstoneStore, type BorderOption } from '#/lib/headstone-store';

type BordersLoaderProps = {
  borders: BorderOption[];
};

export default function BordersLoader({ borders }: BordersLoaderProps) {
  const setBorders = useHeadstoneStore((s) => s.setBorders);

  useEffect(() => {
    if (borders && borders.length > 0) {
      setBorders(borders);
    }
  }, [borders, setBorders]);

  return null;
}
