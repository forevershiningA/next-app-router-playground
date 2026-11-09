import Link from 'next/link';
import Image from 'next/image';
import MemorialCategoryNav from '#/components/MemorialCategoryNav';
import { Bars3Icon, ClipboardDocumentCheckIcon, MagnifyingGlassIcon, ShieldCheckIcon, TruckIcon } from '@heroicons/react/24/outline';
import { ThemeToggle } from '#/components/theme/ThemeToggle';
import {
  memorialTypePages,
  type MemorialTypeSlug,
} from '#/lib/memorial-product-pages';

const headerMemorialLinks: MemorialTypeSlug[] = [
  'headstones',
  'plaques',
  'full-monuments',
  'urns',
  'pet-memorials',
];

export default function MemorialPublicHeader({
  activeType,
}: {
  activeType?: MemorialTypeSlug | 'gallery' | 'contact' | 'my-account';
}) {
  return (
    <header className="day:border-[#bdb4a6] day:bg-[#eee9df] day:text-[#1d1a17] relative z-50 border-b border-white/10 bg-[#141311] text-white transition-colors">
      <div className="mx-auto flex min-h-36 max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#cfac6c]"
          aria-label="Forever Shining home"
        >
          <Image src="/ico/forever-transparent-logo-bw.png" alt="Forever Shining — Design Online" width={400} height={246} className="h-28 w-auto object-contain" priority />
        </Link>

        <div className="day:text-[#74551d] hidden flex-1 items-center justify-center gap-6 text-[#e6cb8b] lg:flex">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheckIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
            30-Year Guarantee
          </span>
          <span className="flex items-center gap-2 text-sm font-semibold">
            <ClipboardDocumentCheckIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
            Cemetery approval guidance
          </span>
          <span className="hidden items-center gap-2 text-sm font-semibold 2xl:flex">
            <TruckIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
            Carefully arranged delivery
          </span>
        </div>

        <nav
          className="ml-auto hidden items-center gap-2 xl:flex"
          aria-label="Design actions"
        >
          <ThemeToggle inline />
          <Link
            href="/designs"
            className="day:border-[#bdb4a6] day:text-[#1d1a17] day:hover:border-[#7b5a20] day:hover:bg-white/45 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white/80 transition-colors hover:border-[#cfac6c] hover:bg-white/5"
            aria-label="Search memorial designs"
          >
            <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link
            href="/designs"
            className="day:border-[#bdb4a6] day:text-[#1d1a17] day:hover:border-[#7b5a20] day:hover:bg-white/45 inline-flex min-h-10 items-center justify-center rounded-lg border border-white/15 px-4 text-sm font-semibold text-white/90 transition-colors hover:border-[#cfac6c] hover:bg-white/5"
          >
            Browse Designs
          </Link>
        </nav>

        <div className="ml-auto xl:hidden">
          <ThemeToggle inline />
        </div>

        <Link
          href="/select-product"
          className="day:bg-[#1d1a17] day:text-white day:hover:bg-[#3a332c] hidden min-h-11 items-center justify-center rounded-sm bg-[#cfac6c] px-4 text-sm font-semibold text-[#17120a] transition-colors hover:bg-[#e4c988] md:inline-flex lg:hidden"
        >
          Start Designing
        </Link>

        <details className="relative xl:hidden">
          <summary className="day:border-[#bdb4a6] day:bg-white/20 day:text-[#1d1a17] flex cursor-pointer list-none items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition-colors hover:border-[#cfac6c] [&::-webkit-details-marker]:hidden">
            <Bars3Icon className="h-5 w-5" aria-hidden="true" />
            Menu
          </summary>
          <nav
            className="day:border-[#cfc5b7] day:bg-[#f7f4ee] day:text-[#1d1a17] absolute top-full right-0 mt-2 flex w-64 flex-col gap-1 rounded-sm border border-white/15 bg-[#171614] p-2 text-white shadow-xl"
            aria-label="Memorial product pages"
          >
            <Link
              href="/"
              className="day:hover:bg-white rounded-sm px-3 py-2 text-sm transition-colors hover:bg-white/10"
            >
              Home
            </Link>
            {headerMemorialLinks.map((slug) => {
              const isActive = slug === activeType;
              return (
                <Link
                  key={slug}
                  href={`/memorials/${slug}`}
                  aria-current={isActive ? 'page' : undefined}
                  className={`rounded-sm px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'day:bg-[#e8dfd0] day:text-[#6f511c] bg-white/10 font-semibold text-[#cfac6c]'
                      : 'day:hover:bg-white hover:bg-white/10'
                  }`}
                >
                  {memorialTypePages[slug].navLabel}
                </Link>
              );
            })}
            <Link
              href="/memorials/gallery"
              aria-current={activeType === 'gallery' ? 'page' : undefined}
              className={`rounded-sm px-3 py-2 text-sm transition-colors ${
                activeType === 'gallery'
                  ? 'day:bg-[#e8dfd0] day:text-[#6f511c] bg-white/10 font-semibold text-[#cfac6c]'
                  : 'day:hover:bg-white hover:bg-white/10'
              }`}
            >
              Gallery
            </Link>
            <Link
              href="/contact"
              aria-current={activeType === 'contact' ? 'page' : undefined}
              className={`rounded-sm px-3 py-2 text-sm transition-colors ${
                activeType === 'contact'
                  ? 'day:bg-[#e8dfd0] day:text-[#6f511c] bg-white/10 font-semibold text-[#cfac6c]'
                  : 'day:hover:bg-white hover:bg-white/10'
              }`}
            >
              Contact
            </Link>
            <Link
              href="/my-account"
              aria-current={activeType === 'my-account' ? 'page' : undefined}
              className={`rounded-sm px-3 py-2 text-sm transition-colors ${
                activeType === 'my-account'
                  ? 'day:bg-[#e8dfd0] day:text-[#6f511c] bg-white/10 font-semibold text-[#cfac6c]'
                  : 'day:hover:bg-white hover:bg-white/10'
              }`}
            >
              My Account
            </Link>
            <Link
              href="/select-product"
              className="day:bg-[#1d1a17] day:text-white mt-1 rounded-sm bg-[#cfac6c] px-3 py-2 text-center text-sm font-semibold text-[#17120a] transition-colors hover:bg-[#e4c988]"
            >
              Start Designing
            </Link>
          </nav>
        </details>
      </div>

      <MemorialCategoryNav />
    </header>
  );
}
