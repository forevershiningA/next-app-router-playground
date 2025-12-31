'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useState, useRef, useMemo } from 'react';
import { PerspectiveCamera } from '@react-three/drei';
import { usePathname } from 'next/navigation';
import Scene from './three/Scene';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { calculatePrice } from '#/lib/xml-parser';
import {
  CAMERA_3D_POSITION_Z,
  CAMERA_FOV,
  CAMERA_NEAR,
  CAMERA_FAR,
} from '#/lib/headstone-constants';

function CameraController() {
  const { controls } = useThree();

  useEffect(() => {
    if (!controls) return;
    
    // Set camera target
    (controls as any).target.set(0, 3.8, 0);
    (controls as any).update();
  }, [controls]);

  return (
    <PerspectiveCamera
      makeDefault
      position={[0, 4.2, CAMERA_3D_POSITION_Z]}
      fov={CAMERA_FOV}
      near={CAMERA_NEAR}
      far={CAMERA_FAR}
    />
  );
}

// Product Name Header Component - Apple Studio Look
function ProductNameHeader() {
  const catalog = useHeadstoneStore((s) => s.catalog);
  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const heightMm = useHeadstoneStore((s) => s.heightMm);
  const baseWidthMm = useHeadstoneStore((s) => s.baseWidthMm);
  const baseHeightMm = useHeadstoneStore((s) => s.baseHeightMm);
  const baseThickness = useHeadstoneStore((s) => s.baseThickness);
  const showBase = useHeadstoneStore((s) => s.showBase);
  const inscriptionCost = useHeadstoneStore((s) => s.inscriptionCost);
  const motifCost = useHeadstoneStore((s) => s.motifCost);
  
  // Calculate quantity based on catalog's quantity type
  const quantity = useMemo(() => {
    let qty = widthMm * heightMm; // default to area
    if (catalog) {
      const qt = catalog.product.priceModel.quantityType;
      if (qt === 'Width + Height') {
        qty = widthMm + heightMm;
      }
    }
    return qty;
  }, [catalog, widthMm, heightMm]);
  
  // Calculate base quantity (usually Area)
  const baseQuantity = useMemo(() => {
    if (!showBase || !catalog?.product?.basePriceModel) return 0;
    const qt = catalog.product.basePriceModel.quantityType;
    if (qt === 'Width + Height') {
      return baseWidthMm + baseHeightMm;
    } else if (qt === 'Width') {
      return baseWidthMm + baseThickness; // Width + Thickness (depth)
    }
    return baseWidthMm * baseHeightMm; // default to area
  }, [catalog, baseWidthMm, baseHeightMm, baseThickness, showBase]);
  
  // Calculate total price including inscriptions and motifs
  const totalPrice = useMemo(() => {
    const headstonePrice = catalog 
      ? calculatePrice(catalog.product.priceModel, quantity) 
      : 0;
    const basePrice = showBase && catalog?.product?.basePriceModel
      ? calculatePrice(catalog.product.basePriceModel, baseQuantity)
      : 0;
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Price calculation:', {
        showBase,
        hasBasePriceModel: !!catalog?.product?.basePriceModel,
        baseQuantity,
        basePrice,
        headstonePrice,
        total: headstonePrice + basePrice + inscriptionCost + motifCost
      });
    }
    
    return headstonePrice + basePrice + inscriptionCost + motifCost;
  }, [catalog, quantity, baseQuantity, inscriptionCost, motifCost, showBase]);

  // Convert mm to inches (1 inch = 25.4 mm) and round up
  const widthInches = useMemo(() => Math.ceil(widthMm / 25.4), [widthMm]);
  const heightInches = useMemo(() => Math.ceil(heightMm / 25.4), [heightMm]);

  return (
    <>
      {/* Title Floating Top Left */}
      {catalog && (
        <div className="absolute top-10 left-10 z-10 pointer-events-none">
          {/* Elegant Serif Font */}
          <h1 className="text-3xl text-white drop-shadow-sm !p-0 !m-0">
            {catalog.product.name}
          </h1>
        </div>
      )}

      {/* Price Pill Floating Bottom Center */}
      {catalog && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
          <div className="bg-black/80 backdrop-blur-md text-white px-6 py-3 rounded-full font-mono shadow-xl border border-white/10 flex gap-4 items-center">
            <span className="opacity-80 text-sm">{widthMm} × {heightMm} mm</span>
            <div className="w-px h-4 bg-white/20"></div>
            <span className="font-bold text-green-400">${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      )}
    </>
  );
}

export default function ThreeScene() {
  const is2DMode = useHeadstoneStore ((s) => s.is2DMode);
  const loading = useHeadstoneStore((s) => s.loading);
  const pathname = usePathname();
  const isDesignsPage = pathname?.startsWith('/designs/');
  
  const [isVisible, setIsVisible] = useState(true);
  const [showLoader, setShowLoader] = useState(false);
  const [targetRotation, setTargetRotation] = useState(0);
  const currentRotation = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasInitiallyLoaded = useRef(false);
  const glRef = useRef<any>(null);
  const contextLostHandler = useRef<any>(null);
  const contextRestoredHandler = useRef<any>(null);

  const rotateLeft = () => {
    setTargetRotation(prev => prev - Math.PI / 6); // -30 degrees
  };

  const rotateRight = () => {
    setTargetRotation(prev => prev + Math.PI / 6); // +30 degrees
  };

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
        
        const ctx = gl.getContext?.();
        const supportsLoseContext = ctx?.getSupportedExtensions?.()?.includes('WEBGL_lose_context');
        if (supportsLoseContext) {
          gl.dispose?.();
          const loseContext = ctx?.getExtension('WEBGL_lose_context');
          loseContext?.loseContext();
        } else {
          // Fallback cleanup without forcing context loss
          gl.setAnimationLoop?.(null);
          gl.renderLists?.dispose?.();
          gl.forceContextLoss = undefined as any;
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

      
      {isVisible && (
        <div ref={containerRef} className="relative w-full h-screen">
          {/* Product Name Overlay (above canvas) */}
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
            onCreated={({ gl, scene }) => {
              glRef.current = gl;
              
              // Set environment map intensity for the entire scene
              if (scene.environment) {
                scene.environmentIntensity = 0.4;
              }
              
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
              <Scene 
                targetRotation={targetRotation} 
                currentRotation={currentRotation}
              />
              <CameraController />
            </Suspense>
          </Canvas>

          {/* Rotation Controls */}
          {!is2DMode && (
            <>
              {/* Left Arrow */}
              <button
                onClick={rotateLeft}
                className="absolute left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer shadow-lg hover:shadow-xl hover:shadow-[#cfac6c]/50"
                aria-label="Rotate left"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Right Arrow */}
              <button
                onClick={rotateRight}
                className="absolute right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer shadow-lg hover:shadow-xl hover:shadow-[#cfac6c]/50"
                aria-label="Rotate right"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
