package away3d.cameras.lenses;

import openfl.geom.Vector3D;

@:native("Engine3D.core.cameras.lenses.PerspectiveLens")
extern class PerspectiveLens extends LensBase {
	public var coordinateSystem(get, set):Int;
	public var fieldOfView(get, set):Float;
	public var focalLength(get, set):Float;
	public function new(fieldOfView:Float = 60, coordinateSystem:Int = 0);
	override public function unproject(nX:Float, nY:Float, sZ:Float, v:Vector3D = null):Vector3D;
	override public function clone():LensBase;
}