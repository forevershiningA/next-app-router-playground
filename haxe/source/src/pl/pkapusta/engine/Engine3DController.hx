package pl.pkapusta.engine;

import haxe.Constraints.Function;
import haxe.crypto.Base64;
import haxe.Exception;
import haxe.io.Bytes;
import haxe.io.UInt8Array;
import openfl.events.Event;
import pl.pkapusta.engine.common.enums.IOFormat;
import pl.pkapusta.engine.common.mvc.IModel;
import pl.pkapusta.engine.events.Engine3DModelEvent;
import pl.pkapusta.engine.events.Engine3DProjectEvent;
import pl.pkapusta.engine.Engine3DModel;
import pl.pkapusta.engine.common.mvc.AbstractController;
import pl.pkapusta.engine.events.Engine3DNewProjectEvent;
import pl.pkapusta.engine.project.data.ProjectContext;
import pl.pkapusta.engine.project.data.ProjectSaveCustomizator;
import pl.pkapusta.engine.project.IProject3D;

/**
 * Main controller. Manages the 3d project state, initializes a new project, loads and saves.
 * 
 * @author Przemysław Kapusta
 */
class Engine3DController extends AbstractController implements IEngine3DController
{
    
    private var _project : IProject3D;
    
    public function new(model : Engine3DModel)
    {
        super(model);
        init();
    }
	
	override public function dispatchEvent(event:Event):Bool 
	{
		#if (haxe_ver >= 4.1)
		try {
			return super.dispatchEvent(event);
		} catch (e:Exception) {
			js.html.Console.error("Error occured when dispatching '" + event.type + "' event on Engine3DController. Please check your '" + event.type + "' function code.");
			js.html.Console.error(e.message);
			return false;
		}
		#else
		try {
			return super.dispatchEvent(event);
		} catch (e:Dynamic) {
			trace("Error occured when dispatching '" + event.type + "' event on Engine3DController. Please check your '" + event.type + "' function code.");
			var stack = haxe.CallStack.exceptionStack();
			trace(haxe.CallStack.toString(stack));
			return false;
		}
		#end
	}
    
    private function init() : Void
    {
    }
    
    public function firstInit() : Void
    {
        (try cast(model, Engine3DModel) catch(e:Dynamic) null).firstInit();
    }
    
    override private function registerModelListeners(model : IModel) : Void
    {
        model.addEventListener(Engine3DNewProjectEvent.NEW_PROJECT_CREATED, newProjectCreatedHandler);
        model.addEventListener(Engine3DModelEvent.MODEL_SELECT, modelSelectHandler);
        model.addEventListener(Engine3DProjectEvent.PROJECT_LOADED, projectLoadedHandler);
    }
    override private function unregisterModelListeners(model : IModel) : Void
    {
        model.removeEventListener(Engine3DNewProjectEvent.NEW_PROJECT_CREATED, newProjectCreatedHandler);
        model.removeEventListener(Engine3DModelEvent.MODEL_SELECT, modelSelectHandler);
        model.removeEventListener(Engine3DProjectEvent.PROJECT_LOADED, projectLoadedHandler);
    }
    
    private function projectLoadedHandler(e : Engine3DProjectEvent) : Void
    {
        //closeProjectAndDisposeChildren();
        _project = e.getProject();
        dispatchEvent(e.clone());
    }
    
    private function modelSelectHandler(e : Engine3DModelEvent) : Void
    {
        dispatchEvent(e.clone());
    }
    
    private function newProjectCreatedHandler(e : Engine3DNewProjectEvent) : Void
    {
        _project = e.getProject();
    }
    
    /**
	 * Creates new empty engine project. Current project will be destoyed.
	 */
    public function newEmptyProject() : Void
    {
        (try cast(model, Engine3DModel) catch(e:Dynamic) null).newProject();
    }
    
	/**
	 * Closes the current project
	 */
    public function closeProject() : Void
    {
        _project = null;
        (try cast(model, Engine3DModel) catch(e:Dynamic) null).closeProject();
    }
    
	/**
	 * Closes the current project and clears all models and their resources
	 */
    public function closeProjectAndDisposeChildren() : Void
    {
        _project = null;
        (try cast(model, Engine3DModel) catch(e:Dynamic) null).closeProjectAndDisposeChildren();
    }
    
	/**
	 * Loads project from file or from byteArray. Current project will be destoyed.
	 * @param	urlOrData	Path to project file (String or URLRequest) or project binary data (ByteArray)
	 * @param	context		Specify load context data and customize loading operation (for example: relative path for external M3D model, parsing callbacks, etc.)
	 * @param	onComplete	Callbacks when loading is done
	 */
    public function loadProject(urlOrData : Dynamic, context : ProjectContext = null, onComplete: IProject3D -> Void = null) : Void
    {
        _project = null;
        (try cast(model, Engine3DModel) catch(e:Dynamic) null).loadProject(urlOrData, context, onComplete);
    }
    
	/**
	 * Saves current project do binary data. After saving project is still exists.
	 * @param	customizator	Put customizator class here for customize save data. Using this class you can affect to saving process.
	 * @param	output			Output type, possible values from Engine3D.enums.IOFormat: Uint8Array, Base64String, Bytes
	 * @return	Binary data for project.
	 * @see pl.pkapusta.engine.common.enums.IOFormat
	 */
    public function saveProject(customizator : ProjectSaveCustomizator = null, output: String = "Uint8Array") : Dynamic
    {
        var ba:Bytes = (try cast(model, Engine3DModel) catch (e:Dynamic) null).saveProject(customizator);
		if (ba == null) return null;
		switch (output) {
			case IOFormat.Uint8Array:
				return UInt8Array.fromBytes(ba);
			case IOFormat.Base64String:
				return Base64.encode(ba);
			case IOFormat.Bytes:
				return ba;
			case _:
				throw "Unsupported output type: " + output;
		}
		return null;
    }
    
    /**
	 * Get current project
	 */
    public function getCurrentProject() : IProject3D
    {
        return _project;
    }
}

