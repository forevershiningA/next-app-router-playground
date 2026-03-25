package away3d.materials.methods;

import away3d.library.assets.NamedAssetBase;
import away3d.cameras.Camera3D;
import away3d.textures.TextureProxyBase;

@:native("Engine3D.core.materials.methods.ShadingMethodBase")
extern class ShadingMethodBase extends NamedAssetBase {
	public var sharedRegisters(get, set):Any;
	public var passes(get, never):Any;
	public function new();
	public function dispose():Void;
	public function copyFrom(method:ShadingMethodBase):Void;
	private function get_assetType():String;
}