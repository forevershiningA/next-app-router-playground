import { Section, Text } from '@react-email/components';
import * as React from 'react';
import type { QuoteLineItem } from '../../types';

interface QuoteTableProps {
  items: QuoteLineItem[];
  totalCents: number;
  currency: string;
  currencySymbol: string;
  subtotalCents?: number;
  taxCents?: number;
  /** Label for total row (e.g. 'Total', 'Grand Total') */
  totalLabel?: string;
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
  currencySymbol,
  subtotalCents,
  taxCents,
  totalLabel = 'Total',
}: QuoteTableProps) {
  if (items.length === 0) return null;

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
                {formatCurrency(item.totalCents, currencySymbol)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          {subtotalCents != null && (
            <tr>
              <td colSpan={2} style={subtotalTd}>Subtotal</td>
              <td style={{ ...subtotalTd, textAlign: 'right' }}>
                {formatCurrency(subtotalCents, currencySymbol)}
              </td>
            </tr>
          )}
          {taxCents != null && taxCents > 0 && (
            <tr>
              <td colSpan={2} style={subtotalTd}>Tax</td>
              <td style={{ ...subtotalTd, textAlign: 'right' }}>
                {formatCurrency(taxCents, currencySymbol)}
              </td>
            </tr>
          )}
          <tr style={totalRow}>
            <td colSpan={2} style={totalTd}>{totalLabel}</td>
            <td style={{ ...totalTd, textAlign: 'right' }}>
              {formatCurrency(totalCents, currencySymbol)}
            </td>
          </tr>
        </tfoot>
      </table>
      <Text style={disclaimer}>All prices include GST where applicable</Text>
    </Section>
  );
}

const wrapper: React.CSSProperties = {
  margin: '32px 0',
};

const sectionHeading: React.CSSProperties = {
  color: '#060709',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  margin: '0 0 12px',
  borderLeft: '3px solid #DEBD68',
  paddingLeft: '10px',
};

const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  border: '1px solid #e8e0d5',
};

const theadRow: React.CSSProperties = {
  backgroundColor: '#060709',
};

const th: React.CSSProperties = {
  padding: '10px 14px',
  fontSize: '11px',
  fontWeight: 600,
  color: '#DEBD68',
  textTransform: 'uppercase',
  letterSpacing: '1px',
};

const tdRowEven: React.CSSProperties = {
  backgroundColor: '#ffffff',
};

const tdRowOdd: React.CSSProperties = {
  backgroundColor: '#faf7f3',
};

const td: React.CSSProperties = {
  padding: '11px 14px',
  fontSize: '13px',
  color: '#2a2420',
  borderBottom: '1px solid #ede5da',
};

const subtotalTd: React.CSSProperties = {
  padding: '9px 14px',
  fontSize: '13px',
  color: '#6a5e55',
  borderBottom: '1px solid #ede5da',
};

const totalRow: React.CSSProperties = {
  backgroundColor: '#060709',
};

const totalTd: React.CSSProperties = {
  padding: '13px 14px',
  fontSize: '15px',
  fontWeight: 700,
  color: '#DEBD68',
  letterSpacing: '0.5px',
};

const disclaimer: React.CSSProperties = {
  color: '#a09288',
  fontSize: '11px',
  margin: '8px 0 0',
  textAlign: 'right',
  fontStyle: 'italic',
};
