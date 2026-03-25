package pl.pkapusta.engine.graphics.algorithms;

import pl.pkapusta.engine.graphics.path.DiscretePath;

@:native("Engine3D.graphics.algorithms.DiscretePathOffset")
extern class DiscretePathOffset {
	public static function basicOffset(path:DiscretePath, offset:Float):Array<Float>;
	public function new();
}