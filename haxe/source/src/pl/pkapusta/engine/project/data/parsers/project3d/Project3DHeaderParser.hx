package pl.pkapusta.engine.project.data.parsers.project3d;

import pl.pkapusta.engine.common.data.parsers.IParserHeader;
import pl.pkapusta.engine.common.data.parsers.IParserReader;
import pl.pkapusta.engine.common.data.parsers.IParserWriter;
import openfl.utils.ByteArray;

/**
	 * @author Przemysław Kapusta
	 */
class Project3DHeaderParser implements IParserReader implements IParserWriter implements IParserHeader
{
    public var isValid(get, never) : Bool;

    
    private var BASIC_HEADER_COMP1(default, never) : String = "PROJ";
    private var BASIC_HEADER_COMP2(default, never) : Int = 0xFFFFFFFF;
    
    public var version : Int = 2;
    public var isCompressed : Bool = true;
    
    private var _isValid : Bool = false;
    
    public function readStream(data : ByteArray) : Void
    {
        if (data.readUTFBytes(BASIC_HEADER_COMP1.length) != BASIC_HEADER_COMP1)
        {
            _isValid = false;
            return;
        }
        version = data.readByte();
        isCompressed = ((data.readByte() == 0)) ? false : true;
        if (data.readUnsignedInt() != BASIC_HEADER_COMP2)
        {
            _isValid = false;
            return;
        }
        _isValid = true;
    }
    
    public function writeStream(data : ByteArray) : Void
    {
        data.writeUTFBytes(BASIC_HEADER_COMP1);
        data.writeByte(version);
        data.writeByte(((isCompressed)) ? 1 : 0);
        data.writeUnsignedInt(BASIC_HEADER_COMP2);
    }
    
    private function get_isValid() : Bool
    {
        return _isValid;
    }

    public function new()
    {
    }
}

