'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ComponentType } from 'react';
import {
  Bars3Icon,
  SparklesIcon,
  BookmarkSquareIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  DocumentDuplicateIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { useMobileNavStore } from '#/lib/mobile-nav-store';

const accountLinks = [
  {
    label: 'Saved Designs',
    href: '/my-account',
    icon: BookmarkSquareIcon,
    description: 'Review proofs and approvals',
    meta: 'Active proofs: 4',
  },
  {
    label: 'Your Orders',
    href: '/orders',
    icon: ShoppingBagIcon,
    description: 'Track production milestones',
    meta: 'Next fabrication slot: Mar 12',
  },
  {
    label: 'Account Details',
    href: '/my-account/details',
    icon: UserCircleIcon,
    description: 'Manage contact & billing info',
  },
  {
    label: 'Invoice Details',
    href: '/my-account/invoice',
    icon: DocumentDuplicateIcon,
    description: 'Download statements & receipts',
  },
  {
    label: 'Privacy Policy',
    href: '/privacy',
    icon: ShieldCheckIcon,
    description: 'See how your data is handled',
  },
  {
    label: 'Back to Designer',
    href: '/design-menu',
    icon: ArrowLeftIcon,
    description: 'Return to the design studio',
  },
];

export default function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const resetDesign = useHeadstoneStore((s) => s.resetDesign);
  const isMobileMenuOpen = useMobileNavStore((s) => s.isOpen);
  const setIsMobileMenuOpen = useMobileNavStore((s) => s.setOpen);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  useEffect(() => {
    const loadSessionEmail = async () => {
      try {
        const response = await fetch('/api/auth/session', { cache: 'no-store' });
        if (!response.ok) {
          setSessionEmail(null);
          return;
        }
        const data = await response.json();
        setSessionEmail(data?.session?.email ?? null);
      } catch (error) {
        console.error('Failed to fetch session email:', error);
        setSessionEmail(null);
      }
    };

    void loadSessionEmail();

    const handleSessionChanged = () => {
      void loadSessionEmail();
    };

    window.addEventListener('session-changed', handleSessionChanged);
    return () => window.removeEventListener('session-changed', handleSessionChanged);
  }, []);

  function handleNewDesign() {
    setIsMobileMenuOpen(false);
    resetDesign();
    router.push('/select-size');
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    // Dispatch session-changed so the page and sidebar update immediately.
    // router.push is intentionally omitted — we're already on /my-account and
    // navigating away then back would skip the event listener.
    setIsMobileMenuOpen(false);
    window.dispatchEvent(new Event('session-changed'));
  }

  return (
    <>
      {!isMobileMenuOpen && (
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open account menu"
          aria-expanded={false}
          className="fixed top-7 left-4 z-[10000] flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#3a2a1c] bg-[#1a1208] text-white shadow-none outline-none ring-0 transition-colors hover:border-[#D4A84F]/55 hover:bg-[#21160d] focus-visible:border-[#D4A84F] focus-visible:ring-2 focus-visible:ring-[#D4A84F]/35 lg:hidden"
        >
          <Bars3Icon className="h-5 w-5" aria-hidden="true" />
        </button>
      )}

      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Close account menu backdrop"
          className="fixed inset-0 z-[9998] bg-black/55 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-[9999] flex h-full w-[min(88vw,400px)] flex-col border-r border-[#3f2a1b]/80 day:border-stone-200 bg-[#120804] day:bg-stone-50 text-white day:text-gray-900 shadow-[0_45px_120px_rgba(0,0,0,0.85)] transition-transform duration-300 lg:z-20 lg:w-[400px] lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >

      <div className="flex flex-1 flex-col bg-gradient-to-br from-[#3d2817] via-[#2a1f14] to-[#1a1410] day:from-stone-50 day:via-stone-50 day:to-stone-100">

        {/* Desktop Header */}
        <div className="hidden items-center justify-between border-b border-white/10 day:border-gray-200 px-6 lg:flex">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img src="/ico/forever-transparent-logo.png" alt="Forever Logo" />
          </Link>
        </div>

        {/* Mobile Header */}
        <div className="border-b border-white/5 day:border-gray-200 bg-[#120c08]/95 day:bg-stone-50 px-5 py-4 shadow-[0_10px_25px_rgba(0,0,0,0.45)] lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[10px] uppercase tracking-[0.45em] text-white/50 day:text-gray-400">Guided Studio</p>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:text-white day:text-gray-500 day:hover:text-gray-900"
              aria-label="Close account menu"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav aria-label="Account menu" className="flex-1 overflow-y-auto px-5 py-6">
          <p className="text-[12px] uppercase tracking-[0.4em] text-white/40 day:text-gray-400">Account menu</p>
          <div className="mt-4 space-y-3">
            {/* New Design — special button that resets design state */}
            <button
              onClick={handleNewDesign}
              className="w-full flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-base font-light transition-all border border-white/12 day:border-gray-200 text-white/75 day:text-gray-700 hover:border-white/30 day:hover:border-gray-400 hover:bg-white/5 day:hover:bg-gray-100"
            >
              <div className="flex items-center gap-4">
                <SparklesIcon className="h-5 w-5" />
                <div className="flex-1">
                  <p className="text-[16px] text-white/45 day:text-gray-600">New Design</p>
                </div>
              </div>
            </button>
            {accountLinks.map((link) => (
              <AccountNavLink
                key={link.label}
                {...link}
                isActive={pathname === link.href}
                onNavigate={() => setIsMobileMenuOpen(false)}
              />
            ))}
            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex w-full cursor-pointer items-center gap-4 rounded-lg px-4 py-3 text-base font-light text-white/65 transition-all hover:bg-red-400/5 hover:text-red-300 day:text-gray-600 day:hover:bg-red-50 day:hover:text-red-600"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span className="text-[16px]">Logout</span>
            </button>
          </div>
          <div className="mt-8 rounded-2xl border border-white/12 day:border-gray-200 bg-white/5 day:bg-white px-4 py-4 text-sm text-white/75 day:text-gray-700 shadow-[0_2px_4px_rgba(0,0,0,0.5)] day:shadow-sm">
            <p className="text-[12px] uppercase tracking-[0.4em] text-white/45 day:text-gray-400">Signed in as</p>
            <p className="mt-2 text-lg font-semibold text-white day:text-gray-900">
              {sessionEmail ?? 'Loading...'}
            </p>
          </div>
        </nav>
      </div>
      <div className="border-t border-white/8 day:border-gray-200 px-6 py-5 text-sm text-white/70 day:text-gray-600">
        Need assistance?{' '}
        <a href="mailto:support@forevershining.com" className="text-amber-200 day:text-amber-700 hover:text-white day:hover:text-amber-900">
          Email support
        </a>
      </div>
    </aside>
    </>
  );
}

function AccountNavLink({
  label,
  href,
  description,
  icon: Icon,
  meta,
  isActive,
  onNavigate,
}: AccountNavLinkProps) {
  const cardClasses = isActive
    ? 'bg-white/12 day:bg-amber-50 text-white day:text-gray-900'
    : 'text-white/65 day:text-gray-600 hover:bg-white/5 hover:text-white day:hover:bg-gray-100 day:hover:text-gray-900';

  const iconClasses = isActive
    ? 'text-[#f3d48f] day:text-amber-700'
    : 'text-white/55 day:text-gray-500';

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      onClick={onNavigate}
      className={`relative flex cursor-pointer items-center gap-4 rounded-lg px-4 py-3 text-base font-light transition-all ${cardClasses}`}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-[#D4A84F]" />
      )}
      <Icon className={`h-5 w-5 ${iconClasses}`} />
      <span className="text-[16px]">{label}</span>
    </Link>
  );
}

type AccountNavLinkProps = {
  label: string;
  href: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  meta?: string;
  isActive: boolean;
  onNavigate?: () => void;
};
