'use client';

import React from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import { GuidedQuickNavItems } from '#/components/designer/navigation/GuidedQuickNavItems';

type GuidedDesktopHeaderProps = {
  title: string | undefined;
  activeFullscreenPanel: string | null;
  currentSlugFromPathname: string;
  currentPanelIndex: number;
  panelCount: number;
  guidedQuickNavSlugs: string[];
  productId: string | null;
  isImageCropActive: boolean;
  prevPanelSlug: string | null;
  nextPanelSlug: string | null;
  prevPanelTitle: string | undefined;
  nextPanelTitle: string | undefined;
  showBackToListButton: boolean;
  onBackToMenu: () => void;
  onBackToList: () => void;
  onNavigate: (slug: string) => void | Promise<void>;
};

export default function GuidedDesktopHeader({
  title,
  activeFullscreenPanel,
  currentSlugFromPathname,
  currentPanelIndex,
  panelCount,
  guidedQuickNavSlugs,
  productId,
  isImageCropActive,
  prevPanelSlug,
  nextPanelSlug,
  prevPanelTitle,
  nextPanelTitle,
  showBackToListButton,
  onBackToMenu,
  onBackToList,
  onNavigate,
}: GuidedDesktopHeaderProps) {
  const quickNavRef = React.useRef<HTMLDivElement>(null);

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
    <div className="day:border-[#cfc5b7] day:bg-[#eee9df] relative hidden border-b border-white/10 bg-[#1d1a17] px-5 py-3 md:block">
      <div className="mb-1 flex items-center justify-center gap-2.5 md:mb-2">
        <p className="day:text-[#756c62] text-[11px] tracking-[0.08em] text-white/50">
          Guided Step
        </p>
        {currentPanelIndex >= 0 && (
          <span className="day:border-[#d8cfbf] day:bg-[#fbf9f4] day:text-[#5c4a32] inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-xs font-medium">
            <span className="text-primary font-semibold">
              {currentPanelIndex + 1}
            </span>
            <span className="day:text-[#9b8c77] text-white/30">/</span>
            <span className="day:text-[#6b5a43] text-white/50">
              {panelCount}
            </span>
          </span>
        )}
      </div>
      <h2 className="day:text-[#1d1a17] my-4 text-center font-serif text-3xl font-normal tracking-[-0.02em] text-white">
        {title}
      </h2>
      <div className="day:bg-[#cfc5b7] my-3 h-px bg-white/10" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToMenu}
            className="day:border-[#bdb4a6] day:bg-white/25 day:text-[#302719] day:hover:border-[#9a742f] day:hover:bg-white/55 day:hover:text-[#302719] inline-flex items-center gap-1.5 rounded-sm border border-white/20 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:border-[#cfac6c]/70 hover:text-white"
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
          {showBackToListButton && (
            <button
              onClick={onBackToList}
              className="day:border-[#ddd2c2] day:bg-[#fbf9f5] day:text-[#302719] day:hover:border-[#cdbb9f] day:hover:bg-[#eee6d9] day:hover:text-[#1d1a17] inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 transition-colors duration-200 hover:border-white/50 hover:bg-white/15 hover:text-white"
            >
              <Squares2X2Icon className="h-3 w-3" aria-hidden="true" />
              List
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => prevPanelSlug && onNavigate(prevPanelSlug)}
            disabled={!prevPanelSlug}
            title={prevPanelTitle}
            className="day:border-[#bdb4a6] day:bg-white/25 day:text-[#302719] day:hover:border-[#9a742f] day:hover:bg-white/55 day:hover:text-[#302719] inline-flex items-center gap-1.5 rounded-sm border border-white/20 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:border-[#cfac6c]/70 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <span aria-hidden="true">←</span>
            Prev
          </button>
          <button
            onClick={() => nextPanelSlug && onNavigate(nextPanelSlug)}
            disabled={!nextPanelSlug || isImageCropActive}
            title={
              isImageCropActive
                ? 'Add the cropped image to the headstone before continuing'
                : nextPanelTitle
            }
            className="animate-guided-next-gold-flash day:border-[#1d1a17] day:bg-[#1d1a17] day:text-white day:hover:bg-[#3a332c] inline-flex items-center gap-1.5 rounded-sm border border-[#cfac6c]/70 bg-transparent px-3 py-1.5 text-xs font-semibold text-[#f0d89f] transition-colors hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-30"
          >
            {isImageCropActive ? 'Finish Crop First' : 'Next'}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
      <div className="day:border-[#ddd2c2] mt-3 flex items-center gap-1 border-t border-white/10 pt-2">
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
