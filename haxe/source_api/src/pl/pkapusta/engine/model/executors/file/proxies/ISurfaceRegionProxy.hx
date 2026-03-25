package pl.pkapusta.engine.model.executors.file.proxies;

@:native("Engine3D.model.executors.file.proxies.ISurfaceRegionProxy")
extern interface ISurfaceRegionProxy extends IRegionProxy {
	function isMoving():Bool;
}