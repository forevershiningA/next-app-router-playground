package pl.pkapusta.engine.globals;

@:native("Globals")
extern class Globals implements IGlobals {
	public static var VIEW_DEFAULT_SHOW_REFLECTIONS : String;
	public function new();
	public function set(param:String, value:Any):Void;
	public function get(param:String):Any;
}