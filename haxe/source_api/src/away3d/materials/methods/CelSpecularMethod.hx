package away3d.materials.methods;

@:native("Engine3D.core.materials.methods.CelSpecularMethod")
extern class CelSpecularMethod extends CompositeSpecularMethod {
	public var smoothness(get, set):Float;
	public var specularCutOff(get, set):Float;
	public function new(specularCutOff:Float = .5, baseSpecularMethod:BasicSpecularMethod = null);
}