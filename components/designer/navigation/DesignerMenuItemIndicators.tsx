import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { expandableMenuSectionSlugs } from '#/components/designer/navigation/designer-navigation-config';

interface DesignerMenuItemIndicatorsProps {
  slug: string;
  status: 'complete' | 'incomplete' | 'available';
  count: number | null | undefined;
  isExpanded: boolean;
  isActive: boolean;
}

export default function DesignerMenuItemIndicators({
  slug,
  status,
  count,
  isExpanded,
  isActive,
}: DesignerMenuItemIndicatorsProps) {
  return (
    <>
      {status === 'complete' && !isActive && (
        <span
          className="day:bg-emerald-50 day:text-emerald-700 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/15 text-xs font-bold text-emerald-300"
          aria-label="Complete"
        >
          ✓
        </span>
      )}
      {count != null && count > 0 && (
        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
          {count}
        </span>
      )}
      {expandableMenuSectionSlugs.has(slug) &&
        count != null &&
        count > 0 &&
        (isExpanded ? (
          <ChevronUpIcon className="h-4 w-4 flex-shrink-0" />
        ) : (
          <ChevronDownIcon className="h-4 w-4 flex-shrink-0" />
        ))}
    </>
  );
}
