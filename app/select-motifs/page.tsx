'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import MotifSelectionGrid from './_ui/MotifSelectionGrid';

type MotifCategory = {
  id: string;
  name: string;
  category: string;
  previewUrl: string;
  srcFolder: string;
  traditional?: boolean;
  ss?: boolean;
};

export default function Page() {
  const pathname = usePathname();
  const [isDesktop, setIsDesktop] = useState(false);
  const [categories, setCategories] = useState<MotifCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch categories from database
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/motifs/db');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Error fetching motif categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  // Only show the grid on mobile/tablet where the sidebar is hidden
  const showGrid = pathname === '/select-motifs' && !isDesktop;

  if (!showGrid) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-white text-lg">Loading categories...</div>
      </div>
    );
  }

  // Transform categories to match the expected format
  const motifs = categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    src: cat.srcFolder,
    img: cat.previewUrl,
    traditional: cat.traditional,
    ss: cat.ss,
  }));

  return (
    <Suspense fallback={null}>
      <MotifSelectionGrid 
        motifs={motifs}
      />
    </Suspense>
  );
}
