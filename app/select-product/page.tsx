'use cache';

import type { Metadata } from 'next';
import { DOMParser } from '@xmldom/xmldom';
import ProductSelectionGrid from './_ui/ProductSelectionGrid';
import db from '#/lib/db';
import { getProductPriceRanges } from '#/lib/server/product-pricing';
import { getLanguagesData } from '#/lib/server/xml-data';

const PRODUCT_DESCRIPTION_TAGS: Record<string, string> = {
  '4': 'laser_etched_black_granite_headstone_description',
  '5': 'bronze_plaque_description',
  '22': 'laser_etched_black_granite_mini_headstone_description',
  '30': 'laser_etched_black_granite_plaque_description',
  '32': 'full_colour_plaque_description',
  '34': 'traditional_engraved_plaque_description',
  '52': 'yag_lasered_stainless_steel_plaque_description',
  '100': 'laser_etched_black_granite_full_monument_description',
  '101': 'traditional_engraved_full_monument_description',
  '124': 'traditional_engraved_headstone_description',
};

function summarizeDescription(raw: string) {
  const text = raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) return '';

  const sentences = text.split(/(?<=[.!?])\s+/);
  const preview = sentences.slice(0, 2).join(' ');
  return preview || text;
}

async function buildDescriptionMap(productIds: string[]) {
  const languageXml = await getLanguagesData();
  if (!languageXml) return {} as Record<string, string>;

  const parser = new DOMParser();
  const doc = parser.parseFromString(languageXml, 'text/xml');
  const map: Record<string, string> = {};

  productIds.forEach((id) => {
    const tag = PRODUCT_DESCRIPTION_TAGS[id];
    if (!tag) return;
    const element = doc.getElementsByTagName(tag)[0];
    if (!element || !element.textContent) return;
    map[id] = summarizeDescription(element.textContent);
  });

  return map;
}

export const metadata: Metadata = {
  title: 'Headstones, Plaques & Monuments – Choose a Product | Forever Shining',
  description: 'Select from our range of memorial products including headstones, plaques, urns and full monuments. Each product crafted with care and precision.',
};

export default async function Page() {
  const products = db.product.findMany({ limit: 100 });
  const [priceMap, descriptionMap] = await Promise.all([
    getProductPriceRanges(products.map((product) => product.id)),
    buildDescriptionMap(products.map((product) => product.id)),
  ]);

  return (
    <ProductSelectionGrid
      products={products}
      priceMap={priceMap}
      descriptionMap={descriptionMap}
    />
  );
}
