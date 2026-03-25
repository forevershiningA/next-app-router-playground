package pl.pkapusta.engine.model.executors.file;

import away3d.containers.ObjectContainer3D;
import pl.pkapusta.engine.globals.IGlobals;
import pl.pkapusta.engine.model.executors.file.proxies.IModel3DProxy;
import pl.pkapusta.engine.model.data.IModel3DData;
import pl.pkapusta.engine.common.interfaces.IParamStorage;
import pl.pkapusta.engine.model.executors.bridge.IM3DBridge;

@:native("Engine3D.model.executors.file.IM3DExecutor")
extern interface IM3DExecutor {
	function initData(container:ObjectContainer3D, model:IModel3DProxy, data:IModel3DData, sharedData:IParamStorage, globals: IGlobals, bridge:IM3DBridge):Void;
	function build():Void;
}