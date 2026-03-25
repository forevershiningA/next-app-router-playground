package pl.pkapusta.engine.common.utils;

import haxe.Constraints.Function;

/**
	 * @author Przemysław Kapusta
	 */
class AsyncCall
{
    
    public static function callbackWithParams(callback : Function, params : Array<Dynamic>) : Any
    {
		if (callback == null) return null;
		return Reflect.callMethod(null, callback, params);
		
		//#old as3hx.Compat.getFunctionLength > not function error
		/*
        if (callback == null) return null;
        if (as3hx.Compat.getFunctionLength(callback) == params.length)
        {
            return Reflect.callMethod(null, callback, params);
        }
        else
        {
            var needParams : Array<Dynamic> = [];
            var i : Int = 0;
            while (i < as3hx.Compat.getFunctionLength(callback))
            {
                needParams.push(((i < params.length)) ? params[i] : null);
                i++;
            }
            return Reflect.callMethod(null, callback, needParams);
        }
		*/
    }
}

