package pl.pkapusta.engine.model.regions.event;

import pl.pkapusta.engine.model.regions.IRegion;
import openfl.events.Event;

/**
	 * @author Przemysław Kapusta
	 */
class RegionLimitEvent extends Event
{
    public var limitType(get, never) : String;
    public var limitValue(get, never) : Dynamic;
    public var region(get, never) : IRegion;

    
    public static inline var CHANGE : String = "region.limit.change";
    public static inline var INIT : String = "region.limit.init";
    
    private var _limitType : String;
    private var _limitValue : Dynamic;
    private var _region : IRegion;
    
    public function new(type : String, limitType : String, limitValue : Dynamic, region : IRegion, bubbles : Bool = false, cancelable : Bool = false)
    {
        super(type, bubbles, cancelable);
        _limitType = limitType;
        _limitValue = limitValue;
        _region = region;
    }
    
    override public function clone() : Event
    {
        return new RegionLimitEvent(type, _limitType, _limitValue, _region, bubbles, cancelable);
    }
    
    override public function toString() : String
    {
        return formatToString("RegionLimitEvent", "type", "bubbles", "cancelable", "eventPhase");
    }
    
    private function get_limitType() : String
    {
        return _limitType;
    }
    
    private function get_limitValue() : Dynamic
    {
        return _limitValue;
    }
    
    private function get_region() : IRegion
    {
        return _region;
    }
}

