'use client';

import DesignerBrandHeader from '#/components/designer/navigation/DesignerBrandHeader';
import DesignerMenuGroups from '#/components/designer/navigation/DesignerMenuGroups';
import ProductConversionPanel from '#/components/designer/navigation/ProductConversionPanel';
import type { useDesignerNavPanelState } from '#/components/designer/navigation/useDesignerNavPanelState';
import type { useDesignerCanvasVisibility } from '#/components/designer/navigation/useDesignerCanvasVisibility';
import type { useDesignerMenuClick } from '#/components/designer/navigation/useDesignerMenuClick';
import type { useDesignerSaveWorkflow } from '#/components/designer/navigation/useDesignerSaveWorkflow';
import type { useDesignerProductConversion } from '#/components/designer/navigation/useDesignerProductConversion';

type PanelState = Pick<
  ReturnType<typeof useDesignerNavPanelState>,
  'activeFullscreenPanel' | 'setActiveFullscreenPanel'
>;
type WorkflowActions = Pick<
  ReturnType<typeof useDesignerSaveWorkflow>,
  'handleNewDesign' | 'handleProceedToPurchase'
>;
type ConversionState = ReturnType<typeof useDesignerProductConversion>;

type DesignerMainMenuViewProps = {
  productId: string | null;
  panelState: PanelState;
  canvasVisibility: ReturnType<typeof useDesignerCanvasVisibility>;
  handleMenuClick: ReturnType<typeof useDesignerMenuClick>;
  workflowActions: WorkflowActions;
  conversionState: ConversionState;
  isDayTheme: boolean;
  toggleTheme: () => void;
};

export default function DesignerMainMenuView({
  productId,
  panelState,
  canvasVisibility,
  handleMenuClick,
  workflowActions,
  conversionState,
  isDayTheme,
  toggleTheme,
}: DesignerMainMenuViewProps) {
  const {
    isOpen: showConvertPanel,
    toggle: handleToggleConvertPanel,
    close: closeConvertPanel,
    selectProduct: handleConvertProductSelect,
    products,
  } = conversionState;

  return (
    <>
      <DesignerBrandHeader isDayTheme={isDayTheme} toggleTheme={toggleTheme} />
      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6 md:space-y-0 md:px-5 md:py-6">
        <ProductConversionPanel
          isOpen={showConvertPanel}
          productId={productId}
          products={products}
          onClose={closeConvertPanel}
          onSelectProduct={handleConvertProductSelect}
        />
        <DesignerMenuGroups
          activeFullscreenPanel={panelState.activeFullscreenPanel}
          handleMenuClick={handleMenuClick}
          hasCanvasBeenShown={canvasVisibility.hasCanvasBeenShown}
          isCanvasVisible={canvasVisibility.isCanvasVisible}
          setActiveFullscreenPanel={panelState.setActiveFullscreenPanel}
          showConvertPanel={showConvertPanel}
          closeConvertPanel={closeConvertPanel}
          handleToggleConvertPanel={handleToggleConvertPanel}
          handleProceedToPurchase={workflowActions.handleProceedToPurchase}
          handleNewDesign={workflowActions.handleNewDesign}
        />
      </div>
    </>
  );
}
