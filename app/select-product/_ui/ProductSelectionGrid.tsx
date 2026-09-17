'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { Product } from '#/lib/db';
import type { ProductPriceSample } from '#/lib/types/pricing';
import { getDesignerProductSlug } from '#/lib/designer-product-routes';
import { orderProductsForDisplay } from '#/lib/product-display-order';
import { formatDimensionPair } from '#/lib/unit-system';
import { useSetUnitSystem, useUnitSystem } from '#/lib/use-unit-system';

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
  {
    id: 'pet-memorials',
    name: 'Pet Memorials',
    description: 'Pet headstones, plaques and rocks',
    icon: '',
  },
];

const productGroups: ProductCategory[] = [
  ...productCategories.filter((category) => category.id === 'plaques'),
  ...productCategories.filter((category) => category.id === 'headstones'),
  ...productCategories.filter((category) => category.id === 'monuments'),
  ...productCategories.filter((category) => category.id === 'urns'),
  ...productCategories.filter((category) => category.id === 'pet-memorials'),
];

type ProductGridProps = {
  products: Product[];
  priceMap: Record<string, ProductPriceSample | undefined>;
  descriptionMap: Record<string, string | undefined>;
};

export default function ProductSelectionGrid({
  products,
  priceMap,
  descriptionMap,
}: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isProductLoading, setIsProductLoading] = useState(false);
  const router = useRouter();
  const unitSystem = useUnitSystem();
  const setUnitSystem = useSetUnitSystem();
  const setProductId = useHeadstoneStore((s) => s.setProductId);
  const currentProductId = useHeadstoneStore((s) => s.productId);

  const handleContinue = () => {
    if (!currentProductId) return;

    const productSlug = getDesignerProductSlug(currentProductId);
    router.push(productSlug ? `/${productSlug}/select-shape` : '/select-shape');
  };

  const handleProductSelect = async (product: Product) => {
    if (currentProductId === product.id && !isProductLoading) {
      handleContinue();
      return;
    }

    setIsProductLoading(true);
    try {
      await setProductId(product.id);
    } finally {
      setIsProductLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;
    return matchesCategory;
  });

  const groupedProducts = productGroups
    .map((group) => {
      const groupProducts = filteredProducts.filter(
        (product) => product.category === group.id,
      );

      return { ...group, products: orderProductsForDisplay(groupProducts) };
    })
    .filter((group) => group.products.length > 0);

  return (
    <div className="day:bg-stone-100 day:bg-none min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header Section */}
      <div className="day:border-gray-200 day:bg-white day:bg-none relative overflow-hidden border-b border-white/10 bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm">
        <div className="day:hidden absolute inset-0 bg-gradient-to-br from-[#cfac6c]/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="day:border-gray-200 day:bg-white/90 absolute top-4 right-6 flex rounded-full border border-white/10 bg-black/55 p-1 shadow-lg backdrop-blur-md lg:right-8">
            {[
              { value: 'metric' as const, label: 'MM' },
              { value: 'imperial' as const, label: 'IN' },
            ].map((option) => {
              const isActive = unitSystem === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setUnitSystem(option.value)}
                  aria-label={`Use ${option.value} units`}
                  aria-pressed={isActive}
                  title={`Use ${option.value} units`}
                  className={`h-7 min-w-10 rounded-full px-3 text-xs font-semibold tracking-wide transition-colors ${
                    isActive
                      ? 'bg-[#cfac6c] text-slate-950'
                      : 'day:text-gray-600 day:hover:bg-gray-100 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <div className="text-left sm:text-center">
            <h1 className="day:text-gray-900 font-serif text-3xl font-light tracking-tight text-white sm:text-4xl lg:text-[2.5rem]">
              Select Your Memorial Product
            </h1>
            <p className="day:text-gray-600 mt-2 text-sm leading-6 text-gray-100 sm:mx-auto lg:whitespace-nowrap">
              Choose a memorial product to begin — then refine its shape,
              material and dimensions with transparent pricing.
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="day:border-gray-200 day:bg-white relative border-b border-white/5 bg-gray-900/30">
        <div className="day:hidden absolute inset-0 bg-gradient-to-r from-transparent via-[#cfac6c]/3 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 py-3.5 lg:px-8">
          <div className="-mx-6 flex snap-x gap-2 overflow-x-auto px-6 pr-12 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`shrink-0 snap-start rounded-full px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-all ${
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
                className={`shrink-0 snap-start rounded-full px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-[#cfac6c] text-slate-900 shadow-lg shadow-[#cfac6c]/20'
                    : 'day:border-gray-300 day:text-gray-700 day:hover:bg-gray-100 border border-white/20 text-white hover:border-[#cfac6c]/30 hover:bg-white/10'
                }`}
              >
                <span>{category.name}</span>
                <span className="ml-1 text-xs opacity-70">
                  (
                  {
                    products.filter(
                      (product) => product.category === category.id,
                    ).length
                  }
                  )
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="mx-auto max-w-7xl px-6 pt-5 pb-28 lg:px-8 lg:pb-5">
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
            <div
              className={`grid gap-8 ${
                selectedCategory === 'all' ? 'lg:grid-cols-2' : 'lg:grid-cols-1'
              }`}
            >
              {groupedProducts.map((group) => (
                <section
                  key={group.id}
                  aria-labelledby={`product-group-${group.id}`}
                >
                  <div className="day:border-gray-200 mb-3 border-b border-white/10 pb-2">
                    <div>
                      <h2
                        id={`product-group-${group.id}`}
                        className="day:text-gray-900 text-lg font-semibold text-white"
                      >
                        {group.name}{' '}
                        <span className="day:text-gray-500 text-sm font-medium text-gray-300">
                          ({group.products.length} item
                          {group.products.length !== 1 ? 's' : ''})
                        </span>
                      </h2>
                      <p className="day:text-gray-500 mt-0.5 text-sm text-gray-200">
                        {group.description}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 ${
                      selectedCategory === 'all'
                        ? ''
                        : 'lg:grid-cols-3 xl:grid-cols-5'
                    }`}
                  >
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
                              <div className="day:border-gray-200 day:bg-gray-50 flex items-baseline gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 whitespace-nowrap">
                                <span className="day:text-gray-500 text-[11px] font-medium tracking-[0.12em] text-gray-400 uppercase">
                                  Sample price
                                </span>
                                <span className="day:text-gray-900 text-base font-semibold text-white">
                                  {formatPrice(
                                    priceRange.price,
                                    priceRange.currency,
                                  )}
                                </span>
                                <span className="text-gray-500">·</span>
                                <span className="day:text-gray-500 text-xs text-gray-400">
                                  {formatDimensionPair(
                                    priceRange.width,
                                    priceRange.height,
                                    unitSystem,
                                  )}
                                </span>
                              </div>
                            ) : (
                              <p className="day:border-gray-200 day:bg-gray-50 day:text-gray-600 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-gray-300">
                                Select product to configure options and view
                                pricing
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
                                  {isSelected ? 'Continue' : 'Select product'}
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

      {currentProductId && (
        <div className="day:border-gray-200 day:bg-white/95 fixed right-0 bottom-0 left-0 z-30 border-t border-[#cfac6c]/30 bg-[#121212]/95 px-6 py-3 shadow-2xl shadow-black/40 backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="day:text-gray-900 text-sm font-semibold text-white">
                {products.find((product) => product.id === currentProductId)
                  ?.name ?? 'Product selected'}
              </p>
              <p className="day:text-gray-600 mt-0.5 text-xs text-gray-300">
                Next: choose a shape for your memorial.
              </p>
            </div>
            <button
              type="button"
              onClick={handleContinue}
              disabled={isProductLoading}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#cfac6c] px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-[#cfac6c]/20 transition-colors hover:bg-[#dfc17e] disabled:cursor-wait disabled:opacity-70 sm:w-auto"
            >
              {isProductLoading
                ? 'Loading product…'
                : 'Continue to Select Shape'}
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
