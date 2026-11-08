'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
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

const PRODUCT_MATERIAL_TAGS: Record<string, string> = {
  '5': 'Cast Bronze',
  '4': 'Laser-Etched Granite',
  '124': 'Traditional Engraved Stone',
  '22': 'Compact Granite',
  '1': 'Light-Transmitting Steel',
  '23': 'Mirror-Polished Steel',
  '30': 'Black Granite',
  '32': 'Full-Colour Enamel',
  '34': 'Engraved Natural Stone',
  '52': 'Marine-Grade Steel',
  '100': 'Complete Granite Monument',
  '101': 'Traditional Stone Monument',
  '103': 'Classic Memorial Structure',
  '2350': 'Vitreous Enamel & Steel',
  '8': 'Granite Pet Headstone',
  '9': 'Granite Pet Plaque',
  '135': 'Natural Pet Rock',
};

type ProductGridProps = {
  products: Product[];
  priceMap: Record<string, ProductPriceSample | undefined>;
  descriptionMap: Record<string, string | undefined>;
};

function ProductCarousel({
  children,
  label,
  heading,
}: {
  children: ReactNode;
  label: string;
  heading?: ReactNode;
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
      left:
        direction *
        (window.innerWidth < 768
          ? (track.firstElementChild?.getBoundingClientRect().width ??
              track.clientWidth) + 12
          : track.clientWidth + 20),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    });
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-2 md:block">
      {heading}
      {(canScrollBack || canScrollForward) && (
        <div className="col-start-2 mb-3 flex justify-end gap-1.5 md:mb-4 md:gap-2">
          {[-1, 1].map((direction) => (
            <button
              key={direction}
              type="button"
              aria-label={`${direction === -1 ? 'Previous' : 'Next'} products in ${label}`}
              disabled={direction === -1 ? !canScrollBack : !canScrollForward}
              onClick={() => scroll(direction)}
              className="flex size-9 items-center justify-center rounded-lg border border-white/20 bg-white/[0.04] text-white/80 transition-all hover:border-[#c49a45] hover:bg-[#c49a45]/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 day:border-[#dfd7ca] day:bg-white day:text-[#5a5248] day:hover:border-[#9a742f] day:hover:bg-[#9a742f]/10 day:hover:text-[#9a742f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9a742f]"
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
        className="col-span-2 grid snap-x snap-mandatory auto-cols-[88%] grid-flow-col items-stretch gap-3.5 overflow-x-auto overscroll-x-contain p-1 pb-4 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-[#9a742f] md:auto-cols-[100%] md:gap-5 md:[scrollbar-width:auto] @min-[38rem]/products:auto-cols-[calc((100%-20px)/2)] @min-[60rem]/products:auto-cols-[calc((100%-60px)/4)]"
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
    <div className="min-h-screen bg-[#0c0b0a] day:bg-[#f7f4ee] @container/products">
      {/* Studio Header Section */}
      <div className="relative overflow-hidden border-b border-white/10 bg-[#161412] day:border-[#dfd7ca] day:bg-[#f5f1e8]">
        <div className="relative mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="text-left">
              <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-[#c49a45]/35 bg-[#c49a45]/10 px-3 py-1 text-[11px] font-semibold tracking-widest text-[#c49a45] uppercase day:border-[#9a742f]/30 day:bg-[#9a742f]/10 day:text-[#78541c]">
                <span className="inline-block size-1.5 rounded-full bg-[#c49a45] day:bg-[#9a742f]" />
                Step 1 of 3 · Configurator Selection
              </div>
              <h1 className="font-serif text-3xl font-normal tracking-tight text-white day:text-[#1a1714] sm:text-4xl lg:text-[40px] lg:leading-tight">
                Choose Your Memorial
              </h1>
              <p className="mt-2 max-w-2xl text-xs leading-relaxed text-stone-300 day:text-[#5a5248] md:text-sm">
                Select your base product and material to begin real-time 3D configuration.
                You can personalize dimensions, shape, custom inscriptions, motifs, and finishes in subsequent steps.
              </p>
            </div>
            <div className="shrink-0 pt-1 sm:pt-0">
              <UnitCurrencySelects className="justify-start sm:justify-end" />
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-[#121110]/95 backdrop-blur-md day:border-[#dfd7ca] day:bg-[#f7f4ee]/95">
        <div className="relative mx-auto max-w-7xl px-4 py-2.5 md:px-6 md:py-3.5 lg:px-8">
          <div className="-mx-4 flex snap-x items-center gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => setSelectedCategory('all')}
              aria-pressed={selectedCategory === 'all'}
              className={`min-h-9 shrink-0 snap-start rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 md:text-sm ${
                selectedCategory === 'all'
                  ? 'border-[#c49a45] bg-[#c49a45] text-[#121110] shadow-sm day:border-[#9a742f] day:bg-[#9a742f] day:text-white'
                  : 'border-white/15 bg-white/[0.04] text-white/75 hover:border-[#c49a45]/50 hover:bg-white/[0.08] hover:text-white day:border-[#d6cebf] day:bg-[#eee8dc]/70 day:text-[#5a5248] day:hover:border-[#9a742f]/50 day:hover:bg-[#e7e0d2] day:hover:text-[#1a1714]'
              }`}
            >
              All Products
            </button>
            {productCategories.map((category) => {
              const count = products.filter(
                (product) => product.category === category.id,
              ).length;
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  aria-pressed={isSelected}
                  className={`min-h-9 shrink-0 snap-start rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 md:text-sm ${
                    isSelected
                      ? 'border-[#c49a45] bg-[#c49a45] text-[#121110] shadow-sm day:border-[#9a742f] day:bg-[#9a742f] day:text-white'
                      : 'border-white/15 bg-white/[0.04] text-white/75 hover:border-[#c49a45]/50 hover:bg-white/[0.08] hover:text-white day:border-[#d6cebf] day:bg-[#eee8dc]/70 day:text-[#5a5248] day:hover:border-[#9a742f]/50 day:hover:bg-[#e7e0d2] day:hover:text-[#1a1714]'
                  }`}
                >
                  <span>{category.name}</span>
                  <span
                    className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                      isSelected
                        ? 'bg-black/20 text-[#121110] day:bg-white/20 day:text-white'
                        : 'bg-white/10 text-white/60 day:bg-[#dfd7ca] day:text-[#6a6156]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="mx-auto max-w-7xl px-4 pt-6 pb-28 md:px-6 md:pt-8 lg:px-8">
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center">
            <h3 className="font-serif text-xl font-normal text-white day:text-[#1a1714]">
              No products found
            </h3>
            <p className="mt-2 text-sm text-stone-400 day:text-[#786e61]">
              Try adjusting your category selection
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-12">
              {groupedProducts.map((group) => (
                <section
                  key={group.id}
                  aria-labelledby={
                    selectedCategory === 'all'
                      ? `product-group-${group.id}`
                      : undefined
                  }
                  aria-label={
                    selectedCategory === 'all' ? undefined : group.name
                  }
                >
                  <ProductCarousel
                    label={group.name}
                    heading={
                      selectedCategory === 'all' && (
                        <div className="mb-4 flex flex-col justify-between gap-1 border-b border-white/10 pb-3 day:border-[#dfd7ca] md:flex-row md:items-baseline">
                          <div>
                            <h2
                              id={`product-group-${group.id}`}
                              className="font-serif text-2xl font-normal tracking-tight text-white day:text-[#1a1714] md:text-3xl"
                            >
                              {group.name}
                              <span className="ml-2.5 font-sans text-xs font-semibold uppercase tracking-wider text-[#c49a45] day:text-[#9a742f]">
                                {group.products.length}{' '}
                                {group.products.length === 1
                                  ? 'option'
                                  : 'options'}
                              </span>
                            </h2>
                            <p className="mt-1 text-xs text-white/65 day:text-[#6a6156] md:text-sm">
                              {group.description}
                            </p>
                          </div>
                        </div>
                      )
                    }
                  >
                    {group.products.map((product) => {
                      const priceRange = priceMap[product.id];
                      const summary = productSummaries[product.id];
                      const description =
                        summary?.description ??
                        descriptionMap[product.id] ??
                        'Fully customizable memorial with premium materials and finishes.';
                      const materialTag = PRODUCT_MATERIAL_TAGS[product.id];
                      const displayName = summary?.name ?? product.name;

                      return (
                        <button
                          key={product.id}
                          onClick={() => handleProductSelect(product)}
                          disabled={loadingProductId !== null}
                          aria-label={`Select ${displayName}`}
                          className="group relative flex h-full min-w-0 cursor-pointer snap-start flex-col overflow-hidden rounded-xl border border-white/10 bg-[#161412] text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#c49a45]/70 hover:shadow-xl day:border-[#dfd7ca] day:bg-white day:shadow-[0_8px_24px_rgba(40,30,20,0.06)] day:hover:border-[#9a742f] day:hover:shadow-[0_14px_34px_rgba(40,30,20,0.12)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9a742f] disabled:cursor-wait disabled:opacity-70"
                        >
                          {/* Product Image Stage */}
                          <div className="relative h-48 w-full overflow-hidden border-b border-white/8 bg-gradient-to-b from-[#1c1a17] to-[#141210] p-4 day:border-[#ebe4d8] day:bg-gradient-to-b day:from-[#f8f5ee] day:to-[#ede6d8] md:aspect-square md:h-auto">
                            <Image
                              src={`/webp/products/${product.image}`}
                              alt={displayName}
                              fill
                              className="object-contain p-4 transition-transform duration-500 ease-out will-change-transform group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                              sizes="(min-width: 1360px) 25vw, (min-width: 1024px) 45vw, (min-width: 608px) 50vw, 100vw"
                            />
                            {materialTag && (
                              <div className="absolute top-3 left-3 z-10">
                                <span className="inline-flex items-center rounded-md border border-white/15 bg-black/60 px-2 py-0.5 text-[11px] font-medium tracking-wide text-white backdrop-blur-md day:border-[#d6cebf] day:bg-[#f7f4ee]/90 day:text-[#5a5248]">
                                  {materialTag}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex flex-1 flex-col gap-2.5 p-4 md:p-5">
                            <div>
                              <h3 className="font-serif text-lg font-normal leading-snug text-white transition-colors group-hover:text-[#f0d89f] day:text-[#1a1714] day:group-hover:text-[#9a742f] md:text-xl">
                                {displayName}
                              </h3>
                              <p className="mt-1.5 text-xs leading-relaxed text-stone-300 line-clamp-2 day:text-[#5a5248] md:text-sm">
                                {description}
                              </p>
                            </div>

                            {/* Pricing & Dimensions */}
                            <div className="mt-auto border-t border-white/8 pt-3 day:border-[#eee7da]">
                              {priceRange ? (
                                <div className="flex items-baseline justify-between gap-2">
                                  <div>
                                    <span className="text-[11px] uppercase tracking-wider text-white/50 day:text-[#786e61]">
                                      From
                                    </span>
                                    <span className="block text-xl font-semibold tracking-tight text-white day:text-[#1a1714] md:text-2xl">
                                      {formatAudPrice(
                                        priceRange.price,
                                        currency,
                                        rates,
                                        0,
                                      )}
                                    </span>
                                  </div>
                                  <span className="text-right text-[11px] leading-tight text-white/50 day:text-[#786e61]">
                                    Example size
                                    <span className="block font-medium text-white/70 day:text-[#5a5248]">
                                      {formatDimensionPair(
                                        priceRange.width,
                                        priceRange.height,
                                        unitSystem,
                                      )}
                                    </span>
                                  </span>
                                </div>
                              ) : (
                                <p className="text-xs text-white/50 day:text-[#786e61]">
                                  Select product to configure size and live pricing
                                </p>
                              )}
                            </div>

                            {/* CTA Button */}
                            <div className="pt-2">
                              <span className="inline-flex min-h-10 w-full items-center justify-between gap-2 rounded-lg border border-[#c49a45]/50 bg-transparent px-3.5 py-2 text-xs font-semibold text-[#f0d89f] transition-all duration-200 group-hover:border-[#c49a45] group-hover:bg-[#c49a45] group-hover:text-[#121110] day:border-[#9a742f]/40 day:bg-[#f7f4ee] day:text-[#78541c] day:group-hover:border-[#9a742f] day:group-hover:bg-[#9a742f] day:group-hover:text-white md:text-sm">
                                <span>
                                  {loadingProductId === product.id
                                    ? 'Loading 3D Studio…'
                                    : 'Configure in 3D'}
                                </span>
                                <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
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

            {/* Bottom Studio Guidance */}
            <div className="mt-14 rounded-2xl border border-white/10 bg-[#161412] p-6 text-center day:border-[#dfd7ca] day:bg-white day:shadow-sm md:p-8">
              <h3 className="font-serif text-xl font-normal text-white day:text-[#1a1714] md:text-2xl">
                Need help choosing the right memorial type?
              </h3>
              <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-stone-300 day:text-[#5a5248] md:text-sm">
                Our design specialists are available to guide you through cemetery regulations, material longevity, and custom inscriptions.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-lg border border-[#c49a45] bg-[#c49a45] px-4 py-2 text-xs font-semibold text-[#121110] transition-colors hover:bg-[#d5ad55] day:border-[#9a742f] day:bg-[#9a742f] day:text-white day:hover:bg-[#856325] md:text-sm"
                >
                  Consult a Specialist
                </a>
                <a
                  href="/memorials/headstones"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/[0.08] day:border-[#d6cebf] day:bg-[#f7f4ee] day:text-[#5a5248] day:hover:bg-[#eee8dc] day:hover:text-[#1a1714] md:text-sm"
                >
                  Explore Product Catalog
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
