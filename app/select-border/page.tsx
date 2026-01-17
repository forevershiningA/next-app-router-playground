'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function SelectBorderPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If on /select-border but not coming from sidebar, redirect to /select-size
    // The border selector should only be visible in the sidebar
    if (pathname === '/select-border') {
      // Stay on this page, but render nothing - sidebar will show the selector
      return;
    }
  }, [pathname]);

  // Return empty div - the border selector is shown in the sidebar via DesignerNav
  return <div className="hidden" />;
}
