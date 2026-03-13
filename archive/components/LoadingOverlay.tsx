'use client';

import { useHeadstoneStore } from '#/lib/headstone-store';

export default function LoadingOverlay() {
  const loading = useHeadstoneStore((s) => s.loading);

  if (!loading) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[10000] flex items-center justify-center bg-black/90">
      <div className="flex flex-col items-center gap-4 text-white">
        <div className="h-16 w-16 animate-spin rounded-full border-[6px] border-white/30 border-t-white" />
        <div className="font-mono text-sm opacity-90">Loading assets…</div>
      </div>
    </div>
  );
}
