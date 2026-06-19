import { Button, Text } from '@react-email/components';
import * as React from 'react';
import type {
  CountryEmailConfig,
  PasswordResetEmailData,
} from '../types';
import { EmailLayout } from './components/EmailLayout';

interface PasswordResetEmailProps {
  data: PasswordResetEmailData;
  config: CountryEmailConfig;
  translations: Record<string, string>;
}

export function PasswordResetEmail({
  data,
  config,
  translations,
}: PasswordResetEmailProps) {
  const t = (key: string) => translations[key] ?? key;

  const title = t('reset_password') || 'Reset Your Password';

  return (
    <EmailLayout config={config} title={title} previewText={title}>
      <Text style={greeting}>
        {t('dear')} {data.recipientName ?? t('customer')},
      </Text>

      <Text style={paragraph}>
        We received a request to reset the password for your account
        associated with <strong>{data.recipientEmail}</strong>.
      </Text>

      <Text style={paragraph}>
        Click the button below to set a new password. This link will
        expire in 1 hour.
      </Text>

      <Button href={data.resetUrl} style={button}>
        {t('reset_password') || 'Reset Password'}
      </Button>

      <Text style={disclaimer}>
        If you did not request a password reset, you can safely ignore
        this email. Your password will not be changed.
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

const button: React.CSSProperties = {
  backgroundColor: '#0f172a',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: 600,
  padding: '12px 24px',
  textDecoration: 'none',
  textAlign: 'center',
  margin: '8px 0 24px',
};

const disclaimer: React.CSSProperties = {
  fontSize: '13px',
  lineHeight: '20px',
  color: '#64748b',
  margin: '0 0 16px',
};

const regards: React.CSSProperties = {
  fontSize: '14px',
  color: '#475569',
  margin: '24px 0 0',
  lineHeight: '22px',
};
