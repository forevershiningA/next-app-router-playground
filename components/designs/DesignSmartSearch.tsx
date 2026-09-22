'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import type { SearchFilters } from '#/lib/ml-search-service';
import { EMPTY_FILTERS, getMLCategories, hasActiveFilters } from '#/lib/ml-search-service';

interface DesignSmartSearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  resultCount: number;
  totalCount: number;
  isSearching: boolean;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export default function DesignSmartSearch({
  filters,
  onFiltersChange,
  resultCount,
  totalCount,
  isSearching,
  sortBy,
  onSortChange,
}: DesignSmartSearchProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<{
    types: string[];
    styles: string[];
    motifs: string[];
  }>({ types: [], styles: [], motifs: [] });
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getMLCategories().then(setCategories);
  }, []);

  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFiltersChange({ ...filters, query: e.target.value });
    },
    [filters, onFiltersChange],
  );

  const handleClear = useCallback(() => {
    onFiltersChange(EMPTY_FILTERS);
    onSortChange('relevance');
    searchRef.current?.focus();
  }, [onFiltersChange, onSortChange]);

  const active = hasActiveFilters(filters);
  const activeFilterCount = [
    filters.mlType,
    filters.mlStyle,
    filters.mlMotif,
    filters.hasPhoto !== null ? 'x' : '',
    filters.hasMotifs !== null ? 'x' : '',
    filters.hasAdditions !== null ? 'x' : '',
  ].filter(Boolean).length;

  return (
    <div className="mb-12">
      {/* Search bar + filter button */}
      <div className="max-w-3xl mx-auto flex gap-2 items-stretch">
        {/* Text input */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            value={filters.query}
            onChange={handleQueryChange}
            placeholder="Search designs by name, motif, shape, inscription..."
            className="w-full pl-12 pr-10 py-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 shadow-sm text-base font-light transition-all"
          />
          {active && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
              title="Clear search"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters button — outside the input */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`relative flex items-center gap-2 px-4 rounded-xl border shadow-sm text-sm font-light transition-all ${
            showFilters || activeFilterCount > 0
              ? 'bg-slate-800 text-white border-slate-800'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-800'
          }`}
          title="Toggle filters"
        >
          <FunnelIcon className="w-4 h-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 bg-amber-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Active filter chips — visible when filters are on but panel is closed */}
      {!showFilters && activeFilterCount > 0 && (
        <div className="max-w-3xl mx-auto mt-8 flex flex-wrap gap-2">
          {filters.mlType && (
            <FilterChip
              label={`Type: ${filters.mlType}`}
              onRemove={() => onFiltersChange({ ...filters, mlType: '' })}
            />
          )}
          {filters.mlStyle && (
            <FilterChip
              label={`Style: ${filters.mlStyle}`}
              onRemove={() => onFiltersChange({ ...filters, mlStyle: '' })}
            />
          )}
          {filters.mlMotif && (
            <FilterChip
              label={`Motif: ${filters.mlMotif}`}
              onRemove={() => onFiltersChange({ ...filters, mlMotif: '' })}
            />
          )}
          {filters.hasPhoto !== null && (
            <FilterChip
              label={filters.hasPhoto ? 'Has Photo' : 'No Photo'}
              onRemove={() => onFiltersChange({ ...filters, hasPhoto: null })}
            />
          )}
          {filters.hasMotifs !== null && (
            <FilterChip
              label={filters.hasMotifs ? 'Has Motifs' : 'No Motifs'}
              onRemove={() => onFiltersChange({ ...filters, hasMotifs: null })}
            />
          )}
          {filters.hasAdditions !== null && (
            <FilterChip
              label={filters.hasAdditions ? 'Has Additions' : 'No Additions'}
              onRemove={() => onFiltersChange({ ...filters, hasAdditions: null })}
            />
          )}
        </div>
      )}

      {/* Filter panel */}
      {showFilters && (
        <div className="max-w-3xl mx-auto mt-6 p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Type filter */}
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                Product Type
              </label>
              <select
                value={filters.mlType}
                onChange={(e) =>
                  onFiltersChange({ ...filters, mlType: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                <option value="">All Types</option>
                {categories.types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Style filter */}
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                Style
              </label>
              <select
                value={filters.mlStyle}
                onChange={(e) =>
                  onFiltersChange({ ...filters, mlStyle: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                <option value="">All Styles</option>
                {categories.styles.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Motif filter */}
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                Motif Category
              </label>
              <select
                value={filters.mlMotif}
                onChange={(e) =>
                  onFiltersChange({ ...filters, mlMotif: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                <option value="">All Motifs</option>
                {categories.motifs.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Feature toggles */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">
              Features:
            </span>
            <ToggleChip
              label="Has Photo"
              value={filters.hasPhoto}
              onChange={(v) => onFiltersChange({ ...filters, hasPhoto: v })}
            />
            <ToggleChip
              label="Has Motifs"
              value={filters.hasMotifs}
              onChange={(v) => onFiltersChange({ ...filters, hasMotifs: v })}
            />
            <ToggleChip
              label="Has Additions"
              value={filters.hasAdditions}
              onChange={(v) =>
                onFiltersChange({ ...filters, hasAdditions: v })
              }
            />
          </div>
        </div>
      )}

      {/* Results summary + sort */}
      {active && (
        <div className="mt-8 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-slate-600 font-light">
            {isSearching ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                Searching...
              </span>
            ) : (
              <>
                Found{' '}
                <span className="font-medium text-slate-900">
                  {resultCount.toLocaleString()}
                </span>{' '}
                of {totalCount.toLocaleString()} designs
              </>
            )}
          </p>
          <div className="flex items-center gap-4">
            {resultCount > 1 && (
              <div className="flex items-center gap-2">
                <label
                  htmlFor="sort-select"
                  className="text-xs text-slate-400 font-light whitespace-nowrap"
                >
                  Sort by:
                </label>
                <div className="relative">
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="appearance-none pl-3 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 font-normal focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer"
                  >
                    <option value="relevance">Best Match</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A – Z</option>
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            )}
            {/* Only show when ML/feature filters are active — query text has its own X */}
            {activeFilterCount > 0 && (
              <button
                onClick={handleClear}
                className="text-sm text-slate-500 hover:text-slate-700 font-light underline underline-offset-4 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Active filter chip                                                 */
/* ------------------------------------------------------------------ */

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs text-slate-700 font-light">
      {label}
      <button
        onClick={onRemove}
        className="text-slate-400 hover:text-slate-600 transition-colors"
        title={`Remove filter: ${label}`}
      >
        <XMarkIcon className="w-3.5 h-3.5" />
      </button>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Toggle chip for feature filters                                   */
/* ------------------------------------------------------------------ */

function ToggleChip({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean | null) => void;
}) {
  const handleClick = () => {
    if (value === null) onChange(true);
    else if (value === true) onChange(false);
    else onChange(null);
  };

  return (
    <button
      onClick={handleClick}
      className={`px-3 py-1.5 rounded-full text-xs font-light tracking-wide border transition-all ${
        value === true
          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
          : value === false
            ? 'bg-red-50 border-red-300 text-red-700'
            : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
      }`}
    >
      {value === true && '✓ '}
      {value === false && '✕ '}
      {label}
    </button>
  );
}
