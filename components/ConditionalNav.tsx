'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { GlobalNav } from '#/ui/global-nav';
import DesignsTreeNav from '#/components/DesignsTreeNav';
import DesignerNav from '#/components/DesignerNav';
import AccountNav from '#/components/AccountNav';
import { type DemoCategory } from '#/lib/db';
import {
  isDesignerRoutePath,
  getDesignerStepSlug,
} from '#/lib/designer-route-state';
import { useMobileNavStore } from '#/lib/mobile-nav-store';
import { useHeadstoneStore } from '#/lib/headstone-store';
import clsx from 'clsx';
import { Bars3Icon } from '@heroicons/react/24/outline';

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
  'select-fastening',
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
  'select-fastening': 'Fastening Type',
  inscriptions: 'Inscriptions',
  'select-motifs': 'Select Motifs',
  'select-additions': 'Additions',
  'select-images': 'Images',
  'select-emblems': 'Select Emblems',
};

export default function ConditionalNav({ items }: { items: DemoCategory[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const isMobileMenuOpen = useMobileNavStore((s) => s.isOpen);
  const setIsMobileMenuOpen = useMobileNavStore((s) => s.setOpen);
  const pendingMobilePanel = useMobileNavStore((s) => s.pendingPanel);
  const setPendingMobilePanel = useMobileNavStore((s) => s.setPendingPanel);
  const toggleMobileMenu = useMobileNavStore((s) => s.toggle);
  const isSizeAdjustmentCompact = useMobileNavStore(
    (s) => s.isSizeAdjustmentCompact,
  );
  const setSizeAdjustmentCompact = useMobileNavStore(
    (s) => s.setSizeAdjustmentCompact,
  );
  const isBottomSheetCollapsed = useMobileNavStore(
    (s) => s.isBottomSheetCollapsed,
  );
  const setBottomSheetCollapsed = useMobileNavStore(
    (s) => s.setBottomSheetCollapsed,
  );
  const productId = useHeadstoneStore((s) => s.productId);
  const isImageCropActive = useHeadstoneStore((s) => Boolean(s.cropCanvasData));
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // Whether the current step is an editing sub-panel (canvas must stay visible
  // beside/above it). The main menu (design-menu) and non-step routes open as a
  // full-height drawer instead of a canvas-revealing bottom sheet.
  const designerStepSlug = getDesignerStepSlug(pathname);
  const useBottomSheet =
    designerStepSlug != null &&
    designerStepSlug !== 'design-menu' &&
    DRAWER_PANEL_SLUGS.has(designerStepSlug);
  const closeMobileDesignerMenu = () => {
    if (designerStepSlug === 'design-menu') {
      const returnPath = sessionStorage.getItem('designer:return-from-menu');
      if (returnPath && getDesignerStepSlug(returnPath) !== 'design-menu') {
        sessionStorage.removeItem('designer:return-from-menu');
        setIsMobileMenuOpen(true);
        router.replace(returnPath);
        return;
      }
    }
    setIsMobileMenuOpen(false);
  };
  const mobileSheetTitle =
    designerStepSlug === 'select-images' && isImageCropActive
      ? 'Image Crop Section'
      : designerStepSlug === 'select-material' && productId === '5'
        ? 'Select Background'
      : designerStepSlug != null
        ? (DRAWER_PANEL_TITLES[designerStepSlug] ?? 'Designer')
        : 'Designer';
  const isFixedSizeSheet = designerStepSlug === 'select-size';
  useEffect(() => {
    if (designerStepSlug !== 'select-size') {
      setSizeAdjustmentCompact(false);
    }
  }, [designerStepSlug, setSizeAdjustmentCompact]);
  useEffect(() => {
    setBottomSheetCollapsed(false);
  }, [designerStepSlug, setBottomSheetCollapsed]);
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
        setSizeAdjustmentCompact(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobileMenuOpen, setSizeAdjustmentCompact]);

  useEffect(() => {
    if (!useBottomSheet || typeof window === 'undefined') {
      return;
    }

    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(true);
    }
  }, [useBottomSheet, designerStepSlug, setIsMobileMenuOpen]);

  useEffect(() => {
    if (
      !pendingMobilePanel ||
      pendingMobilePanel !== designerStepSlug ||
      typeof window === 'undefined' ||
      window.innerWidth >= 768
    ) {
      return;
    }

    setIsMobileMenuOpen(true);
    setPendingMobilePanel(null);
  }, [
    designerStepSlug,
    pendingMobilePanel,
    setIsMobileMenuOpen,
    setPendingMobilePanel,
  ]);

  useEffect(() => {
    // Keep the mobile drawer open while navigating between in-drawer designer
    // steps (e.g. "Menu" -> design-menu, or picking another option). Close it
    // for any other destination so full-page/overlay content is revealed.
    if (DRAWER_PANEL_SLUGS.has(getDesignerStepSlug(pathname) ?? '')) {
      return;
    }
    const timeout = window.setTimeout(() => setIsMobileMenuOpen(false), 0);
    return () => window.clearTimeout(timeout);
  }, [pathname, setIsMobileMenuOpen]);

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

  if (
    isAdminRoute ||
    isDesignShareRoute ||
    isMemorialsRoute ||
    isSeoDesignsListingRoute
  ) {
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
      isFixedSizeSheet,
      isSizeAdjustmentCompact,
      setSizeAdjustmentCompact,
      isBottomSheetCollapsed,
      setBottomSheetCollapsed,
      closeMobileDesignerMenu,
    );
  }

  if (isDesignerRoute) {
    if (pathname === '/') return null;
    return renderDesignerSidebar(
      isMobileMenuOpen,
      setIsMobileMenuOpen,
      useBottomSheet,
      mobileSheetTitle,
      isFixedSizeSheet,
      isSizeAdjustmentCompact,
      setSizeAdjustmentCompact,
      isBottomSheetCollapsed,
      setBottomSheetCollapsed,
      closeMobileDesignerMenu,
    );
  }

  return <GlobalNav items={items} />;
}

function renderDesignerSidebar(
  isMobileMenuOpen: boolean,
  setIsMobileMenuOpen: (v: boolean) => void,
  useBottomSheet: boolean,
  mobileSheetTitle: string,
  isFixedSizeSheet: boolean,
  isSizeAdjustmentCompact: boolean,
  setSizeAdjustmentCompact: (v: boolean) => void,
  isBottomSheetCollapsed: boolean,
  setBottomSheetCollapsed: (v: boolean) => void,
  closeMobileDesignerMenu: () => void,
) {
  // Main menu / non-step routes open as a full-height drawer (no canvas to
  // reveal). Editing sub-panels use a compact, canvas-revealing bottom sheet
  // so the product stays visible while controls scroll inside the sheet.
  const sheetHeightClass = useBottomSheet && isBottomSheetCollapsed
    ? 'h-[52px] max-h-[52px]'
    : isFixedSizeSheet && isSizeAdjustmentCompact
    ? 'h-[26dvh] max-h-[26dvh]'
    : useBottomSheet
    ? 'h-[44dvh] max-h-[44dvh]'
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
          className="fixed top-7 left-4 z-[10000] flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#3a2a1c] bg-[#1a1208] text-white shadow-none ring-0 transition-colors outline-none hover:border-[#D4A84F]/55 hover:bg-[#21160d] focus-visible:border-[#D4A84F] focus-visible:ring-2 focus-visible:ring-[#D4A84F]/35 md:hidden"
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
          'fixed inset-x-0 bottom-0 z-40 flex w-full flex-col overflow-hidden rounded-t-3xl bg-[#1b1511] shadow-2xl transition-all duration-300 md:pointer-events-auto md:inset-auto md:top-0 md:left-0 md:z-10 md:h-full md:max-h-none md:w-[400px] md:translate-y-0 md:rounded-none md:border-r md:border-slate-200 md:bg-white md:shadow-none',
          isMobileMenuOpen
            ? 'pointer-events-auto translate-y-0'
            : 'pointer-events-none translate-y-full',
          sheetHeightClass,
        )}
      >
        {/* The compact slider mode deliberately leaves only an expand handle,
            so no header competes with the 3D preview. */}
        {isFixedSizeSheet && isSizeAdjustmentCompact ? (
          <button
            type="button"
            onClick={() => setSizeAdjustmentCompact(false)}
            aria-label="Expand size controls"
            className="mx-auto mt-2 mb-1 block h-4 w-16 flex-none rounded-full p-1.5 md:hidden"
          >
            <span className="block h-1 w-full rounded-full bg-white/35" />
          </button>
        ) : (
          <div className="day:bg-[#ece7de] flex-none rounded-t-lg bg-[#1b1511] md:hidden">
            {isFixedSizeSheet ? (
              <button
                type="button"
                onClick={() => setSizeAdjustmentCompact(true)}
                aria-label="Collapse size controls"
                className="mx-auto mt-2 block h-4 w-16 rounded-full p-1.5"
              >
                <span className="block h-1 w-full rounded-full bg-white/25" />
              </button>
            ) : null}
            {isFixedSizeSheet ? (
              <div className="min-h-9 px-4 pt-1.5 pb-0.5">
                <p className="day:text-gray-800 min-w-0 truncate text-sm font-semibold tracking-wide text-white/85">
                  {mobileSheetTitle}
                </p>
              </div>
            ) : (
              <button
                type="button"
                className="block w-full cursor-pointer text-left"
                aria-expanded={useBottomSheet ? !isBottomSheetCollapsed : undefined}
                aria-label={
                  useBottomSheet
                    ? `${isBottomSheetCollapsed ? 'Expand' : 'Collapse'} ${mobileSheetTitle} panel`
                    : `Close ${mobileSheetTitle}`
                }
                onClick={() =>
                  useBottomSheet
                    ? setBottomSheetCollapsed(!isBottomSheetCollapsed)
                    : closeMobileDesignerMenu()
                }
              >
                <span
                  className="mx-auto mt-2 block h-4 w-16 rounded-full p-1.5"
                  aria-hidden="true"
                >
                  <span className="block h-1 w-full rounded-full bg-white/25" />
                </span>
                <span className="block min-h-9 px-4 pt-1.5 pb-0.5">
                  <span className="day:text-gray-800 block min-w-0 truncate text-sm font-semibold tracking-wide text-white/85">
                    {mobileSheetTitle}
                  </span>
                </span>
              </button>
            )}
          </div>
        )}
        <div
          className={clsx(
            'relative min-h-0 flex-1 overflow-hidden',
            useBottomSheet && isBottomSheetCollapsed && 'hidden md:block',
          )}
        >
          <DesignerNav />
        </div>
      </div>
    </>
  );
}
