import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import clsx from 'clsx';
import { getServerSession } from '#/lib/auth/session';

export async function requireAdminSession() {
  const session = await getServerSession();

  if (!session || session.role !== 'admin') {
    redirect('/login');
  }

  return session;
}

export function formatMoney(cents: number | null | undefined): string {
  return `$${((cents ?? 0) / 100).toFixed(2)}`;
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return '—';

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('en-AU');
}

export function getDisplayName(input: {
  firstName?: string | null;
  lastName?: string | null;
  organization?: string | null;
  email?: string | null;
}): string {
  const fullName = [input.firstName, input.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  if (fullName) return fullName;
  if (input.organization) return input.organization;
  if (input.email) return input.email;

  return '—';
}

export function getLocation(input: {
  city?: string | null;
  state?: string | null;
  country?: string | null;
}): string {
  const parts = [input.city, input.state, input.country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : '—';
}

export function truncateText(
  value: string | null | undefined,
  max = 80,
): string {
  if (!value) return '—';
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

export function formatMetadataPreview(metadata: unknown): string {
  if (metadata == null) return '—';

  try {
    const raw =
      typeof metadata === 'string' ? metadata : JSON.stringify(metadata);
    return truncateText(raw, 120);
  } catch {
    return '—';
  }
}

function getStatusClasses(status: string) {
  const normalized = status.toLowerCase();

  if (
    normalized === 'paid' ||
    normalized === 'approved' ||
    normalized === 'completed' ||
    normalized === 'responded'
  ) {
    return 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800';
  }

  if (
    normalized === 'pending' ||
    normalized === 'quote' ||
    normalized === 'new'
  ) {
    return 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
  }

  if (normalized === 'in_production' || normalized === 'produced') {
    return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
  }

  if (normalized === 'shipped') {
    return 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800';
  }

  if (
    normalized === 'draft' ||
    normalized === 'cancelled' ||
    normalized === 'failed'
  ) {
    return 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600';
  }

  return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-medium tracking-wide capitalize',
        getStatusClasses(status),
      )}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export function PageIntro({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 md:flex-row md:items-end md:justify-between dark:border-gray-700">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function SectionCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={clsx(
        'rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800',
        className,
      )}
    >
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <SectionCard className="p-5">
      <p className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
        {value}
      </p>
      {detail ? (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          {detail}
        </p>
      ) : null}
    </SectionCard>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="px-6 py-12 text-center text-sm text-gray-400 dark:text-gray-500">
      {message}
    </div>
  );
}

export function FilterTab({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'border-blue-600 bg-blue-600 text-white'
          : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-100',
      )}
    >
      {label}
    </Link>
  );
}
