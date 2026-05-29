'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { Product } from '#/lib/db';
import type { ProductPriceRange } from '#/lib/types/pricing';

type ProductCategory = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

const priceFormatterCache = new Map<string, Intl.NumberFormat>();

function formatPrice(value: number, currency: string) {
  if (!Number.isFinite(value)) {
    return '—';
  }

  const cacheKey = currency || 'AUD';
  let formatter = priceFormatterCache.get(cacheKey);
  if (!formatter) {
    try {
      formatter = new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: cacheKey || 'AUD',
        maximumFractionDigits: 0,
      });
    } catch {
      formatter = new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
        maximumFractionDigits: 0,
      });
    }
    priceFormatterCache.set(cacheKey, formatter);
  }

  return formatter.format(Math.max(0, Math.round(value)));
}

const productCategories: ProductCategory[] = [
  {
    id: 'headstones',
    name: 'Headstones',
    description: 'Traditional upright memorial markers',
    icon: '',
  },
  {
    id: 'plaques',
    name: 'Plaques',
    description: 'Flat memorial markers and wall plaques',
    icon: '',
  },
  {
    id: 'monuments',
    name: 'Full Monuments',
    description: 'Complete memorial structures',
    icon: '',
  },
  {
    id: 'urns',
    name: 'Urns',
    description: 'Memorial urns and cremation vessels',
    icon: '',
  },
];

type ProductGridProps = {
  products: Product[];
  priceMap: Record<string, ProductPriceRange | undefined>;
  descriptionMap: Record<string, string | undefined>;
};

export default function ProductSelectionGrid({ products, priceMap, descriptionMap }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const router = useRouter();
  const setProductId = useHeadstoneStore((s) => s.setProductId);
  const currentProductId = useHeadstoneStore((s) => s.productId);

  const handleProductSelect = (product: Product) => {
    setProductId(product.id);
    router.push('/select-shape');
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 day:bg-stone-100 day:bg-none">
      {/* Header Section */}
      <div className="border-b border-white/10 bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm relative overflow-hidden day:border-gray-200 day:bg-white day:bg-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#cfac6c]/5 via-transparent to-transparent day:hidden" />
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-light tracking-tight text-white sm:text-5xl lg:text-6xl day:text-gray-900">
              Select Your Memorial Product
            </h1>
            <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto day:text-gray-600">
              Choose from our range of memorial products including headstones, plaques, urns and full monuments. Each product is crafted with care and precision. Browse our exemplar designs for inspiration, and view transparent pricing at every step.
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="border-b border-white/5 bg-gray-900/30 relative day:border-gray-200 day:bg-white">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#cfac6c]/3 to-transparent day:hidden" />
        <div className="mx-auto max-w-7xl pl-6 pr-6 py-6 lg:pl-8 lg:pr-8 relative">
          <div className="flex flex-wrap gap-3 -ml-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`rounded-full px-6 py-3 text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#cfac6c] text-slate-900 shadow-lg shadow-[#cfac6c]/20'
                  : 'border border-white/20 text-white hover:bg-white/10 hover:border-[#cfac6c]/30 day:border-gray-300 day:text-gray-700 day:hover:bg-gray-100'
              }`}
            >
              All Products
            </button>
            {productCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`rounded-full px-6 py-3 text-sm font-medium transition-all ${
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

      {/* Products Grid */}
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-white day:text-gray-900">No products found</h3>
            <p className="mt-2 text-gray-400 day:text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-sm text-gray-400 day:text-gray-500">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => {
                const isSelected = currentProductId === product.id;
                const priceRange = priceMap[product.id];
                const description = descriptionMap[product.id] ?? 'Fully customizable memorial with premium materials and finishes.';
                return (
                  <button
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className={`group relative overflow-hidden cursor-pointer rounded-2xl border-2 bg-[#1A1A1A] transition-all day:bg-white ${
                      isSelected
                        ? 'border-[#cfac6c] shadow-lg shadow-[#cfac6c]/20'
                        : 'border-white/10 hover:border-[#cfac6c]/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#cfac6c]/10 day:border-gray-200 day:hover:border-[#cfac6c]/60'
                    }`}
                  >
                  {/* Product Image - Full width, touching top and sides */}
                  <div className="relative h-64 overflow-hidden cursor-pointer">
                    <Image
                      src={`/webp/products/${product.image}`}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105 cursor-pointer"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>

                  {/* Product Info - with padding and flexbox */}
                  <div className="p-4 flex flex-col gap-3 h-full">
                    <h3 className="text-base font-medium text-white line-clamp-2 day:text-gray-900">
                      {product.name}
                    </h3>

                    <p className="text-sm text-gray-300 line-clamp-2 min-h-[3.5rem] day:text-gray-600">
                      {description}
                    </p>

                    {priceRange ? (
                      <div className="space-y-0.5 text-left">
                        <p className="text-xs uppercase tracking-wide text-gray-500 day:text-gray-400">
                          Starting at
                        </p>
                        <p className="text-lg font-semibold text-white day:text-gray-900">
                          {formatPrice(priceRange.minPrice, priceRange.currency)}
                        </p>
                        <p className="text-xs text-gray-500 day:text-gray-400">
                          Max size up to {formatPrice(priceRange.maxPrice, priceRange.currency)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 day:text-gray-500">
                        Configure options to view pricing
                      </p>
                    )}

                    <div className="mt-auto">
                      <span
                        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#cfac6c] px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                          isSelected
                            ? 'bg-[#cfac6c] text-slate-900 shadow-lg shadow-[#cfac6c]/30'
                            : 'text-[#cfac6c] bg-transparent group-hover:bg-[#cfac6c] group-hover:text-slate-900 group-hover:shadow-lg group-hover:shadow-[#cfac6c]/30'
                        }`}
                      >
                        <span>Customize this design</span>
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14" />
                          <path d="M12 5l7 7-7 7" />
                        </svg>
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
      {selectedCategory !== 'all' && (
        <div className="border-t border-white/5 bg-gray-900/30 day:border-gray-200 day:bg-stone-100">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
            {productCategories
              .filter((cat) => cat.id === selectedCategory)
              .map((category) => (
                <div
                  key={category.id}
                  className="rounded-2xl border border-white/10 bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-8 text-center day:border-gray-200 day:bg-white"
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
