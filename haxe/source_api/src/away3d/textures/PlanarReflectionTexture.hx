package away3d.textures;

import away3d.cameras.Camera3D;
import away3d.cameras.lenses.ObliqueNearPlaneLens;
import away3d.containers.View3D;

@:native("Engine3D.core.textures.PlanarReflectionTexture")
extern class PlanarReflectionTexture {
	public var plane(get, set):Any;
	public var renderer(get, set):Any;
	public var scale(get, set):Float;
	public var textureRatioX(get, never):Float;
	public var textureRatioY(get, never):Float;
	public function new();
	public function applyTransform(matrix:Any):Void;
	public function getTextureForStage3D(stage3DProxy:Any):Any;
	public function render(view:View3D):Void;
	public function dispose():Void;
}