'use client';
import { createPortal } from 'react-dom';

export default function ViewportLoader() {
  if (typeof window === 'undefined') return null;
  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[1000] grid place-items-center">
      <div className="flex flex-col items-center gap-4 text-black">
        <div className="h-16 w-16 animate-spin rounded-full border-[6px] border-black/30 border-t-black" />
        <div className="font-mono text-sm opacity-80">Loading assets…</div>
      </div>
    </div>,
    document.body,
  );
}
