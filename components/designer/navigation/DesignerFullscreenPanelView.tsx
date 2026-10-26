'use client';

import { useMobileNavStore } from '#/lib/mobile-nav-store';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import FullscreenDesignerPanelContent from '#/components/designer/navigation/FullscreenDesignerPanelContent';
import GuidedDesktopHeader from '#/components/designer/navigation/GuidedDesktopHeader';
import MobileDesignerNavigationOverlays from '#/components/designer/navigation/MobileDesignerNavigationOverlays';
import type { useGuidedNavigation } from '#/components/designer/navigation/useGuidedNavigation';

type NavigationState = ReturnType<typeof useGuidedNavigation>;

type DesignerFullscreenPanelViewProps = {
  activeFullscreenPanel: string | null;
  designerStepSlug: string | null;
  forceAdditionCatalog: boolean;
  forceMotifCatalog: boolean;
  isDayTheme: boolean;
  isLoading: boolean;
  navigation: NavigationState;
  onBackToList: () => void;
  onBackToMenu: () => void;
  onNavigate: (slug: string) => void | Promise<void>;
  panelSource: 'menu' | 'canvas' | null;
  productId: string | null;
  showBackToListButton: boolean;
  toggleTheme: () => void;
};

export default function DesignerFullscreenPanelView({
  activeFullscreenPanel,
  designerStepSlug,
  forceAdditionCatalog,
  forceMotifCatalog,
  isDayTheme,
  isLoading,
  navigation,
  onBackToList,
  onBackToMenu,
  onNavigate,
  panelSource,
  productId,
  showBackToListButton,
  toggleTheme,
}: DesignerFullscreenPanelViewProps) {
  const isSizeAdjustmentCompact = useMobileNavStore(
    (state) => state.isSizeAdjustmentCompact,
  );
  const title = navigation.getPanelDisplayName(activeFullscreenPanel);
  const mobileTitle =
    activeFullscreenPanel === 'inscriptions'
      ? 'Inscriptions'
      : activeFullscreenPanel === 'select-images'
        ? 'Images'
        : activeFullscreenPanel === 'select-additions'
          ? 'Additions'
          : activeFullscreenPanel === 'select-size'
            ? 'Sizing & Base'
            : title;

  return (
    <div className="day:bg-[#eee9df] flex h-full min-h-0 flex-col bg-[#1d1a17]">
      <GuidedDesktopHeader
        isDayTheme={isDayTheme}
        toggleTheme={toggleTheme}
        title={title}
        activeFullscreenPanel={activeFullscreenPanel}
        currentSlugFromPathname={navigation.currentSlugFromPathname}
        guidedQuickNavSlugs={navigation.guidedQuickNavSlugs}
        productId={productId}
        showBackToListButton={showBackToListButton}
        onBackToMenu={onBackToMenu}
        onBackToList={onBackToList}
        onNavigate={onNavigate}
      />
      <MobileDesignerNavigationOverlays
        currentPanelIndex={navigation.currentPanelIndex}
        panelCount={navigation.navigablePanelSlugs.length}
        title={mobileTitle}
        activeFullscreenPanel={activeFullscreenPanel}
        guidedQuickNavSlugs={navigation.guidedQuickNavSlugs}
        productId={productId}
        handleBackToMenu={onBackToMenu}
        toggleTheme={toggleTheme}
        isDayTheme={isDayTheme}
        prevPanelSlug={navigation.prevPanelSlug}
        nextPanelSlug={navigation.nextPanelSlug}
        prevPanelTitle={navigation.prevPanelTitle}
        nextPanelTitle={navigation.nextPanelTitle}
        isImageCropActive={navigation.isImageCropActive}
        designerStepSlug={designerStepSlug}
        onNavigate={onNavigate}
      />
      <div
        className={`min-h-0 flex-1 overflow-y-auto p-3 ${
          isSizeAdjustmentCompact
            ? 'pb-3'
            : 'pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-4'
        }`}
      >
        <FullscreenDesignerPanelContent
          activePanel={activeFullscreenPanel}
          isLoading={isLoading}
          panelSource={panelSource}
          forceAdditionCatalog={forceAdditionCatalog}
          forceMotifCatalog={forceMotifCatalog}
        />
      </div>
      {activeFullscreenPanel &&
        (navigation.prevPanelSlug || navigation.nextPanelSlug) && (
          <div className="hidden shrink-0 items-center gap-3 border-t border-[var(--designer-border)] p-3 md:flex">
            {navigation.prevPanelSlug && (
              <button
                type="button"
                onClick={() => onNavigate(navigation.prevPanelSlug!)}
                className="flex min-h-11 items-center gap-1 rounded-md px-3 text-sm text-[var(--designer-text-muted)] transition-colors hover:bg-[var(--designer-control-hover)] focus-visible:outline-2 focus-visible:outline-[var(--designer-focus)]"
              >
                <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
                Back
              </button>
            )}
            {navigation.nextPanelSlug && (
              <button
                type="button"
                onClick={() => onNavigate(navigation.nextPanelSlug!)}
                disabled={navigation.isImageCropActive}
                className="ml-auto flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-[var(--designer-accent)] px-4 text-sm font-semibold text-[var(--designer-accent-foreground)] transition-colors hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--designer-focus)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {navigation.isImageCropActive
                  ? 'Finish crop'
                  : `Next: ${navigation.nextPanelTitle?.replace(/^Select\s+/i, '') ?? 'Continue'}`}
                <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        )}
    </div>
  );
}
