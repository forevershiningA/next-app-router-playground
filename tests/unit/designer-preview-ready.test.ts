import { describe, expect, it } from 'vitest';
import { Object3D, Mesh, BoxGeometry, MeshBasicMaterial, Texture } from 'three';
import {
  areDesignerAdditionsReady,
  areDesignerEmblemsReady,
  areDesignerImagesReady,
  areDesignerMotifsReady,
  areInscriptionGlyphsReady,
  getTraditionalHeadstoneReadiness,
} from '#/lib/designer-preview-ready';

describe('traditional headstone structural readiness', () => {
  it('waits for the requested shape, texture and visible base, and rejects stale assets', () => {
    const scene = new Object3D();
    const snapshot = {productId:'124',shapeUrl:'/shape.svg',headstoneMaterialUrl:'/stone.webp',baseMaterialUrl:'/base.webp',showBase:true};
    const stone = new Object3D();
    stone.userData = {previewHeadstone:true,previewShapeUrl:'/old.svg',previewShapeReady:true,previewHeadstoneMaterialUrl:'/stone.webp',previewHeadstoneMaterialReady:true};
    const texture = new Texture();
    texture.image = {width:10,height:10,complete:true};
    const mesh = new Mesh(new BoxGeometry(),new MeshBasicMaterial({map:texture}));
    mesh.name='headstone';stone.add(mesh);scene.add(stone);
    const base = new Object3D();base.userData={previewBase:true,previewBaseMaterialUrl:'/base.webp',previewBaseMaterialReady:false};
    const baseMesh = new Mesh(new BoxGeometry(),new MeshBasicMaterial({map:texture}));baseMesh.name='base';base.add(baseMesh);scene.add(base);
    expect(getTraditionalHeadstoneReadiness(scene,snapshot)).toEqual({supported:true,shapeReady:false,headstoneMaterialReady:false,baseReady:false});
    stone.userData.previewShapeUrl='/shape.svg';stone.userData.previewHeadstoneMaterialReady=false;
    expect(getTraditionalHeadstoneReadiness(scene,snapshot)).toMatchObject({shapeReady:true,headstoneMaterialReady:false,baseReady:false});
    stone.userData.previewHeadstoneMaterialReady=true;base.userData.previewBaseMaterialReady=true;texture.image.complete=false;
    expect(getTraditionalHeadstoneReadiness(scene,snapshot)).toMatchObject({shapeReady:true,headstoneMaterialReady:false,baseReady:false});
    texture.image.complete=true;
    expect(getTraditionalHeadstoneReadiness(scene,snapshot)).toEqual({supported:true,shapeReady:true,headstoneMaterialReady:true,baseReady:true});
    base.visible=false;
    expect(getTraditionalHeadstoneReadiness(scene,snapshot)).toMatchObject({baseReady:false});
    expect(getTraditionalHeadstoneReadiness(scene,{...snapshot,productId:'other'})).toEqual({supported:false});
  });
});

describe('preview additions and emblems', () => {
  it('requires mounted additions on the requested surface', () => {
    const scene = new Object3D();
    const addition = { id: 'vase', surface: 'base' };
    expect(areDesignerAdditionsReady(scene, [addition])).toBe(false);
    const group = new Object3D();
    group.userData = {
      previewAdditionId: 'vase',
      previewAdditionSurface: 'headstone',
    };
    scene.add(group);
    expect(areDesignerAdditionsReady(scene, [addition])).toBe(false);
    group.userData.previewAdditionSurface = 'base';
    expect(areDesignerAdditionsReady(scene, [addition])).toBe(true);
    expect(areDesignerAdditionsReady(scene, [])).toBe(false);
  });
  it('requires an emblem with its current texture and surface', () => {
    const scene = new Object3D();
    const emblem = { id: 'badge', imageUrl: '/new.png', surface: 'headstone' };
    expect(areDesignerEmblemsReady(scene, [emblem])).toBe(false);
    const group = new Object3D();
    group.userData = {
      previewEmblemId: 'badge',
      previewEmblemUrl: '/old.png',
      previewEmblemSurface: 'headstone',
    };
    scene.add(group);
    expect(areDesignerEmblemsReady(scene, [emblem])).toBe(false);
    group.userData.previewEmblemUrl = '/new.png';
    expect(areDesignerEmblemsReady(scene, [emblem])).toBe(true);
    group.userData.previewEmblemSurface = 'base';
    expect(areDesignerEmblemsReady(scene, [emblem])).toBe(false);
  });
});

function fixture() {
  const scene = new Object3D();
  const mesh = Object.assign(new Object3D(), {
    text: 'ALEX MORGAN',
    fontSize: 40,
    textAlign: 'center',
    textRenderInfo: {
      parameters: {
        text: 'ALEX MORGAN',
        fontSize: 40,
        textAlign: 'center',
        font: [{ src: 'https://example.com/fonts/garamond.woff2' }],
      },
    },
  });
  mesh.userData = {
    inscriptionId: 'name',
    requestedFont: '/fonts/garamond.woff2',
  };
  scene.add(mesh);
  const lines = [{ id: 'name', text: 'ALEX MORGAN' }];
  return {
    scene,
    mesh,
    lines,
    ready: () =>
      areInscriptionGlyphsReady(scene, lines, 'https://example.com/'),
  };
}

describe('saved preview lettering', () => {
  it('accepts matching processed glyphs', () => {
    expect(fixture().ready()).toBe(true);
  });
  it('rejects KLEIN geometry even when the mesh text already says ALEX MORGAN', () => {
    const f = fixture();
    f.mesh.textRenderInfo.parameters.text = 'KLEIN';
    expect(f.ready()).toBe(false);
  });
  it('waits for every inscription to mount', () => {
    const f = fixture();
    f.lines.push({ id: 'dates', text: '1940–2020' });
    expect(f.ready()).toBe(false);
  });
  it('rejects a deleted inscription still present in the scene', () => {
    const f = fixture();
    f.lines.length = 0;
    expect(f.ready()).toBe(false);
  });
  it('waits for font replacement and font size changes', () => {
    const f = fixture();
    f.mesh.userData.requestedFont = '/fonts/arial.woff2';
    expect(f.ready()).toBe(false);
    f.mesh.userData.requestedFont = '/fonts/garamond.woff2';
    f.mesh.fontSize = 50;
    expect(f.ready()).toBe(false);
  });
});

describe('preview motifs', () => {
  it('waits for the correct rasterized motif and surface', () => {
    const scene = new Object3D();
    const motifs = [{ id: 'motif', svgPath: '/new.svg', surface: 'base' }];
    expect(areDesignerMotifsReady(scene, motifs)).toBe(false);
    const group = new Object3D();
    group.userData = {
      previewMotifId: 'motif',
      previewMotifPath: '/old.svg',
      previewMotifSurface: 'base',
      previewMotifReady: true,
    };
    scene.add(group);
    expect(areDesignerMotifsReady(scene, motifs)).toBe(false);
    group.userData.previewMotifPath = '/new.svg';
    group.userData.previewMotifReady = false;
    expect(areDesignerMotifsReady(scene, motifs)).toBe(false);
    group.userData.previewMotifReady = true;
    group.userData.previewMotifSurface = 'headstone';
    expect(areDesignerMotifsReady(scene, motifs)).toBe(false);
    group.userData.previewMotifSurface = 'base';
    expect(areDesignerMotifsReady(scene, motifs)).toBe(true);
    expect(areDesignerMotifsReady(scene, [])).toBe(false);
  });
});

describe('preview images', () => {
  it('waits for the requested image texture and rejects stale or placeholder textures', () => {
    const scene = new Object3D();
    const images = [{ id: 'photo', imageUrl: '/new.png' }];
    expect(areDesignerImagesReady(scene, images)).toBe(false);
    const image = new Object3D();
    image.userData = {
      previewImageId: 'photo',
      previewImageUrl: '/old.png',
      previewImagePlaceholder: false,
    };
    scene.add(image);
    expect(areDesignerImagesReady(scene, images)).toBe(false);
    image.userData.previewImageUrl = '/new.png';
    image.userData.previewImagePlaceholder = true;
    expect(areDesignerImagesReady(scene, images)).toBe(false);
    image.userData.previewImagePlaceholder = false;
    expect(areDesignerImagesReady(scene, images)).toBe(true);
    expect(areDesignerImagesReady(scene, [])).toBe(false);
  });
});
