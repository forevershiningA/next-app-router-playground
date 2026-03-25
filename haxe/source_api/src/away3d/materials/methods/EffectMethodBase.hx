package away3d.materials.methods;

import away3d.library.assets.IAsset;

@:native("Engine3D.core.materials.methods.EffectMethodBase")
extern class EffectMethodBase extends ShadingMethodBase implements IAsset {
	public var assetType(get, never):String;
	public function new();
}