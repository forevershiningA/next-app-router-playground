'use client';

import type { ComponentType, MouseEvent, SVGProps } from 'react';
import Link from 'next/link';
import BorderSelector from '#/components/designer/selectors/BorderSelector';
import MaterialSelector from '#/components/designer/selectors/MaterialSelector';
import { getMaterialMenuLabel } from '#/components/designer/navigation/designer-navigation-config';
import { useDesignerNavigationRoute } from '#/components/designer/navigation/useDesignerNavigationRoute';
import { useHeadstoneStore } from '#/lib/headstone-store';

interface DesignerBaseOptionMenuItemProps {
  mode: 'material' | 'border';
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  isActive: boolean;
  isCanvasVisible: boolean;
  productId: string | null;
  canSelectStainlessGraniteBaseMaterial: boolean;
  isUrn: boolean;
}

const activeButtonClass =
  'day:border-[#D7B356]/40 day:bg-[#DEBD68]/10 day:text-[#3d2817] border border-white/30 bg-white/15 text-white shadow-lg backdrop-blur-sm';
const idleButtonClass =
  'day:border-gray-200 day:text-gray-700 day:hover:border-gray-300 day:hover:bg-gray-100 border border-white/10 text-gray-200 hover:border-white/20 hover:bg-white/10';

export default function DesignerBaseOptionMenuItem({
  mode,
  icon: Icon,
  label,
  isActive,
  isCanvasVisible,
  productId,
  canSelectStainlessGraniteBaseMaterial,
  isUrn,
}: DesignerBaseOptionMenuItemProps) {
  const { router, designerStepSlug, designerHref } =
    useDesignerNavigationRoute();
  const selectedMotifId = useHeadstoneStore((state) => state.selectedMotifId);
  const selectedAdditionId = useHeadstoneStore(
    (state) => state.selectedAdditionId,
  );
  const materials = useHeadstoneStore((state) => state.materials);
  const borders = useHeadstoneStore((state) => state.borders);
  const setEditingObject = useHeadstoneStore((state) => state.setEditingObject);
  const setSelected = useHeadstoneStore((state) => state.setSelected);
  const forcedMaterialTarget = canSelectStainlessGraniteBaseMaterial
    ? 'base'
    : undefined;
  const itemSlug = mode === 'material' ? 'select-material' : 'select-border';
  const displayLabel =
    mode === 'material'
      ? getMaterialMenuLabel({
          canSelectStainlessGraniteBaseMaterial,
          productId,
          isUrn,
          defaultLabel: label,
        })
      : label;

  const selectMaterialTarget = () => {
    if (!forcedMaterialTarget) return;
    setEditingObject(forcedMaterialTarget);
    setSelected(forcedMaterialTarget);
  };

  const navigateToItem = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (mode === 'material') selectMaterialTarget();
    if (designerStepSlug !== itemSlug) {
      router.push(designerHref(itemSlug));
    }
  };

  return (
    <>
      {isCanvasVisible ? (
        <>
          <button
            type="button"
            onClick={navigateToItem}
            onMouseDown={(event) => event.preventDefault()}
            style={{ caretColor: 'transparent', userSelect: 'none' }}
            className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left text-base font-light transition-all ${
              isActive ? activeButtonClass : idleButtonClass
            }`}
          >
            <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <span className="select-none" style={{ caretColor: 'transparent' }}>
              {displayLabel}
            </span>
          </button>

          {isActive &&
            !selectedMotifId &&
            !selectedAdditionId &&
            (mode === 'border' || materials.length > 0) && (
              <div
                className={`mt-3 rounded-2xl border p-4 shadow-xl ${
                  mode === 'border'
                    ? 'day:border-[#ddd2c2] day:bg-[#f4f1eb]/95 border-[#3A3A3A] bg-[#1F1F1F]/95 backdrop-blur-sm'
                    : 'day:border-gray-200 day:bg-white h-[calc(100vh-280px)] overflow-hidden border-[#3A3A3A] bg-[#1F1F1F]/95'
                }`}
              >
                {mode === 'border' ? (
                  <BorderSelector borders={borders} />
                ) : (
                  materials.length > 0 && (
                    <div className="h-full overflow-y-auto pr-1">
                      <MaterialSelector
                        materials={materials}
                        disableInternalScroll
                        forceTarget={forcedMaterialTarget}
                      />
                    </div>
                  )
                )}
              </div>
            )}
        </>
      ) : (
        <Link
          href={mode === 'material' ? `/${itemSlug}` : designerHref(itemSlug)}
          data-section={itemSlug}
          onClick={mode === 'material' ? selectMaterialTarget : undefined}
          className={`flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-base font-light transition-all ${
            isActive
              ? 'day:border-[#b88a32] day:bg-[#f3e6c9] day:text-[#3d2817] border border-white/30 bg-white/15 text-white shadow-sm'
              : 'day:border-gray-200 day:text-gray-700 day:hover:border-gray-300 day:hover:bg-gray-100 border border-white/10 text-gray-200 hover:border-white/20 hover:bg-white/10'
          }`}
        >
          <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <span>{displayLabel}</span>
        </Link>
      )}
    </>
  );
}
