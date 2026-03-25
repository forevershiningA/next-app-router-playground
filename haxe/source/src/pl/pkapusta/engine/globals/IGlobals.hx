package pl.pkapusta.engine.globals;

/**
 * @author Przemysław Kapusta
 */
interface IGlobals {
	
	function set(param: String, value: Any):Void;
	function get(param: String):Any;
	
}