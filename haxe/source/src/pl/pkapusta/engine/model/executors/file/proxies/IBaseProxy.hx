package pl.pkapusta.engine.model.executors.file.proxies;

import pl.pkapusta.engine.common.interfaces.IDisposable;

/**
 * @author Przemysław Kapusta
 */
@:expose("Engine3D.model.executors.file.proxies.IBaseProxy")
interface IBaseProxy extends IDisposable
{
    
	function getBaseInstance() : Dynamic;

}

