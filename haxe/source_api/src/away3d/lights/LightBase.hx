package away3d.lights;

import away3d.entities.Entity;
import away3d.lights.shadowmaps.ShadowMapperBase;
import away3d.cameras.Camera3D;

@:native("Engine3D.core.lights.LightBase")
extern class LightBase extends Entity {
	public var castsShadows(get, set):Bool;
	public var specular(get, set):Float;
	public var diffuse(get, set):Float;
	public var color(get, set):Int;
	public var ambient(get, set):Float;
	public var ambientColor(get, set):Int;
	public var shadowMapper(get, set):ShadowMapperBase;
	public var _castsShadows:Bool;
	public var _shadowMapper:ShadowMapperBase;
	public function new();
}