package pl.pkapusta.engine.common.exteption.control;

import haxe.Constraints.Function;

/**
	 * @author Przemysław Kapusta
	 */
interface IExceptionControl
{
    
    var id(get, never) : String;    
    var name(get, never) : String;

    function doAction(onComplete : Function = null) : Void
    ;
}

