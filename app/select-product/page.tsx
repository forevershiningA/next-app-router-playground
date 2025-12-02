'use cache';

import type { Metadata } from 'next';
import ProductSelectionGrid from './_ui/ProductSelectionGrid';
import db from '#/lib/db';

export const metadata: Metadata = {
  title: 'Headstones, Plaques & Monuments – Choose a Product | Forever Shining',
  description: 'Select from our range of memorial products including headstones, plaques, urns and full monuments. Each product crafted with care and precision.',
};

export default async function Page() {
  const products = db.product.findMany({ limit: 100 });

  return <ProductSelectionGrid products={products} />;
}
