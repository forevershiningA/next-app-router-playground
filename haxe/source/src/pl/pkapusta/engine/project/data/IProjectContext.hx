package pl.pkapusta.engine.project.data;

import pl.pkapusta.engine.project.data.triggers.IResourceLoadTrigger;

/**
	 * @author Przemysław Kapusta
	 */
interface IProjectContext
{
    
    
    var relativeURL(get, never) : String;

    function buildResourceLoadTrigger(includingTypes : Array<String>) : IResourceLoadTrigger;
}

