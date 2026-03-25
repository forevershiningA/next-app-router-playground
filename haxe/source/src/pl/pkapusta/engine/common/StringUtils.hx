package pl.pkapusta.engine.common;

import openfl.utils.ByteArray;

/**
	 * @author Przemysław Kapusta
	 */
class StringUtils
{
    
    private static var strhex : Map<String, Int>;
    private static var inited : Bool = false;
    private static function init() : Void
    {
        if (inited)
        {
            return;
        }
        strhex = new Map<String, Int>();
        strhex.set("0", 0);
        strhex.set("1", 1);
        strhex.set("2", 2);
        strhex.set("3", 3);
        strhex.set("4", 4);
        strhex.set("5", 5);
        strhex.set("6", 6);
        strhex.set("7", 7);
        strhex.set("8", 8);
        strhex.set("9", 9);
        strhex.set("a", 10);
        strhex.set("b", 11);
        strhex.set("c", 12);
        strhex.set("d", 13);
        strhex.set("e", 14);
        strhex.set("f", 15);
        inited = true;
    }
    
    
    public static function HexToByteArray(s : String) : ByteArray
    {
        init();
        var bytes : ByteArray = new ByteArray();
        var pos : Int = 0;
        while (pos < s.length)
        {
            var n1 : Int = strhex.get(s.charAt(pos));
            pos++;
            if (pos >= s.length)
            {
                return bytes;
            }
            var n0 : Int = strhex.get(s.charAt(pos));
            pos++;
            var byte : Int = as3hx.Compat.parseInt(n0 + n1 * 16);
            bytes.writeByte(byte);
        }
        return bytes;
    }

    public static inline function HexStringToInt(s : String) : Int {
		return Std.parseInt(StringTools.startsWith(s.toLowerCase(), "0x")?s:"0x" + s);
	}
	
	public static inline function IntToHexString(i : Int) : String {
		return StringTools.hex(i);
	}
	
}

