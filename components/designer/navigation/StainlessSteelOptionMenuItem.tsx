import type { ComponentType, SVGProps } from 'react';

interface StainlessSteelOptionMenuItemProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export default function StainlessSteelOptionMenuItem({
  icon: Icon,
  label,
  isActive,
  onClick,
}: StainlessSteelOptionMenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={(event) => event.preventDefault()}
      style={{ caretColor: 'transparent', userSelect: 'none' }}
      className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left text-base font-light transition-all ${
        isActive
          ? 'day:border-[#D7B356]/40 day:bg-[#DEBD68]/10 day:text-[#3d2817] border border-white/30 bg-white/15 text-white shadow-lg backdrop-blur-sm'
          : 'day:border-gray-200 day:text-gray-700 day:hover:border-gray-300 day:hover:bg-gray-100 border border-white/10 text-gray-200 hover:border-white/20 hover:bg-white/10'
      }`}
    >
      <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <span className="select-none" style={{ caretColor: 'transparent' }}>
        {label}
      </span>
    </button>
  );
}
