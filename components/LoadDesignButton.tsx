'use client';

import { useState } from 'react';
import { useLoadDefaultDesign } from '#/components/DefaultDesignLoader';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';

/**
 * Button to load the default canonical design
 * Positioned in the top-right corner of the canvas overlay
 */
export default function LoadDesignButton() {
  const { loadDesign, isLoaded } = useLoadDefaultDesign();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading || isLoaded) return;
    
    setLoading(true);
    try {
      const result = await loadDesign();
      if (result.success) {
        console.log('Design loaded successfully');
      } else {
        console.warn('Failed to load design:', result.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading || isLoaded}
      className={`
        fixed top-4 right-4 z-[100]
        flex items-center gap-2 px-4 py-2.5
        rounded-lg border-2
        font-medium text-sm
        transition-all duration-200
        ${
          isLoaded
            ? 'bg-green-900/50 border-green-500/50 text-green-200 cursor-not-allowed'
            : loading
            ? 'bg-amber-900/50 border-amber-500/50 text-amber-200 cursor-wait'
            : 'bg-black/50 border-amber-500/70 text-amber-100 hover:bg-amber-900/30 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/20 cursor-pointer backdrop-blur-sm'
        }
      `}
      aria-label={isLoaded ? 'Design already loaded' : loading ? 'Loading design...' : 'Load sample design'}
    >
      <DocumentArrowDownIcon 
        className={`h-5 w-5 ${loading ? 'animate-bounce' : ''}`}
        aria-hidden="true"
      />
      <span>
        {isLoaded ? 'Design Loaded' : loading ? 'Loading...' : 'Load Design'}
      </span>
    </button>
  );
}
