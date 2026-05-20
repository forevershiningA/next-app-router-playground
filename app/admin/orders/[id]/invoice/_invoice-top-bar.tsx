'use client';

import Link from 'next/link';
import { useState } from 'react';

interface InvoiceTopBarProps {
  orderId: string;
  orderLabel: string;
  customerEmail: string;
}

export function InvoiceTopBar({ orderId, orderLabel, customerEmail }: InvoiceTopBarProps) {
  const [emailTo, setEmailTo] = useState(customerEmail);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleEmail() {
    if (!emailTo) return;
    setSending(true);
    try {
      await fetch(`/api/orders/${orderId}/send-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailTo }),
      });
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="print:hidden border-b border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 px-6 py-4 space-y-3">
      {/* Heading */}
      <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        View Order {orderLabel}
      </h1>

      {/* Email row + action buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Email to */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleEmail}
            disabled={sending || !emailTo}
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          >
            {sending ? 'Sending…' : sent ? 'Sent ✓' : 'Email'}
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400">to</span>
          <input
            type="email"
            value={emailTo}
            onChange={(e) => setEmailTo(e.target.value)}
            className="w-64 rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-800 outline-none focus:border-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />
        </div>

        {/* Right-side action buttons */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          >
            Print
          </button>
          <Link
            href={`/admin/orders/${orderId}`}
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          >
            Details
          </Link>
          <Link
            href="/admin/orders"
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          >
            Back
          </Link>
        </div>
      </div>

      {/* Invoice subtitle */}
      <p className="text-sm italic text-gray-400 dark:text-gray-500">Invoice for Your Order</p>
    </div>
  );
}
