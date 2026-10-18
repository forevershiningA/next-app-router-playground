import Link from 'next/link';
import { Bars3Icon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
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
  activeType: MemorialTypeSlug | 'gallery' | 'contact';
}) {
  return (
    <header className="relative z-50 border-b border-[#bdb4a6] bg-[#eee9df] text-[#1d1a17]">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="shrink-0 font-serif text-xl leading-none tracking-[-0.015em] text-[#2b2926] transition-colors hover:text-[#7b5a20] sm:text-[1.6875rem]"
          aria-label="Forever Shining home"
        >
          Forever Shining
        </Link>

        <nav
          className="ml-auto hidden items-center gap-2 xl:flex"
          aria-label="Design actions"
        >
          <ThemeToggle inline />
          <Link
            href="/designs"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#bdb4a6] text-[#1d1a17] transition-colors hover:border-[#7b5a20] hover:bg-white/45"
            aria-label="Search memorial designs"
          >
            <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link
            href="/designs"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#bdb4a6] px-4 text-sm font-semibold transition-colors hover:border-[#7b5a20] hover:bg-white/45"
          >
            Browse Designs
          </Link>
        </nav>

        <div className="ml-auto xl:hidden">
          <ThemeToggle inline />
        </div>

        <Link
          href="/select-product"
          className="hidden min-h-11 items-center justify-center rounded-sm bg-[#1d1a17] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#3a332c] md:inline-flex xl:hidden"
        >
          Start Designing
        </Link>

        <details className="relative xl:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-[#bdb4a6] bg-white/20 px-3 py-2 text-sm font-semibold transition-colors hover:border-[#7b5a20] hover:bg-white/45 [&::-webkit-details-marker]:hidden">
            <Bars3Icon className="h-5 w-5" aria-hidden="true" />
            Menu
          </summary>
          <nav
            className="absolute top-full right-0 mt-2 flex w-64 flex-col gap-1 rounded-sm border border-[#cfc5b7] bg-[#f7f4ee] p-2 text-[#1d1a17] shadow-xl"
            aria-label="Memorial product pages"
          >
            <Link
              href="/"
              className="rounded-sm px-3 py-2 text-sm transition-colors hover:bg-white"
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
                  className={`rounded-sm px-3 py-2 text-sm transition-colors ${isActive ? 'bg-[#e8dfd0] font-semibold text-[#6f511c]' : 'hover:bg-white'}`}
                >
                  {memorialTypePages[slug].navLabel}
                </Link>
              );
            })}
            <Link
              href="/memorials/gallery"
              aria-current={activeType === 'gallery' ? 'page' : undefined}
              className={`rounded-sm px-3 py-2 text-sm ${activeType === 'gallery' ? 'bg-[#e8dfd0] font-semibold text-[#6f511c]' : 'hover:bg-white'}`}
            >
              Gallery
            </Link>
            <Link
              href="/contact"
              aria-current={activeType === 'contact' ? 'page' : undefined}
              className={`rounded-sm px-3 py-2 text-sm ${activeType === 'contact' ? 'bg-[#e8dfd0] font-semibold text-[#6f511c]' : 'hover:bg-white'}`}
            >
              Contact
            </Link>
            <Link
              href="/select-product"
              className="mt-1 rounded-sm bg-[#1d1a17] px-3 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-[#3a332c]"
            >
              Start Designing
            </Link>
          </nav>
        </details>
      </div>

      <nav
        className="hidden border-t border-[#cfc5b7]/80 xl:block"
        aria-label="Memorial categories"
      >
        <div className="mx-auto flex h-11 max-w-7xl items-center justify-center gap-9 px-8">
          <Link
            href="/"
            className="relative flex h-full items-center text-[13px] font-medium tracking-[0.01em] text-[#514a43] transition-colors after:absolute after:right-0 after:bottom-0 after:left-0 after:h-px after:origin-center after:scale-x-0 after:bg-[#8a651f] after:transition-transform hover:text-[#6f511c] hover:after:scale-x-100"
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
                className={`relative flex h-full items-center text-[13px] font-medium tracking-[0.01em] transition-colors after:absolute after:right-0 after:bottom-0 after:left-0 after:h-px after:origin-center after:bg-[#8a651f] after:transition-transform ${isActive ? 'text-[#6f511c] after:scale-x-100' : 'text-[#514a43] after:scale-x-0 hover:text-[#6f511c] hover:after:scale-x-100'}`}
              >
                {memorialTypePages[slug].navLabel}
              </Link>
            );
          })}
          <Link
            href="/memorials/gallery"
            aria-current={activeType === 'gallery' ? 'page' : undefined}
            className={`relative flex h-full items-center text-[13px] font-medium ${activeType === 'gallery' ? 'border-b border-[#8a651f] text-[#6f511c]' : 'text-[#514a43] hover:text-[#6f511c]'}`}
          >
            Gallery
          </Link>
          <Link
            href="/contact"
            aria-current={activeType === 'contact' ? 'page' : undefined}
            className={`relative flex h-full items-center text-[13px] font-medium ${activeType === 'contact' ? 'border-b border-[#8a651f] text-[#6f511c]' : 'text-[#514a43] hover:text-[#6f511c]'}`}
          >
            Contact
          </Link>
        </div>
      </nav>
    </header>
  );
}
