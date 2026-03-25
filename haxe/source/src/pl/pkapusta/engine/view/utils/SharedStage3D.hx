package pl.pkapusta.engine.view.utils;

import away3d.core.managers.Stage3DProxy;
import openfl.events.Event;
import openfl.events.EventDispatcher;

class SharedStage3D extends EventDispatcher
{
    public var isShared(get, set) : Bool;
    public var stage3DProxy(get, never) : Stage3DProxy;

    
    private var _isShared : Bool;
    private var _stage3DProxy : Stage3DProxy;
    
    public function new(stage3DProxy : Stage3DProxy)
    {
        super();
        _stage3DProxy = stage3DProxy;
        _isShared = true;
    }
    
    private function get_isShared() : Bool
    {
        return _isShared;
    }
    
    private function set_isShared(value : Bool) : Bool
    {
        _isShared = value;
        return value;
    }
    
    private function get_stage3DProxy() : Stage3DProxy
    {
        return _stage3DProxy;
    }
    
    public function render() : Void
    {
        dispatchEvent(new Event(Event.ENTER_FRAME));
    }
}

