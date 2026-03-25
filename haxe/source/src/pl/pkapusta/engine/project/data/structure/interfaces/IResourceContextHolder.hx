package pl.pkapusta.engine.project.data.structure.interfaces;

import pl.pkapusta.engine.project.data.structure.context.IResourceContext;

/**
 * @author Przemysław Kapusta
 */
interface IResourceContextHolder {
    
    function getContext() : IResourceContext;
	function setContext(value : IResourceContext) : IResourceContext;

}

