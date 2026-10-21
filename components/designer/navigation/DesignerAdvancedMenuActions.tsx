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
      <label className="day:border-[#d8cfc2] day:bg-[#fbf9f5] day:text-[#4b3824] day:hover:border-[#bda98b] day:hover:bg-[#f5efe5] flex w-full cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2.5 text-left text-sm font-light text-gray-200 transition-colors hover:border-white/20 hover:bg-white/10">
        <input
          type="checkbox"
          checked={isExpanded}
          onChange={(event) => {
            const isEnabled = event.target.checked;
            setIsExpanded(isEnabled);
            if (!isEnabled) onCloseConvertPanel();
          }}
          className="day:border-[#bda98b] h-4 w-4 rounded border-white/30 bg-transparent accent-[#D7B356]"
        />
        <span className="flex-1">Advanced</span>
        <span className="day:text-[#806f5d] text-xs text-white/35">
          Optional tools
        </span>
      </label>
      {isExpanded && (
        <>
          <button
            type="button"
            onClick={onToggleConvertPanel}
            disabled={!productId || !isCanvasAvailable}
            className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm font-light transition-all ${
              showConvertPanel
                ? 'border-[#D7B356]/40 bg-[#D7B356]/10 text-[#f3d48f]'
                : 'border-white/10 bg-white/[0.035] text-gray-200 hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40'
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
