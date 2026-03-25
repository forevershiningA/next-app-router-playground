package away3d.materials.methods;

import away3d.textures.Texture2DBase;
import away3d.textures.CubeTextureBase;

@:native("Engine3D.core.materials.methods.FresnelEnvMapMethod")
extern class FresnelEnvMapMethod extends EffectMethodBase {
	public var mask(get, set):Texture2DBase;
	public var fresnelPower(get, set):Float;
	public var envMap(get, set):CubeTextureBase;
	public var alpha(get, set):Float;
	public var normalReflectance(get, set):Float;
	public function new(envMap:CubeTextureBase, alpha:Float = 1);
	override public function dispose():Void;
}