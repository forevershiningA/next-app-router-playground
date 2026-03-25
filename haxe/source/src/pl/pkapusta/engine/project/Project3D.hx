package pl.pkapusta.engine.project;

import away3d.containers.ObjectContainer3D;
import away3d.containers.View3D;
import away3d.events.MouseEvent3D;
import haxe.Exception;
import pl.pkapusta.engine.common.interfaces.IDisposable;
import pl.pkapusta.engine.events.Engine3DModelEvent;
import pl.pkapusta.engine.Engine3DModel;
import pl.pkapusta.engine.events.Engine3DCameraEvent;
import pl.pkapusta.engine.model.events.Model3DEvent;
import pl.pkapusta.engine.model.IModel3D;
import pl.pkapusta.engine.model.Model3D;
import pl.pkapusta.engine.model.regions.IRegion;
import pl.pkapusta.engine.project.data.parsers.Project3DParser;
import pl.pkapusta.engine.project.data.ProjectSaveCustomizator;
import pl.pkapusta.engine.project.data.SceneData;
import pl.pkapusta.engine.utils.mouse.MouseUtil;
import pl.pkapusta.engine.view.events.ViewRenderEvent;
import pl.pkapusta.engine.IEngine3DView;
import openfl.display.Stage;
import openfl.events.Event;
import openfl.events.EventDispatcher;
import openfl.events.MouseEvent;
import openfl.utils.ByteArray;



/**
	 * @author Przemysław Kapusta
	 */
class Project3D extends EventDispatcher implements IProject3D implements IDisposable
{
    public var model(get, never) : Engine3DModel;
    public var sceneData(get, never) : SceneData;
    public var sceneScale(get, set) : Float;

    
    private var _rootModel : Model3D = null;
    
    private var _model : Engine3DModel;
    private var _sceneData : SceneData;
    //private var _mouseDownList:Vector.<MouseEvent3DData>
    
    private var _selectedModel : Model3D;
    
    private var _sceneScale : Float = 1;
    
    private var stage : Stage;
    private var view : View3D;
    
    public function new(model : Engine3DModel)
    {
        super();
        _model = model;
        if (_model.stage != null)
        {
            stage = _model.stage;
            view = _model.getView();
            initView();
        }
        else
        {
            _model.addEventListener(Event.ADDED_TO_STAGE, modelAddedToStage);
        }
        _sceneData = new SceneData();
        _model.addEventListener(ViewRenderEvent.BEFORE_RENDER, beforeRenderHandler);
        _model.addEventListener(ViewRenderEvent.AFTER_RENDER, dispatchEvent);
    }
	
	override public function dispatchEvent(event:Event):Bool 
	{
		#if (haxe_ver >= 4.1)
		try {
			return super.dispatchEvent(event);
		} catch (e:Exception) {
			js.html.Console.error("Error occured when dispatching '" + event.type + "' event on Project3D. Please check your '" + event.type + "' function code.");
			js.html.Console.error(e.message);
			return false;
		}
		#else
		try {
			return super.dispatchEvent(event);
		} catch (e:Dynamic) {
			trace("Error occured when dispatching '" + event.type + "' event on Project3D. Please check your '" + event.type + "' function code.");
			var stack = haxe.CallStack.exceptionStack();
			trace(haxe.CallStack.toString(stack));
			return false;
		}
		#end
	}
    
    private function modelAddedToStage(e : Event) : Void
    {
        _model.removeEventListener(Event.ADDED_TO_STAGE, modelAddedToStage);
        stage = _model.stage;
        view = _model.getView();
        initView();
    }
    
    private function initView() : Void
    {
        view.addEventListener(MouseEvent.CLICK, projectViewClickHandle);
    }
    
    private function deinitView() : Void
    {
        view.removeEventListener(MouseEvent.CLICK, projectViewClickHandle);
    }
    
    private function beforeRenderHandler(e : ViewRenderEvent) : Void
    /*if (_mouseDownList) {
				var model:Model3D = _mouseDownList[0].model;
				//model.correctModel3DMouseDownHandler(_mouseDownList[0].e);
				//_mouseDownList = null;
			}*/
    {
        
        dispatchEvent(e);
    }
    
    public function loadRootModel(urlOrData : Dynamic) : IModel3D
    {
        var model : Model3D = new Model3D(urlOrData);
        setRootModel(model);
        return model;
    }
    
    public function setRootModel(model : IModel3D) : Void
    {
        if (_rootModel != null)
        {
            _rootModel.unregisterModelFromParent();
            _rootModel = null;
        }
        if (model != null)
        {
            _rootModel = try cast(model, Model3D) catch(e:Dynamic) null;
            cast((model), Model3D).registerModelForParent(this, null, null, null);
            if (_rootModel.isReady())
            {
                initRootModelWhenIsReady();
            }
            else
            {
                _rootModel.addEventListener(Model3DEvent.IS_READY, rootModelIsReadyHandler);
            }
        }
    }
    
    private function rootModelIsReadyHandler(e : Model3DEvent) : Void
    {
        var model : Model3D = try cast(e.currentTarget, Model3D) catch(e:Dynamic) null;
        model.removeEventListener(Model3DEvent.IS_READY, rootModelIsReadyHandler);
        if (model == _rootModel)
        {
            initRootModelWhenIsReady();
        }
    }
    
    private function initRootModelWhenIsReady() : Void
    {
        updateCameraSettings(_selectedModel);
    }
    
    public function getRootModel() : IModel3D
    {
        return _rootModel;
    }
    
    public function getSelectedModel() : IModel3D
    {
        return _selectedModel;
    }
    
    public function setSelectedModel(value : IModel3D) : IModel3D
    {
        if (value == _selectedModel)
        {
            return value;
        }
        handleSelectModel(try cast(value, Model3D) catch(e:Dynamic) null);
        return _selectedModel;
    }
    
    /*e3d function handleModel3DMouseDown(e:MouseEvent3D, model:Model3D):void {
			if (!_mouseDownList) _mouseDownList = new Vector.<MouseEvent3DData>();
			_mouseDownList.push(new MouseEvent3DData(e, model));
		}*/
    
    private function get_model() : Engine3DModel
    {
        return _model;
    }
    
    private function get_sceneData() : SceneData
    {
        return _sceneData;
    }
    
    private function get_sceneScale() : Float
    {
        return _sceneScale;
    }
    
    private function set_sceneScale(value : Float) : Float
    {
        if (_sceneScale == value)
        {
            return value;
        }
        _sceneScale = value;
        return value;
    }
    
    private var selCameraXML : FastXML = null;
    public function handleSelectModel(model3D : Model3D) : Bool
    {
        if (_selectedModel == model3D) {
            return false;
        }
		if (model3D != null && !model3D.isInteractive()) {
			return false;
		}
        _selectedModel = model3D;
        model.dispatchEvent(new Engine3DModelEvent(Engine3DModelEvent.MODEL_SELECT, model3D));
        dispatchEvent(new Engine3DModelEvent(Engine3DModelEvent.MODEL_SELECT, model3D));
        
        //camera update
        updateCameraSettings(model3D);
		
		return true;
    }
    
    private function updateCameraSettings(forModel : Model3D) : Void
    {
        
        var m : Model3D = forModel;
        var cameraXML : FastXML = null;
        while (m != null && m.getCameraSettingsXML() == null)
        {
            m = try cast(m.getParent(), Model3D) catch(e:Dynamic) null;
        }
        if (m != null)
        {
            cameraXML = m.getCameraSettingsXML();
        }
        if ((cameraXML == null) && (getRootModel() != null) && (cast((getRootModel()), Model3D).getCameraSettingsXML() != null))
        {
            m = try cast(getRootModel(), Model3D) catch(e:Dynamic) null;
            cameraXML = m.getCameraSettingsXML();
        }
        
        if (cameraXML != null)
        {
            if (selCameraXML != cameraXML)
            {
                var mContainer : ObjectContainer3D = m.getContainer().contextContainer;
                //model.dispatchEvent(new Engine3DCameraEvent(Engine3DCameraEvent.SET_CAMERA_MODE, cameraXML, mContainer.sceneTransform));
                model.dispatchEvent(new Engine3DCameraEvent(Engine3DCameraEvent.SET_CAMERA_MODE, m));
                selCameraXML = cameraXML;
            }
        }
        else if (selCameraXML != null)
        {
            model.dispatchEvent(new Engine3DCameraEvent(Engine3DCameraEvent.REMOVE_CAMERA_MODE));
            selCameraXML = null;
        }
    }
    
    private var currentTimeModelClick : Bool = false;
    public function handleModelClick(model : Model3D) : Void
    {
        currentTimeModelClick = true;
    }
    
    private function projectViewClickHandle(e : MouseEvent) : Void
    {
        as3hx.Compat.setTimeout(afterModelClickHandle, 0);
    }
    
    private function afterModelClickHandle() : Void
    {
        if (!currentTimeModelClick)
        {
            if (!MouseUtil.checkForMouseDragged())
            {
                handleSelectModel(null);
            }
        }
        currentTimeModelClick = false;
    }
    
    public function disposeWithChildren() : Void
    {
        doDispose(true);
    }
    
    public function dispose() : Void
    {
        doDispose(false);
    }
    
    private function doDispose(withChildren : Bool) : Void
    {
        if (stage != null)
        {
            deinitView();
            stage = null;
            view = null;
        }
        else
        {
            _model.removeEventListener(Event.ADDED_TO_STAGE, modelAddedToStage);
        }
        
        if (_rootModel != null)
        {
            _rootModel.unregisterModelFromParent();
            var i : Int = 0;
			var regionList: Array<IRegion> = _rootModel.getRegionList();
            while (i < regionList.length)
            {
                var list : Array<IModel3D> = regionList[i].getChildList();
                var j : Int = 0;
                while (j < list.length)
                {
                    list[j].removeFromParent();
                    if (withChildren)
                    {
                        list[j].disposeWithChildren();
                    }
                    j++;
                }
                i++;
            }
            if (withChildren)
            {
                _rootModel.disposeWithChildren();
            }
            _rootModel = null;
        }
        _model.removeEventListener(ViewRenderEvent.BEFORE_RENDER, dispatchEvent);
        _model.removeEventListener(ViewRenderEvent.AFTER_RENDER, dispatchEvent);
        _model = null;
    }
    
    @:allow(pl.pkapusta.engine.Engine3DModel)
    private function writeStream(customizator : ProjectSaveCustomizator, engineView : IEngine3DView) : ByteArray
    {
        var stream : ByteArray = new ByteArray();
        var parser : Project3DParser = new Project3DParser();
        parser.writeCustomizator = customizator;
        parser.engineView = engineView;
        //trace("engineView: " + engineView);
        if (parser.writeCustomizator == null)
        {
            parser.writeCustomizator = new ProjectSaveCustomizator();
        }
        parser.project = this;
        parser.writeStream(stream);
        parser = null;
        return stream;
    }
}



class MouseEvent3DData
{
    public var e(get, never) : MouseEvent3D;
    public var model(get, never) : Model3D;

    private var _e : MouseEvent3D;
    private var _model : Model3D;
    public function new(e : MouseEvent3D, model : Model3D)
    {
        _e = e;
        _model = model;
    }
    private function get_e() : MouseEvent3D
    {
        return _e;
    }
    private function get_model() : Model3D
    {
        return _model;
    }
}