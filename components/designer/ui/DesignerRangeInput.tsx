'use client';

import type { ComponentPropsWithRef } from 'react';
import { twMerge } from 'tailwind-merge';

export default function DesignerRangeInput({
  min = 0,
  max = 100,
  value,
  className,
  style,
  ...props
}: ComponentPropsWithRef<'input'>) {
  const lower = Number(min);
  const upper = Number(max);
  const progress =
    upper > lower
      ? Math.max(
          0,
          Math.min(
            100,
            ((Number(value ?? lower) - lower) / (upper - lower)) * 100,
          ),
        )
      : 0;

  return (
    <input
      {...props}
      type="range"
      min={min}
      max={max}
      value={value}
      className={twMerge(
        className,
        'fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--designer-focus)] disabled:cursor-not-allowed disabled:opacity-40 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#171717] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-sm [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#171717] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:hover:shadow-md',
      )}
      style={{
        ...style,
        background: `linear-gradient(to right, #D7B356 0%, #D7B356 ${progress}%, var(--designer-border-strong, #aaa399) ${progress}%, var(--designer-border-strong, #aaa399) 100%)`,
      }}
    />
  );
}
