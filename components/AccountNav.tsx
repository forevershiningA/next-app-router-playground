'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ComponentType } from 'react';
import {
  SparklesIcon,
  BookmarkSquareIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  DocumentDuplicateIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { useHeadstoneStore } from '#/lib/headstone-store';

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
    href: '/select-product',
    icon: ArrowLeftIcon,
    description: 'Return to the design studio',
  },
];

export default function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const resetDesign = useHeadstoneStore((s) => s.resetDesign);
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
    resetDesign();
    router.push('/select-size');
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    // Dispatch session-changed so the page and sidebar update immediately.
    // router.push is intentionally omitted — we're already on /my-account and
    // navigating away then back would skip the event listener.
    window.dispatchEvent(new Event('session-changed'));
  }

  return (
    <aside className="fixed top-0 left-0 z-20 hidden h-full w-[400px] flex-col border-r border-[#3f2a1b]/80 bg-[#120804] text-white shadow-[0_45px_120px_rgba(0,0,0,0.85)] lg:flex">

      <div className="flex flex-1 flex-col bg-gradient-to-br from-[#3d2817] via-[#2a1f14] to-[#1a1410]">

        {/* Desktop Header */}
        <div className="hidden items-center justify-between border-b border-white/10 px-6 md:flex">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img src="/ico/forever-transparent-logo.png" alt="Forever Logo" />
          </Link>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden border-b border-white/5 bg-[#120c08]/95 px-5 py-4 shadow-[0_10px_25px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[10px] uppercase tracking-[0.45em] text-white/50">Guided Studio</p>
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <img src="/ico/forever-transparent-logo.png" alt="Forever Logo" className="h-8 w-auto" />
            </Link>
          </div>
        </div>

        <nav aria-label="Account menu" className="flex-1 overflow-y-auto px-5 py-6">
          <p className="text-[12px] uppercase tracking-[0.4em] text-white/40">Account menu</p>
          <div className="mt-4 space-y-3">
            {/* New Design — special button that resets design state */}
            <button
              onClick={handleNewDesign}
              className="w-full flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-base font-light transition-all border border-white/12 text-white/75 hover:border-white/30 hover:bg-white/5"
            >
              <div className="flex items-center gap-4">
                <SparklesIcon className="h-5 w-5" />
                <div className="flex-1">
                  <p className="text-[16px] text-white/45">New Design</p>
                </div>
              </div>
            </button>
            {accountLinks.map((link) => (
              <AccountNavLink key={link.label} {...link} isActive={pathname === link.href} />
            ))}
            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-full flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-base font-light transition-all border border-white/12 text-white/75 hover:border-red-400/30 hover:bg-red-400/5 hover:text-red-300"
            >
              <div className="flex items-center gap-4">
                <ShieldCheckIcon className="h-5 w-5" />
                <div className="flex-1">
                  <p className="text-[16px]">Logout</p>
                </div>
              </div>
            </button>
          </div>
          <div className="mt-8 rounded-2xl border border-white/12 bg-white/5 px-4 py-4 text-sm text-white/75 shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            <p className="text-[12px] uppercase tracking-[0.4em] text-white/45">Signed in as</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {sessionEmail ?? 'Loading...'}
            </p>
          </div>
        </nav>
      </div>
      <div className="border-t border-white/8 px-6 py-5 text-sm text-white/70">
        Need assistance?{' '}
        <a href="mailto:support@forevershining.com" className="text-amber-200 hover:text-white">
          Email support
        </a>
      </div>
    </aside>
  );
}

function AccountNavLink({
  label,
  href,
  description,
  icon: Icon,
  meta,
  tone,
  isActive,
}: AccountNavLinkProps) {
  const cardClasses = isActive
    ? 'border-white/35 bg-white/12 text-white shadow-[0_2px_5px_rgba(0,0,0,0.6)]'
    : 'border-white/12 text-white/75 hover:border-white/30 hover:bg-white/5';

  const iconClasses = tone === 'primary'
    ? 'bg-gradient-to-tr from-amber-200 to-amber-400 text-[#2b1404] border-amber-200/60'
    : isActive
      ? 'bg-white text-[#1a120c] border-white/70'
      : 'bg-white/10 text-white/80 border-white/5';

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={`flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-base font-light transition-all ${cardClasses}`}
    >
      <div className="flex items-center gap-4">
        <Icon className="h-5 w-5" />
        <div className="flex-1">
          <p className="text-[16px] text-white/45">{label}</p>
        </div>
      </div>
    </Link>
  );
}

type AccountNavLinkProps = {
  label: string;
  href: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  meta?: string;
  tone?: 'primary';
  isActive: boolean;
};
