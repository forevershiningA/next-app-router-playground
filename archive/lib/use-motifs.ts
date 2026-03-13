'use client';

/**
 * React hooks for managing motif categories and files
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getMotifCategory,
  loadMoreMotifFiles,
  type ProductFormula,
} from './motifs';

interface UseMotifCategoryOptions {
  categoryIndex: number;
  formula?: ProductFormula;
  initialLimit?: number;
  loadMoreIncrement?: number;
}

interface UseMotifCategoryResult {
  files: string[];
  totalCount: number;
  hasMore: boolean;
  isLoading: boolean;
  error: Error | null;
  loadMore: () => Promise<void>;
  reload: () => Promise<void>;
}

/**
 * Hook to load and manage motif files for a category with pagination
 */
export function useMotifCategory({
  categoryIndex,
  formula,
  initialLimit = 50,
  loadMoreIncrement = 50,
}: UseMotifCategoryOptions): UseMotifCategoryResult {
  const [files, setFiles] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load initial files
  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getMotifCategory(categoryIndex, formula, initialLimit);
      setFiles(result.files);
      setTotalCount(result.totalCount);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load motifs'));
    } finally {
      setIsLoading(false);
    }
  }, [categoryIndex, formula, initialLimit]);

  // Load more files
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await loadMoreMotifFiles(
        categoryIndex,
        formula,
        files.length,
        loadMoreIncrement
      );
      
      setFiles(prev => [...prev, ...result.files]);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load more motifs'));
    } finally {
      setIsLoading(false);
    }
  }, [categoryIndex, formula, files.length, loadMoreIncrement, hasMore, isLoading]);

  // Reload from scratch
  const reload = useCallback(async () => {
    setFiles([]);
    await loadFiles();
  }, [loadFiles]);

  // Load files when dependencies change
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  return {
    files,
    totalCount,
    hasMore,
    isLoading,
    error,
    loadMore,
    reload,
  };
}

/**
 * Simpler hook that loads all files at once (no pagination)
 */
export function useMotifCategoryAll(
  categoryIndex: number,
  formula?: ProductFormula
) {
  const [files, setFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadFiles = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getMotifCategory(categoryIndex, formula, 0);
        setFiles(result.files);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load motifs'));
      } finally {
        setIsLoading(false);
      }
    };

    loadFiles();
  }, [categoryIndex, formula]);

  return { files, isLoading, error };
}
