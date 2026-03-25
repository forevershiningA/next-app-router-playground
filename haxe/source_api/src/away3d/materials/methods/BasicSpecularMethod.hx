package away3d.materials.methods;

import away3d.textures.Texture2DBase;

@:native("Engine3D.core.materials.methods.BasicSpecularMethod")
extern class BasicSpecularMethod {
	public var gloss(get, set):Float;
	public var specular(get, set):Float;
	public var specularColor(get, set):Int;
	public var texture(get, set):Texture2DBase;
	public function new();
	public function copyFrom(method:ShadingMethodBase):Void;
}