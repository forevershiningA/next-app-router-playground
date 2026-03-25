package pl.pkapusta.engine.model.events;

import openfl.events.Event;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.Model3DPropertyEvent")
class Model3DPropertyEvent extends Event
{
    
    public static inline var CHANGE : String = "property.change";
    
    private var _id : String;
    private var _value : Dynamic;
    
    public function new(type : String, id : String, value : Dynamic, bubbles : Bool = false, cancelable : Bool = false)
    {
        super(type, bubbles, cancelable);
        _id = id;
        _value = value;
    }
    
    override public function clone() : Event
    {
        return new Model3DPropertyEvent(type, _id, _value, bubbles, cancelable);
    }
    
    override public function toString() : String
    {
        return formatToString("Model3DPropertyEvent", "type", "bubbles", "cancelable", "eventPhase");
    }
    
    private function getPropertyValue() : Dynamic
    {
        return _value;
    }
    
    private function getPropertyId() : String
    {
        return _id;
    }
}

