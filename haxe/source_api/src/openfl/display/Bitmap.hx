package openfl.display;

@:native("Engine3D.core.display.Bitmap")
extern class Bitmap
{
	
	public var bitmapData(get, set):BitmapData;
	public var pixelSnapping:Any/*PixelSnapping*/;
	public var smoothing:Bool;
	public function new(bitmapData:BitmapData = null, pixelSnapping:Any/*PixelSnapping*/ = null, smoothing:Bool = false);
}