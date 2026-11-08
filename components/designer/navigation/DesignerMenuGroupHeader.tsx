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
  isPast,
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
        <p className="font-serif text-lg font-normal tracking-[-0.01em] text-white/90 day:text-[#1a1714]">
          {label}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2.5">
        <span className="font-playfair-display text-[11px] tracking-[0.2em] italic text-[#c49a45]/80 day:text-[#9a742f]/80">
          Step {index + 1}
        </span>
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
