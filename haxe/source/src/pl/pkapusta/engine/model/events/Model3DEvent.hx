package pl.pkapusta.engine.model.events;

import openfl.events.Event;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.Model3DEvent")
class Model3DEvent extends Event
{
    
    public static inline var IS_READY : String = "model3d.isReady";
    public static inline var LOAD_ERROR : String = "model3d.loadError";
    
    public static inline var ADDED_TO_PROJECT : String = "added.to.project";
    public static inline var REMOVED_FROM_PROJECT : String = "removved.from.project";
    
    public function new(type : String, bubbles : Bool = false, cancelable : Bool = false)
    {
        super(type, bubbles, cancelable);
    }
    
    override public function clone() : Event
    {
        return new Model3DEvent(type, bubbles, cancelable);
    }
    
    override public function toString() : String
    {
        return formatToString("Model3DEvent", "type", "bubbles", "cancelable", "eventPhase");
    }
}

