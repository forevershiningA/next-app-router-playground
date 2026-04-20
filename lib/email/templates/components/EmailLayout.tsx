import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import type { CountryEmailConfig } from '../../types';

interface EmailLayoutProps {
  config: CountryEmailConfig;
  title: string;
  previewText: string;
  children: React.ReactNode;
}

export function EmailLayout({
  config,
  title,
  previewText,
  children,
}: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            {config.logo && (
              <Img
                src={config.logo}
                alt={config.company}
                width={200}
                height={50}
                style={logo}
              />
            )}
            <Text style={headerTitle}>{title}</Text>
          </Section>

          {/* Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerCompany}>{config.company}</Text>
            <Text style={footerAddress}>
              {config.pdfCopyAddress}
              {config.pdfCopyAddress2 && (
                <>
                  <br />
                  {config.pdfCopyAddress2}
                </>
              )}
              {config.pdfCopyAddress3 && (
                <>
                  <br />
                  {config.pdfCopyAddress3}
                </>
              )}
              {config.pdfCopyAddress4 && (
                <>
                  <br />
                  {config.pdfCopyAddress4}
                </>
              )}
            </Text>
            <Text style={footerContact}>
              {config.pdfContact}
              <br />
              <Link href={`mailto:${config.email}`} style={footerLink}>
                {config.email}
              </Link>
              <br />
              <Link href={config.link} style={footerLink}>
                {config.link}
              </Link>
            </Text>
            <Text style={footerPowered}>
              Powered by{' '}
              <Link href={config.link} style={footerLink}>
                {config.company}
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const body: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
};

const header: React.CSSProperties = {
  backgroundColor: '#060709',
  padding: '24px 32px',
  textAlign: 'center',
};

const logo: React.CSSProperties = {
  margin: '0 auto',
};

const headerTitle: React.CSSProperties = {
  color: '#DEBD68',
  fontSize: '18px',
  fontWeight: 600,
  margin: '12px 0 0',
};

const content: React.CSSProperties = {
  padding: '32px',
};

const hr: React.CSSProperties = {
  borderColor: '#e6ebf1',
  margin: '0',
};

const footer: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  padding: '24px 32px',
  textAlign: 'center',
};

const footerCompany: React.CSSProperties = {
  color: '#333',
  fontSize: '14px',
  fontWeight: 600,
  margin: '0 0 8px',
};

const footerAddress: React.CSSProperties = {
  color: '#666',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0 0 8px',
};

const footerContact: React.CSSProperties = {
  color: '#666',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0 0 8px',
};

const footerLink: React.CSSProperties = {
  color: '#DEBD68',
  textDecoration: 'none',
};

const footerPowered: React.CSSProperties = {
  color: '#999',
  fontSize: '11px',
  margin: '8px 0 0',
};
