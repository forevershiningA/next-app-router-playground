package pl.pkapusta.engine.model.executors.utils.properties;

import openfl.geom.Rectangle;

@:keep
@:native("Engine3D.model.executors.utils.properties.ColorTextureProperty")
extern class ColorTextureProperty implements IM3DProperty {
	public var propertyId(get, never):String;
	public var material(get, never):Any;
	public var textureValue(get, never):Dynamic;
	public var optimumUVMap(get, never):Rectangle;
	public function new(propertyId:String = "color", defaultFillColor : UInt = 0x00000000);
	public function dispose():Void;
	public function change(data:Dynamic):Bool;
	private function get_propertyId():String;
}