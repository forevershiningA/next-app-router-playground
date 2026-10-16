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
      className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-white/10 px-4 py-3 text-left text-base font-light text-gray-200 transition-all hover:border-white/20 hover:bg-white/10"
    >
      <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
