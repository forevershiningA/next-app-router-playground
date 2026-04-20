import { Hr, Section, Text } from '@react-email/components';
import * as React from 'react';
import type { CountryEmailConfig, SavedDesignEmailData } from '../types';
import { ContactInfo } from './components/ContactInfo';
import { DesignPreview } from './components/DesignPreview';
import { EmailLayout } from './components/EmailLayout';
import { QuoteTable } from './components/QuoteTable';

interface SavedDesignEmailProps {
  data: SavedDesignEmailData;
  config: CountryEmailConfig;
  translations: Record<string, string>;
}

export function SavedDesignEmail({
  data,
  config,
  translations,
}: SavedDesignEmailProps) {
  const t = (key: string) => translations[key] ?? key;

  const title =
    t('your_design_have_been_saved') + data.designName;

  return (
    <EmailLayout config={config} title={title} previewText={title}>
      <Text style={greeting}>
        {t('dear')} {data.recipientName ?? t('customer')},
      </Text>

      <Text style={paragraph}>
        {t('congratulations_for_saving_the_design')}
      </Text>

      <Text style={paragraph}>
        {t('thank_you_and_congratulations')}
      </Text>

      <DesignPreview
        screenshotUrl={data.screenshotUrl}
        designName={data.designName}
      />

      {data.quoteItems.length > 0 && (
        <>
          <Hr style={hr} />
          <Text style={sectionTitle}>{t('detailed_quote')}</Text>
          <QuoteTable
            items={data.quoteItems}
            totalCents={data.totalCents}
            currency={data.currency}
            currencySymbol={config.currencySymbol}
            totalLabel={t('total') || 'Total'}
          />
        </>
      )}

      <Section style={infoBox}>
        <Text style={infoText}>
          {t('your_product_is_warranted')}
        </Text>
      </Section>

      <Text style={paragraph}>
        {t('if_you_would_like_to_come_back')}
      </Text>

      <Text style={paragraph}>
        {t('if_you_have_any_questions')}
      </Text>

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

const infoBox: React.CSSProperties = {
  backgroundColor: '#f0f7ff',
  borderRadius: '4px',
  padding: '16px 20px',
  margin: '24px 0',
};

const infoText: React.CSSProperties = {
  fontSize: '13px',
  lineHeight: '20px',
  color: '#555',
  margin: 0,
};

const regards: React.CSSProperties = {
  fontSize: '14px',
  color: '#555',
  margin: '24px 0 0',
  lineHeight: '22px',
};
