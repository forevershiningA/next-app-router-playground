package pl.pkapusta.engine.model.regions.position.events;

import openfl.events.Event;

/**
	 * @author Przemysław Kapusta
	 */
class RegionInnerPositionEvent extends Event
{
    public var value(get, never) : Dynamic;

    
    public static inline var CHANGE_INNER_X : String = "change.inner.x";
    public static inline var CHANGE_INNER_Y : String = "change.inner.y";
    public static inline var CHANGE_INNER_ROTATION : String = "change.inner.rotation";
    
    private var _value : Dynamic;
    
    public function new(type : String, value : Dynamic, bubbles : Bool = false, cancelable : Bool = false)
    {
        super(type, bubbles, cancelable);
        _value = value;
    }
    
    override public function clone() : Event
    {
        return new RegionInnerPositionEvent(type, _value, bubbles, cancelable);
    }
    
    override public function toString() : String
    {
        return formatToString("RegionInnerPositionEvent", "type", "bubbles", "cancelable", "eventPhase");
    }
    
    private function get_value() : Dynamic
    {
        return _value;
    }
}

