package away3d.cameras.lenses;

import openfl.events.EventDispatcher;
import openfl.geom.Matrix3D;
import openfl.geom.Vector3D;
import openfl.Vector;

@:native("Engine3D.core.cameras.lenses.LensBase")
extern class LensBase extends EventDispatcher {
	public var frustumCorners(get, set):Vector<Float>;
	public var matrix(get, set):Matrix3D;
	public var near(get, set):Float;
	public var far(get, set):Float;
	public var unprojectionMatrix(get, never):Any;
	public function new();
	public function project(point3d:Vector3D, v:Vector3D = null):Any;
	public function unproject(nX:Float, nY:Float, sZ:Float, v:Vector3D = null):Vector3D;
	public function clone():LensBase;
}