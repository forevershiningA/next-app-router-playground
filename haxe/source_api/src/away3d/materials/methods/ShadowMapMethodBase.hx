package away3d.materials.methods;

import away3d.library.assets.IAsset;
import away3d.lights.LightBase;
import away3d.lights.shadowmaps.ShadowMapperBase;

@:native("Engine3D.core.materials.methods.ShadowMapMethodBase")
extern class ShadowMapMethodBase extends ShadingMethodBase implements IAsset {
	public var assetType(get, never):String;
	public var alpha(get, set):Float;
	public var castingLight(get, never):LightBase;
	public var epsilon(get, set):Float;
	public function new(castingLight:LightBase);
}