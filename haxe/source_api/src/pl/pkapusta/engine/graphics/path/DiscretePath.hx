package pl.pkapusta.engine.graphics.path;

import openfl.geom.Point;
import openfl.geom.Rectangle;

@:native("Engine3D.graphics.path.DiscretePath")
extern class DiscretePath {
	public var length(get, never):Int;
	public var hasNormals(get, never):Bool;
	public var hasTangents(get, never):Bool;
	public var normalsDirection(get, never):Int;
	public var closed(get, never):Bool;
	public var bounds(get, never):Rectangle;
	public var width(get, dynamic):Float;
	public var height(get, dynamic):Float;
	public static function fromNumberVector(vector:Array<Float>, hasNormals:Bool = false, hasTangents:Bool = false, normalsDirection:Int = 0, closed:Bool = true):DiscretePath;
	public function new(points:Array<DiscretePoint> = null, hasNormals:Bool = false, hasTangents:Bool = false, normalsDirection:Int = 0, closed:Bool = true);
	public function clone(clonePoints:Bool = true):DiscretePath;
	public function setPoints(points:Array<DiscretePoint>):Void;
	public function addInnerPath(path:DiscretePath):Void;
	public function getInnerPaths():Array<DiscretePath>;
	public function invalidate():Void;
	public function invalidateNormals():Void;
	public function invalidateBounds():Void;
	public function computeNormals(direction:Int = 0, tangentsBasedOnNormals:Bool = true):Void;
	public function toString():String;
	public function getPointAt(index:Int):DiscretePoint;
	public function getVector():Array<DiscretePoint>;
}