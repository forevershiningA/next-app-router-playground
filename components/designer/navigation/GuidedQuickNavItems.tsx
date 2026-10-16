import {
  guidedQuickNavLabels,
  menuItems,
} from '#/components/designer/navigation/designer-navigation-config';

interface GuidedQuickNavItemsProps {
  slugs: string[];
  activeSlug: string | null;
  productId: string | null;
  variant: 'desktop' | 'mobile';
  onNavigate: (slug: string) => void;
  onBeforeNavigate?: (slug: string) => void;
}

export function GuidedQuickNavItems({
  slugs,
  activeSlug,
  productId,
  variant,
  onNavigate,
  onBeforeNavigate,
}: GuidedQuickNavItemsProps) {
  const isMobile = variant === 'mobile';

  return slugs.map((slug) => {
    const item = menuItems.find((menuItem) => menuItem.slug === slug);
    if (!item) return null;

    const Icon = item.icon;
    const isCurrent = activeSlug === slug;
    const label =
      slug === 'select-material' && productId === '5'
        ? 'Background'
        : isMobile
          ? guidedQuickNavLabels[slug]
          : (guidedQuickNavLabels[slug] ?? item.name);
    const handleClick = () => {
      onBeforeNavigate?.(slug);
      onNavigate(slug);
    };

    if (isMobile) {
      return (
        <button
          key={slug}
          type="button"
          onClick={handleClick}
          aria-label={`Go to ${label}`}
          aria-current={isCurrent ? 'step' : undefined}
          className={`flex min-h-14 items-center justify-center rounded-md transition-colors ${
            isCurrent
              ? 'bg-[#D7B356] text-slate-950 shadow-sm'
              : 'day:text-gray-600 day:hover:bg-white day:hover:text-gray-900 text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </button>
      );
    }

    return (
      <button
        key={slug}
        type="button"
        onClick={handleClick}
        data-quick-nav-slug={slug}
        aria-current={isCurrent ? 'step' : undefined}
        title={`Go to ${label}`}
        className={`group flex min-h-16 snap-start flex-col items-center justify-center gap-1 rounded-md px-1.5 py-2 text-[11px] font-semibold transition-colors ${
          isCurrent
            ? 'bg-[#D7B356] text-slate-950 shadow-sm'
            : 'day:text-gray-600 day:hover:bg-white day:hover:text-gray-900 text-white/60 hover:bg-white/10 hover:text-white'
        }`}
      >
        <Icon className="h-6 w-6" aria-hidden="true" />
        <span className="truncate">{label}</span>
      </button>
    );
  });
}
