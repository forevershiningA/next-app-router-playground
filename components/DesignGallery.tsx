'use client';

import { useState } from 'react';
import { type SavedDesignMetadata } from '#/lib/saved-designs-data';
import Image from 'next/image';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

interface DesignGalleryProps {
  designs: SavedDesignMetadata[];
}

export default function DesignGallery({ designs }: DesignGalleryProps) {
  // Group designs by product type
  const designsByProduct = designs.reduce((acc, design) => {
    if (!acc[design.productSlug]) {
      acc[design.productSlug] = [];
    }
    acc[design.productSlug].push(design);
    return acc;
  }, {} as Record<string, SavedDesignMetadata[]>);

  const productTypes = Object.keys(designsByProduct).sort();

  return (
    <div className="space-y-12">
      {productTypes.map(productSlug => {
        const productDesigns = designsByProduct[productSlug];
        const productTitle = productSlug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        // Group by category within this product type
        const designsByCategory = productDesigns.reduce((acc, design) => {
          if (!acc[design.category]) {
            acc[design.category] = [];
          }
          acc[design.category].push(design);
          return acc;
        }, {} as Record<string, SavedDesignMetadata[]>);

        const categories = Object.keys(designsByCategory).sort();

        return (
          <div key={productSlug} className="space-y-8">
            {/* Product Type Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{productTitle}</h2>
              <a
                href={`/designs/${productSlug}`}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                View all
                <ChevronRightIcon className="w-4 h-4" />
              </a>
            </div>

            {/* Categories within this product type */}
            <div className="space-y-8">
              {categories.slice(0, 3).map(category => {
                const categoryDesigns = designsByCategory[category];
                const categoryTitle = category
                  .split('-')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');

                return (
                  <div key={category}>
                    {/* Category header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">{categoryTitle}</h3>
                      <a
                        href={`/designs/${productSlug}/${category}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                      >
                        View all
                        <ChevronRightIcon className="w-4 h-4" />
                      </a>
                    </div>

                    {/* Grid of designs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {categoryDesigns.slice(0, 4).map((design) => (
                        <a
                          key={design.id}
                          href={`/designs/${design.productSlug}/${design.category}/${design.id}_${design.slug}`}
                          className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200"
                        >
                          <div className="aspect-square relative bg-gray-100">
                            <Image
                              src={design.preview}
                              alt={design.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="p-4">
                            <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                              {design.title}
                            </h4>
                            {design.motifNames && design.motifNames.length > 0 && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {design.motifNames.join(', ')}
                              </p>
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
