import type { ComponentType, MouseEvent, SVGProps } from 'react';
import Link from 'next/link';
import DesignerMenuItemIndicators from '#/components/designer/navigation/DesignerMenuItemIndicators';
import type { DesignerNavigationItemStatus } from '#/components/designer/navigation/useDesignerNavigationItemStatus';

interface DesignerStandardMenuItemProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  slug: string;
  label: string;
  isActive: boolean;
  isDisabled: boolean;
  status: DesignerNavigationItemStatus;
  count: number | null | undefined;
  isExpanded: boolean;
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void | Promise<void>;
}

export default function DesignerStandardMenuItem({
  icon: Icon,
  slug,
  label,
  isActive,
  isDisabled,
  status,
  count,
  isExpanded,
  onClick,
}: DesignerStandardMenuItemProps) {
  if (isDisabled) {
    return (
      <div
        className="flex cursor-not-allowed items-center gap-3 rounded-lg border border-white/5 px-4 py-3 text-base font-light opacity-40"
        title="Please select a product first"
      >
        <Icon
          className="h-5 w-5 flex-shrink-0 text-gray-500"
          aria-hidden="true"
        />
        <span className="text-gray-500">{label}</span>
      </div>
    );
  }

  return (
    <Link
      href={`/${slug}`}
      onClick={onClick}
      className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-4 py-3 text-base font-light transition-all ${
        isActive
          ? 'day:border-[#b88a32] day:bg-[#f3e6c9] day:text-[#3d2817] border border-white/30 bg-white/15 text-white shadow-sm'
          : 'day:border-gray-200 day:text-gray-700 day:hover:border-gray-300 day:hover:bg-gray-100 border border-white/10 text-gray-200 hover:border-white/20 hover:bg-white/10'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
        <span>{label}</span>
      </div>
      <DesignerMenuItemIndicators
        slug={slug}
        status={status}
        count={count}
        isExpanded={isExpanded}
        isActive={isActive}
      />
    </Link>
  );
}
