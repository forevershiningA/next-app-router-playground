package away3d.containers;

import away3d.cameras.Camera3D;
import away3d.textures.Texture2DBase;

@:native("Engine3D.core.containers.View3D")
extern class View3D {
	public var depthPrepass(get, set):Bool;
	public function new(scene:Scene3D = null, camera:Camera3D = null, renderer:Any = null, forceSoftware:Bool = false, profile:String = "baseline", contextIndex:Int = -1);
	public var stage3DProxy(get, set):Any;
	public var forceMouseMove(get, set):Bool;
	public var background(get, set):Texture2DBase;
	public var layeredView(get, set):Bool;
	public var filters3d(get, set):Array<Any>;
	public var renderer(get, set):Any;
	public var backgroundColor(get, set):Any;
	public var backgroundAlpha(get, set):Float;
	public var camera(get, set):Camera3D;
	public var scene(get, set):Scene3D;
	public var deltaTime(get, null):Any;
	public var antiAlias(get, set):Any;
	public var renderedFacesCount(get, null):Any;
	public var shareContext(get, set):Bool;
	public function render():Void;
	public function dispose():Void;
	public function project(point3d:Any):Any;
	public function unproject(sX:Float, sY:Float, sZ:Float, v:Any = null):Any;
	public function getRay(sX:Float, sY:Float, sZ:Float):Any;
	public var mousePicker(get, set):Any;
	public var touchPicker(get, set):Any;
}