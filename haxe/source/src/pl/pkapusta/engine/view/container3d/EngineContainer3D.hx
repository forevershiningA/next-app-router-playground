package pl.pkapusta.engine.view.container3d;

import haxe.Exception;
import openfl.errors.Error;
import away3d.cameras.Camera3D;
import away3d.containers.ObjectContainer3D;
import away3d.containers.Scene3D;
import away3d.containers.View3D;
import away3d.entities.Mesh;
import away3d.events.MouseEvent3D;
import away3d.materials.ColorMaterial;
import away3d.primitives.SphereGeometry;
import away3d.primitives.WireframeSphere;
import pl.pkapusta.engine.events.Engine3DCameraEvent;
import pl.pkapusta.engine.project.IProject3D;
import pl.pkapusta.engine.project.Project3D;
import pl.pkapusta.engine.view.container3d.controllers.CameraController;
import pl.pkapusta.engine.view.container3d.controllers.modes.*;
import pl.pkapusta.engine.view.data.RenderToImageParams;
import pl.pkapusta.engine.view.events.ViewRenderEvent;
import pl.pkapusta.engine.view.utils.SharedStage3D;
import openfl.display.BitmapData;
import openfl.display.DisplayObjectContainer;
import openfl.events.Event;
import openfl.events.EventDispatcher;

/**
	 * @author Przemysław Kapusta
	 */
class EngineContainer3D extends EventDispatcher
{
    public var doRender(get, set) : Bool;
    public var cameraInterface(get, never) : IAbstractCamera;
    public var width(get, set) : Float;
    public var height(get, set) : Float;
    public var x(get, set) : Float;
    public var y(get, set) : Float;
    public var visible(get, set) : Bool;

    
    private var view : View3D;
    private var parentDisplay : DisplayObjectContainer;
    
    private var _doRender : Bool = true;
    
    private var _rootContainer : ObjectContainer3D;
    
    private var _sharedStage3D : SharedStage3D;
    
    private var cameraController : CameraController;
    private var project : Project3D;
    
    public function new(parentDisplay : DisplayObjectContainer, sharedStage3D : SharedStage3D = null)
    {
        super();
        this.parentDisplay = parentDisplay;
        _sharedStage3D = sharedStage3D;
        init3d();
    }
	
	override public function dispatchEvent(event:Event):Bool 
	{
		#if (haxe_ver >= 4.1)
		try {
			return super.dispatchEvent(event);
		} catch (e:Exception) {
			js.html.Console.error("Error occured when dispatching '" + event.type + "' event on EngineContainer3D. Please check your '" + event.type + "' function code.");
			js.html.Console.error(e.message);
			return false;
		}
		#else
		try {
			return super.dispatchEvent(event);
		} catch (e:Dynamic) {
			trace("Error occured when dispatching '" + event.type + "' event on EngineContainer3D. Please check your '" + event.type + "' function code.");
			var stack = haxe.CallStack.exceptionStack();
			trace(haxe.CallStack.toString(stack));
			return false;
		}
		#end
	}
    
    private function init3d() : Void
    {
        var scene : Scene3D = new Scene3D();
        var camera : Camera3D = new Camera3D();
        
        view = new View3D(scene, camera);
        
        if (_sharedStage3D != null)
        {
            view.stage3DProxy = _sharedStage3D.stage3DProxy;
            view.shareContext = _sharedStage3D.isShared;
        }
        else
        {
            view.backgroundColor = 0x000000;
            view.antiAlias = 4;
        }
        
        parentDisplay.addChild(view);
        registerEnterFrame();
        cameraController = new CameraController(view, this);
        
        if (cameraController != null)
        {
            addEventListener(Engine3DCameraEvent.SET_CAMERA_MODE, cameraController.dispatchEvent);
            addEventListener(Engine3DCameraEvent.REMOVE_CAMERA_MODE, cameraController.dispatchEvent);
            addEventListener(Engine3DCameraEvent.LOCK_CAMERA, cameraController.dispatchEvent);
            addEventListener(Engine3DCameraEvent.UNLOCK_CAMERA, cameraController.dispatchEvent);
        }
    }
    
    private function registerEnterFrame() : Void
    {
        if (_sharedStage3D != null)
        {
            _sharedStage3D.addEventListener(Event.ENTER_FRAME, enterFrameUpdate);
        }
        else
        {
            parentDisplay.addEventListener(Event.ENTER_FRAME, enterFrameUpdate);
        }
    }
    
    private function unregisterEnterFrame() : Void
    {
        if (_sharedStage3D != null)
        {
            _sharedStage3D.removeEventListener(Event.ENTER_FRAME, enterFrameUpdate);
        }
        else
        {
            parentDisplay.removeEventListener(Event.ENTER_FRAME, enterFrameUpdate);
        }
    }
    
    private function enterFrameUpdate(e : Event) : Void
    {
        try
        {
            if (cameraController != null)
            {
                cameraController.update();
            }
            dispatchEvent(new ViewRenderEvent(ViewRenderEvent.BEFORE_RENDER, view));
            view.render();
            dispatchEvent(new ViewRenderEvent(ViewRenderEvent.AFTER_RENDER, view));
        }
        catch (err : Error)
        {
            doRender = false;
            trace(err.getStackTrace());
        }
    }
    
    public function renderToBitmap(params : RenderToImageParams) : BitmapData
    {
        var changeCamera : Bool = (params != null && params.camera != null);
        var changeSize : Bool = (params != null && (!Math.isNaN(params.width) || !Math.isNaN(params.width)));
        
        var w : Int = Std.int(view.width);
        var h : Int = Std.int(view.height);
        
		var prevCam : Camera3D = null;
		
        if (changeCamera)
        {
            params.camera.lens.far = view.camera.lens.far;
            params.camera.lens.near = view.camera.lens.near;
            prevCam = view.camera;
            view.camera = params.camera;
        }
        
		var prevW : Float = 0;
		var prevH : Float = 0;
		
        if (changeSize)
        {
            w = ((!Math.isNaN(params.width))) ? params.width : w;
            h = ((!Math.isNaN(params.height))) ? params.height : h;
            
            prevW = view.width;
            prevH = view.height;
            
            view.width = w;
            view.height = h;
        }
        
        var bmp : BitmapData = new BitmapData(w, h, false, 0x000000);
        view.renderer.queueSnapshot(bmp);
        view.render();
        
        if (changeCamera && prevCam != null) {
            view.camera = prevCam;
        }
        
        if (changeSize) {
            view.width = prevW;
            view.height = prevH;
        }
        
        if (changeCamera || changeSize)
        {
            view.render();
        }
        
        return bmp;
    }
    
    public function modelRootConnect(container : ObjectContainer3D) : Void
    {
        if (_rootContainer != null)
        {
            view.scene.removeChild(_rootContainer);
            _rootContainer = null;
        }
        if (container != null)
        {
            _rootContainer = container;
            view.scene.addChild(_rootContainer);
        }
    }
    
    public function setNewEnviroment(enviromentXML : FastXML) : Void
    {
        if (cameraController != null)
        {
            cameraController.setNewEnviroment(enviromentXML);
        }
    }
    
    public function setNewProject(project : IProject3D) : Void
    //trace("set project: " + project + "!!!!!!!!!!!!!!!!!!!!!");
    {
        
        this.project = try cast(project, Project3D) catch(e:Dynamic) null;
    }
    
    public function getModelProject() : Project3D
    {
        return project;
    }
    
    public function getProjectScale() : Float
    {
        if (project != null)
        {
            return project.sceneScale;
        }
        return 1;
    }
    
    private function get_doRender() : Bool
    {
        return _doRender;
    }
    
    private function set_doRender(value : Bool) : Bool
    {
        if (_doRender == value)
        {
            return value;
        }
        _doRender = value;
        if (_doRender)
        {
            registerEnterFrame();
            if (cameraController != null && !cameraController.getCurrenrCameraMode().enabled)
            {
                cameraController.getCurrenrCameraMode().enabled = true;
            }
        }
        else
        {
            unregisterEnterFrame();
            if (cameraController != null && cameraController.getCurrenrCameraMode().enabled)
            {
                cameraController.getCurrenrCameraMode().enabled = false;
            }
        }
        return value;
    }
    
    private function get_cameraInterface() : IAbstractCamera
    {
        if (cameraController == null)
        {
            return null;
        }
        return cameraController.cameraInterface;
    }
    
    private function get_width() : Float
    {
        return view.width;
    }
    private function set_width(value : Float) : Float
    {
        view.width = value;
        return value;
    }
    private function get_height() : Float
    {
        return view.height;
    }
    private function set_height(value : Float) : Float
    {
        view.height = value;
        return value;
    }
    private function get_x() : Float
    {
        return view.x;
    }
    private function set_x(value : Float) : Float
    {
        view.x = value;
        return value;
    }
    private function get_y() : Float
    {
        return view.y;
    }
    private function set_y(value : Float) : Float
    {
        view.y = value;
        return value;
    }
    private function get_visible() : Bool
    {
        return view.visible;
    }
    private function set_visible(value : Bool) : Bool
    {
        view.visible = value;
        return value;
    }
    
    public function getView() : View3D
    {
        return view;
    }
    
    public function destroy() : Void
    {  /**
			 * TODO: napisać destroy
			 */  
        
    }
}

