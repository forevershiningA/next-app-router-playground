package pl.pkapusta.engine.model.executors.file;

import pl.pkapusta.engine.model.executors.file.proxies.IRegionProxy;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.model.executors.file.IM3DExecutorLimiter")
interface IM3DExecutorLimiter
{

    function afterParentRegionLimit(limitType : String, limitData : Dynamic, region : IRegionProxy, action : String) : Void
    ;
}

