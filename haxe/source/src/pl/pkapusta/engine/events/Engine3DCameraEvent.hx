package pl.pkapusta.engine.events;

import pl.pkapusta.engine.model.IModel3D;
import openfl.events.Event;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.Engine3DCameraEvent")
class Engine3DCameraEvent extends Event
{   
    public static inline var SET_CAMERA_MODE : String = "set.camera.mode";
    public static inline var REMOVE_CAMERA_MODE : String = "remove.camera.mode";
    
    public static inline var LOCK_CAMERA : String = "lock.camera";
    public static inline var UNLOCK_CAMERA : String = "unlock.camera";
    
    private var _model : IModel3D;
    
    public function new(type : String, model : IModel3D = null, bubbles : Bool = false, cancelable : Bool = false)
    {
        super(type, bubbles, cancelable);
        _model = model;
    }
    
    override public function clone() : Event
    {
        return new Engine3DCameraEvent(type, _model, bubbles, cancelable);
    }
    
    override public function toString() : String
    {
        return formatToString("Engine3DCameraEvent", "type", "bubbles", "cancelable", "eventPhase");
    }
    
    public function getModel() : IModel3D
    {
        return _model;
    }
}

