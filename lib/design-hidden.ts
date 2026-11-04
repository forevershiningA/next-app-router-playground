import manifest from './design-hidden-manifest.json';

/**
 * Reversible public-catalog holds based on documented image review.
 * The underlying design and preview assets are not deleted or made private.
 * Revisit each item after provenance verification or a corrected preview.
 */
export const HIDDEN_DESIGN_REASONS: Readonly<Record<string, string>> = Object.fromEntries(
  manifest.map(({ id, reason }) => [id, reason]),
);
const hiddenPaths = new Set(manifest.map(({ path }) => path));

export function isHiddenDesign(id: string): boolean {
  return Object.hasOwn(HIDDEN_DESIGN_REASONS, id);
}

export function isHiddenDesignPath(pathname: string): boolean {
  return hiddenPaths.has(pathname.replace(/\/+$/, ''));
}
