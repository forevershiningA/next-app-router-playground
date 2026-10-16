import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { HOME_PRODUCT_OPTIONS } from '#/app/_internal/home-products';

export default function HomeProductSection() {
  return (
    <>
      {' '}
      {/* Search-friendly product entry point outside the designer shell. */}
      <section
        aria-labelledby="home-products-heading"
        className="day:border-stone-200 day:bg-white relative overflow-hidden border-y border-white/10 bg-[#0c0b0a] py-20"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="day:text-amber-800 text-xs font-semibold tracking-[0.12em] text-[#d0ad68]">
              Choose your memorial
            </p>
            <h2
              id="home-products-heading"
              className="day:text-stone-900 mt-4 font-serif text-3xl leading-[1.16] text-pretty text-white sm:text-5xl"
            >
              Design a custom headstone, plaque, monument, or urn online
            </h2>
            <p className="day:text-stone-600 mt-5 max-w-2xl text-base leading-7 text-gray-300">
              Start with the memorial that best suits your family, cemetery, or
              setting. Each guided designer lets you compare shapes, materials,
              sizes, inscriptions, images, and meaningful details before
              ordering.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 items-stretch gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {HOME_PRODUCT_OPTIONS.slice(0, 6).map((product) => (
              <article
                key={product.href}
                className="group day:border-stone-200 day:bg-white flex h-full flex-col overflow-hidden border border-white/12 bg-[#151412] transition-colors hover:border-[#d0ad68]/65"
              >
                <div className="day:bg-[#f3f1ed] relative aspect-[4/3] overflow-hidden bg-[#101010]">
                  <Image
                    src={product.image}
                    alt={`${product.name} available to personalize online`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain p-5 transition-transform duration-700 ease-out will-change-transform group-focus-within:scale-[1.025] group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-focus-within:transform-none motion-reduce:group-hover:transform-none"
                  />
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <p className="day:text-amber-800 text-[11px] font-semibold tracking-[0.08em] text-[#d0ad68]">
                    {product.category}
                  </p>
                  <h3 className="day:text-gray-900 mt-2 text-lg leading-snug font-semibold text-white">
                    {product.name}
                  </h3>
                  <p className="day:text-gray-600 mt-3 flex-1 text-sm leading-6 text-gray-300">
                    {product.description}
                  </p>
                  <div className="mt-5 grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-2">
                    <Link
                      href={product.href}
                      prefetch={false}
                      className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-sm bg-[#d0ad68] px-3 py-2.5 text-center text-sm font-semibold text-[#17120a] transition-colors hover:bg-[#e0c27f] focus-visible:ring-2 focus-visible:ring-[#f3d48f] focus-visible:outline-none"
                    >
                      Design now
                      <ArrowRightIcon
                        className="h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />
                    </Link>
                    <Link
                      href={product.learnMoreHref}
                      className="day:border-stone-300 day:text-stone-800 day:hover:bg-stone-50 inline-flex min-h-11 items-center justify-center rounded-sm border border-white/20 px-3 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:border-[#d0ad68]/70 hover:bg-white/[0.06]"
                    >
                      Learn more
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-9 flex flex-col items-center gap-3 text-center">
            <Link
              href="/select-product"
              prefetch={false}
              className="day:text-[#6f511c] inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-[#d0ad68] px-6 py-3 text-sm font-semibold text-[#e3c887] transition-colors hover:bg-[#d0ad68] hover:text-[#17120a]"
            >
              View all memorial products
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
            <p className="day:text-gray-500 max-w-2xl text-xs leading-5 text-gray-400">
              You can save your design, share it with family, and review pricing
              before making a final decision.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
