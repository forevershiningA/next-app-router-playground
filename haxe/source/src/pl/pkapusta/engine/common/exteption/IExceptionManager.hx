package pl.pkapusta.engine.common.exteption;

import openfl.events.IEventDispatcher;

/**
	 * @author Przemysław Kapusta
	 */
interface IExceptionManager extends IEventDispatcher
{
    
    
    var autoDispatchException(get, set) : Bool;

    function doDispatchException(e : Exception) : Void;
}

