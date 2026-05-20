'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const FIELD_CLS =
  'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400';

const LABEL_CLS =
  'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

interface LineItem {
  description: string;
  quantity: string;
  unitPrice: string;
}

interface CustomerResult {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  organization: string | null;
}

const emptyItem = (): LineItem => ({
  description: '',
  quantity: '1',
  unitPrice: '',
});

function parseCents(value: string): number {
  const n = parseFloat(value.replace(/,/g, ''));
  return isNaN(n) ? 0 : Math.round(n * 100);
}

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function customerLabel(c: CustomerResult): string {
  const name = [c.firstName, c.lastName].filter(Boolean).join(' ');
  if (name) return `${name} — ${c.email}`;
  if (c.organization) return `${c.organization} — ${c.email}`;
  return c.email;
}

function CustomerPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (email: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CustomerResult[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(async () => {
      const res = await fetch(`/api/admin/customers/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = (await res.json()) as CustomerResult[];
        setResults(data);
        setOpen(true);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  function select(c: CustomerResult) {
    onChange(c.email);
    setSelectedLabel(customerLabel(c));
    setQuery('');
    setOpen(false);
  }

  function clear() {
    onChange('');
    setSelectedLabel('');
    setQuery('');
    setResults([]);
  }

  return (
    <div ref={containerRef} className="relative">
      {value ? (
        <div className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
          <span className="flex-1 truncate">{selectedLabel || value}</span>
          <button
            type="button"
            onClick={clear}
            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 text-xs shrink-0"
          >
            ✕ Change
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query && setOpen(true)}
              placeholder="Search by name, email or company…"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
            />
          </div>
          {open && results.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg text-sm max-h-56 overflow-auto">
              {results.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => select(c)}
                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-900 dark:text-gray-100"
                  >
                    {customerLabel(c)}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {open && results.length === 0 && query.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg text-sm px-4 py-3 text-gray-500 dark:text-gray-400">
              No customers found.{' '}
              <Link href="/admin/customers/new" className="text-blue-600 dark:text-blue-400 hover:underline">
                Create one
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function NewOrderPage() {
  const router = useRouter();

  const [customerEmail, setCustomerEmail] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [status, setStatus] = useState('quote');
  const [currency, setCurrency] = useState('AUD');
  const [taxPercent, setTaxPercent] = useState('0');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<LineItem[]>([emptyItem()]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Derived totals
  const subtotalCents = items.reduce((sum, item) => {
    const qty = parseInt(item.quantity) || 0;
    return sum + qty * parseCents(item.unitPrice);
  }, 0);
  const taxRate = parseFloat(taxPercent) || 0;
  const taxCents = Math.round(subtotalCents * (taxRate / 100));
  const totalCents = subtotalCents + taxCents;

  function updateItem(index: number, field: keyof LineItem, value: string) {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const validItems = items.filter((i) => i.description.trim());
    if (validItems.length === 0) {
      setError('At least one line item with a description is required');
      return;
    }
    if (!customerEmail.trim()) {
      setError('Please select a customer');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: customerEmail.trim(),
          invoiceNumber: invoiceNumber.trim() || undefined,
          status,
          currency,
          taxPercent: taxRate,
          notes: notes.trim() || undefined,
          items: validItems.map((item) => ({
            description: item.description.trim(),
            quantity: parseInt(item.quantity) || 1,
            unitPriceCents: parseCents(item.unitPrice),
          })),
        }),
      });

      const data = (await res.json()) as { id?: string; error?: string };

      if (!res.ok) {
        setError(data.error ?? 'Failed to create order');
        return;
      }

      router.push(`/admin/orders/${data.id}`);
      router.refresh();
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 px-6 py-8 md:px-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Add Custom Order
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manually create an order for any customer account.
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          ← Back to Orders
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
        {/* Order details */}
        <section>
          <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
            Order Details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={LABEL_CLS}>
                Customer <span className="text-red-500">*</span>
              </label>
              <CustomerPicker value={customerEmail} onChange={setCustomerEmail} />
              {!customerEmail && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Search by name, email, or company. Need to create one first?{' '}
                  <Link
                    href="/admin/customers/new"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    New Customer
                  </Link>
                </p>
              )}
            </div>
            <div>
              <label htmlFor="invoiceNumber" className={LABEL_CLS}>
                Invoice Number
              </label>
              <input
                id="invoiceNumber"
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="e.g. INV-2026-001"
                className={FIELD_CLS}
              />
            </div>
            <div>
              <label htmlFor="status" className={LABEL_CLS}>
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={FIELD_CLS}
              >
                <option value="quote">Quote</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="in_production">In Production</option>
                <option value="shipped">Shipped</option>
                <option value="processed">Processed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label htmlFor="currency" className={LABEL_CLS}>
                Currency
              </label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={FIELD_CLS}
              >
                <option value="AUD">AUD</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
                <option value="NZD">NZD</option>
              </select>
            </div>
            <div>
              <label htmlFor="taxPercent" className={LABEL_CLS}>
                Tax Rate
              </label>
              <select
                id="taxPercent"
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value)}
                className={FIELD_CLS}
              >
                <option value="0">0% (No tax)</option>
                <option value="10">10% (GST)</option>
                <option value="20">20% (VAT)</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="notes" className={LABEL_CLS}>
                Notes
              </label>
              <textarea
                id="notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal notes about this order…"
                className={FIELD_CLS}
              />
            </div>
          </div>
        </section>

        {/* Line items */}
        <section>
          <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
            Line Items
          </h2>

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 dark:text-gray-400 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left font-medium tracking-wide">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left font-medium tracking-wide w-24">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-left font-medium tracking-wide w-36">
                    Unit Price
                  </th>
                  <th className="px-4 py-3 text-right font-medium tracking-wide w-28">
                    Line Total
                  </th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {items.map((item, index) => {
                  const qty = parseInt(item.quantity) || 0;
                  const lineTotal = qty * parseCents(item.unitPrice);
                  return (
                    <tr key={index} className="bg-white dark:bg-gray-800">
                      <td className="px-4 py-2 align-top">
                        <textarea
                          rows={3}
                          placeholder="e.g. Granite Headstone 600×600mm&#10;Laser etching - name & dates&#10;Delivery & installation"
                          value={item.description}
                          onChange={(e) =>
                            updateItem(index, 'description', e.target.value)
                          }
                          className={FIELD_CLS + ' resize-y'}
                        />
                      </td>
                      <td className="px-4 py-2 align-top">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(index, 'quantity', e.target.value)
                          }
                          className={FIELD_CLS}
                        />
                      </td>
                      <td className="px-4 py-2 align-top">
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="0.00"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateItem(index, 'unitPrice', e.target.value)
                          }
                          className={FIELD_CLS}
                        />
                      </td>
                      <td className="px-4 py-2 align-top text-right font-medium text-gray-700 dark:text-gray-300">
                        {lineTotal > 0 ? formatMoney(lineTotal) : '—'}
                      </td>
                      <td className="px-4 py-2 align-top text-center">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                            aria-label="Remove item"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={addItem}
            className="mt-3 flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            <PlusIcon className="h-4 w-4" />
            Add item
          </button>

          {/* Totals */}
          <div className="mt-4 flex justify-end">
            <dl className="w-64 space-y-1 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <dt>Subtotal</dt>
                <dd>{formatMoney(subtotalCents)}</dd>
              </div>
              {taxRate > 0 && (
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <dt>Tax ({taxRate}%)</dt>
                  <dd>{formatMoney(taxCents)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-1 font-semibold text-gray-900 dark:text-gray-100">
                <dt>Total ({currency})</dt>
                <dd>{formatMoney(totalCents)}</dd>
              </div>
            </dl>
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
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating…' : 'Create Order'}
          </button>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
