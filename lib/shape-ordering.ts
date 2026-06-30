type ShapeLike = {
  name?: string | null;
  image?: string | null;
  previewUrl?: string | null;
};

function isSerpentineShape(shape: ShapeLike) {
  const name = shape.name?.toLowerCase().trim() ?? '';
  const image = shape.image?.toLowerCase().split('/').pop() ?? '';
  const preview = shape.previewUrl?.toLowerCase().split('/').pop() ?? '';

  return name === 'serpentine' || image === 'serpentine.svg' || preview === 'serpentine.svg';
}

export function putSerpentineFirst<T extends ShapeLike>(shapes: T[]) {
  const serpentineIndex = shapes.findIndex(isSerpentineShape);
  if (serpentineIndex <= 0) return shapes;

  const ordered = shapes.slice();
  const [serpentine] = ordered.splice(serpentineIndex, 1);
  return [serpentine, ...ordered];
}
