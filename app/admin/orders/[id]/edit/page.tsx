import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { desc, eq } from 'drizzle-orm';
import { db } from '#/lib/db/index';
import { accounts, orders, payments, profiles, projects } from '#/lib/db/schema';
import { buildPdfQuoteFromProject } from '#/lib/design-quote';
import type { PricingBreakdown } from '#/lib/project-schemas';
import { requireAdminSession } from '../../../_components/admin-utils';
import { CancelOrderButton } from './_cancel-order-button';
import { DesignElementsSection } from './_design-elements-section';

type Props = { params: Promise<{ id: string }> };

function toDateInputValue(d: Date | null | undefined): string {
  if (!d) return '';
  return new Date(d).toISOString().slice(0, 10);
}

async function saveOrderAction(formData: FormData) {
  'use server';
  await requireAdminSession();

  const id = String(formData.get('orderId') ?? '');
  if (!id) return;

  const parseDate = (key: string): Date | null => {
    const v = String(formData.get(key) ?? '').trim();
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  };

  await db
    .update(orders)
    .set({
      notes: String(formData.get('notes') ?? '') || null,
      paidAt: parseDate('paidAt'),
      factoryOrderAt: parseDate('factoryOrderAt'),
      factoryFinishAt: parseDate('factoryFinishAt'),
      shippedAt: parseDate('shippedAt'),
      processedAt: parseDate('processedAt'),
      updatedAt: new Date(),
    })
    .where(eq(orders.id, id));

  revalidatePath(`/admin/orders/${id}/edit`);
  revalidatePath(`/admin/orders/${id}`);
}

async function cancelOrderAction(formData: FormData) {
  'use server';
  await requireAdminSession();
  const id = String(formData.get('orderId') ?? '');
  if (!id) return;
  await db
    .update(orders)
    .set({ status: 'cancelled', updatedAt: new Date() })
    .where(eq(orders.id, id));
  revalidatePath(`/admin/orders`);
  redirect(`/admin/orders`);
}

export default async function AdminOrderEditPage({ params }: Props) {
  await requireAdminSession();
  const { id } = await params;

  const [order] = await db
    .select({
      id: orders.id,
      accountId: orders.accountId,
      invoiceNumber: orders.invoiceNumber,
      status: orders.status,
      totalCents: orders.totalCents,
      notes: orders.notes,
      createdAt: orders.createdAt,
      paidAt: orders.paidAt,
      factoryOrderAt: orders.factoryOrderAt,
      factoryFinishAt: orders.factoryFinishAt,
      shippedAt: orders.shippedAt,
      processedAt: orders.processedAt,
      email: accounts.email,
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
      screenshotPath: projects.screenshotPath,
      designState: projects.designState,
      pricingBreakdown: projects.pricingBreakdown,
      totalPriceCents: projects.totalPriceCents,
      currency: projects.currency,
    })
    .from(orders)
    .leftJoin(accounts, eq(orders.accountId, accounts.id))
    .leftJoin(profiles, eq(accounts.id, profiles.accountId))
    .leftJoin(projects, eq(orders.projectId, projects.id))
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) notFound();

  const paymentRows = await db.select().from(payments).where(eq(payments.orderId, id)).orderBy(desc(payments.createdAt));

  const customerName =
    [order.firstName, order.lastName].filter(Boolean).join(' ') ||
    order.organization ||
    order.email ||
    '—';

  const orderLabel = order.invoiceNumber || `#${id.slice(0, 8).toUpperCase()}`;

  return (
    <div className="space-y-6 px-6 py-6 md:px-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Edit Order {orderLabel}
        </h1>
        <CancelOrderButton orderId={order.id} cancelOrderAction={cancelOrderAction} />
      </div>

      {/* Dates form */}
      <form action={saveOrderAction} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800 space-y-5">
        <input type="hidden" name="orderId" value={order.id} />

        {/* Date milestone row */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: 'Ordered', name: 'createdAt', value: toDateInputValue(order.createdAt), readOnly: true },
            { label: 'Paid', name: 'paidAt', value: toDateInputValue(order.paidAt) },
            { label: 'Factory Order', name: 'factoryOrderAt', value: toDateInputValue(order.factoryOrderAt) },
            { label: 'Factory Finish', name: 'factoryFinishAt', value: toDateInputValue(order.factoryFinishAt) },
            { label: 'Shipped', name: 'shippedAt', value: toDateInputValue(order.shippedAt) },
            { label: 'Processed', name: 'processedAt', value: toDateInputValue(order.processedAt) },
          ].map(({ label, name, value, readOnly }) => (
            <div key={name} className="space-y-1">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                {label}
              </label>
              <input
                type="date"
                name={readOnly ? undefined : name}
                defaultValue={value}
                readOnly={readOnly}
                className={`w-full rounded-lg border px-2 py-1.5 text-xs text-gray-800 dark:text-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                  readOnly
                    ? 'border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-600 dark:bg-gray-700/50 cursor-not-allowed'
                    : 'border-gray-300 bg-white dark:border-gray-600'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
            Notes
          </label>
          <textarea
            name="notes"
            defaultValue={order.notes ?? ''}
            rows={3}
            placeholder={`Notes for order ${orderLabel}`}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-y"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Save Changes
          </button>
          <Link
            href="/admin/orders"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
          >
            Back to List
          </Link>
          <Link
            href={`/admin/orders/${id}/invoice`}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
          >
            View Invoice
          </Link>
        </div>
      </form>

      {/* Design preview + customer info */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex gap-6 items-start">
          {order.screenshotPath ? (
            <div className="flex-shrink-0 space-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={order.screenshotPath}
                alt="Design preview"
                className="h-40 w-40 rounded-lg object-contain border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700"
              />
              <a
                href={order.screenshotPath}
                target="_blank"
                rel="noreferrer"
                className="block text-center text-xs text-blue-600 hover:underline dark:text-blue-400"
              >
                Show Large
              </a>
            </div>
          ) : (
            <div className="flex-shrink-0 h-40 w-40 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400 dark:border-gray-600">
              No preview
            </div>
          )}

          <div className="text-sm space-y-1.5 text-gray-700 dark:text-gray-300">
            <p>
              <span className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mr-2">Design Name</span>
              {order.projectTitle || '—'}
            </p>
            <p>
              <span className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mr-2">Customer No</span>
              {order.accountId?.slice(0, 8).toUpperCase() ?? '—'}
            </p>
            <p>
              <span className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mr-2">Customer Name</span>
              {customerName}
            </p>
            <p>
              <span className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mr-2">Email</span>
              {order.email ?? '—'}
            </p>
            <p>
              <span className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mr-2">Status</span>
              {order.status}
            </p>
          </div>
        </div>
      </div>

      {/* Design Elements with checkboxes + supplier mail */}
      {(() => {
        const quote = buildPdfQuoteFromProject({
          totalPriceCents: order.totalPriceCents,
          currency: order.currency,
          pricingBreakdown: (order.pricingBreakdown as PricingBreakdown | null) ?? {},
          designState: order.designState as Parameters<typeof buildPdfQuoteFromProject>[0]['designState'],
        });
        return (
          <DesignElementsSection
            orderId={id}
            inscriptions={quote.inscriptions}
            motifs={quote.motifs}
            additions={quote.additions}
          />
        );
      })()}

      {/* Billing / Payment / Delivery info */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Billing */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
            Billing Information
          </h3>
          <dl className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
            <div className="flex gap-2"><dt className="w-24 text-gray-400 shrink-0">First Name</dt><dd>{order.firstName || '—'}</dd></div>
            <div className="flex gap-2"><dt className="w-24 text-gray-400 shrink-0">Last Name</dt><dd>{order.lastName || '—'}</dd></div>
            {order.organization && <div className="flex gap-2"><dt className="w-24 text-gray-400 shrink-0">Organisation</dt><dd>{order.organization}</dd></div>}
            <div className="flex gap-2"><dt className="w-24 text-gray-400 shrink-0">Address</dt><dd>{order.address || '—'}</dd></div>
            <div className="flex gap-2"><dt className="w-24 text-gray-400 shrink-0">City</dt><dd>{order.city || '—'}</dd></div>
            <div className="flex gap-2"><dt className="w-24 text-gray-400 shrink-0">State</dt><dd>{order.state || '—'}</dd></div>
            <div className="flex gap-2"><dt className="w-24 text-gray-400 shrink-0">Postcode</dt><dd>{order.postcode || '—'}</dd></div>
            <div className="flex gap-2"><dt className="w-24 text-gray-400 shrink-0">Country</dt><dd>{order.country || 'Australia'}</dd></div>
            <div className="flex gap-2"><dt className="w-24 text-gray-400 shrink-0">Email</dt><dd><a href={`mailto:${order.email}`} className="text-blue-600 hover:underline dark:text-blue-400">{order.email || '—'}</a></dd></div>
            <div className="flex gap-2"><dt className="w-24 text-gray-400 shrink-0">Phone</dt><dd>{order.phone || '—'}</dd></div>
          </dl>
        </div>

        {/* Payment */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
            Payment Information
          </h3>
          {paymentRows.length === 0 ? (
            <p className="text-xs text-gray-400">No payments recorded.</p>
          ) : (
            <dl className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
              {paymentRows.map((p) => (
                <div key={p.id} className="flex gap-2">
                  <dt className="w-24 text-gray-400 shrink-0 capitalize">{p.provider}</dt>
                  <dd>
                    <span className={p.status === 'completed' ? 'text-green-600 font-medium' : 'text-orange-500'}>
                      {p.status}
                    </span>
                    {' — '}A$ {(p.amountCents / 100).toFixed(2)}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {/* Delivery */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
            Delivery Information
          </h3>
          <dl className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
            <div className="flex gap-2"><dt className="w-24 text-gray-400 shrink-0">Method</dt><dd>Courier</dd></div>
            <div className="flex gap-2"><dt className="w-24 text-gray-400 shrink-0">Name</dt><dd>{customerName}</dd></div>
            <div className="flex gap-2"><dt className="w-24 text-gray-400 shrink-0">Address</dt><dd>{order.address || '—'}</dd></div>
            <div className="flex gap-2"><dt className="w-24 text-gray-400 shrink-0">City</dt><dd>{order.city || '—'}</dd></div>
            <div className="flex gap-2"><dt className="w-24 text-gray-400 shrink-0">State</dt><dd>{order.state || '—'}</dd></div>
            <div className="flex gap-2"><dt className="w-24 text-gray-400 shrink-0">Postcode</dt><dd>{order.postcode || '—'}</dd></div>
            <div className="flex gap-2"><dt className="w-24 text-gray-400 shrink-0">Country</dt><dd>{order.country || 'Australia'}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}
