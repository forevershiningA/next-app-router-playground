package away3d.core.base;

import away3d.library.assets.NamedAssetBase;
import away3d.library.assets.IAsset;

@:native("Engine3D.core.core.base.Geometry")
extern class Geometry extends NamedAssetBase implements IAsset {
	public var assetType(get, never):String;
	public var subGeometries(get, never):Any;
	public function new();
	public function applyTransformation(transform:Any):Void;
	public function addSubGeometry(subGeometry:Any):Void;
	public function removeSubGeometry(subGeometry:Any):Void;
	public function clone():Geometry;
	public function scale(scale:Float):Void;
	public function dispose():Void;
	public function scaleUV(scaleU:Float = 1, scaleV:Float = 1):Void;
	public function convertToSeparateBuffers():Void;
	private function get_assetType():String;
}