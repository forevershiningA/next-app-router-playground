import 'server-only';

import { readFile } from 'fs/promises';
import path from 'path';

import type { MotifProductData } from '#/lib/motif-pricing';

import { ensureServerDomParser } from './dom-parser-polyfill';

/** Parse motif XML and extract pricing information on the server. */
export async function fetchAndParseMotifPricing(
  productType: 'engraved' | 'laser' | 'bronze' | 'enamel',
): Promise<MotifProductData | null> {
  try {
    const xmlPath =
      productType === 'bronze'
        ? '/xml/au_EN/motifs-bronze.xml'
        : `/xml/au_EN/motifs-${productType}.xml`;

    await ensureServerDomParser();
    const xmlText = await readFile(
      path.join(process.cwd(), 'public', xmlPath),
      'utf-8',
    );
    const xmlDoc = new DOMParser().parseFromString(xmlText, 'text/xml');
    const productElement = xmlDoc.querySelector('product');
    if (!productElement) return null;

    const typeElement = productElement.querySelector('type');
    const priceModelElement = productElement.querySelector('price_model');
    if (!typeElement || !priceModelElement) return null;

    const prices = Array.from(priceModelElement.querySelectorAll('price')).map(
      (priceEl) => ({
        id: priceEl.getAttribute('id') || '',
        nr: priceEl.getAttribute('nr') || '',
        name: priceEl.getAttribute('name') || '',
        code: priceEl.getAttribute('code') || '',
        model: priceEl.getAttribute('model') || '',
        startQuantity: parseFloat(
          priceEl.getAttribute('start_quantity') || '0',
        ),
        endQuantity: parseFloat(priceEl.getAttribute('end_quantity') || '0'),
        retailMultiplier: parseFloat(
          priceEl.getAttribute('retail_multiplier') || '1',
        ),
        wholesale: parseFloat(priceEl.getAttribute('wholesale') || '0'),
        note: priceEl.getAttribute('note') || '',
      }),
    );

    return {
      id: productElement.getAttribute('id') || '',
      code: productElement.getAttribute('code') || '',
      name: productElement.getAttribute('name') || '',
      type: productElement.getAttribute('type') || '',
      minHeight: parseInt(typeElement.getAttribute('min_height') || '40'),
      maxHeight: parseInt(typeElement.getAttribute('max_height') || '1000'),
      initHeight: parseInt(typeElement.getAttribute('init_height') || '100'),
      priceModel: {
        code: priceModelElement.getAttribute('code') || '',
        name: priceModelElement.getAttribute('name') || '',
        quantityType: priceModelElement.getAttribute('quantity_type') || '',
        currency: priceModelElement.getAttribute('currency') || '',
        prices,
      },
    };
  } catch {
    return null;
  }
}
