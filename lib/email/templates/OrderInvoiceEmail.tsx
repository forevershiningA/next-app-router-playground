import { Hr, Section, Text } from '@react-email/components';
import * as React from 'react';
import type { CountryEmailConfig, OrderEmailData } from '../types';
import { ContactInfo } from './components/ContactInfo';
import { DesignPreview } from './components/DesignPreview';
import { EmailLayout } from './components/EmailLayout';
import { QuoteTable } from './components/QuoteTable';

interface OrderInvoiceEmailProps {
  data: OrderEmailData;
  config: CountryEmailConfig;
  translations: Record<string, string>;
}

export function OrderInvoiceEmail({
  data,
  config,
  translations,
}: OrderInvoiceEmailProps) {
  const t = (key: string) => translations[key] ?? key;

  const title = `${t('invoice')} - ${data.invoiceNumber}`;

  return (
    <EmailLayout config={config} title={title} previewText={title}>
      <Text style={greeting}>
        {t('dear')} {data.recipientName ?? t('customer')},
      </Text>

      <Text style={paragraph}>
        {t('thank_you_and_congratulations_invoice')}
      </Text>

      {/* Invoice details box */}
      <Section style={invoiceBox}>
        <Text style={invoiceLabel}>
          {t('invoice')}: <strong>{data.invoiceNumber}</strong>
        </Text>
        {data.customerAddress && (
          <Text style={invoiceDetail}>
            {t('bill_to')}: {data.customerAddress}
          </Text>
        )}
      </Section>

      <DesignPreview
        screenshotUrl={data.screenshotUrl}
        designName={data.designName}
      />

      {data.quoteItems.length > 0 && (
        <>
          <Hr style={hr} />
          <Text style={sectionTitle}>{t('invoice_details')}</Text>
          <QuoteTable
            items={data.quoteItems}
            totalCents={data.totalCents}
            currency={data.currency}
            currencySymbol={config.currencySymbol}
            subtotalCents={data.subtotalCents}
            taxCents={data.taxCents}
            totalLabel={t('total') || 'Total'}
          />
        </>
      )}

      <Section style={infoBox}>
        <Text style={infoText}>{config.pdfSidenote}</Text>
      </Section>

      <ContactInfo config={config} />

      <Text style={regards}>
        {t('regards')},
        <br />
        {config.company} {t('team')}
      </Text>
    </EmailLayout>
  );
}

const greeting: React.CSSProperties = {
  fontSize: '16px',
  color: '#333',
  margin: '0 0 16px',
};

const paragraph: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#555',
  margin: '0 0 16px',
};

const sectionTitle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 600,
  color: '#333',
  margin: '16px 0 8px',
};

const hr: React.CSSProperties = {
  borderColor: '#e6ebf1',
  margin: '24px 0',
};

const invoiceBox: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  borderRadius: '4px',
  border: '1px solid #e6ebf1',
  padding: '16px 20px',
  margin: '0 0 24px',
};

const invoiceLabel: React.CSSProperties = {
  fontSize: '14px',
  color: '#333',
  margin: '0 0 4px',
};

const invoiceDetail: React.CSSProperties = {
  fontSize: '13px',
  color: '#666',
  margin: '4px 0 0',
};

const infoBox: React.CSSProperties = {
  backgroundColor: '#fff8e1',
  borderRadius: '4px',
  padding: '16px 20px',
  margin: '24px 0',
};

const infoText: React.CSSProperties = {
  fontSize: '13px',
  lineHeight: '20px',
  color: '#555',
  margin: 0,
  fontWeight: 600,
};

const regards: React.CSSProperties = {
  fontSize: '14px',
  color: '#555',
  margin: '24px 0 0',
  lineHeight: '22px',
};
