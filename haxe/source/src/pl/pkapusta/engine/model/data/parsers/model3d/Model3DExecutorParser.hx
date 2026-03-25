package pl.pkapusta.engine.model.data.parsers.model3d;

import pl.pkapusta.engine.common.data.parsers.*;
import openfl.utils.ByteArray;

/**
	 * @author Przemysław Kapusta
	 */
class Model3DExecutorParser extends AbstractParser
{
    
    public var executor : ByteArray = null;
    
    override public function readStream(data : ByteArray) : Void
    {
        if (data.readBoolean())
        {
            executor = new ByteArray();
            var dataLength : Int = data.readUnsignedInt();
            data.readBytes(executor, 0, dataLength);
        }
    }
    
    //#if PARSER::doWrite
    override public function writeStream(data : ByteArray) : Void
    {
        if (executor == null)
        {
            data.writeBoolean(false);
        }
        else
        {
            data.writeBoolean(true);
            data.writeUnsignedInt(executor.length);
            data.writeBytes(executor);
        }
    }

    public function new()
    {
        super();
    }
}

