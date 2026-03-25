package pl.pkapusta.engine.model.executors.file;

import pl.pkapusta.engine.model.executors.file.proxies.IModel3DProxy;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.model.executors.file.IM3DExecutorDuplicator")
interface IM3DExecutorDuplicator
{
    
    
    var defaultPropertiesDuplicator(get, never) : Bool;

    function duplicate(newModel : IModel3DProxy) : Void
    ;
}

