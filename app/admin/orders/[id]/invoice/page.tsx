import Link from 'next/link';
import { notFound } from 'next/navigation';
import { desc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Invoice' };
import { db } from '#/lib/db/index';
import {
  accounts,
  orderItems,
  orders,
  payments,
  profiles,
  projects,
} from '#/lib/db/schema';
import { requireAdminSession } from '../../../_components/admin-utils';
import { InvoiceTopBar } from './_invoice-top-bar';

type Props = { params: Promise<{ id: string }> };

function centsToAud(cents: number | null | undefined) {
  if (cents == null) return 'A$ 0.00';
  return `A$ ${(cents / 100).toFixed(2)}`;
}

function formatDateShort(d: Date | string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-AU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default async function AdminOrderInvoicePage({ params }: Props) {
  await requireAdminSession();
  const { id } = await params;

  const [order] = await db
    .select({
      id: orders.id,
      invoiceNumber: orders.invoiceNumber,
      status: orders.status,
      subtotalCents: orders.subtotalCents,
      taxCents: orders.taxCents,
      totalCents: orders.totalCents,
      currency: orders.currency,
      createdAt: orders.createdAt,
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
      thumbnailPath: projects.thumbnailPath,
    })
    .from(orders)
    .leftJoin(accounts, eq(orders.accountId, accounts.id))
    .leftJoin(profiles, eq(accounts.id, profiles.accountId))
    .leftJoin(projects, eq(orders.projectId, projects.id))
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) notFound();

  const [itemRows, paymentRows] = await Promise.all([
    db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id)),
    db
      .select()
      .from(payments)
      .where(eq(payments.orderId, id))
      .orderBy(desc(payments.createdAt)),
  ]);

  const customerName = [order.firstName, order.lastName].filter(Boolean).join(' ') || order.organization || order.email || '—';
  const previewImg = order.screenshotPath || order.thumbnailPath;
  const isPaid = paymentRows.some((p) => p.status === 'completed');

  return (
    <>
      {/* Top bar (hidden on print) */}
      <InvoiceTopBar
        orderId={id}
        orderLabel={order.invoiceNumber || `#${id.slice(0, 8).toUpperCase()}`}
        customerEmail={order.email || ''}
      />

      {/* Invoice document */}
      <div className="mx-auto max-w-4xl bg-white px-10 py-8 text-sm text-gray-900 print:px-0 print:py-0">

        {/* Header */}
        <div className="flex justify-between gap-8 border-b border-gray-300 pb-6">
          {/* Left: company addresses */}
          <div className="space-y-4 text-xs leading-5">
            <div>
              <p className="font-semibold">Forever Shining</p>
              <p>PO Box 1268</p>
              <p>Bibra Lake</p>
              <p>WA 6965</p>
            </div>
            <div>
              <p className="font-semibold">Forever Shining</p>
              <p>1/44 Port Kembla Dve</p>
              <p>Bibra Lake</p>
              <p>WA 6163</p>
              <p>Ph (08) 6191 0396 / 1300 851 181</p>
              <p>
                Web{' '}
                <a href="https://www.forevershining.com.au" className="text-blue-600 underline">
                  www.forevershining.com.au
                </a>
              </p>
              <p>
                Email{' '}
                <a href="mailto:admin@forevershining.com.au" className="text-blue-600 underline">
                  admin@forevershining.com.au
                </a>
              </p>
            </div>
          </div>

          {/* Right: invoice title */}
          <div className="text-right">
            <h1 className="text-2xl font-light text-gray-700">
              {isPaid ? 'Sales Receipt/Tax Invoice' : 'Quote / Tax Invoice'}
            </h1>
            <p className="mt-2 text-xs text-gray-500">ABN 12 115 273 722</p>
            <p className="mt-1 text-xs font-medium text-gray-700">
              The Stainless Steel Monument Company Pty Ltd
            </p>
            <p className="mt-4 text-xs text-gray-500">
              Date: {formatDateShort(order.createdAt)}
            </p>
            {order.invoiceNumber && (
              <p className="text-xs text-gray-500">
                Invoice: {order.invoiceNumber}
              </p>
            )}
          </div>
        </div>

        {/* Thank you */}
        <div className="mt-6">
          <p className="font-semibold text-red-600">
            Thank you and congratulations for designing and purchasing a personalized Forever Shining product.
          </p>
          <p className="mt-2 text-xs text-gray-600 leading-5">
            Your product is warranted against faulty manufacture. We trust that you will get long lasting satisfaction
            and pleasure from your Forever Shining product and we look forward to supplying you and your friends with
            other Forever Shining products in the future.
          </p>
        </div>

        {/* Design preview + order summary */}
        <div className="mt-6 flex gap-6 items-start">
          {previewImg && (
            <div className="flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImg}
                alt="Design preview"
                className="h-48 w-48 object-contain border border-gray-200 rounded bg-gray-50"
              />
            </div>
          )}
          <div className="text-xs leading-6 text-gray-700">
            <p><span className="font-medium">ORDER NO :</span> {order.invoiceNumber || order.id.slice(0, 8).toUpperCase()}</p>
            <p><span className="font-medium">DESIGN NAME :</span> {order.projectTitle || customerName}</p>
            <p><span className="font-medium">PRODUCT :</span> {order.projectTitle || '—'}</p>
            <p><span className="font-medium">QUANTITY :</span> 1</p>
            <p><span className="font-medium">PRICE :</span> {centsToAud(order.totalCents)}</p>
          </div>
        </div>

        {/* Bill to */}
        <div className="mt-6 rounded border border-gray-200 bg-gray-50 p-4 text-xs leading-5">
          <p className="font-semibold text-gray-700 mb-1">Bill To</p>
          <p>{customerName}</p>
          {order.organization && <p>{order.organization}</p>}
          {order.address && <p>{order.address}</p>}
          {(order.city || order.state || order.postcode) && (
            <p>{[order.city, order.state, order.postcode].filter(Boolean).join(', ')}</p>
          )}
          {order.country && <p>{order.country}</p>}
          {order.email && <p>{order.email}</p>}
          {order.phone && <p>{order.phone}</p>}
        </div>

        {/* Line items */}
        <div className="mt-8">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-gray-800">
                <th className="py-2 text-left font-semibold text-gray-800 w-3/5">Product</th>
                <th className="py-2 text-center font-semibold text-gray-800 w-16">Qty.</th>
                <th className="py-2 text-right font-semibold text-gray-800 w-28">Unit Price</th>
                <th className="py-2 text-right font-semibold text-gray-800 w-28">Item Total</th>
              </tr>
            </thead>
            <tbody>
              {itemRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-400 italic">
                    No line items recorded.
                  </td>
                </tr>
              ) : (
                itemRows.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="py-2 pr-4 text-blue-700 leading-5 whitespace-pre-wrap">
                      {item.description}
                    </td>
                    <td className="py-2 text-center text-gray-700">{item.quantity}</td>
                    <td className="py-2 text-right text-gray-700">{centsToAud(item.unitPriceCents)}</td>
                    <td className="py-2 text-right text-gray-700">
                      {centsToAud(item.quantity * item.unitPriceCents)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-4 flex justify-end">
          <table className="text-xs w-64">
            <tbody>
              {order.subtotalCents != null && (
                <tr className="border-b border-gray-200">
                  <td className="py-1 text-gray-600">Subtotal (excl. GST)</td>
                  <td className="py-1 text-right text-gray-800">{centsToAud(order.subtotalCents)}</td>
                </tr>
              )}
              {order.taxCents != null && (
                <tr className="border-b border-gray-200">
                  <td className="py-1 text-gray-600">GST (10%)</td>
                  <td className="py-1 text-right text-gray-800">{centsToAud(order.taxCents)}</td>
                </tr>
              )}
              <tr className="border-t-2 border-gray-800 font-semibold">
                <td className="py-2 text-gray-900">TOTAL</td>
                <td className="py-2 text-right text-gray-900">{centsToAud(order.totalCents)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payments */}
        {paymentRows.length > 0 && (
          <div className="mt-8">
            <h2 className="font-semibold text-gray-700 border-b border-gray-300 pb-1 mb-2">Payments received</h2>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="py-1 text-left font-medium text-gray-600">Date</th>
                  <th className="py-1 text-left font-medium text-gray-600">Method</th>
                  <th className="py-1 text-left font-medium text-gray-600">Reference</th>
                  <th className="py-1 text-right font-medium text-gray-600">Amount</th>
                  <th className="py-1 text-right font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {paymentRows.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100">
                    <td className="py-1 text-gray-600">{formatDateShort(p.receivedAt || p.createdAt)}</td>
                    <td className="py-1 text-gray-700 capitalize">{p.provider}</td>
                    <td className="py-1 text-gray-600">{p.providerRef || '—'}</td>
                    <td className="py-1 text-right text-gray-700">{centsToAud(p.amountCents)}</td>
                    <td className="py-1 text-right">
                      <span className={p.status === 'completed' ? 'text-green-600 font-medium' : 'text-orange-600'}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Notes */}
        {/* Footer */}
        <div className="mt-10 border-t border-gray-200 pt-4 text-center text-xs text-gray-400">
          <p>Forever Shining · The Stainless Steel Monument Company Pty Ltd · ABN 12 115 273 722</p>
          <p>1/44 Port Kembla Dve, Bibra Lake WA 6163 · Ph (08) 6191 0396 · www.forevershining.com.au</p>
        </div>
      </div>
    </>
  );
}
