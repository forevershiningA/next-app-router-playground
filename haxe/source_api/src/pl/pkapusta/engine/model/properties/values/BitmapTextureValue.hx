package pl.pkapusta.engine.model.properties.values;

import pl.pkapusta.engine.model.properties.values.interfaces.ITextureValue;
import openfl.display.BitmapData;

@:keep
@:native("Engine3D.values.BitmapTextureValue")
extern class BitmapTextureValue extends TextureValue implements ITextureValue {
	public var texture(get, set):BitmapData;
	public function new(texture:BitmapData, surfaceCoatingScale:Float);
}