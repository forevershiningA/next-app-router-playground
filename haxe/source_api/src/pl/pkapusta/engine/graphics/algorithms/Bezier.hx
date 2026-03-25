package pl.pkapusta.engine.graphics.algorithms;

import pl.pkapusta.engine.graphics.path.DiscretePoint;
import openfl.geom.Point;

@:native("Engine3D.graphics.algorithms.Bezier")
extern class Bezier {
	public static function toDiscretePoints(controlPoints:Array<Point>, addToVector:Array<DiscretePoint>, divisionCount:Int = 20):Void;
	public function new();
}