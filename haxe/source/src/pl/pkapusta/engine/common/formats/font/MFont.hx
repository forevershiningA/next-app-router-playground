package pl.pkapusta.engine.common.formats.font;

import pl.pkapusta.engine.common.formats.font.executor.IFontExecutor;
import openfl.text.Font;
import openfl.utils.ByteArray;

/**
	 * ...
	 * @author Przemysław Kapusta
	 */
class MFont
{
    public var registered(get, never) : Bool;
    public var fontName(get, never) : String;
    public var fontStyle(get, never) : String;
    public var fontType(get, never) : String;
    public var bytes(get, never) : ByteArray;

    
    private var _baseClass : IFontExecutor;
    private var _bytes : ByteArray;
    
    public function new(baseClass : IFontExecutor, bytes : ByteArray)
    {
        _baseClass = baseClass;
        _bytes = bytes;
    }
    
    public function registerFont() : Void
    {
        _baseClass.registerFont();
    }
    
    private function get_registered() : Bool
    {
        return _baseClass.registered;
    }
    
    private function get_fontName() : String
    {
        return _baseClass.getFont().fontName;
    }
    
    private function get_fontStyle() : String
    {
        return _baseClass.getFont().fontStyle;
    }
    
    private function get_fontType() : String
    {
        return _baseClass.getFont().fontType;
    }
    
    private function get_bytes() : ByteArray
    {
        return _bytes;
    }
    
	//#WARN int haxe hasGlyphs not exists
    //public function hasGlyphs(str : String) : Bool
    //{
    //    return _baseClass.getFont().hasGlyphs(str);
    //}
    
    public function getFont() : Font
    {
        return _baseClass.getFont();
    }
}

