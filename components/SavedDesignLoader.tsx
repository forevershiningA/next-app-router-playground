'use client';

import { useEffect, useState } from 'react';
import type { SavedDesignMetadata } from '#/lib/saved-designs-data';

interface SavedDesignLoaderProps {
  designId: string;
  onLoad?: (design: SavedDesignData) => void;
  mlDir?: string;
}

interface DesignItem {
  productid: number | string;
  type: string;
  name?: string;
  label?: string;
  font?: string;
  font_size?: number;
  font_family?: string;
  color?: string;
  colorName?: string;
  x?: number;
  y?: number;
  rotation?: number;
  width?: number;
  height?: number;
  texture?: string;
  shape?: string;
  part?: string;
  side?: string;
  price?: number | null;
  quantity?: number;
  [key: string]: any;
}

export type SavedDesignData = DesignItem[];

export function SavedDesignLoader({ designId, onLoad, mlDir = 'forevershining' }: SavedDesignLoaderProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [design, setDesign] = useState<SavedDesignData | null>(null);

  useEffect(() => {
    async function loadDesign() {
      try {
        setLoading(true);
        setError(null);

        const url = `/ml/${mlDir}/saved-designs/json/${designId}.json`;

        // Fetch the saved design JSON
        const response = await fetch(url, { cache: 'no-store' });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`Design "${designId}" not found. It may have been removed or the link is invalid.`);
          }
          throw new Error(`Failed to load design: ${designId} (Status: ${response.status})`);
        }

        const data = await response.json();
        
        setDesign(data);
        
        if (onLoad) {
          onLoad(data);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load design';
        console.error('❌ Error loading saved design:', errorMsg);
        console.error('📋 Full error:', err);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }

    if (designId) {
      loadDesign();
    } else {
      console.warn('⚠️ No design ID provided');
    }
  }, [designId, onLoad, mlDir]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="mx-auto mb-4 text-6xl">⚠️</div>
        <p className="mb-2 text-lg font-semibold text-red-600">Failed to Load Design</p>
        <p className="text-sm text-gray-600">{error}</p>
        <button
          onClick={() => window.location.href = '/seo'}
          className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Browse Other Designs
        </button>
      </div>
    );
  }

  return null;
}

/**
 * Hook to use saved design data
 */
export function useSavedDesign(designId: string | null, mlDir: string = 'forevershining') {
  const [design, setDesign] = useState<SavedDesignData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!designId) {
      setDesign(null);
      return;
    }

    async function loadDesign() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/ml/${mlDir}/saved-designs/json/${designId}.json`, { cache: 'no-store' });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`Design "${designId}" not found. It may have been removed or the link is invalid.`);
          }
          throw new Error(`Failed to load design: ${designId} (Status: ${response.status})`);
        }

        const data = await response.json();
        setDesign(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load design');
        console.error('Error loading saved design:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDesign();
  }, [designId, mlDir]);

  return { design, loading, error };
}

/**
 * Convert saved design data to DYO format
 */
export function convertSavedDesignToDYO(savedDesign: SavedDesignData) {
  // Extract base product (headstone/plaque)
  const baseProduct = savedDesign.find(item => item.type === 'Headstone' || item.type === 'Plaque');
  
  const inscriptions = savedDesign
    .filter(item => item.type === 'Inscription' && item.label && item.label.trim())
    .map(item => ({
      text: item.label || '',
      fontFamily: item.font_family || 'Arial',
      fontSize: item.font_size || 50,
      color: item.color || '#000000',
      colorName: item.colorName,
      x: item.x || 0,
      y: item.y || 0,
      rotation: item.rotation || 0,
      part: item.part,
      side: item.side
    }));

  const photos = savedDesign
    .filter(item => item.type === 'Photo' || item.type === 'Picture')
    .map(item => ({
      x: item.x || 0,
      y: item.y || 0,
      width: item.width,
      height: item.height,
      rotation: item.rotation || 0
    }));

  const logos = savedDesign
    .filter(item => item.type === 'Logo' || item.type === 'Emblem')
    .map(item => ({
      x: item.x || 0,
      y: item.y || 0,
      width: item.width,
      height: item.height,
      rotation: item.rotation || 0
    }));

  return {
    product: {
      type: baseProduct?.type || 'Plaque',
      shape: baseProduct?.shape,
      color: baseProduct?.color,
      texture: baseProduct?.texture,
      width: baseProduct?.width,
      height: baseProduct?.height
    },
    inscriptions,
    photos,
    logos,
    rawData: savedDesign
  };
}
