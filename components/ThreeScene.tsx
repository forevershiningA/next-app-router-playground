'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useState, useRef } from 'react';
import { PerspectiveCamera } from '@react-three/drei';
import { usePathname } from 'next/navigation';
import Scene from './three/Scene';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { calculatePrice } from '#/lib/xml-parser';
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
    
    // Set camera target to same position for both 2D and 3D modes
    (controls as any).target.set(0, 4.2, 0);
    (controls as any).update();
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

// Product Name Header Component
function ProductNameHeader() {
  const catalog = useHeadstoneStore((s) => s.catalog);
  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const heightMm = useHeadstoneStore((s) => s.heightMm);
  
  // Calculate price from catalog
  const quantity = catalog?.product?.priceModel
    ? widthMm * heightMm / 100000
    : 0;
  const price = catalog ? calculatePrice(catalog.product.priceModel, quantity) : 0;

  return (
    <div className="text-center">
      {catalog ? (
        <h1 className="py-10 text-3xl font-serif font-light tracking-tight text-white sm:text-4xl">
          {catalog.product.name}
          <br />
          <span className="text-lg text-slate-300">
            {widthMm} x {heightMm} mm (${(price || 0).toFixed(2)})
          </span>
        </h1>
      ) : (
        <h1 className="py-10 text-3xl font-serif font-light tracking-tight text-white sm:text-4xl">
          3D Designer
        </h1>
      )}
    </div>
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
  const glRef = useRef<any>(null);
  const contextLostHandler = useRef<any>(null);
  const contextRestoredHandler = useRef<any>(null);

  // Cleanup WebGL context on unmount
  useEffect(() => {
    return () => {
      if (glRef.current) {
        const gl = glRef.current;
        
        // Remove event listeners
        if (contextLostHandler.current) {
          gl.domElement.removeEventListener('webglcontextlost', contextLostHandler.current);
        }
        if (contextRestoredHandler.current) {
          gl.domElement.removeEventListener('webglcontextrestored', contextRestoredHandler.current);
        }
        
        // Dispose of the WebGL context properly
        gl.dispose?.();
        const loseContext = gl.getContext()?.getExtension('WEBGL_lose_context');
        if (loseContext) {
          loseContext.loseContext();
        }
      }
    };
  }, []);

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
        <div className="absolute inset-0 z-50 grid place-items-center bg-transparent">
          <div className="flex flex-col items-center gap-4 text-white drop-shadow">
            <div className="h-16 w-16 animate-spin rounded-full border-[6px] border-white/30 border-t-white" />
            <div className="font-mono text-sm opacity-90">
              Loading Headstone…
            </div>
          </div>
        </div>
      )}
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#09171E] to-[#291E14] pointer-events-none" />
      
      {isVisible && (
        <div ref={containerRef} className="relative w-full h-screen flex flex-col items-center justify-center">
          {/* Product Name Above Canvas */}
          <ProductNameHeader />
          
          <Canvas 
            key="main-canvas"
            shadows
            dpr={[1, 2]}
            gl={{ 
              alpha: true,
              preserveDrawingBuffer: false,
              antialias: true,
              powerPreference: 'high-performance',
              failIfMajorPerformanceCaveat: false,
              stencil: false,
              depth: true,
            }}
            onCreated={({ gl }) => {
              glRef.current = gl;
              
              // Handle WebGL context loss
              contextLostHandler.current = (event: Event) => {
                event.preventDefault();
                console.warn('WebGL context lost, attempting to restore...');
              };
              
              contextRestoredHandler.current = () => {
                console.log('WebGL context restored');
                // Force a re-render
                window.dispatchEvent(new Event('resize'));
              };
              
              gl.domElement.addEventListener('webglcontextlost', contextLostHandler.current);
              gl.domElement.addEventListener('webglcontextrestored', contextRestoredHandler.current);
            }}
            camera={{ position: [0, 0, 10] }}
            style={{ background: 'transparent', width: '100%', height: '100%' }}
            className={isDesignsPage ? 'canvas-with-border' : ''}
          >
            <Suspense fallback={null}>
              <Scene />
              <CameraController key={is2DMode ? 'ortho' : 'persp'} />
            </Suspense>
          </Canvas>
        </div>
      )}
    </>
  );
}
