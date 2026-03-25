package pl.pkapusta.engine.model.data.common;

import away3d.loaders.Loader3D;
import pl.pkapusta.engine.common.interfaces.IDisposable;
import openfl.display.BitmapData;

/**
	 * @author Przemysław Kapusta
	 */
class TextureAsset extends BaseAsset implements ITextureAsset implements IDisposable
{
    public var texture(get, never) : BitmapData;

    
    private var _texture : BitmapData;
    
    public function new(id : String, texture : BitmapData)
    {
        super(id);
        _texture = texture;
    }
    
    private function get_texture() : BitmapData
    {
        return _texture;
    }
    
    override public function dispose() : Void
    {
        if (_texture != null)
        {
            _texture.dispose();
            _texture = null;
        }
        super.dispose();
    }
}

