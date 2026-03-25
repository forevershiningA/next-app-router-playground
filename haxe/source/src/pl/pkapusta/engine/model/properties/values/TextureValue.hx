package pl.pkapusta.engine.model.properties.values;

import pl.pkapusta.engine.common.enums.EmbedType;
import pl.pkapusta.engine.common.interfaces.IEmbeddable;
import pl.pkapusta.engine.model.properties.values.interfaces.ITextureValue;
import pl.pkapusta.engine.project.data.structure.interfaces.IExtraDataHolder;
import pl.pkapusta.engine.project.data.structure.interfaces.IUniqueIdHolder;

/**
 * An abstract object that stores a texture. It is overwritten with a specific implementation, e.g. BitmapTextureValue.
 * 
 * @author Przemysław Kapusta
 * @abstract
 */
@:expose("Engine3D.values.TextureValue")
class TextureValue implements ITextureValue implements IEmbeddable implements IUniqueIdHolder implements IExtraDataHolder
{
    public var uniqueId(get, set) : String;
    public var surfaceCoatingScale(get, never) : Float;
    public var textureType(get, never) : String;
    
    private static var globalDefaultEmbed : Bool = false;
    
    private var _uniqueId : String = null;
	
    @:allow(pl.pkapusta.engine.model.properties.writers.TextureValueWriter)
    private var _extraData : FastXML = FastXML.parse("<extra-data/>");
	
    private var _embedType : String = EmbedType.DEFAULT;
    
    private var _surfaceCoatingScale : Float = 1;
    
    public function new(surfaceCoatingScale : Float)
    {
        _surfaceCoatingScale = surfaceCoatingScale;
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
    
    private function get_surfaceCoatingScale() : Float
    {
        return _surfaceCoatingScale;
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
        return TextureValue.globalDefaultEmbed;
    }
    
    public function setDefaultEmbed(value : Bool) : Bool
    {
        TextureValue.globalDefaultEmbed = value;
        return value;
    }
    
    private function get_textureType() : String
    {
        return null;
    }
}

