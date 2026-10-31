import type { Object3D } from 'three';

type TextMesh = Object3D & {
  text?: string;
  fontSize?: number;
  textAlign?: string;
  textRenderInfo?: {
    parameters: {
      text: string;
      fontSize: number;
      textAlign: string;
      font?: { src: string }[];
    };
  } | null;
};

/** Check processed glyphs, not just the text props queued for the worker. */
export function areInscriptionGlyphsReady(
  scene: Object3D,
  inscriptions: ReadonlyArray<{ id: string; text: string }>,
  baseUrl: string,
): boolean {
  const expected = new Map(inscriptions.map((line) => [line.id, line.text]));
  const found = new Set<string>();
  let ready = true;
  scene.traverse((object) => {
    const mesh = object as TextMesh;
    const id = mesh.userData.inscriptionId as string | undefined;
    if (!id) return;
    const params = mesh.textRenderInfo?.parameters;
    const requestedFont = mesh.userData.requestedFont as string | undefined;
    if (
      !expected.has(id) ||
      !params ||
      params.text !== expected.get(id) ||
      params.text !== mesh.text ||
      params.fontSize !== mesh.fontSize ||
      params.textAlign !== mesh.textAlign ||
      (requestedFont &&
        !params.font?.some(
          ({ src }) => src === new URL(requestedFont, baseUrl).href,
        ))
    ) {
      ready = false;
    }
    found.add(id);
  });
  return ready && inscriptions.every(({ id }) => found.has(id));
}

/** Reject missing, stale, or placeholder image textures in a captured scene. */
export function areDesignerImagesReady(
  scene: Object3D,
  images: ReadonlyArray<{ id: string; imageUrl: string }>,
): boolean {
  const expected = new Map(images.map((image) => [image.id, image.imageUrl]));
  const found = new Set<string>();
  let ready = true;
  scene.traverse((object) => {
    const id = object.userData.previewImageId as string | undefined;
    if (!id) return;
    if (
      !expected.has(id) ||
      expected.get(id) !== object.userData.previewImageUrl ||
      object.userData.previewImagePlaceholder !== false
    )
      ready = false;
    found.add(id);
  });
  return ready && images.every(({ id }) => found.has(id));
}

/** Check that each visible motif has its current rasterized artwork on its surface. */
export function areDesignerMotifsReady(
  scene: Object3D,
  motifs: ReadonlyArray<{ id: string; svgPath: string; surface: string }>,
): boolean {
  const expected = new Map(motifs.map((motif) => [motif.id, motif]));
  const found = new Set<string>();
  let ready = true;
  scene.traverse((object) => {
    const id = object.userData.previewMotifId as string | undefined;
    if (!id) return;
    const motif = expected.get(id);
    if (
      !motif ||
      motif.svgPath !== object.userData.previewMotifPath ||
      motif.surface !== object.userData.previewMotifSurface ||
      object.userData.previewMotifReady !== true
    )
      ready = false;
    found.add(id);
  });
  return ready && motifs.every(({ id }) => found.has(id));
}

export function areDesignerAdditionsReady(
  scene: Object3D,
  additions: ReadonlyArray<{ id: string; surface: string }>,
): boolean {
  const expected = new Map(additions.map((item) => [item.id, item.surface]));
  const found = new Set<string>();
  let ready = true;
  scene.traverse((object) => {
    const id = object.userData.previewAdditionId as string | undefined;
    if (!id) return;
    if (
      !expected.has(id) ||
      expected.get(id) !== object.userData.previewAdditionSurface
    )
      ready = false;
    found.add(id);
  });
  return ready && additions.every(({ id }) => found.has(id));
}

export function areDesignerEmblemsReady(
  scene: Object3D,
  emblems: ReadonlyArray<{ id: string; imageUrl: string; surface: string }>,
): boolean {
  const expected = new Map(emblems.map((item) => [item.id, item]));
  const found = new Set<string>();
  let ready = true;
  scene.traverse((object) => {
    const id = object.userData.previewEmblemId as string | undefined;
    if (!id) return;
    const emblem = expected.get(id);
    if (
      !emblem ||
      emblem.imageUrl !== object.userData.previewEmblemUrl ||
      emblem.surface !== object.userData.previewEmblemSurface
    )
      ready = false;
    found.add(id);
  });
  return ready && emblems.every(({ id }) => found.has(id));
}
