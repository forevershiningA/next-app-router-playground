package pl.pkapusta.engine.model.properties.values;

import pl.pkapusta.engine.common.interfaces.IEmbeddable;
import pl.pkapusta.engine.model.properties.values.interfaces.ITextureValue;
import pl.pkapusta.engine.project.data.structure.interfaces.IExtraDataHolder;
import pl.pkapusta.engine.project.data.structure.interfaces.IUniqueIdHolder;
import openfl.utils.ByteArray;

/**
 * @author Przemysław Kapusta
 */
class ATFTextureValue extends TextureValue implements ITextureValue implements IEmbeddable implements IUniqueIdHolder implements IExtraDataHolder
{
    public var texture(get, set) : ByteArray;

    
    public static inline var TEXTURE_TYPE : String = "atf";
    
    private var _texture : ByteArray;
    
    public function new(texture : ByteArray, surfaceCoatingScale : Float)
    {
        super(surfaceCoatingScale);
        _texture = texture;
    }
    
    private function get_texture() : ByteArray
    {
        return _texture;
    }
	
	private function set_texture(value: ByteArray) : ByteArray
    {
		_texture = value;
        return _texture;
    }
    
    override private function get_textureType() : String
    {
        return TEXTURE_TYPE;
    }
}

