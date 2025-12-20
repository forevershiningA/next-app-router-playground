'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getDesignsByCategory, type SavedDesignMetadata } from '#/lib/saved-designs-data';
import Image from 'next/image';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import MobileNavToggle from '#/components/MobileNavToggle';
import DesignsTreeNav from '#/components/DesignsTreeNav';

/**
 * Format slug for display - convert kebab-case to Title Case
 * e.g., "your-life-was-a-blessing-your-memory-a-treasure" → "Your Life Was a Blessing Your Memory a Treasure"
 */
function formatSlugForDisplay(slug: string): string {
  if (!slug) return 'Memorial Design';
  
  return slug
    .split('-')
    .map((word, index) => {
      // Don't capitalize very short words (articles, prepositions) unless they're the first word
      if (word.length <= 2 && index > 0) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Format shape name for display - convert snake_case or lowercase to Title Case
 */
function formatShapeName(shapeName: string): string {
  return shapeName
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format design title with shape name separated by dash
 * e.g., "curved-gable-gods-garden" → "Curved Gable - Gods Garden"
 */
function formatDesignTitle(design: SavedDesignMetadata): string {
  const slug = design.slug;
  const shapeName = design.shapeName;
  
  if (!shapeName) {
    return formatSlugForDisplay(slug);
  }
  
  // Find known shape names in the slug
  // Convert shape name to match slug format (lowercase with dashes instead of spaces/underscores)
  const shapeWords = shapeName.toLowerCase().replace(/[\s_]+/g, '-').split('-');
  const slugWords = slug.split('-');
  
  // Check if slug starts with the shape name
  let shapeEndIndex = 0;
  let matchFound = true;
  
  for (let i = 0; i < shapeWords.length; i++) {
    if (slugWords[i] !== shapeWords[i]) {
      matchFound = false;
      break;
    }
    shapeEndIndex = i + 1;
  }
  
  if (matchFound && shapeEndIndex > 0) {
    // Extract the part after shape name
    const remainingWords = slugWords.slice(shapeEndIndex);
    const shapePart = formatShapeName(shapeName);
    const restPart = remainingWords
      .map((word, index) => {
        if (word.length <= 2 && index > 0) {
          return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
    
    return restPart ? `${shapePart} - ${restPart}` : shapePart;
  }
  
  // If shape name not found in slug, just format the slug
  return formatSlugForDisplay(slug);
}

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const productSlug = params.productType as string;
  const category = params.category as string;
  
  const [designs, setDesigns] = useState<SavedDesignMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get designs for this category
    const categoryDesigns = getDesignsByCategory(category as any);
    // Filter by product slug and sort alphabetically by formatted title
    const filtered = categoryDesigns
      .filter(d => d.productSlug === productSlug)
      .sort((a, b) => formatDesignTitle(a).localeCompare(formatDesignTitle(b)));
    setDesigns(filtered);
    setLoading(false);
  }, [category, productSlug]);

  if (loading) {
    return (
      <>
        <MobileNavToggle>
          <DesignsTreeNav />
        </MobileNavToggle>
        <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center min-h-screen md:ml-[400px]">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800 mx-auto mb-4" />
          <p className="text-slate-600 font-light">Loading designs...</p>
        </div>
      </div>
      </>
    );
  }

  const categoryTitle = category
    ? category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Category';

  const productName = productSlug
    ? productSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Product';

  // Get a few example phrases from designs for the subtitle
  const examplePhrases = designs
    .slice(0, 3)
    .map(d => formatSlugForDisplay(d.slug))
    .join(' • ');

  return (
    <>
      <MobileNavToggle>
        <DesignsTreeNav />
      </MobileNavToggle>
      
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-y-auto min-h-screen md:ml-[400px]">
      <div className="container mx-auto px-8 py-12 max-w-7xl">
        {/* Elegant Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-12">
          <a href="/designs" className="hover:text-slate-900 transition-colors font-light tracking-wide">Memorial Designs</a>
          <ChevronRightIcon className="w-4 h-4" />
          <a href={`/designs/${productSlug}`} className="hover:text-slate-900 transition-colors font-light tracking-wide">{productName}</a>
          <ChevronRightIcon className="w-4 h-4" />
          <span className="text-slate-900 font-medium tracking-wide">{categoryTitle}</span>
        </nav>

        {/* Sophisticated Header */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-serif font-light text-slate-900 mb-4 tracking-tight">
            {categoryTitle}
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-slate-400 to-transparent mx-auto mb-6" />
          {examplePhrases && (
            <h2 className="text-2xl text-slate-700 font-light mb-4 italic max-w-4xl mx-auto leading-relaxed">
              {examplePhrases}
            </h2>
          )}
          <p className="text-xl text-slate-600 font-light max-w-2xl mx-auto leading-relaxed">
            {designs.length} thoughtfully crafted memorial design{designs.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Designs Grid */}
        {designs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-600 text-lg font-light mb-6">No designs found in this category.</p>
            <button
              onClick={() => router.push('/designs')}
              className="inline-flex items-center text-slate-800 font-light tracking-wide hover:text-slate-900 transition-colors uppercase text-sm"
            >
              Browse All Designs
              <ChevronRightIcon className="w-4 h-4 ml-2" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {designs.map((design) => (
              <div
                key={design.id}
                onClick={() => {
                  const designUrl = `/designs/${design.productSlug}/${design.category}/${design.slug}`;
                  router.push(designUrl);
                }}
                className="group bg-white rounded-lg border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                {/* Preview Image */}
                <div className="relative h-80 bg-slate-100 overflow-hidden">
                  <Image
                    src={design.preview}
                    alt={formatDesignTitle(design)}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500 blur-[8px]"
                  />
                  {/* Privacy overlay with message */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-lg shadow-lg">
                      <p className="text-slate-700 text-sm font-light text-center">
                        Preview blurred for privacy
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <h3 className="font-serif font-light text-xl text-slate-900 mb-3 group-hover:text-slate-700 transition-colors">
                    {formatDesignTitle(design)}
                  </h3>
                  
                  {/* Elegant badges */}
                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    {design.hasPhoto && (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-light uppercase tracking-wider border border-emerald-200">
                        Photo
                      </span>
                    )}
                    {design.hasMotifs && (
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-light uppercase tracking-wider border border-amber-200">
                        {design.motifNames.length} Motif{design.motifNames.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {design.hasAdditions && (
                      <span className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-light uppercase tracking-wider border border-orange-200">
                        Additions
                      </span>
                    )}
                  </div>

                  {design.motifNames.length > 0 && (
                    <p className="text-sm text-slate-500 font-light line-clamp-2 mb-4">
                      {design.motifNames.slice(0, 2).join(', ')}
                      {design.motifNames.length > 2 && '...'}
                    </p>
                  )}

                  <div className="flex items-center text-slate-700 font-light text-sm uppercase tracking-wider group-hover:translate-x-1 transition-transform duration-300">
                    <span>View Design</span>
                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
