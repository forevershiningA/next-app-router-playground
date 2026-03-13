'use client';

import { useMemo } from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { useState, useEffect } from 'react';

type Product = { id: string; name: string; image: string; category: string };

export default function ShapeTitle({ products }: { products: Product[] }) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Don't render title on desktop
  if (isDesktop) {
    return null;
  }

  return (
    <h2 className="text-xl font-semibold text-gray-300">
      Select Shape
    </h2>
  );
}
