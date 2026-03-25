package pl.pkapusta.engine.model;

import pl.pkapusta.engine.model.regions.exceptions.AddingNotReadyChildException;
import openfl.errors.Error;
import haxe.Constraints.Function;
import haxe.crypto.Md5;
import haxe.Exception;
import pl.pkapusta.engine.common.enums.EmbedType;
import pl.pkapusta.engine.common.exteption.ExceptionManager;
import pl.pkapusta.engine.common.interfaces.IDisposable;
import pl.pkapusta.engine.common.interfaces.IEmbeddable;
import pl.pkapusta.engine.common.utils.storage.ParamStorage;
import pl.pkapusta.engine.events.Engine3DModelEvent;
import pl.pkapusta.engine.events.Engine3DContainerEvent;
import pl.pkapusta.engine.model.collision.*;
import pl.pkapusta.engine.model.container.Model3DContainer;
import pl.pkapusta.engine.model.controllers.Model3DMouseController;
import pl.pkapusta.engine.model.data.ExecutorJS;
import pl.pkapusta.engine.model.data.IModel3DData;
import pl.pkapusta.engine.model.data.Model3DData;
import pl.pkapusta.engine.model.definition.data.ICollection;
import pl.pkapusta.engine.model.definition.data.IEditAttributes;
import pl.pkapusta.engine.model.definition.data.InformationData;
import pl.pkapusta.engine.model.definition.DefinitionParser;
import pl.pkapusta.engine.model.events.Model3DEvent;
import pl.pkapusta.engine.model.exceptions.ModelHaveNotRegionsException;
import pl.pkapusta.engine.model.exceptions.ModelInfoReadException;
import pl.pkapusta.engine.model.exceptions.ModelIsNotReadyException;
import pl.pkapusta.engine.model.executors.bridge.M3DBridge;
import pl.pkapusta.engine.model.executors.file.IM3DExecutorLimiter;
import pl.pkapusta.engine.model.executors.file.IM3DExecutorProperty;
import pl.pkapusta.engine.model.executors.file.IM3DExecutorRenderer;
import pl.pkapusta.engine.model.executors.file.proxies.IModel3DProxy;
import pl.pkapusta.engine.model.executors.file.proxies.Model3DProxy;
import pl.pkapusta.engine.model.executors.file.proxies.RegionProxy;
import pl.pkapusta.engine.model.executors.utils.Include;
import pl.pkapusta.engine.model.handlers.collection.IHandlerCollection;
import pl.pkapusta.engine.model.handlers.IHandler;
import pl.pkapusta.engine.model.loader.Model3DLoader;
import pl.pkapusta.engine.model.properties.IProperty;
import pl.pkapusta.engine.model.properties.ISection;
import pl.pkapusta.engine.model.properties.PropertiesParser;
import pl.pkapusta.engine.model.regions.AbstractRegion;
import pl.pkapusta.engine.model.regions.IRegion;
import pl.pkapusta.engine.model.regions.event.RegionLimitEvent;
import pl.pkapusta.engine.model.regions.position.AbstractRegionPosition;
import pl.pkapusta.engine.model.selection.AbstractSelection;
import pl.pkapusta.engine.model.utils.Model3DCloner;
import pl.pkapusta.engine.project.data.structure.context.IResourceContext;
import pl.pkapusta.engine.project.data.structure.context.ResourceURLContext;
import pl.pkapusta.engine.project.data.structure.interfaces.IExtraDataHolder;
import pl.pkapusta.engine.project.data.structure.interfaces.IResourceContextHolder;
import pl.pkapusta.engine.project.IProject3D;
import pl.pkapusta.engine.project.Project3D;
import pl.pkapusta.engine.view.events.ViewRenderEvent;
import openfl.events.Event;
import openfl.events.EventDispatcher;
import openfl.net.URLRequest;
import openfl.utils.ByteArray;

/**
 * The main object defining the 3d model available in the scene. This object is used to load M3D, manage the states and properties of the 3d model that is displayed on the stage.
 * 
 * @author Przemysław Kapusta
 */
@:expose("Engine3D.Model3D")
class Model3D extends EventDispatcher implements IModel3D implements IDisposable implements IEmbeddable implements IExtraDataHolder implements IResourceContextHolder
{
	
	@:dox(hide)
	public var mouseController(default, null) : Model3DMouseController;
    
    private static var _defaultEmbed : Bool = false;
    
	@:dox(hide)
    public static var defaultAutoBuildContext : Bool = false;
	
	@:dox(hide)
    public static var defaultAutoDisposeContext : Bool = true;
    
	@:dox(hide)
    public static inline var EVENT_INTERNAL_MOUSE_OVER : String = "internal.mouse.over";
	
	@:dox(hide)
    public static inline var EVENT_INTERNAL_MOUSE_OUT : String = "internal.mouse.out";
	
	@:dox(hide)
    public static inline var EVENT_INTERNAL_MODEL_SELECTED : String = "internal.model.selected";
	
	@:dox(hide)
    public static inline var EVENT_INTERNAL_MODEL_UNSELECTED : String = "internal.model.unselected";
	
	@:dox(hide)
	public var extra:Dynamic = null; //JSON encoded extra infomations
    
    private var _ready : Bool = false;
    private var _contextReady : Bool = false;
	private var _disposed : Bool = false;
    
    private var _autoDisposeContext : Bool;
    private var _autoBuildContext : Bool;
    
    private var _modelLoader : Model3DLoader;
    private var _definitionParser : DefinitionParser;
    private var modelData : Model3DData;
    private var _container : Model3DContainer;
    private var _execBridge : M3DBridge;
    
    private var _context : IResourceContext;
    
    private var _loadingModelsDict : Map<IModel3D, String>;
    
	private var _interactive : Bool = true;
    private var _selected : Bool = false;
    
    private var _project : IProject3D = null;
    private var _parent : IModel3D = null;
    private var _parentRegion : IRegion = null;
    private var _handler : IHandler = null;
    
    private var _properties : PropertiesParser;
    
    private var internalModelByteData : ByteArray;
    
    
    private var execUtilsInclude : Include;
    
    private var _proxy : IModel3DProxy;
    
    private var _freezeModelSelection : Bool = false;
    
    
    private function doDispose() : Void
    {
		if (_disposed) return;
        if (_proxy != null)
        {
            _proxy.dispose();
            _proxy = null;
        }
        if (_parentRegion != null)
        {
            _parentRegion.removeChild(this);
        }
        if (_contextReady)
        {
            disposeContext();
        }
        if (_definitionParser != null)
        {
            _definitionParser.dispose();
            _definitionParser = null;
        }
        if (_execBridge != null)
        {
            _execBridge.dispose();
            _execBridge = null;
        }
        modelData = null;
        if (_modelLoader != null)
        {
            _modelLoader.dispose();
            _modelLoader = null;
        }
        if (_container != null)
        {
            _container.dispose();
            _container = null;
        }
        _context = null;
        if (mouseController != null)
        {
            mouseController.dispose();
            mouseController = null;
        }
        _loadingModelsDict = null;
        _selected = false;
        _project = null;
        _parent = null;
        _parentRegion = null;
        _handler = null;
        _properties = null;
        if (internalModelByteData != null)
        {
            internalModelByteData.clear();
            internalModelByteData = null;
        }
		_disposed = true;
    }
	
	private function warnDisposed(funcName:String):Void {
		untyped __js__("console.warn({0}, {1}, {2})", "Call %s() to disposed Model3D object: %o", funcName, this);
	}
    
    /**
     * Clears the resources and state of this model
     */
    public function dispose() : Void
    {
		if (_disposed) { warnDisposed("dispose"); return; }
        var i : Int = 0;
		var regionList: Array<IRegion> = getRegionList();
        while (i < regionList.length)
        {
            var list : Array<IModel3D> = regionList[i].getChildList();
            var j : Int = 0;
            while (j < list.length)
            {
                list[j].removeFromParent();
                j++;
            }
            i++;
        }
        doDispose();
    }
    
	/**
	 * Clears the resources and state of this model and all of its children from memory.
	 */
    public function disposeWithChildren() : Void
    {
		if (_disposed) { warnDisposed("disposeWithChildren"); return; }
        var i : Int = 0;
		var regionList: Array<IRegion> = getRegionList();
        while (i < regionList.length)
        {
            var list : Array<IModel3D> = regionList[i].getChildList();
            var j : Int = 0;
            while (j < list.length)
            {
                list[j].removeFromParent();
                list[j].disposeWithChildren();
                j++;
            }
            i++;
        }
        doDispose();
    }
    
    
    public function new(urlOrData : Dynamic, context : IResourceContext = null)
    {
        super();
        
        _autoDisposeContext = defaultAutoDisposeContext;
        _autoBuildContext = defaultAutoBuildContext;
        
        initContainer();
        mouseController = new Model3DMouseController(this);
        mouseController.registerContainer(_container.contextContainer);
        _loadingModelsDict = new Map<IModel3D, String>();
        _context = context;
        loadModel(urlOrData);
        
        //init context
        if (_context == null)
        {
            if (_modelLoader.urlPath != null)
            {
                _context = new ResourceURLContext(new URLRequest(_modelLoader.urlPath));
            }
        }
        
        _execBridge = new M3DBridge(this);
        _proxy = new Model3DProxy(this);
    }
	
	override public function dispatchEvent(event:Event):Bool 
	{
		#if (haxe_ver >= 4.1)
		try {
			return super.dispatchEvent(event);
		} catch (e:Exception) {
			js.html.Console.error("Error occured when dispatching '" + event.type + "' event on Model3D. Please check your '" + event.type + "' function code.");
			js.html.Console.error(e.message);
			return false;
		}
		#else
		try {
			return super.dispatchEvent(event);
		} catch (e:Dynamic) {
			trace("Error occured when dispatching '" + event.type + "' event on Model3D. Please check your '" + event.type + "' function code.");
			var stack = haxe.CallStack.exceptionStack();
			trace(haxe.CallStack.toString(stack));
			return false;
		}
		#end
	}
    
    private function loadModel(urlOrData : Dynamic)
    {
        _modelLoader = new Model3DLoader(urlOrData);
        _modelLoader.addEventListener(Event.COMPLETE, loaderCompleteHandler);
        _modelLoader.addEventListener("error", loaderErrorHandler);
    }
    
    private function loaderCompleteHandler(e : Event) : Void
    {
        _modelLoader.removeEventListener(Event.COMPLETE, loaderCompleteHandler);
        _modelLoader.removeEventListener("error", loaderErrorHandler);
        modelData = _modelLoader.data;
        internalModelByteData = _modelLoader.bytes;
        _modelLoader = null;
        //initContainer();
        _definitionParser = new DefinitionParser(modelData.definition, this, _container);
        prepareScene3DData();
    }
    
    private function initContainer() : Void
    {
        _container = new Model3DContainer();
    }
    
    
    
    private function loaderErrorHandler(e : Event) : Void
    {
        _modelLoader.removeEventListener(Event.COMPLETE, loaderCompleteHandler);
        _modelLoader.removeEventListener("error", loaderErrorHandler);
        _modelLoader = null;
        
        
		/**
		 * TODO: Write error handle and erase object 3d from scene 3d!
		 * Writed:
		 */
        unregisterNotReadyObject();
        
        
        dispatchEvent(new Model3DEvent(Model3DEvent.LOAD_ERROR));
    }
    
    
    
    private function prepareScene3DData() : Void
    {
        _ready = true;
        
        if (_autoBuildContext)
        {
            buildContext();
        }
        
        //parse properties data
        _properties = new PropertiesParser(this);
        
        dispatchEvent(new Model3DEvent(Model3DEvent.IS_READY));
    }
    
    private function buildContext() : Void
    {
        if (_contextReady)
        {
            return;
        }
        if (modelData.executor != null) {
        
			
			try
			{
				modelData.executor.initData(_container.contextContainer, _proxy, cast((modelData), IModel3DData), modelData.executorSharedData, Engine3D.Globals, _execBridge);
			}
			catch (e : Error)
			{
				trace(e.getStackTrace());
			}
			
            try
            {
                modelData.executor.build();
            }
            catch (e : Error)
            {
                trace(e.getStackTrace());
            }
        }
        else
        {  /**
				 * TODO: Write build context on scene3d code!
				 */  
            
        }
        _contextReady = true;
        _execBridge.moveNoContextPropertiesToContext();
    }
    
    private function disposeContext() : Void
    {
        if (!_contextReady)
        {
            return;
        }
        if (modelData.executor != null)
        {
            try
            {
                modelData.executor.dispose();
            }
            catch (e : Error)
            {
                trace(e.getStackTrace());
            }
        }
        else
        {  /**
				 * TODO: Write dispose context on scene3d code!
				 */  
            
        }
        _container.resetContextContainer();
        mouseController.registerContainer(_container.contextContainer);
        _contextReady = false;
        _execBridge.moveContextPropertiesToNoContext();
    }
    
    @:dox(hide)
    public function registerModelForParent(project : Project3D, parentModel : Model3D, region : IRegion, handler : IHandler) : Void
    {
        unregisterNotReadyObject();
        _project = project;
        _parent = parentModel;
        _parentRegion = region;
        _handler = handler;
        if (!_ready)
        {
            addEventListener(Model3DEvent.IS_READY, registerWhenIsReadyHandler);
        }
        else
        {
            registerReadyObject();
        }
        dispatchEvent(new Model3DEvent(Model3DEvent.ADDED_TO_PROJECT));
    }
	
	@:dox(hide)
    public function unregisterModelFromParent() : Void
    {
        if (_ready)
        {
            unregisterReadyObject();
        }
        unregisterNotReadyObject();
        _project = null;
        _parent = null;
        _parentRegion = null;
        _handler = null;
        dispatchEvent(new Model3DEvent(Model3DEvent.REMOVED_FROM_PROJECT));
    }
    
    private function registerWhenIsReadyHandler(e : Model3DEvent) : Void
    {
        removeEventListener(Model3DEvent.IS_READY, registerWhenIsReadyHandler);
        registerReadyObject();
    }
    private function registerReadyObject() : Void
    {
        if (!_contextReady)
        {
            buildContext();
        }
        
        if (_handler != null)
        {
            _container.useHandler(_handler);
        }
        
        if (_project != null && _parent == null && _parentRegion == null) {
        
        //trace(_project);
            
            //trace(_definitionParser);
            
            var envXML : FastXML = null;
            if (_definitionParser.cameraXML != null && _definitionParser.cameraXML.hasNode.enviroment)
            {
                envXML = _definitionParser.cameraXML.node.enviroment;
                if (envXML != null && envXML.hasNode.scene && envXML.node.scene.has.scale)
                {
                    cast((_project), Project3D).sceneScale = Std.parseInt(envXML.node.scene.att.scale);
                }
            }
            
            //trace("!!! scene scale: " + Project3D(_project).sceneScale);
            
            _container.getRoot().scale(cast((_project), Project3D).sceneScale);
            cast((_project), Project3D).dispatchEvent(new Engine3DContainerEvent(Engine3DContainerEvent.ROOT_CONNECT, _container.getRoot(), envXML));
        }
        else
        {
            cast((_parentRegion), AbstractRegion).getRegionContainer().addChild(_container.getRoot());
            /**
				 * TODO: Write adding bound code
				 */
            _parentRegion.addEventListener(RegionLimitEvent.CHANGE, regionLimitChangeHandler);
            _parentRegion.addEventListener(RegionLimitEvent.INIT, regionLimitInitHandler);
            
            cast((_parentRegion), AbstractRegion).dispatchLimitEvents();
        }
        cast((_project), Project3D).addEventListener(ViewRenderEvent.BEFORE_RENDER, viewRenderEventHandler);
        cast((_project), Project3D).addEventListener(ViewRenderEvent.AFTER_RENDER, viewRenderEventHandler);
        cast((_project), Project3D).addEventListener(Engine3DModelEvent.MODEL_SELECT, modelSelectEventHandler);
        cast((_project), Project3D).sceneData.addEventListener(Event.CHANGE, sceneDataChangeHandler);
        //registerStageDownListener(Project3D(_project).model);
        
        if (modelData.executor != null && ExecutorJS.instanceOf(modelData.executor, IM3DExecutorRenderer))
        {
            ExecutorJS.castTo(modelData.executor, IM3DExecutorRenderer).onAddedToScene(cast((_project), Project3D).sceneData);
        }
    }
    private function unregisterReadyObject() : Void
    {
        if (modelData.executor != null && ExecutorJS.instanceOf(modelData.executor, IM3DExecutorRenderer))
        {
            ExecutorJS.castTo(modelData.executor, IM3DExecutorRenderer).onRemovedFromScene(cast((_project), Project3D).sceneData);
        }
        
        if (_project != null && _parent == null && _parentRegion == null)
        {
            cast((_project), Project3D).dispatchEvent(new Engine3DContainerEvent(Engine3DContainerEvent.ROOT_CONNECT, null));
        }
        else
        {
            cast((_parentRegion), AbstractRegion).getRegionContainer().removeChild(_container.getRoot());
            _parentRegion.removeEventListener(RegionLimitEvent.CHANGE, regionLimitChangeHandler);
            try
            {
                _parentRegion.removeEventListener(RegionLimitEvent.INIT, regionLimitInitHandler);
            }
            catch (e : Error)
            {
            }
        }
        _container.resetHandler();
        
        if (!_freezeModelSelection && isSelected())
        {
            _project.setSelectedModel(null);
        }
        //unregisterStageDownListener(Project3D(_project).model);
        cast((_project), Project3D).removeEventListener(ViewRenderEvent.BEFORE_RENDER, viewRenderEventHandler);
        cast((_project), Project3D).removeEventListener(ViewRenderEvent.AFTER_RENDER, viewRenderEventHandler);
        cast((_project), Project3D).removeEventListener(Engine3DModelEvent.MODEL_SELECT, modelSelectEventHandler);
        cast((_project), Project3D).sceneData.removeEventListener(Event.CHANGE, sceneDataChangeHandler);
        
        if (_autoDisposeContext && _contextReady)
        {
            disposeContext();
        }
    }
    private function unregisterNotReadyObject() : Void
    {
        if (_parent != null)
        
        /**
				 * TODO: Unregister model parent
				 */{
            
            if (!_ready)
            {
                removeEventListener(Model3DEvent.IS_READY, registerWhenIsReadyHandler);
            }
            _parent = null;
            _parentRegion = null;
        }
        if (_project != null)
        
        /**
				 * TODO: Unregister project
				 */{
            
            _project = null;
        }
        if (_handler != null)
        {
            _handler = null;
        }
    }
    
    
    private function modelSelectEventHandler(e : Engine3DModelEvent) : Void
    {
        if (e.getModel() == this)
        {
            _selected = true;
            //Project3D(project).model.dispatchEvent();
            if (getSelectionObject() != null)
            {
                getSelectionObject().activate();
            }
            
            dispatchEvent(new Event(EVENT_INTERNAL_MODEL_SELECTED));
        }
        else
        {
            _selected = false;
            if (getSelectionObject() != null)
            {
                getSelectionObject().deactivate();
            }
            dispatchEvent(new Event(EVENT_INTERNAL_MODEL_UNSELECTED));
        }
    }
    
    
    /**
		 * Inner parent listeners
		 */
    private function viewRenderEventHandler(e : ViewRenderEvent) : Void
    {
		if (!_contextReady) return;
        
        if (modelData.executor != null && ExecutorJS.instanceOf(modelData.executor, IM3DExecutorRenderer))
        {
            var _sw0_ = (e.type);            

            switch (_sw0_)
            {
                case ViewRenderEvent.BEFORE_RENDER:ExecutorJS.castTo(modelData.executor, IM3DExecutorRenderer).beforeViewRender(e.view);
                case ViewRenderEvent.AFTER_RENDER:ExecutorJS.castTo(modelData.executor, IM3DExecutorRenderer).afterViewRender(e.view);
            }
        }
        dispatchEvent(e);
    }
    private function regionLimitChangeHandler(e : RegionLimitEvent) : Void
    {
        if (modelData.executor != null && ExecutorJS.instanceOf(modelData.executor, IM3DExecutorLimiter))
        {
            ExecutorJS.castTo(modelData.executor, IM3DExecutorLimiter).afterParentRegionLimit(e.limitType, e.limitValue, RegionProxy.factory(try cast(e.region, AbstractRegion) catch(e:Dynamic) null), "change");
        }
    }
    private function regionLimitInitHandler(e : RegionLimitEvent) : Void
    {
        _parentRegion.removeEventListener(RegionLimitEvent.INIT, regionLimitInitHandler);
        if (modelData.executor != null && ExecutorJS.instanceOf(modelData.executor, IM3DExecutorLimiter))
        {
            ExecutorJS.castTo(modelData.executor, IM3DExecutorLimiter).afterParentRegionLimit(e.limitType, e.limitValue, RegionProxy.factory(try cast(e.region, AbstractRegion) catch(e:Dynamic) null), "init");
        }
    }
    private function sceneDataChangeHandler(e : Event) : Void
    {
        if (modelData.executor != null && ExecutorJS.instanceOf(modelData.executor, IM3DExecutorRenderer))
        {
            ExecutorJS.castTo(modelData.executor, IM3DExecutorRenderer).onSceneDataChanged(cast((_project), Project3D).sceneData);
        }
    }
    
    
    
    
    private var _regionPosition : AbstractRegionPosition = null;
	
	@:dox(hide)
    public function registerRegionPosition(rp : AbstractRegionPosition) : Void
    {
        _regionPosition = rp;
        var i : Int = 0;
        while (i < getCollisionShapesList().length)
        {
            getCollisionShapesList()[i].setRegionPositionObject(rp);
            getCollisionShapesList()[i].updatePosition();
            i++;
        }
    }
	
	@:dox(hide)
    public function unregisterRegionPosition() : Void
    {
        if (_regionPosition != null)
        {
            var i : Int = 0;
            while (i < getCollisionShapesList().length)
            {
                getCollisionShapesList()[i].setRegionPositionObject(null);
                i++;
            }
            _regionPosition = null;
        }
    }
    
	/**
	 * Returns the collision shape list of an object to calculate whether it collides with another object in a given region. The functionality has not been implemented!
	 */
    public function getCollisionShapesList() : Array<AbstractCollisionShape>
    {
        return _definitionParser.collisionShapes;
    }
	
	/**
	 * Returns the collision shape of an object to calculate whether it collides with another object in a given region. The functionality has not been implemented!
	 * @param	name	collision name ID
	 * @return	collision shape
	 */
    public function getCollisionShape(name : String) : AbstractCollisionShape
    {
        return _definitionParser.getCollisionShape(name);
    }
	
	@:allow(pl.pkapusta.engine.model.regions.AbstractRegion)
    private function updateCollisionsPosition()
    {
        var i : Int = 0;
        while (i < getCollisionShapesList().length)
        {
            getCollisionShapesList()[i].updatePosition();
            i++;
        }
    }
    
    /**
	 * Clones the model and its state to a new instance
	 * @return	Copy of this model3d
	 */
    public function clone() : IModel3D
    {
        if (!_ready)
        {
            ExceptionManager.Throw(new ModelIsNotReadyException());return null;
        }
		if (_disposed) { warnDisposed("clone"); return null; }
        var cloner : Model3DCloner = new Model3DCloner();
        cloner.clone(this);
        return cloner.getClonedModel();
    }
    
    /**
	 * Checks if this 3d model has a given child
	 * @param	model	child model3d
	 * @return	true or false
	 */
    public function hasChild(model : IModel3D) : Bool
    {
        if (!_ready)
        {
            ExceptionManager.Throw(new ModelIsNotReadyException());return false;
        }
		if (_disposed) { warnDisposed("hasChild"); return false; }
        var regions : Array<IRegion> = getRegionList();
        var i : Int = 0;
        while (i < regions.length)
        {
            if (regions[i].hasChild(model))
            {
                return true;
            }
            i++;
        }
        return false;
    }
    
	/**
	 * Removes the model3d child from this parent
	 * @param	model	child model3d
	 */
    public function removeChild(model : IModel3D) : Void
    {
        if (!_ready)
        {
            ExceptionManager.Throw(new ModelIsNotReadyException());return;
        }
		if (_disposed) { warnDisposed("removeChild"); return; }
        var regions : Array<IRegion> = getRegionList();
        var i : Int = 0;
        while (i < regions.length)
        {
            if (regions[i].hasChild(model))
            {
                regions[i].removeChild(model);
                return;
            }
            i++;
        }
    }
    
	/**
	 * If this 3d model is brought into the scene as a child of another 3d model, it removes it from the parent
	 */
    public function removeFromParent() : Void
    {
		if (_disposed) { warnDisposed("removeFromParent"); return; }
        if (_parentRegion == null)
        {
            return;
        }
        if (_parentRegion.hasChild(this))
        {
            _parentRegion.removeChild(this);
        }
    }
    
	/**
	 * Adding another 3d model as a child to a given model. The function is used for hierarchical arrangement of the model on itself.
	 * @param	model	The instance of the model that is being added
	 * @param	regionId	Identifier of the region in which the object should be added. If no region is specified, the object will be added to the default region for that parent.
	 */
    public function addChild(model : IModel3D, regionId : String = null) : Void
    {
        if (!_ready)
        {
            ExceptionManager.Throw(new ModelIsNotReadyException());return;
        }
		if (_disposed) { warnDisposed("addChild"); return; }
        if (getRegionList().length == 0)
        {
            ExceptionManager.Throw(new ModelHaveNotRegionsException());return;
        }
        if (!model.isReady())
        {
            ExceptionManager.Throw(new AddingNotReadyChildException());return;
        }
        var region : IRegion = null;
        if (regionId == null || regionId == "")
        {
            var i : Int = 0;
			var regionList: Array<IRegion> = getRegionList();
            while (i < regionList.length)
            {
                if (regionList[i].canAddChild(model))
                {
                    region = regionList[i];
                    break;
                }
                i++;
            }
        }
        else
        {
            region = getRegion(regionId);
        }
        if (region == null)
        {
            region = getRegionList()[0];
        }
        region.addChild(model);
    }
    
	/**
	 * Checks if you can add a given 3d model as a child. Not every model can be added as a child, eg you cannot add inscriptions directly to the scene.
	 * @param	model	The instance of the model that is being added
	 * @param	regionId	Identifier of the region in which the object should be added. If no region is specified, the object will be added to the default region for that parent.
	 * @param	checkChildLimit	If true, it also checks the limit of added objects. In some cases, there may only be one object as a child.
	 * @return	true if a 3d model can be added as a child
	 */
    public function canAddChild(model : IModel3D, regionId : String = null, checkChildLimit : Bool = true) : Bool
    {
        if (!_ready)
        {
            ExceptionManager.Throw(new ModelIsNotReadyException());return false;
        }
		if (_disposed) { warnDisposed("canAddChild"); return false; }
        if (!model.isReady())
        {
            ExceptionManager.Throw(new ModelIsNotReadyException());return false;
        }
        if (getRegionList().length == 0)
        {
            return false;
        }
        var region : IRegion = null;
        if (regionId == null || regionId == "")
        {
            var i : Int = 0;
			var regionList: Array<IRegion> = getRegionList();
            while (i < regionList.length)
            {
                if (regionList[i].canAddChild(model, checkChildLimit))
                {
                    return true;
                }
                i++;
            }
        }
        else
        {
            region = getRegion(regionId);
            if (region == null)
            {
                return false;
            }
            return region.canAddChild(model, checkChildLimit);
        }
        return false;
    }
    
	/**
	 * Loads a 3d model from a file or binary data and immediately puts it into the scene.
	 * @param	urlOrData	File path or binary data
	 * @param	regionId	Identifier of the region in which the object should be added. If no region is specified, the object will be added to the default region for that parent.
	 * @return
	 */
    public function loadChild(urlOrData : Dynamic, regionId : String = null) : IModel3D
    {
		if (_disposed) { warnDisposed("loadChild"); return null; }
        var model : Model3D = new Model3D(urlOrData);
        _loadingModelsDict.set(model, regionId);
        model.addEventListener(Model3DEvent.IS_READY, loadingChildModelIsReady);
        model.addEventListener(Model3DEvent.LOAD_ERROR, loadingChildModelError);
        return model;
    }
    
    private function loadingChildModelIsReady(e : Model3DEvent) : Void
    {
        var model : Model3D = try cast(e.currentTarget, Model3D) catch(e:Dynamic) null;
        model.removeEventListener(Model3DEvent.IS_READY, loadingChildModelIsReady);
        model.removeEventListener(Model3DEvent.LOAD_ERROR, loadingChildModelError);
        var regionId : String = _loadingModelsDict.get(model);
        _loadingModelsDict.remove(model);
        addChild(model, regionId);
    }
    
    private function loadingChildModelError(e : Model3DEvent) : Void
    {
        var model : Model3D = try cast(e.currentTarget, Model3D) catch(e:Dynamic) null;
        model.removeEventListener(Model3DEvent.IS_READY, loadingChildModelIsReady);
        model.removeEventListener(Model3DEvent.LOAD_ERROR, loadingChildModelError);
        _loadingModelsDict.remove(model);
    }
    
    
    private var _hash : String = null;
    private function getModelHash() : String
    {
        if (!_ready)
        {
            ExceptionManager.Throw(new ModelIsNotReadyException());return null;
        }
        if (_hash == null)
        {
            //_hash = MD5.hashBytes(modelData.binaryData);
			_hash = Md5.make(modelData.binaryData).toHex();
        }
        return _hash;
    }
    
    /**
	 * Returns the definition of the 3d model as an object holding definition.xml
	 */
    public function getDescription() : FastXML
    {
        if (_ready && !_disposed)
        {
            return modelData.definition;
        }
        return null;
    }
    
	/**
	 * Returns model3d version
	 */
    public function getVersion() : Int
    {
        if (_ready && !_disposed)
        {
            return modelData.version;
        }
        return 0;
    }
    
	/**
	 * Returns model3d main general type id
	 */
    public function getGeneralType() : String
    {
        if (_ready && !_disposed)
        {
            return _definitionParser.type;
        }
        return null;
    }
    
	/**
	 * Returns model3d general types collection (ex. subtypes)
	 */
    public function getGeneralCollection() : ICollection
    {
        if (_ready && !_disposed)
        {
            return _definitionParser.collection;
        }
        return null;
    }
    
	/**
	 * Returns handle definitions for some models. Grips are used to specify different places where you can snap a model to another model.
	 */
    public function getHandlers() : IHandlerCollection
    {
        if (_ready && !_disposed)
        {
            return _definitionParser.handlers;
        }
        return null;
    }
    
	/**
	 * Returns a list of available regions for a given 3d model
	 * @see pl.pkapusta.engine.model.regions.AbstractRegion
	 * @see pl.pkapusta.engine.model.regions.LineRegion
	 * @see pl.pkapusta.engine.model.regions.PointRegion
	 * @see pl.pkapusta.engine.model.regions.SurfaceRegion
	 */
    public function getRegionList() : Array<IRegion>
    {
        if (_ready && !_disposed)
        {
            return _definitionParser.regionList;
        }
        return null;
    }
	
	/**
	 * Returns an object that defines the region of the model
	 * @param	id	The unique identifier of the region
	 * @return	IRegion object
	 * @see pl.pkapusta.engine.model.regions.AbstractRegion
	 * @see pl.pkapusta.engine.model.regions.LineRegion
	 * @see pl.pkapusta.engine.model.regions.PointRegion
	 * @see pl.pkapusta.engine.model.regions.SurfaceRegion
	 */
    public function getRegion(id : String) : IRegion
    {
        if (_ready && !_disposed)
        {
            return _definitionParser.getRegion(id);
        }
        return null;
    }
    
	/**
	 * Returns an object describing the 3d model selection.
	 * @see pl.pkapusta.engine.model.selection.AbstractSelection
	 * @see pl.pkapusta.engine.model.selection.StandardSelection
	 * @see pl.pkapusta.engine.model.selection.SurfaceSelection
	 */
    public function getSelectionObject() : AbstractSelection
    {
        if (_ready && !_disposed)
        {
            return _definitionParser.selection;
        }
        return null;
    }
    
	/**
	 * Returns a list of model edit attributes
	 */
    public function getEditAttributes() : IEditAttributes
    {
        if (_ready && !_disposed)
        {
            return _definitionParser.editAttributes;
        }
        return null;
    }
    
	/**
	 * Changes the properties of a model3d object
	 * @param	id	The unique ID of the property
	 * @param	value	The value to which we change the property
	 */
    public function changeProperty(id : String, value : Any) : Void
    {
        if (!_ready)
        {
            ExceptionManager.Throw(new ModelIsNotReadyException());return;
        }
		if (_disposed) { warnDisposed("changeProperty"); return; }
        if (_contextReady)
        {
            if (modelData.executor != null && ExecutorJS.instanceOf(modelData.executor, IM3DExecutorProperty))
            {
                ExecutorJS.castTo(modelData.executor, IM3DExecutorProperty).updateProperty(id, value);
            }
        }
        else
        {
            _execBridge.setNoContextProperty(id, value);
        }
    }
    
	/**
	 * Returns a property of the object
	 * @param	id	The unique ID of the property
	 * @return	Property value
	 */
    public function getProperty(id : String) : Any
    {
        if (!_ready)
        {
            ExceptionManager.Throw(new ModelIsNotReadyException()); return null;
        }
		if (_disposed) { warnDisposed("getProperty"); return null; }
        if (_contextReady)
        {
            return _execBridge.getProperty(id);
        }
        else
        {
            return _execBridge.getNoContextProperty(id);
        }
    }
    
	/**
	 * Returns information from the model instance, e.g. area
	 * @param	type	The type of information we're asking for
	 * @param	params	Optional input parameters
	 * @return	Information we request
	 */
    public function getInfo(type : String, params : Dynamic = null) : Dynamic
    {
        if (!_ready)
        {
            ExceptionManager.Throw(new ModelIsNotReadyException()); return null;
        }
		if (_disposed) { warnDisposed("getInfo"); return null; }
		if (_definitionParser.informations != null)
        {
            var info : InformationData = _definitionParser.informations.getByType(type);
            if (info == null)
            {
                return null;
            }
            if (info.executableGet != null)
            {
				//trace("info.executableGet: " + info.executableGet);
                try
                {
					var func_str = "get" + info.executableGet.charAt(0).toUpperCase() + info.executableGet.substr(1);
					//trace("testing: " + func_str);
					var call_func : Function = Reflect.field(modelData.executor, func_str);
					//trace(call_func);
					if (call_func == null) {
						func_str = "get_" + info.executableGet;
						//trace("testing: " + func_str);
						call_func = Reflect.field(modelData.executor, func_str);
					}
					if (call_func == null) throw "Executable get '" + info.executableGet + "' not found";
					return Reflect.callMethod(modelData.executor, call_func, []);
                }
                catch (e : Any)
                {
                    throw e;
                    //throw new ModelInfoReadException();
                }
            }
            else if (info.executableCall != null)
            {
				//trace("info.executableCall: " + info.executableCall);
                try
                {
					var call_func : Function = Reflect.field(modelData.executor, info.executableCall);
					if (call_func == null) throw "Executable call '" + info.executableCall + "' not found";
					return Reflect.callMethod(modelData.executor, call_func, [ParamStorage.buildFromParamsObj(params)]);
                }
                catch (e : Any)
                {
                    throw e;
                    //throw new ModelInfoReadException();
                }
            }
        }
        return null;
    }
    
	/**
	 * Returns true if the model is ready to be inserted into the scene
	 */
    public function isReady() : Bool
    {
        return _ready;
    }
    
	/**
	 * Returns main project object
	 */
    public function getProject() : IProject3D
    {
        return _project;
    }
    
	/**
	 * Returns the parent 3d model of the given 3d model or null if the given model is the root
	 */
    public function getParent() : IModel3D
    {
        return _parent;
    }
   
	/**
	 * Returns the parent region of the given 3d model or null if the given model is the root
	 * @see pl.pkapusta.engine.model.regions.AbstractRegion
	 * @see pl.pkapusta.engine.model.regions.LineRegion
	 * @see pl.pkapusta.engine.model.regions.PointRegion
	 * @see pl.pkapusta.engine.model.regions.SurfaceRegion
	 */
    public function getParentRegion() : IRegion
    {
        return _parentRegion;
    }
    
	/**
	 * Returns an object describing the position of the model relative to the region of the parent model it is in.
	 * @see pl.pkapusta.engine.model.regions.position.AbstractRegionPosition
	 * @see pl.pkapusta.engine.model.regions.position.SurfaceRegionPosition
	 */
    public function getRegionPosition() : AbstractRegionPosition
    {
        return _regionPosition;
    }
    
	/**
	 * Returns true if the model is currently selected
	 */
    public function isSelected() : Bool
    {
        return _selected;
    }
    
	/**
	 * Marks or unmarks an object. If another object is selected at the moment, it deselects it.
	 * @param	value	true or false
	 */
    public function setSelected(value : Bool) : Bool
    {
		if (!_ready)
        {
            ExceptionManager.Throw(new ModelIsNotReadyException()); return null;
        }
		if (_disposed) { warnDisposed("setSelected"); return false; }
        if (value == _selected)
        {
            return value;
        }
		if (value && !isInteractive()) {
			untyped __js__("console.warn({0}, {1})", "Can't use setSelected(true) on not interactive model object: %o", this);
			return false;
		}
        if (_project != null)
        {
            _project.setSelectedModel( ((value)) ? this : null );
        }
        return value;
    }
	
	/**
	 * Returns whether the 3d model is interactive. By default, each model is interactive, but you can set it to stop being so. A model that is not interactive does not react to user interactions, i.e. selecting, moving, etc.
	 * @return	true or false
	 * @see setInteractive(value : Bool)
	 */
	public function isInteractive() : Bool
    {
        return _interactive;
    }
    
	/**
	 * Set whether the 3d model is interactive. By default, each model is interactive, but you can set it to stop being so. A model that is not interactive does not react to user interactions, i.e. selecting, moving, etc.
	 * @param	value	true or false
	 */
	public function setInteractive(value : Bool) : Bool
	{
		if (_disposed) { warnDisposed("setInteractive"); return false; }
		if (value == _interactive) {
            return value;
        }
		_interactive = value;
		if (_ready) {
			if (!_interactive) {
				if (isSelected()) setSelected(false);
			}
		}
		_container.setMouseContextEnabled(_interactive);
		return value;
	}
    
	@:dox(hide)
    public function getContainer() : Model3DContainer
    {
        return _container;
    }
    
	@:dox(hide)
    public function getCameraSettingsXML() : FastXML
    {
        return _definitionParser.cameraXML;
    }
    
	@:dox(hide)
    public function getContext() : IResourceContext
    {
        return _context;
    }
    
	@:dox(hide)
    public function setContext(value : IResourceContext) : IResourceContext
    {
        _context = value;
        return value;
    }
    
	/**
	 * Returns a list of sections, i.e. groups of properties. Each 3d model contains properties that are grouped into sections. This can be used to group parameters in the user GUI.
	 */
    public function getSections() : Array<ISection>
    {
        return _properties.sections;
    }
    
	/**
	 * Returns a list of all model3d available properties
	 */
    public function getProperties() : Array<IProperty>
    {
        return _properties.properties;
    }
    
	/**
	 * Returns a list of all hidden model3d properties
	 */
    private function getHiddenProperties() : Array<IProperty>
    {
        return _properties.hiddenProperties;
    }
    
	/**
	 * If true, the model will automatically delete used resources (e.g. textures, mesh) and state from memory each time it is removed from the scene. If false model3d will keep resources and state in memory for reuse when reloaded into the scene.
	 */
    public function isAutoDisposeContext() : Bool
    {
        return _autoDisposeContext;
    }
    
	/**
	 * Sets whether the model will automatically clear used resources (e.g. textures, mesh) from memory and the state each time it is removed from the scene. If false model3d will keep resources and state in memory for reuse when reloaded into the scene. If true, the model should destroy its resources after being removed from the scene.
	 * @param	value	AutoDisposeContext
	 * @see isAutoDisposeContext()
	 */
    public function setAutoDisposeContext(value : Bool) : Bool
    {
        if (_autoDisposeContext == value)
        {
            return value;
        }
        _autoDisposeContext = value;
        return value;
    }
    
	/**
	 * If true, the model will automatically build its resources when it is loaded into the scene. For example, when it is read from a file for the first time or it is removed from the scene and it destroys its resources because the value of isAutoDisposeContext was true.
	 * @see isAutoDisposeContext()
	 */
    public function isAutoBuildContext() : Bool
    {
        return _autoBuildContext;
    }
    
	/**
	 * Sets whether the model will automatically build its resources when it is loaded into the scene. For example, when it is read from a file for the first time or it is removed from the scene and it destroys its resources because the value of isAutoDisposeContext was true.
	 * @param	value	true or false
	 * @see isAutoDisposeContext()
	 */
    public function setAutoBuildContext(value : Bool) : Bool
    {
        if (_autoBuildContext == value)
        {
            return value;
        }
        _autoBuildContext = value;
        return value;
    }
    
	/**
	 * Returns true when model3d is ready and its context was created
	 */
    public function isContextReady() : Bool
    {
        return _contextReady;
    }
    
	/**
	 * Returns an object describing a 3d model property based on the property ID
	 * @param	id	property ID
	 * @return	an object describing a 3d model property
	 */
    public function propertyById(id : String) : IProperty
    {
        return _properties.propertyById(id);
    }
    
	/**
	 * Checks if model3d has a property with the given ID
	 * @param	id	property ID
	 * @return	true or false
	 */
    public function hasProperty(id : String) : Bool
    {
        return _properties.hasProperty(id);
    }
    
    /* SAVE INTERFACES */
    
    private var _extraData : FastXML = FastXML.parse("<extra/>");
    private var _embedType : String = EmbedType.DEFAULT;
    
	@:dox(hide)
    public function getExtraData() : FastXML
    {
        return _extraData;
    }
    
	/**
	 * Whether the models will be saved in the project in EMBEDDED mode by default. Global value for all models.
	 */
    public function getDefaultEmbed() : Bool
    {
        return _defaultEmbed;
    }
    
	/**
	 * Whether the models will be saved in the project in EMBEDDED mode by default. Global value for all models.
	 * @param	value	true or false
	 */
    public function setDefaultEmbed(value : Bool) : Bool
    {
        _defaultEmbed = value;
        return value;
    }
    
	/**
	 * Returns whether the object should be individually embeddable. Possible values: default, embedded, no_embedded.
	 * @return	possible values: default, embedded, no_embedded
	 * @see pl.pkapusta.engine.common.enums.EmbedType
	 */
    public function getEmbedType() : String
    {
        return _embedType;
    }
    
	/**
	 * Sets whether the object should be individually embeddable. Possible values: default, embedded, no_embedded.
	 * @param	value	default, embedded, no_embedded
	 * @see pl.pkapusta.engine.common.enums.EmbedType
	 */
    public function setEmbedType(value : String) : String
    {
        _embedType = value;
        return value;
    }
}

