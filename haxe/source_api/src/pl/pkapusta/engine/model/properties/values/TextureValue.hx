package pl.pkapusta.engine.model.properties.values;

import pl.pkapusta.engine.model.properties.values.interfaces.ITextureValue;

@:native("Engine3D.values.TextureValue")
extern class TextureValue implements ITextureValue {
	public var uniqueId(get, set):String;
	public var surfaceCoatingScale(get, never):Float;
	public var textureType(get, never):String;
	public function new(surfaceCoatingScale:Float);
	public function getExtraData():Any;
	public function getEmbedType():String;
	public function setEmbedType(value:String):String;
	public function getDefaultEmbed():Bool;
	public function setDefaultEmbed(value:Bool):Bool;
	private function get_surfaceCoatingScale() : Float;
	private function get_textureType() : String;
}