package away3d.materials.methods;

import away3d.lights.LightBase;
import away3d.cameras.Camera3D;

@:native("Engine3D.core.materials.methods.SimpleShadowMapMethodBase")
extern class SimpleShadowMapMethodBase extends ShadowMapMethodBase {
	public function new(castingLight:LightBase);
}