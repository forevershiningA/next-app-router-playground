'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { GlobalNav } from '#/ui/global-nav';
import DesignsTreeNav from '#/components/DesignsTreeNav';
import DesignerNav from '#/components/DesignerNav';
import AccountNav from '#/components/AccountNav';
import { type DemoCategory } from '#/lib/db';
import { isDesignerRoutePath, getDesignerStepSlug } from '#/lib/designer-route-state';
import { useMobileNavStore } from '#/lib/mobile-nav-store';
import clsx from 'clsx';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

// Designer steps whose primary UI renders *inside* the left drawer (canvas is
// visible beside them on desktop). Navigating between these on mobile keeps the
// drawer open so the user can move through options (Menu, Prev/Next, panel
// switches) without reopening it. Full-page/overlay steps (select-product,
// select-shape, check-price) are intentionally excluded so the drawer closes
// and reveals their content.
const DRAWER_PANEL_SLUGS = new Set<string>([
  'design-menu',
  'select-size',
  'select-material',
  'select-border',
  'inscriptions',
  'select-motifs',
  'select-additions',
  'select-images',
  'select-emblems',
]);

const DRAWER_PANEL_TITLES: Record<string, string> = {
  'design-menu': 'Menu',
  'select-size': 'Select Size',
  'select-material': 'Select Material',
  'select-border': 'Select Border',
  inscriptions: 'Inscriptions',
  'select-motifs': 'Select Motifs',
  'select-additions': 'Additions',
  'select-images': 'Images',
  'select-emblems': 'Select Emblems',
};

export default function ConditionalNav({ items }: { items: DemoCategory[] }) {
  const pathname = usePathname();
  const isMobileMenuOpen = useMobileNavStore((s) => s.isOpen);
  const setIsMobileMenuOpen = useMobileNavStore((s) => s.setOpen);
  const toggleMobileMenu = useMobileNavStore((s) => s.toggle);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // Whether the current step is an editing sub-panel (canvas must stay visible
  // beside/above it). The main menu (design-menu) and non-step routes open as a
  // full-height drawer instead of a canvas-revealing bottom sheet.
  const designerStepSlug = getDesignerStepSlug(pathname);
  const useBottomSheet =
    designerStepSlug != null &&
    designerStepSlug !== 'design-menu' &&
    DRAWER_PANEL_SLUGS.has(designerStepSlug);
  const mobileSheetTitle =
    designerStepSlug != null
      ? (DRAWER_PANEL_TITLES[designerStepSlug] ?? 'Designer')
      : 'Designer';

  useEffect(() => {
    const handler = () => {
      if (typeof window === 'undefined') {
        return;
      }
      if (window.innerWidth >= 768) {
        return;
      }
      toggleMobileMenu();
    };
    window.addEventListener('toggle-sidebar', handler);
    return () => window.removeEventListener('toggle-sidebar', handler);
  }, [toggleMobileMenu]);

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
    // Keep the mobile drawer open while navigating between in-drawer designer
    // steps (e.g. "Menu" -> design-menu, or picking another option). Close it
    // for any other destination so full-page/overlay content is revealed.
    if (DRAWER_PANEL_SLUGS.has(getDesignerStepSlug(pathname) ?? '')) {
      return;
    }
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
  const designRouteParts = pathname?.split('/').filter(Boolean) ?? [];
  const isSeoDesignsListingRoute =
    designRouteParts[0] === 'designs' && designRouteParts.length <= 3;
  const isMemorialsRoute = pathname?.startsWith('/memorials');
  const isAdminRoute = pathname?.startsWith('/admin');

  // Check if we're on homepage or other designer pages
  const isDesignerRoute = isDesignerRoutePath(pathname);

  const isDesignShareRoute = pathname?.startsWith('/design/');

  if (isAdminRoute || isDesignShareRoute || isMemorialsRoute || isSeoDesignsListingRoute) {
    return null;
  }

  if (isDesignsRoute) {
    return (
      <div
        className="fixed top-0 left-0 z-10 flex hidden h-full flex-col border-r border-slate-200 md:block"
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
    return renderDesignerSidebar(
      isMobileMenuOpen,
      setIsMobileMenuOpen,
      useBottomSheet,
      mobileSheetTitle,
    );
  }

  if (isDesignerRoute) {
    if (pathname === '/') return null;
    return renderDesignerSidebar(
      isMobileMenuOpen,
      setIsMobileMenuOpen,
      useBottomSheet,
      mobileSheetTitle,
    );
  }

  return <GlobalNav items={items} />;
}

function renderDesignerSidebar(
  isMobileMenuOpen: boolean,
  setIsMobileMenuOpen: (v: boolean) => void,
  useBottomSheet: boolean,
  mobileSheetTitle: string,
) {
  // Main menu / non-step routes open as a full-height drawer (no canvas to
  // reveal). Editing sub-panels use a compact, canvas-revealing bottom sheet
  // so the product stays visible while controls scroll inside the sheet.
  const sheetHeightClass = useBottomSheet
    ? 'h-[36dvh] max-h-[36dvh]'
    : 'h-[100dvh]';
  return (
    <>
      {/* Mobile hamburger — always available to open the designer sidebar on
          mobile, regardless of the current step or catalog-load state.
          Hidden at md+ where the sidebar is permanently visible. */}
      {!isMobileMenuOpen && (
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open navigation"
          aria-expanded={false}
          className="fixed top-7 left-4 z-[10000] flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#3a2a1c] bg-[#1a1208] text-white shadow-none outline-none ring-0 transition-colors hover:border-[#D4A84F]/55 hover:bg-[#21160d] focus-visible:border-[#D4A84F] focus-visible:ring-2 focus-visible:ring-[#D4A84F]/35 md:hidden"
        >
          <Bars3Icon className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
      {/* No full-screen backdrop on mobile: the bottom sheet must leave the 3D
          canvas above it interactive (orbit/tap) while editing. Close via the
          sheet's ✕. */}
      <div
        className={clsx(
          // Mobile: bottom sheet docked to the bottom edge so the 3D product
          // stays visible above it (editing sub-panels), or a full-height drawer
          // for the main menu. Desktop (md+): permanent left column.
          'fixed inset-x-0 bottom-0 z-40 flex w-full flex-col overflow-hidden rounded-t-lg bg-[#1b1511] shadow-2xl transition-all duration-300 md:inset-auto md:top-0 md:left-0 md:z-10 md:h-full md:max-h-none md:w-[400px] md:translate-y-0 md:rounded-none md:border-r md:border-slate-200 md:bg-white md:pointer-events-auto md:shadow-none',
          isMobileMenuOpen
            ? 'pointer-events-auto translate-y-0'
            : 'pointer-events-none translate-y-full',
          sheetHeightClass,
        )}
      >
        {/* Sheet top bar (mobile only). */}
        <div className="day:bg-[#ece7de] flex-none rounded-t-lg bg-[#1b1511] md:hidden">
          <div className="flex min-h-9 items-center justify-between gap-3 px-4 pt-1.5 pb-0.5">
            <p className="day:text-gray-800 min-w-0 truncate text-sm font-semibold tracking-wide text-white/85">
              {mobileSheetTitle}
            </p>
            <button
              type="button"
              className="day:text-black/50 day:hover:text-black flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:text-white"
              aria-label="Close navigation"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <DesignerNav />
        </div>
      </div>
    </>
  );
}
