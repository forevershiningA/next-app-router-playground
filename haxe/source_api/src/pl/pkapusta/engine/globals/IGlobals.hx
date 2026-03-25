package pl.pkapusta.engine.globals;

extern interface IGlobals {
	function set(param:String, value:Any):Void;
	function get(param:String):Any;
}