package pl.pkapusta.engine.graphics.path;

import openfl.geom.Point;

@:native("Engine3D.graphics.path.DiscretePoint")
extern class DiscretePoint extends Point {
	public var normalAngle(get, set):Null<Float>;
	public var tangentAngle(get, set):Null<Float>;
	public static function fromPoint(pt:Point):DiscretePoint;
	public function new(x:Float, y:Float, normalAngle:Null<Float> = null, tangentAngle:Null<Float> = null);
	public override function clone():Point;
	public override function toString():String;
}