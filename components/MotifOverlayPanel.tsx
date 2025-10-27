'use client';

import React, { useState, useCallback, useMemo } from 'react';
import SceneOverlayController from '#/components/SceneOverlayController';
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
  
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'categories' | 'motifs'>('categories');

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

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return data.motifs;
    
    const query = searchQuery.toLowerCase();
    return data.motifs.filter(motif => 
      motif.name.toLowerCase().includes(query) ||
      motif.src.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  if (!isOpen) {
    return null;
  }

  return (
    <SceneOverlayController
      section="motifs"
      title={viewMode === 'categories' ? 'Select Motif Category' : `Motifs: ${selectedCategoryIndex !== null ? getMotifCategoryName(data.motifs[selectedCategoryIndex].name) : ''}`}
      persistKey="motifs"
      isOpen={isOpen}
      onClose={handleClose}
    >
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
                const actualIndex = data.motifs.indexOf(motif);
                // Get thumbnail path from shapes/motifs/s/ instead of /motifs/
                const thumbnailPath = motif.img.replace('/motifs/', '/shapes/motifs/s/');
                
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
    </SceneOverlayController>
  );
}
