package away3d.primitives;

@:native("Engine3D.core.primitives.SphereGeometry")
extern class SphereGeometry extends PrimitiveBase {
	public var radius(get, set):Float;
	public var segmentsW(get, set):Int;
	public var segmentsH(get, set):Int;
	public var yUp(get, set):Bool;
	public function new(radius:Float = 50, segmentsW:Int = 16, segmentsH:Int = 12, yUp:Bool = true);
}