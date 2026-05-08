import { Button, Img, Section, Text } from '@react-email/components';
import * as React from 'react';

interface DesignPreviewProps {
  screenshotUrl?: string;
  designName: string;
  /** URL for the "Edit Your Design" CTA button */
  editUrl?: string;
}

export function DesignPreview({
  screenshotUrl,
  designName,
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

      {editUrl && (
        <Section style={ctaWrapper}>
          <Button href={editUrl} style={ctaButton}>
            Edit Your Design &rarr;
          </Button>
        </Section>
      )}
    </Section>
  );
}

const wrapper: React.CSSProperties = {
  textAlign: 'center',
  margin: '0 0 32px',
};

const imageFrame: React.CSSProperties = {
  border: '2px solid #DEBD68',
  borderRadius: '2px',
  padding: '10px',
  backgroundColor: '#f9f6f1',
  display: 'inline-block',
  margin: '0 auto 0',
};

const image: React.CSSProperties = {
  maxWidth: '100%',
  height: 'auto',
  display: 'block',
};

const caption: React.CSSProperties = {
  color: '#4a4035',
  fontSize: '13px',
  fontStyle: 'italic',
  margin: '12px 0 0',
  textAlign: 'center',
};

const captionLabel: React.CSSProperties = {
  color: '#DEBD68',
  fontStyle: 'normal',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  fontSize: '11px',
};

const ctaWrapper: React.CSSProperties = {
  textAlign: 'center',
  margin: '20px 0 0',
};

const ctaButton: React.CSSProperties = {
  backgroundColor: '#DEBD68',
  color: '#060709',
  fontSize: '13px',
  fontWeight: 700,
  letterSpacing: '1px',
  textTransform: 'uppercase',
  padding: '14px 32px',
  borderRadius: '2px',
  textDecoration: 'none',
  display: 'inline-block',
  fontFamily: 'Georgia, serif',
};
