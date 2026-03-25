package openfl.geom;

import openfl.Vector;

@:native("Engine3D.core.geom.Matrix3D")
extern class Matrix3D {

	public var determinant(get, never):Float;
	public var position(get, set):Vector3D;
	public var rawData:Vector<Float>;
	public function new(v:Vector<Float> = null);
	public function append(lhs:Matrix3D):Void;
	public function appendRotation(degrees:Float, axis:Vector3D, pivotPoint:Vector3D = null):Void;
	public function appendScale(xScale:Float, yScale:Float, zScale:Float):Void;
	public function appendTranslation(x:Float, y:Float, z:Float):Void;
	public function clone():Matrix3D;
	public function copyColumnFrom(column:Int, vector3D:Vector3D):Void;
	public function copyColumnTo(column:Int, vector3D:Vector3D):Void;
	public function copyFrom(other:Matrix3D):Void;
	public function copyRawDataFrom(vector:Vector<Float>, index:UInt = 0, transpose:Bool = false):Void;
	public function copyRawDataTo(vector:Vector<Float>, index:UInt = 0, transpose:Bool = false):Void;
	public function copyRowFrom(row:UInt, vector3D:Vector3D):Void;
	public function copyRowTo(row:Int, vector3D:Vector3D):Void;
	public function copyToMatrix3D(other:Matrix3D):Void;
	public function decompose(orientationStyle:Orientation3D = EULER_ANGLES):Vector<Vector3D>;
	public function deltaTransformVector(v:Vector3D):Vector3D;
	public function identity():Void;
	public static function interpolate(thisMat:Matrix3D, toMat:Matrix3D, percent:Float):Matrix3D;
	public function interpolateTo(toMat:Matrix3D, percent:Float):Void;
	public function invert():Bool;
	public function pointAt(pos:Vector3D, at:Vector3D = null, up:Vector3D = null):Void;
	public function prepend(rhs:Matrix3D):Void;
	public function prependRotation(degrees:Float, axis:Vector3D, pivotPoint:Vector3D = null):Void;
	public function prependScale(xScale:Float, yScale:Float, zScale:Float):Void;
	public function prependTranslation(x:Float, y:Float, z:Float):Void;
	public function recompose(components:Vector<Vector3D>, orientationStyle:Orientation3D = EULER_ANGLES):Bool;
	public function transformVector(v:Vector3D):Vector3D;
	public function transformVectors(vin:Vector<Float>, vout:Vector<Float>):Void;
	public function transpose():Void;
	
}
