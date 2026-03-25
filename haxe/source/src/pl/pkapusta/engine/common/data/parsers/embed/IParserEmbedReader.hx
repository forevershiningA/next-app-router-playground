package pl.pkapusta.engine.common.data.parsers.embed;

import openfl.utils.ByteArray;

/**
	 * @author Przemysław Kapusta
	 */
interface IParserEmbedReader
{

    
    function readEmbedObject(pointer : Int) : ByteArray
    ;
    function allocateObject(pointer : Int, object : Dynamic) : Void
    ;
    function hasAllocatedObject(pointer : Int) : Bool
    ;
    function getAllocatedObject(pointer : Int) : Dynamic
    ;
}

