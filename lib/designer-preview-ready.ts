import type { Object3D } from 'three';

type PreviewMesh = Object3D & {
  isMesh?: boolean;
  geometry?: { attributes?: { position?: { count?: number } } };
  material?: { map?: { image?: { width?: number; height?: number; complete?: boolean } } } | Array<{ map?: { image?: { width?: number; height?: number; complete?: boolean } } }>;
};

function hasVisibleMesh(group: Object3D, name: string, textured: boolean): boolean {
  let found = false;
  for (let ancestor: Object3D | null = group.parent; ancestor; ancestor = ancestor.parent) if (!ancestor.visible) return false;
  const walk = (object: Object3D, ancestorsVisible: boolean) => {
    const visible = ancestorsVisible && object.visible;
    const mesh = object as PreviewMesh;
    if (visible && object.name === name && mesh.isMesh && (mesh.geometry?.attributes?.position?.count ?? 0) > 0) {
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const loaded = materials.some((material) => {
        const image = material?.map?.image;
        return Boolean(image && (image.width ?? 0) > 0 && (image.height ?? 0) > 0 && image.complete !== false);
      });
      if (!textured || loaded) found = true;
    }
    for (const child of object.children) walk(child, visible);
  };
  walk(group, true);
  return found;
}

/** Readiness is currently verified only for the traditional engraved headstone. */
export function getTraditionalHeadstoneReadiness(
  scene: Object3D,
  snapshot: { productId: string | null; shapeUrl: string | null; headstoneMaterialUrl: string | null; baseMaterialUrl: string | null; showBase: boolean },
) {
  if (snapshot.productId !== '124') return { supported: false as const };
  let shapeReady = false;
  let headstoneMaterialReady = false;
  let baseReady = !snapshot.showBase;
  scene.traverse((group) => {
    if (group.userData.previewHeadstone === true) {
      const shapeMatches = group.userData.previewShapeUrl === snapshot.shapeUrl && group.userData.previewShapeReady === true;
      shapeReady ||= shapeMatches && hasVisibleMesh(group, 'headstone', false);
      headstoneMaterialReady ||= shapeMatches && group.userData.previewHeadstoneMaterialUrl === snapshot.headstoneMaterialUrl && group.userData.previewHeadstoneMaterialReady === true && hasVisibleMesh(group, 'headstone', true);
    }
    if (snapshot.showBase && group.userData.previewBase === true) {
      baseReady ||= group.userData.previewBaseMaterialUrl === snapshot.baseMaterialUrl && group.userData.previewBaseMaterialReady === true && hasVisibleMesh(group, 'base', true);
    }
  });
  return { supported: true as const, shapeReady, headstoneMaterialReady, baseReady };
}

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
  if (inscriptions.length === 0) return true;
  if (scene.getObjectByName('polish-tomb-body')) {
    // Polish assembly has dedicated procedural geometry; inscription meshes are not mounted in 3D scene
    return true;
  }
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
  if (images.length === 0) return true;
  if (scene.getObjectByName('polish-tomb-body')) return true;
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
  if (motifs.length === 0) return true;
  if (scene.getObjectByName('polish-tomb-body')) return true;
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
  if (additions.length === 0) return true;
  if (scene.getObjectByName('polish-tomb-body')) return true;
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
  if (emblems.length === 0) return true;
  if (scene.getObjectByName('polish-tomb-body')) return true;
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
