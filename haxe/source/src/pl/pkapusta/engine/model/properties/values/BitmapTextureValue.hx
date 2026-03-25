package pl.pkapusta.engine.model.properties.values;

import pl.pkapusta.engine.common.interfaces.IEmbeddable;
import pl.pkapusta.engine.model.properties.values.interfaces.ITextureValue;
import pl.pkapusta.engine.project.data.structure.interfaces.IExtraDataHolder;
import pl.pkapusta.engine.project.data.structure.interfaces.IUniqueIdHolder;
import openfl.display.BitmapData;

/**
 * Stores the loaded texture in memory
 * 
 * @author Przemysław Kapusta
 */

@:keep
@:expose("Engine3D.values.BitmapTextureValue")
class BitmapTextureValue extends TextureValue implements ITextureValue implements IEmbeddable implements IUniqueIdHolder implements IExtraDataHolder
{
    public var texture(get, set) : BitmapData;

    
    public static inline var TEXTURE_TYPE : String = "bitmap";
    
    private var _texture : BitmapData;
    
    public function new(texture : BitmapData, surfaceCoatingScale : Float)
    {
        super(surfaceCoatingScale);
        _texture = texture;
    }
    
    private function get_texture() : BitmapData
    {
        return _texture;
    }
	
	private function set_texture(value: BitmapData) : BitmapData
    {
		_texture = value;
        return _texture;
    }
    
    override private function get_textureType() : String
    {
        return TEXTURE_TYPE;
    }
}

