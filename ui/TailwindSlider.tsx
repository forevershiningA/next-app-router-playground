
"use client";

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

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-white/70">{label}</label>
      <div className="flex items-center space-x-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
        <input
          type="text"
          value={textValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className="w-20 px-2 py-1 text-sm text-white bg-gray-800 border border-gray-600 rounded-md"
        />
        {unit && <span className="text-sm text-white/70">{unit}</span>}
      </div>
    </div>
  );
}
