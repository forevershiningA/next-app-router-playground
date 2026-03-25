package pl.pkapusta.engine.project.data.triggers.response;

import haxe.Constraints.Function;
import pl.pkapusta.engine.common.utils.AsyncCall;

/**
	 * @author Przemysław Kapusta
	 */
class TriggerResponse implements ITriggerResponse
{
    
    private var _responseCallback : Function;
    private var _failCallback : Function;
    private var _callbackArgs : Array<Dynamic>;
    
    private var _returned : Bool = false;
    
    public function new(responseCallback : Function, failCallback : Function, callbackArgs : Array<Dynamic>)
    {
        _responseCallback = responseCallback;
        _failCallback = failCallback;
        _callbackArgs = ((callbackArgs != null)) ? callbackArgs : [];
    }
    
    public function returnResponse(data : Dynamic) : Void
    {
        if (_returned)
        {
            return;
        }
        _failCallback = null;
        var cb : Function = _responseCallback;
        _responseCallback = null;
        var args : Array<Dynamic> = _callbackArgs;
        args.unshift(data);
        AsyncCall.callbackWithParams(cb, args);
    }
    
    public function returnFail(message : String) : Void
    {
        if (_returned)
        {
            return;
        }
        _responseCallback = null;
        var cb : Function = _failCallback;
        _failCallback = null;
        var args : Array<Dynamic> = _callbackArgs;
        args.unshift(message);
        AsyncCall.callbackWithParams(cb, args);
    }
}

