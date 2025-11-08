'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  useEffect(() => {
    // Hide the canvas on category pages (not on individual design pages)
    const isIndividualDesign = pathname?.split('/').length > 4; // /designs/product/category/slug
    
    if (!isIndividualDesign) {
      // Hide canvas
      const canvas = document.querySelector('.relative.w-full.h-screen') as HTMLElement;
      if (canvas) {
        canvas.style.display = 'none';
      }
      
      // Also hide the ViewToggleButton
      const toggleButton = document.querySelector('[class*="ViewToggle"]');
      if (toggleButton) {
        (toggleButton as HTMLElement).style.display = 'none';
      }
    }
    
    return () => {
      // Show canvas again when leaving
      const canvas = document.querySelector('.relative.w-full.h-screen') as HTMLElement;
      if (canvas) {
        canvas.style.display = 'block';
      }
      
      const toggleButton = document.querySelector('[class*="ViewToggle"]');
      if (toggleButton) {
        (toggleButton as HTMLElement).style.display = 'block';
      }
    };
  }, [pathname]);
  
  return <>{children}</>;
}
