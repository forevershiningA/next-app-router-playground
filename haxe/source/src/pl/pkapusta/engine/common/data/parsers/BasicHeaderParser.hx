package pl.pkapusta.engine.common.data.parsers;

import pl.pkapusta.engine.common.data.parsers.*;
import openfl.utils.ByteArray;

/**
	 * Basic Header for 3D Engine all bytes files
	 * 
	 * @author Przemysław Kapusta
	 */
class BasicHeaderParser implements IParserReader implements IParserWriter implements IParserHeader
{
    public var isValid(get, never) : Bool;

    
    private var BASIC_HEADER_COMP1A(default, never) : Int = 0xFFFF;
    private var BASIC_HEADER_COMP1B(default, never) : Int = 0x0000;
    private var BASIC_HEADER_COMP2(default, never) : String = "WPF0";
    private var BASIC_HEADER_COMP3A(default, never) : Int = 0x0000;
    private var BASIC_HEADER_COMP3B(default, never) : Int = 0xFFFF;
    
    private var _isValid : Bool = false;
    
    public function readStream(data : ByteArray) : Void
    {
        if (data.readUnsignedShort() != BASIC_HEADER_COMP1A)
        {
            _isValid = false;
            return;
        }
		if (data.readUnsignedShort() != BASIC_HEADER_COMP1B)
        {
            _isValid = false;
            return;
        }
        if (data.readUTFBytes(BASIC_HEADER_COMP2.length) != BASIC_HEADER_COMP2)
        {
            _isValid = false;
            return;
        }
        if (data.readUnsignedShort() != BASIC_HEADER_COMP3A)
        {
            _isValid = false;
            return;
        }
		if (data.readUnsignedShort() != BASIC_HEADER_COMP3B)
        {
            _isValid = false;
            return;
        }
        _isValid = true;
    }
    
    public function writeStream(data : ByteArray) : Void
    {
        data.writeShort(BASIC_HEADER_COMP1A);
        data.writeShort(BASIC_HEADER_COMP1B);
        data.writeUTFBytes(BASIC_HEADER_COMP2);
        data.writeShort(BASIC_HEADER_COMP3A);
        data.writeShort(BASIC_HEADER_COMP3B);
    }
    
    private function get_isValid() : Bool
    {
        return _isValid;
    }

    public function new()
    {
    }
}

