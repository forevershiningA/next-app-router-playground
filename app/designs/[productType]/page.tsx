'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAllDesigns, type SavedDesignMetadata } from '#/lib/saved-designs-data';
import Image from 'next/image';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

export default function ProductTypePage() {
  const params = useParams();
  const router = useRouter();
  const productSlug = params.productType as string;
  
  const [designs, setDesigns] = useState<SavedDesignMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get all designs and filter by product slug
    const allDesigns = getAllDesigns();
    const filtered = allDesigns.filter(d => d.productSlug === productSlug);
    setDesigns(filtered);
    setLoading(false);
  }, [productSlug]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center min-h-screen ml-[400px]">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800 mx-auto mb-4" />
          <p className="text-slate-600 font-light">Loading designs...</p>
        </div>
      </div>
    );
  }

  const productName = productSlug
    ? productSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Product';

  // Group designs by category and get first design from each
  const designsByCategory = designs.reduce((acc, design) => {
    if (!acc[design.category]) {
      acc[design.category] = design; // Store only the first design
    }
    return acc;
  }, {} as Record<string, SavedDesignMetadata>);

  const categoryDesigns = Object.values(designsByCategory);

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-y-auto min-h-screen ml-[400px]">
      <div className="container mx-auto px-8 py-12 max-w-7xl">
        {/* Elegant Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-12">
          <a href="/" className="hover:text-slate-900 transition-colors font-light tracking-wide">Home</a>
          <ChevronRightIcon className="w-4 h-4" />
          <a href="/designs" className="hover:text-slate-900 transition-colors font-light tracking-wide">Memorial Designs</a>
          <ChevronRightIcon className="w-4 h-4" />
          <span className="text-slate-900 font-medium tracking-wide">{productName}</span>
        </nav>

        {/* Sophisticated Header */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-serif font-light text-slate-900 mb-4 tracking-tight">
            {productName}
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-slate-400 to-transparent mx-auto mb-6" />
          <p className="text-xl text-slate-600 font-light max-w-2xl mx-auto leading-relaxed">
            Explore our curated collection of {categoryDesigns.length} thoughtfully designed categories
          </p>
        </div>

        {/* Category grid */}
        {categoryDesigns.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-600 text-lg font-light mb-6">No designs found for this product type.</p>
            <a 
              href="/designs" 
              className="inline-flex items-center text-slate-800 font-light tracking-wide hover:text-slate-900 transition-colors uppercase text-sm"
            >
              Browse all designs
              <ChevronRightIcon className="w-4 h-4 ml-2" />
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categoryDesigns.map((design) => {
              const categoryTitle = design.category
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

              return (
                <a
                  key={design.category}
                  href={`/designs/${design.productSlug}/${design.category}`}
                  className="group bg-white rounded-lg shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 hover:border-slate-300"
                >
                  <div className="aspect-square relative bg-slate-100 overflow-hidden">
                    <Image
                      src={design.preview}
                      alt={categoryTitle}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Subtle overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif font-light text-xl text-slate-900 group-hover:text-slate-700 transition-colors mb-2">
                      {categoryTitle}
                    </h3>
                    <div className="flex items-center text-slate-600 font-light text-sm uppercase tracking-wider group-hover:translate-x-1 transition-transform duration-300">
                      <span>View Designs</span>
                      <ChevronRightIcon className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
