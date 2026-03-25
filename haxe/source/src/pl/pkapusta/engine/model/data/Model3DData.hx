package pl.pkapusta.engine.model.data;

import openfl.errors.Error;
import away3d.loaders.parsers.Parsers;
import pl.pkapusta.engine.common.exteption.ExceptionManager;
import pl.pkapusta.engine.common.interfaces.IDisposable;
import pl.pkapusta.engine.common.interfaces.IParamStorage;
import pl.pkapusta.engine.common.utils.storage.ParamStorage;
import pl.pkapusta.engine.model.data.common.FlashObjectAsset;
import pl.pkapusta.engine.model.data.common.IFlashObjectAsset;
import pl.pkapusta.engine.model.data.common.IObject3DAsset;
import pl.pkapusta.engine.model.data.common.ITextureAsset;
import pl.pkapusta.engine.model.data.common.IUndefinedAsset;
import pl.pkapusta.engine.model.data.common.Object3DAsset;
import pl.pkapusta.engine.model.data.common.ParserModel3DAsset;
import pl.pkapusta.engine.model.data.common.TextureAsset;
import pl.pkapusta.engine.model.data.common.UndefinedAsset;
import pl.pkapusta.engine.model.data.exceptions.ModelAssetExecutorException;
import pl.pkapusta.engine.model.data.exceptions.ModelExecutorException;
import pl.pkapusta.engine.model.data.parsers.Model3DParser;
import pl.pkapusta.engine.model.executors.file.IM3DExecutor;
import openfl.display.Loader;
import openfl.display.LoaderInfo;
import openfl.events.Event;
import openfl.events.EventDispatcher;
import openfl.events.IOErrorEvent;
import openfl.system.ApplicationDomain;
import openfl.system.LoaderContext;
import openfl.utils.ByteArray;
import away3d.events.Asset3DEvent;
import away3d.events.LoaderEvent;
import away3d.library.assets.IAsset;
import away3d.loaders.Loader3D;
import away3d.loaders.misc.AssetLoaderContext;



import pl.pkapusta.engine.model.data.exceptions.ModelAssetBuildFlashObjectException;
import pl.pkapusta.engine.model.data.exceptions.ModelAssetBuildTextureException;

import pl.pkapusta.engine.model.executors.file.asset.IModel3DAssetExecutor;
import openfl.display.AVM1Movie;
import openfl.display.Bitmap;
import openfl.display.BitmapData;
import openfl.display.DisplayObject;


import openfl.display.MovieClip;







/**
	 * @author Przemysław Kapusta
	 */
class Model3DData extends EventDispatcher implements IModel3DData implements IDisposable
{
    public var definition(get, never) : FastXML;
    public var version(get, never) : Int;
    public var byteAssets(get, never) : Array<ParserModel3DAsset>;
    public var object3DAssetsList(get, never) : Array<IObject3DAsset>;
    public var textureAssetsList(get, never) : Array<ITextureAsset>;
    public var flashObjectAssetsList(get, never) : Array<IFlashObjectAsset>;
    public var undefinedAssetsList(get, never) : Array<IUndefinedAsset>;
    public var executor(get, never) : IM3DExecutor;
    public var executorSharedData(get, never) : IParamStorage;
	
	@:allow(pl.pkapusta.engine.model.Model3D)
    private var binaryData(get, never) : ByteArray;

    
    private var _parser : Model3DParser;
    
    private var _objectBuilders : Array<Object3DBuilder>;
    private var _testureBuilders : Array<TextureBuilder>;
    private var _flashObjectBuilders : Array<FlashObjectBuilder>;
    
    private var _buildCount : Int = 0;
    
    private var _executorSharedData : IParamStorage;
    
    private var _object3DAssetsList : Array<IObject3DAsset>;
    private var _object3DAssetsDictionary : Map<String, IObject3DAsset>;
    
    private var _testureAssetsList : Array<ITextureAsset>;
    private var _testureAssetsDictionary : Map<String, ITextureAsset>;
    
    private var _flashObjectAssetsList : Array<IFlashObjectAsset>;
    private var _flashObjectAssetsDictionary : Map<String, IFlashObjectAsset>;
    
    private var _undefinedAssetsList : Array<IUndefinedAsset>;
    private var _undefinedAssetsDictionary : Map<String, IUndefinedAsset>;
    
    private var _executor : IM3DExecutor;
    private var _executorBuildComplete : Bool = false;
    
    private var _binaryData : ByteArray;
    
    public function new(modelData : ByteArray)
    {
        super();
        _binaryData = modelData;
        _parser = new Model3DParser();
        modelData.position = 0;
        _parser.readStream(modelData);
        if (!_parser.success) {
        
			//run asynchronous event and stop work
            
            as3hx.Compat.setTimeout(function()
                    {
                        dispatchEvent(new Event("error"));
                    }, 1);
            return;
        }
        else
        {
            as3hx.Compat.setTimeout(function()
                    //dispatchEvent(new Event(Event.COMPLETE));
                    {
                        
                        buildObjects();
                    }, 1);
        }
    }
    
    private function buildObjects() : Void
    {
        _executorSharedData = new ParamStorage();
        Parsers.enableAllBundled();
        _buildCount = 0;
        _objectBuilders = new Array<Object3DBuilder>();
        _testureBuilders = new Array<TextureBuilder>();
        _flashObjectBuilders = new Array<FlashObjectBuilder>();
        _undefinedAssetsList = new Array<IUndefinedAsset>();
        _undefinedAssetsDictionary = new Map<String, IUndefinedAsset>();
        var i : Int = 0;
        while (i < _parser.assets.length) {
        
			//trace("_parser.assets[" + i + "]");
            
            if (_parser.assets[i].type == ParserModel3DAsset.TYPE_3D_OBJECT)
            {
                var builder : Object3DBuilder = new Object3DBuilder(_parser.assets[i], _executorSharedData);
                builder.addEventListener(Event.COMPLETE, builderBuildComplete);
                builder.build();
                _objectBuilders.push(builder);
            }
            else if (_parser.assets[i].type == ParserModel3DAsset.TYPE_TEXTURE)
            {
                var tb : TextureBuilder = new TextureBuilder(_parser.assets[i]);
                tb.addEventListener(Event.COMPLETE, builderBuildComplete);
                tb.build();
                _testureBuilders.push(tb);
            }
            else if (_parser.assets[i].type == ParserModel3DAsset.TYPE_FLASH_OBJECT)
            {
                var fb : FlashObjectBuilder = new FlashObjectBuilder(_parser.assets[i]);
                fb.addEventListener(Event.COMPLETE, builderBuildComplete);
                fb.build();
                _flashObjectBuilders.push(fb);
            }
            else if (_parser.assets[i].type == ParserModel3DAsset.TYPE_UNDEFINED)
            {
                var ud : IUndefinedAsset = new UndefinedAsset(_parser.assets[i].id, _parser.assets[i].data);
                _undefinedAssetsList.push(ud);
                _undefinedAssetsDictionary.set(ud.id, ud);
            }
            i++;
        }
        if (_parser.executor == null)
        {
            _executorBuildComplete = true;
        }
        else
        {
			_executor = ExecutorJS.createInstanceFromJS(_parser.executor.readUTFBytes(_parser.executor.length), IM3DExecutor);
			_executorBuildComplete = true;
        }
        if ((_objectBuilders.length + _testureBuilders.length == 0) && (_executorBuildComplete))
        {
            completeAllBuilders();
        }
    }
    
    private function builderBuildComplete(e : Event) : Void
    {
        _buildCount++;
        if ((_buildCount >= _objectBuilders.length + _testureBuilders.length + _flashObjectBuilders.length) && (_executorBuildComplete))
        {
            completeAllBuilders();
        }
    }
    
    private function completeAllBuilders() : Void
    {
        _object3DAssetsList = new Array<IObject3DAsset>();
        _object3DAssetsDictionary = new Map<String, IObject3DAsset>();
        var i : Int = 0;
        while (i < _objectBuilders.length) {
			//trace(_objectBuilders);
            
            if (_objectBuilders[i].ready)
            {
                var oa : IObject3DAsset = new Object3DAsset(_objectBuilders[i].asset.id, _objectBuilders[i].loader, _objectBuilders[i].builded);
                _object3DAssetsList.push(oa);
                _object3DAssetsDictionary.set(oa.id, oa);
            }
            i++;
        }
        _testureAssetsList = new Array<ITextureAsset>();
        _testureAssetsDictionary = new Map<String, ITextureAsset>();
        var j : Int = 0;
        while (j < _testureBuilders.length)
        {
            if (_testureBuilders[j].ready)
            {
                var ta : ITextureAsset = new TextureAsset(_testureBuilders[j].asset.id, _testureBuilders[j].data);
                _testureAssetsList.push(ta);
                _testureAssetsDictionary.set(ta.id, ta);
            }
            j++;
        }
        
        _flashObjectAssetsList = new Array<IFlashObjectAsset>();
        _flashObjectAssetsDictionary = new Map<String, IFlashObjectAsset>();
        var k : Int = 0;
        while (k < _flashObjectBuilders.length)
        {
            if (_flashObjectBuilders[k].ready)
            {
                var fa : IFlashObjectAsset = new FlashObjectAsset(_flashObjectBuilders[k].asset.id, _flashObjectBuilders[j].data);
                _flashObjectAssetsList.push(fa);
                _flashObjectAssetsDictionary.set(fa.id, fa);
            }
            k++;
        }
        
        //trace("completeAllBuilders");
        dispatchEvent(new Event(Event.COMPLETE));
    }
    
    private function get_definition() : FastXML
    {
        return _parser.definition;
    }
    
    private function get_version() : Int
    {
        return _parser.version;
    }
    
    private function get_byteAssets() : Array<ParserModel3DAsset>
    {
        return _parser.assets;
    }
    
    private function get_object3DAssetsList() : Array<IObject3DAsset>
    {
        return _object3DAssetsList;
    }
    
    private function get_textureAssetsList() : Array<ITextureAsset>
    {
        return _testureAssetsList;
    }
    
    private function get_flashObjectAssetsList() : Array<IFlashObjectAsset>
    {
        return _flashObjectAssetsList;
    }
    
    private function get_undefinedAssetsList() : Array<IUndefinedAsset>
    {
        return _undefinedAssetsList;
    }
    
    private function get_executor() : IM3DExecutor
    {
        return _executor;
    }
    
    private function get_executorSharedData() : IParamStorage
    {
        return _executorSharedData;
    }
    
    private function get_binaryData() : ByteArray
    {
        return _binaryData;
    }
    
    public function getObject3DAsset(id : String) : IObject3DAsset
    {
        if (_object3DAssetsDictionary.exists(id))
        {
            return _object3DAssetsDictionary.get(id);
        }
        return null;
    }
    
    public function getTextureAsset(id : String) : ITextureAsset
    {
        if (_testureAssetsDictionary.exists(id))
        {
            return _testureAssetsDictionary.get(id);
        }
        return null;
    }
    
    public function getFlashObjectAsset(id : String) : IFlashObjectAsset
    {
        if (_flashObjectAssetsDictionary.exists(id))
        {
            return _flashObjectAssetsDictionary.get(id);
        }
        return null;
    }
    
    public function getUndefinedAsset(id : String) : IUndefinedAsset
    {
        if (_undefinedAssetsDictionary.exists(id))
        {
            return _undefinedAssetsDictionary.get(id);
        }
        return null;
    }
    
    public function dispose() : Void
    {
        var i : Int;
        if (_binaryData != null)
        {
            _binaryData.clear();
            _binaryData = null;
        }
        if (_parser != null)
        {
            _parser.dispose();
            _parser = null;
        }
        _objectBuilders = null;
        _testureBuilders = null;
        _flashObjectBuilders = null;
        if (_executorSharedData != null && Std.is(_executorSharedData, IDisposable))
        {
            cast((_executorSharedData), IDisposable).dispose();
            _executorSharedData = null;
        }
        if (_object3DAssetsList != null)
        {
            i = 0;
            while (i < _object3DAssetsList.length)
            {
                cast((_object3DAssetsList[i]), IDisposable).dispose();
                i++;
            }
            _object3DAssetsList = null;
        }
        if (_testureAssetsList != null)
        {
            i = 0;
            while (i < _testureAssetsList.length)
            {
                cast((_testureAssetsList[i]), IDisposable).dispose();
                i++;
            }
            _testureAssetsList = null;
        }
        if (_flashObjectAssetsList != null)
        {
            i = 0;
            while (i < _flashObjectAssetsList.length)
            {
                cast((_flashObjectAssetsList[i]), IDisposable).dispose();
                i++;
            }
            _flashObjectAssetsList = null;
        }
        if (_undefinedAssetsList != null)
        {
            i = 0;
            while (i < _undefinedAssetsList.length)
            {
                cast((_undefinedAssetsList[i]), IDisposable).dispose();
                i++;
            }
            _undefinedAssetsList = null;
        }
        _object3DAssetsDictionary = null;
        _testureAssetsDictionary = null;
        _flashObjectAssetsDictionary = null;
        _undefinedAssetsDictionary = null;
        _executor = null;
        _buildCount = 0;
    }
}



class Object3DBuilder extends EventDispatcher
{
    public var ready(get, never) : Bool;
    public var builded(get, never) : Map<String, Array<IAsset>>;
    public var asset(get, never) : ParserModel3DAsset;
    public var loader(get, never) : Loader3D;

    
    private var _asset : ParserModel3DAsset;
    
    private var _ready : Bool = false;
    private var _builded : Map<String, Array<IAsset>> = null;
    
    private var _executorSharedData : IParamStorage;
    
    private var _executor : IModel3DAssetExecutor;
    
    private var _loader : Loader3D;
    
    public function new(asset : ParserModel3DAsset, executorSharedData : IParamStorage)
    {
        super();
        _asset = asset;
        _executorSharedData = executorSharedData;
    }
    
    public function build() : Void
    {
        if (_asset.executor != null) {
            buildExecutor();
        }
        buildObject3D();
    }
    
    private function buildExecutor() : Void
    {
		_executor = ExecutorJS.createInstanceFromJS(_asset.executor.readUTFBytes(_asset.executor.length), IModel3DAssetExecutor);
    }
    
    private function buildObject3D() : Void
    {
        _loader = new Loader3D();
		//#WARN was AssetEvent (not Asset3DEvent)
        _loader.addEventListener(Asset3DEvent.ASSET_COMPLETE, onAssetComplete);
        _loader.addEventListener(LoaderEvent.LOAD_ERROR, onLoadError);
        _loader.addEventListener(LoaderEvent.RESOURCE_COMPLETE, onLoadComplete);
        var assetLoaderContext : AssetLoaderContext = new AssetLoaderContext();
        assetLoaderContext.includeDependencies = false;
        if (_executor != null)
        {
            try
            {
                _executor.setAssetLoaderContext(assetLoaderContext, loader, _asset.id, _executorSharedData);
            }
            catch (e : Error)
            {
                ExceptionManager.Throw(new ModelAssetExecutorException());
            }
            _loader.loadData(_asset.data, assetLoaderContext);
        }
        else
        {
            _loader.loadData(_asset.data, assetLoaderContext);
        }
    }
    
    private function onLoadComplete(e : LoaderEvent) : Void
    {
        if (_executor != null)
        {
            try
            {
                _executor.setupAllAssets(_builded, _asset.id, _executorSharedData);
            }
            catch (e : Error)
            {
                ExceptionManager.Throw(new ModelAssetExecutorException());
            }
        }
        _ready = true;
        dispatchEvent(new Event(Event.COMPLETE));
    }
    
    private function onLoadError(e : LoaderEvent) : Void
    {
        if (e.isDependency)
        {
            trace("Dependency asset load error! Message: " + e.message + " URL: " + e.url);
        }
        else
        {
            _ready = false;
            _builded = null;
            dispatchEvent(new Event(Event.COMPLETE));
        }
    }
    
	//#WARN was AssetEvent (not Asset3DEvent)
    private function onAssetComplete(e : Asset3DEvent) : Void
    {
        if (_builded == null)
        {
            _builded = new Map<String, Array<IAsset>>();
        }
        if (!(_builded.exists(e.asset.assetType)))
        {
            _builded.set(e.asset.assetType, new Array<IAsset>());
        }
        var list : Array<IAsset> = _builded.get(e.asset.assetType);
        list.push(e.asset);
        if (_executor != null)
        {
            try
            {
                _executor.setupAsset(e.asset, _asset.id, _executorSharedData);
            }
            catch (e : Error)
            {
                ExceptionManager.Throw(new ModelAssetExecutorException());
            }
        }
    }
    
    private function get_ready() : Bool
    {
        return _ready;
    }
    
    private function get_builded() : Map<String, Array<IAsset>>
    {
        return _builded;
    }
    
    private function get_asset() : ParserModel3DAsset
    {
        return _asset;
    }
    
    private function get_loader() : Loader3D
    {
        return _loader;
    }
}

class TextureBuilder extends EventDispatcher
{
    public var asset(get, never) : ParserModel3DAsset;
    public var ready(get, never) : Bool;
    public var data(get, never) : BitmapData;

    
    private var _asset : ParserModel3DAsset;
    private var _data : BitmapData = null;
    private var _ready : Bool = false;
    
    public function new(asset : ParserModel3DAsset)
    {
        super();
        _asset = asset;
    }
    
    public function build() : Void
    {
        var loader : Loader = new Loader();
        loader.contentLoaderInfo.addEventListener(Event.COMPLETE, loadComplete);
        loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR, loadIOError);
        loader.loadBytes(_asset.data);
    }
    
    private function loadIOError(e : IOErrorEvent) : Void
    {
        _data = null;
        _ready = false;
        dispatchEvent(new Event(Event.COMPLETE));
    }
    
    private function loadComplete(e : Event) : Void
    {
        try
        {
            var loader : LoaderInfo = try cast(e.currentTarget, LoaderInfo) catch(e:Dynamic) null;
            if (!(Std.is(loader.content, Bitmap)))
            {
                ExceptionManager.Throw(new ModelAssetBuildTextureException());
            }
            _data = (try cast(loader.content, Bitmap) catch(e:Dynamic) null).bitmapData;
            _ready = true;
        } catch(e:Dynamic) {
			trace(e);
		}
        dispatchEvent(new Event(Event.COMPLETE));
    }
    
    private function get_asset() : ParserModel3DAsset
    {
        return _asset;
    }
    
    private function get_ready() : Bool
    {
        return _ready;
    }
    
    private function get_data() : BitmapData
    {
        return _data;
    }
}

class FlashObjectBuilder extends EventDispatcher
{
    public var asset(get, never) : ParserModel3DAsset;
    public var ready(get, never) : Bool;
    public var data(get, never) : Loader;

    
    private var _asset : ParserModel3DAsset;
    private var _data : Loader = null;
    private var _ready : Bool = false;
    
    public function new(asset : ParserModel3DAsset)
    {
        super();
        _asset = asset;
    }
    
    public function build() : Void
    {
        var loader : Loader = new Loader();
        loader.contentLoaderInfo.addEventListener(Event.COMPLETE, loadComplete);
        loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR, loadIOError);
        loader.loadBytes(_asset.data);
    }
    
    private function loadIOError(e : IOErrorEvent) : Void
    {
        _data = null;
        _ready = false;
        dispatchEvent(new Event(Event.COMPLETE));
    }
    
    private function loadComplete(e : Event) : Void
    {
        try
        {
            var loader : LoaderInfo = try cast(e.currentTarget, LoaderInfo) catch(e:Dynamic) null;
            if (loader.content == null)
            {
                ExceptionManager.Throw(new ModelAssetBuildFlashObjectException());
            }
            if (Std.is(loader.content, MovieClip))
            {
                cast((loader.content), MovieClip).gotoAndStop(1);
            }
            //if (loader.content is AVM1Movie) AVM1Movie(loader.content).call("gotoAndStop", 1);
            _data = loader.loader;
            _ready = true;
        } catch(e:Dynamic) {
			trace(e);
		}
        dispatchEvent(new Event(Event.COMPLETE));
    }
    
    private function get_asset() : ParserModel3DAsset
    {
        return _asset;
    }
    
    private function get_ready() : Bool
    {
        return _ready;
    }
    
    private function get_data() : Loader
    {
        return _data;
    }
}