package openfl.display;

import openfl.geom.Matrix;
import openfl.geom.Point;
import openfl.geom.Rectangle;

/**
 * @author Przemysław Kapusta
 */
@:native("Engine3D.core.display.BitmapData")
extern class BitmapData implements IBitmapDrawable {
	
	public var height(default, null):Int;
	public var rect(default, null):Rectangle;
	public var transparent(default, null):Bool;
	public var width(default, null):Int;
	public function new(width:Int, height:Int, transparent:Bool = true, fillColor:UInt = 0xFFFFFFFF);
	public function applyFilter(sourceBitmapData:BitmapData, sourceRect:Rectangle, destPoint:Point, filter:Dynamic):Void;
	public function clone():BitmapData;
	public function colorTransform(rect:Rectangle, colorTransform:Dynamic):Void;
	public function copyChannel(sourceBitmapData:BitmapData, sourceRect:Rectangle, destPoint:Point, sourceChannel:Dynamic, destChannel:Dynamic):Void;
	public function copyPixels(sourceBitmapData:BitmapData, sourceRect:Rectangle, destPoint:Point, alphaBitmapData:BitmapData = null, alphaPoint:Point = null, mergeAlpha:Bool = false):Void;
	public function dispose():Void;
	public function draw(source:Dynamic, matrix:Matrix = null, colorTransform:Dynamic = null, blendMode:Dynamic = null, clipRect:Rectangle = null, smoothing:Bool = false):Void;
	public function drawWithQuality(source:Dynamic, matrix:Matrix = null, colorTransform:Dynamic = null, blendMode:Dynamic = null, clipRect:Rectangle = null, smoothing:Bool = false, quality:Dynamic = null):Void;
	public function encode(rect:Rectangle, compressor:Dynamic, byteArray:Dynamic/*ByteArray*/ = null):Dynamic/*ByteArray*/;
	public function fillRect(rect:Rectangle, color:Int):Void;
	public function floodFill(x:Int, y:Int, color:Int):Void;
	public static function fromCanvas(canvas:Dynamic/*CanvasElement*/, transparent:Bool = true):BitmapData;
	public static function fromImage(image:Dynamic/*Image*/, transparent:Bool = true):BitmapData;
	public static function fromTexture(texture:Dynamic/*TextureBase*/):BitmapData;
	public function generateFilterRect(sourceRect:Rectangle, filter:Dynamic/*BitmapFilter*/):Rectangle;
	public function getColorBoundsRect(mask:Int, color:Int, findColor:Bool = true):Rectangle;
	public function getPixel(x:Int, y:Int):Int;
	public function getPixel32(x:Int, y:Int):Int;
	public function getPixels(rect:Rectangle):Dynamic/*ByteArray*/;
	public function getVector(rect:Rectangle):Dynamic/*Vector<UInt>*/;
	public function histogram(hRect:Rectangle = null):Array<Array<Int>>;
	public function hitTest(firstPoint:Point, firstAlphaThreshold:Int, secondObject:Dynamic/*Object*/, secondBitmapDataPoint:Point = null, secondAlphaThreshold:Int = 1):Bool;
	public function lock():Void;
	public function merge(sourceBitmapData:BitmapData, sourceRect:Rectangle, destPoint:Point, redMultiplier:UInt, greenMultiplier:UInt, blueMultiplier:UInt, alphaMultiplier:UInt):Void;
	public function noise(randomSeed:Int, low:Int = 0, high:Int = 255, channelOptions:Int = 7, grayScale:Bool = false):Void;
	public function paletteMap(sourceBitmapData:BitmapData, sourceRect:Rectangle, destPoint:Point, redArray:Array<Int> = null, greenArray:Array<Int> = null, blueArray:Array<Int> = null, alphaArray:Array<Int> = null):Void;
	public function perlinNoise(baseX:Float, baseY:Float, numOctaves:UInt, randomSeed:Int, stitch:Bool, fractalNoise:Bool, channelOptions:UInt = 7, grayScale:Bool = false, offsets:Array<Point> = null):Void;
	public function setPixel(x:Int, y:Int, color:Int):Void;
	public function setPixel32(x:Int, y:Int, color:Int):Void;
	public function setPixels(rect:Rectangle, byteArray:Dynamic/*ByteArray*/):Void;
	public function setVector(rect:Rectangle, inputVector:Dynamic/*Vector<UInt>*/):Void;
	public function threshold(sourceBitmapData:BitmapData, sourceRect:Rectangle, destPoint:Point, operation:String, threshold:Int, color:Int = 0x00000000, mask:Int = 0xFFFFFFFF, copySource:Bool = false):Int;
	public function unlock(changeRect:Rectangle = null):Void;
	
}