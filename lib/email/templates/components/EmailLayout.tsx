import {
  Body,
  Container,
  Head,
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
          <Section style={header}>
            <Section style={brandCard}>
              {config.logo ? (
                <Img
                  src={config.logo}
                  alt={config.company}
                  width={176}
                  height={108}
                  style={logo}
                />
              ) : (
                <Text style={brandName}>{config.company}</Text>
              )}
              <Text style={headerKicker}>Memorial Design Online</Text>
              <Text style={titleText}>{title}</Text>
            </Section>
          </Section>

          {/* Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Section style={footer}>
            <Section style={footerInner}>
              <Text style={footerCompany}>{config.company}</Text>
              <Text style={footerAddress}>
                {[
                  config.pdfCopyAddress,
                  config.pdfCopyAddress2,
                  config.pdfCopyAddress3,
                  config.pdfCopyAddress4,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
              <Text style={footerContact}>
                <Link href={`mailto:${config.email}`} style={footerLink}>
                  {config.email}
                </Link>
                {' · '}
                <Link href={config.link} style={footerLink}>
                  {config.link.replace(/^https?:\/\//, '')}
                </Link>
              </Text>
              <Text style={footerPowered}>
                © {new Date().getFullYear()} {config.company}. All rights reserved.
              </Text>
            </Section>
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
  backgroundColor: '#f5f2ec',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  margin: 0,
  padding: '32px 0',
};

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '640px',
  borderRadius: '20px',
  overflow: 'hidden',
  boxShadow: '0 24px 70px rgba(21, 17, 12, 0.12)',
};

const header: React.CSSProperties = {
  backgroundColor: '#17120c',
  padding: '30px 32px',
  textAlign: 'center',
};

const brandCard: React.CSSProperties = {
  border: '1px solid rgba(222, 189, 104, 0.32)',
  borderRadius: '18px',
  padding: '26px 24px 28px',
  backgroundColor: '#211911',
};

const brandName: React.CSSProperties = {
  color: '#f4d98d',
  fontSize: '22px',
  fontWeight: 700,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  margin: 0,
};

const logo: React.CSSProperties = {
  margin: '0 auto',
  height: 'auto',
  display: 'block',
};

const headerKicker: React.CSSProperties = {
  color: '#cdb87c',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '2.5px',
  textTransform: 'uppercase',
  margin: '16px 0 10px',
};

const titleText: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 650,
  letterSpacing: '-0.3px',
  lineHeight: '32px',
  margin: 0,
};

const content: React.CSSProperties = {
  padding: '40px 42px 36px',
};

const footer: React.CSSProperties = {
  backgroundColor: '#17120c',
};

const footerInner: React.CSSProperties = {
  padding: '30px 42px',
  textAlign: 'center',
};

const footerCompany: React.CSSProperties = {
  color: '#f4d98d',
  fontSize: '13px',
  fontWeight: 700,
  letterSpacing: '1px',
  textTransform: 'uppercase',
  margin: '0 0 10px',
};

const footerAddress: React.CSSProperties = {
  color: '#b8ab98',
  fontSize: '12px',
  lineHeight: '19px',
  margin: '0 0 8px',
};

const footerContact: React.CSSProperties = {
  color: '#b8ab98',
  fontSize: '12px',
  lineHeight: '19px',
  margin: '0 0 12px',
};

const footerLink: React.CSSProperties = {
  color: '#f4d98d',
  textDecoration: 'none',
};

const footerPowered: React.CSSProperties = {
  color: '#7a6d5b',
  fontSize: '11px',
  margin: '8px 0 0',
};
