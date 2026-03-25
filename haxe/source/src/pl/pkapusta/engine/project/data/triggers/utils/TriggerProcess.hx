package pl.pkapusta.engine.project.data.triggers.utils;

import openfl.errors.Error;
import haxe.Constraints.Function;
import pl.pkapusta.engine.common.utils.AsyncCall;
import pl.pkapusta.engine.project.data.IProjectContext;
import pl.pkapusta.engine.project.data.structure.ElementDataHolder;
import pl.pkapusta.engine.project.data.triggers.IResourceLoadTrigger;
import pl.pkapusta.engine.project.data.triggers.response.TriggerResponse;

/**
	 * @author Przemysław Kapusta
	 */
class TriggerProcess
{
    
    public static function resourceLoadTriggerProcess(trigger : IResourceLoadTrigger, context : IProjectContext, resourceType : String, dataHolder : Dynamic, responseCallback : Function, failCallback : Function, callbackArgs : Array<Dynamic> = null) : Bool
    {
        if (trigger == null)
        {
            return false;
        }
        try
        {
            //#AS3 trigger.process(resourceType, ElementDataHolder.e3d::factory(dataHolder, context), new TriggerResponse(responseCallback, failCallback, callbackArgs));
            trigger.process(resourceType, ElementDataHolder.factory(dataHolder, context), new TriggerResponse(responseCallback, failCallback, callbackArgs));
        }
        catch (e : Error)
        {
            trace("Error while trigger " + trigger.resourceType + " executing!");
            trace(e.getStackTrace());
            var args : Array<Dynamic> = [e.message];
            var i : Int = 0;
            while (i < callbackArgs.length)
            {
                args.push(callbackArgs[i]);
                i++;
            }
            AsyncCall.callbackWithParams(failCallback, args);
        }
        return true;
    }

    public function new()
    {
    }
}

