package pl.pkapusta.engine.common.formats.font;

import openfl.errors.Error;
import pl.pkapusta.engine.common.formats.font.executor.IFontExecutor;
import pl.pkapusta.engine.common.formats.font.parser.FontParser;
import openfl.display.Loader;
import openfl.errors.IOError;
import openfl.events.Event;
import openfl.events.EventDispatcher;
import openfl.events.IOErrorEvent;
import openfl.events.ProgressEvent;
import openfl.events.SecurityErrorEvent;
import openfl.net.URLLoader;
import openfl.net.URLLoaderDataFormat;
import openfl.net.URLRequest;
import openfl.system.ApplicationDomain;
import openfl.system.LoaderContext;
import openfl.utils.ByteArray;

/**
	 * @author Przemysław Kapusta
	 */
class FontLoader extends EventDispatcher
{
    public var data(get, never) : MFont;

    
    private var loader : URLLoader;
    
    private var _loading : Bool = false;
    private var _loaded : Bool = false;
    
    private var _bytes : ByteArray;
    private var _font : MFont;
    
    private var _autoRegister : Bool;
    
    public function new()
    {
        super();
    }
    
    public function loadBytes(bytes : ByteArray, autoRegister : Bool = true) : Void
    {
        if (_loading)
        {
            return;
        }
        _loading = true;
        _loaded = false;
        _font = null;
        _autoRegister = autoRegister;
        parseByteArray(bytes);
    }
    
    public function load(url : URLRequest, autoRegister : Bool = true) : Void
    {
        if (_loading)
        {
            return;
        }
        _loading = true;
        _loaded = false;
        _font = null;
        _autoRegister = autoRegister;
        loader = new URLLoader();
        loader.dataFormat = URLLoaderDataFormat.BINARY;
        loader.addEventListener(Event.COMPLETE, completeHandler);
        loader.addEventListener(ProgressEvent.PROGRESS, progressHandler);
        loader.addEventListener(IOErrorEvent.IO_ERROR, ioerrorHandler);
        loader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
        loader.load(url);
    }
    
    private function clearLoader() : Void
    {
        loader.removeEventListener(Event.COMPLETE, completeHandler);
        loader.removeEventListener(ProgressEvent.PROGRESS, progressHandler);
        loader.removeEventListener(IOErrorEvent.IO_ERROR, ioerrorHandler);
        loader.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
        loader = null;
    }
    
    private function completeHandler(e : Event) : Void
    {
        _bytes = loader.data;
        clearLoader();
        parseByteArray(_bytes);
    }
    
    private function progressHandler(e : ProgressEvent) : Void
    {
        dispatchEvent(e.clone());
    }
    
    private function ioerrorHandler(e : IOErrorEvent) : Void
    {
        _loading = false;
        clearLoader();
        dispatchEvent(e.clone());
    }
    
    private function securityErrorHandler(e : SecurityErrorEvent) : Void
    {
        _loading = false;
        clearLoader();
        dispatchEvent(e.clone());
    }
    
    private function parseByteArray(bytes : ByteArray) : Void
    {
        try
        {
            var parser : FontParser = new FontParser();
            parser.readStream(bytes);
            loadFontClassExecutor(parser.classExecutor);
        }
        catch (e : Error)
        {
            _loading = false;
            dispatchEvent(new IOErrorEvent(IOErrorEvent.IO_ERROR, false, false, e.message, e.errorID));
        }
    }
    
    private var movieLoader : Loader;
    private function loadFontClassExecutor(bytes : ByteArray) : Void
    {
        movieLoader = new Loader();
        movieLoader.contentLoaderInfo.addEventListener(Event.COMPLETE, fontClassLoadCompleteHandler);
        movieLoader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR, fontClassLoadIOErrorHandler);
        var newDomain : ApplicationDomain = new ApplicationDomain(ApplicationDomain.currentDomain);
        movieLoader.loadBytes(bytes, new LoaderContext(false, newDomain));
    }
    
    private function clearMovieLoader() : Void
    {
        movieLoader.contentLoaderInfo.removeEventListener(Event.COMPLETE, fontClassLoadCompleteHandler);
        movieLoader.contentLoaderInfo.removeEventListener(IOErrorEvent.IO_ERROR, fontClassLoadIOErrorHandler);
        movieLoader = null;
    }
    
    private function fontClassLoadCompleteHandler(e : Event) : Void
    {
        if (!(Std.is(movieLoader.content, IFontExecutor)))
        {
            _loading = false;
            clearMovieLoader();
            dispatchEvent(new IOErrorEvent(IOErrorEvent.IO_ERROR, false, false, "Inner font class is not IFontExecutor instance!"));
            return;
        }
        _font = new MFont(cast((movieLoader.content), IFontExecutor), _bytes);
        _bytes = null;
        _loading = false;
        _loaded = true;
        clearMovieLoader();
        if (_autoRegister)
        {
            _font.registerFont();
        }
        dispatchEvent(new Event(Event.COMPLETE));
    }
    
    private function fontClassLoadIOErrorHandler(e : IOErrorEvent) : Void
    {
        _loading = false;
        clearMovieLoader();
        dispatchEvent(e.clone());
    }
    
    private function get_data() : MFont
    {
        return _font;
    }
}

