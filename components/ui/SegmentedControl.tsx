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
      className={cn(
        // Container / Track styling
        'relative flex w-full items-center rounded-full bg-black/40 p-1 ring-1 ring-white/10 backdrop-blur-sm',
        // Inner shadow for depth
        'shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]',
        className
      )}
    >
      {options.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative z-10 flex-1 py-2 text-sm font-medium transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c99d44] focus-visible:ring-offset-2',
              isActive ? 'text-black' : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            {isActive && (
              <motion.div
                layoutId={`active-pill-${options[0].value}`} // unique ID per group
                className="absolute inset-0 rounded-full bg-[#e3b85f] shadow-sm"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{
                  // Optional: Add a subtle gradient to the gold button
                  backgroundImage: 'linear-gradient(to bottom, #e3b85f, #c99d44)',
                }}
              />
            )}
            <span className="relative z-20">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
