package away3d.materials.lightpickers;

import away3d.library.assets.NamedAssetBase;
import away3d.library.assets.IAsset;
import away3d.lights.DirectionalLight;
import away3d.lights.LightBase;

@:native("Engine3D.core.materials.lightpickers.LightPickerBase")
extern class LightPickerBase extends NamedAssetBase implements IAsset {
	public var assetType(get, never):String;
	public var numDirectionalLights(get, never):Int;
	public var numPointLights(get, never):Int;
	public var numCastingDirectionalLights(get, never):Int;
	public var numCastingPointLights(get, never):Int;
	public var numLightProbes(get, never):Int;
	public var pointLights(get, never):Any;
	public var directionalLights(get, never):Any;
	public var castingPointLights(get, never):Any;
	public var castingDirectionalLights(get, never):Any;
	public var lightProbes(get, never):Any;
	public var lightProbeWeights(get, never):Any;
	public var allPickedLights(get, never):Any;
	public function new();
	public function dispose():Void;
	public function collectLights(renderable:Any, entityCollector:Any):Void;
	private function get_assetType():String;
}