import {describe, expect, it} from 'vitest';
import {BoxGeometry, Group, Mesh, MeshBasicMaterial, PlaneGeometry, Scene} from 'three';
import {assessHeadstoneMotifLayout} from '#/lib/designer-motif-layout';

function setup() {
  const scene = new Scene();
  const stone = new Mesh(new BoxGeometry(.6,.9,.1),new MeshBasicMaterial());
  stone.name='headstone';stone.position.set(0,.55,0);scene.add(stone);
  const base = new Mesh(new BoxGeometry(.7,.1,.25),new MeshBasicMaterial());
  base.name='base';base.position.set(0,.05,.075);scene.add(base);
  const group = new Group();group.userData.previewMotifId='cross';scene.add(group);
  const motif = new Mesh(new PlaneGeometry(.04,.045),new MeshBasicMaterial());
  motif.name='motif-cross';motif.position.set(0,.1,.051);group.add(motif);
  const snapshot={productId:'124',showBase:true,selectedMotifs:[{id:'cross',svgPath:'/cross.svg'}],motifOffsets:{cross:{target:'headstone' as const}}};
  return {scene,stone,base,motif,snapshot};
}

describe('headstone motif bounding warnings',()=>{
  it('warns when the motif extends below the stone and the base can cover it',()=>{
    const f=setup();const result=assessHeadstoneMotifLayout(f.scene,f.snapshot);
    expect(result.checkedMotifIds).toEqual(['cross']);
    expect(result.warnings.map((warning)=>warning.code)).toEqual(['MOTIF_OUTSIDE_HEADSTONE_BOUNDS','MOTIF_POSSIBLY_OCCLUDED_BY_BASE']);
  });
  it('clears warnings when the full motif rectangle is within the stone and away from the base',()=>{
    const f=setup();f.motif.position.y=.3;
    expect(assessHeadstoneMotifLayout(f.scene,f.snapshot).warnings).toEqual([]);
  });
  it('flags a motif near an edge and leaves other surfaces explicitly unchecked',()=>{
    const f=setup();f.motif.position.set(.275,.5,.051);
    expect(assessHeadstoneMotifLayout(f.scene,f.snapshot).warnings.map((w)=>w.code)).toContain('MOTIF_NEAR_HEADSTONE_EDGE');
    expect(assessHeadstoneMotifLayout(f.scene,{...f.snapshot,motifOffsets:{cross:{target:'base'}}}).uncheckedMotifIds).toEqual(['cross']);
  });
  it('does not claim validation for hidden meshes or unsupported products',()=>{
    const f=setup();f.motif.visible=false;
    expect(assessHeadstoneMotifLayout(f.scene,f.snapshot).uncheckedMotifIds).toEqual(['cross']);
    expect(assessHeadstoneMotifLayout(f.scene,{...f.snapshot,productId:'5'}).scope).toBe('unsupported-product');
  });
});
