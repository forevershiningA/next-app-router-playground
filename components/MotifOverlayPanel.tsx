'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import OverlayPortal from '#/components/OverlayPortal';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { useMotifCategory } from '#/lib/use-motifs';
import { data } from '#/app/_internal/_data';
import { getMotifThumbnailPath, getMotifSvgPath } from '#/lib/motifs';
import { getMotifCategoryName } from '#/lib/motif-translations';
import type { ProductFormula } from '#/lib/motifs';

export default function MotifOverlayPanel() {
  const activePanel = useHeadstoneStore((s) => s.activePanel);
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);
  const productId = useHeadstoneStore((s) => s.productId);
  const addMotif = useHeadstoneStore((s) => s.addMotif);
  const motifsCatalog = useHeadstoneStore((s) => s.motifsCatalog);
  
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'categories' | 'motifs'>('categories');
  
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number }>({
    x: 24,
    y: 24,
  });

  const downElRef = useRef<HTMLElement | null>(null);
  const dragRaf = useRef<number | null>(null);
  const dragData = useRef<{ dx: number; dy: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  // Determine formula based on product (simplified - adjust based on your product logic)
  const formula: ProductFormula = useMemo(() => {
    // You can customize this logic based on your product configuration
    return 'Laser';
  }, [productId]);

  // Load motif files when a category is selected
  const {
    files: motifFiles,
    totalCount,
    hasMore,
    isLoading,
    error,
    loadMore,
  } = useMotifCategory({
    categoryIndex: selectedCategoryIndex ?? 0,
    formula,
    initialLimit: 50,
    loadMoreIncrement: 50,
  });

  const isOpen = activePanel === 'motifs';

  useEffect(() => {
    const container = document.getElementById('scene-root');
    const card = cardRef.current;
    if (!container || !card) return;
    const c = container.getBoundingClientRect();
    const r = card.getBoundingClientRect();
    setPos((p) => ({
      x: p.x,
      y: Math.max(12, Math.round((c.height - r.height) / 2)),
    }));
  }, []);

  const handleClose = useCallback(() => {
    setActivePanel(null);
    setViewMode('categories');
    setSelectedCategoryIndex(null);
  }, [setActivePanel]);

  const handleCategorySelect = useCallback((index: number) => {
    setSelectedCategoryIndex(index);
    setViewMode('motifs');
  }, []);

  const handleBackToCategories = useCallback(() => {
    setViewMode('categories');
    setSelectedCategoryIndex(null);
    setSearchQuery('');
  }, []);

  const handleMotifSelect = useCallback((fileName: string) => {
    if (selectedCategoryIndex === null) return;
    
    const svgPath = getMotifSvgPath(fileName);
    
    // Add motif to headstone
    addMotif(svgPath);
  }, [selectedCategoryIndex, addMotif]);

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const container = document.getElementById('scene-root');
    if (!container) return;

    const c = container.getBoundingClientRect();
    dragData.current = {
      dx: e.clientX - (c.left + pos.x),
      dy: e.clientY - (c.top + pos.y),
    };

    const el = e.currentTarget as HTMLElement;
    downElRef.current = el;
    try {
      el.setPointerCapture?.(e.pointerId);
    } catch {}

    setDragging(true);

    const onMove = (ev: PointerEvent) => {
      if (!dragData.current) return;
      const c2 = container.getBoundingClientRect();
      const card = cardRef.current?.getBoundingClientRect();
      const cw = c2.width,
        ch = c2.height;
      const w = Math.round(card?.width ?? 380);
      const h = Math.round(card?.height ?? (collapsed ? 48 : 220));

      const x = ev.clientX - c2.left - dragData.current.dx;
      const y = ev.clientY - c2.top - dragData.current.dy;

      const clamp = (n: number, min: number, max: number) =>
        Math.max(min, Math.min(max, n));
      const nx = clamp(Math.round(x), 8, cw - w - 8);
      const ny = clamp(Math.round(y), 8, ch - h - 8);

      if (dragRaf.current) cancelAnimationFrame(dragRaf.current);
      dragRaf.current = requestAnimationFrame(() => setPos({ x: nx, y: ny }));
    };

    const end = (ev: PointerEvent) => {
      const el2 = downElRef.current;
      if (el2 && el2.hasPointerCapture?.(ev.pointerId)) {
        try {
          el2.releasePointerCapture?.(ev.pointerId);
        } catch {}
      }
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      dragData.current = null;
      if (dragRaf.current) {
        cancelAnimationFrame(dragRaf.current);
        dragRaf.current = null;
      }
      downElRef.current = null;
      setDragging(false);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  };

  const toggleCollapsed = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsed((v) => !v);
    requestAnimationFrame(() => {
      const container = document.getElementById('scene-root');
      const r = cardRef.current?.getBoundingClientRect();
      const c = container?.getBoundingClientRect();
      if (!r || !c) return;
      const nx = Math.min(pos.x, c.width - r.width - 8);
      const ny = Math.min(pos.y, c.height - r.height - 8);
      setPos({ x: Math.max(8, nx), y: Math.max(8, ny) });
    });
  };

  useEffect(() => {
    return () => {
      if (dragRaf.current) cancelAnimationFrame(dragRaf.current);
      dragRaf.current = null;
      dragData.current = null;
      downElRef.current = null;
    };
  }, []);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    const categories = motifsCatalog.length > 0 ? motifsCatalog : data.motifs;
    if (!searchQuery) return categories;
    
    const query = searchQuery.toLowerCase();
    return categories.filter(motif => 
      motif.name.toLowerCase().includes(query)
    );
  }, [searchQuery, motifsCatalog]);

  if (!isOpen) {
    return null;
  }

  return (
    <OverlayPortal containerId="scene-root">
      <div className="pointer-events-none absolute inset-0 z-10">
        <div
          ref={cardRef}
          className="pointer-events-auto absolute"
          style={{ left: pos.x, top: pos.y }}
        >
          <div className="w-[340px] overflow-hidden bg-black/70 text-white shadow-lg backdrop-blur-sm md:w-[380px]">
            <div className="flex items-center justify-between gap-2 px-4 py-3 select-none">
              <div
                onPointerDown={onPointerDown}
                title="Drag"
                aria-label="Drag overlay"
                className={`flex h-8 flex-1 items-center ${
                  dragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
              >
                <h1 className="text-base leading-none font-semibold">
                  {viewMode === 'categories' ? 'Select Motif Category' : `Motifs: ${selectedCategoryIndex !== null ? getMotifCategoryName((motifsCatalog.length > 0 ? motifsCatalog : data.motifs)[selectedCategoryIndex].name) : ''}`}
                </h1>
              </div>

              <div className="flex gap-2">
                {viewMode === 'motifs' && (
                  <button
                    onClick={handleBackToCategories}
                    aria-label="Back to categories"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/10 hover:bg-white/15 active:bg-white/20"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
                
                <button
                  onClick={toggleCollapsed}
                  aria-label={collapsed ? 'Maximize' : 'Minimize'}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/10 hover:bg-white/15 active:bg-white/20"
                >
                  {collapsed ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M8 3H3v5M3 16v5h5M21 8V3h-5M16 21h5v-5"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  )}
                </button>
                
                <button
                  onClick={handleClose}
                  aria-label="Close"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/10 hover:bg-white/15 active:bg-white/20"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {!collapsed && (
              <div className="px-4 pb-4">
      <div className="space-y-3">
        {/* Search Bar (Categories View) */}
        {viewMode === 'categories' && (
          <div className="relative">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 px-3 py-2 text-sm text-white placeholder-white/50 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Back Button (Motifs View) */}
        {viewMode === 'motifs' && (
          <button
            onClick={handleBackToCategories}
            className="flex w-full items-center space-x-2 bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
          >
            <span>←</span>
            <span>Back to Categories</span>
          </button>
        )}

        {/* Categories Grid */}
        {viewMode === 'categories' && (
          <div className="space-y-2">
            <div className="text-xs text-white/60">
              {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'}
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {filteredCategories.map((motif, index) => {
                // Find the actual index in the full array
                const fullArray = motifsCatalog.length > 0 ? motifsCatalog : data.motifs;
                const actualIndex = fullArray.indexOf(motif);
                // Get thumbnail path from png/motifs/s/
                const thumbnailPath = motif.thumbnailPath || motif.previewUrl || motif.img?.replace('/motifs/', '/png/motifs/s/');
                
                return (
                  <button
                    key={motif.id}
                    onClick={() => handleCategorySelect(actualIndex)}
                    className="group relative flex flex-col overflow-hidden bg-gray-900/50 hover:bg-gray-900 p-4 cursor-pointer"
                  >
                    {/* Category Preview Image */}
                    <div className="relative aspect-square w-full overflow-hidden bg-white mb-2">
                      <img
                        src={thumbnailPath}
                        alt={motif.name}
                        className="h-full w-full object-contain p-1"
                        loading="lazy"
                      />
                    </div>
                    
                    {/* Category Name */}
                    <div className="text-xs text-white text-center truncate">
                      {getMotifCategoryName(motif.name)}
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredCategories.length === 0 && (
              <div className="py-8 text-center text-sm text-white/50">
                No categories found matching "{searchQuery}"
              </div>
            )}
          </div>
        )}

        {/* Motifs Grid */}
        {viewMode === 'motifs' && selectedCategoryIndex !== null && (
          <div className="space-y-2">
            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>
                Showing {motifFiles.length} of {totalCount} motifs
              </span>
              {isLoading && <span className="animate-pulse">Loading...</span>}
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-500/20 p-3 text-sm text-red-200">
                Error loading motifs: {error.message}
              </div>
            )}

            {/* Motif Grid */}
            <div className="grid max-h-[60vh] grid-cols-4 gap-2 overflow-y-auto pr-2">
              {motifFiles.map((fileName) => {
                const thumbnailPath = getMotifThumbnailPath(fileName);
                
                return (
                  <button
                    key={fileName}
                    onClick={() => handleMotifSelect(fileName)}
                    className="relative aspect-square overflow-hidden bg-white cursor-pointer"
                    title={fileName}
                  >
                    <img
                      src={thumbnailPath}
                      alt={fileName}
                      className="h-full w-full object-contain p-1"
                      loading="lazy"
                    />
                  </button>
                );
              })}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={isLoading}
                className="w-full bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : `Load More (${totalCount - motifFiles.length} remaining)`}
              </button>
            )}

            {/* Empty State */}
            {!isLoading && motifFiles.length === 0 && (
              <div className="py-8 text-center text-sm text-white/50">
                No motifs available in this category
              </div>
            )}

            {/* Loading State */}
            {isLoading && motifFiles.length === 0 && (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-violet-500" />
              </div>
            )}
          </div>
        )}
      </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </OverlayPortal>
  );
}
