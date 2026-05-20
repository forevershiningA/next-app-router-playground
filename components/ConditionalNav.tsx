'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { GlobalNav } from '#/ui/global-nav';
import DesignsTreeNav from '#/components/DesignsTreeNav';
import DesignerNav from '#/components/DesignerNav';
import AccountNav from '#/components/AccountNav';
import { type DemoCategory } from '#/lib/db';
import clsx from 'clsx';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function ConditionalNav({ items }: { items: DemoCategory[] }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const handler = () => {
      if (typeof window === 'undefined') {
        return;
      }
      if (window.innerWidth >= 768) {
        return;
      }
      setIsMobileMenuOpen((prev) => !prev);
    };
    window.addEventListener('toggle-sidebar', handler);
    return () => window.removeEventListener('toggle-sidebar', handler);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') {
        return;
      }
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsMobileMenuOpen(false), 0);
    return () => window.clearTimeout(timeout);
  }, [pathname]);

  // Check session when on account routes so we can show the right sidebar
  const accountRoutePrefixes = [
    '/my-account',
    '/orders',
    '/account',
    '/privacy',
  ];
  const isAccountRoute = accountRoutePrefixes.some((prefix) =>
    pathname ? pathname.startsWith(prefix) : false,
  );

  useEffect(() => {
    if (!isAccountRoute) return;
    fetch('/api/auth/session')
      .then((r) => setIsLoggedIn(r.ok))
      .catch(() => setIsLoggedIn(false));
  }, [isAccountRoute, pathname]);

  // Re-check session when the page fires a custom 'session-changed' event
  useEffect(() => {
    const handler = () => {
      fetch('/api/auth/session')
        .then((r) => setIsLoggedIn(r.ok))
        .catch(() => setIsLoggedIn(false));
    };
    window.addEventListener('session-changed', handler);
    return () => window.removeEventListener('session-changed', handler);
  }, []);

  // Check if we're on /designs route
  const isDesignsRoute = pathname?.startsWith('/designs');
  const isAdminRoute = pathname?.startsWith('/admin');

  // Check if we're on homepage or other designer pages
  const isDesignerRoute =
    pathname === '/' ||
    pathname?.startsWith('/select-') ||
    pathname?.startsWith('/inscriptions') ||
    pathname?.startsWith('/check-price') ||
    pathname === '/design-menu';

  if (isAdminRoute) {
    return null;
  }

  if (isDesignsRoute) {
    return (
      <div
        className="fixed top-0 left-0 z-10 flex hidden h-full flex-col border-r border-gray-800 md:block"
        style={{ width: '400px' }}
      >
        <DesignsTreeNav />
      </div>
    );
  }

  if (isAccountRoute) {
    // Show AccountNav only when logged in; show DesignerNav while logged out
    if (isLoggedIn === true) return <AccountNav />;
    // While checking (null) or not logged in → designer sidebar
    return renderDesignerSidebar(isMobileMenuOpen, setIsMobileMenuOpen);
  }

  if (isDesignerRoute) {
    if (pathname === '/') return null;
    return renderDesignerSidebar(isMobileMenuOpen, setIsMobileMenuOpen);
  }

  return <GlobalNav items={items} />;
}

function renderDesignerSidebar(
  isMobileMenuOpen: boolean,
  setIsMobileMenuOpen: (v: boolean) => void,
) {
  return (
    <>
      <div
        className={clsx(
          'fixed inset-0 z-30 bg-black/70 backdrop-blur-sm transition-opacity duration-300 md:hidden',
          isMobileMenuOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0',
        )}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />
      <div
        className={clsx(
          'fixed top-0 left-0 z-40 h-full w-[80%] max-w-sm transform bg-[#1b1511] shadow-2xl transition-transform duration-300 md:pointer-events-auto md:z-10 md:flex md:w-[400px] md:max-w-none md:translate-x-0 md:flex-col md:border-r md:border-gray-800 md:bg-transparent md:opacity-100 md:shadow-none',
          isMobileMenuOpen
            ? 'pointer-events-auto translate-x-0 opacity-100'
            : 'pointer-events-none -translate-x-full opacity-0',
        )}
      >
        <div className="relative h-full">
          <DesignerNav />
          <button
            type="button"
            className="absolute top-4 right-4 text-white transition-opacity hover:text-white/80 md:hidden"
            aria-label="Close navigation"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </>
  );
}
