'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import EmblemSelectionGrid from './_ui/EmblemSelectionGrid';
import { loadEmblems } from '#/app/_internal/_emblems-loader';
import { useHeadstoneStore } from '#/lib/headstone-store';

const BRONZE_PLAQUE_PRODUCT_ID = '5';

export default function Page() {
  const emblems = loadEmblems();
  const pathname = usePathname();
  const [isDesktop, setIsDesktop] = useState(false);
  const productId = useHeadstoneStore((s) => s.productId);
  const setProductId = useHeadstoneStore((s) => s.setProductId);

  // Auto-select Bronze Plaque if no plaque product is selected
  useEffect(() => {
    if (productId !== BRONZE_PLAQUE_PRODUCT_ID) {
      setProductId(BRONZE_PLAQUE_PRODUCT_ID);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Only show the full grid on mobile/tablet where the sidebar is hidden
  const showGrid = pathname === '/select-emblems' && !isDesktop;

  if (!showGrid) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <EmblemSelectionGrid emblems={emblems} />
    </Suspense>
  );
}
