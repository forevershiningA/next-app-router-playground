'use client';

import { SUPPORTED_CURRENCIES, type SupportedCurrency } from '#/lib/currency';
import { useCurrency, useSetCurrency } from '#/lib/use-currency';

type UnitCurrencySelectsProps = { compact?: boolean; className?: string };

export default function UnitCurrencySelects({
  compact = false,
  className = '',
}: UnitCurrencySelectsProps) {
  const { currency } = useCurrency();
  const setCurrency = useSetCurrency();
  const selectClass = `cursor-pointer border border-white/20 bg-[#17120d] font-sans font-semibold uppercase text-white shadow-sm outline-none [color-scheme:dark] transition-colors hover:border-[#cfac6c]/60 focus:border-[#cfac6c] focus:ring-2 focus:ring-[#cfac6c]/30 day:border-[#cfc4b4] day:bg-[#fbf9f5] day:text-[#2a2118] day:[color-scheme:light] day:hover:border-[#9f7d43] ${
    compact
      ? 'h-7 rounded-md px-1.5 text-[10px]'
      : 'h-9 rounded-lg px-2.5 text-xs'
  }`;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <label>
        <span className="sr-only">Display currency</span>
        <select
          value={currency}
          onChange={(event) =>
            setCurrency(event.target.value as SupportedCurrency)
          }
          className={selectClass}
          aria-label="Display currency"
        >
          {SUPPORTED_CURRENCIES.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
