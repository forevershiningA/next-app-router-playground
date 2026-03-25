package away3d.textures;

import away3d.library.assets.NamedAssetBase;
import away3d.library.assets.IAsset;

@:native("Engine3D.core.textures.TextureProxyBase")
extern class TextureProxyBase extends NamedAssetBase implements IAsset {
	public var hasMipMaps(get, never):Bool;
	public var format(get, never):Any;
	public var assetType(get, never):String;
	public var width(get, set):Int;
	public var height(get, set):Int;
	public function new();
	public function getTextureForStage3D(stage3DProxy:Any):Any;
	public function invalidateContent():Void;
	public function dispose():Void;
	private function get_assetType():String;
}