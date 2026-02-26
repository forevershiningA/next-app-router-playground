'use client';

import { useState, useEffect } from 'react';
import AccountNav from '#/components/AccountNav';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number, currency: string = 'AUD') => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: currency,
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'processing':
      case 'in-production':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'pending':
      case 'quote':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'cancelled':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-white/60 bg-white/5 border-white/20';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#050301]">
        <AccountNav />
        <main className="ml-0 flex-1 lg:ml-[400px]">
          <div className="flex h-screen items-center justify-center text-white">
            <p>Loading orders...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#050301]">
      <AccountNav />
      
      <main className="ml-0 flex-1 lg:ml-[400px]">
        <div className="relative min-h-screen text-white">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,160,80,0.18),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(88,144,255,0.18),_transparent_40%)]"
            aria-hidden
          />
          
          <div className="relative mx-auto w-full max-w-6xl px-10 py-10">
            <section className="rounded-[32px] border border-white/10 bg-[#0c0805]/85 px-10 py-6 shadow-[0_25px_65px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
              
              {/* Header */}
              <header className="mb-6 border-b border-white/5 pb-6">
                <p className="text-xs uppercase tracking-[0.4em] text-white/45">Purchases</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your Orders</h1>
                <p className="mt-3 inline-flex items-center gap-2 text-sm text-white/70">
                  <ShoppingBagIcon className="h-5 w-5 text-white/60" aria-hidden />
                  View and track your order history
                </p>
              </header>

              {/* Orders List */}
              {orders.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
                  <ShoppingBagIcon className="mx-auto h-16 w-16 text-white/30" />
                  <h3 className="mt-4 text-lg font-semibold text-white">No orders yet</h3>
                  <p className="mt-2 text-sm text-white/60">
                    Your order history will appear here once you make a purchase
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <article
                      key={order.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-sm transition hover:border-white/20"
                    >
                      {/* Order Header */}
                      <div className="mb-4 flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-white">
                              {order.invoiceNumber || `Order #${order.id.slice(0, 8)}`}
                            </h3>
                            <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status.replace('-', ' ').toUpperCase()}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-white/60">
                            Placed on {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">
                            {formatCurrency(order.totalCents, order.currency)}
                          </p>
                          <p className="text-xs text-white/50">
                            Inc. tax {formatCurrency(order.taxCents, order.currency)}
                          </p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="mb-4 space-y-2 border-t border-white/10 pt-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <div className="flex-1">
                              <p className="text-white">{item.description}</p>
                              {item.quantity > 1 && (
                                <p className="text-xs text-white/50">Quantity: {item.quantity}</p>
                              )}
                            </div>
                            <p className="text-white/70">
                              {formatCurrency(item.unitPriceCents * item.quantity, order.currency)}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Payment Status */}
                      {order.payments.length > 0 && (
                        <div className="border-t border-white/10 pt-4">
                          <p className="mb-2 text-xs uppercase tracking-wider text-white/50">Payment Status</p>
                          {order.payments.map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between text-sm">
                              <div>
                                <p className="text-white">
                                  {payment.provider.charAt(0).toUpperCase() + payment.provider.slice(1)}
                                </p>
                                {payment.receivedAt && (
                                  <p className="text-xs text-white/50">
                                    Received: {formatDate(payment.receivedAt)}
                                  </p>
                                )}
                              </div>
                              <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(payment.status)}`}>
                                {payment.status.toUpperCase()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="mt-4 flex gap-2 border-t border-white/10 pt-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                        >
                          View Details
                        </button>
                        {order.invoiceNumber && (
                          <button
                            onClick={() => alert('Invoice download coming soon')}
                            className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                          >
                            Download Invoice
                          </button>
                        )}
                        {order.status === 'processing' || order.status === 'in-production' ? (
                          <button
                            onClick={() => alert('Order tracking coming soon')}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
                          >
                            Track Order
                          </button>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              )}

            </section>
          </div>
        </div>
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative mx-4 w-full max-w-2xl rounded-2xl border border-white/20 bg-gradient-to-br from-[#1a1410] to-[#0f0a07] p-6 shadow-2xl">
            <h3 className="mb-4 text-xl font-semibold text-white">
              Order Details: {selectedOrder.invoiceNumber || selectedOrder.id.slice(0, 8)}
            </h3>
            
            <div className="mb-4 max-h-[60vh] space-y-4 overflow-y-auto">
              {/* Order Info */}
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <h4 className="mb-2 text-sm font-medium text-white/80">Order Information</h4>
                <div className="space-y-1 text-sm">
                  <p className="flex justify-between">
                    <span className="text-white/60">Status:</span>
                    <span className="text-white">{selectedOrder.status}</span>
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

              {/* Items */}
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
                        {formatCurrency(item.unitPriceCents * item.quantity, selectedOrder.currency)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="space-y-1 text-sm">
                  <p className="flex justify-between">
                    <span className="text-white/60">Subtotal:</span>
                    <span className="text-white">{formatCurrency(selectedOrder.subtotalCents, selectedOrder.currency)}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-white/60">Tax:</span>
                    <span className="text-white">{formatCurrency(selectedOrder.taxCents, selectedOrder.currency)}</span>
                  </p>
                  <p className="flex justify-between border-t border-white/10 pt-2 text-lg font-semibold">
                    <span className="text-white">Total:</span>
                    <span className="text-white">{formatCurrency(selectedOrder.totalCents, selectedOrder.currency)}</span>
                  </p>
                </div>
              </div>
            </div>

            <button
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
