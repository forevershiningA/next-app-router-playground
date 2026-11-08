'use client';

import Link from 'next/link';
import Image from 'next/image';
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
  MoonIcon,
  SunIcon,
} from '@heroicons/react/24/outline';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { useMobileNavStore } from '#/lib/mobile-nav-store';
import { getDesignerProductStepHref } from '#/lib/designer-product-routes';
import { useTheme } from '#/components/theme/ThemeProvider';

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
  const productId = useHeadstoneStore((s) => s.productId);
  const isMobileMenuOpen = useMobileNavStore((s) => s.isOpen);
  const setIsMobileMenuOpen = useMobileNavStore((s) => s.setOpen);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();
  const isDayTheme = theme === 'day';

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
    const selectSizeHref = getDesignerProductStepHref('select-size', productId);
    resetDesign();
    router.push(selectSizeHref);
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
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
          className="fixed top-7 left-4 z-[10000] flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border border-white/15 bg-[#161412] text-white shadow-sm transition-colors hover:border-[#c49a45] hover:text-[#c49a45] day:border-[#dfd7ca] day:bg-white day:text-[#5a5248] lg:hidden"
        >
          <Bars3Icon className="h-5 w-5" aria-hidden="true" />
        </button>
      )}

      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Close account menu backdrop"
          className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-[9999] flex h-full w-[min(88vw,400px)] flex-col border-r border-white/10 bg-[#161412] text-white shadow-2xl transition-transform duration-300 day:border-[#dfd7ca] day:bg-[#f5f1e8] day:text-[#1a1714] lg:z-20 lg:w-[400px] lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Desktop Header */}
          <div className="hidden h-36 shrink-0 items-center justify-between px-6 lg:flex">
            <Link
              href="/"
              className="transition-opacity hover:opacity-85"
              aria-label="Forever Shining home"
            >
              <Image
                src="/ico/forever-transparent-logo-bw.png"
                alt="Forever Shining — Design Online"
                width={400}
                height={246}
                className="h-28 w-auto object-contain"
                priority
              />
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                isDayTheme ? 'Switch to night mode' : 'Switch to day mode'
              }
              title={isDayTheme ? 'Night mode' : 'Day mode'}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] text-white/75 shadow-sm transition-all hover:border-[#c49a45] hover:text-[#c49a45] day:border-[#dfd7ca] day:bg-white day:text-[#5a5248] day:hover:border-[#9a742f] day:hover:text-[#9a742f]"
            >
              {isDayTheme ? (
                <MoonIcon className="h-5 w-5" aria-hidden="true" />
              ) : (
                <SunIcon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Mobile Header */}
          <div className="px-5 py-4 lg:hidden">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={
                    isDayTheme ? 'Switch to night mode' : 'Switch to day mode'
                  }
                  title={isDayTheme ? 'Night mode' : 'Day mode'}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white/70 shadow-sm transition-all hover:border-white/40 hover:text-white day:border-[#dfd7ca] day:bg-white day:text-[#5a5248] day:hover:border-[#9a742f] day:hover:text-[#9a742f]"
                >
                  {isDayTheme ? (
                    <MoonIcon className="h-4 w-4" />
                  ) : (
                    <SunIcon className="h-4 w-4" />
                  )}
                </button>
                <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-white/50 day:text-[#786e61]">
                  Account Portal
                </p>
              </div>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white/70 transition-colors hover:border-[#c49a45] hover:text-white day:border-[#dfd7ca] day:text-[#5a5248] day:hover:border-[#9a742f] day:hover:text-[#1a1714]"
                aria-label="Close account menu"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <nav aria-label="Account menu" className="flex-1 overflow-y-auto px-5 py-4">
            <p className="px-1 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#c49a45] day:text-[#9a742f]">
              Account Menu
            </p>
            <div className="mt-3 space-y-2">
              {/* New Design button */}
              <button
                onClick={handleNewDesign}
                className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-white/12 bg-white/[0.04] px-3.5 py-2.5 text-sm font-medium text-white/80 transition-all hover:border-[#c49a45]/50 hover:bg-white/[0.08] hover:text-white day:border-[#dfd7ca] day:bg-white day:text-[#1a1714] day:shadow-xs day:hover:border-[#9a742f]"
              >
                <SparklesIcon className="size-5 text-[#c49a45] day:text-[#9a742f]" />
                <span>New Design</span>
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
                className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-transparent px-3.5 py-2.5 text-sm font-normal text-white/60 transition-all hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-300 day:text-[#5a5248] day:hover:border-red-200 day:hover:bg-red-50 day:hover:text-red-700"
              >
                <ArrowRightOnRectangleIcon className="size-5 text-white/40 day:text-[#8a8074]" />
                <span>Logout</span>
              </button>
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 day:border-[#dfd7ca] day:bg-white day:shadow-xs">
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/45 day:text-[#8a8074]">
                Signed in as
              </p>
              <p className="mt-1 font-serif text-sm font-normal text-white truncate day:text-[#1a1714]">
                {sessionEmail ?? 'Loading…'}
              </p>
            </div>
          </nav>
        </div>

        <div className="border-t border-white/10 px-6 py-4 text-xs text-white/60 day:border-[#dfd7ca] day:text-[#786e61]">
          Need assistance?{' '}
          <a
            href="mailto:admin@forevershining.com.au"
            className="font-medium text-[#c49a45] hover:underline day:text-[#9a742f]"
          >
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
  icon: Icon,
  isActive,
  onNavigate,
}: AccountNavLinkProps) {
  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      onClick={onNavigate}
      className={`group relative flex cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 ${
        isActive
          ? 'border border-[#c49a45]/40 bg-[#c49a45]/15 font-medium text-[#f0d89f] shadow-xs day:border-[#9a742f]/40 day:bg-[#9a742f]/10 day:text-[#78541c]'
          : 'border border-transparent font-normal text-white/70 hover:border-white/15 hover:bg-white/[0.06] hover:text-white day:border-transparent day:text-[#5a5248] day:hover:border-[#dfd7ca] day:hover:bg-[#f0ebe1] day:hover:text-[#1a1714]'
      }`}
    >
      <Icon
        className={`size-5 shrink-0 transition-colors ${
          isActive
            ? 'text-[#c49a45] day:text-[#9a742f]'
            : 'text-white/50 group-hover:text-white/80 day:text-[#8a8074] day:group-hover:text-[#1a1714]'
        }`}
      />
      <span>{label}</span>
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
