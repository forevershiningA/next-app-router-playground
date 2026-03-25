package openfl.display;

import openfl.geom.Matrix;
import openfl.geom.Point;
import openfl.geom.Rectangle;

@:native("Engine3D.core.display.DisplayObject")
extern class DisplayObject implements IBitmapDrawable {

	public var blendMode(get, set):Any/*BlendMode*/;
	public var cacheAsBitmap(get, set):Bool;
	public var cacheAsBitmapMatrix(get, set):Matrix;
	public var filters(get, set):Array<Any/*BitmapFilter*/>;
	public var height(get, set):Float;
	public var loaderInfo(get, never):Any/*LoaderInfo*/;
	public var mask(get, set):DisplayObject;
	public var mouseX(get, never):Float;
	public var mouseY(get, never):Float;
	public var name(get, set):String;
	public var opaqueBackground:Null<Int>;
	public var parent(default, null):Any/*DisplayObjectContainer*/;
	public var root(get, never):DisplayObject;
	public var rotation(get, set):Float;
	public var scale9Grid(get, set):Rectangle;
	public var scaleY(get, set):Float;
	public var scrollRect(get, set):Rectangle;
	public var stage(default, null):Any/*Stage*/;
	public var transform(get, set):Any/*Transform*/;
	public var visible(get, set):Bool;
	public var width(get, set):Float;
	public var x(get, set):Float;
	public var y(get, set):Float;
	public function addEventListener<T>(type:Dynamic/*EventType*/<T>, listener:T->Void, useCapture:Bool = false, priority:Int = 0,
			useWeakReference:Bool = false):Void;
	public function dispatchEvent(event:Any/*Event*/):Bool;
	public function getBounds(targetCoordinateSpace:DisplayObject):Rectangle;
	public function getRect(targetCoordinateSpace:DisplayObject):Rectangle;
	public function globalToLocal(pos:Point):Point;
	public function hitTestObject(obj:DisplayObject):Bool;
	public function hitTestPoint(x:Float, y:Float, shapeFlag:Bool = false):Bool;
	public function invalidate():Void;
	public function localToGlobal(point:Point):Point;
	public function removeEventListener<T>(type:Dynamic/*EventType*/<T> , listener:T->Void, useCapture:Bool = false):Void;
}