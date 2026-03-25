package away3d.textures;

import openfl.display.BitmapData;

@:native("Engine3D.core.textures.BitmapTexture")
extern class BitmapTexture extends Texture2DBase {
	public function new(bitmapData:Any, generateMipmaps:Bool = true);
	public var bitmapData(get, set):BitmapData;
	override public function dispose():Void;
}