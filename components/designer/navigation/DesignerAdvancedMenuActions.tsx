'use client';

import { useState, type MouseEvent } from 'react';
import { ChevronDownIcon, Squares2X2Icon } from '@heroicons/react/24/outline';

interface DesignerAdvancedMenuActionsProps {
  productId: string | null;
  isCanvasAvailable: boolean;
  showConvertPanel: boolean;
  onCloseConvertPanel: () => void;
  onToggleConvertPanel: (event: MouseEvent<HTMLButtonElement>) => void;
}

export default function DesignerAdvancedMenuActions({
  productId,
  isCanvasAvailable,
  showConvertPanel,
  onCloseConvertPanel,
  onToggleConvertPanel,
}: DesignerAdvancedMenuActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <button type="button" aria-expanded={isExpanded} onClick={() => { setIsExpanded(!isExpanded); if (isExpanded) onCloseConvertPanel(); }} className="flex w-full items-center gap-2.5 rounded-lg border border-transparent px-3 py-2 text-left text-sm text-white/70 hover:bg-white/[0.06] day:text-[#5a5248] day:hover:bg-[#f0ebe1]">
        <span className="flex-1">Advanced tools</span>
        <ChevronDownIcon aria-hidden="true" className={`size-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      {isExpanded && (
        <>
          <button
            type="button"
            onClick={onToggleConvertPanel}
            disabled={!productId || !isCanvasAvailable}
            className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm font-normal transition-all duration-200 ${
              showConvertPanel
                ? 'border-[#c49a45]/40 bg-[#c49a45]/15 text-[#f0d89f] day:border-[#9a742f]/40 day:bg-[#9a742f]/10 day:text-[#78541c]'
                : 'border-transparent text-white/70 hover:border-white/15 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 day:border-transparent day:text-[#5a5248] day:hover:border-[#dfd7ca] day:hover:bg-[#f0ebe1] day:hover:text-[#1a1714]'
            }`}
          >
            <Squares2X2Icon className="h-5 w-5" aria-hidden="true" />
            <span>Convert Design</span>
          </button>
          {(!productId || !isCanvasAvailable) && <p className="px-3 text-xs text-white/60 day:text-[#756c62]">Select a product and open the 3D canvas to convert your design.</p>}
        </>
      )}
    </>
  );
}
