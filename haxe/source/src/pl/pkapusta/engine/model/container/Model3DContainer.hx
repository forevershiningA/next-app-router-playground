package pl.pkapusta.engine.model.container;

import away3d.containers.ObjectContainer3D;
import pl.pkapusta.engine.common.interfaces.IDisposable;
import pl.pkapusta.engine.model.handlers.IHandler;
import openfl.events.Event;

/**
	 * @author Przemysław Kapusta
	 */
class Model3DContainer implements IDisposable
{
    public var contextContainer(get, never) : ObjectContainer3D;
    public var controlsContainer(get, never) : ObjectContainer3D;
    public var regionsContainer(get, never) : ObjectContainer3D;

    
    private var root : ObjectContainer3D;
    private var superRoot : ObjectContainer3D;
    private var _contextContainer : ObjectContainer3D;
    private var _controlsContainer : ObjectContainer3D;
    private var _regionsContainer : ObjectContainer3D;
    
    private var _handler : IHandler;
	
	private var _mouseContextEnabled: Bool = true;
    
    public function new()
    {
        superRoot = new ObjectContainer3D();
        root = new ObjectContainer3D();
        _controlsContainer = new ObjectContainer3D();
        _controlsContainer.mouseEnabled = true;
        _controlsContainer.mouseChildren = true;
        _regionsContainer = new ObjectContainer3D();
        root.addChild(_controlsContainer);
        root.addChild(_regionsContainer);
        superRoot.addChild(root);
        buildContextContainer();
    }
    
    public function dispose() : Void
    {
        if (superRoot != null)
        {
            if (root != null)
            {
                if (superRoot.contains(root))
                {
                    superRoot.removeChild(root);
                }
                if (root.contains(_contextContainer))
                {
                    root.removeChild(_contextContainer);
                }
                if (root.contains(_controlsContainer))
                {
                    root.removeChild(_controlsContainer);
                }
                if (root.contains(_regionsContainer))
                {
                    root.removeChild(_regionsContainer);
                }
                root.disposeWithChildren();
                root = null;
            }
            superRoot.disposeWithChildren();
            superRoot = null;
        }
        disposeContextContainer();
        if (_controlsContainer != null)
        {
            _controlsContainer.disposeWithChildren();
            _controlsContainer = null;
        }
        if (_regionsContainer != null)
        {
            _regionsContainer.disposeWithChildren();
            _regionsContainer = null;
        }
    }
    
    public function resetHandler() : Void
    {
        if (_handler == null)
        {
            return;
        }
        _handler.removeEventListener(Event.CHANGE, _handlerUpdate);
        _handler = null;
        root.moveTo(0, 0, 0);
        root.rotateTo(0, 0, 0);
    }
    
    public function useHandler(handler : IHandler) : Void
    {
        if (handler == null)
        {
            resetHandler();
        }
        _handler = handler;
        _handler.addEventListener(Event.CHANGE, _handlerUpdate);
        _handlerUpdate(null);
    }
    
    private function _handlerUpdate(e : Event) : Void
    {
        root.moveTo(-_handler.position.x, -_handler.position.y, -_handler.position.z);
        root.rotateTo(-_handler.rotation.x, -_handler.rotation.y, -_handler.rotation.z);
    }
    
    private function buildContextContainer() : Void
    {
        _contextContainer = new ObjectContainer3D();
        _contextContainer.mouseEnabled = _mouseContextEnabled;
        _contextContainer.mouseChildren = _mouseContextEnabled;
        root.addChild(_contextContainer);
    }
    
    private function disposeContextContainer() : Void
    {
        if (_contextContainer != null)
        {
            _contextContainer.disposeWithChildren();
            _contextContainer = null;
        }
    }
    
    public function resetContextContainer() : Void
    {
        disposeContextContainer();
        buildContextContainer();
    }
    
    private function get_contextContainer() : ObjectContainer3D
    {
        return _contextContainer;
    }
    
    private function get_controlsContainer() : ObjectContainer3D
    {
        return _controlsContainer;
    }
    
    private function get_regionsContainer() : ObjectContainer3D
    {
        return _regionsContainer;
    }
    
    public function getRoot() : ObjectContainer3D
    {
        return superRoot;
    }
	
	public function isMouseContextEnabled() : Bool {
		return _mouseContextEnabled;
	}
	
	public function setMouseContextEnabled(value: Bool):Bool {
		if (_mouseContextEnabled == value) return _mouseContextEnabled;
		if (_contextContainer != null) {
			_contextContainer.mouseEnabled = value;
			_contextContainer.mouseChildren = value;
		}
		_mouseContextEnabled = value;
		return _mouseContextEnabled;
	}
	
}

