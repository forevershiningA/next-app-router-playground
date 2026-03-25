package pl.pkapusta.engine;

import haxe.Exception;
import away3d.containers.View3D;
import haxe.crypto.Base64;
import haxe.io.Bytes;
import haxe.io.UInt8Array;
import openfl.geom.Rectangle;
import pl.pkapusta.engine.common.enums.IOFormat;
import pl.pkapusta.engine.common.mvc.IController;
import pl.pkapusta.engine.common.mvc.IModel;
import pl.pkapusta.engine.Engine3DController;
import pl.pkapusta.engine.Engine3DModel;
import pl.pkapusta.engine.common.mvc.utils.AbstractSpriteView;
import pl.pkapusta.engine.events.Engine3DCameraEvent;
import pl.pkapusta.engine.events.Engine3DContainerEvent;
import pl.pkapusta.engine.events.Engine3DNewProjectEvent;
import pl.pkapusta.engine.view.container3d.controllers.modes.*;
import pl.pkapusta.engine.view.container3d.EngineContainer3D;
import pl.pkapusta.engine.view.data.BaseEncoderOptions;
import pl.pkapusta.engine.view.data.RenderToImageParams;
import pl.pkapusta.engine.view.events.ViewRenderEvent;
import pl.pkapusta.engine.view.graphics3d.Include;
import pl.pkapusta.engine.view.utils.SharedStage3D;
import openfl.display.BitmapData;
import openfl.display.DisplayObjectContainer;
import openfl.display.Stage;
import openfl.events.Event;

/**
 * Main 3D View and camera control for Engine 3D. Rendering a scene to an image.
 * 
 * @author Przemysław Kapusta
 */
class Engine3DView extends AbstractSpriteView implements IEngine3DView
{
    public var isRendering(get, never) : Bool;
    public var camera(get, never) : IAbstractCamera;
    public var width(get, set) : Float;
    public var height(get, set) : Float;

    
    //includes
    private var graphics3d : Include;
    
    private var container3d : EngineContainer3D;
    private var stage : Stage;
    private var sharedStage3D : SharedStage3D;
    
    public function new(model : Engine3DModel, controller : Engine3DController, parent : DisplayObjectContainer, sharedStage3D : SharedStage3D)
    {
        super(model, controller, parent);
        this.sharedStage3D = sharedStage3D;
        init3dContainer();
        stage = display.stage;
        if (stage == null)
        {
            display.addEventListener(Event.ADDED_TO_STAGE, displayAddedToStage);
        }
        else
        {
            initStage();
        }
    }
	
	override public function dispatchEvent(event:Event):Bool 
	{
		#if (haxe_ver >= 4.1)
		try {
			return super.dispatchEvent(event);
		} catch (e:Exception) {
			js.html.Console.error("Error occured when dispatching '" + event.type + "' event on Engine3DView. Please check your '" + event.type + "' function code.");
			js.html.Console.error(e.message);
			return false;
		}
		#else
		try {
			return super.dispatchEvent(event);
		} catch (e:Dynamic) {
			trace("Error occured when dispatching '" + event.type + "' event on Engine3DView. Please check your '" + event.type + "' function code.");
			var stack = haxe.CallStack.exceptionStack();
			trace(haxe.CallStack.toString(stack));
			return false;
		}
		#end
	}
    
    private function displayAddedToStage(e : Event) : Void
    {
        display.removeEventListener(Event.ADDED_TO_STAGE, displayAddedToStage);
        stage = display.stage;
        initStage();
    }
    
    private function initStage() : Void
    {
    }
    
    private function deinitStage() : Void
    {
    }
    
	/**
	 * Renders the scene to the image
	 * 
	 * @param	encoder	An object specifying how to encode the image.
	 * Possible codecs:
	 * - JPEG: see Engine3D.utils.JPEGEncoderOptions (pl.pkapusta.engine.view.data.JPEGEncoderOptions)
	 * - PNG: see Engine3D.utils.PNGEncoderOptions (pl.pkapusta.engine.view.data.PNGEncoderOptions)
	 * 
	 * @param	params	Rendering parameters, i.e. camera, height and width
	 * @param	output	Possible values: Uint8Array, Base64String, Bytes; see Engine3D.enums.IOFormat (pl.pkapusta.engine.common.enums.IOFormat)
	 * @return	Rendering result in selected format
	 */
    public function renderToImage(encoder: BaseEncoderOptions, params: RenderToImageParams = null, output: String = "Uint8Array") : Dynamic
    {
        var bmp:BitmapData = container3d.renderToBitmap(params);
		var ba:Bytes = bmp.encode(new Rectangle(0, 0, bmp.width, bmp.height), encoder._getInternal());
		bmp.dispose();
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
    
    private function get_isRendering() : Bool
    {
        return container3d.doRender;
    }
    
	/**
	 * Stops rendering. The app will stop refreshing the 3d view.
	 */
    public function renderStop() : Void
    {
        container3d.doRender = false;
    }
   
	/**
	 * Resumes rendering
	 */
    public function renderResume() : Void
    {
        container3d.doRender = true;
    }
    
    private function init3dContainer() : Void
    {
        container3d = new EngineContainer3D(displaySprite, sharedStage3D);
        container3d.addEventListener(ViewRenderEvent.BEFORE_RENDER, dispatchEvent);
        container3d.addEventListener(ViewRenderEvent.AFTER_RENDER, dispatchEvent);
    }
    
    override private function registerModelListeners(model : IModel) : Void
    {
        model.addEventListener(Engine3DContainerEvent.ROOT_CONNECT, modelRootConnectHandler);
        model.addEventListener(Engine3DNewProjectEvent.NEW_PROJECT_CREATED, modelNewProjectCreatedHandler);
        model.addEventListener(Engine3DCameraEvent.SET_CAMERA_MODE, dispatchContainer3DEvent);
        model.addEventListener(Engine3DCameraEvent.REMOVE_CAMERA_MODE, dispatchContainer3DEvent);
        model.addEventListener(Engine3DCameraEvent.LOCK_CAMERA, dispatchContainer3DEvent);
        model.addEventListener(Engine3DCameraEvent.UNLOCK_CAMERA, dispatchContainer3DEvent);
    }
    
    override private function unregisterModelListeners(model : IModel) : Void
    {
        model.removeEventListener(Engine3DContainerEvent.ROOT_CONNECT, modelRootConnectHandler);
        model.removeEventListener(Engine3DNewProjectEvent.NEW_PROJECT_CREATED, modelNewProjectCreatedHandler);
        model.removeEventListener(Engine3DCameraEvent.SET_CAMERA_MODE, dispatchContainer3DEvent);
        model.removeEventListener(Engine3DCameraEvent.REMOVE_CAMERA_MODE, dispatchContainer3DEvent);
        model.removeEventListener(Engine3DCameraEvent.LOCK_CAMERA, dispatchContainer3DEvent);
        model.removeEventListener(Engine3DCameraEvent.UNLOCK_CAMERA, dispatchContainer3DEvent);
    }
    
    private function dispatchContainer3DEvent(e : Event) : Void
    {
        container3d.dispatchEvent(e);
    }
    
    private function modelRootConnectHandler(e : Engine3DContainerEvent) : Void
    {
        container3d.modelRootConnect(e.getContainer());
        if (e.getEnviromentXML() != null)
        {
            container3d.setNewEnviroment(e.getEnviromentXML());
        }
    }
    
    private function modelNewProjectCreatedHandler(e : Engine3DNewProjectEvent) : Void
    {
        container3d.setNewProject(e.getProject());
    }
    
    override private function registerControllerListeners(controller : IController) : Void
    {  /**
			 * TODO: Write function
			 */  
        
    }
    override private function unregisterControllerListeners(controller : IController) : Void
    {  /**
			 * TODO: Write function
			 */  
        
    }
    
    override public function destroy() : Void
    {
        if (stage != null)
        {
            deinitStage();
            stage = null;
        }
        else
        {
            display.removeEventListener(Event.ADDED_TO_STAGE, displayAddedToStage);
        }
        container3d.destroy();
        container3d = null;
        super.destroy();
    }
    
    public function getView() : View3D
    {
        return container3d.getView();
    }
    
	/**
	 * An object specifying the current camera
	 */
    private function get_camera() : IAbstractCamera
    {
        return container3d.cameraInterface;
    }
    
    private function get_width() : Float
    {
        return container3d.width;
    }
    private function set_width(value : Float) : Float
    {
        container3d.width = value;
        return value;
    }
    private function get_height() : Float
    {
        return container3d.height;
    }
    private function set_height(value : Float) : Float
    {
        container3d.height = value;
        return value;
    }
    override private function get_x() : Float
    {
        return container3d.x;
    }
    override private function set_x(value : Float) : Float
    {
        container3d.x = value;
        return value;
    }
    override private function get_y() : Float
    {
        return container3d.y;
    }
    override private function set_y(value : Float) : Float
    {
        container3d.y = value;
        return value;
    }
    override private function get_visible() : Bool
    {
        return container3d.visible;
    }
    override private function set_visible(value : Bool) : Bool
    {
        if (container3d.visible == value)
        {
            return value;
        }
        container3d.visible = value;
        if (container3d.visible)
        {
            if (!isRendering)
            {
                renderResume();
            }
        }
        else if (isRendering)
        {
            renderStop();
        }
        return value;
    }
}

