package away3d.textures;

import away3d.cameras.Camera3D;
import away3d.cameras.lenses.PerspectiveLens;
import away3d.containers.View3D;
import away3d.containers.Scene3D;

@:native("Engine3D.core.textures.CubeReflectionTexture")
extern class CubeReflectionTexture extends RenderCubeTexture {
	public var position(get, set):Any;
	public var nearPlaneDistance(get, set):Float;
	public var farPlaneDistance(get, set):Float;
	public var renderer(get, set):Any;
	public function new(size:Int);
	override public function getTextureForStage3D(stage3DProxy:Any):Any;
	public function render(view:View3D):Void;
	override public function dispose():Void;
}