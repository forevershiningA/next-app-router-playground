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

          {/* Top brand bar */}
          <Section style={topBar}>
            {config.logo ? (
              <Img
                src={config.logo}
                alt={config.company}
                width={290}
                height={180}
                style={logo}
              />
            ) : (
              <Text style={brandName}>{config.company}</Text>
            )}
          </Section>

          {/* Gold accent line */}
          <Section style={goldBar} />

          {/* Page title strip */}
          <Section style={titleStrip}>
            <Text style={titleText}>{title}</Text>
          </Section>

          {/* Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Section style={footer}>
            {/* Gold top accent */}
            <Section style={footerGoldLine} />

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
  backgroundColor: '#f0ebe3',
  fontFamily:
    'Georgia, "Times New Roman", Times, serif',
  margin: 0,
  padding: '24px 0',
};

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
  borderRadius: '2px',
  overflow: 'hidden',
};

const topBar: React.CSSProperties = {
  backgroundColor: '#060709',
  padding: '28px 40px',
  textAlign: 'center',
};

const brandName: React.CSSProperties = {
  color: '#DEBD68',
  fontSize: '22px',
  fontWeight: 700,
  letterSpacing: '3px',
  textTransform: 'uppercase',
  margin: 0,
};

const logo: React.CSSProperties = {
  margin: '0 auto',
  height: 'auto',
  display: 'block',
};

const goldBar: React.CSSProperties = {
  backgroundColor: '#DEBD68',
  height: '4px',
  lineHeight: '4px',
  fontSize: '4px',
};

const titleStrip: React.CSSProperties = {
  backgroundColor: '#0d0b08',
  padding: '20px 40px',
  textAlign: 'center',
};

const titleText: React.CSSProperties = {
  color: '#f0ebe3',
  fontSize: '13px',
  fontWeight: 400,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  margin: 0,
};

const content: React.CSSProperties = {
  padding: '40px 40px 32px',
};

const footer: React.CSSProperties = {
  backgroundColor: '#060709',
};

const footerGoldLine: React.CSSProperties = {
  backgroundColor: '#DEBD68',
  height: '3px',
  lineHeight: '3px',
  fontSize: '3px',
};

const footerInner: React.CSSProperties = {
  padding: '28px 40px',
  textAlign: 'center',
};

const footerCompany: React.CSSProperties = {
  color: '#DEBD68',
  fontSize: '13px',
  fontWeight: 600,
  letterSpacing: '1px',
  textTransform: 'uppercase',
  margin: '0 0 10px',
};

const footerAddress: React.CSSProperties = {
  color: '#8a7e70',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '0 0 8px',
};

const footerContact: React.CSSProperties = {
  color: '#8a7e70',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '0 0 12px',
};

const footerLink: React.CSSProperties = {
  color: '#DEBD68',
  textDecoration: 'none',
};

const footerPowered: React.CSSProperties = {
  color: '#4a4035',
  fontSize: '11px',
  margin: '8px 0 0',
};
