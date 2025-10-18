'use client';

import { useMemo } from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';

type Product = { id: string; name: string; image: string; category: string };

export default function OverlayTitle({
  prefix,
  products,
  initialName,
}: {
  prefix: string;
  products: Product[];
  initialName?: string | null;
}) {
  return (
    <h2 className="text-xl font-semibold text-gray-300">
      {prefix}
    </h2>
  );
}
