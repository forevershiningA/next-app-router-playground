import type React from 'react';

interface DimensionRangeCardProps {
  label: string;
  valueMm: number;
  minMm: number;
  maxMm: number;
  setValueMm: (value: number) => void;
  displayLength: (valueMm: number) => number;
  displayLengthToMm: (value: number) => number;
  step: number;
  numberValue?: (valueMm: number) => number;
  numberValueToMm?: (value: number) => number;
  numberMin?: number;
  numberMax?: number;
  numberStep?: number;
  lengthUnit: string;
  cardClass: string;
  headerClass: string;
  labelClass: string;
  controlButtonClass: string;
  numberInputBaseClass: string;
  rangeInputClass: string;
  rangeBlockClass: string;
  rangeBoundsClass: string;
  compactSizeRangeProps: React.InputHTMLAttributes<HTMLInputElement>;
  disabled?: boolean;
  clampOnBlur?: boolean;
  showInvalidState?: boolean;
}

export function DimensionRangeCard({
  label,
  valueMm,
  minMm,
  maxMm,
  setValueMm,
  displayLength,
  displayLengthToMm,
  step,
  numberValue = displayLength,
  numberValueToMm = displayLengthToMm,
  numberMin,
  numberMax,
  numberStep = step,
  lengthUnit,
  cardClass,
  headerClass,
  labelClass,
  controlButtonClass,
  numberInputBaseClass,
  rangeInputClass,
  rangeBlockClass,
  rangeBoundsClass,
  compactSizeRangeProps,
  disabled = false,
  clampOnBlur = true,
  showInvalidState = true,
}: DimensionRangeCardProps) {
  const displayValue = numberValue(valueMm);
  const displayMin = displayLength(minMm);
  const displayMax = displayLength(maxMm);
  const isOutOfBounds = valueMm < minMm || valueMm > maxMm;
  const numberInputClass = `${numberInputBaseClass} ${
    isOutOfBounds && showInvalidState
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
      : 'day:border-gray-300 border-white/10 focus:border-[#D7B356] focus:ring-[#D7B356]/30'
  }`;

  const clampValue = (value: number) => Math.max(minMm, Math.min(maxMm, value));

  return (
    <div className={cardClass}>
      <div className={headerClass}>
        <label className={labelClass}>{label}</label>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setValueMm(clampValue(valueMm - 10))}
            disabled={disabled}
            className={controlButtonClass}
            aria-label={`Decrease ${label.toLowerCase()} by 10mm`}
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
          <input
            type="number"
            min={numberMin ?? displayMin}
            max={numberMax ?? displayMax}
            step={numberStep}
            value={displayValue}
            onChange={(event) =>
              setValueMm(numberValueToMm(Number(event.target.value)))
            }
            onBlur={
              clampOnBlur
                ? (event) =>
                    setValueMm(
                      clampValue(numberValueToMm(Number(event.target.value))),
                    )
                : undefined
            }
            disabled={disabled}
            className={numberInputClass}
          />
          <button
            type="button"
            onClick={() => setValueMm(clampValue(valueMm + 10))}
            disabled={disabled}
            className={controlButtonClass}
            aria-label={`Increase ${label.toLowerCase()} by 10mm`}
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
          <span className="day:text-gray-600 text-sm font-semibold text-white/70">
            {lengthUnit}
          </span>
        </div>
      </div>
      <div className={rangeBlockClass}>
        <input
          type="range"
          min={displayMin}
          max={displayMax}
          step={step}
          value={displayValue}
          onChange={(event) =>
            setValueMm(displayLengthToMm(Number(event.target.value)))
          }
          disabled={disabled}
          {...compactSizeRangeProps}
          className={rangeInputClass}
        />
        <div className={rangeBoundsClass}>
          <span>
            {displayMin}
            {lengthUnit}
          </span>
          <span>
            {displayMax}
            {lengthUnit}
          </span>
        </div>
      </div>
    </div>
  );
}
