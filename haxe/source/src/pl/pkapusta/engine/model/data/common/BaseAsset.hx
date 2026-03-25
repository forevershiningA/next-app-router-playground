package pl.pkapusta.engine.model.data.common;

import pl.pkapusta.engine.common.interfaces.IDisposable;

/**
	 * @author Przemysław Kapusta
	 */
class BaseAsset implements IBaseAsset implements IDisposable
{
    public var id(get, never) : String;

    
    private var _id : String;
    
    public function new(id : String)
    {
        _id = id;
    }
    
    private function get_id() : String
    {
        return _id;
    }
    
    public function dispose() : Void
    {
        _id = null;
    }
}

