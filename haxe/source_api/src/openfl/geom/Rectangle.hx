package openfl.geom;

/**
 * @author Przemysław Kapusta
 */
@:native("Engine3D.core.geom.Rectangle")
extern class Rectangle {
	
	public var bottom(get, set):Float;
	public var bottomRight(get, set):Point;
	public var height:Float;
	public var left(get, set):Float;
	public var right(get, set):Float;
	public var size(get, set):Point;
	public var top(get, set):Float;
	public var topLeft(get, set):Point;
	public var width:Float;
	public var x:Float;
	public var y:Float;
	public function new(x:Float = 0, y:Float = 0, width:Float = 0, height:Float = 0):Void;
	public function clone():Rectangle;
	public function contains(x:Float, y:Float):Bool;
	public function containsPoint(point:Point):Bool;
	public function containsRect(rect:Rectangle):Bool;
	public function copyFrom(sourceRect:Rectangle):Void;
	public function equals(toCompare:Rectangle):Bool;
	public function inflate(dx:Float, dy:Float):Void;
	public function inflatePoint(point:Point):Void;
	public function intersection(toIntersect:Rectangle):Rectangle;
	public function intersects(toIntersect:Rectangle):Bool;
	public function isEmpty():Bool;
	public function offset(dx:Float, dy:Float):Void;
	public function offsetPoint(point:Point):Void;
	public function setEmpty():Void;
	public function setTo(xa:Float, ya:Float, widtha:Float, heighta:Float):Void;
	public function toString():String;
	public function union(toUnion:Rectangle):Rectangle;
	
}