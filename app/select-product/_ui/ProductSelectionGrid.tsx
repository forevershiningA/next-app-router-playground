'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
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

const productSummaries: Record<string, { name?: string; description: string }> =
  {
    '5': {
      description: 'Cast bronze with raised lettering and memorial motifs.',
    },
    '8': {
      description: 'A compact granite pet headstone with laser-etched details.',
    },
    '9': {
      description:
        'A granite pet plaque with laser-etched portraits and lettering.',
    },
    '135': {
      description:
        'A pet memorial rock with laser-etched portraits and lettering.',
    },
    '30': {
      description: 'Black granite with laser-etched portraits and lettering.',
    },
    '32': {
      description: 'Full-colour portraits and artwork on a memorial plaque.',
    },
    '34': { description: 'Engraved lettering and motifs on natural stone.' },
    '52': {
      description: 'Stainless steel with laser-marked lettering and artwork.',
    },
    '100': {
      description: 'A complete granite memorial with laser-etched details.',
    },
    '101': {
      description:
        'A complete stone memorial with engraved lettering and motifs.',
    },
    '103': {
      description: 'A traditional Polish-style full memorial in natural stone.',
    },
    '2350': { description: 'Stainless steel urn with vitreous enamel inlay.' },
    '4': {
      name: 'Laser-etched Granite',
      description:
        'Black granite with detailed portraits, lettering and artwork.',
    },
    '124': {
      name: 'Traditional Engraved',
      description:
        'Engraved lettering and motifs on granite, marble or sandstone.',
    },
    '22': {
      name: 'Mini Headstone',
      description:
        'A compact black granite memorial with laser-etched details.',
    },
    '1': {
      name: 'Light-transmitting Steel',
      description: 'Cut-through lettering with glass-backed motif options.',
    },
    '23': {
      name: 'Light-reflective Steel',
      description:
        'Polished stainless steel with reflective lettering and motifs.',
    },
  };

type ProductGridProps = {
  products: Product[];
  priceMap: Record<string, ProductPriceSample | undefined>;
  descriptionMap: Record<string, string | undefined>;
};

function ProductCarousel({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const update = () => {
      setCanScrollBack(track.scrollLeft > 1);
      setCanScrollForward(
        track.scrollLeft + track.clientWidth < track.scrollWidth - 1,
      );
    };
    const observer = new ResizeObserver(update);
    observer.observe(track);
    track.addEventListener('scroll', update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      track.removeEventListener('scroll', update);
    };
  }, [children]);

  const scroll = (direction: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * (track.clientWidth + 20),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    });
  };

  return (
    <div>
      {(canScrollBack || canScrollForward) && (
        <div className="mb-3 flex justify-end gap-2">
          {[-1, 1].map((direction) => (
            <button
              key={direction}
              type="button"
              aria-label={`${direction === -1 ? 'Previous' : 'Next'} products in ${label}`}
              disabled={direction === -1 ? !canScrollBack : !canScrollForward}
              onClick={() => scroll(direction)}
              className="day:border-[#bdb4a6] day:text-[#514a43] flex size-10 items-center justify-center rounded-sm border border-white/20 text-white/80 hover:border-[#cfac6c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9a742f] disabled:cursor-default disabled:opacity-30"
            >
              {direction === -1 ? (
                <ArrowLeftIcon className="size-4" />
              ) : (
                <ArrowRightIcon className="size-4" />
              )}
            </button>
          ))}
        </div>
      )}
      <div
        ref={trackRef}
        role="region"
        aria-label={`${label} products`}
        tabIndex={0}
        className="grid snap-x snap-mandatory auto-cols-[100%] grid-flow-col items-stretch gap-5 overflow-x-auto overscroll-x-contain p-1 pb-3 focus-visible:outline-2 focus-visible:outline-[#9a742f] @min-[38rem]/products:auto-cols-[calc((100%-20px)/2)] @min-[60rem]/products:auto-cols-[calc((100%-60px)/4)]"
      >
        {children}
      </div>
    </div>
  );
}

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
    <div className="day:bg-[#f7f4ee] @container/products min-h-screen bg-[#0c0b0a]">
      {/* Header Section */}
      <div className="day:border-[#cfc5b7] day:bg-[#eee9df] relative overflow-hidden border-b border-white/10 bg-[#1d1a17] lg:flex lg:h-36 lg:items-center">
        <div className="relative mx-auto w-full max-w-7xl px-6 py-8 lg:px-8 lg:py-0">
          <UnitCurrencySelects className="mb-3 justify-end sm:absolute sm:top-4 sm:right-6 sm:mb-0 lg:right-8" />
          <div className="text-center sm:px-20">
            <h1 className="day:text-[#1d1a17] font-serif text-3xl font-normal tracking-[-0.025em] text-white sm:text-4xl lg:text-3xl">
              Choose your memorial
            </h1>
            <p className="day:text-[#625a51] mx-auto mt-3 max-w-xl text-sm leading-6 text-white/70">
              Compare materials and styles to find the right starting point.
              Next: choose the shape.
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="day:border-[#d8cdb9] day:bg-[#f7f4ee] relative border-b border-white/10 bg-[#15120f]">
        <div className="relative mx-auto max-w-7xl px-6 py-3.5 lg:px-8">
          <div className="-mx-6 flex snap-x gap-2 overflow-x-auto px-6 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => setSelectedCategory('all')}
              aria-pressed={selectedCategory === 'all'}
              className={`shrink-0 snap-start rounded-sm border px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
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
                aria-pressed={selectedCategory === category.id}
                className={`shrink-0 snap-start rounded-sm border px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
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
            <div className="grid gap-10">
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

                  <ProductCarousel label={group.name}>
                    {group.products.map((product) => {
                      const priceRange = priceMap[product.id];
                      const summary = productSummaries[product.id];
                      const description =
                        summary?.description ??
                        descriptionMap[product.id] ??
                        'Fully customizable memorial with premium materials and finishes.';
                      return (
                        <button
                          key={product.id}
                          onClick={() => handleProductSelect(product)}
                          disabled={loadingProductId !== null}
                          aria-label={`Select ${product.name}`}
                          className="group day:border-[#e4ddd2] day:bg-white day:shadow-[0_10px_30px_rgba(0,0,0,0.03)] day:hover:border-[#9a742f] relative flex h-full min-w-0 cursor-pointer snap-start flex-col overflow-hidden rounded-sm border border-white/12 bg-[#171717] text-left transition-colors hover:border-[#cfac6c]/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9a742f] disabled:cursor-wait disabled:opacity-70"
                        >
                          <div className="day:border-[#e4ddd2] day:bg-[#f3f1ed] relative aspect-square w-full overflow-hidden border-b border-white/10 bg-[#101010]">
                            <Image
                              src={`/webp/products/${product.image}`}
                              alt={product.name}
                              fill
                              className="object-contain p-3 transition-transform duration-700 ease-out will-change-transform group-focus-within:scale-[1.025] group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-focus-within:transform-none motion-reduce:group-hover:transform-none"
                              sizes="(min-width: 1360px) 25vw, (min-width: 1024px) 45vw, (min-width: 608px) 50vw, 100vw"
                            />
                          </div>

                          <div className="flex flex-1 flex-col gap-3 p-5">
                            <h3 className="day:text-[#1d1a17] font-serif text-xl leading-tight text-white">
                              {summary?.name ?? product.name}
                            </h3>

                            <p className="day:text-[#625a51] text-sm leading-6 text-gray-300">
                              {description}
                            </p>

                            {priceRange ? (
                              <div className="mt-auto pt-2">
                                <span className="day:text-[#1d1a17] block text-2xl font-semibold text-white">
                                  {formatAudPrice(
                                    priceRange.price,
                                    currency,
                                    rates,
                                    0,
                                  )}
                                </span>
                                <span className="day:text-[#756c62] mt-1 block text-xs leading-5 text-white/60">
                                  Example price ·{' '}
                                  {formatDimensionPair(
                                    priceRange.width,
                                    priceRange.height,
                                    unitSystem,
                                  )}
                                </span>
                              </div>
                            ) : (
                              <p className="day:text-[#625a51] mt-auto pt-2 text-sm text-gray-300">
                                Select product to configure options and view
                                pricing
                              </p>
                            )}

                            <div className="pt-1">
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
                  </ProductCarousel>
                </section>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
