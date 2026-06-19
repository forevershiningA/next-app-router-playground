import { Button, Column, Hr, Row, Section, Text } from '@react-email/components';
import * as React from 'react';
import type { CountryEmailConfig, SavedDesignEmailData } from '../types';
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

  const title = t('your_design_have_been_saved') + data.designName;
  const previewText = `Your memorial design "${data.designName}" has been saved — view your quote inside.`;

  const firstName = (() => {
    const n = data.recipientName ?? data.recipientEmail;
    if (n.includes('@')) return n.split('@')[0]; // extract local-part of email
    return n.split(' ')[0]; // take first word of full name
  })();

  const totalFormatted =
    config.currencySide === 0
      ? `${config.currencySymbol}${(data.totalCents / 100).toFixed(2)}`
      : `${(data.totalCents / 100).toFixed(2)} ${config.currencySymbol}`;

  const editUrl = `${config.link}/my-account`;
  const viewDesignUrl = data.reviewUrl ?? `${config.link}/design/${data.designId}`;
  const contactUrl = `mailto:${config.email}`;

  return (
    <EmailLayout config={config} title={title} previewText={previewText}>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <Section style={hero}>
        <Text style={heroEyebrow}>✦ &nbsp; Memorial Design Saved &nbsp; ✦</Text>
        <Text style={heroHeading}>
          Your design is ready,{' '}
          <span style={heroName}>{firstName}</span>.
        </Text>
        <Text style={heroCopy}>
          We&apos;ve saved <strong>&ldquo;{data.designName}&rdquo;</strong> to your account.
          Your personalised quote is below — take your time, and come back whenever you&apos;re ready.
        </Text>
      </Section>

      <Hr style={divider} />

      {/* ── Design preview ───────────────────────────────────────── */}
      <DesignPreview
        screenshotUrl={data.screenshotUrl}
        designName={data.designName}
        viewUrl={viewDesignUrl}
        editUrl={editUrl}
      />

      {data.accessCode && (
        <Section style={accessCodeBox}>
          <Text style={accessCodeLabel}>Family review access code</Text>
          <Text style={accessCodeValue}>{data.accessCode}</Text>
          <Text style={accessCodeNote}>
            Enter this code when opening the shared design link.
          </Text>
        </Section>
      )}

      {/* ── Price highlight card ─────────────────────────────────── */}
      {data.totalCents > 0 && (
        <Section style={priceCard}>
          <Text style={priceLabel}>Estimated Quote</Text>
          <Text style={priceAmount}>{totalFormatted}</Text>
          <Text style={priceNote}>
            Indicative pricing · Final quote confirmed on order
          </Text>
        </Section>
      )}

      {/* ── Detailed quote table ─────────────────────────────────── */}
      {data.quoteItems.length > 0 && (
        <QuoteTable
          items={data.quoteItems}
          totalCents={data.totalCents}
          currency={data.currency}
          currencySymbol={config.currencySymbol}
          totalLabel={t('total') || 'Total'}
        />
      )}

      <Hr style={divider} />

      {/* ── Next steps ───────────────────────────────────────────── */}
      <Section style={nextStepsSection}>
        <Text style={nextStepsHeading}>What would you like to do next?</Text>
        <Row>
          <Column style={stepCol}>
            <Text style={stepIcon}>◎</Text>
            <Text style={stepTitle}>View Design</Text>
            <Text style={stepText}>See the full 3D design and quote in your browser</Text>
            <Button href={viewDesignUrl} style={stepBtnPrimary}>View Design</Button>
          </Column>
          <Column style={stepDivider} />
          <Column style={stepCol}>
            <Text style={stepIcon}>✏</Text>
            <Text style={stepTitle}>Edit Design</Text>
            <Text style={stepText}>Refine inscriptions, materials or dimensions</Text>
            <Button href={editUrl} style={stepBtn}>Open Designer</Button>
          </Column>
          <Column style={stepDivider} />
          <Column style={stepCol}>
            <Text style={stepIcon}>✉</Text>
            <Text style={stepTitle}>Get in Touch</Text>
            <Text style={stepText}>Questions? Our team is ready to help</Text>
            <Button href={contactUrl} style={stepBtn}>Contact Us</Button>
          </Column>
        </Row>
      </Section>

      <Hr style={divider} />

      {/* ── Warranty & trust ─────────────────────────────────────── */}
      <Section style={warrantyBox}>
        <Row>
          <Column style={{ width: '36px', verticalAlign: 'top' }}>
            <Text style={warrantyIcon}>✓</Text>
          </Column>
          <Column>
            <Text style={warrantyTitle}>10-Year Quality Guarantee</Text>
            <Text style={warrantyText}>
              {t('your_product_is_warranted') ||
                'Every memorial we craft is backed by our quality guarantee — precision craftsmanship, premium materials, and lasting care.'}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* ── Closing ──────────────────────────────────────────────── */}
      <Text style={closing}>
        {t('if_you_have_any_questions') ||
          `If you have any questions or would like to discuss your design, please don't hesitate to reach out — we're here to help.`}
      </Text>

      <Text style={signature}>
        With care,
        <br />
        <strong style={signatureCompany}>{config.company}</strong>
        <br />
        <span style={signatureContact}>{config.email}</span>
      </Text>

    </EmailLayout>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const hero: React.CSSProperties = {
  textAlign: 'center',
  padding: '2px 0 26px',
};

const heroEyebrow: React.CSSProperties = {
  color: '#9a7322',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  margin: '0 0 14px',
};

const heroHeading: React.CSSProperties = {
  color: '#17120c',
  fontSize: '30px',
  fontWeight: 700,
  lineHeight: '38px',
  margin: '0 0 14px',
  letterSpacing: '-0.5px',
};

const heroName: React.CSSProperties = {
  color: '#9a7322',
};

const heroCopy: React.CSSProperties = {
  color: '#50473b',
  fontSize: '15px',
  lineHeight: '23px',
  margin: '0',
};

const divider: React.CSSProperties = {
  borderColor: '#eee5d5',
  margin: '28px 0',
};

const priceCard: React.CSSProperties = {
  backgroundColor: '#17120c',
  borderRadius: '18px',
  padding: '28px 32px',
  textAlign: 'center',
  margin: '0 0 32px',
};

const accessCodeBox: React.CSSProperties = {
  backgroundColor: '#fbfaf7',
  border: '1px solid #e8ddc8',
  borderRadius: '14px',
  padding: '18px',
  textAlign: 'center',
  margin: '20px 0',
};

const accessCodeLabel: React.CSSProperties = {
  color: '#8a6a2d',
  fontSize: '11px',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  margin: '0 0 8px',
};

const accessCodeValue: React.CSSProperties = {
  color: '#17120c',
  fontSize: '28px',
  fontWeight: 700,
  letterSpacing: '8px',
  margin: '0 0 8px',
};

const accessCodeNote: React.CSSProperties = {
  color: '#6b5b47',
  fontSize: '13px',
  margin: 0,
};

const priceLabel: React.CSSProperties = {
  color: '#f4d98d',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  margin: '0 0 8px',
};

const priceAmount: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '38px',
  fontWeight: 700,
  letterSpacing: '-1px',
  margin: '0 0 8px',
};

const priceNote: React.CSSProperties = {
  color: '#b8ab98',
  fontSize: '12px',
  margin: '0',
};

const nextStepsSection: React.CSSProperties = {
  margin: '0 0 28px',
};

const nextStepsHeading: React.CSSProperties = {
  color: '#17120c',
  fontSize: '13px',
  fontWeight: 700,
  margin: '0 0 20px',
};

const stepCol: React.CSSProperties = {
  width: '170px',
  textAlign: 'center',
  verticalAlign: 'top',
  padding: '0 8px',
};

const stepDivider: React.CSSProperties = {
  width: '1px',
  backgroundColor: '#ede5da',
  verticalAlign: 'top',
};

const stepIcon: React.CSSProperties = {
  color: '#9a7322',
  fontSize: '22px',
  margin: '0 0 8px',
};

const stepTitle: React.CSSProperties = {
  color: '#17120c',
  fontSize: '13px',
  fontWeight: 700,
  margin: '0 0 6px',
  letterSpacing: '0.5px',
};

const stepText: React.CSSProperties = {
  color: '#6d6255',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0 0 12px',
};

const stepBtn: React.CSSProperties = {
  backgroundColor: '#f3ead8',
  color: '#17120c',
  fontSize: '12px',
  fontWeight: 700,
  padding: '9px 15px',
  borderRadius: '999px',
  textDecoration: 'none',
  display: 'inline-block',
};

const stepBtnPrimary: React.CSSProperties = {
  backgroundColor: '#17120c',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: 700,
  padding: '8px 14px',
  borderRadius: '999px',
  textDecoration: 'none',
  display: 'inline-block',
};

const warrantyBox: React.CSSProperties = {
  border: '1px solid #e8ddc8',
  backgroundColor: '#fbfaf7',
  borderRadius: '16px',
  padding: '18px 20px',
  margin: '0 0 28px',
};

const warrantyIcon: React.CSSProperties = {
  color: '#9a7322',
  fontSize: '20px',
  margin: '0',
  fontWeight: 700,
};

const warrantyTitle: React.CSSProperties = {
  color: '#17120c',
  fontSize: '13px',
  fontWeight: 700,
  margin: '0 0 4px',
  letterSpacing: '0.3px',
};

const warrantyText: React.CSSProperties = {
  color: '#6d6255',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0',
};

const closing: React.CSSProperties = {
  color: '#50473b',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 24px',
};

const signature: React.CSSProperties = {
  color: '#50473b',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
};

const signatureCompany: React.CSSProperties = {
  color: '#17120c',
  fontSize: '15px',
};

const signatureContact: React.CSSProperties = {
  color: '#9a7322',
  fontSize: '13px',
};
