package pl.pkapusta.engine.common.formats.font.parser.base;

import pl.pkapusta.engine.common.data.parsers.*;
import openfl.utils.ByteArray;

/**
	 * @author Przemysław Kapusta
	 */
class FontHeaderParser extends AbstractParser
{
    public var isValid(get, never) : Bool;

    
    private var BASIC_HEADER_COMP1(default, never) : String = "FONT";
    private var BASIC_HEADER_COMP2(default, never) : Int = 0xFFFFFFFF;
    
    public var version : Int = 1;
    public var isCompressed : Bool = true;
    
    private var _isValid : Bool = false;
    
    override public function readStream(data : ByteArray) : Void
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
    
    //#if PARSER::doWrite
    override public function writeStream(data : ByteArray) : Void
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
        super();
    }
}

