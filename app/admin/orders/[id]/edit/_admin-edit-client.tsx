'use client';

import { useState } from 'react';

interface Props {
  itemId: string;
  orderId: string;
  quantity: number;
  unitPriceCents: number;
  itemTotalCents: number;
}

function centsToAud(cents: number) {
  return `A$ ${(cents / 100).toFixed(2)}`;
}

export function AdminEditClient({
  itemId,
  orderId,
  quantity,
  unitPriceCents,
  itemTotalCents,
}: Props) {
  const [qty, setQty] = useState(quantity);
  const [price, setPrice] = useState((unitPriceCents / 100).toFixed(2));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const computed = Math.round(qty * parseFloat(price || '0') * 100);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/orders/${orderId}/items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: qty, unitPriceCents: Math.round(parseFloat(price || '0') * 100) }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      {/* Quantity */}
      <td className="px-4 py-3 text-center">
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(parseInt(e.target.value) || 1)}
          className="w-16 rounded border border-gray-300 px-2 py-1 text-center text-xs text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </td>

      {/* Unit Price */}
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <span className="text-xs text-gray-400">A$</span>
          <input
            type="number"
            min={0}
            step={0.01}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-24 rounded border border-gray-300 px-2 py-1 text-right text-xs text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>
      </td>

      {/* Item total */}
      <td className="px-4 py-3 text-right text-xs text-gray-700 dark:text-gray-300">
        {centsToAud(computed || itemTotalCents)}
      </td>

      {/* Select + save */}
      <td className="px-4 py-3 text-center">
        <div className="flex flex-col items-center gap-1.5">
          <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600" />
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-xs text-blue-600 hover:underline disabled:opacity-50 dark:text-blue-400"
          >
            {saving ? '…' : saved ? '✓' : 'Save'}
          </button>
        </div>
      </td>
    </>
  );
}
