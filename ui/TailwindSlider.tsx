'use client';

import React from 'react';
import {
  displayLengthValueFromMm,
  getLengthUnitLabel,
  lengthValueToMm,
} from '#/lib/unit-system';
import { useUnitSystem } from '#/lib/use-unit-system';

interface TailwindSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  unit?: string;
}

export default function TailwindSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit,
}: TailwindSliderProps) {
  const unitSystem = useUnitSystem();
  const isLength = unit === 'mm';
  const displayLength = React.useCallback(
    (millimetres: number) =>
      millimetres < 0
        ? -displayLengthValueFromMm(Math.abs(millimetres), unitSystem)
        : displayLengthValueFromMm(millimetres, unitSystem),
    [unitSystem],
  );
  const displayedValue = isLength ? displayLength(value) : value;
  const displayedMin = isLength ? displayLength(min) : min;
  const displayedMax = isLength ? displayLength(max) : max;
  const displayedStep = isLength && unitSystem === 'imperial' ? 1 : step;
  const displayedUnit = isLength ? getLengthUnitLabel(unitSystem) : unit;
  const [textValue, setTextValue] = React.useState(String(displayedValue));

  React.useEffect(() => {
    setTextValue(String(displayedValue));
  }, [displayedValue]);

  const valueFromDisplay = React.useCallback(
    (displayValue: number) =>
      isLength ? lengthValueToMm(displayValue, unitSystem) : displayValue,
    [isLength, unitSystem],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextValue(e.target.value);
  };

  const handleInputBlur = () => {
    const parsedValue = parseFloat(textValue);
    if (!isNaN(parsedValue)) {
      const clampedValue = Math.min(
        displayedMax,
        Math.max(displayedMin, parsedValue),
      );
      onChange(valueFromDisplay(clampedValue));
    } else {
      setTextValue(String(displayedValue));
    }
  };

  const decrement = () => {
    const newValue = Math.max(displayedMin, displayedValue - displayedStep);
    onChange(valueFromDisplay(newValue));
  };

  const increment = () => {
    const newValue = Math.min(displayedMax, displayedValue + displayedStep);
    onChange(valueFromDisplay(newValue));
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <label className="day:text-gray-700 w-20 text-sm font-medium text-gray-200">
          {label}
        </label>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={decrement}
            className="day:border-gray-300 day:bg-gray-100 day:text-gray-700 day:hover:bg-gray-200 flex h-7 w-7 items-center justify-center rounded border border-transparent bg-[#454545] text-white transition-colors hover:bg-[#5A5A5A]"
            aria-label={`Decrease ${label}`}
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
            min={displayedMin}
            max={displayedMax}
            step={displayedStep}
            value={textValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={`day:bg-white day:text-gray-900 w-16 rounded border bg-[#454545] px-2 py-1.5 text-right text-sm text-white transition-colors focus:ring-2 focus:outline-none ${
              value < min || value > max
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
                : 'day:border-gray-300 border-[#5A5A5A] focus:border-[#D7B356] focus:ring-[#D7B356]/30'
            }`}
          />
          <button
            type="button"
            onClick={increment}
            className="day:border-gray-300 day:bg-gray-100 day:text-gray-700 day:hover:bg-gray-200 flex h-7 w-7 items-center justify-center rounded border border-transparent bg-[#454545] text-white transition-colors hover:bg-[#5A5A5A]"
            aria-label={`Increase ${label}`}
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
          <span className="day:text-gray-600 text-sm font-medium text-gray-300">
            {displayedUnit}
          </span>
        </div>
      </div>
      <div className="relative">
        <input
          type="range"
          min={displayedMin}
          max={displayedMax}
          step={displayedStep}
          value={displayedValue}
          onChange={(e) =>
            onChange(valueFromDisplay(parseFloat(e.target.value)))
          }
          className="fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1F1F1F] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgba(215,179,86,0.6),0_0_0_3px_rgba(0,0,0,0.3)]"
        />
        <div className="day:text-gray-500 mt-0.5 flex w-full justify-between text-xs text-gray-500">
          <span>
            {displayedMin}
            {displayedUnit}
          </span>
          <span>
            {displayedMax}
            {displayedUnit}
          </span>
        </div>
      </div>
    </div>
  );
}
