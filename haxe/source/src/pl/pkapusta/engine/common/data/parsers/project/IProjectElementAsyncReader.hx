package pl.pkapusta.engine.common.data.parsers.project;

import haxe.Constraints.Function;
import pl.pkapusta.engine.common.data.parsers.embed.IParserEmbedReader;
import pl.pkapusta.engine.project.data.IProjectContext;

/**
	 * @author Przemysław Kapusta
	 */
interface IProjectElementAsyncReader
{

    
    function readProjectElement(xml : FastXML, embedReader : IParserEmbedReader, context : IProjectContext, onComplete : Function, onCompleteParams : Array<Dynamic> = null) : Void
    ;
}

