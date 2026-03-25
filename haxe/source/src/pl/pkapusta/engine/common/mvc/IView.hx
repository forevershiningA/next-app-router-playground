package pl.pkapusta.engine.common.mvc;

import openfl.events.IEventDispatcher;

/**
	 * Simple interface of View MCV pattern
	 * @author Przemysław Kapusta; Realis | Interactive & Multimedia Agency (realis.pl)
	 */
interface IView extends IEventDispatcher
{

    function addView(view : IView) : Void
    ;
    function removeView(view : IView) : Void
    ;
    function contains(view : IView) : Bool
    ;
    function setModel(model : IModel) : Void
    ;
    function getModel() : IModel
    ;
    function setController(controller : IController) : Void
    ;
    function getController() : IController
    ;
    function destroy() : Void
    ;
}

