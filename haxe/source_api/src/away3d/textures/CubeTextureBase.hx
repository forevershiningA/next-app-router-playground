package away3d.textures;

@:native("Engine3D.core.textures.CubeTextureBase")
extern class CubeTextureBase extends TextureProxyBase {
	public var size(get, never):Int;
	public function new();
}