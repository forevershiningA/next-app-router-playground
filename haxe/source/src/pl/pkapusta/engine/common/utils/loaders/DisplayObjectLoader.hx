package pl.pkapusta.engine.common.utils.loaders;

import haxe.Constraints.Function;
import openfl.display.DisplayObject;
import openfl.events.ProgressEvent;
import openfl.events.IOErrorEvent;
import openfl.events.Event;
import openfl.events.SecurityErrorEvent;
import openfl.events.ErrorEvent;
import openfl.display.Loader;
import openfl.net.URLRequest;

/**
 * Auxiliary object used to load the swf file to the DisplayObject format supported by the engine and openfl.
 * 
 * @author Przemysław Kapusta
 */

@:keep
@:expose("Engine3D.utils.DisplayObjectLoader")
class DisplayObjectLoader 
{
	
	private var url:String;
	private var onComplete:Function;
	private var onProgress:Function;
	private var loading:Bool = false;
	private var loaded:Bool = false;
	private var loader:Loader = null;
	private var content:DisplayObject = null;
	private var error:Any = null;

	/**
	 * Initializes the loader object
	 * @param	url			The path to the resource
	 * @param	onComplete	Callbacks when complete (argument has content object)
	 * @param	onProgress	Callbacks on process (argument has number from 0 to 1)
	 */
	public function new(?url:String, ?onComplete:Function, ?onProgress:Function) {
		this.url = url;
		this.onComplete = onComplete;
		this.onProgress = onProgress;
	}
	
	/**
	 * Starts resource loading
	 * @return	It returns itself so you can combine calls
	 */
	public function load():DisplayObjectLoader {
		if (loading) throw "DisplayObjectLoader is in loading state.";
		if (loaded) throw "DisplayObjectLoader loaded file. Use new instance of loader.";
		loading = true;
		loader = new Loader();
		loader.contentLoaderInfo.addEventListener(ProgressEvent.PROGRESS, loaderProgress);
		loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR, loaderError);
		loader.contentLoaderInfo.addEventListener(Event.COMPLETE, loaderComplete);
		loader.contentLoaderInfo.addEventListener(SecurityErrorEvent.SECURITY_ERROR, loaderError);
		loader.load (new URLRequest(this.url));
		return this;
	}
	
	/**
	 * The path to the resource
	 */
	public function setUrl(url:String):DisplayObjectLoader {
		this.url = url;
		return this;
	}
	
	/**
	 * Callbacks when complete (argument has content object)
	 */
	public function setOnComplete(onComplete:Function):DisplayObjectLoader {
		this.onComplete = onComplete;
		return this;
	}
	
	/**
	 * Callbacks on process (argument has number from 0 to 1)
	 */
	public function setOnProgress(onProgress:Function):DisplayObjectLoader {
		this.onProgress = onProgress;
		return this;
	}
	
	/**
	 * Returns content when it is loaded
	 */
	public function getContent():DisplayObject {
		return content;
	}
	
	/**
	 * True if an error occurred
	 */
	public function hasError():Bool {
		return error != null;
	}
	
	/**
	 * Returns an object describing the error if it occurred
	 */
	public function getError():Any {
		return error;
	}
	
	/**
	 * True if the resource is loading. False if the resource is already loaded.
	 */
	public function isLoading():Bool {
		return loading;
	}
	
	/**
	 * False if the resource is loading. True if the resource is already loaded.
	 */
	public function isLoaded():Bool {
		return loaded;
	}
	
	private function loaderProgress(e:ProgressEvent):Void {
		if (this.onProgress != null) this.onProgress(e.bytesLoaded / e.bytesTotal);
	}
	
	private function loaderError(e:ErrorEvent):Void {
		loading = false;
		loaded = true;
		loader.contentLoaderInfo.removeEventListener(ProgressEvent.PROGRESS, loaderProgress);
		loader.contentLoaderInfo.removeEventListener(IOErrorEvent.IO_ERROR, loaderError);
		loader.contentLoaderInfo.removeEventListener(Event.COMPLETE, loaderComplete);
		loader.contentLoaderInfo.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, loaderError);
		loader = null;
		if (this.onComplete != null) this.onComplete(e, null);
	}
	
	private function loaderComplete(e:Event):Void {
		loading = false;
		loaded = true;
		loader.contentLoaderInfo.removeEventListener(ProgressEvent.PROGRESS, loaderProgress);
		loader.contentLoaderInfo.removeEventListener(IOErrorEvent.IO_ERROR, loaderError);
		loader.contentLoaderInfo.removeEventListener(Event.COMPLETE, loaderComplete);
		loader.contentLoaderInfo.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, loaderError);
		if (loader.content != null && Std.is(loader.content, DisplayObject)) {
			content = loader.content;
			loader = null;
			this.onComplete(null, content);
		} else {
			loader = null;
			this.onComplete("content is not display object", null);
		}
	}
	
}