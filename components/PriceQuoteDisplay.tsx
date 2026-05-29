import type { PDFQuote } from '#/lib/design-quote';

const fmt = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency, maximumFractionDigits: 2 }).format(
    amount,
  );

export function PriceQuoteDisplay({ quote }: { quote: PDFQuote }) {
  const { currency, items, additions, motifs, inscriptions, subtotal, tax, total, note } = quote;

  return (
    <div className="space-y-4 rounded-xl border border-white/10 day:border-gray-200 bg-white/5 day:bg-gray-50 p-5 text-sm text-white day:text-gray-900">
      {/* Line items */}
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10 day:border-gray-200 text-xs uppercase tracking-widest text-white/40 day:text-gray-400">
            <th className="pb-2 text-left font-medium">Item</th>
            <th className="pb-2 text-center font-medium">Qty</th>
            <th className="pb-2 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 day:divide-gray-100">
          {items.map((item) => (
            <tr key={item.label}>
              <td className="py-2">{item.label}</td>
              <td className="py-2 text-center text-white/60 day:text-gray-500">{item.quantity}</td>
              <td className="py-2 text-right">{fmt(item.amount, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Motifs */}
      {motifs.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs uppercase tracking-widest text-white/40 day:text-gray-400">Motifs</p>
          <div className="space-y-1">
            {motifs.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {m.thumbnail && (
                    <img src={m.thumbnail} alt={m.name} className="h-6 w-6 object-contain opacity-80" />
                  )}
                  <span className="text-white/80 day:text-gray-700">{m.name}</span>
                  <span className="text-white/40 day:text-gray-400">{m.colorName} · {m.heightMm}mm</span>
                </div>
                <span>{fmt(m.amount, currency)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inscriptions */}
      {inscriptions.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs uppercase tracking-widest text-white/40 day:text-gray-400">Inscriptions</p>
          <div className="space-y-1">
            {inscriptions.map((ins) => (
              <div key={ins.id} className="flex items-start justify-between gap-2">
                <div>
                  <span className="italic text-white/80 day:text-gray-700">"{ins.text}"</span>
                  <span className="ml-2 text-white/40 day:text-gray-400">{ins.font} · {ins.sizeMm}mm · {ins.colorName}</span>
                </div>
                <span className="shrink-0">{fmt(ins.amount, currency)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additions */}
      {additions.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs uppercase tracking-widest text-white/40 day:text-gray-400">Additions</p>
          <div className="space-y-1">
            {additions.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {a.thumbnail && (
                    <img src={a.thumbnail} alt={a.name} className="h-6 w-6 object-contain opacity-80" />
                  )}
                  <span className="text-white/80 day:text-gray-700">{a.name}</span>
                </div>
                <span>{fmt(a.amount, currency)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Totals */}
      <div className="border-t border-white/10 day:border-gray-200 pt-3 space-y-1">
        <div className="flex justify-between text-white/60 day:text-gray-500">
          <span>Subtotal</span>
          <span>{fmt(subtotal, currency)}</span>
        </div>
        <div className="flex justify-between text-white/60 day:text-gray-500">
          <span>GST (10%)</span>
          <span>{fmt(tax, currency)}</span>
        </div>
        <div className="flex justify-between text-base font-semibold text-[#D4A84F]">
          <span>Total</span>
          <span>{fmt(total, currency)}</span>
        </div>
      </div>

      {note && <p className="text-xs text-white/30 day:text-gray-400">{note}</p>}
    </div>
  );
}
