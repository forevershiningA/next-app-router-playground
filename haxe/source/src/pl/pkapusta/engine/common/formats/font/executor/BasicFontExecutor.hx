package pl.pkapusta.engine.common.formats.font.executor;

import pl.pkapusta.engine.common.exteption.predefined.AbstractMethodException;
import openfl.display.Sprite;
import openfl.text.Font;

/**
	 * @author Przemysław Kapusta
	 */
class BasicFontExecutor extends Sprite implements IFontExecutor
{
    public var registered(get, never) : Bool;

    
    private var _registered : Bool = false;
    private var font : Font = null;
    
    /** @abstract */
    private function getFontClass() : Class<Dynamic>
    {
        throw new AbstractMethodException();
        return null;
    }
    
    public function registerFont() : Void
    {
        if (_registered)
        {
            return;
        }
        Font.registerFont(getFontClass());
        _registered = true;
    }
    
    public function getFont() : Font
    {
        if (font != null)
        {
            return font;
        }
        var fc : Class<Dynamic> = getFontClass();
        font = Type.createInstance(fc, []);
        return font;
    }
    
    private function get_registered() : Bool
    {
        return _registered;
    }

    public function new()
    {
        super();
    }
}

