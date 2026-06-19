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
  margin: '30px 0',
};

const sectionHeading: React.CSSProperties = {
  color: '#17120c',
  fontSize: '13px',
  fontWeight: 700,
  margin: '0 0 14px',
};

const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: 0,
  border: '1px solid #e8ddc8',
  borderRadius: '14px',
  overflow: 'hidden',
};

const theadRow: React.CSSProperties = {
  backgroundColor: '#17120c',
};

const th: React.CSSProperties = {
  padding: '10px 14px',
  fontSize: '11px',
  fontWeight: 700,
  color: '#f4d98d',
  textTransform: 'uppercase',
  letterSpacing: '1px',
};

const tdRowEven: React.CSSProperties = {
  backgroundColor: '#ffffff',
};

const tdRowOdd: React.CSSProperties = {
  backgroundColor: '#fbfaf7',
};

const td: React.CSSProperties = {
  padding: '11px 14px',
  fontSize: '13px',
  color: '#30271d',
  borderBottom: '1px solid #eee5d5',
};

const subtotalTd: React.CSSProperties = {
  padding: '9px 14px',
  fontSize: '13px',
  color: '#6d6255',
  borderBottom: '1px solid #eee5d5',
};

const totalRow: React.CSSProperties = {
  backgroundColor: '#17120c',
};

const totalTd: React.CSSProperties = {
  padding: '13px 14px',
  fontSize: '15px',
  fontWeight: 700,
  color: '#f4d98d',
  letterSpacing: '0.5px',
};

const disclaimer: React.CSSProperties = {
  color: '#8d8174',
  fontSize: '11px',
  margin: '8px 0 0',
  textAlign: 'right',
};
