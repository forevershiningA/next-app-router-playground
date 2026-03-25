package pl.pkapusta.engine.model.executors.file.proxies;

import pl.pkapusta.engine.common.interfaces.IDisposable;
import pl.pkapusta.engine.model.IModel3D;
import pl.pkapusta.engine.model.regions.*;

/**
 * @author Przemysław Kapusta
 */
class Model3DProxy implements IModel3DProxy
{
    private var _model : IModel3D;
    
    private var _regionProxy : IRegionProxy;
    private var _selectionProxy : ISelectionProxy;
    private var _handlers : IHandlerCollectionProxy;
    private var _regionProxyDict : Map<String, IRegionProxy>;
    
    public function new(model : IModel3D)
    {
        _model = model;
        _regionProxyDict = new Map<String, IRegionProxy>();
    }
    
    public function getDescription() : FastXML
    {
        return _model.getDescription();
    }
    
    public function getVersion() : Int
    {
        return _model.getVersion();
    }
    
    public function isReady() : Bool
    {
        return _model.isReady();
    }
    
    public function isContextReady() : Bool
    {
        return _model.isContextReady();
    }
    
    public function changeProperty(id : String, value : Dynamic) : Void
    {
        _model.changeProperty(id, value);
    }
    
    public function getProperty(id : String) : Dynamic
    {
        return _model.getProperty(id);
    }
    
    public function getInfo(type : String) : Dynamic
    {
        return _model.getInfo(type);
    }
    
    public function getGeneralType() : String
    {
        return _model.getGeneralType();
    }
    
    //public function get region():IRegionProxy {
    //	if (!_regionProxy) _regionProxy = RegionProxy.factory(_model.regionPosition);
    //	return _regionProxy;
    //}
    
    //public function getCollisionShape(name:String):AbstractCollisionShape {
    //	return _model.getCollisionShape(name);
    //}
    
    public function getRegion(id : String) : IRegionProxy
    {
        if (_regionProxyDict.exists(id)) {
            return _regionProxyDict.get(id);
        }
        else
        {
            var rp : IRegionProxy = RegionProxy.factory(try cast(_model.getRegion(id), AbstractRegion) catch(e:Dynamic) null);
            _regionProxyDict.set(id, rp);
            return rp;
        }
    }
    
    public function isSelected() : Bool
    {
        return _model.isSelected();
    }
    
    public function setSelected(value : Bool) : Bool
    {
        _model.setSelected(value);
        return value;
    }
    
    public function getSelectionObject() : ISelectionProxy
    {
        if (_selectionProxy == null)
        {
            _selectionProxy = SelectionProxy.factory(_model.getSelectionObject());
        }
        return _selectionProxy;
    }
    
    public function getHandlers() : IHandlerCollectionProxy
    {
        if (_handlers == null)
        {
            _handlers = new HandlerCollectionProxy(_model.getHandlers());
        }
        return _handlers;
    }
    
    public function getExtraData() : FastXML
    {
        return _model.getExtraData();
    }
    
    public function hasProperty(id : String) : Bool
    {
        return _model.hasProperty(id);
    }
    
    public function getBaseInstance() : Dynamic
    {
        return _model;
    }
    
    public function dispose() : Void
    {
        _model = null;
        if (_regionProxy != null)
        {
            _regionProxy.dispose();
            _regionProxy = null;
        }
        if (_selectionProxy != null)
        {
            _selectionProxy.dispose();
            _selectionProxy = null;
        }
        if (_handlers != null)
        {
            _handlers.dispose();
            _handlers = null;
        }
        if (_regionProxyDict != null)
        {
            for (proxy in _regionProxyDict)
            {
				proxy.dispose();
            }
            _regionProxyDict = null;
        }
    }
}

