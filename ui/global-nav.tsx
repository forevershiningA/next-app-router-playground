'use client';

import React, { type MouseEvent } from 'react';
import { type Demo, type DemoCategory } from '#/lib/db';
import { LinkStatus } from '#/ui/link-status';
import { NextLogoDark } from '#/ui/logo-next';
import { 
  Bars3Icon, 
  XMarkIcon,
  CubeIcon,
  Squares2X2Icon,
  ArrowsPointingOutIcon,
  SwatchIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { Suspense, useState, useEffect, Fragment } from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { calculatePrice } from '#/lib/xml-parser';

// Icon mapping for menu items
const menuIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'select-product': CubeIcon,
  'select-shape': Squares2X2Icon,
  'select-size': ArrowsPointingOutIcon,
  'select-material': SwatchIcon,
  'inscriptions': DocumentTextIcon,
  'select-additions': PlusCircleIcon,
  'select-motifs': SparklesIcon,
  'check-price': CurrencyDollarIcon,
  'designs': LightBulbIcon,
};

export function GlobalNav({ items }: { items: DemoCategory[] }) {
  const [isOpen, setIsOpen] = useState(false); // Start with sidebar closed on mobile
  const segment = useSelectedLayoutSegment();
  const [isDesktop, setIsDesktop] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const activePanel = useHeadstoneStore((s) => s.activePanel);
  
  // Detect if we're on a design page
  const [isDesignPage, setIsDesignPage] = useState(false);
  
  useEffect(() => {
    const checkIfDesignPage = () => {
      const path = window.location.pathname;
      setIsDesignPage(path.startsWith('/designs/'));
    };
    
    checkIfDesignPage();
    // Listen for navigation changes
    window.addEventListener('popstate', checkIfDesignPage);
    return () => window.removeEventListener('popstate', checkIfDesignPage);
  }, []);
  
  // Detect desktop and auto-open sidebar on desktop
  useEffect(() => {
    const checkDesktop = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      // Auto-open on desktop
      if (desktop) {
        setIsOpen(true);
      }
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);
  
  const [activeSection, setActiveSection] = useState<string | null>(() => {
    // Initialize with current segment if it exists
    return segment || null;
  });
  
  const [showAllSections, setShowAllSections] = useState(() => {
    // If we have a segment, show only that section, otherwise show all
    return !segment;
  });
  
  const close = () => setIsOpen(false);

  // Update active section when URL changes and hide loader
  useEffect(() => {
    if (segment) {
      setActiveSection(segment);
      setShowAllSections(false);
      // Hide loader when section is active
      setIsLoading(false);
    }
  }, [segment]);

  // Handle back to menu
  const handleBackToMenu = () => {
    setShowAllSections(true);
    setActiveSection(null);
  };

  // Listen for back-to-menu event from overlay panels
  useEffect(() => {
    const handler = () => {
      handleBackToMenu();
    };
    
    window.addEventListener('back-to-menu', handler);
    return () => window.removeEventListener('back-to-menu', handler);
  }, []);

  // Listen for navigation changes
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<{ slug: string }>;
      const newSlug = customEvent.detail.slug;
      
      // Set active section and hide others
      setActiveSection(newSlug);
      setShowAllSections(false);
    };
    
    window.addEventListener('nav-changed', handler);
    return () => window.removeEventListener('nav-changed', handler);
  }, []);

  // Listen for toggle-sidebar event from MobileHeader
  useEffect(() => {
    const handler = () => setIsOpen((prev) => !prev);
    window.addEventListener('toggle-sidebar', handler);
    return () => window.removeEventListener('toggle-sidebar', handler);
  }, []);

  // Hide/show overlays when mobile nav opens/closes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const overlays = document.querySelectorAll('[data-scene-overlay]');
    const viewToggle = document.querySelector('[data-view-toggle]');
    
    const hideOnMobile = isOpen && window.innerWidth < 1024; // lg breakpoint is 1024px
    
    overlays.forEach((overlay) => {
      if (overlay instanceof HTMLElement) {
        overlay.style.display = hideOnMobile ? 'none' : '';
      }
    });
    
    if (viewToggle instanceof HTMLElement) {
      viewToggle.style.display = hideOnMobile ? 'none' : '';
    }
  }, [isOpen]);

  const catalog = useHeadstoneStore((s) => s.catalog);
  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const heightMm = useHeadstoneStore((s) => s.heightMm);

  let quantity = widthMm * heightMm; // default to area
  if (catalog) {
    const qt = catalog.product.priceModel.quantityType;
    if (qt === 'Width + Height') {
      quantity = widthMm + heightMm;
    }
  }
  const price = catalog
    ? calculatePrice(catalog.product.priceModel, quantity)
    : 0;

  return (
    <>
      {/* Sidebar - positioned at top */}
      <div
        className={clsx(
          'fixed top-0 z-10 flex w-full flex-col border-b border-gray-800 bg-black lg:bottom-[30px] lg:z-auto lg:w-[400px] lg:border-r lg:border-b-0 lg:border-gray-800'
        )}
      >
        {/* Loader overlay - show when loading a section, positioned only in sidebar */}
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 animate-spin rounded-full border-[6px] border-white/30 border-t-white" />
              <div className="font-mono text-sm text-white">Loading section...</div>
            </div>
          </div>
        )}

        {/* Hamburger menu button - left side on mobile */}
        <button
          type="button"
          className="group absolute top-0 left-0 flex h-14 items-center gap-x-2 px-4 lg:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <XMarkIcon className="block w-6 text-gray-400" />
          ) : (
            <Bars3Icon className="block w-6 text-gray-400" />
          )}
          <div className="font-medium text-gray-100 group-hover:text-gray-400">
            Menu
          </div>
        </button>

        {/* Header info - shown at top of sidebar when catalog is loaded */}
        {catalog && (
          <div className="border-b border-gray-800 bg-black p-4 pl-20 lg:pl-4">
            <h1 className="text-lg font-semibold text-white">
              {catalog.product.name}
              <br />
              {widthMm} x {heightMm} mm (${price.toFixed(2)})
            </h1>
          </div>
        )}

        <div
          className={clsx('overflow-y-auto lg:static lg:h-full', {
            'fixed inset-x-0 top-14 bottom-0 mt-px bg-black': isOpen,
            // Hide nav when a section is active (panel showing) OR when any panel is open (like motif editor)
            hidden: !isOpen || (!showAllSections && activeSection && !isDesignPage) || (activePanel && isDesignPage),
            'lg:block': (showAllSections || !activeSection || isDesignPage) && !activePanel,
          })}
        >
        <nav className="space-y-6 px-2 pb-4 pt-4 lg:pt-2">
          {items.map((section) => {
            return (
              <div key={section.name}>
                <div className="mb-2 px-3 font-mono text-sm font-semibold tracking-wide text-gray-600 uppercase flex items-center justify-between">
                  <div>{section.name}</div>
                  {/* Back to Menu button - show when a section is active (mobile/tablet only) - BUT hide on design pages */}
                  {!showAllSections && activeSection && !isDesignPage && (
                    <button
                      type="button"
                      onClick={handleBackToMenu}
                      className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-gray-700 hover:text-white transition-colors normal-case lg:hidden cursor-pointer"
                    >
                      Back to menu
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  {section.items.map((item) => {
                    // Hide nav links when a section is active (showing panel) - BUT always show on design pages
                    if (!showAllSections && activeSection && !isDesignPage) {
                      return null;
                    }
                    
                    return (
                      <Fragment key={item.slug}>
                        {/* Nav Item */}
                        <Suspense fallback={<NavItem item={item} close={close} setIsLoading={setIsLoading} />}>
                          <DynamicNavItem item={item} close={close} setIsLoading={setIsLoading} />
                        </Suspense>
                      </Fragment>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>
    </div>
    </>
  );
}

function DynamicNavItem({
  item,
  close,
  setIsLoading,
}: {
  item: Demo;
  close: () => false | void;
  setIsLoading: (loading: boolean) => void;
}) {
  const segment = useSelectedLayoutSegment();
  const isActive = item.slug === segment;

  return <NavItem item={item} close={close} isActive={isActive} slug={item.slug} setIsLoading={setIsLoading} />;
}

function NavItem({
  item,
  close,
  isActive,
  slug,
  setIsLoading,
}: {
  item: Demo;
  close: () => false | void;
  isActive?: boolean;
  slug?: string;
  setIsLoading?: (loading: boolean) => void;
}) {
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);
  
  // Get the icon component for this menu item
  const IconComponent = slug ? menuIcons[slug] : null;

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Special handling for check-price: open panel directly without navigation
    if (slug === 'check-price') {
      e.preventDefault();
      setActivePanel('checkprice');
      close();
      return;
    }

    // When navigating to a different page, show loader and dispatch custom event
    if (slug && !isActive) {
      if (setIsLoading) {
        setIsLoading(true);
      }
      window.dispatchEvent(new CustomEvent('nav-changed', { detail: { slug } }));
      
      // Close menu after a short delay
      setTimeout(() => {
        close();
      }, 300);
    } else {
      close();
    }
  };

  return (
    <Link
      onClick={handleClick}
      href={`/${item.slug}`}
      className={clsx(
        'flex items-center justify-between gap-3 rounded-md px-3 py-2 text-base font-medium hover:text-gray-300',
        {
          'text-gray-400 hover:bg-gray-800': !isActive,
          'text-white': isActive,
        },
      )}
    >
      <div className="flex items-center gap-3">
        {IconComponent && <IconComponent className="h-5 w-5 flex-shrink-0" />}
        <span>{item.nav_title || item.name}</span>
      </div>
      <LinkStatus />
    </Link>
  );
}
