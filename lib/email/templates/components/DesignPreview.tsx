import { Img, Section, Text } from '@react-email/components';
import * as React from 'react';

interface DesignPreviewProps {
  screenshotUrl?: string;
  designName: string;
}

export function DesignPreview({
  screenshotUrl,
  designName,
}: DesignPreviewProps) {
  if (!screenshotUrl) return null;

  return (
    <Section style={wrapper}>
      <Img
        src={screenshotUrl}
        alt={designName}
        width={536}
        style={image}
      />
      <Text style={caption}>{designName}</Text>
    </Section>
  );
}

const wrapper: React.CSSProperties = {
  textAlign: 'center',
  margin: '0 0 24px',
};

const image: React.CSSProperties = {
  maxWidth: '100%',
  height: 'auto',
  borderRadius: '4px',
  border: '1px solid #e6ebf1',
};

const caption: React.CSSProperties = {
  color: '#666',
  fontSize: '13px',
  fontStyle: 'italic',
  margin: '8px 0 0',
};
