'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { PerspectiveCamera } from '@react-three/drei';
import { usePathname } from 'next/navigation';
import Scene from './three/Scene';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { calculatePrice, calculatePricePowerLaw, computeQuantity, type CatalogData } from '#/lib/xml-parser';
import { data } from '#/app/_internal/_data';
import { loadCatalogForProduct } from '#/lib/check-price-utils';
import { formatDimensionPair } from '#/lib/unit-system';
import { useUnitSystem } from '#/lib/use-unit-system';
import QuickEnquiryModal from '#/components/QuickEnquiryModal';

const CANVAS_ROUTES = new Set([
  '/select-size',
  '/inscriptions',
  '/select-material',
  '/select-additions',
  '/select-motifs',
  '/select-border',
]);
import {
  CAMERA_3D_POSITION_Z,
  CAMERA_FOV,
  CAMERA_NEAR,
  CAMERA_FAR,
} from '#/lib/headstone-constants';
import { logger } from '#/lib/logger';

function CameraController() {
  const { controls, camera } = useThree();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!controls || !camera || hasInitialized.current) return;

    camera.position.set(0, 4.2, CAMERA_3D_POSITION_Z);
    camera.lookAt(0, 3.8, 0);
    camera.updateProjectionMatrix();

    if ((controls as any).reset) {
      (controls as any).reset();
    }
    (controls as any).target.set(0, 3.8, 0);
    (controls as any).update();

    hasInitialized.current = true;
  }, [controls, camera]);

  return null;
}

// Product Name Header Component - Apple Studio Look
function ProductNameHeader() {
  const catalog = useHeadstoneStore((s) => s.catalog);
  const productId = useHeadstoneStore((s) => s.productId);
  const shapeUrl = useHeadstoneStore((s) => s.shapeUrl);
  const headstoneMaterialUrl = useHeadstoneStore((s) => s.headstoneMaterialUrl);
  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const heightMm = useHeadstoneStore((s) => s.heightMm);
  const baseWidthMm = useHeadstoneStore((s) => s.baseWidthMm);
  const baseHeightMm = useHeadstoneStore((s) => s.baseHeightMm);
  const baseThickness = useHeadstoneStore((s) => s.baseThickness);
  const uprightThickness = useHeadstoneStore((s) => s.uprightThickness);
  const showBase = useHeadstoneStore((s) => s.showBase);
  const inscriptionCost = useHeadstoneStore((s) => s.inscriptionCost);
  const motifCost = useHeadstoneStore((s) => s.motifCost);
  const imageCost = useHeadstoneStore((s) => s.imageCost);
  const additionCost = useHeadstoneStore((s) => s.additionCost);
  const emblemCost = useHeadstoneStore((s) => s.emblemCost);
  const fixedSizes = useHeadstoneStore((s) => s.fixedSizes);
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);
  const unitSystem = useUnitSystem();
  const [resolvedCatalog, setResolvedCatalog] = useState<CatalogData | null>(null);
  const [showQuickEnquiry, setShowQuickEnquiry] = useState(false);
  const fallbackProductId = useMemo(
    () => productId ?? data.products[0]?.id ?? null,
    [productId],
  );
  const activeCatalog = catalog ?? resolvedCatalog;
  const selectedShape = useMemo(
    () =>
      activeCatalog?.product.shapes.find((shape) => shape.url === shapeUrl) ??
      activeCatalog?.product.shapes[0] ??
      null,
    [activeCatalog, shapeUrl],
  );

  useEffect(() => {
    let cancelled = false;
    if (catalog) {
      setResolvedCatalog(catalog);
      return;
    }
    if (!fallbackProductId) {
      setResolvedCatalog(null);
      return;
    }

    loadCatalogForProduct(fallbackProductId).then((loadedCatalog) => {
      if (!cancelled && loadedCatalog) {
        setResolvedCatalog(loadedCatalog);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [catalog, fallbackProductId]);
  
  const displayProductName = useMemo(() => {
    logger.log('[ThreeScene] Product name calc:', {
      catalogName: catalog?.product?.name,
      catalogId: catalog?.product?.id,
      productId,
      fallbackProductId,
      fallbackName: data.products.find((p) => p.id === productId)?.name
    });
    
    // Safety check: Only use catalog name if it matches the selected product ID
    if (activeCatalog?.product?.name) {
      return activeCatalog.product.name;
    }
    
    // Fall back to static product list
    if (!productId) {
      return 'Design Your Own Headstone';
    }
    return data.products.find((p) => p.id === productId)?.name ?? 'Design Your Own Headstone';
  }, [activeCatalog, productId, fallbackProductId, catalog]);
  
  // Calculate quantity based on catalog's quantity type
  const quantity = useMemo(() => {
    if (!activeCatalog) return widthMm * heightMm;
    return computeQuantity(activeCatalog.product.priceModel, { width: widthMm, height: heightMm, depth: uprightThickness });
  }, [activeCatalog, widthMm, heightMm, uprightThickness]);
  
  // Calculate base quantity
  const baseQuantity = useMemo(() => {
    if (!showBase || !activeCatalog?.product?.basePriceModel) return 0;
    return computeQuantity(activeCatalog.product.basePriceModel, { width: baseWidthMm, height: baseHeightMm, depth: baseThickness });
  }, [activeCatalog, baseWidthMm, baseHeightMm, baseThickness, showBase]);
  
  const isUrnProduct = activeCatalog?.product.type === 'urn' || productId === '2350';
  const urnShapeCode = isUrnProduct && shapeUrl
    ? shapeUrl.split('/').pop()?.replace('.svg', '') ?? null
    : null;

  // Calculate total price including inscriptions and motifs
  const totalPrice = useMemo(() => {
    let headstonePrice = 0;
    // Product 52 (YAG Lasered Stainless Steel Plaque): formula-based pricing per finish.
    // The formula uses cm² (Width_cm × Height_cm), so divide mm² by 100.
    // The note field selects "brushed" or "polished" price row.
    if (productId === '52' && activeCatalog) {
      const pm = activeCatalog.product.priceModel;

      const ssMaterial = headstoneMaterialUrl ?? '';
      const ssNote = ssMaterial.includes('polished') ? 'polished' : 'brushed';
      headstonePrice = calculatePricePowerLaw(pm, widthMm * heightMm, ssNote);
    } else if (productId === '32' && fixedSizes.length > 0) {
      const isLandscape = widthMm > heightMm;
      const matchW = isLandscape ? heightMm : widthMm;
      const matchH = isLandscape ? widthMm : heightMm;
      const match = fixedSizes.find(
        (s) => s.width === matchW && s.height === matchH,
      );
      headstonePrice = match?.price ?? 0;
    } else if (activeCatalog) {
      // Urns: quantity is always 1, price matched by shape code note
      if (isUrnProduct) {
        headstonePrice = calculatePrice(activeCatalog.product.priceModel, 1, urnShapeCode ?? undefined);
      } else {
        headstonePrice = calculatePrice(activeCatalog.product.priceModel, quantity);
      }
    }
    const basePrice = showBase && activeCatalog?.product?.basePriceModel
      ? calculatePrice(activeCatalog.product.basePriceModel, baseQuantity)
      : 0;
    const isFullMonument = activeCatalog?.product.type === 'full-monument';
    const ledgerPrice =
      isFullMonument && activeCatalog?.product.ledgerPriceModel
        ? calculatePrice(
            activeCatalog.product.ledgerPriceModel,
            selectedShape?.lid?.initWidth || widthMm,
          )
        : 0;
    const kerbsetPrice =
      isFullMonument && activeCatalog?.product.kerbsetPriceModel
        ? calculatePrice(
            activeCatalog.product.kerbsetPriceModel,
            selectedShape?.kerb?.initWidth || widthMm,
          )
        : 0;
    
    return (
      headstonePrice +
      basePrice +
      ledgerPrice +
      kerbsetPrice +
      inscriptionCost +
      motifCost +
      imageCost +
      additionCost +
      emblemCost
    );
  }, [
    activeCatalog,
    productId,
    fixedSizes,
    quantity,
    baseQuantity,
    inscriptionCost,
    motifCost,
    imageCost,
    additionCost,
    emblemCost,
    showBase,
    selectedShape,
    widthMm,
    heightMm,
    isUrnProduct,
    urnShapeCode,
    headstoneMaterialUrl,
  ]);

  const sizeLabel = useMemo(
    () => formatDimensionPair(widthMm, heightMm, unitSystem),
    [widthMm, heightMm, unitSystem],
  );
  const displayShapeName = useMemo(() => {
    if (selectedShape?.name) {
      return selectedShape.name;
    }
    if (!shapeUrl || shapeUrl.startsWith('data:')) {
      return shapeUrl ? 'Custom Shape' : null;
    }

    const filename = shapeUrl.split('/').pop()?.replace(/\.svg$/i, '');
    if (!filename) {
      return null;
    }

    return filename
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }, [selectedShape, shapeUrl]);
  const priceLabel = `$${totalPrice.toFixed(2)}`;

  return (
    <>
      {/* Product name + Quick Enquiry — top left stack */}
      <div className="absolute top-6 left-6 z-10 hidden lg:flex flex-col gap-2 items-start">
        {displayProductName && (
          <div className="pointer-events-none flex min-h-8 max-w-[min(34rem,calc(100vw-460px))] items-center gap-2 rounded-full border border-white/10 bg-black/55 py-1.5 pl-2.5 pr-3.5 shadow-lg backdrop-blur-md">
            <svg className="h-3.5 w-3.5 shrink-0 text-[#DEBD68]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 21h14M5 21V9a7 7 0 1114 0v12" />
            </svg>
            <span className="min-w-0 leading-none">
              <span className="block truncate text-sm font-semibold tracking-wide text-white">
                {displayProductName}
              </span>
              {displayShapeName && (
                <span className="mt-1 block truncate text-[11px] font-medium uppercase tracking-[0.14em] text-white/55">
                  {displayShapeName}
                </span>
              )}
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={() => setShowQuickEnquiry(true)}
          className="flex h-8 items-center gap-2 bg-black/55 backdrop-blur-md border border-primary/40 rounded-full pl-2.5 pr-3.5 shadow-lg text-white text-sm font-semibold tracking-wide transition-colors hover:bg-primary/20 pointer-events-auto"
        >
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
          </svg>
          Quick Enquiry
        </button>
      </div>

      <QuickEnquiryModal isOpen={showQuickEnquiry} onClose={() => setShowQuickEnquiry(false)} />

      {/* Price Pill Floating Bottom Center */}
      {widthMm > 0 && heightMm > 0 && (
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 pointer-events-auto w-[75vw] sm:w-auto"
        >
          <button
            type="button"
            onClick={() => setActivePanel('checkprice')}
            aria-label="Open check price breakdown"
            className="cursor-pointer bg-black/80 backdrop-blur-md text-white py-3 rounded-full font-mono shadow-xl border border-white/10 flex gap-4 items-center justify-between w-full hover:bg-black/90 transition-colors"
            style={{ paddingLeft: '1.25rem', paddingRight: '1.725rem' }}
          >
            <span className="opacity-80 text-sm">{sizeLabel}</span>
            <div className="w-px h-4 bg-white/20"></div>
            <span className="font-bold text-green-400">{priceLabel}</span>
          </button>
        </div>
      )}
    </>
  );
}

export default function ThreeScene() {
  const is2DMode = useHeadstoneStore ((s) => s.is2DMode);
  const loading = useHeadstoneStore((s) => s.loading);
  const shapeUrl = useHeadstoneStore((s) => s.shapeUrl);
  const hideScenery = useHeadstoneStore((s) => s.hideScenery);
  const solidBgColor = useHeadstoneStore((s) => s.solidBgColor);
  const pathname = usePathname();
  const isDesignsPage = pathname?.startsWith('/designs/');
  
  const [isVisible, setIsVisible] = useState(true);
  const [showLoader, setShowLoader] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [shouldAnimateFade, setShouldAnimateFade] = useState(true);
  const [targetRotation, setTargetRotation] = useState(0);
  const currentRotation = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasInitiallyLoaded = useRef(false);
  const glRef = useRef<any>(null);
  // Track whether the scene has ever rendered (so we don't re-trigger the
  // select-size fade when the user navigates there from an already-visible scene).
  const sceneHasEverBeenReadyRef = useRef(false);
  const handleSceneReady = useCallback(() => {
    sceneHasEverBeenReadyRef.current = true;
    setSceneReady(true);
    setShouldAnimateFade(false);
  }, []);
  const contextLostHandler = useRef<any>(null);
  const contextRestoredHandler = useRef<any>(null);
  const previousPathRef = useRef<string | null>(null);
  const hasPlayedSelectSizeFade = useRef(false);


  // Fade in/out on /select-size page
  useEffect(() => {
    if (pathname === '/select-size') {
      if (!hasPlayedSelectSizeFade.current && !sceneHasEverBeenReadyRef.current) {
        // True first page load arriving at /select-size before the scene has rendered.
        hasPlayedSelectSizeFade.current = true;
        setShouldAnimateFade(true);
        setSceneReady(false);
      } else {
        // Scene was already rendered (or we're returning to this route) — show immediately.
        hasPlayedSelectSizeFade.current = true;
        setShouldAnimateFade(false);
        setSceneReady(true);
      }
    } else {
      // When navigating away from select-size, just stop animating.
      setShouldAnimateFade(false);
    }

    previousPathRef.current = pathname ?? null;
  }, [pathname]);

  const rotateLeft = () => {
    setTargetRotation(prev => prev - Math.PI / 6); // -30 degrees
  };

  const rotateRight = () => {
    setTargetRotation(prev => prev + Math.PI / 6); // +30 degrees
  };

  useEffect(() => {
    currentRotation.current = 0;
    setTargetRotation(0);
  }, [shapeUrl]);

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
          <div className="flex flex-col items-center gap-4 text-white">
            <div className="h-16 w-16 animate-spin rounded-full border-[6px] border-white/30 border-t-white" />
            <div className="font-mono text-sm opacity-90">
              Loading Headstone…
            </div>
          </div>
        </div>
      )}

      
      {isVisible && (
        <div
          ref={containerRef}
          className="relative w-full h-screen"
          style={hideScenery ? { backgroundColor: solidBgColor } : undefined}
        >
          {/* Product Name Overlay (above canvas) */}
          <ProductNameHeader />
          
          <div className={`w-full h-full transition-opacity duration-500 ${sceneReady ? 'opacity-100' : 'opacity-0'}`}>
            <Canvas
              key="main-canvas"
              shadows
              dpr={[1, 2]}
              gl={{ 
                alpha: true,
                preserveDrawingBuffer: true,
                antialias: true,
                powerPreference: 'high-performance',
                failIfMajorPerformanceCaveat: false,
                stencil: false,
                depth: true,
              }}
              onCreated={({ gl, scene }) => {
                glRef.current = gl;
                gl.localClippingEnabled = true;
                
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
                  // Force a re-render
                  window.dispatchEvent(new Event('resize'));
                };
                
                gl.domElement.addEventListener('webglcontextlost', contextLostHandler.current);
                gl.domElement.addEventListener('webglcontextrestored', contextRestoredHandler.current);
              }}
              camera={{ 
                position: [0, 4.2, CAMERA_3D_POSITION_Z],
                fov: CAMERA_FOV,
                near: CAMERA_NEAR,
                far: CAMERA_FAR
              }}
              style={{ background: 'transparent', width: '100%', height: '100%' }}
              className={isDesignsPage ? 'canvas-with-border' : ''}
            >
              <Suspense fallback={null}>
                <Scene 
                  targetRotation={targetRotation} 
                  currentRotation={currentRotation}
                  onReady={handleSceneReady}
                />
                <CameraController />
              </Suspense>
            </Canvas>
          </div>

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
