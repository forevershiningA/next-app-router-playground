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
  backgroundColor: '#fbfaf7',
  border: '1px solid #e8ddc8',
  borderRadius: '16px',
  padding: '18px 20px',
  margin: '24px 0',
};

const heading: React.CSSProperties = {
  color: '#17120c',
  fontSize: '14px',
  fontWeight: 700,
  margin: '0 0 6px',
};

const text: React.CSSProperties = {
  color: '#5f5548',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 12px',
};

const link: React.CSSProperties = {
  color: '#9a7322',
  textDecoration: 'none',
};
