package pl.pkapusta.engine.model.executors.file.proxies;

@:native("Engine3D.model.executors.file.proxies.IStandardSelectionProxy")
extern interface IStandardSelectionProxy extends ISelectionProxy {
	var width(get, set):Float;
	var height(get, set):Float;
	var depth(get, set):Float;
	var x(get, set):Float;
	var y(get, set):Float;
	var z(get, set):Float;
	function moveTo(x:Float, y:Float, z:Float):Void;
	function resizeTo(width:Float, height:Float, depth:Float):Void;
}