package away3d.materials;

import away3d.textures.Texture2DBase;
import away3d.textures.Anisotropy;

@:native("Engine3D.core.materials.TextureMaterial")
extern class TextureMaterial extends SinglePassMaterialBase {
	public var animateUVs(get, set):Bool;
	public var animateUVs2(get, set):Bool;
	public var alpha(get, set):Float;
	public var texture(get, set):Texture2DBase;
	public var ambientTexture(get, set):Texture2DBase;
	public function new(texture:Texture2DBase = null, smooth:Bool = true, repeat:Bool = false, mipmap:Bool = true, anisotropy:Anisotropy = ANISOTROPIC2X);
}