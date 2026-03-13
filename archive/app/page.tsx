import type { Metadata } from 'next';
import HomeSplash from './_ui/HomeSplash';

export const metadata: Metadata = {
  title: 'Design Your Own Headstone Online | Forever Shining',
  description: 'Create custom headstones, plaques and monuments. Choose stone, shape, size, inscriptions and motifs. Transparent pricing, world-wide delivery.',
};

export default function Page() {
  return <HomeSplash />;
}
