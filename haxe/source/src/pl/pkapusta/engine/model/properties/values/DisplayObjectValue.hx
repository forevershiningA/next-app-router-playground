package pl.pkapusta.engine.model.properties.values;

import pl.pkapusta.engine.common.enums.EmbedType;
import pl.pkapusta.engine.common.interfaces.IEmbeddable;
import pl.pkapusta.engine.model.properties.values.interfaces.IDisplayObjectValue;
import pl.pkapusta.engine.project.data.structure.interfaces.IExtraDataHolder;
import pl.pkapusta.engine.project.data.structure.interfaces.IUniqueIdHolder;
import js.html.CanvasElement;
import openfl.display.Bitmap;
import openfl.display.BitmapData;
import openfl.display.DisplayObject;
import openfl.utils.ByteArray;

/**
 * @author Przemysław Kapusta
 */
@:keep
@:expose("Engine3D.values.DisplayObjectValue")
class DisplayObjectValue implements IDisplayObjectValue implements IEmbeddable implements IUniqueIdHolder implements IExtraDataHolder
{
    public var uniqueId(get, set) : String;
    public var display(get, set) : DisplayObject;
    public var bytes(get, set) : ByteArray;
    
    private static var globalDefaultEmbed : Bool = false;
    
    private var _uniqueId : String = null;
	
	@:allow(pl.pkapusta.engine.model.properties.writers.DisplayObjectValueWriter)
    private var _extraData : FastXML = FastXML.parse("<extra-data/>");
	
    private var _embedType : String = EmbedType.DEFAULT;
    
    private var _display : DisplayObject;
    private var _bytes : ByteArray;
    
    public function new(display : DisplayObject, bytes : ByteArray = null)
    {
		if (display != null) {
			if (Std.is(display, DisplayObject)) {
				_display = display;
			} else if (Std.is(display, CanvasElement)) {
				_display = new Bitmap(BitmapData.fromCanvas(cast display, true));
			} else throw "Invalid parameter";
		}
        _bytes = bytes;
    }
    
    private function get_uniqueId() : String
    {
        return _uniqueId;
    }
    
    private function set_uniqueId(value : String) : String
    {
        _uniqueId = value;
        return value;
    }
    
    public function getExtraData() : FastXML
    {
        return _extraData;
    }
    
    public function getEmbedType() : String
    {
        return _embedType;
    }
    
    public function setEmbedType(value : String) : String
    {
        _embedType = value;
        return value;
    }
    
    public function getDefaultEmbed() : Bool
    {
        return DisplayObjectValue.globalDefaultEmbed;
    }
    
    public function setDefaultEmbed(value : Bool) : Bool
    {
        DisplayObjectValue.globalDefaultEmbed = value;
        return value;
    }
    
    private function get_display() : DisplayObject
    {
        return _display;
    }
	
	private function set_display(value: DisplayObject) : DisplayObject
    {
		_display = value;
        return _display;
    }
    
    private function get_bytes() : ByteArray
    {
        return _bytes;
    }
	
	private function set_bytes(value: ByteArray) : ByteArray
    {
		_bytes = value;
        return _bytes;
    }
}

