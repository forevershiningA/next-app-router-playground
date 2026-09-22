import { Hr, Text } from '@react-email/components';
import * as React from 'react';
import type { CountryEmailConfig, EnquiryEmailData } from '../types';
import { ContactInfo } from './components/ContactInfo';
import { DesignPreview } from './components/DesignPreview';
import { EmailLayout } from './components/EmailLayout';

interface EnquiryEmailProps {
  data: EnquiryEmailData;
  config: CountryEmailConfig;
  translations: Record<string, string>;
}

export function EnquiryEmail({
  data,
  config,
  translations,
}: EnquiryEmailProps) {
  const t = (key: string) => translations[key] ?? key;

  const title = `${t('enquiry')} - ${data.designName}`;

  return (
    <EmailLayout config={config} title={title} previewText={title}>
      <Text style={greeting}>
        {t('dear')} {config.company} {t('team')},
      </Text>

      <Text style={paragraph}>
        A design enquiry has been submitted by{' '}
        <strong>
          {data.customerName ??
            data.recipientName ??
            data.customerEmail ??
            data.recipientEmail}
        </strong>
        .
      </Text>

      {data.productName && (
        <Text style={detail}>
          Product: <strong>{data.productName}</strong>
        </Text>
      )}

      <Text style={detail}>
        Email: <strong>{data.customerEmail ?? data.recipientEmail}</strong>
      </Text>

      {data.customerPhone && (
        <Text style={detail}>
          Phone: <strong>{data.customerPhone}</strong>
        </Text>
      )}

      <Hr style={hr} />

      <Text style={messageLabel}>{t('comments')}:</Text>
      <Text style={messageBox}>{data.message}</Text>

      <DesignPreview
        screenshotUrl={data.screenshotUrl}
        designName={data.designName}
      />

      <ContactInfo config={config} />
    </EmailLayout>
  );
}

const greeting: React.CSSProperties = {
  fontSize: '16px',
  color: '#302719',
  margin: '0 0 16px',
  fontWeight: 600,
};

const paragraph: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#625a51',
  margin: '0 0 16px',
};

const detail: React.CSSProperties = {
  fontSize: '14px',
  color: '#625a51',
  margin: '0 0 8px',
};

const hr: React.CSSProperties = { borderColor: '#ddd2c2', margin: '24px 0' };

const messageLabel: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#302719',
  margin: '0 0 8px',
};

const messageBox: React.CSSProperties = {
  backgroundColor: '#f4f1eb',
  border: '1px solid #ddd2c2',
  borderRadius: '10px',
  padding: '16px 20px',
  fontSize: '14px',
  lineHeight: '22px',
  color: '#4e4230',
  margin: '0 0 24px',
  whiteSpace: 'pre-wrap',
};
