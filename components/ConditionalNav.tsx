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
    setIsMobileMenuOpen(false);
  }, [pathname]);
  
  // Check if we're on /designs route
  const isDesignsRoute = pathname?.startsWith('/designs');
  
  // Check if we're on homepage or other designer pages
  const isDesignerRoute = pathname === '/' || 
                         pathname?.startsWith('/select-') || 
                         pathname?.startsWith('/inscriptions') ||
                         pathname?.startsWith('/check-price');
  const accountRoutePrefixes = ['/my-account', '/orders', '/account', '/privacy'];
  const isAccountRoute = accountRoutePrefixes.some((prefix) => (pathname ? pathname.startsWith(prefix) : false));
  
  if (isDesignsRoute) {
    return (
      <div className="hidden md:block fixed top-0 left-0 z-10 flex h-full flex-col border-r border-gray-800" style={{ width: '400px' }}>
        <DesignsTreeNav />
      </div>
    );
  }
  
  if (isAccountRoute) {
    return <AccountNav />;
  }
  
  if (isDesignerRoute) {
    // On homepage, hide the sidebar completely
    if (pathname === '/') {
      return null;
    }
    
    // On other designer pages, show sidebar with mobile toggle support
    return (
      <>
        <div
          className={clsx(
            'fixed inset-0 z-30 bg-black/70 backdrop-blur-sm transition-opacity duration-300 md:hidden',
            isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          )}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
        <div
          className={clsx(
            'fixed top-0 left-0 z-40 h-full w-[80%] max-w-sm transform bg-[#1b1511] shadow-2xl transition-transform duration-300 md:z-10 md:w-[400px] md:max-w-none md:bg-transparent md:shadow-none md:border-r md:border-gray-800 md:flex md:flex-col md:translate-x-0 md:opacity-100 md:pointer-events-auto',
            isMobileMenuOpen
              ? 'translate-x-0 opacity-100 pointer-events-auto'
              : '-translate-x-full opacity-0 pointer-events-none'
          )}
        >
          <div className="relative h-full">
            <DesignerNav />
            <button
              type="button"
              className="absolute right-4 top-4 text-white transition-opacity hover:text-white/80 md:hidden"
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
  
  return <GlobalNav items={items} />;
}
