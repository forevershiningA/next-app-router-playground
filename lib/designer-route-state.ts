export const DESIGNER_STEP_SLUGS = [
  'select-product',
  'select-shape',
  'select-border',
  'select-fastening',
  'select-material',
  'select-size',
  'inscriptions',
  'select-images',
  'select-additions',
  'select-emblems',
  'select-motifs',
  'check-price',
  'design-menu',
] as const;

export type DesignerStepSlug = (typeof DESIGNER_STEP_SLUGS)[number];

const DESIGNER_STEP_SLUG_SET = new Set<string>(DESIGNER_STEP_SLUGS);

export function isDesignerStepSlug(value: string | null | undefined): value is DesignerStepSlug {
  return Boolean(value && DESIGNER_STEP_SLUG_SET.has(value));
}

export function getDesignerStepSlug(pathname: string | null | undefined) {
  if (!pathname) return null;

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  const [firstSegment, secondSegment] = segments;

  if (segments.length === 1 && DESIGNER_STEP_SLUG_SET.has(firstSegment)) {
    return firstSegment;
  }

  if (
    segments.length === 2 &&
    secondSegment &&
    DESIGNER_STEP_SLUG_SET.has(secondSegment)
  ) {
    return secondSegment;
  }

  return null;
}

export function isDesignerRoutePath(pathname: string | null | undefined) {
  if (pathname === '/') return true;
  return getDesignerStepSlug(pathname) !== null;
}
