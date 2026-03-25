package pl.pkapusta.engine.graphics.path;

import openfl.geom.Rectangle;

@:native("Engine3D.graphics.path.NineScalingDiscretePath")
extern class NineScalingDiscretePath extends ScalingDiscretePath {
	public var nineScalingBounds(get, set):Rectangle;
	public function new(points:Array<DiscretePoint>, nineScalingBounds:Any, hasNormals:Bool = false, hasTangents:Bool = false, normalsDirection:Int = 0, closed:Bool = true);
	override public function clone(clonePoints:Bool = true):DiscretePath;
}