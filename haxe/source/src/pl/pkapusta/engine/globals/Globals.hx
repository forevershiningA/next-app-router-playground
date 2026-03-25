package pl.pkapusta.engine.globals;

/**
 * Global engine settings initialized before starting the 3d scene.
 * 
 * Options available:
 * - view.default.showReflections: (true/false) whether to display reflections
 * 
 * @author Przemysław Kapusta
 */
@:expose("Globals")
class Globals implements IGlobals {
	
	public static inline var VIEW_DEFAULT_SHOW_REFLECTIONS : String = "view.default.showReflections";
	
	private var _globalsData : Map<String, Any>;

	public function new() {
		_globalsData = new Map<String, Any>();
		initValues();
	}
	
	public function set(param: String, value: Any):Void {
		_globalsData.set(param, value);
	}
	
	public function get(param: String):Any {
		return _globalsData.get(param);
	}
	
	private function initValues():Void {
		set(VIEW_DEFAULT_SHOW_REFLECTIONS, true);
	}
	
}