package away3d.primitives;

import away3d.core.base.Geometry;

@:native("Engine3D.core.primitives.PrimitiveBase")
extern class PrimitiveBase extends Geometry {
	public function new();
	override public function clone():Geometry;
	override public function scale(scale:Float):Void;
	override public function scaleUV(scaleU:Float = 1, scaleV:Float = 1):Void;
	override public function applyTransformation(transform:Any):Void;
}