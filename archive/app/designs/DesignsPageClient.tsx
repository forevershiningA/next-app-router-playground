'use client';

import { useEffect, useState } from 'react';
import { SAVED_DESIGNS, type SavedDesignMetadata } from '#/lib/saved-designs-data';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import MobileNavToggle from '#/components/MobileNavToggle';
import DesignsTreeNav from '#/components/DesignsTreeNav';

export default function DesignsPageClient() {
  const [groupedDesigns, setGroupedDesigns] = useState<Record<string, SavedDesignMetadata[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const allDesigns = Object.values(SAVED_DESIGNS);
    
    // Group by product type
    const grouped = allDesigns.reduce((acc, design) => {
      const type = design.productSlug;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(design);
      return acc;
    }, {} as Record<string, SavedDesignMetadata[]>);
    
    setGroupedDesigns(grouped);
    setLoading(false);
  }, []);

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

  const totalDesigns = Object.values(groupedDesigns).reduce((sum, designs) => sum + designs.length, 0);

  return (
    <>
      <MobileNavToggle>
        <DesignsTreeNav />
      </MobileNavToggle>
      
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-y-auto md:ml-[400px] min-h-screen">
      <div className="container mx-auto px-8 py-12 max-w-7xl">
        {/* Elegant Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-12">
          <a href="/" className="hover:text-slate-900 transition-colors font-light tracking-wide">Home</a>
          <ChevronRightIcon className="w-4 h-4" />
          <span className="text-slate-900 font-medium tracking-wide">Memorial Designs</span>
        </nav>

        {/* Sophisticated Header */}
        <div className="mb-16 text-center">
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

        {/* Elegant Product Type Categories Grid */}
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
                {/* Subtle gradient overlay on hover */}
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
      </div>
    </div>
    </>
  );
}
