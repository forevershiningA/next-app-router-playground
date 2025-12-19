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

// Product Name Header Component
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
    
    console.log('Price calculation:', {
      showBase,
      hasBasePriceModel: !!catalog?.product?.basePriceModel,
      baseQuantity,
      basePrice,
      headstonePrice,
      total: headstonePrice + basePrice + inscriptionCost + motifCost
    });
    
    return headstonePrice + basePrice + inscriptionCost + motifCost;
  }, [catalog, quantity, baseQuantity, inscriptionCost, motifCost, showBase]);

  // Convert mm to inches (1 inch = 25.4 mm) and round up
  const widthInches = useMemo(() => Math.ceil(widthMm / 25.4), [widthMm]);
  const heightInches = useMemo(() => Math.ceil(heightMm / 25.4), [heightMm]);

  return (
    <div className="text-center">
      {catalog ? (
        <div>
          <h1 className="text-3xl font-sans font-medium tracking-tight text-white sm:text-4xl mb-4">
            {catalog.product.name}
          </h1>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 shadow-lg hover:shadow-xl hover:shadow-[#cfac6c]/50 transition-all">
            <span className="text-sm font-medium text-slate-200">
              {widthMm} × {heightMm} mm
            </span>
            <span className="text-white/40">•</span>
            <span className="text-sm font-medium text-slate-200">
              {widthInches} × {heightInches} in
            </span>
            <span className="text-white/40">•</span>
            <span className="text-sm font-bold text-white">
              ${totalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      ) : (
        <h1 className="text-3xl font-sans font-medium tracking-tight text-white sm:text-4xl">
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
      <div className="absolute inset-0 bg-gradient-to-r from-amber-950/30 to-yellow-900/20 pointer-events-none" />
      
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
