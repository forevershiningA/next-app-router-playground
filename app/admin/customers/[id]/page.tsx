import Link from 'next/link';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { desc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Customers' };
import { db } from '#/lib/db/index';
import {
  accounts,
  auditLog,
  orders,
  profiles,
  projects,
} from '#/lib/db/schema';
import {
  EmptyState,
  PageIntro,
  SectionCard,
  StatusBadge,
  formatDate,
  formatMoney,
  getDisplayName,
  getLocation,
  requireAdminSession,
} from '../../_components/admin-utils';

type CustomerDetailPageProps = { params: Promise<{ id: string }> };

async function toggleCustomerRole(formData: FormData) {
  'use server';

  const session = await requireAdminSession();
  const accountId = String(formData.get('accountId') ?? '');
  const currentRole = String(formData.get('currentRole') ?? '');

  if (!accountId || (currentRole !== 'client' && currentRole !== 'admin')) {
    return;
  }

  const nextRole = currentRole === 'admin' ? 'client' : 'admin';

  await db
    .update(accounts)
    .set({ role: nextRole, updatedAt: new Date() })
    .where(eq(accounts.id, accountId));

  await db
    .insert(auditLog)
    .values({
      accountId: session.accountId,
      action: 'admin.customer_role_toggled',
      targetType: 'account',
      targetId: accountId,
      metadata: { role: nextRole },
    });

  revalidatePath('/admin/customers');
  revalidatePath(`/admin/customers/${accountId}`);
}

export default async function AdminCustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  await requireAdminSession();

  const { id } = await params;
  const [customer] = await db
    .select({
      id: accounts.id,
      email: accounts.email,
      role: accounts.role,
      status: accounts.status,
      createdAt: accounts.createdAt,
      lastLoginAt: accounts.lastLoginAt,
      firstName: profiles.firstName,
      lastName: profiles.lastName,
      organization: profiles.organization,
      phone: profiles.phone,
      address: profiles.address,
      city: profiles.city,
      state: profiles.state,
      postcode: profiles.postcode,
      country: profiles.country,
    })
    .from(accounts)
    .leftJoin(profiles, eq(accounts.id, profiles.accountId))
    .where(eq(accounts.id, id))
    .limit(1);

  if (!customer) {
    notFound();
  }

  const [projectRows, orderRows] = await Promise.all([
    db
      .select({
        id: projects.id,
        title: projects.title,
        status: projects.status,
        totalPriceCents: projects.totalPriceCents,
        createdAt: projects.createdAt,
      })
      .from(projects)
      .where(eq(projects.accountId, id))
      .orderBy(desc(projects.createdAt)),
    db
      .select({
        id: orders.id,
        invoiceNumber: orders.invoiceNumber,
        status: orders.status,
        totalCents: orders.totalCents,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(eq(orders.accountId, id))
      .orderBy(desc(orders.createdAt)),
  ]);

  return (
    <div className="space-y-8 px-6 py-8 md:px-8">
      <PageIntro
        title={getDisplayName(customer)}
        description={customer.email}
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
        <SectionCard className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Account
          </h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs tracking-wide text-gray-400 uppercase dark:text-gray-500">
                Email
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {customer.email}
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-wide text-gray-400 uppercase dark:text-gray-500">
                Phone
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {customer.phone || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-wide text-gray-400 uppercase dark:text-gray-500">
                Role
              </dt>
              <dd className="mt-1">
                <StatusBadge status={customer.role} />
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-wide text-gray-400 uppercase dark:text-gray-500">
                Status
              </dt>
              <dd className="mt-1">
                <StatusBadge status={customer.status} />
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-wide text-gray-400 uppercase dark:text-gray-500">
                Joined
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {formatDate(customer.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-wide text-gray-400 uppercase dark:text-gray-500">
                Last login
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {formatDate(customer.lastLoginAt)}
              </dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Profile
          </h2>
          <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>{customer.organization || 'No organisation specified'}</p>
            <p>{customer.address || 'No street address'}</p>
            <p>{getLocation(customer)}</p>
            <p>{customer.postcode || 'No postcode provided'}</p>
          </div>

          <form action={toggleCustomerRole} className="mt-6">
            <input type="hidden" name="accountId" value={customer.id} />
            <input type="hidden" name="currentRole" value={customer.role} />
            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Make {customer.role === 'admin' ? 'client' : 'admin'}
            </button>
          </form>
        </SectionCard>
      </div>

      <SectionCard className="overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Projects
          </h2>
        </div>
        {projectRows.length === 0 ? (
          <EmptyState message="This customer has not saved any designs yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm dark:divide-gray-700">
              <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase dark:bg-gray-700/50 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3 font-medium tracking-wide">Title</th>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Status
                  </th>
                  <th className="px-6 py-3 font-medium tracking-wide">Price</th>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {projectRows.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                      <div>{project.title}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {project.id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {formatMoney(project.totalPriceCents)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {formatDate(project.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard className="overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Orders
          </h2>
        </div>
        {orderRows.length === 0 ? (
          <EmptyState message="This customer has not placed any orders yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm dark:divide-gray-700">
              <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase dark:bg-gray-700/50 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Status
                  </th>
                  <th className="px-6 py-3 font-medium tracking-wide">Total</th>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {orderRows.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-gray-900 hover:text-blue-700 dark:text-gray-100 dark:hover:text-blue-300"
                      >
                        {order.invoiceNumber || 'Draft invoice'}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {formatMoney(order.totalCents)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {formatDate(order.createdAt)}
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
