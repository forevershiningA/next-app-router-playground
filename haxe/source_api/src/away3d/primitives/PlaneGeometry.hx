package away3d.primitives;

@:native("Engine3D.core.primitives.PlaneGeometry")
extern class PlaneGeometry extends PrimitiveBase {
	public var segmentsW(get, set):Int;
	public var segmentsH(get, set):Int;
	public var yUp(get, set):Bool;
	public var doubleSided(get, set):Bool;
	public var width(get, set):Float;
	public var height(get, set):Float;
	public function new(width:Float = 100, height:Float = 100, segmentsW:Int = 1, segmentsH:Int = 1, yUp:Bool = true, doubleSided:Bool = false);
}