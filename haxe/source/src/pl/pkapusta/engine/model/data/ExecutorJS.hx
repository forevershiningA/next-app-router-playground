package pl.pkapusta.engine.model.data;

/**
 * @author Przemysław Kapusta
 */
class ExecutorJS 
{

	public function new() {}
	
	static public function createInstanceFromJS<T>(js:String, c:Class<T>):T {
		
		//parse js
		var _executorJs:String = js + "return Executor;";
		untyped __js__("var F = new Function({0})", _executorJs);
		var obj = untyped __js__("F()");
		
		//create instance
		var ins = Type.createInstance(obj, []);
		
		//super to instance
		untyped __js__("{0}.__super__ = {1}.__super__", ins, obj);
		
		//interfaces to instance
		untyped __js__("{0}.__interfaces__ = {1}.__interfaces__", ins, obj);
		
		return cast ins;
	}
	
	static public function instanceOf<T>(obj:Dynamic, c:Class<T>):Bool {
		//trace("instanceOf: " + obj);
		if (obj == null) return false;
		var tsuper:Dynamic = untyped __js__("{0}.__super__", obj);
		//trace("tsuper: " + tsuper);
		if (tsuper == c) return true;
		var interfaces:Array<Dynamic> = untyped __js__("{0}.__interfaces__", obj);
		//trace("interfaces: " + interfaces);
		var res:Bool = (interfaces != null) && (interfaces.indexOf(c) >= 0);
		if (res) return true;
		if (tsuper != null) {
			res = instanceOf(tsuper, c);
			if (res) return true;
		}
		if (interfaces != null) {
			for (tinterface in interfaces) {
				if (tinterface != null) {
					res = instanceOf(tinterface, c);
					if (res) return true;
				}
			}
		}
		return false;
	}
	
	static public function castTo<T>(obj:Dynamic, c:Class<T>):T {
		if (obj == null) return null;
		if (instanceOf(obj, c)) {
			return cast obj;
		} else {
			return null;
		}
	}
	
}