import Link from 'next/link';
import { and, desc, eq, inArray, isNull, ne } from 'drizzle-orm';
import { db } from '#/lib/db/index';
import { accounts, orders, payments, profiles } from '#/lib/db/schema';
import {
  EmptyState,
  FilterTab,
  PageIntro,
  SectionCard,
  StatusBadge,
  formatDate,
  formatMoney,
  getDisplayName,
  requireAdminSession,
} from '../_components/admin-utils';

const orderTabs = [
  { key: 'all', label: 'All' },
  { key: 'current', label: 'Current' },
  { key: 'unpaid', label: 'Unpaid' },
  { key: 'paid', label: 'Paid' },
  { key: 'in-production', label: 'In Production' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'processed', label: 'Processed' },
  { key: 'cancelled', label: 'Cancelled' },
] as const;

type OrderTabKey = (typeof orderTabs)[number]['key'];

type OrdersPageProps = { searchParams: Promise<{ status?: string }> };

function getSelectedStatus(value: string | undefined): OrderTabKey {
  return orderTabs.some((tab) => tab.key === value)
    ? (value as OrderTabKey)
    : 'all';
}

export default async function AdminOrdersPage({
  searchParams,
}: OrdersPageProps) {
  await requireAdminSession();

  const { status } = await searchParams;
  const selectedStatus = getSelectedStatus(status);

  const completedPayments = db
    .select({ orderId: payments.orderId })
    .from(payments)
    .where(eq(payments.status, 'completed'))
    .groupBy(payments.orderId)
    .as('completed_payments');

  const whereClause =
    selectedStatus === 'current'
      ? inArray(orders.status, ['quote', 'pending'])
      : selectedStatus === 'unpaid'
        ? and(ne(orders.status, 'cancelled'), isNull(completedPayments.orderId))
        : selectedStatus === 'paid'
          ? eq(orders.status, 'paid')
          : selectedStatus === 'in-production'
            ? inArray(orders.status, ['in_production', 'produced'])
            : selectedStatus === 'shipped'
              ? eq(orders.status, 'shipped')
              : selectedStatus === 'processed'
                ? eq(orders.status, 'processed')
                : selectedStatus === 'cancelled'
                  ? eq(orders.status, 'cancelled')
                  : undefined;

  const orderRows = await db
    .select({
      id: orders.id,
      invoiceNumber: orders.invoiceNumber,
      status: orders.status,
      totalCents: orders.totalCents,
      createdAt: orders.createdAt,
      email: accounts.email,
      firstName: profiles.firstName,
      lastName: profiles.lastName,
      organization: profiles.organization,
      paidOrderId: completedPayments.orderId,
    })
    .from(orders)
    .leftJoin(accounts, eq(orders.accountId, accounts.id))
    .leftJoin(profiles, eq(accounts.id, profiles.accountId))
    .leftJoin(completedPayments, eq(completedPayments.orderId, orders.id))
    .where(whereClause)
    .orderBy(desc(orders.createdAt));

  return (
    <div className="space-y-8 px-6 py-8 md:px-8">
      <PageIntro
        title="Orders"
        description="Track quote requests, payments, production progress, and fulfilment."
        action={
          <Link
            href="/admin/orders/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            + Add Custom Order
          </Link>
        }
      />

      <div className="flex flex-wrap gap-3">
        {orderTabs.map((tab) => (
          <FilterTab
            key={tab.key}
            href={
              tab.key === 'all'
                ? '/admin/orders'
                : `/admin/orders?status=${tab.key}`
            }
            label={tab.label}
            active={selectedStatus === tab.key}
          />
        ))}
      </div>

      <SectionCard className="overflow-hidden">
        {orderRows.length === 0 ? (
          <EmptyState message="No orders match the selected filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm dark:divide-gray-700">
              <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase dark:bg-gray-700/50 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Customer
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
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      <div>{getDisplayName(order)}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {order.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={order.status} />
                        {order.paidOrderId ? (
                          <span className="text-xs text-green-600 dark:text-green-400">
                            Paid
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
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
