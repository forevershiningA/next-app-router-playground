'use client';

import { useTheme } from '#/components/theme/ThemeProvider';
import { useLocalDesignDraft } from '#/lib/use-local-design-draft';
import StainlessSteelOptionsPanel from '#/components/designer/navigation/StainlessSteelOptionsPanel';
import { useGuidedNavigation } from '#/components/designer/navigation/useGuidedNavigation';
import { useDesignerNavPanelState } from '#/components/designer/navigation/useDesignerNavPanelState';
import { useDesignerPanelRouteSync } from '#/components/designer/navigation/useDesignerPanelRouteSync';
import { useDesignerSaveWorkflow } from '#/components/designer/navigation/useDesignerSaveWorkflow';
import { useDesignerProductConversion } from '#/components/designer/navigation/useDesignerProductConversion';
import { useDesignerProductCapabilities } from '#/components/designer/navigation/useDesignerProductCapabilities';
import DesignerFullscreenPanelView from '#/components/designer/navigation/DesignerFullscreenPanelView';
import DesignerMainMenuView from '#/components/designer/navigation/DesignerMainMenuView';
import { useDesignerCanvasVisibility } from '#/components/designer/navigation/useDesignerCanvasVisibility';
import { useDesignerPanelCatalogVisibility } from '#/components/designer/navigation/useDesignerPanelCatalogVisibility';
import { useDesignerCanvasStepNavigation } from '#/components/designer/navigation/useDesignerCanvasStepNavigation';
import { useStainlessSteelDesignerRouteGuard } from '#/components/designer/navigation/useStainlessSteelDesignerRouteGuard';
import { useDesignerMenuClick } from '#/components/designer/navigation/useDesignerMenuClick';
import DesignerWorkflowModals from '#/components/designer/navigation/DesignerWorkflowModals';
import { useDesignerPanelLoadingState } from '#/components/designer/navigation/useDesignerPanelLoadingState';
import { useDesignerBackToMenu } from '#/components/designer/navigation/useDesignerBackToMenu';
import { useDesignerNavigationRoute } from '#/components/designer/navigation/useDesignerNavigationRoute';

export default function DesignerNav() {
  useLocalDesignDraft();
  const { pathname, designerStepSlug, productId, designerHref } =
    useDesignerNavigationRoute();
  const { theme, toggleTheme } = useTheme();
  const isDayTheme = theme === 'day';

  // Determine selected product capabilities
  const {
    isPlaque,
    isUrn,
    hasBorder,
    isStainlessSteelHeadstone,
    productLaser,
    canSelectStainlessGraniteBaseMaterial,
    shouldHideMaterialStep,
  } = useDesignerProductCapabilities({ productId });

  const {
    activeFullscreenPanel,
    setActiveFullscreenPanel,
    dismissedPanelSlug,
    setDismissedPanelSlug,
    panelSource,
    setPanelSource,
    forceAdditionCatalog,
    forceMotifCatalog,
    openFullscreenPanel,
    closeFullscreenPanel,
    handleBackToAdditionList,
    handleBackToMotifList,
  } = useDesignerNavPanelState({ designerStepSlug });
  const conversionState = useDesignerProductConversion({ productId });
  const { isCanvasVisible, hasCanvasBeenShown } =
    useDesignerCanvasVisibility(designerStepSlug);
  const handleBackToMenu = useDesignerBackToMenu({
    closeFullscreenPanel,
    designerHref,
    designerStepSlug,
    pathname,
  });
  const {
    showSaveDesignModal,
    setShowSaveDesignModal,
    showNewDesignConfirm,
    setShowNewDesignConfirm,
    isSavingDesign,
    showGuestCheckout,
    setShowGuestCheckout,
    openSaveDesign,
    handleSaveDesign,
    handleProceedToPurchase,
    handleNewDesign,
    handleConfirmNewDesign,
    handleGuestCheckoutSuccess,
  } = useDesignerSaveWorkflow();

  const { isLoadingPanel, setIsLoadingPanel } = useDesignerPanelLoadingState(
    pathname,
    activeFullscreenPanel,
  );

  const shouldShowFullscreenPanel =
    Boolean(activeFullscreenPanel) &&
    activeFullscreenPanel !== 'corners' &&
    activeFullscreenPanel !== 'holes';
  const guidedNavigation = useGuidedNavigation({
    productId,
    isPlaque,
    isUrn,
    isStainlessSteelHeadstone,
    hasBorder,
    shouldHideMaterialStep,
    productLaser,
    activeFullscreenPanel,
    designerStepSlug,
  });

  const handleNavigateToPanel = useDesignerCanvasStepNavigation({
    designerHref,
    designerStepSlug,
    isCanvasVisible,
    isImageCropActive: guidedNavigation.isImageCropActive,
    canSelectStainlessGraniteBaseMaterial,
    openFullscreenPanel,
    openSaveDesign,
    setIsLoadingPanel,
  });

  useStainlessSteelDesignerRouteGuard({
    canSelectStainlessGraniteBaseMaterial,
    designerHref,
    designerStepSlug,
    isStainlessSteelHeadstone,
    setActiveFullscreenPanel,
    setPanelSource,
  });

  const { shouldShowBackToListButton } = useDesignerPanelCatalogVisibility({
    activeFullscreenPanel,
    forceAdditionCatalog,
    forceMotifCatalog,
    designerStepSlug,
    panelSource,
  });

  useDesignerPanelRouteSync({
    pathname,
    designerStepSlug,
    isCanvasVisible,
    isPlaque,
    activeFullscreenPanel,
    dismissedPanelSlug,
    panelSource,
    setActiveFullscreenPanel,
    setDismissedPanelSlug,
    setPanelSource,
  });

  const handleMenuClick = useDesignerMenuClick({
    canSelectStainlessGraniteBaseMaterial,
    designerHref,
    designerStepSlug,
    isCanvasVisible,
    openFullscreenPanel,
    openSaveDesign,
    setIsLoadingPanel,
  });

  return (
    <nav className="day:bg-[#eee9df] day:text-[#1d1a17] fs-designer-nav flex h-full min-h-0 flex-col overflow-hidden bg-[#1d1a17] text-white">
      {/* Full-Screen Panel Overlay */}
      {shouldShowFullscreenPanel ? (
        <DesignerFullscreenPanelView
          activeFullscreenPanel={activeFullscreenPanel}
          designerStepSlug={designerStepSlug}
          forceAdditionCatalog={forceAdditionCatalog}
          forceMotifCatalog={forceMotifCatalog}
          isDayTheme={isDayTheme}
          isLoading={isLoadingPanel}
          navigation={guidedNavigation}
          onBackToList={
            activeFullscreenPanel === 'select-additions'
              ? handleBackToAdditionList
              : handleBackToMotifList
          }
          onBackToMenu={handleBackToMenu}
          onNavigate={handleNavigateToPanel}
          panelSource={panelSource}
          productId={productId}
          showBackToListButton={shouldShowBackToListButton}
          toggleTheme={toggleTheme}
        />
      ) : activeFullscreenPanel === 'corners' ||
        activeFullscreenPanel === 'holes' ? (
        <StainlessSteelOptionsPanel
          mode={activeFullscreenPanel}
          onBack={() => setActiveFullscreenPanel(null)}
        />
      ) : (
        <DesignerMainMenuView
          productId={productId}
          panelState={{ activeFullscreenPanel, setActiveFullscreenPanel }}
          canvasVisibility={{ isCanvasVisible, hasCanvasBeenShown }}
          handleMenuClick={handleMenuClick}
          workflowActions={{ handleNewDesign, handleProceedToPurchase }}
          conversionState={conversionState}
          isDayTheme={isDayTheme}
          toggleTheme={toggleTheme}
        />
      )}

      <DesignerWorkflowModals
        showSaveDesignModal={showSaveDesignModal}
        setShowSaveDesignModal={setShowSaveDesignModal}
        showNewDesignConfirm={showNewDesignConfirm}
        setShowNewDesignConfirm={setShowNewDesignConfirm}
        isSavingDesign={isSavingDesign}
        showGuestCheckout={showGuestCheckout}
        setShowGuestCheckout={setShowGuestCheckout}
        handleSaveDesign={handleSaveDesign}
        handleConfirmNewDesign={handleConfirmNewDesign}
        handleGuestCheckoutSuccess={handleGuestCheckoutSuccess}
      />
    </nav>
  );
}
