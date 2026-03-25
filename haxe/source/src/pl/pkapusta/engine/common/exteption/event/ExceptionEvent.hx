package pl.pkapusta.engine.common.exteption.event;

import pl.pkapusta.engine.common.exteption.Exception;
import openfl.events.Event;

/**
	 * @author Przemysław Kapusta
	 */
class ExceptionEvent extends Event
{
    public var exception(get, never) : Exception;

    
    public static inline var ON_EXCEPTION : String = "onException";
    
    private var _exception : Exception;
    
    public function new(type : String, exception : Exception, bubbles : Bool = false, cancelable : Bool = false)
    {
        super(type, bubbles, cancelable);
        _exception = exception;
    }
    
    override public function clone() : Event
    {
        return new ExceptionEvent(type, _exception, bubbles, cancelable);
    }
    
    override public function toString() : String
    {
        return formatToString("ExceptionEvent", "type", "bubbles", "cancelable", "eventPhase");
    }
    
    private function get_exception() : Exception
    {
        return _exception;
    }
}

