package pl.pkapusta.engine.graphics.path;

@:native("Engine3D.graphics.path.HeadScalingDiscretePath")
extern class HeadScalingDiscretePath extends ScalingDiscretePath {
	public var headLimit(get, set):Float;
	public function new(points:Array<DiscretePoint>, headLimit:Float, hasNormals:Bool = false, hasTangents:Bool = false, normalsDirection:Int = 0, closed:Bool = true);
	override public function clone(clonePoints:Bool = true):DiscretePath;
}