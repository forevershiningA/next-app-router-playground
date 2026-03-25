package openfl.events;

@:native("Engine3D.core.events.EventDispatcher")
extern class EventDispatcher
{
	public function new(target:Any/*IEventDispatcher*/ = null):Void;
	public function addEventListener<T>(type:String, listener:T->Void, useCapture:Bool = false, priority:Int = 0, useWeakReference:Bool = false):Void;
	public function dispatchEvent(event:Event):Bool;
	public function hasEventListener(type:String):Bool;
	public function removeEventListener<T>(type:String, listener:T->Void, useCapture:Bool = false):Void;
	public function toString():String;
	public function willTrigger(type:String):Bool;
}