'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const FIELD_CLS =
  'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400';

const LABEL_CLS = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

const PROVIDERS = ['Bank Transfer', 'Stripe', 'PayPal', 'PayWay', 'Cash', 'Cheque', 'Other'];
const STATUSES = ['completed', 'pending', 'failed', 'refunded'];

export default function NewPaymentPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    orderId: '',
    provider: 'Bank Transfer',
    providerRef: '',
    amount: '',
    currency: 'AUD',
    status: 'completed',
    receivedAt: new Date().toISOString().slice(0, 16),
  });

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const amountCents = Math.round(parseFloat(form.amount.replace(/,/g, '')) * 100);
    if (!form.orderId.trim()) return setError('Order ID is required.');
    if (isNaN(amountCents) || amountCents <= 0) return setError('Enter a valid amount.');

    setSaving(true);
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: form.orderId.trim(),
          provider: form.provider,
          providerRef: form.providerRef.trim() || null,
          amountCents,
          currency: form.currency,
          status: form.status,
          receivedAt: form.receivedAt ? new Date(form.receivedAt).toISOString() : null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Error ${res.status}`);
      }
      router.push('/admin/payments');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save payment.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8 px-6 py-8 md:px-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add Payment</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manually record a payment against an existing order.
          </p>
        </div>
        <Link
          href="/admin/payments"
          className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          ← Back to Payments
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
        {/* Payment details */}
        <section>
          <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
            Payment Details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={LABEL_CLS}>
                Order ID <span className="text-red-500">*</span>
              </label>
              <input
                className={FIELD_CLS}
                placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
                value={form.orderId}
                onChange={(e) => set('orderId', e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Paste the UUID from the order page.
              </p>
            </div>

            <div>
              <label className={LABEL_CLS}>Provider</label>
              <select className={FIELD_CLS} value={form.provider} onChange={(e) => set('provider', e.target.value)}>
                {PROVIDERS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL_CLS}>Transaction / Reference</label>
              <input
                className={FIELD_CLS}
                placeholder="e.g. ch_3abc123"
                value={form.providerRef}
                onChange={(e) => set('providerRef', e.target.value)}
              />
            </div>

            <div>
              <label className={LABEL_CLS}>
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                className={FIELD_CLS}
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => set('amount', e.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Currency</label>
              <input
                className={FIELD_CLS}
                placeholder="AUD"
                value={form.currency}
                onChange={(e) => set('currency', e.target.value.toUpperCase())}
                maxLength={3}
              />
            </div>

            <div>
              <label className={LABEL_CLS}>Status</label>
              <select className={FIELD_CLS} value={form.status} onChange={(e) => set('status', e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL_CLS}>Received At</label>
              <input
                type="datetime-local"
                className={FIELD_CLS}
                value={form.receivedAt}
                onChange={(e) => set('receivedAt', e.target.value)}
              />
            </div>
          </div>
        </section>

        {error && (
          <p className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Add Payment'}
          </button>
          <Link
            href="/admin/payments"
            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
