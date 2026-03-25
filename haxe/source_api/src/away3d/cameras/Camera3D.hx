package away3d.cameras;

import away3d.entities.Entity;
import away3d.cameras.lenses.LensBase;

@:native("Engine3D.core.cameras.Camera3D")
extern class Camera3D extends Entity {
	public var frustumPlanes(get, never):Any;
	public var lens(get, set):LensBase;
	public var viewProjection(get, never):Any;
	public function new(lens:LensBase = null);
	public function unproject(nX:Float, nY:Float, sZ:Float, v:Any = null):Any;
	public function getRay(nX:Float, nY:Float, sZ:Float, v:Any = null):Any;
	public function project(point3d:Any, v:Any = null):Any;
}