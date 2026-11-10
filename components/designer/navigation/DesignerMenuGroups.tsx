'use client';
import React from 'react';
import {
  CircleStackIcon,
  ViewfinderCircleIcon,
} from '@heroicons/react/24/outline';
import { useHeadstoneStore } from '#/lib/headstone-store';
import SelectSizePanel from '#/components/designer/navigation/SelectSizePanel';
import DesignerBaseOptionMenuItem from '#/components/designer/navigation/DesignerBaseOptionMenuItem';
import DesignerAdvancedMenuActions from '#/components/designer/navigation/DesignerAdvancedMenuActions';
import LoadDesignButton from '#/components/designer/actions/LoadDesignButton';
import DesignerMobilePurchaseAction from '#/components/designer/navigation/DesignerMobilePurchaseAction';
import DesignerNewDesignAction from '#/components/designer/navigation/DesignerNewDesignAction';
import DesignerCheckPriceMenuItem from '#/components/designer/navigation/DesignerCheckPriceMenuItem';
import DesignerSaveDesignMenuItem from '#/components/designer/navigation/DesignerSaveDesignMenuItem';
import DesignerStandardMenuItem from '#/components/designer/navigation/DesignerStandardMenuItem';
import StainlessSteelOptionMenuItem from '#/components/designer/navigation/StainlessSteelOptionMenuItem';
import DesignerMenuGroupHeader from '#/components/designer/navigation/DesignerMenuGroupHeader';
import { useDesignerNavigationItemStatus } from '#/components/designer/navigation/useDesignerNavigationItemStatus';
import { useDesignerProductCapabilities } from '#/components/designer/navigation/useDesignerProductCapabilities';
import { useMenuAccordionState } from '#/components/designer/navigation/useMenuAccordionState';
import { useHasDesignerCustomizations } from '#/components/designer/navigation/useHasDesignerCustomizations';
import { useDesignerNavigationRoute } from '#/components/designer/navigation/useDesignerNavigationRoute';
import {
  fullscreenPanelSlugs,
  getMenuItemDisplayName,
  isMenuItemVisible,
  menuGroups,
} from '#/components/designer/navigation/designer-navigation-config';

type Props = {
  activeFullscreenPanel: string | null;
  handleMenuClick: (
    slug: string,
    event: React.MouseEvent,
  ) => void | Promise<void>;
  hasCanvasBeenShown: boolean;
  isCanvasVisible: boolean;
  setActiveFullscreenPanel: (panel: string | null) => void;
  showConvertPanel: boolean;
  closeConvertPanel: () => void;
  handleToggleConvertPanel: (event: React.MouseEvent) => void;
  handleProceedToPurchase: () => Promise<void>;
  handleNewDesign: (event: React.MouseEvent) => void;
};

export default function DesignerMenuGroups({
  activeFullscreenPanel,
  handleMenuClick,
  hasCanvasBeenShown,
  isCanvasVisible,
  setActiveFullscreenPanel,
  showConvertPanel,
  closeConvertPanel,
  handleToggleConvertPanel,
  handleProceedToPurchase,
  handleNewDesign,
}: Props) {
  const { designerStepSlug, productId, designerHref, pathname } =
    useDesignerNavigationRoute();
  const catalog = useHeadstoneStore((s) => s.catalog);
  const selectedMotifId = useHeadstoneStore((s) => s.selectedMotifId);
  const selectedAdditionId = useHeadstoneStore((s) => s.selectedAdditionId);
  const {
    isPlaque,
    hasBorder,
    isStainlessSteelHeadstone,
    isUrn,
    canSelectStainlessGraniteBaseMaterial,
    shouldHideMaterialStep,
    supportsFlowerPots,
  } = useDesignerProductCapabilities({ productId });
  const { activeGroupIndex, openGroup, toggleGroup, expandedSections } =
    useMenuAccordionState(designerStepSlug, pathname);
  const { getItemStatus, getItemCount } = useDesignerNavigationItemStatus();
  const hasCustomizations = useHasDesignerCustomizations();
  return (
    <div className="flex flex-col gap-3">
      <DesignerNewDesignAction
        isVisible={hasCustomizations}
        onNewDesign={handleNewDesign}
      />
      <LoadDesignButton label="Load Design" variant="menu" />
      {menuGroups.map((group, groupIndex) => {
        const isCurrentGroup = groupIndex === activeGroupIndex;
        const isPastGroup = activeGroupIndex > groupIndex;
        return (
          <div key={group.label} className="relative">
            <div
              className={`rounded-xl border p-2.5 transition-all duration-200 ${
                isCurrentGroup
                  ? 'border-[#c49a45]/40 bg-white/[0.035] day:border-[#9a742f]/40 day:bg-[#fbf9f5] day:shadow-xs'
                  : 'border-white/10 bg-transparent hover:border-white/20 day:border-[#dfd7ca] day:bg-white/40 day:hover:border-[#cdbb9f]'
              }`}
            >
              <DesignerMenuGroupHeader
                label={group.label}
                index={groupIndex}
                isCurrent={isCurrentGroup}
                isPast={isPastGroup}
                isOpen={openGroup === groupIndex}
                onToggle={() => toggleGroup(groupIndex)}
              />

              {/* Group Items — collapsible */}
              <div
                id={`designer-menu-group-${groupIndex}-items`}
                role="region"
                aria-label={group.label}
                aria-hidden={openGroup !== groupIndex}
                inert={openGroup !== groupIndex}
                className={`flex flex-col gap-1.5 overflow-hidden ${
                  openGroup !== groupIndex
                    ? 'max-h-0 opacity-0'
                    : 'max-h-[2000px] opacity-100'
                }`}
              >
                {group.items.map((item, index) => {
                  const Icon = item.icon;
                  const isRouteActive =
                    designerStepSlug === item.slug ||
                    pathname === `/${item.slug}` ||
                    Boolean(item.slug && pathname?.startsWith(`/${item.slug}`));
                  const isPanelActive = activeFullscreenPanel === item.slug;
                  const isActive = isRouteActive || isPanelActive;
                  const itemStatus = getItemStatus(item.slug);
                  const itemCount = getItemCount(item.slug);

                  if (
                    !isMenuItemVisible(item, {
                      productId,
                      productLaser: catalog?.product?.laser,
                      isPlaque,
                      hasBorder,
                      isStainlessSteelHeadstone,
                      shouldHideMaterialStep,
                    })
                  ) {
                    return null;
                  }

                  // "Select Size & Base" for upright headstones; "Select Size" everywhere else
                  const displayName = getMenuItemDisplayName(
                    item.slug,
                    item.name,
                    catalog?.product.type,
                  );

                  // Special handling for Corners — button opens fullscreen panel (like Select Material)
                  if (item.slug === 'corners') {
                    const isCornersActive = activeFullscreenPanel === 'corners';
                    return (
                      <StainlessSteelOptionMenuItem
                        key={item.slug}
                        icon={ViewfinderCircleIcon}
                        label="Select Corners"
                        isActive={isCornersActive}
                        onClick={() =>
                          setActiveFullscreenPanel(
                            isCornersActive ? null : 'corners',
                          )
                        }
                      />
                    );
                  }

                  // Special handling for Holes — button opens sub-panel (same pattern as Corners)
                  if (item.slug === 'holes') {
                    const isHolesActive = activeFullscreenPanel === 'holes';
                    return (
                      <StainlessSteelOptionMenuItem
                        key={item.slug}
                        icon={CircleStackIcon}
                        label="Select Holes"
                        isActive={isHolesActive}
                        onClick={() =>
                          setActiveFullscreenPanel(
                            isHolesActive ? null : 'holes',
                          )
                        }
                      />
                    );
                  }

                  if (
                    fullscreenPanelSlugs.has(item.slug) &&
                    item.slug !== 'select-material'
                  ) {
                    const shouldRenderInlinePanel =
                      item.slug === 'select-size' &&
                      designerStepSlug === 'select-size' &&
                      !selectedMotifId &&
                      !selectedAdditionId &&
                      activeFullscreenPanel === 'select-size';

                    return (
                      <React.Fragment key={item.slug}>
                        <button
                          type="button"
                          data-section={item.slug}
                          onClick={(e) => handleMenuClick(item.slug, e)}
                          onMouseDown={(e) => e.preventDefault()}
                          style={{
                            caretColor: 'transparent',
                            userSelect: 'none',
                          }}
                          className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-normal transition-all duration-200 ${
                            isActive
                              ? 'border border-[#c49a45]/40 bg-[#c49a45]/15 text-[#f0d89f] shadow-sm day:border-[#9a742f]/40 day:bg-[#9a742f]/10 day:text-[#78541c]'
                              : 'border border-transparent text-white/70 hover:border-white/15 hover:bg-white/[0.06] hover:text-white day:border-transparent day:text-[#5a5248] day:hover:border-[#dfd7ca] day:hover:bg-[#f0ebe1] day:hover:text-[#1a1714]'
                          }`}
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          <span
                            className="select-none"
                            style={{ caretColor: 'transparent' }}
                          >
                            {displayName}
                          </span>
                        </button>

                        {shouldRenderInlinePanel && (
                          <SelectSizePanel
                            isPlaque={isPlaque}
                            isStainlessSteelHeadstone={
                              isStainlessSteelHeadstone
                            }
                            supportsFlowerPots={supportsFlowerPots}
                            extraClassName="mt-3"
                          />
                        )}
                      </React.Fragment>
                    );
                  }

                  // Special handling for Select Border - show border selector in sidebar when canvas is visible
                  if (item.slug === 'select-border') {
                    return (
                      <DesignerBaseOptionMenuItem
                        key={item.slug}
                        mode="border"
                        icon={Icon}
                        label={displayName}
                        isActive={isActive}
                        isCanvasVisible={isCanvasVisible}
                        productId={productId}
                        canSelectStainlessGraniteBaseMaterial={
                          canSelectStainlessGraniteBaseMaterial
                        }
                        isUrn={isUrn}
                      />
                    );
                  }

                  // Special handling for Select Material - show material selector in sidebar when canvas is visible
                  if (item.slug === 'select-material') {
                    return (
                      <DesignerBaseOptionMenuItem
                        key={item.slug}
                        mode="material"
                        icon={Icon}
                        label={item.name}
                        isActive={isActive}
                        isCanvasVisible={isCanvasVisible}
                        productId={productId}
                        canSelectStainlessGraniteBaseMaterial={
                          canSelectStainlessGraniteBaseMaterial
                        }
                        isUrn={isUrn}
                      />
                    );
                  }

                  // Special handling for Save Design - always a button, never navigate
                  if (item.slug === 'check-price') {
                    return (
                      <DesignerCheckPriceMenuItem
                        key={item.slug}
                        icon={Icon}
                        label={displayName}
                        href={designerHref(item.slug)}
                        onClick={(e) => handleMenuClick(item.slug, e)}
                      />
                    );
                  }

                  // Special handling for Save Design - always a button, never navigate
                  if (item.slug === 'save-design') {
                    return (
                      <DesignerSaveDesignMenuItem
                        key={item.slug}
                        icon={Icon}
                        label={displayName}
                        onClick={(event) => handleMenuClick(item.slug, event)}
                      />
                    );
                  }

                  // Determine if step should be disabled (steps 3-10 need a product selected)
                  // Exception: Check Price is always enabled (users can see base price even with empty headstone)
                  const needsProduct =
                    index >= 2 && item.slug !== 'check-price';
                  const isDisabled = needsProduct && !catalog;

                  return (
                    <DesignerStandardMenuItem
                      key={item.slug}
                      icon={Icon}
                      slug={item.slug}
                      label={displayName}
                      isActive={isActive}
                      isDisabled={isDisabled}
                      status={itemStatus}
                      count={itemCount}
                      isExpanded={Boolean(expandedSections[item.slug])}
                      onClick={(event) => handleMenuClick(item.slug, event)}
                    />
                  );
                })}
                {group.label === 'Setup' && (
                  <>
                    <DesignerAdvancedMenuActions
                      productId={productId}
                      isCanvasAvailable={isCanvasVisible || hasCanvasBeenShown}
                      showConvertPanel={showConvertPanel}
                      onCloseConvertPanel={closeConvertPanel}
                      onToggleConvertPanel={handleToggleConvertPanel}
                    />
                  </>
                )}
                {group.label === 'Account' && (
                  <DesignerMobilePurchaseAction
                    onPurchase={() => void handleProceedToPurchase()}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
