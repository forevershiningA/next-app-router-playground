package openfl.events;

@:native("Engine3D.core.events.Event")
extern class Event
{
	public static inline var ACTIVATE:String = "activate";
	public static inline var ADDED:String = "added";
	public static inline var ADDED_TO_STAGE:String = "addedToStage";
	public static inline var CANCEL:String = "cancel";
	public static inline var CHANGE:String = "change";
	public static inline var CLEAR:String = "clear";
	public static inline var CLOSE:String = "close";
	public static inline var COMPLETE:String = "complete";
	public static inline var CONNECT:String = "connect";
	public static inline var CONTEXT3D_CREATE:String = "context3DCreate";
	public static inline var COPY:String = "copy";
	public static inline var CUT:String = "cut";
	public static inline var DEACTIVATE:String = "deactivate";
	public static inline var ENTER_FRAME:String = "enterFrame";
	public static inline var EXIT_FRAME:String = "exitFrame";
	public static inline var FRAME_CONSTRUCTED:String = "frameConstructed";
	public static inline var FULLSCREEN:String = "fullScreen";
	public static inline var ID3:String = "id3";
	public static inline var INIT:String = "init";
	public static inline var MOUSE_LEAVE:String = "mouseLeave";
	public static inline var OPEN:String = "open";
	public static inline var PASTE:String = "paste";
	public static inline var REMOVED:String = "removed";
	public static inline var REMOVED_FROM_STAGE:String = "removedFromStage";
	public static inline var RENDER:String = "render";
	public static inline var RESIZE:String = "resize";
	public static inline var SCROLL:String = "scroll";
	public static inline var SELECT:String = "select";
	public static inline var SELECT_ALL:String = "selectAll";
	public static inline var SOUND_COMPLETE:String = "soundComplete";
	public static inline var TAB_CHILDREN_CHANGE:String = "tabChildrenChange";
	public static inline var TAB_ENABLED_CHANGE:String = "tabEnabledChange";
	public static inline var TAB_INDEX_CHANGE:String = "tabIndexChange";
	public static inline var TEXTURE_READY:String = "textureReady";
	public static inline var UNLOAD:String = "unload";
	public var bubbles(default, null):Bool;
	public var cancelable(default, null):Bool;
	public var currentTarget(default, null):Any;
	public var eventPhase(default, null):Any;
	public var target(default, null):Any;
	public var type(default, null):String;
	public function new(type:String, bubbles:Bool = false, cancelable:Bool = false);
	public function clone():Event;
	public function formatToString(className:String, p1:String = null, p2:String = null, p3:String = null, p4:String = null, p5:String = null):String;
	public function isDefaultPrevented():Bool;
	public function preventDefault():Void;
	public function stopImmediatePropagation():Void;
	public function stopPropagation():Void;
	public function toString():String;
}