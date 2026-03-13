'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { Shape } from '#/lib/db';
import { data } from '#/app/_internal/_data';

type ShapeCategory = {
  id: string;
  name: string;
  description: string;
};

const shapeCategories: ShapeCategory[] = [
  {
    id: 'traditional',
    name: 'Traditional',
    description: 'Classic headstone shapes',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary designs',
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Upload your own SVG shape',
  },
];

export default function ShapeSelectionGrid({ shapes }: { shapes: Shape[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploadedSvg, setUploadedSvg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const setShapeUrl = useHeadstoneStore((s) => s.setShapeUrl);
  const currentShapeUrl = useHeadstoneStore((s) => s.shapeUrl);
  const catalog = useHeadstoneStore((s) => s.catalog);
  const productId = useHeadstoneStore((s) => s.productId);
  
  // Check if current product is a plaque
  const isPlaque = catalog?.product.type === 'plaque';
  const hasBorder = catalog?.product?.border === '1';
  const fallbackProduct = data.products.find((p) => p.id === productId);
  const productName = catalog?.product?.name ?? fallbackProduct?.name;

  const openBorderPanel = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('openFullscreenPanel', {
          detail: { panel: 'select-border' },
        }),
      );
    }
  };

  const handleShapeSelect = (shape: Shape) => {
    // Plaque shapes (ovals and circle) are in /shapes/masks/, others in /shapes/headstones/
    const plaqueShapes = ['oval_horizontal.svg', 'oval_vertical.svg', 'circle.svg'];
    const isPlaqueShape = plaqueShapes.includes(shape.image);
    const shapeUrl = isPlaqueShape 
      ? `/shapes/masks/${shape.image}` 
      : `/shapes/headstones/${shape.image}`;
    setShapeUrl(shapeUrl);
    if (hasBorder) {
      router.push('/select-border');
      openBorderPanel();
    } else {
      router.push('/select-size');
    }
  };

  const handleCustomUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const svgDataUrl = e.target?.result as string;
        setUploadedSvg(svgDataUrl);
        setShapeUrl(svgDataUrl);
        if (hasBorder) {
          router.push('/select-border');
          openBorderPanel();
        } else {
          router.push('/select-size');
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a valid SVG file');
    }
  };

  // Filter shapes based on product type
  // For plaques: ONLY show plaque shapes (landscape, portrait, ovals, circle)
  // For headstones: EXCLUDE plaque shapes, show all others
  const uniqueShapes = shapes.reduce((acc, shape) => {
    const plaqueShapes = ['landscape.svg', 'portrait.svg', 'oval_horizontal.svg', 'oval_vertical.svg', 'circle.svg'];
    const isDuplicate = acc.some(s => s.image === shape.image);
    const isPlaqueShape = plaqueShapes.includes(shape.image);
    
    // If this is a plaque product, ONLY include plaque shapes
    // If this is a headstone product, EXCLUDE plaque shapes
    const shouldInclude = isPlaque ? isPlaqueShape : !isPlaqueShape;
    
    if (!isDuplicate && shouldInclude) {
      acc.push(shape);
    }
    return acc;
  }, [] as Shape[]);

  const filteredShapes = uniqueShapes.filter((shape) => {
    const matchesCategory = selectedCategory === 'all' || shape.category === selectedCategory;
    return matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header Section */}
      <div className="border-b border-white/10 bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#cfac6c]/5 via-transparent to-transparent" />
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-light tracking-tight text-white sm:text-5xl lg:text-6xl">
              Select Your Shape
            </h1>
            {productName && (
              <p className="mt-3 text-base font-medium uppercase tracking-[0.3em] text-[#cfac6c]">
                {productName}
              </p>
            )}
            <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
              Choose the perfect shape for your memorial. Browse our collection of traditional and modern designs, or upload your own custom SVG shape.
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="border-b border-white/5 bg-gray-900/30 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#cfac6c]/3 to-transparent" />
        <div className="mx-auto max-w-7xl pl-6 pr-6 py-6 lg:pl-8 lg:pr-8 relative">
          <div className="flex flex-wrap gap-3 -ml-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`rounded-full px-6 py-3 text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#cfac6c] text-slate-900 shadow-lg shadow-[#cfac6c]/20'
                  : 'border border-white/20 text-white hover:bg-white/10 hover:border-[#cfac6c]/30'
              }`}
            >
              All Shapes
            </button>
            {shapeCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`rounded-full px-6 py-3 text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-[#cfac6c] text-slate-900 shadow-lg shadow-[#cfac6c]/20'
                    : 'border border-white/20 text-white hover:bg-white/10 hover:border-[#cfac6c]/30'
                }`}
              >
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shapes Grid */}
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {selectedCategory === 'custom' ? (
          /* Custom Upload Section */
          <div className="py-20">
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg,image/svg+xml"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="mx-auto max-w-2xl">
              <button
                onClick={handleCustomUpload}
                className="group relative w-full overflow-hidden rounded-2xl border-2 border-dashed border-white/20 bg-[#1A1A1A] hover:bg-gray-800/50 hover:border-[#cfac6c]/60 p-12 text-center transition-all"
              >
                <div className="flex flex-col items-center gap-4">
                  <svg
                    className="h-16 w-16 text-gray-500 group-hover:text-[#cfac6c] transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <div>
                    <h3 className="text-xl font-medium text-white mb-2">Upload Custom SVG Shape</h3>
                    <p className="text-gray-400">Click to browse or drag and drop your SVG file here</p>
                    <p className="text-sm text-gray-500 mt-2">Accepted format: .svg</p>
                  </div>
                </div>
              </button>
              
              <div className="mt-8 rounded-2xl bg-[#1A1A1A] border border-white/10 p-6">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <svg className="h-5 w-5 text-[#cfac6c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  SVG Requirements
                </h4>
                <ul className="text-sm text-gray-400 space-y-2">
                  <li>• File must be in SVG format</li>
                  <li>• Recommended size: 400x600px or similar proportions</li>
                  <li>• Use simple paths and shapes for best rendering</li>
                  <li>• Avoid embedded images or complex filters</li>
                </ul>
              </div>
            </div>
          </div>
        ) : filteredShapes.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-white">No shapes found</h3>
            <p className="mt-2 text-gray-400">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-sm text-gray-400">
              Showing {filteredShapes.length} shape{filteredShapes.length !== 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredShapes.map((shape) => {
                // Plaque shapes (ovals and circle) are in /shapes/masks/, others in /shapes/headstones/
                const plaqueShapes = ['oval_horizontal.svg', 'oval_vertical.svg', 'circle.svg'];
                const isPlaqueShape = plaqueShapes.includes(shape.image);
                const shapeUrl = isPlaqueShape 
                  ? `/shapes/masks/${shape.image}` 
                  : `/shapes/headstones/${shape.image}`;
                const isSelected = currentShapeUrl === shapeUrl;
                return (
                  <button
                    key={shape.id}
                    onClick={() => handleShapeSelect(shape)}
                    className={`group relative overflow-hidden cursor-pointer rounded-2xl border-2 bg-[#1A1A1A] transition-all ${
                      isSelected
                        ? 'border-[#cfac6c] shadow-lg shadow-[#cfac6c]/20'
                        : 'border-white/10 hover:border-[#cfac6c]/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#cfac6c]/10'
                    }`}
                  >
                    {/* Shape Image - Square aspect ratio */}
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-800/30 to-gray-900/30">
                      <div className="absolute inset-0 flex items-center justify-center p-8">
                        <Image
                          src={shapeUrl}
                          alt={shape.name}
                          width={200}
                          height={200}
                          className="object-contain transition-transform group-hover:scale-105"
                        />
                      </div>
                    </div>

                    {/* Shape Info - with padding and flexbox */}
                    <div className="p-4 flex flex-col">
                      <h3 className="text-sm font-medium text-white text-center line-clamp-2 mb-2">
                        {shape.name}
                      </h3>
                      {/* Call to Action - always reserves space, visible on hover, anchored to bottom */}
                      <div className="h-5 mt-auto">
                        <span className="text-sm font-semibold text-[#cfac6c] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          Select →
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Category Info Cards (when category is selected) */}
      {selectedCategory !== 'all' && selectedCategory !== 'custom' && (
        <div className="border-t border-white/5 bg-gray-900/30">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
            {shapeCategories
              .filter((cat) => cat.id === selectedCategory)
              .map((category) => (
                <div
                  key={category.id}
                  className="rounded-2xl border border-white/10 bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-8 text-center"
                >
                  <h2 className="text-2xl font-serif font-light text-white mb-2">
                    {category.name}
                  </h2>
                  <p className="text-gray-300">{category.description}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
