package pl.pkapusta.engine.model.properties.values;

import pl.pkapusta.engine.model.properties.values.interfaces.IByteArrayValue;

@:native("Engine3D.values.ByteArrayValue")
extern class ByteArrayValue implements IByteArrayValue {
	public var uniqueId(get, set):String;
	public var data(get, set):Any;
	public function new(data:Any);
	public function getExtraData():Any;
	public function getEmbedType():String;
	public function setEmbedType(value:String):String;
	public function getDefaultEmbed():Bool;
	public function setDefaultEmbed(value:Bool):Bool;
}