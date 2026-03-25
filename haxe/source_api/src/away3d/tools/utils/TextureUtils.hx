package away3d.tools.utils;

@:native("Engine3D.core.tools.utils.TextureUtils")
extern class TextureUtils {
	public static function isBitmapDataValid(bitmapData:Any):Bool;
	public static function isDimensionValid(d:Int):Bool;
	public static function isPowerOfTwo(value:Int):Bool;
	public static function getBestPowerOf2(value:Int):Int;
}