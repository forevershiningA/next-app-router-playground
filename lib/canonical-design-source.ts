/** Shared, side-effect-free source order for runtime and catalog generation. */
export const DEFAULT_CANONICAL_DESIGN_VERSION =
  'v2026-rollout-full-20260324-190828';
export const DEFAULT_CANONICAL_DESIGN_BASE_PATH = '/designs';
const SOURCE_OVERRIDES: Readonly<Record<string, string>> = {
  '1725769905504': '/canonical-designs/v2026/1725769905504.json',
};

export function getCanonicalDesignUrl(designId: string): string {
  return (
    SOURCE_OVERRIDES[designId] ??
    DEFAULT_CANONICAL_DESIGN_BASE_PATH +
      '/' +
      DEFAULT_CANONICAL_DESIGN_VERSION +
      '/' +
      designId +
      '.json'
  );
}

export function getCanonicalDesignCandidateUrls(
  designId: string,
): readonly string[] {
  return [
    DEFAULT_CANONICAL_DESIGN_BASE_PATH + '/v2026-p3d/' + designId + '.json',
    getCanonicalDesignUrl(designId),
  ];
}

/** Structural validation only; visual parity still requires editor review. */
export function isCanonicalDesignSource(
  value: unknown,
  designId: string,
): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  const object = (input: unknown): input is Record<string, unknown> =>
    !!input && typeof input === 'object' && !Array.isArray(input);
  if (
    !object(item.product) ||
    !object(item.components) ||
    !object(item.elements)
  )
    return false;
  if (
    !['string', 'number'].includes(typeof item.product.id) ||
    !String(item.product.id).trim()
  )
    return false;
  return object(item.source) && String(item.source.id) === designId;
}

/** Legacy exports contain decimal dimensions as JSON strings. Normalize at the
 * boundary, before finite-number checks in store setters and layout arithmetic. */
export function normalizeCanonicalDesignSource<T>(
  value: T,
  designId: string,
): T | null {
  if (!isCanonicalDesignSource(value, designId)) return null;
  const item = value as Record<string, unknown>;
  const normalizeDimensions = (
    input: unknown,
  ): Record<string, unknown> | null => {
    if (!input || typeof input !== 'object' || Array.isArray(input))
      return null;
    const result = { ...input } as Record<string, unknown>;
    for (const [key, raw] of Object.entries(result)) {
      if (
        ![
          'width_mm',
          'height_mm',
          'depth_mm',
          'thickness_mm',
          'length_mm',
        ].includes(key) ||
        raw == null
      )
        continue;
      if (typeof raw !== 'number' && (typeof raw !== 'string' || !raw.trim()))
        return null;
      const number = Number(raw);
      if (!Number.isFinite(number) || number < 0) return null;
      result[key] = number;
    }
    return result;
  };
  const components: Record<string, unknown> = {};
  for (const [name, component] of Object.entries(
    item.components as Record<string, unknown>,
  )) {
    if (component == null) {
      components[name] = component;
      continue;
    }
    const normalized = normalizeDimensions(component);
    if (!normalized) return null;
    components[name] = normalized;
  }
  const scene =
    item.scene && typeof item.scene === 'object'
      ? ({ ...item.scene } as Record<string, unknown>)
      : undefined;
  if (scene?.canvas) {
    const canvas = normalizeDimensions(scene.canvas);
    if (!canvas) return null;
    scene.canvas = canvas;
  }
  return { ...item, components, ...(scene ? { scene } : {}) } as T;
}
