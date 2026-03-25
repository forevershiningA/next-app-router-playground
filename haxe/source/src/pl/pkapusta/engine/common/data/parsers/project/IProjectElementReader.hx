package pl.pkapusta.engine.common.data.parsers.project;

import pl.pkapusta.engine.common.data.parsers.embed.IParserEmbedReader;
import pl.pkapusta.engine.project.data.IProjectContext;

/**
	 * @author Przemysław Kapusta
	 */
interface IProjectElementReader
{

    
    function readProjectElement(xml : FastXML, embedReader : IParserEmbedReader, context : IProjectContext) : Void
    ;
}

