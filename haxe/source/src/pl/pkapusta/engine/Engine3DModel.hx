package pl.pkapusta.engine;

import haxe.Exception;
import away3d.containers.View3D;
import pl.pkapusta.engine.common.exteption.control.action.ActionController;
import pl.pkapusta.engine.common.exteption.ExceptionManager;
import pl.pkapusta.engine.common.mvc.AbstractModel;
import pl.pkapusta.engine.common.mvc.IView;
import pl.pkapusta.engine.events.Engine3DProjectEvent;
import pl.pkapusta.engine.events.Engine3DContainerEvent;
import pl.pkapusta.engine.events.Engine3DNewProjectEvent;
import pl.pkapusta.engine.graphics.Include;
import pl.pkapusta.engine.project.data.Project3DData;
import pl.pkapusta.engine.project.data.ProjectContext;
import pl.pkapusta.engine.project.data.ProjectSaveCustomizator;
import pl.pkapusta.engine.project.exceptions.InvalidUrlOrDataArgumentException;
import pl.pkapusta.engine.project.exceptions.ProjectLoaderErrorException;
import pl.pkapusta.engine.project.IProject3D;
import pl.pkapusta.engine.project.Project3D;
import pl.pkapusta.engine.utils.mouse.MouseCursorUtil;
import pl.pkapusta.engine.Engine3DView;
import pl.pkapusta.engine.view.events.ViewRenderEvent;
import openfl.display.Stage;
import openfl.events.ErrorEvent;
import openfl.events.Event;
import openfl.events.IOErrorEvent;
import openfl.events.SecurityErrorEvent;
import openfl.net.URLLoader;
import openfl.net.URLLoaderDataFormat;
import openfl.net.URLRequest;
import openfl.utils.ByteArray;
import openfl.utils.IDataInput;

/**
 * The main model that controls the state of the project.
 * It is not a Model3D object that manages the state of individual models.
 * The Model3D object is located here: pl.pkapusta.engine.model.Model3D.
 * This object implements the behavior of the project, but you should not perform any salaried operations on it.
 * The Engine3DController object is used to control the state of the project from the user's side
 * (located here: pl.pkapusta.engine.Engine3DController).
 * 
 * @author Przemysław Kapusta
 * @see pl.pkapusta.engine.model.Model3D
 * @see pl.pkapusta.engine.Engine3DController
 */
class Engine3DModel extends AbstractModel
{
    
    //includes
    private var graphics : Include;
    
    private var project : Project3D;
    private var view : View3D;
	
	@:dox(hide)
    public var stage(default, null) : Stage;
    private var engineView : Engine3DView;
    
    private var _firstInited : Bool = false;
    
    private var _loading : Bool = false;
    
	@:dox(hide)
    public function new()
    {
        super();
        MouseCursorUtil.init();
    }
	
	@:dox(hide)
	override public function dispatchEvent(event:Event):Bool 
	{
		#if (haxe_ver >= 4.1)
		try {
			return super.dispatchEvent(event);
		} catch (e:Exception) {
			js.html.Console.error("Error occured when dispatching '" + event.type + "' event on Engine3DModel. Please check your '" + event.type + "' function code.");
			js.html.Console.error(e.message);
			return false;
		}
		#else
		try {
			return super.dispatchEvent(event);
		} catch (e:Dynamic) {
			trace("Error occured when dispatching '" + event.type + "' event on Engine3DModel. Please check your '" + event.type + "' function code.");
			var stack = haxe.CallStack.exceptionStack();
			trace(haxe.CallStack.toString(stack));
			return false;
		}
		#end
	}
    
	@:dox(hide)
    public function setView(view : View3D) : Void
    {
        this.view = view;
        stage = view.stage;
        if (stage == null)
        {
            view.addEventListener(Event.ADDED_TO_STAGE, onAddedToStage);
        }
        else
        {
            dispatchEvent(new Event(Event.ADDED_TO_STAGE));
        }
    }
    
	@:dox(hide)
    public function getView() : View3D
    {
        return view;
    }
    
	@:dox(hide)
    override public function registerView(view : IView) : Void
    {
        super.registerView(view);
        if (Std.is(view, Engine3DView))
        {
            engineView = cast((view), Engine3DView);
        }
    }
    
    private function onAddedToStage(e : Event) : Void
    {
        view.removeEventListener(Event.ADDED_TO_STAGE, onAddedToStage);
        stage = view.stage;
        dispatchEvent(new Event(Event.ADDED_TO_STAGE));
    }
    
	@:dox(hide)
    public function firstInit() : Void
    {
        if (_firstInited)
        {
            return;
        }
        newProject();
        _firstInited = true;
    }
    
	@:dox(hide)
    public function newProject() : Void
    {
        if (_loading)
        {
            return;
        }
        closeProject();
        project = new Project3D(this);
        project.addEventListener(Engine3DContainerEvent.ROOT_CONNECT, dispatchEvent);
        
        dispatchEvent(new Engine3DNewProjectEvent(Engine3DNewProjectEvent.NEW_PROJECT_CREATED, project));
    }
    
	@:dox(hide)
    public function closeProject() : Void
    {
        if (_loading)
        {
            return;
        }
        if (project != null)
        {
            project.removeEventListener(Engine3DContainerEvent.ROOT_CONNECT, dispatchEvent);
            project.dispose();
            project = null;
        }
    }
    
	@:dox(hide)
    public function closeProjectAndDisposeChildren() : Void
    {
        if (_loading)
        {
            return;
        }
        if (project != null)
        {
            project.removeEventListener(Engine3DContainerEvent.ROOT_CONNECT, dispatchEvent);
            project.disposeWithChildren();
            project = null;
        }
    }
    
    private var projectDataLoader : URLLoader;
    private var retryActionController : ActionController = null;
    private var cancelActionController : ActionController = null;
    private var loadProjectUrlOrData : Dynamic;
    private var loadProjectContext : ProjectContext;
	
	@:dox(hide)
    public function loadProject(urlOrData: Dynamic, context: ProjectContext, onComplete: IProject3D -> Void = null) : Void
    {
        if (_loading)
        {
            return;
        }
        _loading = true;
        retryActionController = null;
        cancelActionController = null;
		var completeListener:Dynamic -> Void = null;
		if (onComplete != null) {
			completeListener = function(e:Engine3DProjectEvent) {
				removeEventListener(Engine3DProjectEvent.PROJECT_LOADED, completeListener);
				onComplete(e.getProject());
			};
		}
		if (completeListener != null) {
			addEventListener(Engine3DProjectEvent.PROJECT_LOADED, completeListener);
		}
        newProject();
        if (Std.is(urlOrData, IDataInput))
        {
            _buildProjectFromData(urlOrData, context);
        }
        else if (Std.is(urlOrData, URLRequest) || Std.is(urlOrData, String))
        {
            loadProjectUrlOrData = urlOrData;
            loadProjectContext = context;
            loadProjectFile();
        }
        else
        {
            ExceptionManager.Throw(new InvalidUrlOrDataArgumentException());
        }
    }
    private function loadProjectFile() : Void
    {
        projectDataLoader = new URLLoader();
        projectDataLoader.dataFormat = URLLoaderDataFormat.BINARY;
        projectDataLoader.addEventListener(Event.COMPLETE, _onProjectDataLoaded);
        projectDataLoader.addEventListener(IOErrorEvent.IO_ERROR, _onProjectDataLoadError);
        projectDataLoader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, _onProjectDataLoadError);
        projectDataLoader.load(((Std.is(loadProjectUrlOrData, URLRequest))) ? loadProjectUrlOrData : new URLRequest(loadProjectUrlOrData));
    }
    private function _onProjectDataLoadError(e : ErrorEvent) : Void
    {
        projectDataLoader.removeEventListener(Event.COMPLETE, _onProjectDataLoaded);
        projectDataLoader.removeEventListener(IOErrorEvent.IO_ERROR, _onProjectDataLoadError);
        projectDataLoader.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, _onProjectDataLoadError);
        _loading = false;
        projectDataLoader = null;
        
        if (retryActionController != null)
        {
            retryActionController.complete();
        }
        retryActionController = new ActionController(function()
                {
                    loadProjectFile();
                });
        cancelActionController = new ActionController(function()
                {
                    sendCancelErrorEvent();
                    cancelActionController.complete();
                });
        ExceptionManager.Throw(new ProjectLoaderErrorException(retryActionController, cancelActionController));
    }
    private function sendCancelErrorEvent() : Void
    {
        loadProjectUrlOrData = null;
        loadProjectContext = null;
        dispatchEvent(new Event("error"));
    }
    
    private function _onProjectDataLoaded(e : Event) : Void
    {
        projectDataLoader.removeEventListener(Event.COMPLETE, _onProjectDataLoaded);
        projectDataLoader.removeEventListener(IOErrorEvent.IO_ERROR, _onProjectDataLoadError);
        projectDataLoader.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, _onProjectDataLoadError);
        var bytes : ByteArray = projectDataLoader.data;
        projectDataLoader = null;
        var context : ProjectContext = loadProjectContext;
        loadProjectUrlOrData = null;
        loadProjectContext = null;
        if (retryActionController != null)
        {
            retryActionController.complete();
        }
        _buildProjectFromData(bytes, context);
    }
    
    private function _buildProjectFromData(data : ByteArray, context : ProjectContext) : Void
    //trace("_buildProjectFromData... bytes length: " + data.length);
    {
        
        var projectData : Project3DData = new Project3DData(project);
        projectData.addEventListener(Event.COMPLETE, _onProjectBuildComplete);
        projectData.buildFromBytes(data, context);
    }
    
    private function _onProjectBuildComplete(e : Event) : Void
    //trace("_onProjectBuildComplete");
    {
        
        _loading = false;
        dispatchEvent(new Engine3DProjectEvent(Engine3DProjectEvent.PROJECT_LOADED, project));
    }
    
	@:dox(hide)
    public function saveProject(customizator : ProjectSaveCustomizator = null) : ByteArray
    {
        return project.writeStream(customizator, engineView);
    }
    
    override private function registerViewListeners(view : IView) : Void
    {
        view.addEventListener(ViewRenderEvent.BEFORE_RENDER, dispatchEvent);
        view.addEventListener(ViewRenderEvent.AFTER_RENDER, dispatchEvent);
    }
    override private function unregisterViewListeners(view : IView) : Void
    {
        view.removeEventListener(ViewRenderEvent.BEFORE_RENDER, dispatchEvent);
        view.removeEventListener(ViewRenderEvent.AFTER_RENDER, dispatchEvent);
    }
}

