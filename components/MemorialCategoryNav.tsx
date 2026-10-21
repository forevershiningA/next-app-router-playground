'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MEMORIAL_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Headstones', href: '/memorials/headstones' },
  { label: 'Plaques', href: '/memorials/plaques' },
  { label: 'Full Monuments', href: '/memorials/full-monuments' },
  { label: 'Urns', href: '/memorials/urns' },
  { label: 'Pet Memorials', href: '/memorials/pet-memorials' },
  { label: 'Gallery', href: '/memorials/gallery' },
  { label: 'Contact', href: '/contact' },
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
      className={`hidden border-y border-[#cfc5b7]/80 bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.4)_25%,rgba(255,255,255,0.4)_75%,transparent)] xl:block ${className}`}
    >
      <div className="mx-auto flex h-11 max-w-7xl items-center justify-center gap-9 px-8">
        {MEMORIAL_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={pathname === link.href ? 'page' : undefined}
            className="relative flex h-full items-center text-[15px] font-medium tracking-[0.01em] text-[#514a43] transition-colors after:absolute after:right-0 after:bottom-2.5 after:left-0 after:h-px after:origin-center after:scale-x-0 after:bg-[#8a651f] after:transition-transform hover:text-[#6f511c] hover:after:scale-x-100 focus-visible:text-[#6f511c] focus-visible:outline-none focus-visible:after:scale-x-100 aria-[current=page]:text-[#6f511c] aria-[current=page]:after:scale-x-100"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
