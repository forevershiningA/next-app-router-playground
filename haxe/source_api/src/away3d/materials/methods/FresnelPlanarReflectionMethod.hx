package away3d.materials.methods;

import away3d.textures.PlanarReflectionTexture;

@:native("Engine3D.core.materials.methods.FresnelPlanarReflectionMethod")
extern class FresnelPlanarReflectionMethod extends EffectMethodBase {
	public var alpha(get, set):Float;
	public var fresnelPower(get, set):Float;
	public var normalReflectance(get, set):Float;
	public var texture(get, set):PlanarReflectionTexture;
	public var normalDisplacement(get, set):Float;
	public function new(texture:PlanarReflectionTexture, alpha:Float = 1);
}