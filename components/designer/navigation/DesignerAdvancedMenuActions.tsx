'use client';

import { useState, type MouseEvent } from 'react';
import { Squares2X2Icon } from '@heroicons/react/24/outline';
import LoadDesignButton from '#/components/designer/actions/LoadDesignButton';

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
      <label className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg border border-transparent px-3 py-2 text-left text-sm font-normal text-white/70 transition-all duration-200 hover:border-white/15 hover:bg-white/[0.06] hover:text-white day:border-transparent day:text-[#5a5248] day:hover:border-[#dfd7ca] day:hover:bg-[#f0ebe1] day:hover:text-[#1a1714]">
        <input
          type="checkbox"
          checked={isExpanded}
          onChange={(event) => {
            const isEnabled = event.target.checked;
            setIsExpanded(isEnabled);
            if (!isEnabled) onCloseConvertPanel();
          }}
          className="h-4 w-4 rounded border-white/30 bg-transparent accent-[#c49a45] day:border-[#dfd7ca] day:accent-[#9a742f]"
        />
        <span className="flex-1 text-white/80 day:text-[#5a5248]">Advanced</span>
        <span className="text-xs text-white/40 day:text-[#8a8074]">
          Optional tools
        </span>
      </label>
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
          <LoadDesignButton label="Load Design" variant="menu" />
        </>
      )}
    </>
  );
}
