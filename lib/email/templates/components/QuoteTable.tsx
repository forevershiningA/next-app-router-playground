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
      <table style={table} cellPadding={0} cellSpacing={0}>
        <thead>
          <tr>
            <th style={th} align="left">
              Item
            </th>
            <th style={{ ...th, width: '60px' }} align="center">
              Qty
            </th>
            <th style={{ ...th, width: '100px' }} align="right">
              Price
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td style={td}>{item.description}</td>
              <td style={{ ...td, textAlign: 'center' }}>
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
              <td colSpan={2} style={subtotalTd}>
                Subtotal
              </td>
              <td style={{ ...subtotalTd, textAlign: 'right' }}>
                {formatCurrency(subtotalCents, currencySymbol)}
              </td>
            </tr>
          )}
          {taxCents != null && taxCents > 0 && (
            <tr>
              <td colSpan={2} style={subtotalTd}>
                Tax
              </td>
              <td style={{ ...subtotalTd, textAlign: 'right' }}>
                {formatCurrency(taxCents, currencySymbol)}
              </td>
            </tr>
          )}
          <tr>
            <td colSpan={2} style={totalTd}>
              {totalLabel}
            </td>
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
  margin: '24px 0',
};

const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

const th: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: '12px',
  fontWeight: 600,
  color: '#666',
  textTransform: 'uppercase',
  borderBottom: '2px solid #060709',
};

const td: React.CSSProperties = {
  padding: '10px 12px',
  fontSize: '14px',
  color: '#333',
  borderBottom: '1px solid #e6ebf1',
};

const subtotalTd: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: '14px',
  color: '#666',
  borderBottom: '1px solid #e6ebf1',
};

const totalTd: React.CSSProperties = {
  padding: '10px 12px',
  fontSize: '16px',
  fontWeight: 700,
  color: '#060709',
  borderTop: '2px solid #060709',
};

const disclaimer: React.CSSProperties = {
  color: '#999',
  fontSize: '11px',
  margin: '8px 0 0',
  textAlign: 'right',
};
