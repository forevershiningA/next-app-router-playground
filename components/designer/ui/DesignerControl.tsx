'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type DesignerOptionVariant = 'soft' | 'solid';

interface DesignerControlProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected: boolean;
  children: ReactNode;
}

interface DesignerOptionButtonProps extends DesignerControlProps {
  variant?: DesignerOptionVariant;
}

function cn(...classes: Parameters<typeof clsx>) {
  return twMerge(clsx(...classes));
}

export function DesignerTabButton({
  selected,
  children,
  className,
  ...props
}: DesignerControlProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      data-state={selected ? 'selected' : 'idle'}
      className={cn(
        'relative flex-1 px-1 py-2 text-sm font-semibold transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--designer-focus)]',
        selected
          ? 'text-[var(--designer-text-selected)]'
          : 'text-[var(--designer-text-muted)] hover:text-[var(--designer-text)]',
        className,
      )}
      {...props}
    >
      {children}
      {selected ? (
        <span
          aria-hidden="true"
          className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[var(--designer-accent)]"
        />
      ) : null}
    </button>
  );
}

export function DesignerOptionButton({
  selected,
  children,
  className,
  variant = 'soft',
  ...props
}: DesignerOptionButtonProps) {
  const selectedClass =
    variant === 'solid'
      ? 'border-[#c49a45] bg-[#c49a45] text-[#121110] shadow-sm day:border-[#9a742f] day:bg-[#9a742f] day:text-white'
      : 'border-2 border-[#c49a45] bg-[#c49a45]/15 text-[#f0d89f] font-semibold day:border-[#9a742f] day:bg-[#9a742f]/15 day:text-[#78541c]';

  return (
    <button
      type="button"
      aria-pressed={selected}
      data-state={selected ? 'selected' : 'idle'}
      className={cn(
        'shrink-0 rounded-lg border px-4 py-2 text-sm transition-all duration-200',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--designer-focus)]',
        selected
          ? selectedClass
          : 'border-white/15 bg-white/[0.04] text-white/75 hover:border-[#c49a45]/50 hover:bg-white/[0.08] hover:text-white day:border-[#d6cebf] day:bg-white day:text-[#5a5248] day:hover:border-[#9a742f]/50 day:hover:bg-[#f7f4ee] day:hover:text-[#1a1714] day:shadow-sm',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
