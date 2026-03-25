package pl.pkapusta.engine.project.data.structure.context;

import pl.pkapusta.engine.common.data.parsers.project.IProjectElementReader;
import pl.pkapusta.engine.common.data.parsers.project.IProjectElementWriter;

/**
	 * @author Przemysław Kapusta
	 */
interface IResourceContext extends IProjectElementWriter extends IProjectElementReader
{
    
    
    var type(get, never) : String;

}

