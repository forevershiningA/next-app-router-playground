import previewIds from './design-preview-ids.json';
import {
  getAllSavedDesigns,
  type SavedDesignMetadata,
} from './saved-designs-data';

export const INDEXABLE_PRODUCT_SLUGS = new Set([
  'laser-etched-headstone',
  'traditional-headstone',
  'bronze-plaque',
  'traditional-plaque',
  'laser-colour-plaque',
  'stainless-steel-plaque',
  'mini-headstone',
  'full-colour-plaque',
  'traditional-monument',
  'laser-monument',
  'pets',
]);

// Committed build input: availability never depends on Vercel's runtime filesystem.
const availablePreviews = new Set<string>(previewIds);

export function getPublishedPreviewIds(): Set<string> {
  return new Set(availablePreviews);
}

export function isDesignIndexable(design: SavedDesignMetadata): boolean {
  return (
    INDEXABLE_PRODUCT_SLUGS.has(design.productSlug) &&
    availablePreviews.has(design.id)
  );
}

export function getPublishedDesigns(): SavedDesignMetadata[] {
  return getAllSavedDesigns().filter(isDesignIndexable);
}
