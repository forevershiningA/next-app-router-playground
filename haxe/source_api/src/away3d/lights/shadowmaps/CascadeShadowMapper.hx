package away3d.lights.shadowmaps;

import away3d.cameras.Camera3D;
import away3d.cameras.lenses.FreeMatrixLens;
import away3d.containers.Scene3D;

@:native("Engine3D.core.lights.shadowmaps.CascadeShadowMapper")
extern class CascadeShadowMapper extends DirectionalShadowMapper {
	public var numCascades(get, set):Int;
	public function new(numCascades:Int = 3);
	public function getSplitRatio(index:Int):Float;
	public function setSplitRatio(index:Int, value:Float):Void;
	public function getDepthProjections(partition:Int):Any;
	public function addEventListener(type:String, listener:Dynamic -> Void, useCapture:Bool = false, priority:Int = 0, useWeakReference:Bool = false):Void;
	public function removeEventListener(type:String, listener:Dynamic -> Void, useCapture:Bool = false):Void;
	public function dispatchEvent(event:Any):Bool;
	public function hasEventListener(type:String):Bool;
	public function willTrigger(type:String):Bool;
}