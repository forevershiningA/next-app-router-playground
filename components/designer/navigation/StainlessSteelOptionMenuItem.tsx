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
      className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-normal transition-all duration-200 ${
        isActive
          ? 'border border-[#c49a45]/40 bg-[#c49a45]/15 text-[#f0d89f] shadow-sm day:border-[#9a742f]/40 day:bg-[#9a742f]/10 day:text-[#78541c] backdrop-blur-sm'
          : 'border border-transparent text-white/70 hover:border-white/15 hover:bg-white/[0.06] hover:text-white day:border-transparent day:text-[#5a5248] day:hover:border-[#dfd7ca] day:hover:bg-[#f0ebe1] day:hover:text-[#1a1714]'
      }`}
    >
      <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <span className="select-none" style={{ caretColor: 'transparent' }}>
        {label}
      </span>
    </button>
  );
}
