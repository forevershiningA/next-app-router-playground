import { Link, Section, Text } from '@react-email/components';
import * as React from 'react';
import type { CountryEmailConfig } from '../../types';

interface ContactInfoProps {
  config: CountryEmailConfig;
}

export function ContactInfo({ config }: ContactInfoProps) {
  return (
    <Section style={wrapper}>
      <Text style={heading}>Contact Us</Text>
      <Text style={text}>
        {config.pdfContact}
        <br />
        Email:{' '}
        <Link href={`mailto:${config.email}`} style={link}>
          {config.email}
        </Link>
        <br />
        Web:{' '}
        <Link href={config.link} style={link}>
          {config.link}
        </Link>
      </Text>
      {config.pdfPayment && (
        <>
          <Text style={heading}>{config.pdfPayment}</Text>
          <Text style={text}>
            {config.pdfReference}
            <br />
            {config.pdfCallUsCreditCard}
          </Text>
        </>
      )}
    </Section>
  );
}

const wrapper: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '18px 20px',
  margin: '24px 0',
};

const heading: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '14px',
  fontWeight: 600,
  margin: '0 0 6px',
};

const text: React.CSSProperties = {
  color: '#475569',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 12px',
};

const link: React.CSSProperties = {
  color: '#334155',
  textDecoration: 'none',
};
