package pl.pkapusta.engine.common.mvc;

import openfl.errors.Error;
import haxe.Constraints.Function;
import pl.pkapusta.engine.common.exteption.predefined.AbstractMethodException;
import openfl.events.EventDispatcher;

/**
	 * Abstract View class for MVC pattern
	 * @author Przemysław Kapusta; Realis | Interactive & Multimedia Agency (realis.pl)
	 */
class AbstractView extends EventDispatcher implements IView
{
    public var enabled(get, set) : Bool;

    private var _model : IModel;
    private var _controller : IController;
    
    private var _enabled : Bool = true;
    
    private var _childs : Map<IView, Bool>;
    
    public function new(model : IModel = null, controller : IController = null)
    {
        super();
        _childs = new Map<IView, Bool>();
        setModel(model);
        setController(controller);
    }
    
    public function addView(view : IView) : Void
    {
        if (!_childs.exists(view))
        {
            _childs.set(view, true);
            view.setModel(_model);
            view.setController(_controller);
        }
    }
    
    public function removeView(view : IView) : Void
    {
        if (!_childs.exists(view))
        {
            throw new Error("View don't contains this child view");
        }
        view.setModel(null);
        view.setController(null);
        _childs.remove(view);
    }
    
    public function contains(view : IView) : Bool
    {
        return _childs.exists(view);
    }
    
    public function setModel(model : IModel) : Void
    {
        if (_model != null)
        {
            unregisterModelListeners(_model);
            _model.unregisterView(this);
        }
        _model = null;
        if (model != null)
        {
            _model = model;
            _model.registerView(this);
            registerModelListeners(_model);
            everyChild(function(child : IView)
                    {
                        child.setModel(model);
                    });
        }
    }
    
    public function getModel() : IModel
    {
        return _model;
    }
    
    public function setController(controller : IController) : Void
    {
        if (_controller != null)
        {
            unregisterControllerListeners(_controller);
            _controller.unregisterView(this);
        }
        _controller = null;
        if (controller != null)
        {
            _controller = controller;
            _controller.registerView(this);
            registerControllerListeners(_controller);
            everyChild(function(child : IView)
                    {
                        child.setController(controller);
                    });
        }
    }
    
    public function getController() : IController
    {
        return _controller;
    }
    
    public function destroy() : Void
    {
        if (_model != null)
        {
            unregisterModelListeners(_model);
            _model.unregisterView(this);
            _model = null;
        }
        if (_controller != null)
        {
            unregisterControllerListeners(_controller);
            _controller.unregisterView(this);
            _controller = null;
        }
    }
    
    private function get_enabled() : Bool
    {
        return _enabled;
    }
    
    private function set_enabled(value : Bool) : Bool
    {
        if (_enabled == value)
        {
            return value;
        }
        _enabled = value;
        if (_enabled)
        {
            if (_model != null)
            {
                registerModelListeners(_model);
            }
            if (_controller != null)
            {
                registerControllerListeners(_controller);
            }
        }
        else
        {
            if (_controller != null)
            {
                unregisterControllerListeners(_controller);
            }
            if (_model != null)
            {
                unregisterModelListeners(_model);
            }
        }
        return value;
    }
    
    private function everyChild(call : Function) : Void
    {
        for (child in _childs.keys())
        {
            Reflect.callMethod(null, call, [child]);
        }
    }
    
    /* PROTECTED methods to override */
    
    private function registerModelListeners(model : IModel) : Void
    //throw new Error("This function must be overrided");
    {
        
        throw new AbstractMethodException();
    }
    private function unregisterModelListeners(model : IModel) : Void
    //throw new Error("This function must be overrided");
    {
        
        throw new AbstractMethodException();
    }
    
    private function registerControllerListeners(controller : IController) : Void
    //throw new Error("This function must be overrided");
    {
        
        throw new AbstractMethodException();
    }
    private function unregisterControllerListeners(controller : IController) : Void
    //throw new Error("This function must be overrided");
    {
        
        throw new AbstractMethodException();
    }
}

