import type { ComponentType, MouseEvent, SVGProps } from 'react';

interface DesignerSaveDesignMenuItemProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}

export default function DesignerSaveDesignMenuItem({
  icon: Icon,
  label,
  onClick,
}: DesignerSaveDesignMenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid="save-design-nav-btn"
      className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg border border-transparent px-3 py-2 text-left text-sm font-normal text-white/70 transition-all duration-200 hover:border-white/15 hover:bg-white/[0.06] hover:text-white day:border-transparent day:text-[#5a5248] day:hover:border-[#dfd7ca] day:hover:bg-[#f0ebe1] day:hover:text-[#1a1714]"
    >
      <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
