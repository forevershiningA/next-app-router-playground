package away3d.materials.methods;

import away3d.textures.Texture2DBase;

@:native("Engine3D.core.materials.methods.CompositeSpecularMethod")
extern class CompositeSpecularMethod extends BasicSpecularMethod {
	public var baseMethod(get, set):BasicSpecularMethod;
	public function new(modulateMethod:Dynamic, baseSpecularMethod:BasicSpecularMethod = null);
	public function dispose():Void;
}