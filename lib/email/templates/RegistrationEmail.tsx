import { Link, Text } from '@react-email/components';
import * as React from 'react';
import type { CountryEmailConfig, RegistrationEmailData } from '../types';
import { EmailLayout } from './components/EmailLayout';

interface RegistrationEmailProps {
  data: RegistrationEmailData;
  config: CountryEmailConfig;
  translations: Record<string, string>;
}

export function RegistrationEmail({
  data,
  config,
  translations,
}: RegistrationEmailProps) {
  const t = (key: string) => translations[key] ?? key;

  const title = t('customer_registration');

  return (
    <EmailLayout config={config} title={title} previewText={title}>
      <Text style={greeting}>
        {t('dear')} {data.recipientName ?? t('customer')},
      </Text>

      <Text style={paragraph}>
        {t('congratulations_for_creating_account')}
      </Text>

      <Text style={paragraph}>{t('thank_you_for_registering')}</Text>

      <Text style={paragraph}>
        {t('design_your_own_info')}
      </Text>

      <Text style={paragraph}>
        {t('at_any_time')}{' '}
        <Link href={`${config.link}login`} style={link}>
          {t('my_account') || 'My Account'}
        </Link>
        .
      </Text>

      <Text style={paragraph}>
        {t('if_you_have_any_questions')}
      </Text>

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
  color: '#0f172a',
  margin: '0 0 16px',
  fontWeight: 600,
};

const paragraph: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#475569',
  margin: '0 0 16px',
};

const link: React.CSSProperties = {
  color: '#334155',
  textDecoration: 'underline',
  fontWeight: 600,
};

const regards: React.CSSProperties = {
  fontSize: '14px',
  color: '#475569',
  margin: '24px 0 0',
  lineHeight: '22px',
};
