'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function CanvasClickOverlay() {
  const [showOverlay, setShowOverlay] = useState(true);
  const [isDesignPage, setIsDesignPage] = useState(false);
  const pathname = usePathname();

  // Check if we're on a design page
  useEffect(() => {
    const onDesignPage = pathname?.startsWith('/designs/') && pathname.split('/').length > 3;
    setIsDesignPage(onDesignPage);
    
    // Show overlay when navigating to a design page
    if (onDesignPage) {
      setShowOverlay(true);
    }
  }, [pathname]);

  // Hide overlay when clicking
  const handleClick = () => {
    setShowOverlay(false);
  };

  // Show overlay when mouse leaves the canvas area
  const handleMouseLeave = () => {
    if (isDesignPage) {
      setShowOverlay(true);
    }
  };

  // Only show on design pages
  if (!isDesignPage || !showOverlay) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 z-[40] flex items-center justify-center pointer-events-auto cursor-pointer"
      onClick={handleClick}
      onMouseLeave={handleMouseLeave}
      style={{ 
        background: 'rgba(0, 0, 0, 0.75)'
      }}
    >
      <p className="text-4xl font-bold text-gray-400">Click to edit</p>
    </div>
  );
}
