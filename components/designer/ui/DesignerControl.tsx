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
      ? 'border-[var(--designer-accent)] bg-[var(--designer-accent)] text-[var(--designer-accent-foreground)] shadow-sm'
      : 'border-2 border-[var(--designer-accent)] bg-[var(--designer-accent-soft)] text-[var(--designer-text-selected)]';

  return (
    <button
      type="button"
      aria-pressed={selected}
      data-state={selected ? 'selected' : 'idle'}
      className={cn(
        'shrink-0 rounded-lg border px-4 py-2 text-sm transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--designer-focus)]',
        selected
          ? selectedClass
          : 'border-[var(--designer-border)] bg-[var(--designer-control)] text-[var(--designer-text-muted)] hover:border-[var(--designer-border-strong)] hover:bg-[var(--designer-control-hover)] hover:text-[var(--designer-text)]',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
