'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBagIcon,
  UserCircleIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

type Order = {
  id: string;
  status: string;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  invoiceNumber: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  payments: Payment[];
};

type OrderItem = {
  id: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
  metadata: any;
};

type Payment = {
  id: string;
  provider: string;
  providerRef: string | null;
  amountCents: number;
  currency: string;
  status: string;
  receivedAt: string | null;
  createdAt: string;
};

const formatCurrency = (cents: number, currency: string = 'AUD') =>
  new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency,
  }).format(cents / 100);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

function relativeFromNow(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} wk ago`;
  if (days < 365) return `${Math.floor(days / 30)} mo ago`;
  return `${Math.floor(days / 365)} yr ago`;
}

function statusLabel(status: string) {
  return status.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusBadgeClasses(status: string) {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 day:border-emerald-600/30 day:bg-emerald-50 day:text-emerald-700';
    case 'processing':
    case 'in-production':
      return 'border-sky-500/30 bg-sky-500/10 text-sky-400 day:border-sky-600/30 day:bg-sky-50 day:text-sky-700';
    case 'pending':
    case 'quote':
      return 'border-[#c49a45]/35 bg-[#c49a45]/10 text-[#c49a45] day:border-[#9a742f]/30 day:bg-[#9a742f]/10 day:text-[#78541c]';
    case 'cancelled':
      return 'border-rose-500/30 bg-rose-500/10 text-rose-400 day:border-rose-600/30 day:bg-rose-50 day:text-rose-700';
    default:
      return 'border-white/20 bg-white/5 text-stone-300 day:border-stone-300 day:bg-stone-100 day:text-stone-700';
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    })();

    (async () => {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        setSessionEmail(data?.session?.email ?? null);
      } catch {
        /* noop */
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#0c0b0a] text-white day:bg-[#f7f4ee] day:text-[#1a1714]">
      {/* Studio Header */}
      <section className="relative overflow-hidden border-b border-white/10 bg-[#161412] day:border-[#dfd7ca] day:bg-[#f5f1e8]">
        <div className="absolute inset-0 bg-radial-gradient-to-r from-amber-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#c49a45]/35 bg-[#c49a45]/10 px-3 py-1 text-[11px] font-semibold tracking-widest text-[#c49a45] uppercase day:border-[#9a742f]/30 day:bg-[#9a742f]/10 day:text-[#78541c]">
                Customer Portal · Order History
              </div>
              <h1 className="font-serif text-3xl font-normal tracking-tight text-white day:text-[#1a1714] sm:text-4xl lg:text-[40px]">
                Your Orders
              </h1>
              <p className="mt-2 text-sm text-stone-300 day:text-[#5a5248]">
                {sessionEmail ? `Signed in as ${sessionEmail}` : 'View and track your completed and pending memorial orders'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/my-account"
                className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-white transition hover:border-white/30 hover:bg-white/10 day:border-[#dfd7ca] day:bg-[#eee8dc]/70 day:text-[#1a1714] day:hover:bg-[#e7e0d2]"
              >
                Saved Designs
              </Link>
              <Link
                href="/select-shape"
                className="inline-flex items-center gap-2 rounded-lg border border-[#c49a45] bg-[#c49a45] px-4 py-2.5 text-xs font-semibold text-[#121110] transition hover:bg-[#d5ad55] day:border-[#9a742f] day:bg-[#9a742f] day:text-white day:hover:bg-[#856325]"
              >
                <SparklesIcon className="h-4 w-4" />
                <span>New Design</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 pt-6 pb-20 md:px-6 md:pt-8 lg:px-8">
        {loading && (
          <div className="rounded-xl border border-white/10 bg-[#161412] p-12 text-center day:border-[#dfd7ca] day:bg-white day:shadow-[0_8px_24px_rgba(40,30,20,0.06)]">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#c49a45] border-t-transparent day:border-[#9a742f]" />
            <p className="mt-4 text-sm text-stone-300 day:text-[#5a5248]">Loading your orders…</p>
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-[#161412] p-12 text-center day:border-[#dfd7ca] day:bg-white day:shadow-[0_8px_24px_rgba(40,30,20,0.06)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#c49a45]/30 bg-[#c49a45]/10 day:border-[#9a742f]/30 day:bg-[#9a742f]/10">
              <ShoppingBagIcon className="h-8 w-8 text-[#c49a45] day:text-[#9a742f]" aria-hidden />
            </div>
            <h2 className="mt-5 font-serif text-2xl font-normal text-white day:text-[#1a1714]">
              No orders yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-stone-300 day:text-[#5a5248]">
              Your order history will appear here once you place a quote or finalize a memorial order.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/select-shape"
                className="inline-flex items-center gap-2 rounded-lg border border-[#c49a45] bg-[#c49a45] px-5 py-2.5 text-xs font-semibold text-[#121110] transition hover:bg-[#d5ad55] day:border-[#9a742f] day:bg-[#9a742f] day:text-white day:hover:bg-[#856325]"
              >
                <SparklesIcon className="h-4 w-4" />
                <span>Start Designing</span>
              </Link>
            </div>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => {
              const title = order.invoiceNumber || `Order #${order.id.slice(0, 8)}`;
              const priceLabel = formatCurrency(order.totalCents, order.currency);
              const description = order.items.length
                ? order.items
                    .map((item) =>
                      item.quantity > 1 ? `${item.description} ×${item.quantity}` : item.description
                    )
                    .join(' · ')
                : 'No items recorded for this order.';

              return (
                <article
                  key={order.id}
                  className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#161412] transition-all hover:border-[#c49a45]/40 day:border-[#dfd7ca] day:bg-white day:shadow-[0_8px_24px_rgba(40,30,20,0.06)] day:hover:border-[#9a742f]/40"
                >
                  {/* Preview tile */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-b from-[#1c1a17] to-[#141210] day:from-[#f8f5ee] day:to-[#ede6d8]">
                    <div className="absolute inset-0 bg-radial-gradient-to-t from-black/40 via-transparent to-transparent day:from-stone-900/10" />
                    <div className="relative flex h-full w-full flex-col items-center justify-center p-6 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#c49a45]/30 bg-[#c49a45]/10 day:border-[#9a742f]/30 day:bg-[#9a742f]/10">
                        <ShoppingBagIcon className="h-7 w-7 text-[#c49a45] day:text-[#9a742f]" aria-hidden />
                      </div>
                      <span
                        className={`mt-3 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase ${statusBadgeClasses(
                          order.status
                        )}`}
                      >
                        {statusLabel(order.status)}
                      </span>
                    </div>
                  </div>

                  {/* Card Header & Content */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-serif text-lg font-normal text-white day:text-[#1a1714]">
                        {title}
                      </h3>
                      <span className="text-xs text-stone-400 day:text-[#786e61]">
                        {relativeFromNow(order.createdAt)}
                      </span>
                    </div>

                    <div className="mt-2 text-lg font-serif font-medium text-[#c49a45] day:text-[#9a742f]">
                      {priceLabel}
                    </div>

                    <p className="mt-3 flex-1 text-sm text-stone-300 day:text-[#5a5248] line-clamp-2">
                      {description}
                    </p>

                    {/* Action Buttons */}
                    <div className="mt-5 flex flex-wrap items-center gap-2 pt-4 border-t border-white/10 day:border-[#dfd7ca]">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center justify-center rounded-lg border border-[#c49a45] bg-[#c49a45] px-4 py-2 text-xs font-semibold text-[#121110] transition hover:bg-[#d5ad55] day:border-[#9a742f] day:bg-[#9a742f] day:text-white day:hover:bg-[#856325] cursor-pointer"
                      >
                        Order Details
                      </button>

                      {order.invoiceNumber && (
                        <button
                          type="button"
                          onClick={() => alert('Invoice download coming soon')}
                          className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-white transition hover:border-white/30 hover:bg-white/10 day:border-[#dfd7ca] day:bg-[#eee8dc]/70 day:text-[#1a1714] day:hover:bg-[#e7e0d2] cursor-pointer"
                        >
                          Invoice
                        </button>
                      )}

                      {(order.status === 'processing' || order.status === 'in-production') && (
                        <button
                          type="button"
                          onClick={() => alert('Order tracking coming soon')}
                          className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-white transition hover:border-white/30 hover:bg-white/10 day:border-[#dfd7ca] day:bg-[#eee8dc]/70 day:text-[#1a1714] day:hover:bg-[#e7e0d2] cursor-pointer"
                        >
                          Track
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 day:bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl rounded-2xl border border-white/15 bg-[#161412] p-6 shadow-2xl day:border-[#dfd7ca] day:bg-[#fbf9f5] day:shadow-xl sm:p-8">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5 day:border-[#dfd7ca]">
              <div>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${statusBadgeClasses(
                    selectedOrder.status
                  )}`}
                >
                  {statusLabel(selectedOrder.status)}
                </span>
                <h3 className="mt-2 font-serif text-2xl font-normal text-white day:text-[#1a1714]">
                  {selectedOrder.invoiceNumber || `Order #${selectedOrder.id.slice(0, 8)}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg border border-white/15 bg-white/[0.04] p-1.5 text-stone-400 transition hover:bg-white/10 hover:text-white day:border-[#dfd7ca] day:bg-white day:text-[#786e61] day:hover:text-[#1a1714]"
                aria-label="Close modal"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 max-h-[60vh] space-y-4 overflow-y-auto pr-1">
              {/* Order Info */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4.5 day:border-[#dfd7ca] day:bg-white">
                <h4 className="font-serif text-sm font-medium text-white/90 day:text-[#1a1714]">
                  Order Information
                </h4>
                <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <div className="flex justify-between sm:block">
                    <dt className="text-xs text-stone-400 day:text-[#786e61]">Status</dt>
                    <dd className="font-medium text-white day:text-[#1a1714]">
                      {statusLabel(selectedOrder.status)}
                    </dd>
                  </div>
                  <div className="flex justify-between sm:block">
                    <dt className="text-xs text-stone-400 day:text-[#786e61]">Date Placed</dt>
                    <dd className="font-medium text-white day:text-[#1a1714]">
                      {formatDate(selectedOrder.createdAt)}
                    </dd>
                  </div>
                  <div className="flex justify-between sm:block">
                    <dt className="text-xs text-stone-400 day:text-[#786e61]">Last Updated</dt>
                    <dd className="font-medium text-white day:text-[#1a1714]">
                      {formatDate(selectedOrder.updatedAt)}
                    </dd>
                  </div>
                  <div className="flex justify-between sm:block">
                    <dt className="text-xs text-stone-400 day:text-[#786e61]">Invoice Ref</dt>
                    <dd className="font-medium text-[#c49a45] day:text-[#9a742f]">
                      {selectedOrder.invoiceNumber || 'Pending'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Items */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4.5 day:border-[#dfd7ca] day:bg-white">
                <h4 className="font-serif text-sm font-medium text-white/90 day:text-[#1a1714]">
                  Order Items
                </h4>
                <div className="mt-3 divide-y divide-white/10 day:divide-[#dfd7ca]">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between py-2.5 text-sm first:pt-0 last:pb-0">
                      <div>
                        <p className="font-medium text-white day:text-[#1a1714]">{item.description}</p>
                        <p className="text-xs text-stone-400 day:text-[#786e61]">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-serif font-medium text-[#c49a45] day:text-[#9a742f]">
                        {formatCurrency(item.unitPriceCents * item.quantity, selectedOrder.currency)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payments */}
              {selectedOrder.payments.length > 0 && (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4.5 day:border-[#dfd7ca] day:bg-white">
                  <h4 className="font-serif text-sm font-medium text-white/90 day:text-[#1a1714]">
                    Payments
                  </h4>
                  <div className="mt-3 space-y-2">
                    {selectedOrder.payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium text-white day:text-[#1a1714]">
                            {payment.provider.charAt(0).toUpperCase() + payment.provider.slice(1)}
                          </p>
                          {payment.receivedAt && (
                            <p className="text-xs text-stone-400 day:text-[#786e61]">
                              Received: {formatDate(payment.receivedAt)}
                            </p>
                          )}
                        </div>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${statusBadgeClasses(
                            payment.status
                          )}`}
                        >
                          {payment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4.5 day:border-[#dfd7ca] day:bg-white">
                <div className="space-y-1.5 text-sm">
                  <p className="flex justify-between">
                    <span className="text-stone-400 day:text-[#786e61]">Subtotal</span>
                    <span className="text-white day:text-[#1a1714]">
                      {formatCurrency(selectedOrder.subtotalCents, selectedOrder.currency)}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-stone-400 day:text-[#786e61]">Tax (GST)</span>
                    <span className="text-white day:text-[#1a1714]">
                      {formatCurrency(selectedOrder.taxCents, selectedOrder.currency)}
                    </span>
                  </p>
                  <p className="flex justify-between border-t border-white/10 pt-2 font-serif text-base font-semibold day:border-[#dfd7ca]">
                    <span className="text-white day:text-[#1a1714]">Total</span>
                    <span className="text-[#c49a45] day:text-[#9a742f]">
                      {formatCurrency(selectedOrder.totalCents, selectedOrder.currency)}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] px-5 py-2.5 text-xs font-semibold text-white transition hover:border-white/30 hover:bg-white/10 day:border-[#dfd7ca] day:bg-[#eee8dc]/70 day:text-[#1a1714] day:hover:bg-[#e7e0d2]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
