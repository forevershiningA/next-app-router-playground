package pl.pkapusta.engine.common.data.parsers.embed;

import openfl.utils.ByteArray;

/**
	 * @author Przemysław Kapusta
	 */
interface IParserEmbedWriter
{

    
    function writeEmbedObject(uniqueObject : Dynamic, data : ByteArray) : Int
    ;
    function embedPointerByUniqueObject(uniqueObject : Dynamic) : Int
    ;
}

