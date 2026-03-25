package away3d.materials;

@:native("Engine3D.core.materials.ColorMultiPassMaterial")
extern class ColorMultiPassMaterial extends MultiPassMaterialBase {
	public var color(get, set):Int;
	public function new(color:Int = 0xcccccc);
}