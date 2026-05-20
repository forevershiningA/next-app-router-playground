'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowRightStartOnRectangleIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  HomeIcon,
  QuestionMarkCircleIcon,
  SwatchIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: HomeIcon },
  { href: '/admin/orders', label: 'Orders', icon: ClipboardDocumentListIcon },
  { href: '/admin/customers', label: 'Customers', icon: UsersIcon },
  { href: '/admin/designs', label: 'Designs', icon: SwatchIcon },
  { href: '/admin/payments', label: 'Payments', icon: BanknotesIcon },
  {
    href: '/admin/enquiries',
    label: 'Enquiries',
    icon: QuestionMarkCircleIcon,
  },
  { href: '/admin/system', label: 'System', icon: Cog6ToothIcon },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === '/admin') {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.dispatchEvent(new CustomEvent('session-changed'));
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="sticky top-0 flex h-screen flex-col bg-white dark:bg-gray-800">
      <div className="border-b border-gray-200 px-5 py-5 dark:border-gray-700">
        <Link href="/admin" className="block">
          <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase">
            Forever Shining
          </p>
          <h2 className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
            Admin Panel
          </h2>
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {navItems.map((item) => {
          const active = isActivePath(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-3 dark:border-gray-700">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
        >
          <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
