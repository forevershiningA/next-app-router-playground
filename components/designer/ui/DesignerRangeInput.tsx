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
        'fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--designer-focus)] disabled:cursor-not-allowed disabled:opacity-40 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#161412] [&::-moz-range-thumb]:bg-[#c49a45] [&::-moz-range-thumb]:shadow-md [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#161412] [&::-webkit-slider-thumb]:bg-[#c49a45] [&::-webkit-slider-thumb]:shadow-md day:[&::-webkit-slider-thumb]:border-white day:[&::-webkit-slider-thumb]:bg-[#9a742f] day:[&::-webkit-slider-thumb]:shadow-[0_2px_6px_rgba(40,30,20,0.25)] day:[&::-moz-range-thumb]:border-white day:[&::-moz-range-thumb]:bg-[#9a742f] day:[&::-moz-range-thumb]:shadow-[0_2px_6px_rgba(40,30,20,0.25)]',
      )}
      style={{
        ...style,
        background: `linear-gradient(to right, var(--designer-accent, #c49a45) 0%, var(--designer-accent, #c49a45) ${progress}%, var(--designer-border-strong, #3a3530) ${progress}%, var(--designer-border-strong, #3a3530) 100%)`,
      }}
    />
  );
}
