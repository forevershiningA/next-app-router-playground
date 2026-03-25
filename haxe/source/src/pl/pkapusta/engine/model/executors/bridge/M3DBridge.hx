package pl.pkapusta.engine.model.executors.bridge;

import pl.pkapusta.engine.common.interfaces.IDisposable;
import pl.pkapusta.engine.model.events.Model3DPropertyEvent;
import pl.pkapusta.engine.model.IModel3D;
import pl.pkapusta.engine.model.Model3D;
import openfl.events.EventDispatcher;
import openfl.system.ApplicationDomain;

/**
	 * @author Przemysław Kapusta
	 */
class M3DBridge extends EventDispatcher implements IM3DBridge implements IDisposable
{
    
    private var model : IModel3D;
    
    private var _properties : Map<String, Dynamic>;
    private var _noContextProperties : Map<String, Dynamic>;
    
    public function new(model : IModel3D)
    {
        super();
        this.model = model;
        _properties = new Map<String, Dynamic>();
        _noContextProperties = new Map<String, Dynamic>();
    }
    
    public function dispatchPropertyChange(id : String, data : Dynamic, type : String) : Void
    {
        _properties.set(id, data);
        if (type != "init")
        {
            model.dispatchEvent(new Model3DPropertyEvent(Model3DPropertyEvent.CHANGE, id, data));
        }
    }
    
    public function getProperty(id : String) : Dynamic
    {
        if (_properties.exists(id))
        {
            return _properties.get(id);
        }
        return null;
    }
    
    public function setNoContextProperty(id : String, data : Dynamic) : Void
    {
        _noContextProperties.set(id, data);
    }
    
    public function getNoContextProperty(id : String) : Dynamic
    {
        if (_noContextProperties.exists(id))
        {
            return _noContextProperties.get(id);
        }
        return null;
    }
    
    public function moveNoContextPropertiesToContext() : Void
    {
        for (propertyId in _noContextProperties.keys())
        {
            model.changeProperty(propertyId, _noContextProperties.get(propertyId));
        }
        _noContextProperties = new Map<String, Dynamic>();
    }
    
    public function moveContextPropertiesToNoContext() : Void
    {
        for (propertyId in _properties.keys())
        {
            _noContextProperties.set(propertyId, _properties.get(propertyId));
        }
        _properties = new Map<String, Dynamic>();
    }
    
    public function dispose() : Void
    {
        model = null;
        _properties = null;
        _noContextProperties = null;
    }
}

