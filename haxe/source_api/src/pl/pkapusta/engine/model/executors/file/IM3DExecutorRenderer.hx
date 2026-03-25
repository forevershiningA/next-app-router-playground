package pl.pkapusta.engine.model.executors.file;

import away3d.containers.View3D;
import pl.pkapusta.engine.common.interfaces.IParamStorage;

@:native("Engine3D.model.executors.file.IM3DExecutorRenderer")
extern interface IM3DExecutorRenderer {
	function beforeViewRender(view:View3D):Void;
	function afterViewRender(view:View3D):Void;
	function onAddedToScene(sceneData:IParamStorage):Void;
	function onRemovedFromScene(sceneData:IParamStorage):Void;
	function onSceneDataChanged(sceneData:IParamStorage):Void;
}