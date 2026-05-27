import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Customers' };
import { db } from '#/lib/db/index';
import { accounts, profiles } from '#/lib/db/schema';
import {
  EmptyState,
  FilterTab,
  PageIntro,
  SectionCard,
  StatusBadge,
  formatDate,
  getDisplayName,
  getLocation,
  requireAdminSession,
} from '../_components/admin-utils';

const customerTabs = [
  { key: 'all', label: 'All' },
  { key: 'staff', label: 'Staff' },
] as const;

type CustomerTabKey = (typeof customerTabs)[number]['key'];

type CustomersPageProps = { searchParams: Promise<{ role?: string }> };

function getSelectedRole(value: string | undefined): CustomerTabKey {
  return customerTabs.some((tab) => tab.key === value)
    ? (value as CustomerTabKey)
    : 'all';
}

export default async function AdminCustomersPage({
  searchParams,
}: CustomersPageProps) {
  await requireAdminSession();

  const { role } = await searchParams;
  const selectedRole = getSelectedRole(role);

  const customerRows = await db
    .select({
      id: accounts.id,
      email: accounts.email,
      role: accounts.role,
      status: accounts.status,
      createdAt: accounts.createdAt,
      firstName: profiles.firstName,
      lastName: profiles.lastName,
      organization: profiles.organization,
      phone: profiles.phone,
      city: profiles.city,
      state: profiles.state,
      country: profiles.country,
    })
    .from(accounts)
    .leftJoin(profiles, eq(accounts.id, profiles.accountId))
    .where(selectedRole === 'staff' ? eq(accounts.role, 'admin') : undefined)
    .orderBy(desc(accounts.createdAt));

  return (
    <div className="space-y-8 px-6 py-8 md:px-8">
      <PageIntro
        title="Customers"
        description="Browse client accounts, contact details, and staff access."
        action={
          <Link
            href="/admin/customers/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            + New Customer
          </Link>
        }
      />

      <div className="flex flex-wrap gap-3">
        {customerTabs.map((tab) => (
          <FilterTab
            key={tab.key}
            href={
              tab.key === 'all'
                ? '/admin/customers'
                : `/admin/customers?role=${tab.key}`
            }
            label={tab.label}
            active={selectedRole === tab.key}
          />
        ))}
      </div>

      <SectionCard className="overflow-hidden">
        {customerRows.length === 0 ? (
          <EmptyState message="No customers match the selected filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm dark:divide-gray-700">
              <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase dark:bg-gray-700/50 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3 font-medium tracking-wide">Name</th>
                  <th className="px-6 py-3 font-medium tracking-wide">Email</th>
                  <th className="px-6 py-3 font-medium tracking-wide">Phone</th>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Location
                  </th>
                  <th className="px-6 py-3 font-medium tracking-wide">Role</th>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Status
                  </th>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {customerRows.map((customer, index) => (
                  <tr
                    key={customer.id}
                    className={`hover:bg-gray-100 dark:hover:bg-gray-700/50 ${index % 2 === 1 ? 'bg-gray-100 dark:bg-gray-700/50' : 'bg-white dark:bg-transparent'}`}
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="font-medium text-gray-900 hover:text-blue-700 dark:text-gray-100 dark:hover:text-blue-300"
                      >
                        {getDisplayName(customer)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {customer.phone || '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {getLocation(customer)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={customer.role} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={customer.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {formatDate(customer.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
