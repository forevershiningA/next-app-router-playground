package pl.pkapusta.engine.model.executors.file.events;

import openfl.events.Event;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.model.executors.file.events.RegionPositionEvent")
class RegionPositionEvent extends Event
{
    public var value(get, never) : Dynamic;

    
    public static inline var UPDATE_ROTATION : String = "update.rotation";
    public static inline var UPDATE_ROTATION_BY_INCREASE : String = "update.rotation.by.increase";
    
    private var _value : Dynamic;
    
    public function new(type : String, value : Dynamic, bubbles : Bool = false, cancelable : Bool = false)
    {
        super(type, bubbles, cancelable);
        _value = value;
    }
    
    override public function clone() : Event
    {
        return new RegionPositionEvent(type, _value, bubbles, cancelable);
    }
    
    override public function toString() : String
    {
        return formatToString("RegionPositionEvent", "type", "bubbles", "cancelable", "eventPhase");
    }
    
    private function get_value() : Dynamic
    {
        return _value;
    }
}

