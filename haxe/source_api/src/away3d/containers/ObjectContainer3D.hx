package away3d.containers;

import away3d.core.base.Object3D;
import openfl.events.Event;
import openfl.geom.Matrix3D;
import openfl.geom.Vector3D;
import openfl.Vector;
import away3d.library.assets.IAsset;

@:native("Engine3D.core.containers.ObjectContainer3D")
extern class ObjectContainer3D extends Object3D implements IAsset {
	public var ignoreTransform(get, set):Bool;
	public var mouseEnabled(get, set):Bool;
	public var mouseChildren(get, set):Bool;
	public var visible(get, set):Bool;
	public var assetType(get, never):String;
	public var scenePosition(get, never):Vector3D;
	public var minX(get, never):Float;
	public var minY(get, never):Float;
	public var minZ(get, never):Float;
	public var maxX(get, never):Float;
	public var maxY(get, never):Float;
	public var maxZ(get, never):Float;
	public var partition(get, set):Any;
	public var sceneTransform(get, never):Matrix3D;
	public var scene(get, set):Scene3D;
	public var inverseSceneTransform(get, never):Matrix3D;
	public var parent(get, never):ObjectContainer3D;
	public var numChildren(get, never):Int;
	public function new();
	public function contains(child:ObjectContainer3D):Bool;
	public function addChild(child:ObjectContainer3D):ObjectContainer3D;
	public function addChildren(childarray:Vector<ObjectContainer3D>):Void;
	public function removeChild(child:ObjectContainer3D):Void;
	public function removeChildAt(index:Int):Void;
	public function getChildAt(index:Int):ObjectContainer3D;
	override public function lookAt(target:Vector3D, upAxis:Vector3D = null):Void;
	override public function translateLocal(axis:Vector3D, distance:Float):Void;
	override public function dispose():Void;
	public function disposeWithChildren():Void;
	override public function clone():Object3D;
	override public function rotate(axis:Vector3D, angle:Float):Void;
	public function dispatchEvent(event:Event):Bool;
	public function updateImplicitVisibility():Void;
	override public function addEventListener(type:String, listener:Dynamic -> Void, useCapture:Bool = false, priority:Int = 0, useWeakReference:Bool = false):Void;
	override public function removeEventListener(type:String, listener:Dynamic -> Void, useCapture:Bool = false):Void;
}