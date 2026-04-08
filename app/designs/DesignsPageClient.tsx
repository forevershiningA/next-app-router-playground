'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { SavedDesignMetadata } from '#/lib/saved-designs-data';
import { ChevronRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import MobileNavToggle from '#/components/MobileNavToggle';
import DesignsTreeNav from '#/components/DesignsTreeNav';
import DesignSmartSearch from '#/components/DesignSmartSearch';
import type { SearchFilters, SearchResult, MLDesignEntry } from '#/lib/ml-search-service';
import {
  EMPTY_FILTERS,
  loadMLData,
  searchDesigns,
  mlRankResults,
  hasActiveFilters,
} from '#/lib/ml-search-service';

const MAX_SEARCH_RESULTS = 60;

export default function DesignsPageClient() {
  const [allDesigns, setAllDesigns] = useState<SavedDesignMetadata[]>([]);
  const [groupedDesigns, setGroupedDesigns] = useState<Record<string, SavedDesignMetadata[]>>({});
  const [loading, setLoading] = useState(true);

  // Search state
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mlReady, setMlReady] = useState(false);
  const mlIndexRef = useRef<Map<string, MLDesignEntry>>(new Map());
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load designs (filter out hidden ones on localhost)
  useEffect(() => {
    const loadDesigns = async () => {
      const { SAVED_DESIGNS } = await import('#/lib/saved-designs-data');
      let designs = Object.values(SAVED_DESIGNS);

      const isLocal =
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocal) {
        try {
          const res = await fetch('/api/hidden-designs');
          const hiddenIds: string[] = await res.json();
          if (hiddenIds.length > 0) {
            const hiddenSet = new Set(hiddenIds);
            designs = designs.filter((d) => !hiddenSet.has(d.id));
          }
        } catch {}
      }

      setAllDesigns(designs);

      const grouped = designs.reduce((acc, design) => {
        const type = design.productSlug;
        if (!acc[type]) acc[type] = [];
        acc[type].push(design);
        return acc;
      }, {} as Record<string, SavedDesignMetadata[]>);

      setGroupedDesigns(grouped);
      setLoading(false);
    };
    loadDesigns();
  }, []);

  // Load ML data in background
  useEffect(() => {
    loadMLData().then((index) => {
      mlIndexRef.current = index;
      setMlReady(true);
    });
  }, []);

  // Debounced search
  const runSearch = useCallback(
    async (f: SearchFilters) => {
      if (!hasActiveFilters(f)) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      const results = searchDesigns(allDesigns, mlIndexRef.current, f);

      // If all 3 ML filters set, try ML ranking
      if (f.mlType && f.mlStyle && f.mlMotif) {
        const ranked = await mlRankResults(results, f.mlType, f.mlStyle, f.mlMotif);
        setSearchResults(ranked.slice(0, MAX_SEARCH_RESULTS));
      } else {
        setSearchResults(results.slice(0, MAX_SEARCH_RESULTS));
      }

      setIsSearching(false);
    },
    [allDesigns],
  );

  const handleFiltersChange = useCallback(
    (newFilters: SearchFilters) => {
      setFilters(newFilters);
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      searchTimerRef.current = setTimeout(() => runSearch(newFilters), 250);
    },
    [runSearch],
  );

  if (loading) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800 mx-auto mb-4" />
          <p className="text-xl text-slate-600 font-light">Loading memorial designs...</p>
        </div>
      </div>
    );
  }

  const totalDesigns = allDesigns.length;
  const isSearchActive = hasActiveFilters(filters);

  return (
    <>
      <MobileNavToggle>
        <DesignsTreeNav />
      </MobileNavToggle>
      
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-y-auto md:ml-[400px] min-h-screen">
      <div className="container mx-auto px-8 py-12 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-12">
          <a href="/" className="hover:text-slate-900 transition-colors font-light tracking-wide">Home</a>
          <ChevronRightIcon className="w-4 h-4" />
          <span className="text-slate-900 font-medium tracking-wide">Memorial Designs</span>
        </nav>

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-serif font-light text-slate-900 mb-4 tracking-tight">
            Memorial Design Collection
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-slate-400 to-transparent mx-auto mb-6" />
          <p className="text-xl text-slate-600 font-light max-w-2xl mx-auto leading-relaxed">
            Thoughtfully crafted designs to honor and celebrate the memory of your loved ones
          </p>
          <p className="text-sm text-slate-500 mt-4 font-light">
            {totalDesigns.toLocaleString()} designs across {Object.keys(groupedDesigns).length} collections
          </p>
        </div>

        {/* Smart Search */}
        <DesignSmartSearch
          filters={filters}
          onFiltersChange={handleFiltersChange}
          resultCount={searchResults.length}
          totalCount={totalDesigns}
          isSearching={isSearching}
          mlReady={mlReady}
        />

        {/* Search Results or Product Grid */}
        {isSearchActive ? (
          searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {searchResults.map(({ design, mlData, mlConfidence }) => (
                <Link
                  key={design.id}
                  href={`/designs/${design.productSlug}/${design.category}/${design.slug}`}
                  className="group bg-white rounded-lg border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="p-6">
                    {/* ML confidence badge */}
                    {mlConfidence != null && mlConfidence > 0.01 && (
                      <div className="flex items-center gap-1 mb-2">
                        <SparklesIcon className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[10px] uppercase tracking-wider text-amber-600 font-medium">
                          AI Recommended
                        </span>
                      </div>
                    )}

                    <h3 className="font-serif font-light text-xl text-slate-900 mb-1 group-hover:text-slate-700 transition-colors">
                      {design.shapeName
                        ? `${design.shapeName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}`
                        : design.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </h3>

                    <p className="text-xs text-slate-500 font-light mb-3 uppercase tracking-wider">
                      {design.productName}
                    </p>

                    {/* Motifs */}
                    {design.motifNames.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Motifs</p>
                        <p className="text-sm text-slate-700 font-light">
                          {design.motifNames.join(', ')}
                        </p>
                      </div>
                    )}

                    {/* ML Category Tags */}
                    {mlData && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {mlData.ml_style && (
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-light uppercase tracking-wider border border-indigo-100 rounded">
                            {mlData.ml_style}
                          </span>
                        )}
                        {mlData.ml_motif && (
                          <span className="px-2 py-0.5 bg-violet-50 text-violet-600 text-[10px] font-light uppercase tracking-wider border border-violet-100 rounded">
                            {mlData.ml_motif}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Feature badges */}
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      {design.hasPhoto && (
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-light uppercase tracking-wider border border-emerald-200">
                          Photo
                        </span>
                      )}
                      {design.hasMotifs && (
                        <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-light uppercase tracking-wider border border-amber-200">
                          {design.motifNames.length} Motif{design.motifNames.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      {design.hasAdditions && (
                        <span className="px-2.5 py-0.5 bg-orange-50 text-orange-700 text-[10px] font-light uppercase tracking-wider border border-orange-200">
                          Additions
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    {mlData?.design_price != null && mlData.design_price > 0 && (
                      <div className="pt-3 border-t border-slate-100 mb-3">
                        <p className="text-lg font-serif text-slate-900">
                          <span className="font-light text-sm text-slate-500">From </span>
                          ${mlData.design_price.toFixed(2)}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center text-slate-700 font-light text-sm uppercase tracking-wider group-hover:translate-x-1 transition-transform duration-300">
                      <span>View Design</span>
                      <ChevronRightIcon className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : !isSearching ? (
            <div className="text-center py-16">
              <p className="text-slate-600 text-lg font-light mb-2">No designs match your search.</p>
              <p className="text-slate-400 text-sm font-light">Try different keywords or adjust your filters.</p>
            </div>
          ) : null
        ) : (
          /* Product Type Categories Grid (default view) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(groupedDesigns).map(([productSlug, designs]) => {
              const productLabel = productSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
              const categories = new Set(designs.map(d => d.category || 'uncategorized'));
              
              return (
                <Link
                  key={productSlug}
                  href={`/designs/${productSlug}`}
                  className="group bg-white rounded-lg shadow-sm hover:shadow-2xl transition-all duration-300 p-8 border border-slate-200 hover:border-slate-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative flex flex-col h-full">
                    <h2 className="text-2xl font-serif font-light text-slate-900 mb-4 group-hover:text-slate-700 transition-colors">
                      {productLabel}
                    </h2>
                    
                    <div className="w-12 h-px bg-gradient-to-r from-slate-300 to-transparent mb-6" />
                    
                    <div className="flex flex-col gap-3 text-slate-600 mb-6 font-light">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-serif text-slate-900">{designs.length.toLocaleString()}</span>
                        <span className="text-sm uppercase tracking-wider">design{designs.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-baseline gap-2 text-xs">
                        <span className="text-slate-500">across {categories.size} categor{categories.size !== 1 ? 'ies' : 'y'}</span>
                      </div>
                    </div>
                    
                    <div className="mt-auto flex items-center text-slate-800 font-light tracking-wide group-hover:translate-x-1 transition-transform duration-300">
                      <span className="text-sm uppercase">Explore Collection</span>
                      <ChevronRightIcon className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
