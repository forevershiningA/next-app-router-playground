package pl.pkapusta.engine.model.data.common;

import pl.pkapusta.engine.common.interfaces.IDisposable;
import openfl.display.DisplayObject;
import openfl.display.Loader;

/**
	 * @author Przemysław Kapusta
	 */
class FlashObjectAsset extends BaseAsset implements IFlashObjectAsset implements IDisposable
{
    public var content(get, never) : DisplayObject;

    
    private var _loader : Loader;
    
    public function new(id : String, loader : Loader)
    {
        super(id);
        _loader = loader;
    }
    
    private function get_content() : DisplayObject
    {
        if (_loader == null)
        {
            return null;
        }
        return _loader.content;
    }
    
    override public function dispose() : Void
    {
        if (_loader != null)
        {
            _loader.unloadAndStop();
            _loader = null;
        }
        super.dispose();
    }
}

