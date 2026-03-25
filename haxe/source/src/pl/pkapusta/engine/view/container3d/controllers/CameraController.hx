package pl.pkapusta.engine.view.container3d.controllers;

import away3d.cameras.Camera3D;
import away3d.cameras.lenses.PerspectiveLens;
import away3d.containers.View3D;
import away3d.lights.PointLight;
import away3d.materials.methods.FilteredShadowMapMethod;
import com.greensock.easing.*;
import com.greensock.TweenLite;
import pl.pkapusta.engine.events.Engine3DCameraEvent;
import pl.pkapusta.engine.model.Model3D;
import pl.pkapusta.engine.view.container3d.controllers.modes.*;
import pl.pkapusta.engine.view.container3d.EngineContainer3D;
import openfl.events.EventDispatcher;
import openfl.events.MouseEvent;
import openfl.geom.Matrix3D;
import openfl.geom.Point;
import openfl.geom.Vector3D;

/**
	 * @author Przemysław Kapusta
	 */
class CameraController extends EventDispatcher
{
    public var cameraInterface(get, never) : IAbstractCamera;

    
    private var view : View3D;
    private var camera : Camera3D;
    
    private var target : Vector3D;
    
    private var baseMode : AbstractCameraMode;
    
    
    private var lastMode : AbstractCameraMode;
    private var currentMode : AbstractCameraMode;
    
    private var memberModes : Map<FastXML, AbstractCameraMode>;
    
    private var engineContainer3D : EngineContainer3D;
    
    public var lastModeParamsOpacity : Float = 0;
    
    public function new(view : View3D, engineContainer3D : EngineContainer3D)
    {
        super();
        this.engineContainer3D = engineContainer3D;
        this.view = view;
        camera = view.camera;
        camera.lens.near = 5;
        camera.lens.far = 100000;
        
        //FilteredShadowMapMethod(
        
        cast((camera.lens), PerspectiveLens).fieldOfView = 43;
        
        target = new Vector3D();
        memberModes = new Map<FastXML, AbstractCameraMode>();
        
        baseMode = new SphereCameraMode(view, engineContainer3D);
        baseMode.target.y = 30;
        currentMode = baseMode;
        currentMode.enabled = true;
        
        addEventListener(Engine3DCameraEvent.SET_CAMERA_MODE, setCameraEventHandler);
        addEventListener(Engine3DCameraEvent.REMOVE_CAMERA_MODE, removeCameraEventHandler);
        addEventListener(Engine3DCameraEvent.LOCK_CAMERA, lockCameraEventHandler);
        addEventListener(Engine3DCameraEvent.UNLOCK_CAMERA, unlockCameraEventHandler);
    }
    
    public function setNewEnviroment(enviromentXML : FastXML) : Void
    {
        
        if (enviromentXML.hasNode.lens)
        {
            var lens : FastXML = enviromentXML.node.lens;
            if (lens.has.near)
            {
                camera.lens.near = as3hx.Compat.parseInt(lens.att.near);
            }
            if (lens.has.far)
            {
                camera.lens.far = as3hx.Compat.parseInt(lens.att.far);
            }
            if (lens.has.fov)
            {
                cast((camera.lens), PerspectiveLens).fieldOfView = as3hx.Compat.parseInt(lens.att.fov);
            }
        }
    }
    
    public function getCurrenrCameraMode() : AbstractCameraMode
    {
        return currentMode;
    }
    
    private function lockCameraEventHandler(e : Engine3DCameraEvent) : Void
    {
        currentMode.locked = true;
    }
    
    private function unlockCameraEventHandler(e : Engine3DCameraEvent) : Void
    {
        currentMode.locked = false;
    }
    
    private function setCameraEventHandler(e : Engine3DCameraEvent) : Void
    {
        var mode : AbstractCameraMode;
        var model : Model3D = try cast(e.getModel(), Model3D) catch(e:Dynamic) null;
        if (model == null)
        {
            return;
        }  //straszny problem ;)  
        
        var settings : FastXML = model.getCameraSettingsXML();
        var relativeMatrix : Matrix3D = model.getContainer().contextContainer.sceneTransform;
        
        if (memberModes.exists(settings))
        {
            mode = memberModes.get(settings);
        }
        else
        {
            mode = AbstractCameraMode.factory(view, engineContainer3D, settings, relativeMatrix, e.getModel());
            if (mode.rememberUsage)
            {
                memberModes.set(settings, mode);
            }
        }
        switchMode(mode);
    }
    
    private function removeCameraEventHandler(e : Engine3DCameraEvent) : Void
    {
        switchMode(baseMode);
    }
    
    private function switchMode(mode : AbstractCameraMode) : Void
    {
        if (mode == currentMode)
        {
            return;
        }
        currentMode.enabled = false;
        lastMode = currentMode;
        currentMode = mode;
        currentMode.enabled = true;
        
        lastModeParamsOpacity = 1;
        TweenLite.to(this, 1, {
                    lastModeParamsOpacity : 0,
                    ease : Sine.easeInOut
                });
    }
    
    public function update() : Void
    {
        currentMode.update();
        if (lastModeParamsOpacity == 0)
        {
            target.x = currentMode.target.x;
            target.y = currentMode.target.y;
            target.z = currentMode.target.z;
            camera.x = currentMode.position.x;
            camera.y = currentMode.position.y;
            camera.z = currentMode.position.z;
        }
        else
        {
            target.x = currentMode.target.x * (1 - lastModeParamsOpacity) + lastMode.target.x * lastModeParamsOpacity;
            target.y = currentMode.target.y * (1 - lastModeParamsOpacity) + lastMode.target.y * lastModeParamsOpacity;
            target.z = currentMode.target.z * (1 - lastModeParamsOpacity) + lastMode.target.z * lastModeParamsOpacity;
            camera.x = currentMode.position.x * (1 - lastModeParamsOpacity) + lastMode.position.x * lastModeParamsOpacity;
            camera.y = currentMode.position.y * (1 - lastModeParamsOpacity) + lastMode.position.y * lastModeParamsOpacity;
            camera.z = currentMode.position.z * (1 - lastModeParamsOpacity) + lastMode.position.z * lastModeParamsOpacity;
        }
        camera.lookAt(target);
    }
    
    private function get_cameraInterface() : IAbstractCamera
    {
        return currentMode.externalInterface;
    }
}

