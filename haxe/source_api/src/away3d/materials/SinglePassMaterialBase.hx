package away3d.materials;

import away3d.materials.methods.ShadowMapMethodBase;
import away3d.materials.methods.BasicSpecularMethod;
import away3d.textures.Texture2DBase;
import away3d.cameras.Camera3D;
import away3d.materials.methods.EffectMethodBase;
import away3d.materials.lightpickers.LightPickerBase;

@:native("Engine3D.core.materials.SinglePassMaterialBase")
extern class SinglePassMaterialBase extends MaterialBase {
	public var enableLightFallOff(get, set):Bool;
	public var alphaThreshold(get, set):Float;
	public var specularLightSources(get, set):Int;
	public var diffuseLightSources(get, set):Int;
	public var colorTransform(get, set):Any;
	public var ambientMethod(get, set):Any;
	public var shadowMethod(get, set):ShadowMapMethodBase;
	public var diffuseMethod(get, set):Any;
	public var normalMethod(get, set):Any;
	public var specularMethod(get, set):BasicSpecularMethod;
	public var numMethods(get, never):Int;
	public var normalMap(get, set):Texture2DBase;
	public var specularMap(get, set):Texture2DBase;
	public var gloss(get, set):Float;
	public var ambient(get, set):Float;
	public var specular(get, set):Float;
	public var ambientColor(get, set):Int;
	public var specularColor(get, set):Int;
	public var alphaBlending(get, set):Bool;
	public function new();
	public function addMethod(method:EffectMethodBase):Void;
	public function hasMethod(method:EffectMethodBase):Bool;
	public function getMethodAt(index:Int):EffectMethodBase;
	public function addMethodAt(method:EffectMethodBase, index:Int):Void;
	public function removeMethod(method:EffectMethodBase):Void;
}