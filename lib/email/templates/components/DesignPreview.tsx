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
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '10px',
  backgroundColor: '#f8fafc',
  display: 'inline-block',
  margin: '0 auto 0',
};

const image: React.CSSProperties = {
  maxWidth: '100%',
  height: 'auto',
  display: 'block',
};

const caption: React.CSSProperties = {
  color: '#334155',
  fontSize: '13px',
  margin: '12px 0 0',
  textAlign: 'center',
};

const captionLabel: React.CSSProperties = {
  color: '#64748b',
  fontWeight: 600,
  letterSpacing: '1px',
  textTransform: 'uppercase',
  fontSize: '11px',
};

const ctaWrapper: React.CSSProperties = {
  textAlign: 'center',
  margin: '20px 0 0',
};

const ctaButton: React.CSSProperties = {
  backgroundColor: '#0f172a',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: 600,
  padding: '12px 22px',
  borderRadius: '8px',
  textDecoration: 'none',
  display: 'inline-block',
};

const editButton: React.CSSProperties = {
  backgroundColor: '#ffffff',
  color: '#0f172a',
  fontSize: '13px',
  fontWeight: 600,
  padding: '11px 20px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  textDecoration: 'none',
  display: 'inline-block',
  marginTop: '12px',
};
