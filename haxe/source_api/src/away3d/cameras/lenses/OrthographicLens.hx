package away3d.cameras.lenses;

import openfl.geom.Vector3D;

@:native("Engine3D.core.cameras.lenses.OrthographicLens")
extern class OrthographicLens extends LensBase {
	public var projectionHeight(get, set):Float;
	public function new(projectionHeight:Float = 500);
	override public function unproject(nX:Float, nY:Float, sZ:Float, v:Vector3D = null):Vector3D;
	override public function clone():LensBase;
}