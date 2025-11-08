'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function MainContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  
  // Check if we're on any /designs route
  const isDesignsRoute = pathname?.startsWith('/designs');
  
  // Check if we're on a design list page (product or category level)
  const segments = pathname?.split('/').filter(s => s) || [];
  const isDesignListPage = pathname?.startsWith('/designs/') && (segments.length === 2 || segments.length === 3);
  
  // Also check if on a category page with /designs/[productType]/[category] structure
  const isAnyCategoryPage = pathname?.match(/^\/designs\/[^\/]+\/[^\/]+\/?$/);

  useEffect(() => {
    const handler = () => setIsSidebarOpen((s) => !s);
    window.addEventListener('toggle-sidebar', handler);
    return () => window.removeEventListener('toggle-sidebar', handler);
  }, []);

  return (
    <div className={!isDesignsRoute && isSidebarOpen ? 'lg:pl-[400px]' : ''}>
      {children}
    </div>
  );
}
