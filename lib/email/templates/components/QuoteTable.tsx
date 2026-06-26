import { Section, Text } from '@react-email/components';
import * as React from 'react';
import type { QuoteLineItem } from '../../types';

interface QuoteTableProps {
  items: QuoteLineItem[];
  totalCents: number;
  currency: string;
  currencySymbol: string;
  currencySide?: number;
  subtotalCents?: number;
  taxCents?: number;
  /** Label for total row (e.g. 'Total', 'Grand Total') */
  totalLabel?: string;
  /** Plain ruled quote style used by saved design emails. */
  quoteStyle?: 'card' | 'ruled';
}

function formatCurrency(
  cents: number,
  symbol: string,
  side: number = 0,
): string {
  const amount = (cents / 100).toFixed(2);
  return side === 0 ? `${symbol}${amount}` : `${amount} ${symbol}`;
}

export function QuoteTable({
  items,
  totalCents,
  currency,
  currencySymbol,
  currencySide = 0,
  subtotalCents,
  taxCents,
  totalLabel = 'Total',
  quoteStyle = 'card',
}: QuoteTableProps) {
  if (items.length === 0) return null;

  if (quoteStyle === 'ruled') {
    return (
      <Section style={ruledWrapper}>
        <table style={ruledTable} cellPadding={0} cellSpacing={0}>
          <thead>
            <tr>
              <th style={ruledThProduct} align="left">Product</th>
              <th style={ruledThQty} align="left">Qty</th>
              <th style={ruledThMoney} align="left">Price</th>
              <th style={ruledThMoney} align="left">Item Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const { title, details } = splitDescription(item.description);
              const quantity = item.quantity ?? 1;

              return (
                <tr key={i}>
                  <td style={ruledProductTd}>
                    <Text style={ruledProductTitle}>{title}</Text>
                    {details.map((detail, detailIndex) => (
                      <Text key={detailIndex} style={ruledProductDetail}>
                        {detail}
                      </Text>
                    ))}
                  </td>
                  <td style={ruledTd}>{quantity}</td>
                  <td style={ruledTd}>
                    {formatCurrency(item.unitPriceCents, currencySymbol, currencySide)}
                  </td>
                  <td style={ruledTd}>
                    {formatCurrency(item.totalCents, currencySymbol, currencySide)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            {subtotalCents != null && (
              <tr>
                <td style={ruledSummarySpacer} />
                <td style={ruledSummarySpacer} />
                <td style={ruledSummaryLabel}>Subtotal</td>
                <td style={ruledSummaryValue}>
                  {formatCurrency(subtotalCents, currencySymbol, currencySide)}
                </td>
              </tr>
            )}
            {taxCents != null && taxCents > 0 && (
              <tr>
                <td style={ruledSummarySpacer} />
                <td style={ruledSummarySpacer} />
                <td style={ruledSummaryLabel}>Tax</td>
                <td style={ruledSummaryValue}>
                  {formatCurrency(taxCents, currencySymbol, currencySide)}
                </td>
              </tr>
            )}
            <tr>
              <td style={ruledSummarySpacer} />
              <td style={ruledSummarySpacer} />
              <td style={ruledTotalLabel}>{totalLabel}</td>
              <td style={ruledTotalValue}>
                {formatCurrency(totalCents, currencySymbol, currencySide)}
              </td>
            </tr>
          </tfoot>
        </table>
        <Text style={ruledDisclaimer}>
          Price is in {currencyName(currency)}. Shipping inclusive
        </Text>
      </Section>
    );
  }

  return (
    <Section style={wrapper}>
      <Text style={sectionHeading}>Price Breakdown</Text>
      <table style={table} cellPadding={0} cellSpacing={0}>
        <thead>
          <tr style={theadRow}>
            <th style={th} align="left">Item</th>
            <th style={{ ...th, width: '50px' }} align="center">Qty</th>
            <th style={{ ...th, width: '110px' }} align="right">Price</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} style={i % 2 === 0 ? tdRowEven : tdRowOdd}>
              <td style={td}>{item.description}</td>
              <td style={{ ...td, textAlign: 'center', color: '#8a7e70' }}>
                {item.quantity ?? 1}
              </td>
              <td style={{ ...td, textAlign: 'right' }}>
                {formatCurrency(item.totalCents, currencySymbol, currencySide)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          {subtotalCents != null && (
            <tr>
              <td colSpan={2} style={subtotalTd}>Subtotal</td>
              <td style={{ ...subtotalTd, textAlign: 'right' }}>
                {formatCurrency(subtotalCents, currencySymbol, currencySide)}
              </td>
            </tr>
          )}
          {taxCents != null && taxCents > 0 && (
            <tr>
              <td colSpan={2} style={subtotalTd}>Tax</td>
              <td style={{ ...subtotalTd, textAlign: 'right' }}>
                {formatCurrency(taxCents, currencySymbol, currencySide)}
              </td>
            </tr>
          )}
          <tr style={totalRow}>
            <td colSpan={2} style={totalTd}>{totalLabel}</td>
            <td style={{ ...totalTd, textAlign: 'right' }}>
              {formatCurrency(totalCents, currencySymbol, currencySide)}
            </td>
          </tr>
        </tfoot>
      </table>
      <Text style={disclaimer}>All prices include GST where applicable</Text>
    </Section>
  );
}

function splitDescription(description: string): {
  title: string;
  details: string[];
} {
  const trimmed = description.trim();
  const match = trimmed.match(/^([^:]+):\s*(.+?)(?:\s*\((.+)\))?$/);

  if (!match) return { title: trimmed, details: [] };

  const [, type, name, meta] = match;
  const title = `${type}: ${name}`;
  const details = meta ? meta.split(',').map((part) => part.trim()).filter(Boolean) : [];

  return { title, details };
}

function currencyName(currency: string): string {
  const normalized = currency.toUpperCase();
  const names: Record<string, string> = {
    AUD: 'Australian dollars',
    CAD: 'Canadian dollars',
    EUR: 'euros',
    GBP: 'British pounds',
    NZD: 'New Zealand dollars',
    PLN: 'Polish zloty',
    USD: 'US dollars',
  };

  return names[normalized] ?? normalized;
}

const wrapper: React.CSSProperties = {
  margin: '30px 0',
};

const sectionHeading: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '13px',
  fontWeight: 600,
  margin: '0 0 14px',
};

const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: 0,
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  overflow: 'hidden',
};

const theadRow: React.CSSProperties = {
  backgroundColor: '#f8fafc',
};

const th: React.CSSProperties = {
  padding: '10px 14px',
  fontSize: '11px',
  fontWeight: 600,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  borderBottom: '1px solid #e2e8f0',
};

const tdRowEven: React.CSSProperties = {
  backgroundColor: '#ffffff',
};

const tdRowOdd: React.CSSProperties = {
  backgroundColor: '#f8fafc',
};

const td: React.CSSProperties = {
  padding: '11px 14px',
  fontSize: '13px',
  color: '#334155',
  borderBottom: '1px solid #e2e8f0',
};

const subtotalTd: React.CSSProperties = {
  padding: '9px 14px',
  fontSize: '13px',
  color: '#64748b',
  borderBottom: '1px solid #e2e8f0',
};

const totalRow: React.CSSProperties = {
  backgroundColor: '#ffffff',
};

const totalTd: React.CSSProperties = {
  padding: '13px 14px',
  fontSize: '15px',
  fontWeight: 600,
  color: '#0f172a',
  letterSpacing: '0.5px',
  borderTop: '1px solid #cbd5e1',
};

const disclaimer: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '11px',
  margin: '8px 0 0',
  textAlign: 'right',
};

const ruledWrapper: React.CSSProperties = {
  margin: '24px 0 30px',
};

const ruledTable: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontFamily: 'Arial, Helvetica, sans-serif',
  color: '#000000',
};

const ruledTh: React.CSSProperties = {
  padding: '0 3px 18px',
  fontSize: '14px',
  fontWeight: 700,
  lineHeight: '18px',
  color: '#000000',
  borderBottom: '2px solid #000000',
};

const ruledThProduct: React.CSSProperties = {
  ...ruledTh,
  width: '55%',
};

const ruledThQty: React.CSSProperties = {
  ...ruledTh,
  width: '15%',
};

const ruledThMoney: React.CSSProperties = {
  ...ruledTh,
  width: '15%',
};

const ruledTd: React.CSSProperties = {
  padding: '16px 3px 30px',
  fontSize: '14px',
  lineHeight: '18px',
  verticalAlign: 'top',
  color: '#000000',
  borderBottom: '2px solid #000000',
};

const ruledProductTd: React.CSSProperties = {
  ...ruledTd,
  paddingRight: '12px',
};

const ruledProductTitle: React.CSSProperties = {
  margin: 0,
  fontSize: '14px',
  lineHeight: '18px',
  fontWeight: 700,
  color: '#000000',
};

const ruledProductDetail: React.CSSProperties = {
  margin: 0,
  fontSize: '14px',
  lineHeight: '18px',
  color: '#000000',
};

const ruledSummarySpacer: React.CSSProperties = {
  borderBottom: '2px solid #000000',
  padding: '14px 3px',
};

const ruledSummaryLabel: React.CSSProperties = {
  padding: '14px 3px',
  fontSize: '14px',
  lineHeight: '18px',
  color: '#000000',
  borderBottom: '2px solid #000000',
};

const ruledSummaryValue: React.CSSProperties = {
  ...ruledSummaryLabel,
};

const ruledTotalLabel: React.CSSProperties = {
  ...ruledSummaryLabel,
  fontWeight: 400,
};

const ruledTotalValue: React.CSSProperties = {
  ...ruledSummaryValue,
  fontWeight: 400,
};

const ruledDisclaimer: React.CSSProperties = {
  margin: '16px 0 0',
  fontSize: '14px',
  lineHeight: '18px',
  color: '#000000',
};
