package pl.pkapusta.engine.common.exteption.control.action;

import haxe.Constraints.Function;
import openfl.events.Event;
import openfl.events.EventDispatcher;

/**
	 * @author Przemysław Kapusta
	 */
class ActionController extends EventDispatcher
{
    
    private var _action : Function;
    private var _params : Array<Dynamic>;
    
    public function new(action : Function, params : Array<Dynamic> = null)
    {
        super();
        _action = action;
        _params = params;
    }
    
    public function doAction() : Void
    {
        Reflect.callMethod(null, _action, _params);
    }
    
    public function complete() : Void
    {
        dispatchEvent(new Event(Event.COMPLETE));
    }
}

