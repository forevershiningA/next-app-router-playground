'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRightIcon, ArrowUpTrayIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { Shape } from '#/lib/db';
import { data } from '#/app/_internal/_data';
import type { ShapeData } from '#/lib/xml-parser';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const setShapeUrl = useHeadstoneStore((s) => s.setShapeUrl);
  const setWidthMm = useHeadstoneStore((s) => s.setWidthMm);
  const setHeightMm = useHeadstoneStore((s) => s.setHeightMm);
  const currentShapeUrl = useHeadstoneStore((s) => s.shapeUrl);
  const catalog = useHeadstoneStore((s) => s.catalog);
  const productId = useHeadstoneStore((s) => s.productId);
  
  // Check product type — use fallbackProduct.category as a safety net while
  // the catalog XML is still loading asynchronously.
  const fallbackProduct = data.products.find((p) => p.id === productId);
  const isPlaque = catalog?.product.type === 'plaque';
  const isUrn = catalog?.product.type === 'urn' || (catalog === null && fallbackProduct?.category === 'urns');
  const isFullColourPlaque = catalog?.product?.id === '32';
  const isStainlessSteelPlaque = productId === '52';
  const isStainlessSteelHeadstone =
    productId === '1' ||
    productId === '23' ||
    (catalog?.product?.type === 'headstone' &&
      catalog.product.name.toLowerCase().includes('stainless steel'));
  const hasBorder = catalog?.product?.border === '1';
  const productName = catalog?.product?.name ?? fallbackProduct?.name;

  const openPanel = (panel: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('openFullscreenPanel', {
          detail: { panel },
        }),
      );
    }
  };

  // Handle urn shape selection — applies fixed dimensions from catalog
  const handleUrnShapeSelect = (catalogShape: ShapeData) => {
    const svgPath = `/shapes/urns/${(catalogShape.code ?? catalogShape.name).toLowerCase()}.svg`;
    setShapeUrl(svgPath);
    setWidthMm(catalogShape.table.initWidth);
    setHeightMm(catalogShape.table.initHeight);
    router.push('/select-material');
    openPanel('select-material');
  };

  const handleShapeSelect = (shape: Shape) => {
    // Plaque shapes (ovals and circle) are in /shapes/masks/, others in /shapes/headstones/
    const plaqueShapes = ['oval_horizontal.svg', 'oval_vertical.svg', 'circle.svg'];
    const isPlaqueShape = plaqueShapes.includes(shape.image);
    const shapeUrl = isPlaqueShape 
      ? `/shapes/masks/${shape.image}` 
      : `/shapes/headstones/${shape.image}`;
    setShapeUrl(shapeUrl);
    if (isFullColourPlaque || isStainlessSteelPlaque) {
      router.push('/select-material');
      openPanel('select-material');
    } else if (isStainlessSteelHeadstone) {
      router.push('/select-size');
    } else if (hasBorder) {
      router.push('/select-border');
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
        setShapeUrl(svgDataUrl);
        if (isFullColourPlaque || isStainlessSteelPlaque) {
          router.push('/select-material');
          openPanel('select-material');
        } else if (isStainlessSteelHeadstone) {
          router.push('/select-size');
        } else if (hasBorder) {
          router.push('/select-border');
        } else {
          router.push('/select-size');
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a valid SVG file');
    }
  };

  // Urn shape grid — shapes come from catalog XML, not the static DB list
  if (isUrn) {
    const catalogShapes = catalog?.product.shapes ?? [];
    const isLoadingCatalog = catalog === null;
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 day:bg-stone-100 day:bg-none">
        {/* Header Section */}
        <div className="border-b border-white/10 bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm relative overflow-hidden day:border-gray-200 day:bg-white day:bg-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#cfac6c]/5 via-transparent to-transparent day:hidden" />
          <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8 relative">
            <div className="text-center">
              <h1 className="text-3xl font-serif font-light tracking-tight text-white sm:text-4xl lg:text-[2.75rem] day:text-gray-900">
                Select Your Shape
              </h1>
              {productName && (
                <p className="mt-3 text-sm font-medium uppercase tracking-[0.24em] text-[#cfac6c]">
                  {productName}
                </p>
              )}
              <p className="mt-3 text-base leading-6 text-gray-200 max-w-3xl mx-auto day:text-gray-600">
                Choose the shape for your urn. Each shape has its own dimensions and unique character.
              </p>
            </div>
          </div>
        </div>

        {/* Urn Shapes Grid */}
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          {isLoadingCatalog ? (
            <div className="py-20 text-center">
              <p className="text-gray-400 day:text-gray-500">Loading urn shapes…</p>
            </div>
          ) : catalogShapes.length === 0 ? (
            <div className="py-20 text-center">
              <h3 className="text-xl font-medium text-white day:text-gray-900">No shapes found</h3>
              <p className="mt-2 text-gray-400 day:text-gray-500">No urn shapes available in catalog</p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="text-sm font-medium text-gray-200 day:text-gray-700">
                  Showing {catalogShapes.length} shape{catalogShapes.length !== 1 ? 's' : ''}
                </div>
                <div className="hidden text-xs uppercase tracking-[0.16em] text-gray-500 day:text-gray-400 sm:block">
                  Select one to continue
                </div>
              </div>
              <div className="grid grid-cols-2 items-stretch gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {catalogShapes.map((catalogShape) => {
                  const svgPath = `/shapes/urns/${(catalogShape.code ?? catalogShape.name).toLowerCase()}.svg`;
                  const isSelected = currentShapeUrl === svgPath;
                  return (
                    <button
                      key={catalogShape.code ?? catalogShape.name}
                      onClick={() => handleUrnShapeSelect(catalogShape)}
                      aria-pressed={isSelected}
                      className={`group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border bg-[#171717] text-left transition-all day:bg-white ${
                        isSelected
                          ? 'border-[#cfac6c] shadow-lg shadow-[#cfac6c]/20'
                          : 'border-white/12 hover:border-[#cfac6c]/60 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#cfac6c]/10 day:border-gray-200 day:hover:border-[#cfac6c]/60'
                      }`}
                    >
                      <div className="relative aspect-square w-full overflow-hidden bg-[#101010] day:bg-gray-100">
                        <Image
                          src={svgPath}
                          alt={catalogShape.name}
                          fill
                          className="object-contain p-8 transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        />
                        {isSelected && (
                          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#cfac6c] px-2.5 py-1 text-xs font-semibold text-slate-950 shadow-lg">
                            <CheckCircleIcon className="h-4 w-4" />
                            Selected
                          </span>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-2.5 p-3.5">
                        <h3 className="min-h-10 text-base font-semibold leading-tight text-white text-center line-clamp-2 day:text-gray-900">
                          {catalogShape.name}
                        </h3>
                        <p className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-center text-xs text-gray-400 day:border-gray-200 day:bg-gray-50 day:text-gray-500">
                          {catalogShape.table.initWidth} × {catalogShape.table.initHeight} mm
                        </p>
                        <div className="mt-auto pt-1">
                          <span
                            className={`inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#cfac6c] px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                              isSelected
                                ? 'bg-[#cfac6c] text-slate-900 shadow-lg shadow-[#cfac6c]/30'
                                : 'bg-transparent text-[#cfac6c] group-hover:bg-[#cfac6c] group-hover:text-slate-900 group-hover:shadow-lg group-hover:shadow-[#cfac6c]/30'
                            }`}
                          >
                            <span>{isSelected ? 'Continue with this shape' : 'Select shape'}</span>
                            <ArrowRightIcon className="h-4 w-4" />
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
      </div>
    );
  }

  // Filter shapes based on product type
  // For full-colour plaques (product 32): ONLY landscape and portrait rectangles
  // For other plaques: landscape, portrait, ovals, circle
  // For headstones: EXCLUDE plaque shapes, show all others
  const uniqueShapes = shapes.reduce((acc, shape) => {
    const rectangleShapes = ['landscape.svg', 'portrait.svg'];
    const allPlaqueShapes = [...rectangleShapes, 'oval_horizontal.svg', 'oval_vertical.svg', 'circle.svg'];
    const isDuplicate = acc.some(s => s.image === shape.image);
    const isPlaqueShape = allPlaqueShapes.includes(shape.image);
    const isRectangleShape = rectangleShapes.includes(shape.image);
    
    let shouldInclude: boolean;
    if (isFullColourPlaque || isStainlessSteelPlaque) {
      shouldInclude = isRectangleShape;
    } else if (isPlaque) {
      shouldInclude = isPlaqueShape;
    } else {
      shouldInclude = !isPlaqueShape;
    }
    
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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 day:bg-stone-100 day:bg-none">
      {/* Header Section */}
      <div className="border-b border-white/10 bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm relative overflow-hidden day:border-gray-200 day:bg-white day:bg-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#cfac6c]/5 via-transparent to-transparent day:hidden" />
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-3xl font-serif font-light tracking-tight text-white sm:text-4xl lg:text-[2.75rem] day:text-gray-900">
              Select Your Shape
            </h1>
            {productName && (
              <p className="mt-3 text-sm font-medium uppercase tracking-[0.24em] text-[#cfac6c]">
                {productName}
              </p>
            )}
            <p className="mt-3 text-base leading-6 text-gray-200 max-w-3xl mx-auto day:text-gray-600">
              Choose the perfect shape for your memorial. Browse our collection of traditional and modern designs, or upload your own custom SVG shape.
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="border-b border-white/5 bg-gray-900/30 relative day:border-gray-200 day:bg-white">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#cfac6c]/3 to-transparent day:hidden" />
        <div className="mx-auto max-w-7xl px-6 py-3.5 lg:px-8 relative">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#cfac6c] text-slate-900 shadow-lg shadow-[#cfac6c]/20'
                  : 'border border-white/20 text-white hover:bg-white/10 hover:border-[#cfac6c]/30 day:border-gray-300 day:text-gray-700 day:hover:bg-gray-100'
              }`}
            >
              All Shapes
            </button>
            {shapeCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-[#cfac6c] text-slate-900 shadow-lg shadow-[#cfac6c]/20'
                    : 'border border-white/20 text-white hover:bg-white/10 hover:border-[#cfac6c]/30 day:border-gray-300 day:text-gray-700 day:hover:bg-gray-100'
                }`}
              >
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shapes Grid */}
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        {selectedCategory === 'custom' ? (
          /* Custom Upload Section */
          <div className="py-10">
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
                className="group relative w-full overflow-hidden rounded-lg border border-dashed border-white/20 bg-[#171717] p-10 text-center transition-all hover:-translate-y-0.5 hover:border-[#cfac6c]/60 hover:bg-white/[0.03] hover:shadow-lg hover:shadow-[#cfac6c]/10 day:bg-white day:border-gray-300 day:hover:bg-gray-50 day:hover:border-[#cfac6c]/60"
              >
                <div className="flex flex-col items-center gap-4">
                  <ArrowUpTrayIcon className="h-12 w-12 text-gray-500 transition-colors group-hover:text-[#cfac6c] day:text-gray-400" />
                  <div>
                    <h3 className="text-xl font-medium text-white mb-2 day:text-gray-900">Upload Custom SVG Shape</h3>
                    <p className="text-gray-400 day:text-gray-500">Click to browse or drag and drop your SVG file here</p>
                    <p className="text-sm text-gray-500 mt-2 day:text-gray-400">Accepted format: .svg</p>
                  </div>
                </div>
              </button>
              
              <div className="mt-6 rounded-lg bg-[#171717] border border-white/10 p-5 day:bg-gray-50 day:border-gray-200">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2 day:text-gray-900">
                  <InformationCircleIcon className="h-5 w-5 text-[#cfac6c]" />
                  SVG Requirements
                </h4>
                <ul className="text-sm text-gray-400 space-y-2 day:text-gray-600">
                  <li>File must be in SVG format</li>
                  <li>Recommended size: 400x600px or similar proportions</li>
                  <li>Use simple paths and shapes for best rendering</li>
                  <li>Avoid embedded images or complex filters</li>
                </ul>
              </div>
            </div>
          </div>
        ) : filteredShapes.length === 0 ? (
          <div className="py-20 text-center">
            <h3 className="text-xl font-medium text-white day:text-gray-900">No shapes found</h3>
            <p className="mt-2 text-gray-400 day:text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="text-sm font-medium text-gray-200 day:text-gray-700">
                Showing {filteredShapes.length} shape{filteredShapes.length !== 1 ? 's' : ''}
              </div>
              <div className="hidden text-xs uppercase tracking-[0.16em] text-gray-500 day:text-gray-400 sm:block">
                Select one to continue
              </div>
            </div>
            <div className="grid grid-cols-2 items-stretch gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
                    aria-pressed={isSelected}
                    className={`group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border bg-[#171717] text-left transition-all day:bg-white ${
                      isSelected
                        ? 'border-[#cfac6c] shadow-lg shadow-[#cfac6c]/20'
                        : 'border-white/12 hover:border-[#cfac6c]/60 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#cfac6c]/10 day:border-gray-200 day:hover:border-[#cfac6c]/60'
                    }`}
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-[#101010] day:bg-gray-100">
                      <Image
                        src={shapeUrl}
                        alt={shape.name}
                        fill
                        className="object-contain p-8 transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                      {isSelected && (
                        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#cfac6c] px-2.5 py-1 text-xs font-semibold text-slate-950 shadow-lg">
                          <CheckCircleIcon className="h-4 w-4" />
                          Selected
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-2.5 p-3.5">
                      <h3 className="min-h-10 text-base font-semibold leading-tight text-white text-center line-clamp-2 day:text-gray-900">
                        {shape.name}
                      </h3>
                      <div className="mt-auto pt-1">
                        <span
                          className={`inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#cfac6c] px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                            isSelected
                              ? 'bg-[#cfac6c] text-slate-900 shadow-lg shadow-[#cfac6c]/30'
                              : 'bg-transparent text-[#cfac6c] group-hover:bg-[#cfac6c] group-hover:text-slate-900 group-hover:shadow-lg group-hover:shadow-[#cfac6c]/30'
                          }`}
                        >
                          <span>{isSelected ? 'Continue with this shape' : 'Select shape'}</span>
                          <ArrowRightIcon className="h-4 w-4" />
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
        <div className="border-t border-white/5 bg-gray-900/30 day:border-gray-200 day:bg-stone-100">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
            {shapeCategories
              .filter((cat) => cat.id === selectedCategory)
              .map((category) => (
                <div
                  key={category.id}
                  className="rounded-lg border border-white/10 bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-8 text-center day:border-gray-200 day:bg-white"
                >
                  <h2 className="text-2xl font-serif font-light text-white mb-2 day:text-gray-900">
                    {category.name}
                  </h2>
                  <p className="text-gray-300 day:text-gray-600">{category.description}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
