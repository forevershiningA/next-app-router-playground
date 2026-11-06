import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { HOME_PRODUCT_OPTIONS } from '#/app/_internal/home-products';
import { PRODUCT_BADGES } from '#/lib/memorial-category-details';
import { getProductPriceSamples } from '#/lib/server/product-pricing';
import type { ProductPriceSample } from '#/lib/types/pricing';

function formatSamplePrice(sample?: ProductPriceSample) {
  if (!sample || !sample.price) return null;
  const currency = sample.currency || 'AUD';
  const prefix =
    currency === 'EUR'
      ? '€'
      : currency === 'GBP'
        ? '£'
        : currency === 'USD'
          ? 'US$'
          : '$';
  return `${prefix}${Math.round(sample.price).toLocaleString('en-US')}`;
}

export default async function HomeProductSection() {
  const featured = HOME_PRODUCT_OPTIONS.slice(0, 6);
  const priceSamples = await getProductPriceSamples(featured.map((p) => p.id));

  return (
    <section
      id="featured-products"
      aria-labelledby="home-products-heading"
      className="day:border-[#e2dad0] day:bg-[#f8f6f0] relative scroll-mt-24 border-y border-white/10 bg-[#0d0c0b] py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="day:text-[#8a651f] text-xs font-semibold tracking-widest text-[#cfac6c] uppercase">
              Handcrafted Catalog & Online 3D Designer
            </span>
            <h2
              id="home-products-heading"
              className="day:text-[#1d1a17] mt-2 font-serif text-3xl font-normal text-white sm:text-4xl lg:text-5xl"
            >
              Popular Memorial Styles
            </h2>
            <p className="day:text-[#625a51] mt-4 text-base leading-relaxed text-white/70">
              Select any base style below to personalize dimensions, stone colours,
              photo laser etchings, and heartfelt inscriptions with immediate pricing.
            </p>
          </div>

          <Link
            href="/select-product"
            prefetch={false}
            className="day:border-[#beb4a5] day:text-[#1d1a17] day:hover:bg-[#e4ddcf] inline-flex items-center gap-2 rounded-sm border border-white/20 px-5 py-2.5 text-xs font-semibold tracking-wider text-white uppercase transition-colors hover:bg-white/10"
          >
            <span>View Full Catalog</span>
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => {
            const badge = PRODUCT_BADGES[product.id];
            const priceSample = priceSamples[product.id];

            return (
              <article
                key={product.id}
                className="group day:border-[#e4ddd2] day:bg-white day:shadow-sm day:hover:shadow-md flex h-full flex-col overflow-hidden rounded-sm border border-white/10 bg-[#141311] transition-all duration-300 hover:border-[#cfac6c]/60"
              >
                {/* Visual Image Card */}
                <Link
                  href={product.href}
                  aria-label={`Design your custom ${product.name}`}
                  className="day:border-[#e8e2d7] day:bg-[#f6f3ed] relative block aspect-[4/3] overflow-hidden border-b border-white/10 bg-[#0e0d0c] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#cfac6c]"
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  {badge && (
                    <span className="day:border-[#d5c9b7] day:bg-white/95 day:text-[#6f511c] absolute top-3 right-3 rounded-full border border-white/20 bg-black/75 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-[#e6cb8b] uppercase backdrop-blur-xs">
                      {badge.label}
                    </span>
                  )}
                </Link>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex-1">
                    <p className="day:text-[#8a651f] text-[11px] font-semibold tracking-wider text-[#cfac6c] uppercase">
                      {product.category}
                    </p>
                    <h3 className="day:text-[#1d1a17] mt-1 font-serif text-xl font-normal text-white">
                      {product.name}
                    </h3>
                    <p className="day:text-[#625a51] mt-2 text-sm leading-relaxed text-white/70">
                      {product.description}
                    </p>
                    {badge?.highlight && (
                      <p className="day:text-[#8a651f] mt-2 text-xs font-medium text-[#cfac6c]/90">
                        ✦ {badge.highlight}
                      </p>
                    )}
                  </div>

                  {/* Pricing and Action */}
                  <div className="day:border-[#ebe4da] mt-6 border-t border-white/10 pt-4">
                    <div className="mb-3 flex items-baseline justify-between">
                      {priceSample ? (
                        <div>
                          <span className="day:text-[#756c62] block text-[11px] uppercase tracking-wider text-white/50">
                            Starting from
                          </span>
                          <span className="day:text-[#1d1a17] text-xl font-semibold text-white">
                            {formatSamplePrice(priceSample)}
                          </span>
                          <span className="day:text-[#756c62] ml-1.5 text-xs text-white/50">
                            ({priceSample.width} × {priceSample.height} mm)
                          </span>
                        </div>
                      ) : (
                        <span className="day:text-[#756c62] text-xs text-white/50">
                          Custom sizing available
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link
                        href={product.href}
                        className="day:border-[#1d1a17] day:bg-[#1d1a17] day:text-white day:hover:bg-[#342e26] inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-sm border border-[#cfac6c]/60 bg-transparent px-4 py-2.5 text-sm font-semibold text-[#f0d89f] transition-all group-hover:bg-[#cfac6c] group-hover:text-[#14120f]"
                      >
                        <span>Customize in 3D</span>
                        <ArrowRightIcon className="size-4" aria-hidden="true" />
                      </Link>

                      <Link
                        href={product.learnMoreHref}
                        className="day:text-[#756c62] day:hover:text-[#1d1a17] text-center text-xs text-white/50 transition-colors hover:text-white"
                      >
                        Learn more about this category →
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/select-product"
            prefetch={false}
            className="day:bg-[#1d1a17] day:text-white day:hover:bg-[#342e26] inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-[#cfac6c] px-8 py-3 text-sm font-semibold text-[#181611] transition-colors hover:bg-[#e0c48c]"
          >
            <span>Explore All 16 Memorial Products</span>
            <ArrowRightIcon className="size-4" />
          </Link>
          <p className="day:text-[#756c62] mt-3 text-xs text-white/50">
            Compare granite headstones, bronze plaques, full monuments, and keepsake urns.
          </p>
        </div>
      </div>
    </section>
  );
}
