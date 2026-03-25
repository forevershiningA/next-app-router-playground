package pl.pkapusta.engine.model.data.common;

import away3d.loaders.Loader3D;
import pl.pkapusta.engine.common.interfaces.IDisposable;

/**
	 * @author Przemysław Kapusta
	 */
class Object3DAsset extends BaseAsset implements IObject3DAsset implements IDisposable
{
    public var assets(get, never) : Map<String, Array<Dynamic>>;
    public var loader(get, never) : Loader3D;

    
    private var _assets : Map<String, Array<Dynamic>>;
    private var _loader : Loader3D;
    
    public function new(id : String, loader : Loader3D, assets : Map<String, Array<Dynamic>>)
    {
        super(id);
        _assets = assets;
        _loader = loader;
    }
    
    private function get_assets() : Map<String, Array<Dynamic>>
    {
        return _assets;
    }
    
    private function get_loader() : Loader3D
    {
        return _loader;
    }
    
    override public function dispose() : Void
    {
        _assets = null;
        if (_loader != null)
        {
            _loader.disposeWithChildren();
            _loader = null;
        }
        super.dispose();
    }
}

