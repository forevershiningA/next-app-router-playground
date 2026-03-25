package pl.pkapusta.engine.view.graphics3d.algorithms;

import pl.pkapusta.engine.graphics.path.DiscretePoint;

@:native("Engine3D.view.graphics3d.algorithms.Triangulator")
extern class Triangulator {
	public static function process(contour:Array<DiscretePoint>):Array<Int>;
	public function new();
}