'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, useEffect } from 'react';
import { PerspectiveCamera } from '@react-three/drei';
import Scene from './three/Scene';
import { useHeadstoneStore } from '#/lib/headstone-store';
import {
  CAMERA_2D_TILT_ANGLE,
  CAMERA_2D_DISTANCE,
  CAMERA_3D_POSITION_Y,
  CAMERA_3D_POSITION_Z,
  CAMERA_FOV,
  CAMERA_NEAR,
  CAMERA_FAR,
} from '#/lib/headstone-constants';

function CameraController() {
  const is2DMode = useHeadstoneStore((s) => s.is2DMode);
  const { controls } = useThree();

  useEffect(() => {
    if (!controls) return;
    
    if (is2DMode) {
      (controls as any).target.set(0, 4.2, 0);
      (controls as any).update();
    } else {
      // Set en face view for 3D mode
      (controls as any).target.set(0, 4.2, 0);
      (controls as any).update();
    }
  }, [is2DMode, controls]);

  if (is2DMode) {
    const tiltRad = (CAMERA_2D_TILT_ANGLE * Math.PI) / 180;
    return (
      <PerspectiveCamera
        makeDefault
        position={[
          0,
          4.2 + CAMERA_2D_DISTANCE * Math.sin(tiltRad),
          CAMERA_2D_DISTANCE * Math.cos(tiltRad),
        ]}
        fov={CAMERA_FOV}
        near={CAMERA_NEAR}
        far={CAMERA_FAR}
      />
    );
  }

  return (
    <PerspectiveCamera
      makeDefault
      position={[0, 4.8, CAMERA_3D_POSITION_Z]}
      fov={CAMERA_FOV}
      near={CAMERA_NEAR}
      far={CAMERA_FAR}
    />
  );
}

function ViewToggleButton() {
  const is2DMode = useHeadstoneStore((s) => s.is2DMode);
  const toggleViewMode = useHeadstoneStore((s) => s.toggleViewMode);

  return (
    <button
      data-view-toggle
      onClick={toggleViewMode}
      className="fixed top-20 right-4 z-50 cursor-pointer rounded border border-white/20 bg-black/50 px-3 py-2 text-2xl font-bold text-white backdrop-blur-sm hover:bg-black/70"
      aria-label={`Switch to ${is2DMode ? '3D' : '2D'} view`}
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
      <div className="relative w-full h-screen">
        <Canvas shadows>
          <Suspense fallback={null}>
            <Scene />
            <CameraController key={is2DMode ? 'ortho' : 'persp'} />
          </Suspense>
        </Canvas>
      </div>
    </>
  );
}
