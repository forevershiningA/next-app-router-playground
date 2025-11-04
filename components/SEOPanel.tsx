'use client';

import React, { useState, useMemo, useEffect } from 'react';
import SceneOverlayController from '#/components/SceneOverlayController';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { 
  DESIGN_CATEGORIES, 
  type DesignCategory,
  type SavedDesignMetadata 
} from '#/lib/saved-designs-data';
import { MagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function SEOPanel() {
  const activePanel = useHeadstoneStore((s) => s.activePanel);
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);
  
  const [selectedCategory, setSelectedCategory] = useState<DesignCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryDesigns, setCategoryDesigns] = useState<SavedDesignMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);

  const isOpen = activePanel === 'designs';

  const handleClose = () => {
    setActivePanel(null);
    setSelectedCategory(null);
    setSearchQuery('');
    setCategoryDesigns([]);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSearchQuery('');
  };
  
  // Auto-hide global loader after 5 seconds as a safety measure
  useEffect(() => {
    if (globalLoading) {
      const timer = setTimeout(() => {
        setGlobalLoading(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [globalLoading]);

  // Load designs dynamically when category is selected
  useEffect(() => {
    if (!selectedCategory) {
      setCategoryDesigns([]);
      return;
    }

    setLoading(true);
    
    // Dynamic import to avoid loading all designs upfront
    import('#/lib/saved-designs-data').then(module => {
      const designs = module.getDesignsByCategory(selectedCategory);
      setCategoryDesigns(designs);
      setLoading(false);
    }).catch(error => {
      console.error('Failed to load designs:', error);
      setLoading(false);
    });
  }, [selectedCategory]);

  // Filter designs by search query
  const filteredDesigns = useMemo(() => {
    if (!searchQuery) return categoryDesigns;
    
    const query = searchQuery.toLowerCase();
    return categoryDesigns.filter(design =>
      design.title.toLowerCase().includes(query) ||
      design.productName.toLowerCase().includes(query) ||
      design.motifNames.some(m => m.toLowerCase().includes(query)) ||
      design.category.toLowerCase().includes(query)
    );
  }, [categoryDesigns, searchQuery]);

  if (!isOpen) return null;

  return (
    <>
      {/* Global Loader */}
      {globalLoading && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 animate-spin rounded-full border-[6px] border-white/30 border-t-white" />
            <div className="font-mono text-lg text-white">Loading design...</div>
          </div>
        </div>
      )}

      <SceneOverlayController
        section="ai-designs"
        title={selectedCategory ? DESIGN_CATEGORIES[selectedCategory].name : 'AI Design Ideas'}
        persistKey="ai-designs"
        isOpen={isOpen}
        onClose={handleClose}
      >
        <div className="space-y-3">
          {!selectedCategory ? (
            // Category Selection
            <>
              {/* Info Banner */}
              <div className="bg-white border border-gray-300 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <SparklesIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Browse AI-Generated Design Ideas</p>
                    <p className="text-xs text-gray-700 mt-1">
                      {Object.keys(DESIGN_CATEGORIES).length} categories with thousands of professionally designed templates
                    </p>
                  </div>
                </div>
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(DESIGN_CATEGORIES).map(([slug, category]) => (
                  <button
                    key={slug}
                    onClick={() => setSelectedCategory(slug as DesignCategory)}
                    className="w-full text-left p-4 bg-black rounded-lg hover:shadow-lg transition-all group outline outline-1 outline-gray-700 hover:outline-gray-500 cursor-pointer"
                  >
                    <div className="font-semibold text-base text-white group-hover:text-blue-400">
                      {category.name}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 group-hover:text-gray-300">
                      {category.description}
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
          // Design Grid
          <>
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search designs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Design Count */}
            <div className="text-sm text-gray-600 px-1">
              {filteredDesigns.length} design{filteredDesigns.length !== 1 ? 's' : ''} found
            </div>

            {loading ? (
              // Loading
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-600 mt-2">Loading designs...</p>
              </div>
            ) : filteredDesigns.length === 0 ? (
              // No results
              <div className="text-center py-12">
                <p className="text-sm text-gray-500">
                  {searchQuery ? 'No designs match your search' : 'No designs in this category'}
                </p>
              </div>
            ) : (
              // Design Cards
              <div className="grid grid-cols-2 gap-3">
                {filteredDesigns.slice(0, 20).map((design) => (
                  <DesignCard key={design.id} design={design} onClose={handleClose} setGlobalLoading={setGlobalLoading} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </SceneOverlayController>
    </>
  );
}

// Design Card Component
interface DesignCardProps {
  design: SavedDesignMetadata;
  onClose: () => void;
  setGlobalLoading: (loading: boolean) => void;
}

function DesignCard({ design, onClose, setGlobalLoading }: DesignCardProps) {
  const handleLoadDesign = () => {
    // Show global loader immediately
    setGlobalLoading(true);
    
    // Close the panel
    onClose();
    
    // Use requestAnimationFrame to ensure the loader is rendered before navigation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Construct the URL with product slug
        const designUrl = `/designs/${design.productSlug}/${design.category}/${design.id}_${design.slug}`;
        
        // Navigate to the design
        window.location.href = designUrl;
      });
    });
  };

  return (
    <div 
      className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
      onClick={handleLoadDesign}
    >
      {/* Preview Image */}
      <div className="relative aspect-[4/3] bg-gray-800">
        {design.preview !== '/placeholder-memorial.png' ? (
          <Image
            src={design.preview}
            alt={design.title}
            fill
            className="object-cover"
            sizes="200px"
            onError={(e) => {
              // Hide image on error and show placeholder background
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-2 opacity-30" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <div className="text-xs opacity-50">Design Preview</div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2">
        <h4 className="font-semibold text-gray-900 text-xs line-clamp-1 group-hover:text-blue-600 mb-1">
          {design.title}
        </h4>
        
        {/* Motifs */}
        {design.motifNames && design.motifNames.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1">
            {design.motifNames.slice(0, 2).map((motif, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
              >
                {motif}
              </span>
            ))}
          </div>
        )}

        {/* Product Type */}
        <div className="text-xs text-gray-500">
          {design.productType}
        </div>
      </div>
    </div>
  );
}
