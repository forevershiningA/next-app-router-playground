package pl.pkapusta.engine.model.executors.bridge;

@:native("Engine3D.model.executors.bridge.IM3DBridge")
extern interface IM3DBridge {
	function dispatchPropertyChange(id:String, data:Dynamic, type:String):Void;
}