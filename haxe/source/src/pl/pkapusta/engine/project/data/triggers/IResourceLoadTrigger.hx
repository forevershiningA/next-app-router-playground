package pl.pkapusta.engine.project.data.triggers;

import pl.pkapusta.engine.common.interfaces.IDisposable;
import pl.pkapusta.engine.project.data.structure.ElementDataHolder;
import pl.pkapusta.engine.project.data.triggers.response.ITriggerResponse;

/**
	 * @author Przemysław Kapusta
	 */
interface IResourceLoadTrigger extends IDisposable
{
    
    var resourceType(get, never) : String;

    
    function process(type : String, dataHolder : ElementDataHolder, response : ITriggerResponse) : Void
    ;
}

