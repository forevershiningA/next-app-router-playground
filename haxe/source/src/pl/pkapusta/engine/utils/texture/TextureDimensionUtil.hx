package pl.pkapusta.engine.utils.texture;

import pl.pkapusta.engine.utils.math.EngineMath;

/**
	 * @author Przemysław Kapusta
	 */
class TextureDimensionUtil
{
    public var objHeight(get, set) : Float;
    public var objWidth(get, set) : Float;
    public var textureWidth(get, never) : Int;
    public var textureHeight(get, never) : Int;

    
    private var MAX_TEXTURE_DIMENSION(default, never) : Int = 2048;
    
    private var _objWidth : Float;
    private var _objHeight : Float;
    
    private var _textureWidth : Int;
    private var _textureHeight : Int;
    
    private var needUpdate : Bool = true;
    
    public function new(objWidth : Float, objHeight : Float)
    {
        _objWidth = objWidth;
        _objHeight = objHeight;
    }
    
    private function update() : Void
    {
        if (!needUpdate)
        {
            return;
        }
        needUpdate = false;
        
        _textureWidth = EngineMath.convertToPow2Dimension(_objWidth);
        _textureHeight = EngineMath.convertToPow2Dimension(_objHeight);
        
        if (Math.max(_textureWidth, _textureHeight) > MAX_TEXTURE_DIMENSION)
        {
            var scale : Float = Math.max(_textureWidth, _textureHeight) / MAX_TEXTURE_DIMENSION;
            _textureWidth = Std.int(_textureWidth / scale);
            _textureHeight = Std.int(_textureHeight / scale);
        }
    }
    private function notifyChanged() : Void
    {
        needUpdate = true;
    }
    
    private function get_objHeight() : Float
    {
        return _objHeight;
    }
    
    private function get_objWidth() : Float
    {
        return _objWidth;
    }
    
    private function get_textureWidth() : Int
    {
        update();
        return _textureWidth;
    }
    
    private function get_textureHeight() : Int
    {
        update();
        return _textureHeight;
    }
    
    private function set_objWidth(value : Float) : Float
    {
        if (_objWidth == value)
        {
            return value;
        }
        _objWidth = value;
        notifyChanged();
        return value;
    }
    
    private function set_objHeight(value : Float) : Float
    {
        if (_objHeight == value)
        {
            return value;
        }
        _objHeight = value;
        notifyChanged();
        return value;
    }
}

