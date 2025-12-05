'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import ThreeScene from '#/components/ThreeScene';
import SceneOverlayHost from '#/components/SceneOverlayHost';
import CheckPricePanel from '#/components/CheckPricePanel';
import SEOPanel from '#/components/SEOPanel';
import ErrorBoundary from '#/components/ErrorBoundary';

export default function ConditionalCanvas() {
  const pathname = usePathname();
  
  // Hide canvas on design pages:
  // /designs/ -> ['designs'] = 1 segment (root page)
  // /designs/bronze-plaque -> ['designs', 'bronze-plaque'] = 2 segments (product type page)  
  // /designs/bronze-plaque/husband-memorial -> ['designs', 'bronze-plaque', 'husband-memorial'] = 3 segments (category page)
  // /designs/bronze-plaque/husband-memorial/123_design-name -> ['designs', 'bronze-plaque', 'husband-memorial', '123_design-name'] = 4 segments (individual design page)
  const segments = pathname?.split('/').filter(Boolean) || [];
  const isDesignPage = pathname?.startsWith('/designs') && segments.length >= 1;
  
  // Check if we're on the homepage
  const isHomePage = pathname === '/';
  
  // Hide canvas on select-product page
  const isSelectProductPage = pathname === '/select-product';
  
  // Hide canvas on select-shape page
  const isSelectShapePage = pathname === '/select-shape';
  
  // Hide canvas on select-material page
  const isSelectMaterialPage = pathname === '/select-material';
  
  // Hide canvas on select-additions page
  const isSelectAdditionsPage = pathname === '/select-additions';
  
  // Hide canvas on check-price page
  const isCheckPricePage = pathname === '/check-price';
  
  // Show canvas on select-size page
  const isSelectSizePage = pathname === '/select-size';
  
  // Show canvas on inscriptions page
  const isInscriptionsPage = pathname === '/inscriptions';
  
  // Show canvas on select-motifs page
  const isSelectMotifsPage = pathname === '/select-motifs';
  
  if ((isHomePage || isDesignPage || isSelectProductPage || isSelectShapePage || isSelectMaterialPage || isSelectAdditionsPage || isCheckPricePage) && !isSelectSizePage && !isInscriptionsPage && !isSelectMotifsPage) {
    return null;
  }

  return (
    <div className="fixed inset-0 lg:left-[400px] z-0">
      <Suspense
        fallback={
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-white" />
              <p className="text-sm text-gray-400">Loading scene...</p>
            </div>
          </div>
        }
      >
        <ErrorBoundary
          fallback={
            <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-red-500/20 bg-red-950/10">
              <div className="flex flex-col items-center gap-4 p-8">
                <div className="text-4xl">⚠️</div>
                <h2 className="text-lg font-semibold text-red-400">
                  Failed to load 3D scene
                </h2>
                <p className="text-sm text-gray-400">
                  Please refresh the page to try again
                </p>
              </div>
            </div>
          }
        >
          <SceneOverlayHost />
          <CheckPricePanel />
          <SEOPanel />
          <ThreeScene />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}
