package pl.pkapusta.engine.common.mvc;

import openfl.events.IEventDispatcher;

/**
	 * Simple interface of Model MVC Pattern 
	 * @author Przemysław Kapusta; Realis | Interactive & Multimedia Agency (realis.pl)
	 */
interface IModel extends IEventDispatcher
{

    function registerView(view : IView) : Void
    ;
    function unregisterView(view : IView) : Void
    ;
    function hasRegisteredView(view : IView) : Bool
    ;
    function destroy() : Void
    ;
    function destroyWithAllViews() : Void
    ;
}

