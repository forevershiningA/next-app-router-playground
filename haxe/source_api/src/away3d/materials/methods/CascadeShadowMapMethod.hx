package away3d.materials.methods;

import away3d.lights.shadowmaps.CascadeShadowMapper;
import away3d.cameras.Camera3D;

@:native("Engine3D.core.materials.methods.CascadeShadowMapMethod")
extern class CascadeShadowMapMethod extends ShadowMapMethodBase {
	public var baseMethod(get, set):SimpleShadowMapMethodBase;
	public function new(shadowMethodBase:SimpleShadowMapMethodBase);
}