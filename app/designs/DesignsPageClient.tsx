'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import type { SavedDesignMetadata } from '#/lib/saved-designs-data';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
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

const MAX_DISPLAY_RESULTS = 60;

export default function DesignsPageClient({ initialQuery = '' }: { initialQuery?: string }) {
  const [allDesigns, setAllDesigns] = useState<SavedDesignMetadata[]>([]);
  const [groupedDesigns, setGroupedDesigns] = useState<Record<string, SavedDesignMetadata[]>>({});
  const [loading, setLoading] = useState(true);

  // Search state
  const [filters, setFilters] = useState<SearchFilters>(() =>
    initialQuery ? { ...EMPTY_FILTERS, query: initialQuery } : EMPTY_FILTERS,
  );
  // Full (uncapped) sorted result list — display is derived via useMemo
  const [fullSearchResults, setFullSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mlReady, setMlReady] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const mlIndexRef = useRef<Map<string, MLDesignEntry>>(new Map());
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Sorted + capped results for rendering — never re-triggers a search
  const displayResults = useMemo(() => {
    if (sortBy === 'relevance') return fullSearchResults.slice(0, MAX_DISPLAY_RESULTS);

    const sorted = [...fullSearchResults];
    if (sortBy === 'price-asc') {
      sorted.sort((a, b) => (a.mlData?.design_price ?? Infinity) - (b.mlData?.design_price ?? Infinity));
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => (b.mlData?.design_price ?? -Infinity) - (a.mlData?.design_price ?? -Infinity));
    } else if (sortBy === 'name-asc') {
      sorted.sort((a, b) => {
        const aName = a.design.shapeName || a.design.title;
        const bName = b.design.shapeName || b.design.title;
        return aName.localeCompare(bName);
      });
    }
    return sorted.slice(0, MAX_DISPLAY_RESULTS);
  }, [fullSearchResults, sortBy]);

  // Load designs — restricted to designs with v2026-3d regenerated screenshots
  useEffect(() => {
    const loadDesigns = async () => {
      const [{ SAVED_DESIGNS }, v2026Ids] = await Promise.all([
        import('#/lib/saved-designs-data'),
        fetch('/screenshots/v2026-3d-ids.json').then((r) => r.json() as Promise<string[]>).catch(() => [] as string[]),
      ]);

      const v2026Set = new Set(v2026Ids);
      let designs = Object.values(SAVED_DESIGNS).filter((d) => v2026Set.has(d.id));

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

      if (initialQuery) {
        const f = { ...EMPTY_FILTERS, query: initialQuery };
        // ML index may not be ready yet; re-runs when mlReady fires below
        const results = searchDesigns(designs, mlIndexRef.current, f);
        setFullSearchResults(results);
      }
    };
    loadDesigns();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // Load ML data in background
  useEffect(() => {
    loadMLData().then((index) => {
      mlIndexRef.current = index;
      setMlReady(true);
    });
  }, []);

  // Re-run search once ML data is ready (initial page load with ?q= hits empty index)
  useEffect(() => {
    if (mlReady && allDesigns.length > 0 && hasActiveFilters(filters)) {
      runSearch(filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mlReady, allDesigns.length]);

  // Debounced search
  const runSearch = useCallback(
    async (f: SearchFilters) => {
      if (!hasActiveFilters(f)) {
        setFullSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      const results = searchDesigns(allDesigns, mlIndexRef.current, f);

      // If all 3 ML filters set, try ML ranking
      if (f.mlType && f.mlStyle && f.mlMotif) {
        const ranked = await mlRankResults(results, f.mlType, f.mlStyle, f.mlMotif);
        setFullSearchResults(ranked);
      } else {
        setFullSearchResults(results);
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
          resultCount={fullSearchResults.length}
          totalCount={totalDesigns}
          isSearching={isSearching}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Search Results or Product Grid */}
        {isSearchActive ? (
          displayResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayResults.map(({ design, mlData, matchedOn }) => (
                <Link
                  key={design.id}
                  href={`/designs/${design.productSlug}/${design.category}/${design.slug}`}
                  className="group bg-white rounded-lg border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-2xl transition-all duration-300"
                >
                  {/* Thumbnail — v2026-3d regenerated screenshot */}
                  <div className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden">
                    <Image
                      src={`/screenshots/v2026-3d/${design.id}_small.png`}
                      alt={design.title}
                      fill
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      unoptimized
                      onError={(e) => {
                        const img = e.currentTarget;
                        const fallback = design.preview
                          ? design.preview.replace(/\.(jpg|jpeg|png)$/i, '_small.jpg')
                          : null;
                        if (fallback && img.src !== fallback) {
                          img.src = fallback;
                        } else {
                          img.style.display = 'none';
                        }
                      }}
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif font-light text-xl text-slate-900 mb-1 group-hover:text-slate-700 transition-colors">
                      {design.shapeName
                        ? `${design.shapeName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}`
                        : design.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </h3>

                    <p className="text-xs text-slate-400 font-light mb-3">
                      {design.productName}
                    </p>

                    {/* Inscription match hint — generic, no text exposed */}
                    {matchedOn === 'inscription' && (
                      <p className="text-xs text-slate-400 font-light italic mb-3">
                        Matched inscription text
                      </p>
                    )}
                    {matchedOn === 'mixed' && (
                      <p className="text-xs text-slate-400 font-light italic mb-3">
                        Matched shape &amp; inscription
                      </p>
                    )}

                    {/* Motif tags — deduplicated gray pills, max 3 */}
                    {design.motifNames.length > 0 && (() => {
                      const seen = new Set<string>();
                      const unique = design.motifNames.filter(n => {
                        const key = n.toLowerCase().replace(/s$/, '');
                        if (seen.has(key)) return false;
                        seen.add(key);
                        return true;
                      });
                      return (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {unique.slice(0, 3).map((name) => (
                            <span
                              key={name}
                              className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-light rounded-full"
                            >
                              {name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()}
                            </span>
                          ))}
                          {unique.length > 3 && (
                            <span className="px-2 py-0.5 text-slate-400 text-xs font-light">
                              +{unique.length - 3} more
                            </span>
                          )}
                        </div>
                      );
                    })()}

                    {/* Price + CTA */}
                    <div className="pt-3 border-t border-slate-100 flex items-end justify-between gap-2">
                      <div>
                        {mlData?.design_price != null && mlData.design_price > 0 ? (
                          <p className="text-lg font-serif text-slate-900">
                            <span className="font-light text-sm text-slate-400">From </span>
                            ${mlData.design_price.toFixed(2)}
                          </p>
                        ) : (
                          <p className="text-sm text-slate-400 font-light italic">Quote on request</p>
                        )}
                      </div>
                      <div className="flex items-center text-slate-500 font-medium text-xs uppercase tracking-widest group-hover:text-slate-900 group-hover:translate-x-1 transition-all duration-300 shrink-0">
                        <span>View</span>
                        <ChevronRightIcon className="w-3.5 h-3.5 ml-0.5" />
                      </div>
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
