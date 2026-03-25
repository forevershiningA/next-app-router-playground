package pl.pkapusta.engine.model.properties.writers.data;

import openfl.display.DisplayObject;
import openfl.utils.ByteArray;

/**
	 * @author Przemysław Kapusta
	 */
class DisplayObjectTriggerResponse
{
    public var display(get, never) : DisplayObject;
    public var bytes(get, never) : ByteArray;

    
    private var _display : DisplayObject;
    private var _bytes : ByteArray;
    
    public function new(display : DisplayObject, bytes : ByteArray)
    {
        _display = display;
        _bytes = bytes;
    }
    
    private function get_display() : DisplayObject
    {
        return _display;
    }
    
    private function get_bytes() : ByteArray
    {
        return _bytes;
    }
}

