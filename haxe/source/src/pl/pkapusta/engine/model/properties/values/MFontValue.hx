package pl.pkapusta.engine.model.properties.values;

import pl.pkapusta.engine.common.enums.EmbedType;
import pl.pkapusta.engine.common.data.parsers.embed.IParserEmbedReader;
import pl.pkapusta.engine.common.data.parsers.embed.IParserEmbedWriter;
import pl.pkapusta.engine.common.formats.font.MFont;
import pl.pkapusta.engine.common.interfaces.IEmbeddable;
import pl.pkapusta.engine.model.properties.values.interfaces.IMFontValue;
import pl.pkapusta.engine.project.data.structure.interfaces.IExtraDataHolder;
import pl.pkapusta.engine.project.data.structure.interfaces.IUniqueIdHolder;
import openfl.utils.ByteArray;

/**
 * @author Przemysław Kapusta
 */
class MFontValue implements IMFontValue implements IEmbeddable implements IUniqueIdHolder implements IExtraDataHolder
{
    public var uniqueId(get, set) : String;
    public var font(get, set) : MFont;

    private static var globalDefaultEmbed : Bool = false;
    
    private var _uniqueId : String = null;
	
	@:allow(pl.pkapusta.engine.model.properties.writers.MFontValueWriter)
    private var _extraData : FastXML = FastXML.parse("<extra-data/>");
	
    private var _embedType : String = EmbedType.DEFAULT;
    
    private var _font : MFont;
    
    public function new(font : MFont)
    {
        _font = font;
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
        return MFontValue.globalDefaultEmbed;
    }
    
    public function setDefaultEmbed(value : Bool) : Bool
    {
        MFontValue.globalDefaultEmbed = value;
        return value;
    }
    
    private function get_font() : MFont
    {
        return _font;
    }
	
	private function set_font(value : MFont) : MFont
    {
        _font = value;
		return _font;
    }
	
}

