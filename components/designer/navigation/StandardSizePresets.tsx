'use client';

import { useShallow } from 'zustand/react/shallow';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { useCurrency } from '#/lib/use-currency';
import {
  formatDimensionPair,
  resolveUnitSystemFromCurrency,
} from '#/lib/unit-system';
import {
  STANDARD_MEMORIAL_SIZES,
  isStandardSizeAvailable,
  getMatchingBaseSize,
  type StandardSizeTarget,
} from '#/lib/standard-memorial-sizes';
import { DesignerOptionButton } from '#/components/designer/ui/DesignerControl';

export default function StandardSizePresets({
  target,
}: {
  target: StandardSizeTarget;
}) {
  const { currency } = useCurrency();
  const unitSystem = resolveUnitSystemFromCurrency(currency);
  const marketSizes = STANDARD_MEMORIAL_SIZES[currency];
  const {
    widthMm,
    heightMm,
    minWidthMm,
    maxWidthMm,
    minHeightMm,
    maxHeightMm,
    setWidthMm,
    setHeightMm,
    disabled,
  } = useHeadstoneStore(
    useShallow((state) => {
      const isBase = target === 'base';
      return {
        widthMm: isBase ? state.baseWidthMm : state.widthMm,
        heightMm: isBase ? state.baseHeightMm : state.heightMm,
        minWidthMm: isBase
          ? Math.max(state.minBaseWidthMm, state.widthMm)
          : state.minWidthMm,
        maxWidthMm: isBase ? state.maxBaseWidthMm : state.maxWidthMm,
        minHeightMm: isBase ? state.minBaseHeightMm : state.minHeightMm,
        maxHeightMm: isBase ? state.maxBaseHeightMm : state.maxHeightMm,
        setWidthMm: isBase ? state.setBaseWidthMm : state.setWidthMm,
        setHeightMm: isBase ? state.setBaseHeightMm : state.setHeightMm,
        disabled: isBase && !state.showBase,
      };
    }),
  );
  const limits = { minWidthMm, maxWidthMm, minHeightMm, maxHeightMm };

  return (
    <div
      role="group"
      aria-label={`Standard ${target} sizes`}
      className="space-y-2 px-1 py-1"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs text-[var(--designer-text-muted)]">
        <span className="font-medium">
          Standard sizes · {marketSizes.market}
        </span>
        <span>Width × height</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {marketSizes[target].map((size) => {
          const available = !disabled && isStandardSizeAvailable(size, limits);
          const label = formatDimensionPair(
            size.widthMm,
            size.heightMm,
            unitSystem,
          );
          return (
            <DesignerOptionButton
              key={`${size.widthMm}-${size.heightMm}`}
              selected={widthMm === size.widthMm && heightMm === size.heightMm}
              disabled={!available}
              title={
                available
                  ? label
                  : `${label} — outside the available size range`
              }
              onClick={() => {
                setWidthMm(size.widthMm);
                setHeightMm(size.heightMm);
                if (target === 'headstone') {
                  const state = useHeadstoneStore.getState();
                  if (!state.showBase) return;
                  const stand = state.catalog?.product.shapes[0]?.stand;
                  const base = getMatchingBaseSize(
                    currency,
                    state.widthMm,
                    state.headstoneStyle === 'slant'
                      ? state.slantThickness
                      : state.uprightThickness,
                    {
                      minWidthMm: state.minBaseWidthMm,
                      maxWidthMm: state.maxBaseWidthMm,
                      minHeightMm: state.minBaseHeightMm,
                      maxHeightMm: state.maxBaseHeightMm,
                      minDepthMm: stand?.minDepth ?? state.minThicknessMm,
                      maxDepthMm: stand?.maxDepth ?? state.maxThicknessMm,
                    },
                  );
                  state.setBaseWidthMm(base.widthMm);
                  state.setBaseHeightMm(base.heightMm);
                  state.setBaseThickness(base.depthMm);
                }
              }}
              className="rounded-md px-3 py-1.5 text-xs font-semibold tabular-nums disabled:cursor-not-allowed disabled:opacity-40"
            >
              {label}
            </DesignerOptionButton>
          );
        })}
      </div>
    </div>
  );
}
