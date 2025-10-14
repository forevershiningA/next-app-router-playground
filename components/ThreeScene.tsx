'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, useEffect } from 'react';
import { OrthographicCamera, PerspectiveCamera } from '@react-three/drei';
import Scene from './three/Scene';
import { useHeadstoneStore } from '#/lib/headstone-store';

function CameraController() {
  const is2DMode = useHeadstoneStore((s) => s.is2DMode);
  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const baseSwapping = useHeadstoneStore((s) => s.baseSwapping);
  const { controls } = useThree();

  useEffect(() => {
    if (controls) {
      if (is2DMode) {
        (controls as any).target.set(0, 4, 0);
        (controls as any).update();
      } else {
        // Set en face view for 3D mode
        (controls as any).target.set(0, 1, 0);
        (controls as any).update();
      }
    }
  }, [is2DMode, controls]);

  if (is2DMode) {
    return (
      <PerspectiveCamera
        makeDefault
        position={[
          0,
          2 + 15 * Math.tan((12.6 * Math.PI) / 180),
          15 * Math.cos((12.6 * Math.PI) / 180),
        ]}
        fov={45}
        near={0.1}
        far={100}
      />
    );
  }

  return (
    <PerspectiveCamera
      makeDefault
      position={[0, 1, 12]}
      fov={45}
      near={0.1}
      far={100}
    />
  );
}

function ViewToggleButton() {
  const is2DMode = useHeadstoneStore((s) => s.is2DMode);
  const toggleViewMode = useHeadstoneStore((s) => s.toggleViewMode);

  return (
    <button
      onClick={toggleViewMode}
      className="fixed top-20 right-4 z-50 cursor-pointer rounded border border-white/20 bg-black/50 px-3 py-2 text-2xl font-bold text-white backdrop-blur-sm hover:bg-black/70"
      style={{ fontSize: '24px' }}
    >
      {is2DMode ? '3D' : '2D'}
    </button>
  );
}

export default function ThreeScene() {
  const is2DMode = useHeadstoneStore((s) => s.is2DMode);
  const loading = useHeadstoneStore((s) => s.loading);
  return (
    <>
      <ViewToggleButton />
      {loading && (
        <div className="absolute inset-0 z-50 grid place-items-center bg-[#cfe8fc]">
          <div className="flex flex-col items-center gap-4 text-white drop-shadow">
            <div className="h-16 w-16 animate-spin rounded-full border-[6px] border-white/30 border-t-white" />
            <div className="font-mono text-sm opacity-90">
              Loading Headstone…
            </div>
          </div>
        </div>
      )}
      <div className="relative h-screen w-full">
        <Canvas shadows>
          {/* IMPORTANT: no global fallback here */}
          <Suspense fallback={null}>
            <Scene />
            <CameraController key={is2DMode ? 'ortho' : 'persp'} />
          </Suspense>
        </Canvas>
      </div>
    </>
  );
}
