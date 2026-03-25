package away3d.core.base;

import away3d.library.assets.NamedAssetBase;

import openfl.geom.Matrix3D;
import openfl.geom.Vector3D;

@:native("Engine3D.core.core.base.Object3D")
extern class Object3D extends NamedAssetBase {
	public var x(get, set):Float;
	public var y(get, set):Float;
	public var z(get, set):Float;
	public var rotationX(get, set):Float;
	public var rotationY(get, set):Float;
	public var rotationZ(get, set):Float;
	public var scaleX(get, set):Float;
	public var scaleY(get, set):Float;
	public var scaleZ(get, set):Float;
	public var eulers(get, set):Vector3D;
	public var transform(get, set):Matrix3D;
	public var pivotPoint(get, set):Vector3D;
	public var position(get, set):Vector3D;
	public var forwardVector(get, never):Vector3D;
	public var rightVector(get, never):Vector3D;
	public var upVector(get, never):Vector3D;
	public var backVector(get, never):Vector3D;
	public var leftVector(get, never):Vector3D;
	public var downVector(get, never):Vector3D;
	public var zOffset(get, set):Int;
	public function addEventListener(type:String, listener:Dynamic -> Void, useCapture:Bool = false, priority:Int = 0, useWeakReference:Bool = false):Void;
	public function removeEventListener(type:String, listener:Dynamic -> Void, useCapture:Bool = false):Void;
	public var extra:Dynamic;
	public function getPosition(v:Any = null):Any;
	public function new();
	public function scale(value:Float):Void;
	public function moveForward(distance:Float):Void;
	public function moveBackward(distance:Float):Void;
	public function moveLeft(distance:Float):Void;
	public function moveRight(distance:Float):Void;
	public function moveUp(distance:Float):Void;
	public function moveDown(distance:Float):Void;
	public function moveTo(dx:Float, dy:Float, dz:Float):Void;
	public function movePivot(dx:Float, dy:Float, dz:Float):Void;
	public function translate(axis:Vector3D, distance:Float):Void;
	public function translateLocal(axis:Vector3D, distance:Float):Void;
	public function pitch(angle:Float):Void;
	public function yaw(angle:Float):Void;
	public function roll(angle:Float):Void;
	public function clone():Object3D;
	public function rotateTo(ax:Float, ay:Float, az:Float):Void;
	public function rotate(axis:Vector3D, angle:Float):Void;
	public function lookAt(target:Vector3D, upAxis:Vector3D = null):Void;
	public function dispose():Void;
	public function disposeAsset():Void;
	private function get_assetType():String;
}