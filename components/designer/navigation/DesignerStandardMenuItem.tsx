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
        className="flex cursor-not-allowed items-center gap-2 rounded-lg border border-white/5 px-3 py-2.5 text-sm font-light opacity-40"
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
      className={`flex cursor-pointer items-center justify-between gap-2.5 rounded-lg px-3 py-2 text-sm font-normal transition-all duration-200 ${
        isActive
          ? 'border border-[#c49a45]/40 bg-[#c49a45]/15 text-[#f0d89f] shadow-sm day:border-[#9a742f]/40 day:bg-[#9a742f]/10 day:text-[#78541c]'
          : 'border border-transparent text-white/70 hover:border-white/15 hover:bg-white/[0.06] hover:text-white day:border-transparent day:text-[#5a5248] day:hover:border-[#dfd7ca] day:hover:bg-[#f0ebe1] day:hover:text-[#1a1714]'
      }`}
    >
      <div className="flex items-center gap-2.5">
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
