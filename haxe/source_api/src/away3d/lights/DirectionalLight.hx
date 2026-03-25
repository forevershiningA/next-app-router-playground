package away3d.lights;

import away3d.lights.shadowmaps.ShadowMapperBase;
import away3d.cameras.Camera3D;

@:native("Engine3D.core.lights.DirectionalLight")
extern class DirectionalLight extends LightBase {
	public var sceneDirection(get, never):Any;
	public var direction(get, set):Any;
	public function new(xDir:Float = 0, yDir:Float = -1, zDir:Float = 1);
}