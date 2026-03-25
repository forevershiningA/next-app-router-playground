package pl.pkapusta.engine.model.executors.file;

import away3d.containers.ObjectContainer3D;
import openfl.events.EventDispatcher;
import pl.pkapusta.engine.common.interfaces.IDisposable;
import pl.pkapusta.engine.common.interfaces.IParamStorage;
import pl.pkapusta.engine.globals.IGlobals;
import pl.pkapusta.engine.model.data.common.IFlashObjectAsset;
import pl.pkapusta.engine.model.data.common.IObject3DAsset;
import pl.pkapusta.engine.model.data.common.ITextureAsset;
import pl.pkapusta.engine.model.data.common.IUndefinedAsset;
import pl.pkapusta.engine.model.data.IModel3DData;
import pl.pkapusta.engine.model.executors.bridge.IM3DBridge;
import pl.pkapusta.engine.model.executors.file.proxies.IModel3DProxy;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.model.executors.file.M3DBasicExecutor")
class M3DBasicExecutor extends EventDispatcher implements IDisposable
{
    public var definition(get, never) : FastXML;
    public var version(get, never) : Int;
    public var container(get, never) : ObjectContainer3D;
    public var model(get, never) : IModel3DProxy;
    public var sharedData(get, never) : IParamStorage;

    
    private var DISPATCH_PROPERTY_TYPE_INIT(default, never) : String = "init";
    private var DISPATCH_PROPERTY_TYPE_INTERNAL(default, never) : String = "internal";
    private var DISPATCH_PROPERTY_TYPE_EXTERNAL(default, never) : String = "external";
    
    private var _container : ObjectContainer3D;
    private var _model : IModel3DProxy;
    private var _data : IModel3DData;
    private var _sharedData : IParamStorage;
	private var _globals: IGlobals;
    private var _bridge : IM3DBridge;
    
    public function initData(container : ObjectContainer3D, model : IModel3DProxy, data : IModel3DData, sharedData : IParamStorage, globals: IGlobals, bridge : IM3DBridge) : Void
    {
        _container = container;
        _model = model;
        _data = data;
        _sharedData = sharedData;
		_globals = globals;
        _bridge = bridge;
    }
    
    private function get_definition() : FastXML
    {
        return _data.definition;
    }
    
    private function get_version() : Int
    {
        return _data.version;
    }
    
    public function getObject3DAsset(id : String) : IObject3DAsset
    {
        return _data.getObject3DAsset(id);
    }
    
    public function getTextureAsset(id : String) : ITextureAsset
    {
        return _data.getTextureAsset(id);
    }
    
    public function getFlashObjectAsset(id : String) : IFlashObjectAsset
    {
        return _data.getFlashObjectAsset(id);
    }
    
    public function getUndefinedAsset(id : String) : IUndefinedAsset
    {
        return _data.getUndefinedAsset(id);
    }
    
    private function get_container() : ObjectContainer3D
    {
        return _container;
    }
    
    private function get_model() : IModel3DProxy
    {
        return _model;
    }
    
    private function get_sharedData() : IParamStorage
    {
        return _sharedData;
    }
	
	public function getGlobals(): IGlobals {
		return _globals;
	}
    
    public function dispatchPropertyChange(id : String, data : Dynamic, type : String) : Void
    {
        _bridge.dispatchPropertyChange(id, data, type);
    }
    
    public function dispose() : Void
    {
        _container = null;
        _model = null;
        _data = null;
        _sharedData = null;
		_globals = null;
        _bridge = null;
    }

    public function new()
    {
        super();
    }
}

