package away3d.lights.shadowmaps;

import away3d.cameras.Camera3D;
import away3d.cameras.lenses.FreeMatrixLens;
import away3d.containers.Scene3D;

@:native("Engine3D.core.lights.shadowmaps.DirectionalShadowMapper")
extern class DirectionalShadowMapper extends ShadowMapperBase {
	public var snap(get, set):Float;
	public var lightOffset(get, set):Float;
	public function new();
}