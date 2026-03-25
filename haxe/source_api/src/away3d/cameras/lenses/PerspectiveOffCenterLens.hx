package away3d.cameras.lenses;

import openfl.geom.Vector3D;

@:native("Engine3D.core.cameras.lenses.PerspectiveOffCenterLens")
extern class PerspectiveOffCenterLens extends LensBase {
	public var minAngleX(get, set):Float;
	public var maxAngleX(get, set):Float;
	public var minAngleY(get, set):Float;
	public var maxAngleY(get, set):Float;
	public function new(minAngleX:Float = -40, maxAngleX:Float = 40, minAngleY:Float = -40, maxAngleY:Float = 40);
	override public function unproject(nX:Float, nY:Float, sZ:Float, v:Vector3D = null):Vector3D;
	override public function clone():LensBase;
}