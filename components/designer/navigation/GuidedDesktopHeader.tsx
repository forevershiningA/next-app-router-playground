'use client';

import React from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Squares2X2Icon,
  MoonIcon,
  SunIcon,
} from '@heroicons/react/24/outline';
import { GuidedQuickNavItems } from '#/components/designer/navigation/GuidedQuickNavItems';

type GuidedDesktopHeaderProps = {
  isDayTheme: boolean;
  toggleTheme: () => void;
  title: string | undefined;
  activeFullscreenPanel: string | null;
  currentSlugFromPathname: string;
  guidedQuickNavSlugs: string[];
  productId: string | null;
  showBackToListButton: boolean;
  onBackToMenu: () => void;
  onBackToList: () => void;
  onNavigate: (slug: string) => void | Promise<void>;
};

export default function GuidedDesktopHeader({
  isDayTheme,
  toggleTheme,
  title,
  activeFullscreenPanel,
  currentSlugFromPathname,
  guidedQuickNavSlugs,
  productId,
  showBackToListButton,
  onBackToMenu,
  onBackToList,
  onNavigate,
}: GuidedDesktopHeaderProps) {
  const quickNavRef = React.useRef<HTMLDivElement>(null);
  const headerButtonClass =
    'day:border-[#bdb4a6] day:bg-white/25 day:text-[#302719] day:hover:border-[#9a742f] day:hover:bg-white/55 day:hover:text-[#302719] inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/[0.06] text-xs font-medium text-white/80 transition-colors hover:border-[#cfac6c]/70 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--designer-focus)]';

  React.useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const activeSlug = activeFullscreenPanel ?? currentSlugFromPathname;
      const activeItem = quickNavRef.current?.querySelector<HTMLElement>(
        `[data-quick-nav-slug="${activeSlug}"]`,
      );
      activeItem?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [activeFullscreenPanel, currentSlugFromPathname, guidedQuickNavSlugs]);

  const scrollQuickNav = (direction: -1 | 1) => {
    const element = quickNavRef.current;
    element?.scrollBy({
      left: direction * Math.max(144, element.clientWidth * 0.72),
      behavior: 'smooth',
    });
  };

  return (
    <div className="day:border-[#cfc5b7] day:bg-[#eee9df] @container relative hidden shrink-0 border-b border-white/10 bg-[#1d1a17] px-5 py-3 md:block">
      <div className="flex min-h-9 items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBackToMenu}
          className={`${headerButtonClass} gap-1.5 px-3`}
        >
          <svg
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Menu
        </button>

        <h2 className="day:text-[#1d1a17] min-w-0 text-center font-serif text-xl leading-tight font-normal tracking-[-0.02em] text-white">
          {title}
        </h2>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={
            isDayTheme ? 'Switch to night mode' : 'Switch to day mode'
          }
          title={isDayTheme ? 'Night mode' : 'Day mode'}
          className={`${headerButtonClass} w-9`}
        >
          {isDayTheme ? (
            <MoonIcon className="h-5 w-5" aria-hidden="true" />
          ) : (
            <SunIcon className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>
      {showBackToListButton && (
        <button
          onClick={onBackToList}
          className={`${headerButtonClass} mt-2 gap-1.5 px-3`}
        >
          <Squares2X2Icon className="h-3 w-3" aria-hidden="true" />
          List
        </button>
      )}
      <div className="day:border-[#ddd2c2] mt-2 flex items-center gap-1 border-t border-white/10 pt-2">
        <button
          type="button"
          onClick={() => scrollQuickNav(-1)}
          aria-label="Scroll configuration actions left"
          className="day:border-[#ddd2c2] day:bg-[#fbf9f5] day:text-[#625a51] day:hover:bg-[#eee6d9] flex h-9 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/65 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
        </button>
        <div
          ref={quickNavRef}
          className="grid min-w-0 flex-1 snap-x snap-mandatory auto-cols-[64px] grid-flow-col gap-1.5 overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Configuration actions"
        >
          <GuidedQuickNavItems
            slugs={guidedQuickNavSlugs}
            activeSlug={activeFullscreenPanel}
            productId={productId}
            variant="desktop"
            onNavigate={onNavigate}
          />
        </div>
        <button
          type="button"
          onClick={() => scrollQuickNav(1)}
          aria-label="Scroll configuration actions right"
          className="day:border-[#ddd2c2] day:bg-[#fbf9f5] day:text-[#625a51] day:hover:bg-[#eee6d9] flex h-9 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/65 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
