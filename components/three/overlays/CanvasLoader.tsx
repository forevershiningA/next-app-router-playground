// components/three/overlays/CanvasLoader.tsx
'use client';
import { Html } from '@react-three/drei';

export default function CanvasLoader() {
  const portal =
    typeof window !== 'undefined' ? document.body : (undefined as any);

  return (
    <Html fullscreen transform={false} portal={portal} zIndexRange={[1000, 0]}>
      <div className="pointer-events-none fixed inset-0 grid place-items-center">
        <div className="flex flex-col items-center gap-4 text-black">
          <div className="h-16 w-16 animate-spin rounded-full border-[6px] border-black/30 border-t-black" />
          <div className="font-mono text-sm opacity-80">Loading assets…</div>
        </div>
      </div>
    </Html>
  );
}
