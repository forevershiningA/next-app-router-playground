import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface DesignerMenuGroupHeaderProps {
  label: string;
  index: number;
  isCurrent: boolean;
  isPast: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

const groupNumerals = ['I', 'II', 'III'];

export default function DesignerMenuGroupHeader({
  label,
  index,
  isCurrent,
  isPast,
  isOpen,
  onToggle,
}: DesignerMenuGroupHeaderProps) {
  const status = isCurrent ? 'Current' : isPast ? 'Complete' : 'Available';

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-current={isCurrent ? 'step' : undefined}
      aria-expanded={isOpen}
      aria-controls={`designer-menu-group-${index}-items`}
      className={`day:hover:bg-white/45 flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 transition-colors duration-200 hover:bg-white/5 ${
        isOpen ? 'mb-2' : 'mb-0'
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-serif text-[13px] font-normal tracking-wide ${
          isPast
            ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
            : isCurrent
              ? 'day:border-[#bda98b] day:bg-[#f7efd9] day:text-[#4b3824] bg-primary/20 border-white/80 text-white'
              : 'border-primary/40 text-primary'
        }`}
      >
        {isPast ? '✓' : groupNumerals[index]}
      </span>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="day:text-[#1d1a17] font-serif text-lg font-normal tracking-[-0.01em] text-white/90">
            {label}
          </p>
          {status !== 'Available' && (
            <p
              className={`mt-0.5 text-[11px] font-semibold tracking-[0.16em] uppercase ${
                isCurrent
                  ? 'day:text-[#8c6425] text-[#f0cf79]'
                  : 'text-emerald-300/85'
              }`}
            >
              {status}
            </p>
          )}
        </div>
        <span className="font-playfair-display text-primary/60 shrink-0 text-[10px] tracking-[0.3em] italic">
          Step {index + 1}
        </span>
      </div>
      <ChevronDownIcon
        className={`day:text-gray-400 h-4 w-4 shrink-0 text-white/40 ${
          isOpen ? 'rotate-0' : '-rotate-90'
        }`}
        aria-hidden="true"
      />
    </button>
  );
}
