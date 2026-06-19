import { Button, Img, Section, Text } from '@react-email/components';
import * as React from 'react';

interface DesignPreviewProps {
  screenshotUrl?: string;
  designName: string;
  /** URL for the "View Design" primary CTA button */
  viewUrl?: string;
  /** URL for the "Edit Your Design" secondary CTA button */
  editUrl?: string;
}

export function DesignPreview({
  screenshotUrl,
  designName,
  viewUrl,
  editUrl,
}: DesignPreviewProps) {
  return (
    <Section style={wrapper}>
      {screenshotUrl && (
        <Section style={imageFrame}>
          <Img
            src={screenshotUrl}
            alt={designName}
            width={480}
            style={image}
          />
        </Section>
      )}

      <Text style={caption}>
        <span style={captionLabel}>Your Design · </span>
        {designName}
      </Text>

      {(viewUrl || editUrl) && (
        <Section style={ctaWrapper}>
          {viewUrl && (
            <Button href={viewUrl} style={ctaButton}>
              View Design &rarr;
            </Button>
          )}
          {editUrl && (
            <Button href={editUrl} style={editButton}>
              Edit Your Design &rarr;
            </Button>
          )}
        </Section>
      )}
    </Section>
  );
}

const wrapper: React.CSSProperties = {
  textAlign: 'center',
  margin: '0 0 30px',
};

const imageFrame: React.CSSProperties = {
  border: '1px solid #eadfca',
  borderRadius: '18px',
  padding: '12px',
  backgroundColor: '#fbfaf7',
  display: 'inline-block',
  margin: '0 auto 0',
  boxShadow: '0 14px 36px rgba(30, 22, 12, 0.08)',
};

const image: React.CSSProperties = {
  maxWidth: '100%',
  height: 'auto',
  display: 'block',
};

const caption: React.CSSProperties = {
  color: '#4f463a',
  fontSize: '13px',
  margin: '12px 0 0',
  textAlign: 'center',
};

const captionLabel: React.CSSProperties = {
  color: '#9a7322',
  fontWeight: 700,
  letterSpacing: '1px',
  textTransform: 'uppercase',
  fontSize: '11px',
};

const ctaWrapper: React.CSSProperties = {
  textAlign: 'center',
  margin: '20px 0 0',
};

const ctaButton: React.CSSProperties = {
  backgroundColor: '#17120c',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: 700,
  padding: '14px 26px',
  borderRadius: '999px',
  textDecoration: 'none',
  display: 'inline-block',
};

const editButton: React.CSSProperties = {
  backgroundColor: '#f3ead8',
  color: '#17120c',
  fontSize: '13px',
  fontWeight: 700,
  padding: '13px 22px',
  borderRadius: '999px',
  textDecoration: 'none',
  display: 'inline-block',
  marginTop: '12px',
};
