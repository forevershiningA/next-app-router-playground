package pl.pkapusta.engine.project.data;

import away3d.materials.lightpickers.LightPickerBase;
import away3d.textures.CubeTextureBase;
import pl.pkapusta.engine.common.interfaces.IDisposable;
import pl.pkapusta.engine.common.interfaces.IParamStorage;
import openfl.events.Event;
import openfl.events.EventDispatcher;
import openfl.events.IEventDispatcher;

/**
	 * @author Przemysław Kapusta
	 */
class SceneData extends EventDispatcher implements IParamStorage implements IDisposable implements IEventDispatcher
{
    
    private var _params : Map<String, Dynamic>;
    
    public function new()
    {
        super();
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
    
    public function dispatchDataChange() : Void
    {
        dispatchEvent(new Event(Event.CHANGE));
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

