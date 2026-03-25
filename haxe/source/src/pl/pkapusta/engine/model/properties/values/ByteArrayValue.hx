package pl.pkapusta.engine.model.properties.values;

import pl.pkapusta.engine.common.enums.EmbedType;
import pl.pkapusta.engine.common.data.parsers.embed.IParserEmbedReader;
import pl.pkapusta.engine.common.data.parsers.embed.IParserEmbedWriter;
import pl.pkapusta.engine.common.interfaces.IEmbeddable;
import pl.pkapusta.engine.model.properties.values.interfaces.IByteArrayValue;
import pl.pkapusta.engine.project.data.structure.interfaces.IExtraDataHolder;
import pl.pkapusta.engine.project.data.structure.interfaces.IUniqueIdHolder;
import openfl.utils.ByteArray;

/**
 * Stores general data in memory. Sometimes this data can be a texture encoded in a custom format.
 * 
 * @author Przemysław Kapusta
 */
@:expose("Engine3D.values.ByteArrayValue")
class ByteArrayValue implements IByteArrayValue implements IEmbeddable implements IUniqueIdHolder implements IExtraDataHolder
{
    public var uniqueId(get, set) : String;
    public var data(get, set) : ByteArray;
    
    private static var globalDefaultEmbed : Bool = false;
    
    private var _uniqueId : String = null;
	
	@:allow(pl.pkapusta.engine.model.properties.writers.ByteArrayValueWriter)
    private var _extraData : FastXML = FastXML.parse("<extra-data/>");
	
    private var _embedType : String = EmbedType.DEFAULT;
    
    private var _data : ByteArray;
    
    public function new(data : ByteArray)
    {
        _data = data;
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
        return ByteArrayValue.globalDefaultEmbed;
    }
    
    public function setDefaultEmbed(value : Bool) : Bool
    {
        ByteArrayValue.globalDefaultEmbed = value;
		return value;
    }
    
    private function get_data() : ByteArray
    {
        return _data;
    }
	
	private function set_data(value: ByteArray) : ByteArray
    {
		_data = value;
        return _data;
    }
	
	
}

