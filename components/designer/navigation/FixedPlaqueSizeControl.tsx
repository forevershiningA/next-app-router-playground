import DesignerRangeInput from '#/components/designer/ui/DesignerRangeInput';
import type React from 'react';
import type { AudExchangeRates, SupportedCurrency } from '#/lib/currency';
import { formatAudPrice } from '#/lib/currency';
import type { FixedSize } from '#/lib/headstone-store.types';

interface FixedPlaqueSizeControlProps {
  sizes: FixedSize[];
  widthMm: number;
  heightMm: number;
  setWidthMm: (value: number) => void;
  setHeightMm: (value: number) => void;
  currency: SupportedCurrency;
  rates: AudExchangeRates;
  isCompact: boolean;
  controlButtonClass: string;
  dimensionCardClass: string;
  dimensionHeaderClass: string;
  dimensionLabelClass: string;
  rangeInputClass: string;
  rangeBoundsClass: string;
  compactSizeRangeProps: React.InputHTMLAttributes<HTMLInputElement>;
}

export function FixedPlaqueSizeControl({
  sizes,
  widthMm,
  heightMm,
  setWidthMm,
  setHeightMm,
  currency,
  rates,
  isCompact,
  controlButtonClass,
  dimensionCardClass,
  dimensionHeaderClass,
  dimensionLabelClass,
  rangeInputClass,
  rangeBoundsClass,
  compactSizeRangeProps,
}: FixedPlaqueSizeControlProps) {
  const maxSize = sizes.length;
  const isLandscape = widthMm > heightMm;
  const matchWidth = isLandscape ? heightMm : widthMm;
  const matchHeight = isLandscape ? widthMm : heightMm;
  const matchedSizeIndex = sizes.findIndex(
    (size) => size.width === matchWidth && size.height === matchHeight,
  );
  const selectedIndex = Math.max(
    1,
    matchedSizeIndex >= 0 ? matchedSizeIndex + 1 : 1,
  );
  const activeSize = sizes[selectedIndex - 1] ?? sizes[0];
  const displayedWidth = isLandscape ? activeSize.height : activeSize.width;
  const displayedHeight = isLandscape ? activeSize.width : activeSize.height;

  const applySize = (index: number) => {
    const size = sizes[Math.max(0, Math.min(maxSize - 1, index - 1))];
    setWidthMm(isLandscape ? size.height : size.width);
    setHeightMm(isLandscape ? size.width : size.height);
  };

  return (
    <div className="space-y-4">
      {!isCompact && (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 day:border-[#dfd7ca] day:bg-white day:shadow-sm">
          <div className="mb-1 font-sans text-xs font-semibold tracking-wider text-[#c49a45] uppercase day:text-[#9a742f]">
            Plaque Price
          </div>
          <div className="font-serif text-2xl font-normal text-white day:text-[#1a1714]">
            {formatAudPrice(activeSize.price, currency, rates)}
          </div>
        </div>
      )}

      <div className={dimensionCardClass}>
        <div className={dimensionHeaderClass}>
          <label className={dimensionLabelClass}>Size</label>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => applySize(selectedIndex - 1)}
              disabled={selectedIndex <= 1}
              className={controlButtonClass}
              aria-label="Smaller size"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>
            <span className="min-w-[90px] text-center font-sans text-sm font-semibold tabular-nums text-white day:text-[#1a1714]">
              {displayedWidth} × {displayedHeight} mm
            </span>
            <button
              type="button"
              onClick={() => applySize(selectedIndex + 1)}
              disabled={selectedIndex >= maxSize}
              className={controlButtonClass}
              aria-label="Larger size"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="relative">
          <DesignerRangeInput
            type="range"
            min={1}
            max={maxSize}
            step={1}
            value={selectedIndex}
            onChange={(event) => applySize(parseInt(event.target.value, 10))}
            {...compactSizeRangeProps}
            className={rangeInputClass}
          />
          <div className={rangeBoundsClass}>
            <span>
              {sizes[0].width}×{sizes[0].height}
              {'\u00a0'}mm
            </span>
            <span>
              {sizes[maxSize - 1].width}×{sizes[maxSize - 1].height}
              {'\u00a0'}mm
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
