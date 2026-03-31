import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Select Emblem – Bronze Plaque Emblems | Forever Shining',
  description:
    'Choose from over 230 bronze emblem designs for your plaque. Religious, floral, animal and custom motifs available.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
