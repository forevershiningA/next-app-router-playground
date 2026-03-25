package pl.pkapusta.engine.common.formats.font.parser.base;

import pl.pkapusta.engine.common.data.parsers.*;
import openfl.utils.ByteArray;

/**
	 * @author Przemysław Kapusta
	 */
class FontClassParser extends AbstractParser
{
    
    public var classExecutor : ByteArray = null;
    
    override public function readStream(data : ByteArray) : Void
    {
        classExecutor = new ByteArray();
        var dataLength : Int = data.readUnsignedInt();
        data.readBytes(classExecutor, 0, dataLength);
    }
    
    //#if PARSER::doWrite
    override public function writeStream(data : ByteArray) : Void
    {
        data.writeUnsignedInt(classExecutor.length);
        data.writeBytes(classExecutor);
    }

    public function new()
    {
        super();
    }
}

