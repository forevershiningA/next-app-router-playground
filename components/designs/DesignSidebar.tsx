'use client';

import { useState, useEffect } from 'react';
import { type SavedDesignMetadata, getDesignsByCategory, type DesignCategory } from '#/lib/saved-designs-data';
import Image from 'next/image';
import Link from 'next/link';

interface DesignSidebarProps {
  currentDesignId: string;
  category: DesignCategory;
  productSlug: string;
  maxItems?: number;
}

export default function DesignSidebar({ 
  currentDesignId, 
  category, 
  productSlug,
  maxItems = 15 
}: DesignSidebarProps) {
  const [designs, setDesigns] = useState<SavedDesignMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get all designs in this category
    const categoryDesigns = getDesignsByCategory(category);
    
    // Filter by product slug and exclude current design
    const filtered = categoryDesigns
      .filter(d => d.productSlug === productSlug && d.id !== currentDesignId)
      .slice(0, maxItems);
    
    setDesigns(filtered);
    setLoading(false);
  }, [category, productSlug, currentDesignId, maxItems]);

  // Format slug to readable text with dash separator after shape name
  const formatSlugToTitle = (slug: string) => {
    const words = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1));
    
    // List of known shape names
    const shapeNames = [
      'Cropped Peak',
      'Curved Gable', 
      'Curved Peak',
      'Curved Top',
      'Half Round',
      'Gable',
      'Left Wave',
      'Peak',
      'Right Wave',
      'Serpentine',
      'Square',
      'Rectangle'
    ];
    
    // Check if the slug starts with any known shape name
    for (const shapeName of shapeNames) {
      const shapeWords = shapeName.split(' ');
      const slugStart = words.slice(0, shapeWords.length).join(' ');
      
      if (slugStart === shapeName && words.length > shapeWords.length) {
        // Found a match - add dash separator
        const shapePartFormatted = shapeWords.join(' ');
        const restPart = words.slice(shapeWords.length).join(' ');
        return `${shapePartFormatted} - ${restPart}`;
      }
    }
    
    // No shape match found, return default formatting
    return words.join(' ');
  };

  const categoryTitle = formatSlugToTitle(category);

  if (loading) {
    return (
      <div className="hidden md:block fixed left-0 top-0 h-screen w-96 bg-white border-r border-slate-200 overflow-y-auto p-6">
        <div className="flex items-center justify-center h-32">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />
        </div>
      </div>
    );
  }

  if (designs.length === 0) {
    return null;
  }

  return (
    <div className="hidden md:block fixed left-0 top-0 h-screen w-96 bg-gradient-to-b from-slate-50 to-white border-r border-slate-200 overflow-y-auto shadow-xl">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-xl font-serif font-light text-slate-900 mb-2">
            More {categoryTitle} Designs
          </h2>
          <div className="w-16 h-px bg-slate-300" />
        </div>

        {/* Design List */}
        <div className="space-y-4">
          {designs.map((design) => {
            const designUrl = `/designs/${design.productSlug}/${design.category}/${design.slug}`;
            const displayText = formatSlugToTitle(design.slug);
            
            return (
              <Link
                key={design.id}
                href={designUrl}
                className="group block bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <Image
                    src={design.preview}
                    alt={displayText}
                    fill
                    sizes="384px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-light text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-2 leading-snug">
                    {displayText}
                  </h3>
                  
                  {/* Badges */}
                  {(design.hasMotifs || design.hasPhoto || design.hasAdditions) && (
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {design.hasMotifs && design.motifNames.length > 0 && (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-light border border-amber-200 rounded">
                          {design.motifNames[0]}
                        </span>
                      )}
                      {design.hasPhoto && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-light border border-emerald-200 rounded">
                          Photo
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All Link */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <Link
            href={`/designs/${productSlug}/${category}`}
            className="text-sm text-slate-600 hover:text-slate-900 font-light uppercase tracking-wider transition-colors flex items-center gap-2"
          >
            <span>View All {categoryTitle}</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
