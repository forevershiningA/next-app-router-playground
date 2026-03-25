package away3d.materials;

import away3d.library.assets.NamedAssetBase;
import away3d.library.assets.IAsset;
import away3d.materials.lightpickers.LightPickerBase;
import away3d.cameras.Camera3D;

@:native("Engine3D.core.materials.MaterialBase")
extern class MaterialBase extends NamedAssetBase implements IAsset {
	public var assetType(get, never):String;
	public var lightPicker(get, set):LightPickerBase;
	public var mipmap(get, set):Bool;
	public var smooth(get, set):Bool;
	public var depthCompareMode(get, set):Any;
	public var repeat(get, set):Bool;
	public var anisotropy(get, set):Any;
	public var bothSides(get, set):Bool;
	public var blendMode(get, set):Any;
	public var alphaPremultiplied(get, set):Bool;
	public var requiresBlending(get, never):Bool;
	public var uniqueId(get, never):Int;
	public var extra:Dynamic;
	public function new();
	public function dispose():Void;
	private function get_assetType():String;
}