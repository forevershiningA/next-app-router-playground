package pl.pkapusta.engine.model.executors.file.events;

import openfl.events.Event;

@:native("Engine3D.model.executors.file.events.RegionPositionEvent")
extern class RegionPositionEvent extends Event {
	public static inline var UPDATE_ROTATION : String = "update.rotation";
    public static inline var UPDATE_ROTATION_BY_INCREASE : String = "update.rotation.by.increase";
	public var value(get, never):Dynamic;
	public function new(type:String, value:Dynamic, bubbles:Bool = false, cancelable:Bool = false);
	public override function clone():Event;
	public override function toString():String;
}