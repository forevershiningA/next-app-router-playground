import fs from 'node:fs';
import path from 'node:path';
import {
  getAllSavedDesigns,
  getDesignFromSlug,
} from '../lib/saved-designs-data';
import { getDesignPresentation } from '../lib/design-presentation';

const records = getAllSavedDesigns().map((design) => {
  const presentation = getDesignPresentation(design);
  return {
    ...presentation,
    routeResolves:
      getDesignFromSlug(design.slug, {
        productSlug: design.productSlug,
        category: design.category,
      })?.id === design.id,
    publicationReason: presentation.indexEligible
      ? 'eligible-product-with-preview'
      : 'retired-product-or-missing-preview',
  };
});
const summary = {
  total: records.length,
  galleryEligible: records.filter((item) => item.galleryEligible).length,
  indexEligible: records.filter((item) => item.indexEligible).length,
  routeFailures: records.filter((item) => !item.routeResolves).length,
  sourceStatus: records.reduce<Record<string, number>>((counts, item) => {
    counts[item.source.status] = (counts[item.source.status] ?? 0) + 1;
    return counts;
  }, {}),
  sourceReview: records.reduce<Record<string, number>>((counts, item) => {
    const decision = item.source.evidence.decision;
    counts[decision] = (counts[decision] ?? 0) + 1;
    return counts;
  }, {}),
  publishedPersonalizationHeld: records.filter(
    (item) =>
      item.galleryEligible && item.personalization.state !== 'available',
  ).length,
};
const output = path.join(
  process.cwd(),
  'docs/audits/2026-10-16-designs/stage-2-publication.json',
);
fs.writeFileSync(output, JSON.stringify({ summary, records }, null, 2) + '\n');
const pilot: { projects: { id: string }[] } = JSON.parse(
  fs.readFileSync(path.join(path.dirname(output), 'pilot.json'), 'utf8'),
);
const pilotIds = new Set(pilot.projects.map((item) => item.id));
const reviewQueue = {
  note: 'Evidence supports review directions, not automatic product reassignment. Original content is not copied into this report.',
  pilot: records
    .filter((item) => pilotIds.has(item.id))
    .map((item) => ({
      id: item.id,
      routeResolves: item.routeResolves,
      personalization: item.personalization.state,
    })),
  records: records
    .filter((item) => item.source.status !== 'source-ready')
    .map((item) => ({
      id: item.id,
      canonicalPath: item.canonicalPath,
      indexEligible: item.indexEligible,
      decision: 'hold-personalization-keep-url',
      evidence: item.source.evidence,
      reasons: item.source.reasons,
    })),
};
fs.writeFileSync(
  path.join(path.dirname(output), 'stage-2-review-queue.json'),
  JSON.stringify(reviewQueue, null, 2) + '\n',
);
console.log(JSON.stringify(summary));
if (summary.routeFailures)
  throw new Error('Canonical routes do not resolve unambiguously');
