'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useState, useRef } from 'react';
import { PerspectiveCamera } from '@react-three/drei';
import { usePathname } from 'next/navigation';
import Scene from './three/Scene';
import { useHeadstoneStore } from '#/lib/headstone-store';
import CanvasClickOverlay from './CanvasClickOverlay';
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
      className="fixed z-50 cursor-pointer rounded border border-white/20 bg-black/50 px-3 py-2 text-2xl font-bold text-white backdrop-blur-sm hover:bg-black/70"
      aria-label={`Switch to ${is2DMode ? '3D' : '2D'} view`}
      style={{ fontSize: '24px', top: '20px', right: '20px' }}
    >
      {is2DMode ? '3D' : '2D'}
    </button>
  );
}

export default function ThreeScene() {
  const is2DMode = useHeadstoneStore ((s) => s.is2DMode);
  const loading = useHeadstoneStore((s) => s.loading);
  const pathname = usePathname();
  const isDesignsPage = pathname?.startsWith('/designs/');
  
  const [isVisible, setIsVisible] = useState(true);
  const [showLoader, setShowLoader] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasInitiallyLoaded = useRef(false);

  // Only show loader after initial load (prevents double loader on page load)
  useEffect(() => {
    if (!hasInitiallyLoaded.current && !loading) {
      // Mark as initially loaded once loading completes
      hasInitiallyLoaded.current = true;
    }
    
    if (hasInitiallyLoaded.current && loading) {
      // Only show loader for subsequent loads
      setShowLoader(true);
    } else if (!loading) {
      setShowLoader(false);
    }
  }, [loading]);

  // Detect if canvas is in viewport
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      {
        threshold: 0.1, // Trigger when at least 10% is visible
        rootMargin: '100px', // Start loading 100px before entering viewport
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <ViewToggleButton />
      {showLoader && (
        <div className="absolute inset-0 z-50 grid place-items-center bg-black">
          <div className="flex flex-col items-center gap-4 text-white drop-shadow">
            <div className="h-16 w-16 animate-spin rounded-full border-[6px] border-white/30 border-t-white" />
            <div className="font-mono text-sm opacity-90">
              Loading Headstone…
            </div>
          </div>
        </div>
      )}
      <div 
        ref={containerRef}
        className="relative w-full h-screen" 
        style={{ 
          background: '#87CEEB', 
          padding: '0' 
        }}
      >
        {isVisible && (
          <Canvas 
          shadows
          dpr={[1, 2]}
          gl={{ 
            alpha: false,
            preserveDrawingBuffer: false, // Changed to false to reduce memory usage
            antialias: true,
            powerPreference: 'high-performance',
            failIfMajorPerformanceCaveat: false
          }}
          onCreated={({ gl }) => {
            // Handle WebGL context loss
            gl.domElement.addEventListener('webglcontextlost', (event) => {
              event.preventDefault();
              console.warn('WebGL context lost, attempting to restore...');
            });
            
            gl.domElement.addEventListener('webglcontextrestored', () => {
              console.log('WebGL context restored');
              // Force a re-render
              window.dispatchEvent(new Event('resize'));
            });
          }}
          camera={{ position: [0, 0, 10] }}
          style={{ border: 'none', borderRadius: '0' }}
          className={isDesignsPage ? 'canvas-with-border' : ''}
        >
          <Suspense fallback={null}>
            <Scene />
            <CameraController key={is2DMode ? 'ortho' : 'persp'} />
          </Suspense>
        </Canvas>
        )}
      </div>
    </>
  );
}
