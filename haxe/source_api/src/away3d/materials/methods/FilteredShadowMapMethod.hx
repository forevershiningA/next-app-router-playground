package away3d.materials.methods;

import away3d.lights.DirectionalLight;

@:native("Engine3D.core.materials.methods.FilteredShadowMapMethod")
extern class FilteredShadowMapMethod extends SimpleShadowMapMethodBase {
	public function new(castingLight:DirectionalLight);
}