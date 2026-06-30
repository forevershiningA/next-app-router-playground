import { data } from '#/app/_internal/_data';

type MotifCategoryImageInput = {
  name?: string | null;
  category?: string | null;
  src?: string | null;
  img?: string | null;
  previewUrl?: string | null;
  fallback?: string;
};

const DEFAULT_MOTIF_CATEGORY_IMAGE = '/ico/forever-transparent-logo.png';

function normalizeCategoryKey(value: string | null | undefined) {
  return (value ?? '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '');
}

function lastPathSegment(value: string | null | undefined) {
  return (value ?? '').split('/').filter(Boolean).pop() ?? '';
}

export function getMotifCategoryImage({
  name,
  category,
  src,
  img,
  previewUrl,
  fallback = DEFAULT_MOTIF_CATEGORY_IMAGE,
}: MotifCategoryImageInput) {
  if (img) return img;

  const normalizedName = normalizeCategoryKey(name);
  const normalizedCategory = normalizeCategoryKey(category);
  const normalizedSrc = normalizeCategoryKey(src);
  const normalizedSrcLeaf = normalizeCategoryKey(lastPathSegment(src));

  const match = data.motifs.find((motif) => {
    const motifName = normalizeCategoryKey(motif.name);
    const motifSrc = normalizeCategoryKey(motif.src);
    const motifSrcLeaf = normalizeCategoryKey(lastPathSegment(motif.src));

    return (
      (normalizedSrc && (normalizedSrc === motifSrc || normalizedSrcLeaf === motifSrcLeaf)) ||
      (normalizedName && (normalizedName === motifName || normalizedName === motifSrcLeaf)) ||
      (normalizedCategory && (normalizedCategory === motifName || normalizedCategory === motifSrcLeaf))
    );
  });

  return match?.img ?? previewUrl ?? fallback;
}
