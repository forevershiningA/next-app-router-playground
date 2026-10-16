'use client';

import { useMobileNavStore } from '#/lib/mobile-nav-store';
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
    <div className="flex h-full min-h-0 flex-col">
      <GuidedDesktopHeader
        title={title}
        activeFullscreenPanel={activeFullscreenPanel}
        currentSlugFromPathname={navigation.currentSlugFromPathname}
        currentPanelIndex={navigation.currentPanelIndex}
        panelCount={navigation.navigablePanelSlugs.length}
        guidedQuickNavSlugs={navigation.guidedQuickNavSlugs}
        productId={productId}
        isImageCropActive={navigation.isImageCropActive}
        prevPanelSlug={navigation.prevPanelSlug}
        nextPanelSlug={navigation.nextPanelSlug}
        prevPanelTitle={navigation.prevPanelTitle}
        nextPanelTitle={navigation.nextPanelTitle}
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
        className={`min-h-0 flex-1 overflow-y-auto p-3 md:p-4 ${
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
    </div>
  );
}
