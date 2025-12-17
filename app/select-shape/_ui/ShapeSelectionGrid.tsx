'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { Shape } from '#/lib/db';

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

  // Check if user has already selected shape (canvas should be visible)
  // If shape is selected, the sidebar ShapeSelector will be shown instead
  const hasSelectedShape = !!currentShapeUrl;
  
  // Don't show the full grid when canvas is visible (shape already selected)
  if (hasSelectedShape) {
    return null;
  }

  const handleShapeSelect = (shape: Shape) => {
    const shapeUrl = `/shapes/headstones/${shape.image}`;
    setShapeUrl(shapeUrl);
    router.push('/select-size');
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
        router.push('/select-size');
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a valid SVG file');
    }
  };

  // Remove duplicates by image name and exclude plaque shapes
  const uniqueShapes = shapes.reduce((acc, shape) => {
    const excludedShapes = ['landscape.svg', 'portrait.svg', 'oval_horizontal.svg', 'oval_vertical.svg', 'circle.svg'];
    const isDuplicate = acc.some(s => s.image === shape.image);
    const isExcluded = excludedShapes.includes(shape.image);
    
    if (!isDuplicate && !isExcluded) {
      acc.push(shape);
    }
    return acc;
  }, [] as Shape[]);

  const filteredShapes = uniqueShapes.filter((shape) => {
    const matchesCategory = selectedCategory === 'all' || shape.category === selectedCategory;
    return matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header Section */}
      <div className="border-b border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-light tracking-tight text-white sm:text-5xl lg:text-6xl">
              Select Your Shape
            </h1>
            <p className="mt-4 text-lg text-gray-400">
              Choose the perfect shape for your memorial
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="border-b border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
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
                className="group relative w-full overflow-hidden rounded-2xl border-2 border-dashed border-gray-700 bg-gray-800 hover:bg-gray-700 p-12 text-center transition-all hover:border-gray-600"
              >
                <div className="flex flex-col items-center gap-4">
                  <svg
                    className="h-16 w-16 text-gray-500 group-hover:text-gray-300 transition-colors"
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
              
              <div className="mt-8 rounded-xl bg-gray-800 border border-gray-700 p-6">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                const shapeUrl = `/shapes/headstones/${shape.image}`;
                const isSelected = currentShapeUrl === shapeUrl;
                return (
                  <button
                    key={shape.id}
                    onClick={() => handleShapeSelect(shape)}
                    className="relative overflow-hidden cursor-pointer"
                  >
                  {/* Shape Image */}
                  <div className="relative aspect-square overflow-hidden mb-4 flex items-center justify-center p-4">
                    <Image
                      src={`/shapes/headstones/${shape.image}`}
                      alt={shape.name}
                      width={200}
                      height={200}
                      className={`object-contain ${
                        isSelected ? 'border-2 border-[#cfac6c]' : ''
                      }`}
                    />
                  </div>

                  {/* Shape Info */}
                  <div className="p-2 h-12 flex items-center justify-center">
                    <div className="text-sm text-slate-200 text-center line-clamp-2">
                      {shape.name}
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
      {selectedCategory !== 'all' && (
        <div className="border-t border-gray-800">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
            {shapeCategories
              .filter((cat) => cat.id === selectedCategory)
              .map((category) => (
                <div
                  key={category.id}
                  className="rounded-2xl border border-gray-700 bg-gray-800 p-8 text-center"
                >
                  <h2 className="text-2xl font-serif font-light text-white mb-2">
                    {category.name}
                  </h2>
                  <p className="text-gray-400">{category.description}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
