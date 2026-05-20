import { desc, eq } from 'drizzle-orm';
import { db } from '#/lib/db/index';
import { accounts, orders, payments, profiles } from '#/lib/db/schema';
import {
  EmptyState,
  PageIntro,
  SectionCard,
  StatusBadge,
  formatDate,
  formatMoney,
  getDisplayName,
  requireAdminSession,
} from '../_components/admin-utils';

export default async function AdminPaymentsPage() {
  await requireAdminSession();

  const paymentRows = await db
    .select({
      id: payments.id,
      provider: payments.provider,
      providerRef: payments.providerRef,
      amountCents: payments.amountCents,
      status: payments.status,
      createdAt: payments.createdAt,
      receivedAt: payments.receivedAt,
      invoiceNumber: orders.invoiceNumber,
      orderId: orders.id,
      email: accounts.email,
      firstName: profiles.firstName,
      lastName: profiles.lastName,
      organization: profiles.organization,
    })
    .from(payments)
    .leftJoin(orders, eq(payments.orderId, orders.id))
    .leftJoin(accounts, eq(orders.accountId, accounts.id))
    .leftJoin(profiles, eq(accounts.id, profiles.accountId))
    .orderBy(desc(payments.createdAt));

  return (
    <div className="space-y-8 px-6 py-8 md:px-8">
      <PageIntro
        title="Payments"
        description="Review incoming payment activity across quotes and orders."
      />

      <SectionCard className="overflow-hidden">
        {paymentRows.length === 0 ? (
          <EmptyState message="No payments have been recorded yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm dark:divide-gray-700">
              <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase dark:bg-gray-700/50 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3 font-medium tracking-wide">Date</th>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Customer
                  </th>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Order Invoice
                  </th>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Provider
                  </th>
                  <th className="px-6 py-3 font-medium tracking-wide">Ref</th>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Amount
                  </th>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paymentRows.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {formatDate(payment.receivedAt || payment.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      <div>{getDisplayName(payment)}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {payment.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {payment.invoiceNumber || payment.orderId || '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                      {payment.provider}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {payment.providerRef || '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {formatMoney(payment.amountCents)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={payment.status} />
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
