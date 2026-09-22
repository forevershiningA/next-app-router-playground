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
            {config.logo ? (
              <Img
                src={config.logo}
                alt={config.company}
                width={210}
                height={129}
                style={logo}
              />
            ) : (
              <Text style={brandName}>{config.company}</Text>
            )}
            <Text style={headerKicker}>Memorial Designs</Text>
            <Text style={titleText}>{title}</Text>
          </Section>

          <Section style={content}>{children}</Section>

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
                © {new Date().getFullYear()} {config.company}. All rights
                reserved.
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
  backgroundColor: '#f4f1eb',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  margin: 0,
  padding: '28px 0',
};

const container: React.CSSProperties = {
  backgroundColor: '#fbf9f5',
  margin: '0 auto',
  maxWidth: '640px',
  borderRadius: '12px',
  overflow: 'hidden',
  border: '1px solid #ddd2c2',
};

const header: React.CSSProperties = {
  backgroundColor: '#fbf9f5',
  padding: '30px 42px 28px',
  textAlign: 'center',
  borderBottom: '1px solid #ddd2c2',
};

const brandName: React.CSSProperties = {
  color: '#8a6a12',
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
  color: '#8c7657',
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '2.5px',
  textTransform: 'uppercase',
  margin: '18px 0 14px',
};

const titleText: React.CSSProperties = {
  color: '#302719',
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '30px',
  fontWeight: 400,
  letterSpacing: '-0.2px',
  lineHeight: '38px',
  margin: 0,
};

const content: React.CSSProperties = { padding: '36px 42px 34px' };

const footer: React.CSSProperties = {
  backgroundColor: '#eee6d9',
  borderTop: '1px solid #ddd2c2',
};

const footerInner: React.CSSProperties = {
  padding: '26px 42px 28px',
  textAlign: 'center',
};

const footerCompany: React.CSSProperties = {
  color: '#302719',
  fontSize: '13px',
  fontWeight: 600,
  letterSpacing: '1px',
  textTransform: 'uppercase',
  margin: '0 0 10px',
};

const footerAddress: React.CSSProperties = {
  color: '#625a51',
  fontSize: '12px',
  lineHeight: '19px',
  margin: '0 0 8px',
};

const footerContact: React.CSSProperties = {
  color: '#625a51',
  fontSize: '12px',
  lineHeight: '19px',
  margin: '0 0 12px',
};

const footerLink: React.CSSProperties = {
  color: '#6c4e22',
  textDecoration: 'none',
};

const footerPowered: React.CSSProperties = {
  color: '#8c7657',
  fontSize: '11px',
  margin: '8px 0 0',
};
