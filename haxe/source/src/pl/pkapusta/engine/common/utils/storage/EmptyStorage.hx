package pl.pkapusta.engine.common.utils.storage;

import pl.pkapusta.engine.common.interfaces.IParamStorage;

class EmptyStorage implements IParamStorage
{
    
    private static var instance : IParamStorage = null;
    public static function getInstance() : IParamStorage
    {
        if (instance == null)
        {
            instance = new EmptyStorage();
        }
        return instance;
    }
    
    public function clearParam(name : String) : Void
    {
    }
    
    public function getParam(name : String) : Dynamic
    {
        return null;
    }
    
    public function getParamNames() : Array<String>
    {
        return new Array<String>();
    }
    
    public function hasParam(name : String) : Bool
    {
        return false;
    }
    
    public function setParam(name : String, data : Dynamic) : Void
    {
    }

    public function new()
    {
    }
}

