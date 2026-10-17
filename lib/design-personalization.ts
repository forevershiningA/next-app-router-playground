import manifest from './design-personalization-manifest.json';

const expectedProductIds: Readonly<Record<string, string>> =
  manifest.expectedProductIds;

export type DesignPersonalization = {
  state: 'available' | 'review-required' | 'unavailable';
  message: string | null;
};

export function getDesignPersonalization(
  status: 'source-ready' | 'requires-review' | 'unavailable',
): DesignPersonalization {
  if (status === 'source-ready') return { state: 'available', message: null };
  return status === 'requires-review'
    ? {
        state: 'review-required',
        message:
          'This template is being checked before personalization. Please choose another design from this collection.',
      }
    : {
        state: 'unavailable',
        message:
          'This template is temporarily unavailable for personalization. Please choose another design from this collection.',
      };
}
/** Small client manifest; full source facts stay on the server. */
export function getDesignPersonalizationHold(
  designId: string,
): DesignPersonalization | null {
  const status = (
    manifest.holds as Record<string, 'requires-review' | 'unavailable'>
  )[designId];
  if (status) return getDesignPersonalization(status);
  return Object.prototype.hasOwnProperty.call(expectedProductIds, designId)
    ? null
    : getDesignPersonalization('unavailable');
}

export function getExpectedDesignProductId(designId: string): string | null {
  return Object.prototype.hasOwnProperty.call(expectedProductIds, designId)
    ? expectedProductIds[designId]
    : null;
}
