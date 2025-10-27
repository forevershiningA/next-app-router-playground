/**
 * Example component showing how to use the motif category hooks
 * This replaces the old getCategory() function with modern React patterns
 */

'use client';

import { useState } from 'react';
import { useMotifCategory } from './use-motifs';
import { data } from '../app/_internal/_data';
import { getMotifFilePath } from './motifs';
import type { ProductFormula } from './motifs';

interface MotifCategoryListProps {
  categoryIndex: number;
  formula?: ProductFormula;
}

export function MotifCategoryList({ categoryIndex, formula }: MotifCategoryListProps) {
  const category = data.motifs[categoryIndex];
  
  const {
    files,
    totalCount,
    hasMore,
    isLoading,
    error,
    loadMore,
  } = useMotifCategory({
    categoryIndex,
    formula,
    initialLimit: 50,
    loadMoreIncrement: 50,
  });

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-800">
          Error loading motifs: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{category.name}</h2>
        <p className="text-sm text-gray-500">
          Showing {files.length} of {totalCount} motifs
        </p>
      </div>

      {/* Motif Grid */}
      <div className="grid grid-cols-4 gap-4 md:grid-cols-6 lg:grid-cols-8">
        {files.map((fileName) => {
          const filePath = getMotifFilePath(categoryIndex, fileName);
          
          return (
            <button
              key={fileName}
              className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:border-gray-400 hover:shadow-md"
              onClick={() => {/* Selected motif */}}
            >
              <img
                src={filePath}
                alt={fileName}
                className="h-full w-full object-contain p-2"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100">
                <span className="text-xs text-white">{fileName}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && files.length === 0 && (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        </div>
      )}
    </div>
  );
}

/**
 * Simple usage example
 */
export function MotifCategoryExample() {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [formula] = useState<ProductFormula>('Laser');

  return (
    <div className="space-y-6">
      {/* Category Selector */}
      <div className="space-y-2">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Select Motif Category
        </label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(Number(e.target.value))}
          className="block w-full rounded-md border border-gray-300 px-3 py-2"
        >
          {data.motifs.map((motif, index) => (
            <option key={index} value={index}>
              {motif.name}
            </option>
          ))}
        </select>
      </div>

      {/* Motif List */}
      <MotifCategoryList categoryIndex={selectedCategory} formula={formula} />
    </div>
  );
}

/**
 * Usage in your code:
 * 
 * // Instead of the old code:
 * // dyo.engine.motifs.getCategory(index)
 * 
 * // Use the new hook:
 * const { files, hasMore, loadMore } = useMotifCategory({
 *   categoryIndex: index,
 *   formula: 'Laser',
 *   initialLimit: 50
 * });
 * 
 * // Files are automatically loaded and available in the `files` array
 * // To load more: await loadMore()
 */
