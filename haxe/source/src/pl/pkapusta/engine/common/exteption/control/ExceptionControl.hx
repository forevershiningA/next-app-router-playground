package pl.pkapusta.engine.common.exteption.control;

import haxe.Constraints.Function;
import pl.pkapusta.engine.common.exteption.control.action.ActionController;
import pl.pkapusta.engine.common.exteption.control.action.EmptyActionController;
import openfl.events.Event;

/**
	 * @author Przemysław Kapusta
	 */
class ExceptionControl implements IExceptionControl
{
    public var id(get, never) : String;
    public var name(get, never) : String;

    
    private var _id : String;
    private var _name : String;
    private var _action : ActionController;
    
    private var _onComplete : Function = null;
    
    public function new(id : String, name : String, action : ActionController = null)
    {
        _id = id;
        _name = name;
        if (action == null)
        {
            _action = new EmptyActionController();
        }
        else
        {
            _action = action;
        }
        _action.addEventListener(Event.COMPLETE, onActionComplete);
    }
    
    private function onActionComplete(e : Event) : Void
    {
        if (_onComplete != null)
        {
            _onComplete();
        }
        _onComplete = null;
    }
    
    private function get_id() : String
    {
        return _id;
    }
    
    private function get_name() : String
    {
        return _name;
    }
    
    public function doAction(onComplete : Function = null) : Void
    {
        _onComplete = onComplete;
        _action.doAction();
    }
}

