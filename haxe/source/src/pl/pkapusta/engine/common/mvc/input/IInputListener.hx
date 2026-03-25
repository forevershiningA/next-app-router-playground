package pl.pkapusta.engine.common.mvc.input;

import pl.pkapusta.engine.common.mvc.IController;
import openfl.events.IEventDispatcher;

/**
	 * Simple Interface of Input Listener
	 * @author Przemysław Kapusta; Realis | Interactive & Multimedia Agency (realis.pl)
	 */
interface IInputListener extends IEventDispatcher
{

    function setController(controller : IController)
    ;
    function getController() : IController
    ;
    function destroy() : Void
    ;
}

