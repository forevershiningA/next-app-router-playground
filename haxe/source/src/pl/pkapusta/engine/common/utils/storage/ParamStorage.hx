package pl.pkapusta.engine.common.utils.storage;

import pl.pkapusta.engine.common.interfaces.IDisposable;
import pl.pkapusta.engine.common.interfaces.IParamStorage;

/**
	 * @author Przemysław Kapusta
	 */
class ParamStorage implements IParamStorage implements IDisposable
{
    
    public static function buildFromParamsObj(params : Dynamic) : IParamStorage
    {
        if (params == null)
        {
            return EmptyStorage.getInstance();
        }
        if (Std.is(params, IParamStorage))
        {
            return try cast(params, IParamStorage) catch(e:Dynamic) null;
        }
        var p : ParamStorage = new ParamStorage();
        for (paramName in Reflect.fields(params))
        {
            p.setParam(paramName, Reflect.field(params, paramName));
        }
        return p;
    }
    
    private var _params : Map<String, Dynamic>;
    
    public function new()
    {
        _params = new Map<String, Dynamic>();
    }
    
    public function setParam(name : String, data : Dynamic) : Void
    {
        _params.set(name, data);
    }
    
    public function getParam(name : String) : Dynamic
    {
        if (!hasParam(name))
        {
            return null;
        }
        return _params.get(name);
    }
    
    public function hasParam(name : String) : Bool
    {
        return _params.exists(name);
    }
    
    public function clearParam(name : String) : Void
    {
        _params.remove(name);
    }
    
    public function getParamNames() : Array<String>
    {
        var r : Array<String> = new Array<String>();
        for (n in _params.keys())
        {
            r.push(n);
        }
        return r;
    }
    
    public function dispose() : Void
    {
        if (_params != null)
        {
            for (p in _params)
            {
                if (Std.is(p, IDisposable))
                {
                    cast((p), IDisposable).dispose();
                }
            }
            _params = null;
        }
    }
}

