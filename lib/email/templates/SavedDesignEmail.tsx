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
  const previewText = `Your memorial design "${data.designName}" has been saved. View your quote inside.`;

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
      <Section style={hero}>
        <Text style={heroEyebrow}>Memorial Design Saved</Text>
        <Text style={heroHeading}>
          Your design is ready,{' '}
          <span style={heroName}>{firstName}</span>.
        </Text>
        <Text style={heroCopy}>
          We&apos;ve saved <strong>&ldquo;{data.designName}&rdquo;</strong> to your account.
          Your personalised quote is below. You can return to it whenever you are ready.
        </Text>
      </Section>

      <Hr style={divider} />

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

      {data.totalCents > 0 && data.quoteItems.length === 0 && (
        <Section style={priceCard}>
          <Text style={priceLabel}>Estimated Quote</Text>
          <Text style={priceAmount}>{totalFormatted}</Text>
          <Text style={priceNote}>
            Indicative pricing · Final quote confirmed on order
          </Text>
        </Section>
      )}

      {data.quoteItems.length > 0 && (
        <QuoteTable
          items={data.quoteItems}
          totalCents={data.totalCents}
          currency={data.currency}
          currencySymbol={config.currencySymbol}
          currencySide={config.currencySide}
          totalLabel={t('total') || 'Total'}
          quoteStyle="ruled"
        />
      )}

      <Hr style={divider} />

      <Section style={nextStepsSection}>
        <Text style={nextStepsHeading}>What would you like to do next?</Text>
        <Row>
          <Column style={stepCol}>
            <Text style={stepIcon}>View</Text>
            <Text style={stepTitle}>View Design</Text>
            <Text style={stepText}>See the full 3D design and quote in your browser</Text>
            <Button href={viewDesignUrl} style={stepBtnPrimary}>View Design</Button>
          </Column>
          <Column style={stepDivider} />
          <Column style={stepCol}>
            <Text style={stepIcon}>Edit</Text>
            <Text style={stepTitle}>Edit Design</Text>
            <Text style={stepText}>Refine inscriptions, materials or dimensions</Text>
            <Button href={editUrl} style={stepBtn}>Open Designer</Button>
          </Column>
          <Column style={stepDivider} />
          <Column style={stepCol}>
            <Text style={stepIcon}>Help</Text>
            <Text style={stepTitle}>Get in Touch</Text>
            <Text style={stepText}>Questions? Our team is ready to help</Text>
            <Button href={contactUrl} style={stepBtn}>Contact Us</Button>
          </Column>
        </Row>
      </Section>

      <Hr style={divider} />

      <Section style={warrantyBox}>
        <Row>
          <Column style={{ width: '36px', verticalAlign: 'top' }}>
            <Text style={warrantyIcon}>OK</Text>
          </Column>
          <Column>
            <Text style={warrantyTitle}>10-Year Quality Guarantee</Text>
            <Text style={warrantyText}>
              {t('your_product_is_warranted') ||
                'Every memorial we craft is backed by our quality guarantee, with precision craftsmanship, premium materials, and lasting care.'}
            </Text>
          </Column>
        </Row>
      </Section>

      <Text style={closing}>
        {t('if_you_have_any_questions') ||
          `If you have any questions or would like to discuss your design, please don't hesitate to reach out. We're here to help.`}
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
  padding: '0 0 24px',
};

const heroEyebrow: React.CSSProperties = {
  color: '#64748b',
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  margin: '0 0 14px',
};

const heroHeading: React.CSSProperties = {
  color: '#0f172a',
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '30px',
  fontWeight: 400,
  lineHeight: '38px',
  margin: '0 0 14px',
  letterSpacing: '-0.2px',
};

const heroName: React.CSSProperties = {
  color: '#0f172a',
};

const heroCopy: React.CSSProperties = {
  color: '#475569',
  fontSize: '15px',
  lineHeight: '23px',
  margin: '0',
};

const divider: React.CSSProperties = {
  borderColor: '#e2e8f0',
  margin: '28px 0',
};

const priceCard: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '24px 28px',
  textAlign: 'center',
  margin: '0 0 32px',
};

const accessCodeBox: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '18px',
  textAlign: 'center',
  margin: '20px 0',
};

const accessCodeLabel: React.CSSProperties = {
  color: '#64748b',
  fontSize: '11px',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  margin: '0 0 8px',
};

const accessCodeValue: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '28px',
  fontWeight: 600,
  letterSpacing: '8px',
  margin: '0 0 8px',
};

const accessCodeNote: React.CSSProperties = {
  color: '#64748b',
  fontSize: '13px',
  margin: 0,
};

const priceLabel: React.CSSProperties = {
  color: '#64748b',
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  margin: '0 0 8px',
};

const priceAmount: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '38px',
  fontWeight: 500,
  letterSpacing: '-1px',
  margin: '0 0 8px',
};

const priceNote: React.CSSProperties = {
  color: '#64748b',
  fontSize: '12px',
  margin: '0',
};

const nextStepsSection: React.CSSProperties = {
  margin: '0 0 28px',
};

const nextStepsHeading: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '13px',
  fontWeight: 600,
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
  backgroundColor: '#e2e8f0',
  verticalAlign: 'top',
};

const stepIcon: React.CSSProperties = {
  color: '#64748b',
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '1px',
  textTransform: 'uppercase',
  margin: '0 0 8px',
};

const stepTitle: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '13px',
  fontWeight: 600,
  margin: '0 0 6px',
  letterSpacing: '0.5px',
};

const stepText: React.CSSProperties = {
  color: '#64748b',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0 0 12px',
};

const stepBtn: React.CSSProperties = {
  backgroundColor: '#ffffff',
  color: '#0f172a',
  fontSize: '12px',
  fontWeight: 600,
  padding: '9px 14px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  textDecoration: 'none',
  display: 'inline-block',
};

const stepBtnPrimary: React.CSSProperties = {
  backgroundColor: '#0f172a',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: 600,
  padding: '8px 14px',
  borderRadius: '8px',
  textDecoration: 'none',
  display: 'inline-block',
};

const warrantyBox: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '18px 20px',
  margin: '0 0 28px',
};

const warrantyIcon: React.CSSProperties = {
  color: '#64748b',
  fontSize: '11px',
  margin: '0',
  fontWeight: 600,
  letterSpacing: '1px',
};

const warrantyTitle: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '13px',
  fontWeight: 600,
  margin: '0 0 4px',
  letterSpacing: '0.3px',
};

const warrantyText: React.CSSProperties = {
  color: '#64748b',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0',
};

const closing: React.CSSProperties = {
  color: '#475569',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 24px',
};

const signature: React.CSSProperties = {
  color: '#475569',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
};

const signatureCompany: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '15px',
};

const signatureContact: React.CSSProperties = {
  color: '#334155',
  fontSize: '13px',
};
