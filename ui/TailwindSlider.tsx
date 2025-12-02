'use client';

import React from 'react';

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
  const [textValue, setTextValue] = React.useState(String(value));

  React.useEffect(() => {
    setTextValue(String(value));
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextValue(e.target.value);
  };

  const handleInputBlur = () => {
    const parsedValue = parseFloat(textValue);
    if (!isNaN(parsedValue)) {
      const clampedValue = Math.min(max, Math.max(min, parsedValue));
      onChange(clampedValue);
    } else {
      setTextValue(String(value));
    }
  };

  const decrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const increment = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium md:text-gray-700 text-white/70">{label}</label>
      <div className="flex items-center space-x-2">
        <button
          onClick={decrement}
          className="flex h-8 w-8 items-center justify-center rounded-md border md:border-gray-300 md:bg-white md:text-gray-900 md:hover:bg-gray-50 border-gray-600 bg-gray-800 text-white hover:bg-gray-700"
        >
          -
        </button>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-gray-700"
        />
        <button
          onClick={increment}
          className="flex h-8 w-8 items-center justify-center rounded-md border md:border-gray-300 md:bg-white md:text-gray-900 md:hover:bg-gray-50 border-gray-600 bg-gray-800 text-white hover:bg-gray-700"
        >
          +
        </button>
        <input
          type="text"
          value={textValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className="w-20 rounded-md border md:border-gray-300 md:bg-white md:text-gray-900 border-gray-600 bg-gray-800 px-2 py-1 text-sm text-white"
        />
        {unit && <span className="text-sm md:text-gray-700 text-white/70">{unit}</span>}
      </div>
    </div>
  );
}
