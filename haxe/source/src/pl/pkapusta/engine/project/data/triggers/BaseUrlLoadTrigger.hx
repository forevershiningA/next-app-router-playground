package pl.pkapusta.engine.project.data.triggers;

import pl.pkapusta.engine.common.formats.font.FontLoader;
import pl.pkapusta.engine.common.formats.font.MFont;
import pl.pkapusta.engine.project.data.structure.interfaces.IExtraDataHolder;
import pl.pkapusta.engine.project.data.triggers.response.ITriggerResponse;
import pl.pkapusta.engine.project.data.structure.ElementDataHolder;
import openfl.display.Bitmap;
import openfl.display.DisplayObject;
import openfl.display.Loader;
import openfl.events.ErrorEvent;
import openfl.events.Event;
import openfl.events.IOErrorEvent;
import openfl.events.SecurityErrorEvent;
import openfl.net.URLLoader;
import openfl.net.URLLoaderDataFormat;
import openfl.net.URLRequest;
import openfl.system.LoaderContext;
import openfl.utils.ByteArray;

/**
 * Base url load trigger for solving dependencies when loading a scene.
 * 
 * @author Przemysław Kapusta
 */
@:expose("Engine3D.project.triggers.BaseUrlLoadTrigger")
class BaseUrlLoadTrigger implements IResourceLoadTrigger
{
    public var resourceType(get, never) : String;

    
    public static function storeResourceUrl(element : IExtraDataHolder, url : String) : Void
    {
        element.getExtraData().setAttribute("url", url);
    }
    
    public static function readResourceUrl(element : IExtraDataHolder) : String
    {
        if (element.getExtraData().has.url)
        {
            return element.getExtraData().att.url;
        }
        return null;
    }
    
    private var type : String;
    private var response : ITriggerResponse;
    private var urlLoader : URLLoader;
    private var displayLoader : Loader;
    private var fontLoader : FontLoader;
    private var bytes : ByteArray;
    private var display : DisplayObject;
    
    public function process(type : String, dataHolder : ElementDataHolder, response : ITriggerResponse) : Void
    {
        if (dataHolder.getExtraData() == null || !dataHolder.getExtraData().has.url)
        {
			trace("response null");
            response.returnResponse(null);
            return;
        }
        
        this.response = response;
        this.type = type;
        var resourceUrl : String = dataHolder.getExtraData().att.url;
        if (dataHolder.context != null && dataHolder.context.relativeURL != null)
        {
            resourceUrl = dataHolder.context.relativeURL + "/" + resourceUrl;
        }
        
        trace("Loading resource: " + resourceUrl);
        urlLoader = new URLLoader();
        urlLoader.dataFormat = URLLoaderDataFormat.BINARY;
        urlLoader.addEventListener(Event.COMPLETE, onLoadComplete);
        urlLoader.addEventListener(IOErrorEvent.IO_ERROR, onLoadError);
        urlLoader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, onLoadError);
        urlLoader.load(new URLRequest(resourceUrl));
    }
    
    private function onLoadError(e : ErrorEvent) : Void
    {
        urlLoader.removeEventListener(Event.COMPLETE, onLoadComplete);
        urlLoader.removeEventListener(IOErrorEvent.IO_ERROR, onLoadError);
        urlLoader.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, onLoadError);
        urlLoader = null;
        response.returnFail(e.text);
    }
    
    private function onLoadComplete(e : Event) : Void
    {
        urlLoader.removeEventListener(Event.COMPLETE, onLoadComplete);
        urlLoader.removeEventListener(IOErrorEvent.IO_ERROR, onLoadError);
        urlLoader.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, onLoadError);
        bytes = try cast(urlLoader.data, ByteArray) catch(e:Dynamic) null;
        urlLoader = null;
        
        switch (type)
        {
            case ResourceLoadTriggerType.ATF_TEXTURE_VALUE, ResourceLoadTriggerType.BYTE_ARRAY_VALUE:
                response.returnResponse(bytes);
                return;
            case ResourceLoadTriggerType.BITMAP_TEXTURE_VALUE, ResourceLoadTriggerType.DISPLAY_OBJECT_VALUE:
                processDisplayObject();
                return;
            
            case ResourceLoadTriggerType.MFONT_VALUE:
                processMFont();
                return;
            default:
                response.returnFail("Unsupported resource type: " + type);
                return;
        }
    }
    
    private function processMFont() : Void
    {
        fontLoader = new FontLoader();
        fontLoader.addEventListener(Event.COMPLETE, onMFontProcessComplete);
        fontLoader.addEventListener(IOErrorEvent.IO_ERROR, onMFontProcessError);
        fontLoader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, onMFontProcessError);
        fontLoader.loadBytes(bytes);
    }
    
    private function onMFontProcessComplete(e : Event) : Void
    {
        fontLoader.removeEventListener(Event.COMPLETE, onMFontProcessComplete);
        fontLoader.removeEventListener(IOErrorEvent.IO_ERROR, onMFontProcessError);
        fontLoader.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, onMFontProcessError);
        var font : MFont = fontLoader.data;
        fontLoader = null;
        
        response.returnResponse(font);
    }
    
    private function onMFontProcessError(e : ErrorEvent) : Void
    {
        fontLoader.removeEventListener(Event.COMPLETE, onMFontProcessComplete);
        fontLoader.removeEventListener(IOErrorEvent.IO_ERROR, onMFontProcessError);
        fontLoader.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, onMFontProcessError);
        fontLoader = null;
        response.returnFail(e.text);
    }
    
    private function processDisplayObject() : Void
    {
        displayLoader = new Loader();
        displayLoader.contentLoaderInfo.addEventListener(Event.COMPLETE, onDisplayProcessComplete);
        displayLoader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR, onDisplayProcessError);
        displayLoader.loadBytes(bytes, new LoaderContext(false, null, null));
    }
    
    private function onDisplayProcessError(e : IOErrorEvent) : Void
    {
        displayLoader.contentLoaderInfo.removeEventListener(Event.COMPLETE, onDisplayProcessComplete);
        displayLoader.contentLoaderInfo.removeEventListener(IOErrorEvent.IO_ERROR, onDisplayProcessError);
        displayLoader = null;
        response.returnFail(e.text);
    }
    
    private function onDisplayProcessComplete(e : Event) : Void
    {
        displayLoader.contentLoaderInfo.removeEventListener(Event.COMPLETE, onDisplayProcessComplete);
        displayLoader.contentLoaderInfo.removeEventListener(IOErrorEvent.IO_ERROR, onDisplayProcessError);
        display = displayLoader.content;
        displayLoader = null;
        
        switch (type)
        {
            
            case ResourceLoadTriggerType.BITMAP_TEXTURE_VALUE:
                if (Std.is(display, Bitmap))
                {
                    response.returnResponse(cast((display), Bitmap).bitmapData);
                }
                else
                {
                    response.returnFail("BitmapTextureValue requires Bitmap object, not DisplayObject");
                }
                return;
            
            case ResourceLoadTriggerType.DISPLAY_OBJECT_VALUE:
                response.returnResponse(display);
                return;
            default:
                response.returnFail("Unsupported display type: " + type);
                return;
        }
    }
    
    private function get_resourceType() : String
    {
        return ResourceLoadTriggerType.BASE;
    }
    
    public function dispose() : Void
    {
        type = null;
        response = null;
        urlLoader = null;
        displayLoader = null;
        fontLoader = null;
        bytes = null;
        display = null;
    }

    public function new()
    {
    }
}

