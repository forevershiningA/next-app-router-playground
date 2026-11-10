import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface DesignerMenuGroupHeaderProps {
  label: string;
  index: number;
  isCurrent: boolean;
  isPast: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

export default function DesignerMenuGroupHeader({
  label,
  index,
  isCurrent,
  isOpen,
  onToggle,
}: DesignerMenuGroupHeaderProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-current={isCurrent ? 'step' : undefined}
      aria-expanded={isOpen}
      aria-controls={`designer-menu-group-${index}-items`}
      className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-2 transition-colors duration-200 hover:bg-white/5 day:hover:bg-[#f0ebe1]/70 ${
        isOpen ? 'mb-2' : 'mb-0'
      }`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className={`flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${isCurrent ? 'border-[#c49a45] bg-[#c49a45]/20 text-[#c49a45] day:text-[#78541c]' : 'border-white/20 text-white/60 day:border-[#d2c8b9] day:text-[#756c62]'}`}>
          {index + 1}
        </span>
        <p className="font-serif text-lg font-normal tracking-[-0.01em] text-white/90 day:text-[#1a1714]">
          {label}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2.5">
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-white/40 transition-transform duration-200 day:text-[#8a8074] ${
            isOpen ? 'rotate-0' : '-rotate-90'
          }`}
          aria-hidden="true"
        />
      </div>
    </button>
  );
}
