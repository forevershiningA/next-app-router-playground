package away3d.cameras.lenses;

import openfl.geom.Vector3D;

@:native("Engine3D.core.cameras.lenses.OrthographicOffCenterLens")
extern class OrthographicOffCenterLens extends LensBase {
	public var minX(get, set):Float;
	public var maxX(get, set):Float;
	public var minY(get, set):Float;
	public var maxY(get, set):Float;
	public function new(minX:Float, maxX:Float, minY:Float, maxY:Float);
	override public function unproject(nX:Float, nY:Float, sZ:Float, v:Vector3D = null):Vector3D;
	override public function clone():LensBase;
}