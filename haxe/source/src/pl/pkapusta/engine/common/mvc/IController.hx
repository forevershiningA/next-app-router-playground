package pl.pkapusta.engine.common.mvc;

import openfl.events.IEventDispatcher;

/**
	 * Simple Interface of Conproller MVC Pattern 
	 * @author Przemysław Kapusta; Realis | Interactive & Multimedia Agency (realis.pl)
	 */
interface IController extends IEventDispatcher
{

    function registerView(view : IView) : Void
    ;
    function unregisterView(view : IView) : Void
    ;
    function hasRegisteredView(view : IView) : Bool
    ;
    function setModel(model : IModel) : Void
    ;
    function getModel() : IModel
    ;
    function destroy() : Void
    ;
    function destroyAllMvc(withModel : Bool = true) : Void
    ;
}

