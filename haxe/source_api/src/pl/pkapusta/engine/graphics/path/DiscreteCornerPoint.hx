package pl.pkapusta.engine.graphics.path;

import openfl.geom.Point;

@:native("Engine3D.graphics.path.DiscreteCornerPoint")
extern class DiscreteCornerPoint extends DiscretePoint {
	public var secondNormalAngle(get, set):Null<Float>;
	public var secondTangentAngle(get, set):Null<Float>;
	public static function fromPoint(pt:Point):DiscreteCornerPoint;
	public function new(x:Float, y:Float, normalAngle:Null<Float> = null, tangentAngle:Null<Float> = null, secondNormalAngle:Null<Float> = null, secondTangentAngle:Null<Float> = null);
	override public function clone():Point;
	override public function toString():String;
}