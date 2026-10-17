import fs from 'node:fs';
import path from 'node:path';
import { data } from '../app/_internal/_data';
import { getAllSavedDesigns } from '../lib/saved-designs-data';
import {
  getCanonicalDesignCandidateUrls,
  normalizeCanonicalDesignSource,
} from '../lib/canonical-design-source';
import {
  unavailableDesignSource,
  type DesignSourceSummary,
} from '../lib/design-source-types';

const manifest: Record<string, DesignSourceSummary> = {};
const products = new Set(data.products.map((product) => String(product.id)));
for (const design of getAllSavedDesigns()) {
  let record = unavailableDesignSource();
  for (const candidate of getCanonicalDesignCandidateUrls(design.id)) {
    const file = path.join(
      process.cwd(),
      'public',
      candidate.replace(/^\/+/, ''),
    );
    if (!fs.existsSync(file)) continue;
    let payload;
    try {
      payload = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
      continue;
    }
    payload = normalizeCanonicalDesignSource(payload, design.id);
    if (!payload) continue;
    const productId = String(payload.product.id);
    const reasons: string[] = [];
    if (productId !== String(design.productId))
      reasons.push('product-id-mismatch');
    if (!products.has(productId)) reasons.push('unknown-source-product');
    if (!products.has(String(design.productId)))
      reasons.push('unknown-metadata-product');
    // Use the metadata's known legacy directory, never an arbitrary payload path.
    let legacyProductId: string | null = null;
    if (/^[a-z0-9-]+$/.test(design.mlDir)) {
      const legacyFile = path.join(
        process.cwd(),
        'public/ml',
        design.mlDir,
        'saved-designs/json',
        design.id + '.json',
      );
      if (fs.existsSync(legacyFile)) {
        try {
          const legacy: unknown = JSON.parse(
            fs.readFileSync(legacyFile, 'utf8'),
          );
          if (Array.isArray(legacy)) {
            const primary = legacy[0];
            if (
              primary &&
              typeof primary === 'object' &&
              ['number', 'string'].includes(typeof primary.productid)
            ) {
              legacyProductId = String(primary.productid);
            }
          }
        } catch {
          /* Evidence remains unknown when the original cannot be parsed. */
        }
      }
    }
    const legacyAgreesWithSource =
      legacyProductId === null ? null : legacyProductId === productId;
    const dimension = (value: unknown): number | null =>
      typeof value === 'number' && Number.isFinite(value) && value > 0
        ? value
        : null;
    const count = (value: unknown): number =>
      Array.isArray(value) ? value.length : 0;
    const primary = payload.components.headstone ?? payload.components.plaque;
    record = {
      path: candidate,
      productId,
      shape:
        typeof payload.product.shape === 'string'
          ? payload.product.shape
          : null,
      materialTexture:
        typeof payload.product.material?.texture === 'string'
          ? payload.product.material.texture
          : null,
      materialName:
        data.materials.find(
          (material) =>
            payload.product.material?.texture ===
            '/textures/forever/l/' + material.image,
        )?.name ?? null,
      status: reasons.length ? 'requires-review' : 'source-ready',
      reasons,
      version: typeof payload.version === 'string' ? payload.version : null,
      dimensionsMm: {
        width: dimension(primary?.width_mm),
        height: dimension(primary?.height_mm),
        thickness: dimension(primary?.thickness_mm),
      },
      elementCounts: {
        inscriptions: count(payload.elements.inscriptions),
        motifs: count(payload.elements.motifs),
        photos:
          count(payload.elements.photos) ||
          (Array.isArray(payload.legacy?.raw)
            ? payload.legacy.raw.filter(
                (item: { type?: string }) =>
                  item.type === 'Photo' || item.type === 'Picture',
              ).length
            : 0),
        logos:
          count(payload.elements.logos) ||
          (Array.isArray(payload.legacy?.raw)
            ? payload.legacy.raw.filter(
                (item: { type?: string }) => item.type === 'Logo',
              ).length
            : 0),
        additions: count(payload.elements.additions),
      },
      evidence: {
        legacyProductId,
        legacyAgreesWithSource,
        sourceProductExists: products.has(productId),
        decision: !reasons.length
          ? 'consistent'
          : !products.has(productId)
            ? 'unresolved'
            : legacyAgreesWithSource === true
              ? 'metadata-review'
              : legacyProductId === String(design.productId)
                ? 'source-review'
                : 'unresolved',
      },
    };
    break;
  }
  manifest[design.id] = record;
}
const output = path.join(process.cwd(), 'lib/design-source-manifest.json');
const content = JSON.stringify(manifest, null, 2) + '\n';
const holds = Object.fromEntries(
  Object.entries(manifest)
    .filter(([, source]) => source.status !== 'source-ready')
    .map(([id, source]) => [id, source.status]),
);
const personalization = {
  expectedProductIds: Object.fromEntries(
    Object.entries(manifest)
      .filter(([, source]) => source.status === 'source-ready')
      .map(([id, source]) => [id, source.productId]),
  ),
  holds,
};
const holdsOutput = path.join(
  process.cwd(),
  'lib/design-personalization-manifest.json',
);
if (process.argv.includes('--check')) {
  if (
    !fs.existsSync(output) ||
    JSON.stringify(JSON.parse(fs.readFileSync(output, 'utf8'))) !==
      JSON.stringify(manifest)
  )
    throw new Error('Source manifest is stale');
  if (
    !fs.existsSync(holdsOutput) ||
    JSON.stringify(JSON.parse(fs.readFileSync(holdsOutput, 'utf8'))) !==
      JSON.stringify(personalization)
  )
    throw new Error('Personalization manifest is stale');
} else {
  fs.writeFileSync(output, content);
  fs.writeFileSync(
    holdsOutput,
    JSON.stringify(personalization, null, 2) + '\n',
  );
}
console.log(
  JSON.stringify(
    Object.values(manifest).reduce<Record<string, number>>((counts, source) => {
      counts[source.status] = (counts[source.status] ?? 0) + 1;
      return counts;
    }, {}),
  ),
);
