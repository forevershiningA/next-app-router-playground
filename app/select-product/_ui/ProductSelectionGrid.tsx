'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
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
    id: 'plaques',
    name: 'Plaques',
    description: 'Flat memorial markers and wall plaques',
    icon: '',
  },
  {
    id: 'headstones',
    name: 'Headstones',
    description: 'Traditional upright memorial markers',
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

const productGroups: ProductCategory[] = [
  ...productCategories.filter((category) => category.id === 'plaques'),
  ...productCategories.filter((category) => category.id === 'headstones'),
  {
    id: 'other',
    name: 'Other Products',
    description: 'Additional memorial products and accessories',
    icon: '',
  },
];

type ProductGridProps = {
  products: Product[];
  priceMap: Record<string, ProductPriceRange | undefined>;
  descriptionMap: Record<string, string | undefined>;
};

export default function ProductSelectionGrid({
  products,
  priceMap,
  descriptionMap,
}: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const router = useRouter();
  const setProductId = useHeadstoneStore((s) => s.setProductId);
  const currentProductId = useHeadstoneStore((s) => s.productId);

  const handleProductSelect = async (product: Product) => {
    await setProductId(product.id);
    router.push('/select-shape');
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;
    return matchesCategory;
  });

  const groupedProducts = productGroups
    .map((group) => {
      const groupProducts = filteredProducts.filter((product) => {
        if (group.id === 'other') {
          return (
            product.category !== 'plaques' && product.category !== 'headstones'
          );
        }

        return product.category === group.id;
      });

      return { ...group, products: groupProducts };
    })
    .filter((group) => group.products.length > 0);

  return (
    <div className="day:bg-stone-100 day:bg-none min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header Section */}
      <div className="day:border-gray-200 day:bg-white day:bg-none relative overflow-hidden border-b border-white/10 bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm">
        <div className="day:hidden absolute inset-0 bg-gradient-to-br from-[#cfac6c]/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <div className="text-center">
            <h1 className="day:text-gray-900 font-serif text-3xl font-light tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
              Select Your Memorial Product
            </h1>
            <p className="day:text-gray-600 mx-auto mt-3 max-w-3xl text-base leading-6 text-gray-200">
              Choose from our range of memorial products including headstones,
              plaques, urns and full monuments. Each product is crafted with
              care and precision. Browse our exemplar designs for inspiration,
              and view transparent pricing at every step.
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="day:border-gray-200 day:bg-white relative border-b border-white/5 bg-gray-900/30">
        <div className="day:hidden absolute inset-0 bg-gradient-to-r from-transparent via-[#cfac6c]/3 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 py-3.5 lg:px-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#cfac6c] text-slate-900 shadow-lg shadow-[#cfac6c]/20'
                  : 'day:border-gray-300 day:text-gray-700 day:hover:bg-gray-100 border border-white/20 text-white hover:border-[#cfac6c]/30 hover:bg-white/10'
              }`}
            >
              All Products
            </button>
            {productCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-[#cfac6c] text-slate-900 shadow-lg shadow-[#cfac6c]/20'
                    : 'day:border-gray-300 day:text-gray-700 day:hover:bg-gray-100 border border-white/20 text-white hover:border-[#cfac6c]/30 hover:bg-white/10'
                }`}
              >
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center">
            <h3 className="day:text-gray-900 text-xl font-medium text-white">
              No products found
            </h3>
            <p className="day:text-gray-500 mt-2 text-gray-400">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="day:text-gray-700 text-sm font-medium text-gray-200">
                Showing {filteredProducts.length} product
                {filteredProducts.length !== 1 ? 's' : ''}
              </div>
              <div className="day:text-gray-400 hidden text-xs tracking-[0.16em] text-gray-500 uppercase sm:block">
                Select one to continue
              </div>
            </div>
            <div className="space-y-8">
              {groupedProducts.map((group) => (
                <section
                  key={group.id}
                  aria-labelledby={`product-group-${group.id}`}
                >
                  <div className="day:border-gray-200 mb-3 flex items-end justify-between gap-4 border-b border-white/10 pb-2">
                    <div>
                      <h2
                        id={`product-group-${group.id}`}
                        className="day:text-gray-900 text-lg font-semibold text-white"
                      >
                        {group.name}
                      </h2>
                      <p className="day:text-gray-500 mt-0.5 text-sm text-gray-400">
                        {group.description}
                      </p>
                    </div>
                    <span className="day:text-gray-400 text-xs font-medium tracking-[0.14em] text-gray-500 uppercase">
                      {group.products.length} item
                      {group.products.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {group.products.map((product) => {
                      const isSelected = currentProductId === product.id;
                      const priceRange = priceMap[product.id];
                      const description =
                        descriptionMap[product.id] ??
                        'Fully customizable memorial with premium materials and finishes.';
                      return (
                        <button
                          key={product.id}
                          onClick={() => handleProductSelect(product)}
                          aria-pressed={isSelected}
                          className={`group day:bg-white relative flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border bg-[#171717] text-left transition-all ${
                            isSelected
                              ? 'border-[#cfac6c] shadow-lg shadow-[#cfac6c]/20'
                              : 'day:border-gray-200 day:hover:border-[#cfac6c]/60 border-white/12 hover:-translate-y-0.5 hover:border-[#cfac6c]/60 hover:shadow-lg hover:shadow-[#cfac6c]/10'
                          }`}
                        >
                          <div className="relative aspect-square w-full overflow-hidden bg-[#101010]">
                            <Image
                              src={`/webp/products/${product.image}`}
                              alt={product.name}
                              fill
                              className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                            />
                            {isSelected && (
                              <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-[#cfac6c] px-2.5 py-1 text-xs font-semibold text-slate-950 shadow-lg">
                                <CheckCircleIcon className="h-4 w-4" />
                                Selected
                              </span>
                            )}
                          </div>

                          <div className="flex flex-1 flex-col gap-2.5 p-3.5">
                            <h3 className="day:text-gray-900 line-clamp-2 min-h-[2.5rem] text-base leading-tight font-semibold text-white">
                              {product.name}
                            </h3>

                            <p className="day:text-gray-600 line-clamp-2 min-h-10 text-sm leading-5 text-gray-300">
                              {description}
                            </p>

                            {priceRange ? (
                              <div className="day:border-gray-200 day:bg-gray-50 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2">
                                <p className="day:text-gray-500 text-[11px] font-medium tracking-[0.14em] text-gray-400 uppercase">
                                  Starting at
                                </p>
                                <p className="day:text-gray-900 mt-0.5 text-lg font-semibold text-white">
                                  {formatPrice(
                                    priceRange.minPrice,
                                    priceRange.currency,
                                  )}
                                </p>
                                <p className="day:text-gray-500 mt-0.5 text-xs text-gray-400">
                                  Max size up to{' '}
                                  {formatPrice(
                                    priceRange.maxPrice,
                                    priceRange.currency,
                                  )}
                                </p>
                              </div>
                            ) : (
                              <p className="day:border-gray-200 day:bg-gray-50 day:text-gray-600 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-gray-300">
                                Configure options to view pricing
                              </p>
                            )}

                            <div className="mt-auto pt-1">
                              <span
                                className={`inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#cfac6c] px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                                  isSelected
                                    ? 'bg-[#cfac6c] text-slate-900 shadow-lg shadow-[#cfac6c]/30'
                                    : 'bg-transparent text-[#cfac6c] group-hover:bg-[#cfac6c] group-hover:text-slate-900 group-hover:shadow-lg group-hover:shadow-[#cfac6c]/30'
                                }`}
                              >
                                <span>
                                  {isSelected
                                    ? 'Continue with this product'
                                    : 'Select product'}
                                </span>
                                <ArrowRightIcon className="h-4 w-4" />
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Category Info Cards (when category is selected) */}
      {selectedCategory !== 'all' && (
        <div className="day:border-gray-200 day:bg-stone-100 border-t border-white/5 bg-gray-900/30">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
            {productCategories
              .filter((cat) => cat.id === selectedCategory)
              .map((category) => (
                <div
                  key={category.id}
                  className="day:border-gray-200 day:bg-white rounded-2xl border border-white/10 bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-8 text-center"
                >
                  <h2 className="day:text-gray-900 mb-2 font-serif text-2xl font-light text-white">
                    {category.name}
                  </h2>
                  <p className="day:text-gray-600 text-gray-300">
                    {category.description}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
