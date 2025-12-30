'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { data } from '#/app/_internal/_data';
import AdditionSelectionGrid from './_ui/AdditionSelectionGrid';

export default function Page() {
  const additions = data.additions;
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

  // Only show the full grid on mobile/tablet layouts where the sidebar (and canvas) are hidden
  const showGrid = pathname === '/select-additions' && !isDesktop;

  if (!showGrid) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <AdditionSelectionGrid additions={additions} />
    </Suspense>
  );
}
