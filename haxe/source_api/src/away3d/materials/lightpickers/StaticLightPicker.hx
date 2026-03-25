package away3d.materials.lightpickers;

import away3d.lights.LightBase;
import away3d.lights.DirectionalLight;

@:native("Engine3D.core.materials.lightpickers.StaticLightPicker")
extern class StaticLightPicker extends LightPickerBase {
	public var lights(get, set):Array<LightBase>;
	public function new(lights:Array<LightBase>);
}