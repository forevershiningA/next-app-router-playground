package away3d.materials;

@:native("Engine3D.core.materials.ColorMaterial")
extern class ColorMaterial extends SinglePassMaterialBase {
	public var alpha(get, set):Float;
	public var color(get, set):Int;
	public function new(color:Int = 0xcccccc, alpha:Float = 1);
}