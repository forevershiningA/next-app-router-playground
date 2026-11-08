'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const MEMORIAL_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Headstones', href: '/memorials/headstones' },
  { label: 'Plaques', href: '/memorials/plaques' },
  { label: 'Full Monuments', href: '/memorials/full-monuments' },
  { label: 'Urns', href: '/memorials/urns' },
  { label: 'Pet Memorials', href: '/memorials/pet-memorials' },
  { label: 'Gallery', href: '/memorials/gallery' },
  { label: 'Contact', href: '/contact' },
  { label: 'My Account', href: '/my-account' },
] as const;

export default function MemorialCategoryNav({
  className = '',
}: {
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Memorial categories"
      className={`hidden border-y border-white/10 bg-[#121110] transition-colors day:border-[#cfc5b7]/80 day:bg-[#e7e1d5] xl:block ${className}`}
    >
      <div className="mx-auto flex h-11 max-w-7xl items-center justify-center gap-8 px-8 2xl:gap-9">
        {MEMORIAL_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={
              pathname === link.href ||
              (link.href === '/my-account' && pathname?.startsWith('/my-account'))
                ? 'page'
                : undefined
            }
            className="relative flex h-full items-center text-[15px] font-medium tracking-[0.01em] text-white/70 transition-colors after:absolute after:right-0 after:bottom-2.5 after:left-0 after:h-px after:origin-center after:scale-x-0 after:bg-[#cfac6c] after:transition-transform hover:text-[#cfac6c] hover:after:scale-x-100 focus-visible:text-[#cfac6c] focus-visible:outline-none focus-visible:after:scale-x-100 aria-[current=page]:text-[#cfac6c] aria-[current=page]:after:scale-x-100 day:text-[#514a43] day:after:bg-[#8a651f] day:hover:text-[#6f511c] day:aria-[current=page]:text-[#6f511c]"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
