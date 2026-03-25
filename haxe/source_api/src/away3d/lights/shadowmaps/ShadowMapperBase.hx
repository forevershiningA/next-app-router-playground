package away3d.lights.shadowmaps;

import away3d.lights.LightBase;
import away3d.textures.TextureProxyBase;
import away3d.cameras.Camera3D;
import away3d.containers.Scene3D;

@:native("Engine3D.core.lights.shadowmaps.ShadowMapperBase")
extern class ShadowMapperBase {
	public var autoUpdateShadows(get, set):Bool;
	public var light(get, set):LightBase;
	public var depthMap(get, never):TextureProxyBase;
	public var depthMapSize(get, set):Int;
	public function new();
	public function updateShadows():Void;
	public function dispose():Void;
}