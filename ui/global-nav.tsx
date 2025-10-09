'use client';

import { type Demo, type DemoCategory } from '#/lib/db';
import { LinkStatus } from '#/ui/link-status';
import { NextLogoDark } from '#/ui/logo-next';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { calculatePrice } from '#/lib/xml-parser';

export function GlobalNav({ items }: { items: DemoCategory[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const close = () => setIsOpen(false);

  useEffect(() => {
    const handler = () => setIsSidebarOpen((s) => !s);
    window.addEventListener('toggle-sidebar', handler);
    return () => window.removeEventListener('toggle-sidebar', handler);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebar-open');
      if (saved !== null) {
        setIsSidebarOpen(saved === 'true');
      } else if (typeof window !== 'undefined') {
        setIsSidebarOpen(window.innerWidth >= 1024);
      }
    } catch (error) {
      // Fallback if localStorage is not available
      if (typeof window !== 'undefined') {
        setIsSidebarOpen(window.innerWidth >= 1024);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar-open', isSidebarOpen.toString());
  }, [isSidebarOpen]);

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
    <div
      className={clsx(
        'fixed top-0 z-10 flex w-full flex-col border-b border-gray-800 bg-black lg:bottom-0 lg:z-auto lg:w-72 lg:border-r lg:border-b-0 lg:border-gray-800',
        !isSidebarOpen && 'hidden',
      )}
    >
      <div className="flex h-14 items-center px-4 py-4 lg:h-auto">
        <Link
          href="/"
          className="group flex w-full flex-col gap-1"
          onClick={close}
        >
          <h2 className="text-lg font-medium text-gray-200 group-hover:text-white">
            Design Your Own Traditional Engraved Headstone
          </h2>
          <h3 className="text-sm font-normal text-gray-400">
            Current size: {widthMm} x {heightMm} mm
          </h3>
          <div className="flex gap-1 text-sm font-normal text-gray-400">
            <div>Current Price:</div>
            <div className="text-white">${price.toFixed(2)}</div>
          </div>
        </Link>
      </div>
      <button
        type="button"
        className="group absolute top-0 right-0 flex h-14 items-center gap-x-2 px-4 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="font-medium text-gray-100 group-hover:text-gray-400">
          Menu
        </div>
        {isOpen ? (
          <XMarkIcon className="block w-6 text-gray-400" />
        ) : (
          <Bars3Icon className="block w-6 text-gray-400" />
        )}
      </button>

      <div
        className={clsx('overflow-y-auto lg:static lg:block', {
          'fixed inset-x-0 top-14 bottom-0 mt-px bg-black': isOpen,
          hidden: !isOpen,
        })}
      >
        <nav className="space-y-6 px-2 pt-5 pb-24">
          {items && items.length > 0 ? (
            items.map((section) => {
              return (
                <div key={section.name}>
                  <div className="mb-2 px-3 font-mono text-xs font-semibold tracking-wide text-gray-600 uppercase">
                    <div>{section.name}</div>
                  </div>

                  <div className="flex flex-col gap-1">
                    {section.items.map((item) => (
                      <DynamicNavItem
                        key={item.slug}
                        item={item}
                        close={close}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-3 py-2 text-sm text-gray-400">
              No navigation items available
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}

function DynamicNavItem({
  item,
  close,
}: {
  item: Demo;
  close: () => false | void;
}) {
  const segment = useSelectedLayoutSegment();
  const isActive = item.slug === segment;

  return <NavItem item={item} close={close} isActive={isActive} />;
}

function NavItem({
  item,
  close,
  isActive,
}: {
  item: Demo;
  close: () => false | void;
  isActive?: boolean;
}) {
  return (
    <Link
      onClick={close}
      href={`/${item.slug}`}
      className={clsx(
        'flex justify-between rounded-md px-3 py-2 text-sm font-medium hover:text-gray-300',
        {
          'text-gray-400 hover:bg-gray-800': !isActive,
          'text-white': isActive,
        },
      )}
    >
      {item.nav_title || item.name}
      <LinkStatus />
    </Link>
  );
}
