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
        <strong>{data.recipientName ?? data.recipientEmail}</strong>.
      </Text>

      {data.productName && (
        <Text style={detail}>
          Product: <strong>{data.productName}</strong>
        </Text>
      )}

      <Text style={detail}>
        Email: <strong>{data.recipientEmail}</strong>
      </Text>

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
  color: '#17120c',
  margin: '0 0 16px',
  fontWeight: 700,
};

const paragraph: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#50473b',
  margin: '0 0 16px',
};

const detail: React.CSSProperties = {
  fontSize: '14px',
  color: '#50473b',
  margin: '0 0 8px',
};

const hr: React.CSSProperties = {
  borderColor: '#eee5d5',
  margin: '24px 0',
};

const messageLabel: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#17120c',
  margin: '0 0 8px',
};

const messageBox: React.CSSProperties = {
  backgroundColor: '#fbfaf7',
  border: '1px solid #e8ddc8',
  borderRadius: '16px',
  padding: '16px 20px',
  fontSize: '14px',
  lineHeight: '22px',
  color: '#30271d',
  margin: '0 0 24px',
  whiteSpace: 'pre-wrap',
};
