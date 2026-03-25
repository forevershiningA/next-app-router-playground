package pl.pkapusta.engine.model.executors.file;

@:native("Engine3D.model.executors.file.IM3DExecutorProperty")
extern interface IM3DExecutorProperty {
	public function updateProperty(name:String, data:Dynamic):Void;
}