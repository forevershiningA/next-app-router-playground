import React from 'react';
import { type Metadata } from 'next';
import MotifOverlayPanel from '#/components/MotifOverlayPanel';

export const metadata: Metadata = {
  title: 'Select Motifs',
  description: 'Choose decorative motifs for your headstone',
  openGraph: {
    title: 'Select Motifs',
    images: [`/api/og?title=Select Motifs`],
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full">
      <MotifOverlayPanel />
      {children}
    </div>
  );
}
