'use client';

import { useState } from 'react';
import type { PDFQuote } from '#/lib/design-quote';

const SUPPLIERS = [
  { name: 'Australian Photo Ceramics', email: 'info@australianphotoceram.com.au' },
  { name: 'Etched Tags - Celeste', email: 'celeste@etchedtags.com.au' },
  { name: 'Everlon Bronze', email: 'info@everlonbronze.com.au' },
  { name: 'Forever Shining - Admin', email: 'admin@forevershining.com.au' },
  { name: 'Forever Shining Shop - Albert de Boer', email: 'albert@forevershining.com.au' },
  { name: 'Glory Marble - Chris Brown', email: 'chris@glorymarble.com.au' },
  { name: 'Glory Marble - Jie Osciak', email: 'jie@glorymarble.com.au' },
  { name: 'Glory Marble - Erica Yang', email: 'erica@glorymarble.com.au' },
  { name: 'Imaage - Dave Pitts', email: 'dave@imaage.com.au' },
  { name: 'Laser Impressions - Laser Impressions', email: 'info@laserimpressions.com.au' },
  { name: 'Lifetime Images - Margaret Chillari', email: 'margaret@lifetimeimages.com.au' },
  { name: 'Phoenix Bronze - Joe', email: 'joe@phoenixbronze.com.au' },
  { name: 'Photo Tiles - Richard Stralka', email: 'richard@phototiles.com.au' },
  { name: 'Test - Robert', email: 'robert@forevershining.com.au' },
  { name: 'True Memories - Anton', email: 'anton@truememories.com.au' },
];

export type DesignElement =
  | { kind: 'inscription'; id: string; text: string; font: string; sizeMm: number; colorName: string; amount: number }
  | { kind: 'motif'; id: string; name: string; heightMm: number; colorName: string; thumbnail?: string; amount: number }
  | { kind: 'addition'; id: string; name: string; type: string; variant: number; thumbnail?: string; amount: number };

interface Props {
  orderId: string;
  inscriptions: PDFQuote['inscriptions'];
  motifs: PDFQuote['motifs'];
  additions: PDFQuote['additions'];
}

function CopyText({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      onClick={handleCopy}
      title="Click to copy"
      className="text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-copy"
    >
      &ldquo;{text}&rdquo;
      {copied && <span className="ml-2 text-green-600 dark:text-green-400 font-normal text-xs">Copied!</span>}
    </button>
  );
}

export function DesignElementsSection({ orderId, inscriptions, motifs, additions }: Props) {
  const elements: DesignElement[] = [
    ...inscriptions.map((i) => ({ kind: 'inscription' as const, ...i })),
    ...motifs.map((m) => ({ kind: 'motif' as const, ...m })),
    ...additions.map((a) => ({ kind: 'addition' as const, ...a })),
  ];

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [supplier, setSupplier] = useState(SUPPLIERS[0].name);
  const [mailing, setMailing] = useState(false);
  const [mailResult, setMailResult] = useState<'sent' | 'error' | null>(null);

  const allChecked = elements.length > 0 && checked.size === elements.length;

  function toggleAll() {
    setChecked(allChecked ? new Set() : new Set(elements.map((e) => e.id)));
  }

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleMail() {
    const selected = elements.filter((e) => checked.has(e.id));
    if (!selected.length) return;
    const sup = SUPPLIERS.find((s) => s.name === supplier);
    if (!sup) return;

    setMailing(true);
    setMailResult(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/send-supplier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierName: sup.name,
          supplierEmail: sup.email,
          elements: selected.map((e) => {
            if (e.kind === 'inscription') {
              return { kind: 'inscription', label: `Inscription: "${e.text}"`, detail: `Font: ${e.font} | Size: ${e.sizeMm}mm | Colour: ${e.colorName}` };
            }
            if (e.kind === 'motif') {
              return { kind: 'motif', label: `Motif: ${e.name}`, detail: `Height: ${e.heightMm}mm | Colour: ${e.colorName}` };
            }
            return { kind: 'addition', label: `Addition: ${e.name}`, detail: `Type: ${e.type} | Variant: ${e.variant}` };
          }),
        }),
      });
      setMailResult(res.ok ? 'sent' : 'error');
    } catch {
      setMailResult('error');
    }
    setMailing(false);
    setTimeout(() => setMailResult(null), 4000);
  }

  if (elements.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
      {/* Supplier mail bar — above the table */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex flex-wrap items-center gap-3 bg-gray-50 dark:bg-gray-700/40">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mr-auto">
          Design Elements
        </h2>
        <button
          onClick={toggleAll}
          className="text-xs text-blue-600 hover:underline dark:text-blue-400 whitespace-nowrap"
        >
          {allChecked ? 'Deselect all' : 'Select all'}
        </button>
        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
          Mail selected to supplier:
        </span>
        <select
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
          className="rounded border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          {SUPPLIERS.map((s) => (
            <option key={s.name} value={s.name}>{s.name}</option>
          ))}
        </select>
        <button
          onClick={handleMail}
          disabled={mailing || checked.size === 0}
          className="rounded border border-gray-300 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 whitespace-nowrap"
        >
          {mailing ? 'Sending…' : mailResult === 'sent' ? 'Sent ✓' : mailResult === 'error' ? 'Error ✗' : `Mail${checked.size > 0 ? ` (${checked.size})` : ''}`}
        </button>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700">

        {/* Inscriptions */}
        {inscriptions.length > 0 && (
          <div className="px-5 py-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Inscriptions</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="pb-1 font-medium">Text</th>
                  <th className="pb-1 font-medium w-32">Font</th>
                  <th className="pb-1 font-medium w-20">Size (mm)</th>
                  <th className="pb-1 font-medium w-20">Colour</th>
                  <th className="pb-1 font-medium w-24 text-right">Amount</th>
                  <th className="pb-1 w-8"></th>
                </tr>
              </thead>
              <tbody className="text-gray-700 dark:text-gray-300 divide-y divide-gray-50 dark:divide-gray-700/50">
                {inscriptions.map((ins) => (
                  <tr key={ins.id} className={checked.has(ins.id) ? 'bg-blue-50 dark:bg-blue-900/10' : ''}>
                    <td className="py-1.5 pr-4 font-medium">
                      <CopyText text={ins.text} />
                    </td>
                    <td className="py-1.5 pr-4 text-gray-500">{ins.font}</td>
                    <td className="py-1.5 pr-4">{ins.sizeMm}</td>
                    <td className="py-1.5 pr-4">{ins.colorName}</td>
                    <td className="py-1.5 text-right">A$ {ins.amount.toFixed(2)}</td>
                    <td className="py-1.5 pl-3 text-right">
                      <input type="checkbox" checked={checked.has(ins.id)} onChange={() => toggle(ins.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Motifs */}
        {motifs.length > 0 && (
          <div className="px-5 py-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Motifs</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="pb-1 font-medium w-12">Preview</th>
                  <th className="pb-1 font-medium">Name</th>
                  <th className="pb-1 font-medium w-24">Height (mm)</th>
                  <th className="pb-1 font-medium w-20">Colour</th>
                  <th className="pb-1 font-medium w-24 text-right">Amount</th>
                  <th className="pb-1 w-8"></th>
                </tr>
              </thead>
              <tbody className="text-gray-700 dark:text-gray-300 divide-y divide-gray-50 dark:divide-gray-700/50">
                {motifs.map((m) => (
                  <tr key={m.id} className={checked.has(m.id) ? 'bg-blue-50 dark:bg-blue-900/10' : ''}>
                    <td className="py-1.5 pr-4">
                      {m.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.thumbnail} alt="" className="h-8 w-8 object-contain" />
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="py-1.5 pr-4 capitalize">
                      {m.thumbnail ? (
                        <a href={m.thumbnail} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600 dark:text-blue-400">
                          {m.name}
                        </a>
                      ) : m.name}
                    </td>
                    <td className="py-1.5 pr-4">{m.heightMm}</td>
                    <td className="py-1.5 pr-4">{m.colorName}</td>
                    <td className="py-1.5 text-right">A$ {m.amount.toFixed(2)}</td>
                    <td className="py-1.5 pl-3 text-right">
                      <input type="checkbox" checked={checked.has(m.id)} onChange={() => toggle(m.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Additions */}
        {additions.length > 0 && (
          <div className="px-5 py-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Additions</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="pb-1 font-medium w-12">Preview</th>
                  <th className="pb-1 font-medium">Name</th>
                  <th className="pb-1 font-medium w-24">Type</th>
                  <th className="pb-1 font-medium w-20">Variant</th>
                  <th className="pb-1 font-medium w-24 text-right">Amount</th>
                  <th className="pb-1 w-8"></th>
                </tr>
              </thead>
              <tbody className="text-gray-700 dark:text-gray-300 divide-y divide-gray-50 dark:divide-gray-700/50">
                {additions.map((a) => (
                  <tr key={a.id} className={checked.has(a.id) ? 'bg-blue-50 dark:bg-blue-900/10' : ''}>
                    <td className="py-1.5 pr-4">
                      {a.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.thumbnail} alt="" className="h-8 w-8 object-contain" />
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="py-1.5 pr-4">{a.name}</td>
                    <td className="py-1.5 pr-4 capitalize">{a.type}</td>
                    <td className="py-1.5 pr-4">{a.variant}</td>
                    <td className="py-1.5 text-right">A$ {a.amount.toFixed(2)}</td>
                    <td className="py-1.5 pl-3 text-right">
                      <input type="checkbox" checked={checked.has(a.id)} onChange={() => toggle(a.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
