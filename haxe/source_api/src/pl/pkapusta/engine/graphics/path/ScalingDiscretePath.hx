package pl.pkapusta.engine.graphics.path;

@:native("Engine3D.graphics.path.ScalingDiscretePath")
extern class ScalingDiscretePath extends DiscretePath {
	public function new(points:Array<DiscretePoint> = null, hasNormals:Bool = false, hasTangents:Bool = false, normalsDirection:Int = 0, closed:Bool = true);
	override public function clone(clonePoints:Bool = true):DiscretePath;
	override public function setPoints(points:Array<DiscretePoint>):Void;
	override public function invalidateBounds():Void;
	override public function computeNormals(direction:Int = 0, tangentsBasedOnNormals:Bool = true):Void;
	override public function getPointAt(index:Int):DiscretePoint;
	override public function getVector():Array<DiscretePoint>;
}