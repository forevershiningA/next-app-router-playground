import { Box3, Mesh, Object3D } from 'three';

type Motif = { id: string; svgPath: string };
type Offset = { target?: 'headstone' | 'base' | 'ledger' };
export type MotifLayoutWarning = {
  code: 'MOTIF_OUTSIDE_HEADSTONE_BOUNDS' | 'MOTIF_NEAR_HEADSTONE_EDGE' | 'MOTIF_POSSIBLY_OCCLUDED_BY_BASE';
  motifId: string;
  message: string;
};

function visible(object: Object3D): boolean {
  for (let node: Object3D | null = object; node; node = node.parent) if (!node.visible) return false;
  return true;
}

function meshBounds(object: Object3D): Box3 | null {
  const mesh = object as Mesh;
  if (!mesh.isMesh || !mesh.geometry || !visible(mesh)) return null;
  if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
  const box = mesh.geometry.boundingBox?.clone().applyMatrix4(mesh.matrixWorld);
  return box && !box.isEmpty() ? box : null;
}

/** Conservative axis-aligned checks; do not establish silhouette containment or legibility. */
export function assessHeadstoneMotifLayout(scene: Object3D, snapshot: {
  productId: string | null;
  showBase: boolean;
  selectedMotifs: readonly Motif[];
  motifOffsets: Record<string, Offset>;
}) {
  if (snapshot.productId !== '124') return { scope: 'unsupported-product' as const, checkedMotifIds: [] as string[], uncheckedMotifIds: snapshot.selectedMotifs.map((m) => m.id), warnings: [] as MotifLayoutWarning[] };
  scene.updateMatrixWorld(true);
  const headstone = new Box3();
  const base = new Box3();
  const motifMeshes = new Map<string, Object3D>();
  scene.traverse((object) => {
    if (object.name === 'headstone') { const box = meshBounds(object); if (box) headstone.union(box); }
    if (object.name === 'base') { const box = meshBounds(object); if (box) base.union(box); }
    const id = object.userData.previewMotifId as string | undefined;
    if (id) {
      object.traverse((child) => { if (child.name === `motif-${id}`) motifMeshes.set(id, child); });
    }
  });
  const warnings: MotifLayoutWarning[] = [];
  const checkedMotifIds: string[] = [];
  const uncheckedMotifIds: string[] = [];
  for (const motif of snapshot.selectedMotifs) {
    if ((snapshot.motifOffsets[motif.id]?.target ?? 'headstone') !== 'headstone') { uncheckedMotifIds.push(motif.id); continue; }
    const object = motifMeshes.get(motif.id);
    const box = object ? meshBounds(object) : null;
    if (headstone.isEmpty() || !box || (snapshot.showBase && base.isEmpty())) { uncheckedMotifIds.push(motif.id); continue; }
    checkedMotifIds.push(motif.id);
    const epsilon = 0.001;
    const outside = box.min.x < headstone.min.x - epsilon || box.max.x > headstone.max.x + epsilon || box.min.y < headstone.min.y - epsilon || box.max.y > headstone.max.y + epsilon;
    const margin = Math.min(headstone.max.x - headstone.min.x, headstone.max.y - headstone.min.y) * 0.02;
    const clearance = Math.min(box.min.x - headstone.min.x, headstone.max.x - box.max.x, box.min.y - headstone.min.y, headstone.max.y - box.max.y);
    if (outside) warnings.push({code:'MOTIF_OUTSIDE_HEADSTONE_BOUNDS',motifId:motif.id,message:'The motif bounding rectangle extends outside the headstone bounding rectangle.'});
    else if (clearance < margin) warnings.push({code:'MOTIF_NEAR_HEADSTONE_EDGE',motifId:motif.id,message:'The motif bounding rectangle is close to a headstone edge.'});
    if (snapshot.showBase && box.min.x < base.max.x && box.max.x > base.min.x && box.min.y < base.max.y && box.max.y > base.min.y && base.max.z > box.min.z + epsilon)
      warnings.push({code:'MOTIF_POSSIBLY_OCCLUDED_BY_BASE',motifId:motif.id,message:'The base may cover part of this motif in the front-facing preview.'});
  }
  return { scope: 'traditional-headstone-rectangular-bounds' as const, checkedMotifIds, uncheckedMotifIds, warnings };
}
