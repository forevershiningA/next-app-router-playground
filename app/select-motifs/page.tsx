'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { data } from '#/app/_internal/_data';
import MotifSelectionGrid from './_ui/MotifSelectionGrid';

export default function Page() {
  const motifs = data.motifs;
  const pathname = usePathname();
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 1024;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Only show the grid on mobile/tablet where the sidebar is hidden
  const showGrid = pathname === '/select-motifs' && !isDesktop;

  if (!showGrid) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <MotifSelectionGrid 
        motifs={motifs}
      />
    </Suspense>
  );
}
