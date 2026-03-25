package pl.pkapusta.engine.common.data.parsers;

import pl.pkapusta.engine.common.data.parsers.IParserReader;
import pl.pkapusta.engine.common.exteption.ExceptionManager;
import pl.pkapusta.engine.common.exteption.predefined.AbstractMethodException;
import openfl.utils.ByteArray;

/**
	 * @author Przemysław Kapusta
	 */
class AbstractParser implements IParserReader
{
    
    public function readStream(data : ByteArray) : Void
    {
        ExceptionManager.Throw(new AbstractMethodException());
    }
    
    //#if PARSER::doWrite
    public function writeStream(data : ByteArray) : Void
    {
        ExceptionManager.Throw(new AbstractMethodException());
    }

    public function new()
    {
    }
}

