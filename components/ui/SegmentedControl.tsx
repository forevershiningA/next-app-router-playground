'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SegmentedControlProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function SegmentedControl({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps) {
  return (
    <div
      role="group"
      className={cn(
        // Container / Track styling
        'relative flex w-full items-center rounded-full border border-white/10 bg-white/[0.04] p-1 day:border-[#dfd7ca] day:bg-white/80 day:shadow-inner backdrop-blur-sm',
        className,
      )}
    >
      {options.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative z-10 flex-1 py-1.5 md:py-2 text-xs md:text-sm font-semibold transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-[#c49a45] day:focus-visible:ring-[#9a742f] focus-visible:ring-offset-2 focus-visible:outline-none',
              isActive
                ? 'text-[#121110] day:text-white'
                : 'text-white/60 hover:text-white day:text-[#6a6156] day:hover:text-[#1a1714]',
            )}
          >
            {isActive && (
              <motion.div
                layoutId={`active-pill-${options[0].value}`} // unique ID per group
                className="absolute inset-0 rounded-full bg-[#c49a45] shadow-sm day:bg-[#9a742f]"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-20">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
