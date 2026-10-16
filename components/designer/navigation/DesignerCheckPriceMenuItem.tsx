import type { ComponentType, MouseEvent, SVGProps } from 'react';
import Link from 'next/link';

interface DesignerCheckPriceMenuItemProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  href: string;
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void | Promise<void>;
}

export default function DesignerCheckPriceMenuItem({
  icon: Icon,
  label,
  href,
  onClick,
}: DesignerCheckPriceMenuItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="day:border-[#c39a3d] day:from-[#f5df9b] day:to-[#d7b356] day:text-[#30210e] flex w-full items-center justify-between gap-3 rounded-lg border border-[#e6c66f]/70 bg-gradient-to-r from-[#e5c15b] to-[#b9872c] px-4 py-3 text-left text-base font-medium text-[#24170c] shadow-[0_10px_22px_rgba(0,0,0,0.28)] transition-all hover:-translate-y-px hover:from-[#f4d37c] hover:to-[#d7a23e] hover:shadow-[0_13px_28px_rgba(0,0,0,0.34)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4d07e]"
    >
      <span className="flex items-center gap-3">
        <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
        <span>{label}</span>
      </span>
      <span className="text-xs font-semibold tracking-wide uppercase">
        View estimate
      </span>
    </Link>
  );
}
