package pl.pkapusta.engine.model.properties.values;

import pl.pkapusta.engine.model.properties.values.interfaces.IDisplayObjectValue;
import openfl.display.DisplayObject;

@:keep
@:native("Engine3D.values.DisplayObjectValue")
extern class DisplayObjectValue implements IDisplayObjectValue {
	public var uniqueId(get, set):String;
	public var display(get, set):DisplayObject;
	public var bytes(get, set):Any;
	public function new(display:Any, bytes:Any = null);
	private function get_bytes():Any;
	private function set_bytes(value: Any):Any;
	private function get_display():DisplayObject;
	private function set_display(value: DisplayObject):DisplayObject;
	public function getExtraData():Any;
	public function getEmbedType():String;
	public function setEmbedType(value:String):String;
	public function getDefaultEmbed():Bool;
	public function setDefaultEmbed(value:Bool):Bool;
}