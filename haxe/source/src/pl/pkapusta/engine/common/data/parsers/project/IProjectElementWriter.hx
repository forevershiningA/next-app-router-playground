package pl.pkapusta.engine.common.data.parsers.project;

import pl.pkapusta.engine.common.data.parsers.embed.IParserEmbedWriter;

/**
	 * @author Przemysław Kapusta
	 */
interface IProjectElementWriter
{

    
    function writeProjectElement(embedWriter : IParserEmbedWriter) : FastXML
    ;
}

