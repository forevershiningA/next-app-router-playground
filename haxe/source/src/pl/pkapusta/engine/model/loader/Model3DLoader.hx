package pl.pkapusta.engine.model.loader;

import pl.pkapusta.engine.common.exteption.control.action.ActionController;
import pl.pkapusta.engine.common.exteption.ExceptionManager;
import pl.pkapusta.engine.common.interfaces.IDisposable;
import pl.pkapusta.engine.model.data.Model3DData;
import pl.pkapusta.engine.model.loader.exceptions.ModelLoaderIOErrorException;
import pl.pkapusta.engine.model.loader.exceptions.ModelLoaderSecurityErrorException;
import pl.pkapusta.engine.model.loader.exceptions.ModelLoaderUnknownTypeException;
import openfl.events.Event;
import openfl.events.EventDispatcher;
import openfl.events.IOErrorEvent;
import openfl.events.ProgressEvent;
import openfl.events.SecurityErrorEvent;
import openfl.net.URLLoader;
import openfl.net.URLLoaderDataFormat;
import openfl.net.URLRequest;
import openfl.utils.ByteArray;
import openfl.utils.IDataInput;
import openfl.utils.Endian;

/**
	 * Model 3D Loader
	 * @author Przemysław Kapusta
	 */
class Model3DLoader extends EventDispatcher implements IDisposable
{
    public var urlPath(get, never) : String;
    public var data(get, never) : Model3DData;
    public var bytes(get, never) : ByteArray;

    
    private var _urlLoader : URLLoader;
    
    private var urlToLoad : URLRequest = null;
    private var retryActionController : ActionController = null;
    private var cancelActionController : ActionController = null;
    
    private var dataToParse : ByteArray = null;
    
    private var _data : Model3DData = null;
    
    public function new(urlOrData : Dynamic)
    {
        super();
        if (Std.is(urlOrData, String))
        {
            urlToLoad = new URLRequest(urlOrData);
            loadFile();
        }
        else if (Std.is(urlOrData, URLRequest))
        {
            urlToLoad = urlOrData;
            loadFile();
        }
        else if (Std.is(urlOrData, IDataInput))
        {
            dataToParse = urlOrData;
            parseData();
        }
        else
        {
            ExceptionManager.Throw(new ModelLoaderUnknownTypeException());return;
        }
    }
    
    private function get_urlPath() : String
    {
        if (urlToLoad != null)
        {
            return urlToLoad.url;
        }
        return null;
    }
    
    private function loadFile() : Void
    {
        _urlLoader = new URLLoader();
        _urlLoader.dataFormat = URLLoaderDataFormat.BINARY;
        _urlLoader.addEventListener(IOErrorEvent.IO_ERROR, loadFileIOErrorHandler);
        _urlLoader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, loadFileSecurityErrorHandler);
        _urlLoader.addEventListener(ProgressEvent.PROGRESS, loadFileProgressHandler);
        _urlLoader.addEventListener(Event.COMPLETE, loadFileCompleteHandler);
        _urlLoader.load(urlToLoad);
    }
    
    private function loadFileIOErrorHandler(e : IOErrorEvent) : Void
    {
        _urlLoader.removeEventListener(IOErrorEvent.IO_ERROR, loadFileIOErrorHandler);
        _urlLoader.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, loadFileSecurityErrorHandler);
        _urlLoader.removeEventListener(ProgressEvent.PROGRESS, loadFileProgressHandler);
        _urlLoader.removeEventListener(Event.COMPLETE, loadFileCompleteHandler);
        if (retryActionController != null)
        {
            retryActionController.complete();
        }
        retryActionController = new ActionController(function() : Void
                {
                    loadFile();
                });
        cancelActionController = new ActionController(function() : Void
                {
                    sendCancelErrorEvent();
                    cancelActionController.complete();
                });
        _urlLoader = null;
        ExceptionManager.Throw(new ModelLoaderIOErrorException(retryActionController, cancelActionController));
    }
    private function loadFileSecurityErrorHandler(e : SecurityErrorEvent) : Void
    {
        _urlLoader.removeEventListener(IOErrorEvent.IO_ERROR, loadFileIOErrorHandler);
        _urlLoader.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, loadFileSecurityErrorHandler);
        _urlLoader.removeEventListener(ProgressEvent.PROGRESS, loadFileProgressHandler);
        _urlLoader.removeEventListener(Event.COMPLETE, loadFileCompleteHandler);
        if (retryActionController != null)
        {
            retryActionController.complete();
        }
        retryActionController = new ActionController(function()
                {
                    loadFile();
                });
        cancelActionController = new ActionController(function()
                {
                    sendCancelErrorEvent();
                    cancelActionController.complete();
                });
        _urlLoader = null;
        ExceptionManager.Throw(new ModelLoaderSecurityErrorException(retryActionController, cancelActionController));
    }
    private function loadFileProgressHandler(e : ProgressEvent) : Void
    {
        dispatchEvent(e.clone());
    }
    private function loadFileCompleteHandler(e : Event) : Void
    {
        _urlLoader.removeEventListener(IOErrorEvent.IO_ERROR, loadFileIOErrorHandler);
        _urlLoader.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, loadFileSecurityErrorHandler);
        _urlLoader.removeEventListener(ProgressEvent.PROGRESS, loadFileProgressHandler);
        _urlLoader.removeEventListener(Event.COMPLETE, loadFileCompleteHandler);
        if (retryActionController != null)
        {
            retryActionController.complete();
        }
        dataToParse = _urlLoader.data;
		dataToParse.endian = Endian.BIG_ENDIAN;
        _urlLoader = null;
        parseData();
    }
    
    private function sendCancelErrorEvent() : Void
    {
        dispatchEvent(new Event("error"));
    }
    
    private function parseData() : Void
    {
        _data = new Model3DData(dataToParse);
        _data.addEventListener(Event.COMPLETE, parseDataCompleteHandler);
        _data.addEventListener("error", parseDataErrorHandler);
    }
    
    private function parseDataCompleteHandler(e : Event) : Void
    {
        dispatchEvent(new Event(Event.COMPLETE));
    }
    
    private function parseDataErrorHandler(e : Event) : Void
    {
        _data = null;
        dispatchEvent(new Event("error"));
    }
    
    private function get_data() : Model3DData
    {
        return _data;
    }
    
    private function get_bytes() : ByteArray
    {
        return dataToParse;
    }
    
    public function dispose() : Void
    {
        if (_data != null)
        {
            _data.dispose();
            _data = null;
        }
        if (dataToParse != null)
        {
            dataToParse.clear();
            dataToParse = null;
        }
        retryActionController = null;
        cancelActionController = null;
        urlToLoad = null;
    }
}

