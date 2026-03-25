package pl.pkapusta.engine.view.container3d.controllers.modes;

import away3d.containers.View3D;
import pl.pkapusta.engine.common.exteption.predefined.AbstractMethodException;
import pl.pkapusta.engine.model.IModel3D;
import pl.pkapusta.engine.view.container3d.controllers.modes.AutoZoomSphereCameraMode;
import pl.pkapusta.engine.view.container3d.controllers.modes.CameraMode;
import pl.pkapusta.engine.view.container3d.controllers.modes.SphereCameraMode;
import pl.pkapusta.engine.view.container3d.EngineContainer3D;
import openfl.geom.Matrix3D;
import openfl.geom.Vector3D;

/**
	 * @author Przemysław Kapusta
	 */
class AbstractCameraMode
{
    public var target(get, never) : Vector3D;
    public var position(get, never) : Vector3D;
    public var enabled(get, set) : Bool;
    public var rememberUsage(get, never) : Bool;
    public var externalInterface(get, never) : IAbstractCamera;
    public var mode(get, never) : String;

    
    public static function factory(view : View3D, engineContainer : EngineContainer3D, data : FastXML = null, relativeMatrix : Matrix3D = null, model : IModel3D = null) : AbstractCameraMode
    {
        var mode : String = data.att.mode;
        switch (mode)
        {
            case CameraMode.SPHERE:return new SphereCameraMode(view, engineContainer, data, relativeMatrix);
            case CameraMode.AUTO_ZOOM_SPHERE:return new AutoZoomSphereCameraMode(view, engineContainer, data, relativeMatrix, model);
        }
        return null;
    }
    
    private var _target : Vector3D;
    private var _position : Vector3D;
    
    private var _interface : AbstractCameraInterface;
    private var _mode : String;
    
    private var _enabled : Bool = false;
    
    private var _rememberUsage : Bool = false;
    
    private var engineContainer : EngineContainer3D;
    
    private var view : View3D;
    private var relativeMatrix : Matrix3D;
    
    public var locked : Bool = false;
    
    public function new(view : View3D, engineContainer : EngineContainer3D, settings : FastXML = null, relativeMatrix : Matrix3D = null)
    {
        this.engineContainer = engineContainer;
        this.view = view;
        this.relativeMatrix = relativeMatrix;
        _target = new Vector3D();
        _position = new Vector3D();
        if (settings != null)
        {
            parseSettingsXML(settings);
        }
    }
    
    public function setSettings(data : FastXML) : Void
    {
        parseSettingsXML(data);
    }
    
    private function parseSettingsXML(data : FastXML) : Void
    {
        if (data.has.resolve("remember-usage")) {
            _rememberUsage = ((data.att.resolve("remember-usage").toLowerCase() == "true")) ? true : false;
        }
    }
    
    /** @abstract */
    private function enable() : Void
    {
        throw new AbstractMethodException();
    }
    
    /** @abstract */
    private function disable() : Void
    {
        throw new AbstractMethodException();
    }
    
    /** @abstract */
    public function update() : Void
    {
        throw new AbstractMethodException();
    }
    
    private function get_target() : Vector3D
    {
        return _target;
    }
    
    private function get_position() : Vector3D
    {
        return _position;
    }
    
    private function get_enabled() : Bool
    {
        return _enabled;
    }
    
    private function set_enabled(value : Bool) : Bool
    {
        if (_enabled == value)
        {
            return value;
        }
        _enabled = value;
        if (_enabled)
        {
            enable();
        }
        else
        {
            disable();
        }
        return value;
    }
    
    private function get_rememberUsage() : Bool
    {
        return _rememberUsage;
    }
    
    private function get_externalInterface() : IAbstractCamera
    {
        return _interface;
    }
    
    private function get_mode() : String
    {
        return _mode;
    }
    
    public function dispose() : Void
    {  /**
			 * TODO: Napisać usuwanie obiektu z pamięci
			 */  
        
    }
}

