import type { MouseEvent } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface DesignerNewDesignActionProps {
  isVisible: boolean;
  onNewDesign: (event: MouseEvent<HTMLButtonElement>) => void;
}

export default function DesignerNewDesignAction({
  isVisible,
  onNewDesign,
}: DesignerNewDesignActionProps) {
  if (!isVisible) return null;

  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row">
      <button
        onClick={onNewDesign}
        className="day:bg-[#1d1a17] day:text-white day:hover:bg-[#3a332c] inline-flex flex-1 items-center justify-center gap-3 rounded-sm border border-[#cfac6c]/70 bg-transparent px-4 py-3 text-sm font-semibold text-[#f0d89f] transition-colors hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cfac6c]"
      >
        <ArrowPathIcon className="h-5 w-5" aria-hidden="true" />
        <span>New Design</span>
      </button>
    </div>
  );
}
