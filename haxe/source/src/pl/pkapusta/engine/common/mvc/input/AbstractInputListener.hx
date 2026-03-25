package pl.pkapusta.engine.common.mvc.input;

import openfl.errors.Error;
import pl.pkapusta.engine.common.mvc.IController;
import openfl.events.EventDispatcher;

/**
	 * Abstract Input Listener class
	 * @author Przemysław Kapusta; Realis | Interactive & Multimedia Agency (realis.pl)
	 */
class AbstractInputListener extends EventDispatcher implements IInputListener
{
    private var controller : IController;
    
    public function new(controller : IController)
    {
        super();
        if (controller == null)
        {
            throw new Error("You must define controller in constructor");
        }
        this.controller = controller;
    }
    
    /* INTERFACE pl.hypermedia.projects.source.dawnTrader.common.mvc.input.IInputListener */
    
    public function setController(controller : IController)
    {
        if (controller == null)
        {
            throw new Error("You must define controller");
        }
        this.controller = controller;
    }
    
    public function getController() : IController
    {
        return controller;
    }
    
    public function destroy() : Void
    {
        controller = null;
    }
}

