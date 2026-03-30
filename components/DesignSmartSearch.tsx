'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import type { SearchFilters } from '#/lib/ml-search-service';
import { EMPTY_FILTERS, getMLCategories, hasActiveFilters } from '#/lib/ml-search-service';

interface DesignSmartSearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  resultCount: number;
  totalCount: number;
  isSearching: boolean;
  mlReady: boolean;
}

export default function DesignSmartSearch({
  filters,
  onFiltersChange,
  resultCount,
  totalCount,
  isSearching,
  mlReady,
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
    searchRef.current?.focus();
  }, [onFiltersChange]);

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
      {/* Search bar */}
      <div className="relative max-w-3xl mx-auto">
        <div className="relative flex items-center">
          <MagnifyingGlassIcon className="absolute left-4 w-5 h-5 text-slate-400" />
          <input
            ref={searchRef}
            type="text"
            value={filters.query}
            onChange={handleQueryChange}
            placeholder="Search designs by name, motif, shape, inscription..."
            className="w-full pl-12 pr-24 py-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 shadow-sm text-base font-light transition-all"
          />
          <div className="absolute right-3 flex items-center gap-2">
            {active && (
              <button
                onClick={handleClear}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                title="Clear search"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters || activeFilterCount > 0
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
              title="Toggle filters"
            >
              <FunnelIcon className="w-5 h-5" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ML status indicator */}
        {mlReady && (
          <div className="absolute -bottom-6 right-0 flex items-center gap-1 text-xs text-emerald-600">
            <SparklesIcon className="w-3.5 h-3.5" />
            <span className="font-light">AI-powered search active</span>
          </div>
        )}
      </div>

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

      {/* Results summary */}
      {active && (
        <div className="max-w-3xl mx-auto mt-8 flex items-center justify-between">
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
          <button
            onClick={handleClear}
            className="text-sm text-slate-500 hover:text-slate-700 font-light underline underline-offset-4 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
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
