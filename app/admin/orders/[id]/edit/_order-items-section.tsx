'use client';

import { useState } from 'react';

export interface OrderItemRow {
  id: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
  metadata: Record<string, string>;
}

interface Props {
  items: OrderItemRow[];
  orderId: string;
  totalCents: number;
}

function centsToAud(cents: number) {
  return `A$ ${(cents / 100).toFixed(2)}`;
}

export function OrderItemsSection({ items, orderId, totalCents }: Props) {
  const [qtys, setQtys] = useState<Record<string, number>>(
    Object.fromEntries(items.map((i) => [i.id, i.quantity]))
  );
  const [prices, setPrices] = useState<Record<string, string>>(
    Object.fromEntries(items.map((i) => [i.id, (i.unitPriceCents / 100).toFixed(2)]))
  );
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  async function saveItem(itemId: string) {
    setSaving(itemId);
    const unitPriceCents = Math.round(parseFloat(prices[itemId] || '0') * 100);
    await fetch(`/api/orders/${orderId}/items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: qtys[itemId], unitPriceCents }),
    });
    setSaving(null);
    setSaved(itemId);
    setTimeout(() => setSaved(null), 2000);
  }

  const computedTotal = items.reduce((sum, item) => {
    const price = parseFloat(prices[item.id] || '0');
    return sum + Math.round(price * 100) * qtys[item.id];
  }, 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
      <div className="border-b border-gray-200 dark:border-gray-700 px-5 py-3">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Order Items</h2>
      </div>

      {items.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-gray-400">No items recorded.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm dark:divide-gray-700">
              <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase dark:bg-gray-700/50 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3">Order Item</th>
                  <th className="px-4 py-3 w-20 text-center">Quantity</th>
                  <th className="px-4 py-3 w-28 text-right">Unit Price</th>
                  <th className="px-4 py-3 w-28 text-right">Item Price</th>
                  <th className="px-4 py-3 w-16 text-center">Save</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {items.map((item) => {
                  const thumb = item.metadata?.thumbnailUrl;
                  const qty = qtys[item.id] ?? item.quantity;
                  const priceStr = prices[item.id] ?? (item.unitPriceCents / 100).toFixed(2);
                  const lineTotal = Math.round(parseFloat(priceStr || '0') * 100) * qty;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 align-top">
                      <td className="px-4 py-3">
                        <div className="flex gap-3 items-start">
                          {thumb ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={thumb} alt="" className="h-12 w-12 rounded object-contain bg-gray-100 dark:bg-gray-700 flex-shrink-0" />
                          ) : null}
                          <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-5">
                            {item.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          min={1}
                          value={qty}
                          onChange={(e) =>
                            setQtys((prev) => ({ ...prev, [item.id]: parseInt(e.target.value) || 1 }))
                          }
                          className="w-16 rounded border border-gray-300 px-2 py-1 text-center text-xs text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-xs text-gray-400">A$</span>
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            value={priceStr}
                            onChange={(e) =>
                              setPrices((prev) => ({ ...prev, [item.id]: e.target.value }))
                            }
                            className="w-24 rounded border border-gray-300 px-2 py-1 text-right text-xs text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-gray-700 dark:text-gray-300">
                        {centsToAud(lineTotal)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => saveItem(item.id)}
                          disabled={saving === item.id}
                          className="text-xs text-blue-600 hover:underline disabled:opacity-50 dark:text-blue-400"
                        >
                          {saving === item.id ? '…' : saved === item.id ? '✓' : 'Save'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-end">
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Total &nbsp;
              <span className="text-gray-600 dark:text-gray-300">{centsToAud(computedTotal || totalCents)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
