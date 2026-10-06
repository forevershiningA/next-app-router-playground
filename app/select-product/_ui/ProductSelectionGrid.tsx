'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { Product } from '#/lib/db';
import type { ProductPriceSample } from '#/lib/types/pricing';
import { getDesignerProductSlug } from '#/lib/designer-product-routes';
import { orderProductsForDisplay } from '#/lib/product-display-order';
import { formatDimensionPair } from '#/lib/unit-system';
import { useUnitSystem } from '#/lib/use-unit-system';
import { formatAudPrice } from '#/lib/currency';
import { useCurrency } from '#/lib/use-currency';
import UnitCurrencySelects from '#/components/designer/navigation/UnitCurrencySelects';

type ProductCategory = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

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
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const router = useRouter();
  const unitSystem = useUnitSystem();
  const { currency, rates } = useCurrency();
  const setProductId = useHeadstoneStore((s) => s.setProductId);

  const handleProductSelect = async (product: Product) => {
    if (loadingProductId) return;

    setLoadingProductId(product.id);
    try {
      await setProductId(product.id);
      const productSlug = getDesignerProductSlug(product.id);
      router.push(
        productSlug ? `/${productSlug}/select-shape` : '/select-shape',
      );
    } finally {
      setLoadingProductId(null);
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
    <div className="day:bg-[#f7f4ee] min-h-screen bg-[#0c0b0a]">
      {/* Header Section */}
      <div className="day:border-[#cfc5b7] day:bg-[#eee9df] relative overflow-hidden border-b border-white/10 bg-[#1d1a17]">
        <div className="relative mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-10">
          <UnitCurrencySelects className="mb-3 justify-end sm:absolute sm:top-4 sm:right-6 sm:mb-0 lg:right-8" />
          <div className="text-left sm:text-center">
            <h1 className="day:text-[#1d1a17] font-serif text-3xl font-normal tracking-[-0.025em] text-white sm:text-4xl lg:text-[2.75rem]">
              Select Your Memorial Product
            </h1>
            <p className="day:text-[#625a51] mt-3 text-sm leading-6 text-white/70 sm:mx-auto lg:whitespace-nowrap">
              Choose a memorial product to begin — then refine its shape,
              material and dimensions with transparent pricing.
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="day:border-[#d8cdb9] day:bg-[#f7f4ee] relative border-b border-white/10 bg-[#15120f]">
        <div className="relative mx-auto max-w-7xl px-6 py-3.5 lg:px-8">
          <div className="-mx-6 flex snap-x gap-2 overflow-x-auto px-6 pr-12 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`shrink-0 snap-start rounded-sm border px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'day:border-[#1d1a17] day:bg-[#1d1a17] day:text-white border-[#cfac6c] bg-[#cfac6c] text-[#1d1a17]'
                  : 'day:border-[#bdb4a6] day:text-[#514a43] day:hover:border-[#9a742f] day:hover:bg-white/55 border-white/20 text-white/80 hover:border-[#cfac6c]/70 hover:bg-white/[0.06]'
              }`}
            >
              All Products
            </button>
            {productCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`shrink-0 snap-start rounded-sm border px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'day:border-[#1d1a17] day:bg-[#1d1a17] day:text-white border-[#cfac6c] bg-[#cfac6c] text-[#1d1a17]'
                    : 'day:border-[#bdb4a6] day:text-[#514a43] day:hover:border-[#9a742f] day:hover:bg-white/55 border-white/20 text-white/80 hover:border-[#cfac6c]/70 hover:bg-white/[0.06]'
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
      <div className="mx-auto max-w-7xl px-6 pt-5 pb-36 lg:px-8 lg:pb-5">
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
                  <div className="day:border-[#d8cdb9] mb-4 border-b border-white/10 pb-3">
                    <div>
                      <h2
                        id={`product-group-${group.id}`}
                        className="day:text-[#1d1a17] font-serif text-2xl font-normal text-white"
                      >
                        {group.name}{' '}
                        <span className="day:text-[#756c62] ml-1 font-sans text-sm font-medium text-white/55">
                          ({group.products.length} item
                          {group.products.length !== 1 ? 's' : ''})
                        </span>
                      </h2>
                      <p className="day:text-[#625a51] mt-1 text-sm text-white/60">
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
                      const priceRange = priceMap[product.id];
                      const description =
                        descriptionMap[product.id] ??
                        'Fully customizable memorial with premium materials and finishes.';
                      return (
                        <button
                          key={product.id}
                          onClick={() => handleProductSelect(product)}
                          disabled={loadingProductId !== null}
                          className="group day:border-[#e4ddd2] day:bg-white day:shadow-[0_10px_30px_rgba(0,0,0,0.03)] day:hover:border-[#9a742f] relative flex h-full cursor-pointer flex-col overflow-hidden rounded-sm border border-white/12 bg-[#171717] text-left transition-colors hover:border-[#cfac6c]/60 disabled:cursor-wait disabled:opacity-70"
                        >
                          <div className="day:border-[#e4ddd2] day:bg-[#f3f1ed] relative aspect-square w-full overflow-hidden border-b border-white/10 bg-[#101010]">
                            <Image
                              src={`/webp/products/${product.image}`}
                              alt={product.name}
                              fill
                              className="object-contain p-3 sepia transition-all duration-700 ease-out will-change-transform group-hover:scale-[1.025] group-hover:sepia-0 motion-reduce:transition-none motion-reduce:group-hover:transform-none"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                            />
                          </div>

                          <div className="flex flex-1 flex-col gap-2.5 p-3.5">
                            <h3 className="day:text-[#1d1a17] line-clamp-2 min-h-[2.5rem] font-serif text-lg leading-tight text-white">
                              {product.name}
                            </h3>

                            <p className="day:text-[#625a51] line-clamp-2 min-h-10 text-sm leading-5 text-gray-300">
                              {description}
                            </p>

                            {priceRange ? (
                              <div className="day:border-gray-200 day:bg-gray-50 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2">
                                <div className="flex items-baseline gap-2 whitespace-nowrap">
                                  <span className="day:text-gray-500 text-[11px] font-medium tracking-[0.12em] text-gray-400 uppercase">
                                    Sample size
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
                                <span className="day:text-gray-900 mt-0.5 block text-base font-semibold text-white">
                                  {formatAudPrice(
                                    priceRange.price,
                                    currency,
                                    rates,
                                    0,
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
                              <span className="day:border-[#1d1a17] day:bg-[#1d1a17] day:text-white inline-flex min-h-10 w-full items-center justify-between gap-2 rounded-sm border border-[#cfac6c]/70 bg-transparent px-3 py-2 text-sm font-semibold text-[#f0d89f] transition-colors group-hover:bg-[#cfac6c] group-hover:text-[#1d1a17]">
                                <span>
                                  {loadingProductId === product.id
                                    ? 'Loading product…'
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
    </div>
  );
}
