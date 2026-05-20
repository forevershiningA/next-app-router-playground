import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { desc, eq } from 'drizzle-orm';
import { db } from '#/lib/db/index';
import {
  accounts,
  auditLog,
  orderItems,
  orders,
  payments,
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

const orderStatuses = [
  'quote',
  'pending',
  'paid',
  'in_production',
  'produced',
  'shipped',
  'processed',
  'cancelled',
] as const;

type OrderStatus = (typeof orderStatuses)[number];

type OrderDetailPageProps = { params: Promise<{ id: string }> };

async function updateOrderStatus(formData: FormData) {
  'use server';

  const session = await requireAdminSession();
  const orderId = String(formData.get('orderId') ?? '');
  const nextStatus = String(formData.get('status') ?? '');

  if (!orderId || !orderStatuses.includes(nextStatus as OrderStatus)) {
    return;
  }

  await db
    .update(orders)
    .set({ status: nextStatus, updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  await db
    .insert(auditLog)
    .values({
      accountId: session.accountId,
      action: 'admin.order_status_updated',
      targetType: 'order',
      targetId: orderId,
      metadata: { status: nextStatus },
    });

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
}

export default async function AdminOrderDetailPage({
  params,
}: OrderDetailPageProps) {
  await requireAdminSession();

  const { id } = await params;
  const [orderRow] = await db
    .select({
      id: orders.id,
      invoiceNumber: orders.invoiceNumber,
      status: orders.status,
      subtotalCents: orders.subtotalCents,
      taxCents: orders.taxCents,
      totalCents: orders.totalCents,
      currency: orders.currency,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      accountId: accounts.id,
      email: accounts.email,
      role: accounts.role,
      accountStatus: accounts.status,
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
      projectId: projects.id,
      projectTitle: projects.title,
      projectStatus: projects.status,
      screenshotPath: projects.screenshotPath,
    })
    .from(orders)
    .leftJoin(accounts, eq(orders.accountId, accounts.id))
    .leftJoin(profiles, eq(accounts.id, profiles.accountId))
    .leftJoin(projects, eq(orders.projectId, projects.id))
    .where(eq(orders.id, id))
    .limit(1);

  if (!orderRow) {
    notFound();
  }

  const [itemRows, paymentRows] = await Promise.all([
    db
      .select({
        id: orderItems.id,
        description: orderItems.description,
        quantity: orderItems.quantity,
        unitPriceCents: orderItems.unitPriceCents,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, id)),
    db
      .select({
        id: payments.id,
        provider: payments.provider,
        providerRef: payments.providerRef,
        amountCents: payments.amountCents,
        status: payments.status,
        receivedAt: payments.receivedAt,
        createdAt: payments.createdAt,
        currency: payments.currency,
      })
      .from(payments)
      .where(eq(payments.orderId, id))
      .orderBy(desc(payments.createdAt)),
  ]);

  return (
    <div className="space-y-8 px-6 py-8 md:px-8">
      <PageIntro
        title={orderRow.invoiceNumber || 'Order detail'}
        description={`Order ${orderRow.id}`}
      />

      <div className="grid gap-6 xl:grid-cols-[1.5fr,1fr]">
        <SectionCard className="p-6">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={orderRow.status} />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Created {formatDate(orderRow.createdAt)}
            </p>
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs tracking-wide text-gray-400 uppercase dark:text-gray-500">
                Invoice
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {orderRow.invoiceNumber || 'Draft invoice'}
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-wide text-gray-400 uppercase dark:text-gray-500">
                Total
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {formatMoney(orderRow.totalCents)}
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-wide text-gray-400 uppercase dark:text-gray-500">
                Subtotal
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {formatMoney(orderRow.subtotalCents)}
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-wide text-gray-400 uppercase dark:text-gray-500">
                Tax
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {formatMoney(orderRow.taxCents)}
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-wide text-gray-400 uppercase dark:text-gray-500">
                Updated
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {formatDate(orderRow.updatedAt)}
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-wide text-gray-400 uppercase dark:text-gray-500">
                Currency
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {orderRow.currency}
              </dd>
            </div>
          </dl>

          <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Linked design
            </h2>
            <p className="mt-2 text-gray-900 dark:text-gray-100">
              {orderRow.projectTitle || 'Untitled design'}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span>Project ID: {orderRow.projectId}</span>
              <StatusBadge status={orderRow.projectStatus || 'draft'} />
            </div>
            {orderRow.screenshotPath ? (
              <a
                href={orderRow.screenshotPath}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View screenshot
              </a>
            ) : null}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Update status
            </h2>
            <form action={updateOrderStatus} className="mt-4 space-y-4">
              <input type="hidden" name="orderId" value={orderRow.id} />
              <select
                name="status"
                defaultValue={orderRow.status}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-blue-400"
              >
                {orderStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Save status
              </button>
            </form>
          </SectionCard>

          <SectionCard className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Customer
            </h2>
            <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p className="text-gray-900 dark:text-gray-100">
                {getDisplayName(orderRow)}
              </p>
              <p>{orderRow.email}</p>
              <p>{orderRow.phone || 'No phone supplied'}</p>
              <p>{getLocation(orderRow)}</p>
              <p>
                {orderRow.address || 'No street address'}
                {orderRow.postcode ? `, ${orderRow.postcode}` : ''}
              </p>
              <div className="flex flex-wrap gap-3 pt-2 text-xs text-gray-400 dark:text-gray-500">
                <span>Role: {orderRow.role}</span>
                <span>Status: {orderRow.accountStatus}</span>
                <span>Last login: {formatDate(orderRow.lastLoginAt)}</span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      <SectionCard className="overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Order items
          </h2>
        </div>
        {itemRows.length === 0 ? (
          <EmptyState message="This order has no item lines yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm dark:divide-gray-700">
              <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase dark:bg-gray-700/50 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Description
                  </th>
                  <th className="px-6 py-3 font-medium tracking-wide">Qty</th>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Line Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {itemRows.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {formatMoney(item.unitPriceCents)}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {formatMoney(item.quantity * item.unitPriceCents)}
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
            Payments
          </h2>
        </div>
        {paymentRows.length === 0 ? (
          <EmptyState message="No payments have been recorded for this order." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm dark:divide-gray-700">
              <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase dark:bg-gray-700/50 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3 font-medium tracking-wide">Date</th>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Provider
                  </th>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Reference
                  </th>
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
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {formatDate(payment.receivedAt || payment.createdAt)}
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
