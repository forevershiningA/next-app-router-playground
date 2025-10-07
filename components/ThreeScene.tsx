'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, useEffect } from 'react';
import { OrthographicCamera, PerspectiveCamera } from '@react-three/drei';
import Scene from './three/Scene';
import { useHeadstoneStore } from '#/lib/headstone-store';

function CameraController() {
  const is2DMode = useHeadstoneStore((s) => s.is2DMode);
  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const { controls } = useThree();

  useEffect(() => {
    if (controls) {
      requestAnimationFrame(() => (controls as any).target.set(0, 4, 0));
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
      position={[0, 2 + 2.6 * Math.sin(-0.873), 2.6 * Math.cos(-0.873)]}
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
  return (
    <>
      <ViewToggleButton />
      <div className="relative h-screen w-full bg-[#cfe8fc]">
        <Canvas shadows>
          <color attach="background" args={['#cfe8fc']} />
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
