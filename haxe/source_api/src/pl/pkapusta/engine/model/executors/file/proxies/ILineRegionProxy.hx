package pl.pkapusta.engine.model.executors.file.proxies;

@:native("Engine3D.model.executors.file.proxies.ILineRegionProxy")
extern interface ILineRegionProxy extends IRegionProxy {
	function getLineOrientation():String;
	function getWidthLimit():Float;
	function setWidthLimit(value:Float):Float;
}