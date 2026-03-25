package pl.pkapusta.engine.common.exteption;

import pl.pkapusta.engine.common.exteption.event.ExceptionEvent;
import openfl.events.EventDispatcher;
import openfl.events.IEventDispatcher;

/**
	 * Exception manager for mainly cast exceptions. The ability to catch general errors and specify behavior in specific cases.
	 * 
	 * @author Przemysław Kapusta
	 */
class ExceptionManager extends EventDispatcher implements IExceptionManager
{
    public var autoDispatchException(get, set) : Bool;
    public var autoThrowException(get, set) : Bool;

    
    private static var instance : ExceptionManager = null;
    public static function getInstance() : ExceptionManager
    {
        if (instance != null)
        {
            return instance;
        }
        instance = new ExceptionManager();
        return instance;
    }
    
    public static function dispatchException(e : Exception) : Void
    {
        var em : ExceptionManager = ExceptionManager.getInstance();
        em.doDispatchException(e);
        em = null;
    }
    
    public static function Throw(e : Exception) : Void
    {
        var em : ExceptionManager = ExceptionManager.getInstance();
        em.doThrow(e);
        em = null;
    }
    
    private var _autoThrowException : Bool = false;
    private var _autoDispatchException : Bool = true;
    
    public function new()
    {
        super();
    }
    
    public function doDispatchException(e : Exception) : Void
    {
        dispatchEvent(new ExceptionEvent(ExceptionEvent.ON_EXCEPTION, e));
    }
    
    private function get_autoDispatchException() : Bool
    {
        return _autoDispatchException;
    }
    
    private function set_autoDispatchException(value : Bool) : Bool
    {
        _autoDispatchException = value;
        return value;
    }
    
    private function get_autoThrowException() : Bool
    {
        return _autoThrowException;
    }
    
    private function set_autoThrowException(value : Bool) : Bool
    {
        _autoThrowException = value;
        return value;
    }
    
    public function doThrow(e : Exception) : Void
    {
        if (_autoThrowException)
        {
            throw e;
        }
        else
        {
            switch (e.type) {
				case Exception.TYPE_INFO:
					infoToConsole(e);
				case Exception.TYPE_WARNING:
					warnToConsole(e);
				case Exception.TYPE_FATAL:
					errorToConsole(e);
			}
        }
    }
	
	private function infoToConsole(e : Exception):Void {
		untyped __js__("console.info({0}, {1}, {2})", "[ExceptionManager]: %s(); %o", e.message, e);
	}
	
	private function warnToConsole(e : Exception):Void {
		untyped __js__("console.warn({0}, {1}, {2})", "[ExceptionManager]: %s(); %o", e.message, e);
	}
	
	private function errorToConsole(e : Exception):Void {
		untyped __js__("console.error({0}, {1}, {2})", "[ExceptionManager]: %s(); %o", e.message, e);
	}
	
}

