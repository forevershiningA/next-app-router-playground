'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBagIcon,
  UserCircleIcon,
  DocumentDuplicateIcon,
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

function statusTone(status: string) {
  switch (status) {
    case 'completed':
      return 'text-emerald-300';
    case 'processing':
    case 'in-production':
      return 'text-sky-300';
    case 'pending':
    case 'quote':
      return 'text-amber-300';
    case 'cancelled':
      return 'text-rose-300';
    default:
      return 'text-white/70';
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
    <div className="relative min-h-screen bg-[#050301] text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,160,80,0.18),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(88,144,255,0.18),_transparent_40%)]"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-7xl px-10 py-10">
        <section
          className="rounded-[32px] border border-white/10 bg-[#0c0805]/85 px-10 py-6 shadow-[0_25px_65px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
          aria-labelledby="your-orders-heading"
        >
              {/* Header — mirrors Saved Designs */}
              <header className="mb-6 border-b border-white/5 pb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2
                      id="your-orders-heading"
                      className="text-3xl font-semibold tracking-tight"
                    >
                      Your Orders
                    </h2>
                    <p className="mt-3 inline-flex items-center gap-2 text-sm text-white/70">
                      <UserCircleIcon className="h-5 w-5 text-white/60" aria-hidden />
                      {sessionEmail ?? 'View and track your order history'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/my-account/details"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                    >
                      <UserCircleIcon className="h-4 w-4 text-white/60" aria-hidden />
                      Account Details
                    </Link>
                    <Link
                      href="/my-account/invoice"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4 text-white/60" aria-hidden />
                      Invoice Details
                    </Link>
                  </div>
                </div>
              </header>

              {/* Grid — mirrors Saved Designs */}
              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {orders.map((order) => {
                  const title = order.invoiceNumber || `Order #${order.id.slice(0, 8)}`;
                  const priceLabel = formatCurrency(order.totalCents, order.currency);
                  const description = order.items.length
                    ? order.items
                        .map((item) =>
                          item.quantity > 1
                            ? `${item.description} ×${item.quantity}`
                            : item.description,
                        )
                        .join(' · ')
                    : 'No items recorded for this order.';

                  return (
                    <article
                      key={order.id}
                      className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-sm"
                    >
                      {/* Preview — stylised order tile (orders have no screenshot) */}
                      <div className="mb-4">
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gradient-to-br from-[#1a1208] to-[#0c0805]">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,168,79,0.18),_transparent_65%)]" />
                          <div className="relative flex h-full w-full flex-col items-center justify-center p-4 text-center">
                            <ShoppingBagIcon
                              className="h-14 w-14 text-[#D4A84F]/80"
                              aria-hidden
                            />
                            <p
                              className={`mt-3 text-xs font-semibold uppercase tracking-[0.35em] ${statusTone(order.status)}`}
                            >
                              {statusLabel(order.status)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Card Header */}
                      <div className="mb-3">
                        <h3 className="text-lg font-semibold text-white">{title}</h3>
                        <div className="mt-1 flex items-center justify-between text-sm text-white/70">
                          <span className="font-medium text-[#D4A84F]">{priceLabel}</span>
                          <span className="text-white/50">
                            {relativeFromNow(order.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="mb-4 flex-1 text-sm text-white/75 line-clamp-2">
                        {description}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="rounded-lg px-4 py-2 text-xs font-medium text-black transition cursor-pointer text-center"
                          style={{ backgroundColor: '#D4A84F' }}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLElement).style.backgroundColor = '#C49940')
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLElement).style.backgroundColor = '#D4A84F')
                          }
                        >
                          Details
                        </button>
                        {order.invoiceNumber && (
                          <button
                            type="button"
                            onClick={() => alert('Invoice download coming soon')}
                            className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10 cursor-pointer"
                          >
                            Invoice
                          </button>
                        )}
                        {(order.status === 'processing' ||
                          order.status === 'in-production') && (
                          <button
                            type="button"
                            onClick={() => alert('Order tracking coming soon')}
                            className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10 cursor-pointer"
                          >
                            Track
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
                {!orders.length && !loading && (
                  <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/70">
                    No orders yet. Your order history will appear here once you make a purchase.
                  </div>
                )}
                {loading && (
                  <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/70">
                    Loading your orders...
                  </div>
                )}
              </div>
            </section>
          </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative mx-4 w-full max-w-2xl rounded-2xl border border-white/20 bg-gradient-to-br from-[#1a1410] to-[#0f0a07] p-6 shadow-2xl">
            <h3 className="mb-4 text-xl font-semibold text-white">
              Order Details: {selectedOrder.invoiceNumber || selectedOrder.id.slice(0, 8)}
            </h3>

            <div className="mb-4 max-h-[60vh] space-y-4 overflow-y-auto">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <h4 className="mb-2 text-sm font-medium text-white/80">Order Information</h4>
                <div className="space-y-1 text-sm">
                  <p className="flex justify-between">
                    <span className="text-white/60">Status:</span>
                    <span className="text-white">{statusLabel(selectedOrder.status)}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-white/60">Created:</span>
                    <span className="text-white">{formatDate(selectedOrder.createdAt)}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-white/60">Updated:</span>
                    <span className="text-white">{formatDate(selectedOrder.updatedAt)}</span>
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <h4 className="mb-2 text-sm font-medium text-white/80">Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div>
                        <p className="text-white">{item.description}</p>
                        <p className="text-xs text-white/50">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-white">
                        {formatCurrency(
                          item.unitPriceCents * item.quantity,
                          selectedOrder.currency,
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.payments.length > 0 && (
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <h4 className="mb-2 text-sm font-medium text-white/80">Payments</h4>
                  <div className="space-y-2">
                    {selectedOrder.payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div>
                          <p className="text-white">
                            {payment.provider.charAt(0).toUpperCase() +
                              payment.provider.slice(1)}
                          </p>
                          {payment.receivedAt && (
                            <p className="text-xs text-white/50">
                              Received: {formatDate(payment.receivedAt)}
                            </p>
                          )}
                        </div>
                        <span className={`text-xs font-medium ${statusTone(payment.status)}`}>
                          {payment.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="space-y-1 text-sm">
                  <p className="flex justify-between">
                    <span className="text-white/60">Subtotal:</span>
                    <span className="text-white">
                      {formatCurrency(selectedOrder.subtotalCents, selectedOrder.currency)}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-white/60">Tax:</span>
                    <span className="text-white">
                      {formatCurrency(selectedOrder.taxCents, selectedOrder.currency)}
                    </span>
                  </p>
                  <p className="flex justify-between border-t border-white/10 pt-2 text-lg font-semibold">
                    <span className="text-white">Total:</span>
                    <span className="text-white">
                      {formatCurrency(selectedOrder.totalCents, selectedOrder.currency)}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
