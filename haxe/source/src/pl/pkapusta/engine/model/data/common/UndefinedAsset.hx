package pl.pkapusta.engine.model.data.common;

import away3d.loaders.Loader3D;
import pl.pkapusta.engine.common.interfaces.IDisposable;
import openfl.utils.ByteArray;

/**
	 * @author Przemysław Kapusta
	 */
class UndefinedAsset extends BaseAsset implements IUndefinedAsset implements IDisposable
{
    public var data(get, never) : ByteArray;

    
    private var _data : ByteArray;
    
    public function new(id : String, data : ByteArray)
    {
        super(id);
        _data = data;
    }
    
    private function get_data() : ByteArray
    {
        return _data;
    }
    
    override public function dispose() : Void
    {
        if (_data != null)
        {
            _data.clear();
            _data = null;
        }
        super.dispose();
    }
}

