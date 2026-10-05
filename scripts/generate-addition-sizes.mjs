import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DOMParser } from '@xmldom/xmldom';

const root = process.cwd();
const source = join(root, 'public', 'xml', 'us_EN', 'motifs-biondan.xml');
const destination = join(
  root,
  'app',
  '_internal',
  '_addition-sizes.generated.json',
);
const document = new DOMParser().parseFromString(
  readFileSync(source, 'utf8'),
  'text/xml',
);

const number = (element, attribute, fallback = 0) => {
  const value = Number(element.getAttribute(attribute));
  return Number.isFinite(value) ? value : fallback;
};

const sizeMap = {};
for (const product of Array.from(document.getElementsByTagName('product'))) {
  const id = product.getAttribute('id');
  if (!id || !product.getAttribute('url_3d')) continue;

  const types = Array.from(product.getElementsByTagName('type'));
  const prices = Array.from(product.getElementsByTagName('price'));
  if (!types.length) continue;

  sizeMap[id] = types.map((type, index) => {
    const code = type.getAttribute('code') || id;
    const price =
      prices.find((candidate) => candidate.getAttribute('code') === code) ??
      prices[index] ??
      prices[0];
    const wholesalePrice = price ? number(price, 'wholesale') : 0;
    const retailMultiplier = price ? number(price, 'retail_multiplier', 1) : 1;

    return {
      variant: number(type, 'nr', index + 1),
      code,
      width: number(type, 'min_width'),
      height: number(type, 'min_height'),
      depth: number(type, 'min_depth'),
      weight: number(type, 'kg'),
      availability: type.getAttribute('avail') !== '0',
      wholesalePrice,
      retailPrice: Number((wholesalePrice * retailMultiplier).toFixed(2)),
      notes: price?.getAttribute('note') ?? '',
    };
  });
}

writeFileSync(destination, `${JSON.stringify(sizeMap, null, 2)}\n`);
console.log(
  `Generated fixed sizes for ${Object.keys(sizeMap).length} additions.`,
);
