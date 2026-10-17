import sources from './design-source-manifest.json';
import { isDesignIndexable } from './design-publication';
import type { SavedDesignMetadata } from './saved-designs-data';
import { DESIGN_CATEGORIES } from './saved-designs-data';
import { getDesignPersonalization } from './design-personalization';
import {
  unavailableDesignSource,
  type DesignSourceSummary,
} from './design-source-types';
export type { DesignSourceSummary } from './design-source-types';

const manifest: Readonly<Record<string, DesignSourceSummary>> =
  sources as Record<string, DesignSourceSummary>;

/** Publication and source readiness are independent; neither certifies visual parity. */
export function getDesignPresentation(design: SavedDesignMetadata) {
  const source = manifest[design.id] ?? unavailableDesignSource();
  const indexable = isDesignIndexable(design);
  return {
    id: design.id,
    title: design.title,
    category: design.category,
    productSlug: design.productSlug,
    motifNames: design.motifNames,
    description: `${DESIGN_CATEGORIES[design.category]?.name ?? 'Memorial'} layout. Review the preview and choose a template to personalize in the 3D Designer.`,
    copyApproval: 'draft' as const,
    tags: [design.category],
    personalization: getDesignPersonalization(source.status),
    layout: source.path ? source.elementCounts : null,
    preview: indexable ? '/screenshots/v2026-3d/' + design.id + '.png' : null,
    canonicalPath:
      '/designs/' +
      design.productSlug +
      '/' +
      design.category +
      '/' +
      design.slug,
    galleryEligible: indexable,
    indexEligible: indexable,
    source,
    contentUpdatedAt: null,
    featuredReason: null,
    // Captions must be reviewed before deriving public copy from legacy text.
    visualApproval: 'pending' as const,
    privacyApproval: 'pending' as const,
  };
}
