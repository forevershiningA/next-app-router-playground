'use client';

import { useState } from 'react';
import { useLoadDesign } from '#/components/DefaultDesignLoader';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';

interface LoadDesignButtonProps {
  designId: string;
  label: string;
  position: 'top' | 'middle';
}

/**
 * Button to load a specific canonical design
 * Supports multiple buttons for different designs
 */
export default function LoadDesignButton({ designId, label, position }: LoadDesignButtonProps) {
  const { loadDesign, isLoaded } = useLoadDesign(designId);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    // Always allow clicking - clear existing design and load fresh
    setLoading(true);
    try {
      const result = await loadDesign();
      if (result.success) {
        console.log(`Design ${designId} loaded successfully`);
      } else {
        console.warn(`Failed to load design ${designId}:`, result.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const positionClasses = position === 'top' 
    ? 'top-4' 
    : 'top-20';

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`
        fixed ${positionClasses} right-4 z-[100]
        flex items-center gap-2 px-4 py-2.5
        rounded-lg border-2
        font-medium text-sm
        transition-all duration-200
        ${
          loading
            ? 'bg-amber-900/50 border-amber-500/50 text-amber-200 cursor-wait'
            : 'bg-black/50 border-amber-500/70 text-amber-100 hover:bg-amber-900/30 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/20 cursor-pointer backdrop-blur-sm'
        }
      `}
      aria-label={loading ? `Loading ${label}...` : `Load ${label}`}
    >
      <DocumentArrowDownIcon 
        className={`h-5 w-5 ${loading ? 'animate-bounce' : ''}`}
        aria-hidden="true"
      />
      <span>
        {loading ? 'Loading...' : label}
      </span>
    </button>
  );
}
